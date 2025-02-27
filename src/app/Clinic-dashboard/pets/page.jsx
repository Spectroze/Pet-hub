'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Edit, Trash2, PlusCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import Image from 'next/image'

export default function Pets() {
  const [petRecords, setPetRecords] = useState([
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Labrador",
      age: 5,
  
      lastCheckup: new Date(2023, 5, 15),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 2,
      name: "Whiskers",
      species: "Cat",
      breed: "Siamese",
      age: 3,
 
      lastCheckup: new Date(2023, 5, 20),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 3,
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 7,
    
      lastCheckup: new Date(2023, 5, 25),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 4,
      name: "Nemo",
      species: "Fish",
      breed: "Clownfish",
      age: 1,
  
      lastCheckup: new Date(2023, 6, 1),
      photo: "https://placekitten.com/200/300",
    },
    {
      id: 5,
      name: "Tweety",
      species: "Bird",
      breed: "Canary",
      age: 2,
      
      lastCheckup: new Date(2023, 6, 5),
      photo: "https://placekitten.com/200/300",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const handleEdit = (id) => {
    toast.success(`Editing pet record with ID: ${id}`)
  }

  const handleDelete = (id) => {
    setPetRecords((prevRecords) =>
      prevRecords.filter((record) => record.id !== id)
    )
    toast.success("Pet record deleted successfully!")
  }

  const filteredRecords = petRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.breed.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-[#FF6B6B]  ">
          <PlusCircle className="h-8 w-8 text-[#FF6B6B]" />
          Pet Records
        </h2>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="h-5 w-5 text-white" />
          <Input
            placeholder="Search pet records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-gray-800 border-gray-700 focus:border-primary focus:ring-primary text-white"
          />
        </div>
      </div>
      <div className="rounded-md border border-gray-700 overflow-hidden bg-gray-800 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-900">
              <TableHead className="w-[150px] text-white">Photo</TableHead>
              <TableHead className="w-[150px] text-white">Pet Name</TableHead>
              <TableHead className="text-white">Species</TableHead>
              <TableHead className="text-white">Age</TableHead>
           
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow
                key={record.id}
                className="hover:bg-gray-700 transition-colors"
              >
                <TableCell>
                  <Image
                    src={record.photo}
                    alt={record.name}
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </TableCell>
                <TableCell className="font-medium text-primary">
                  {record.name}
                </TableCell>
                <TableCell className="text-gray-300">{record.species}</TableCell>
                <TableCell className="text-gray-300">{record.age} years</TableCell>
             
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record.id)}
                      className="flex items-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-primary bg-gray-800 rounded-lg shadow-inner">
          <PlusCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">No pet records found.</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or add a new pet record.
          </p>
        </div>
      )}
    </div>
  )
}