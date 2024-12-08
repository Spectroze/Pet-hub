"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the structure of our user login data
// Changed 'status' to 'role'
const initialUserLogins = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    loginTime: "2023-05-10 14:30",
    role: "user",
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane@example.com",
    loginTime: "2023-05-10 15:45",
    role: "user",
  },
  {
    id: "3",
    username: "bob_johnson",
    email: "bob@example.com",
    loginTime: "2023-05-10 16:20",
    role: "user",
  },
];

export default function Acceptaccount() {
  const [userLogins, setUserLogins] = useState(initialUserLogins);

  // Handle role change for users
  const handleMakeAdmin = (id) => {
    setUserLogins((prevLogins) =>
      prevLogins.map((login) =>
        login.id === id ? { ...login, role: "admin" } : login
      )
    );
  };

  const handleMakeUser = (id) => {
    setUserLogins((prevLogins) =>
      prevLogins.map((login) =>
        login.id === id ? { ...login, role: "user" } : login
      )
    );
  };

  return (
    <div className="container mx-auto py-10 bg-[#1C1C1C] min-h-screen">
      <Card className="bg-[#2C2C2C] border-[#3D3D3D] border rounded-lg p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#FFA07A]">
            User Login Feature Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#FFA07A]">Username</TableHead>
                <TableHead className="text-[#FFA07A]">Email</TableHead>
                <TableHead className="text-[#FFA07A]">Login Time</TableHead>
                <TableHead className="text-[#FFA07A]">Role</TableHead>
                <TableHead className="text-[#FFA07A]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLogins.map((login) => (
                <TableRow key={login.id} className="border-b border-[#3D3D3D]">
                  <TableCell className="text-[#FFA07A]">
                    {login.username}
                  </TableCell>
                  <TableCell className="text-[#FFA07A]">
                    {login.email}
                  </TableCell>
                  <TableCell className="text-[#FFA07A]">
                    {login.loginTime}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`capitalize ${
                        login.role === "admin"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {login.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {login.role === "user" && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleMakeAdmin(login.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center bg-[#3D3D3D] text-[#FFA07A] hover:bg-[#4D4D4D] hover:text-[#FF8C00]"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> Make Admin
                        </Button>
                        <Button
                          onClick={() => handleMakeUser(login.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center bg-[#3D3D3D] text-[#FFA07A] hover:bg-[#4D4D4D] hover:text-[#FF8C00]"
                        >
                          <XCircle className="mr-1 h-4 w-4" /> Make User
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
