'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, PawPrint } from "lucide-react"

const owners = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    pets: ["Max", "Buddy"],
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "234-567-8901",
    pets: ["Bella", "Luna"],
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "345-678-9012",
    pets: ["Charlie"],
    avatar: "https://i.pravatar.cc/150?img=3",
  },
]

export default function Owners() {
  return (
    <Card className="bg-gray-900 text-gray-100 shadow-lg border-gray-800">
      <CardHeader className="border-b border-gray-800 pb-4">
        <CardTitle className="text-2xl font-bold text-[#FF6B6B] flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-[#FF6B6B]" />
          Owner Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="rounded-lg border border-gray-700 overflow-hidden shadow-md bg-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 hover:bg-gray-800">
                <TableHead className="text-primary font-semibold">Owner</TableHead>
                <TableHead className="text-primary font-semibold">Contact</TableHead>
                <TableHead className="text-primary font-semibold">Pets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id} className="hover:bg-gray-700 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                        <AvatarFallback>{owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-primary">{owner.name}</p>
                        <p className="text-sm text-gray-400">ID: {owner.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                        {owner.email}
                      </p>
                      <p className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-[#FF6B6B]" />
                        {owner.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {owner.pets.map((pet, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          {pet}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}