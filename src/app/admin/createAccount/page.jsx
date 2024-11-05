"use client";
import { useState, useEffect } from "react";
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
import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
} from "@/lib/appwrite";

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function AccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Pet Training");
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);

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
    const accountData = { name, email, phone, role };

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.$id, accountData);
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.$id === editingAccount.$id ? { ...acc, ...accountData } : acc
          )
        );
        setIsEditOpen(false);
      } else {
        // Pass both email and password when creating the account
        const newAccount = await createAccount(email, password, accountData);
        setAccounts((prev) => [...prev, newAccount]);
        setIsOpen(false);
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
    } catch (error) {
      console.error("Error deleting account:", error.message);
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
    <div className="container mx-auto p-4">
      {/* Add Account Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add Account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Number</Label>{" "}
              <Input
                id="phone" // Updated ID
                value={phone} // Updated field name
                onChange={(e) => setPhone(e.target.value)} // Updated change handler
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <RadioGroup value={role} onValueChange={setRole}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pet-training" id="pet-training" />
                <Label htmlFor="pet-training">Pet Training</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pet-boarding" id="pet-boarding" />
                <Label htmlFor="pet-boarding">Pet Boarding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clinic" id="clinic" />
                <Label htmlFor="clinic">Clinic</Label>
              </div>
            </RadioGroup>

            <Button
              type="submit"
              disabled={!isValidEmail(email) || password.length < 8}
            >
              Create Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Contact Number</Label>{" "}
              <Input
                id="edit-phone" // Updated ID
                value={phone} // Updated field name
                onChange={(e) => setPhone(e.target.value)} // Updated change handler
                required
              />
            </div>
            <RadioGroup value={role} onValueChange={setRole}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pet Training" id="edit-pet-training" />
                <Label htmlFor="edit-pet-training">Pet Training</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pet Boarding" id="edit-pet-boarding" />
                <Label htmlFor="edit-pet-boarding">Pet Boarding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Clinic" id="edit-clinic" />
                <Label htmlFor="edit-clinic">Clinic</Label>
              </div>
            </RadioGroup>

            <Button type="submit" disabled={!isValidEmail(email)}>
              Update Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Table */}
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccounts.map((account) => (
            <TableRow key={account.$id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{account.email}</TableCell>
              <TableCell>{account.phone}</TableCell> {/* Updated field */}
              <TableCell>{account.role}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(account)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(account)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
