"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
  signIn,
  disableAccount,
  enableAccount,
} from "@/lib/appwrite";
import { Toaster } from "react-hot-toast";

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function CreateAccountForm() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(["Pet Training"]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [statusAccount, setStatusAccount] = useState(null);
  const [action, setAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);

  const handleStatusChange = (account) => {
    setStatusAccount(account);
    if (account.status === "active") {
      setAction("disable");
    } else {
      setAction("undisable");
    }
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (statusAccount) {
      await handleDisableEnable(statusAccount);
      setIsStatusModalOpen(false);
    }
  };

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const fetchedAccounts = await listAccounts();
      setAccounts(fetchedAccounts);
      setFilteredAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error.message);
      toast.error("Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const filtered = accounts.filter((account) => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = account.name.toLowerCase().includes(searchTermLower);
      const emailMatch = account.email.toLowerCase().includes(searchTermLower);

      // Special handling for role-based filtering
      const accountRoles = account.role.toLowerCase().split(", ");

      // If searching for specific roles, filter out accounts with "user" role
      const specialRoles = ["clinic", "pet-boarding", "pet training", "user"];
      if (specialRoles.includes(searchTermLower)) {
        return (
          accountRoles.includes(searchTermLower) &&
          !accountRoles.includes("user")
        );
      }

      // For other searches, use normal filtering
      return (
        nameMatch ||
        emailMatch ||
        accountRoles.some((role) => role.includes(searchTermLower))
      );
    });
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accountData = {
      name,
      email,
      phone,
      role: role.join(", "),
      status: "active",
    };

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.$id, accountData);
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.$id === editingAccount.$id ? { ...acc, ...accountData } : acc
          )
        );
        setIsEditOpen(false);
        toast.success("Account updated successfully!");
      } else {
        const newAccount = await createAccount(email, password, accountData);
        setAccounts((prev) => [...prev, newAccount]);
        setIsOpen(false);
        toast.success("Account created successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving account:", error.message);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setName(account.name);
    setEmail(account.email);
    setPhone(account.phone);
    setRole(account.role.split(", "));
    setIsEditOpen(true);
  };

  const handleDelete = (account) => {
    setDeletingAccount(account);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAccount(deletingAccount.$id);
      setAccounts((prev) =>
        prev.filter((acc) => acc.$id !== deletingAccount.$id)
      );
      setIsDeleteOpen(false);
      toast.success("Account deleted successfully!");
    } catch (error) {
      console.error("Error deleting account:", error.message);
    }
  };

  const handleDisableEnable = async (account) => {
    try {
      if (account.status.includes("active")) {
        await disableAccount(account.$id);
        toast.success("Account disabled successfully!");
      } else {
        await enableAccount(account.$id);
        toast.success("Account enabled successfully!");
      }
      const updatedAccounts = await listAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error updating account status:", error.message);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole(["Pet Training"]);
    setEditingAccount(null);
  };

  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(
    indexOfFirstAccount,
    indexOfLastAccount
  );
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Update the roleOptions array to include clinic services
  const roleOptions = [
    "Pet Training",
    "pet-boarding",
    "Clinic 1",
    "Clinic 2",
    "Clinic 3",
    "Clinic 4",
    "Clinic 5",
    "Clinic 6",
    "Clinic 7",
    "Clinic 8",
    "Clinic 9",
    "Clinic 10",
    "user",
  ];

  return (
    <div className="container mx-auto px-4">
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-xl font-bold">Account Manager</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Search and Add Account Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:bg-gray-800">
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-lg font-semibold dark:text-white">
                    Create New Account
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm dark:text-gray-300"
                    >
                      Account Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm dark:text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm dark:text-gray-300"
                    >
                      Contact Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm dark:text-gray-300"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm dark:text-gray-300">Role</Label>
                    <div className="max-h-40 overflow-y-auto space-y-1 mt-1">
                      {roleOptions.map((roleOption) => (
                        <div
                          key={roleOption}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`role-${roleOption
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            checked={role.includes(roleOption)}
                            onCheckedChange={(checked) => {
                              setRole(
                                checked
                                  ? [...role, roleOption]
                                  : role.filter((r) => r !== roleOption)
                              );
                            }}
                            className="h-3 w-3"
                          />
                          <Label
                            htmlFor={`role-${roleOption
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            className="text-xs dark:text-gray-300"
                          >
                            {roleOption}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!isValidEmail(email) || password.length < 8}
                    className="w-full h-8 text-sm"
                  >
                    Create Account
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Account List Section */}
          <Card className="mt-4">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg font-semibold">
                Account List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading accounts...</p>
                </div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAccounts.map((account) => (
                          <TableRow key={account.$id}>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>{account.email}</TableCell>
                            <TableCell>{account.phone}</TableCell>
                            <TableCell>{account.role}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  account.status === "active"
                                    ? "bg-green-500 text-white"
                                    : "bg-green-500 text-white"
                                }`}
                              >
                                {account.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(account)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(account)}
                                >
                                  {account.status === "active" ? (
                                    <PowerOff className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="block sm:hidden">
                    {currentAccounts.map((account) => (
                      <div
                        key={account.$id}
                        className="border-b p-4 space-y-3 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium">{account.name}</h3>
                            <p className="text-sm text-gray-600">
                              {account.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              {account.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              {account.role}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white`}
                          >
                            {account.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account)}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(account)}
                            className="flex-1"
                          >
                            {account.status === "active" ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 p-4 border-t">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[300px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:bg-gray-800 z-50">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-semibold dark:text-white">
              Edit Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="edit-name" className="text-sm dark:text-gray-300">
                Account Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-email"
                className="text-sm dark:text-gray-300"
              >
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-phone"
                className="text-sm dark:text-gray-300"
              >
                Contact Number
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-8 text-sm dark:bg-gray-700 dark:text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-sm dark:text-gray-300">Role</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {roleOptions.map((roleOption) => (
                  <div key={roleOption} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-role-${roleOption
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      checked={role.includes(roleOption)}
                      onCheckedChange={(checked) => {
                        setRole(
                          checked
                            ? [...role, roleOption]
                            : role.filter((r) => r !== roleOption)
                        );
                      }}
                      className="h-3 w-3"
                    />
                    <Label
                      htmlFor={`edit-role-${roleOption
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      className="text-xs dark:text-gray-300"
                    >
                      {roleOption}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              disabled={!isValidEmail(email)}
              className="w-full h-8 text-sm"
            >
              Update Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Are you sure you want to delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable/Enable Confirmation Modal */}
      <AlertDialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <AlertDialogContent className="dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Are you sure you want to {action} this account?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              This action can be reverted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStatusModalOpen(false)}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
