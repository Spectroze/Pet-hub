"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
  signIn,
  disableAccount,
  enableAccount,
} from "@/lib/appwrite";

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function CreateAccountForm() {
  const [accounts, setAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Pet Training");
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [statusAccount, setStatusAccount] = useState(null);
  const [action, setAction] = useState(""); // New state to store the intended action ("disable" or "undisable")

  const handleStatusChange = (account) => {
    setStatusAccount(account);
    if (account.status === "active") {
      setAction("disable"); // Set action to "disable" if the account is currently active
    } else {
      setAction("undisable"); // Set action to "undisable" if the account is currently disabled
    }
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (statusAccount) {
      await handleDisableEnable(statusAccount);
      setIsStatusModalOpen(false);
    }
  };
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await listAccounts();
        setAccounts(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error.message);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accountData = { name, email, phone, role, status: "active" };

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
    setRole(account.role);
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

  const handleLogin = async (email, password) => {
    try {
      const user = await signIn(email, password);
      if (user.status.includes("disabled")) {
        console.error("This account is disabled and cannot log in.");
        return;
      }
      console.log("Login successful", user);
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("Pet Training");
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter(
    (account) => account.role !== "user"
  );

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">
            Account Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Create New Account
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="dark:text-gray-300">
                    Account Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="dark:text-gray-300">
                    Contact Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Role</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={setRole}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pet Training" id="pet-training" />
                      <Label
                        htmlFor="pet-training"
                        className="dark:text-gray-300"
                      >
                        Pet Training
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pet Boarding" id="pet-boarding" />
                      <Label
                        htmlFor="pet-boarding"
                        className="dark:text-gray-300"
                      >
                        Pet Boarding
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Clinic" id="clinic" />
                      <Label htmlFor="clinic" className="dark:text-gray-300">
                        Clinic
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  type="submit"
                  disabled={!isValidEmail(email) || password.length < 8}
                  className="w-full"
                >
                  Create Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold dark:text-white">
            Account List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="dark:text-gray-300">Name</TableHead>
                  <TableHead className="dark:text-gray-300">Email</TableHead>
                  <TableHead className="dark:text-gray-300">
                    Contact Number
                  </TableHead>
                  <TableHead className="dark:text-gray-300">Role</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.$id}>
                    <TableCell className="dark:text-white">
                      {account.name}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      {account.email}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      {account.phone}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      {account.role}
                    </TableCell>
                    <TableCell className="dark:text-white">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          account.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {account.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(account)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={
                            account.status === "active"
                              ? "destructive"
                              : "default"
                          }
                          size="icon"
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
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="dark:text-gray-300">
                Account Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="dark:text-gray-300">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone" className="dark:text-gray-300">
                Contact Number
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300">Role</Label>
              <RadioGroup value={role} onValueChange={setRole} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pet Training" id="edit-pet-training" />
                  <Label
                    htmlFor="edit-pet-training"
                    className="dark:text-gray-300"
                  >
                    Pet Training
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pet Boarding" id="edit-pet-boarding" />
                  <Label
                    htmlFor="edit-pet-boarding"
                    className="dark:text-gray-300"
                  >
                    Pet Boarding
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Clinic" id="edit-clinic" />
                  <Label htmlFor="edit-clinic" className="dark:text-gray-300">
                    Clinic
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              type="submit"
              disabled={!isValidEmail(email)}
              className="w-full"
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

      {/* Disable/Enable Confirmatio n Modal */}
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
