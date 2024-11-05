"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Mock data for pet profiles
const initialPets = [
  {
    id: 1,
    name: "Buddy",
    age: 5,
    breed: "Golden Retriever",
    gender: "Male",
    owner: "John Doe",
    contact: "123-456-7890",
    emergencyVet: "Dr. Smith",
    vaccinations: [
      { name: "Rabies", date: "2023-01-15" },
      { name: "DHPP", date: "2023-02-20" },
    ],
    notes: "Friendly and energetic. Loves to play fetch.",
    visits: [
      {
        date: "2023-03-10",
        reason: "Annual checkup",
        notes: "All clear, slight tartar buildup",
      },
      {
        date: "2023-04-15",
        reason: "Grooming",
        notes: "Nails trimmed, coat brushed",
      },
    ],
  },
  // Add more pet profiles as needed
];

export default function PetRecords() {
  const [pets, setPets] = useState(initialPets);
  const [selectedPet, setSelectedPet] = useState(null);
  const [newNote, setNewNote] = useState("");

  const handleSelectPet = (pet) => {
    setSelectedPet(pet);
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedPet) {
      const updatedPets = pets.map((pet) => {
        if (pet.id === selectedPet.id) {
          return {
            ...pet,
            notes: pet.notes + "\n" + newNote,
          };
        }
        return pet;
      });
      setPets(updatedPets);
      setSelectedPet({
        ...selectedPet,
        notes: selectedPet.notes + "\n" + newNote,
      });
      setNewNote("");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pet Profiles</CardTitle>
          <CardDescription>Select a pet to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pets.map((pet) => (
              <li key={pet.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSelectPet(pet)}
                >
                  {pet.name} - {pet.breed}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPet.name}'s Profile</CardTitle>
            <CardDescription>
              {selectedPet.breed}, {selectedPet.age} years old
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="space-y-2">
                  <p>
                    <strong>Gender:</strong> {selectedPet.gender}
                  </p>
                  <p>
                    <strong>Owner:</strong> {selectedPet.owner}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedPet.contact}
                  </p>
                  <p>
                    <strong>Emergency Vet:</strong> {selectedPet.emergencyVet}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="medical">
                <div className="space-y-2">
                  <h4 className="font-semibold">Vaccinations</h4>
                  <ul className="list-disc list-inside">
                    {selectedPet.vaccinations.map((vacc, index) => (
                      <li key={index}>
                        {vacc.name} - {vacc.date}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="visits">
                <div className="space-y-2">
                  {selectedPet.visits.map((visit, index) => (
                    <div key={index} className="border-b pb-2">
                      <p>
                        <strong>{visit.date}:</strong> {visit.reason}
                      </p>
                      <p>{visit.notes}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Label htmlFor="notes" className="mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={selectedPet.notes}
              readOnly
              className="w-full mb-2"
            />
            <div className="flex w-full space-x-2">
              <Input
                placeholder="Add a new note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
