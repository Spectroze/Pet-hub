import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PawPrint } from "lucide-react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  uploadFileAndGetUrl,
  savePetToDatabase,
  getCurrentUser,
} from "../../lib/appwrite";

const servicePayments = {
  "Pet Grooming": 500,
  "Pet Veterinary": 700,
  "Pet Boarding": 1000,
  "Pet Training": 1200,
};

export default function AddPetModal({
  showAddPetModal,
  setShowAddPetModal,
  handleAddPet,
}) {
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petType, setPetType] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petServices, setPetServices] = useState([]); // Store services as an array
  const [petDate, setPetDate] = useState([]); // Store dates as an array
  const [petTime, setPetTime] = useState([]); // Store times as an array
  const [petClinic, setPetClinic] = useState([]); // Store clinics as an array
  const [petRoom, setPetRoom] = useState([]); // Store rooms as an array
  const [petPayment, setPetPayment] = useState(0);
  const [petPhoto, setPetPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleArrayChange = (setter, value) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const calculateTotalPayment = (services) => {
    return services.reduce(
      (total, service) => total + servicePayments[service],
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      const ownerId = currentUser.$id;

      let petPhotoId = "/placeholder.svg"; // Default placeholder if no photo
      if (petPhoto) {
        petPhotoId = await uploadFileAndGetUrl(petPhoto); // Upload and get the file ID or URL
      }

      const newPet = {
        ownerId,
        petName,
        petAge,
        petType,
        petSpecies,
        petServices,
        petDate,
        petTime,
        petClinic,
        petRoom,
        petPayment,
        petPhotoId, // Add petPhotoId to the object being saved
      };

      // Save the pet data to the database
      await savePetToDatabase(newPet);
      handleAddPet(newPet);
      toast.success(`Pet ${petName} added successfully!`);
      setShowAddPetModal(false);
    } catch (error) {
      console.error("Add pet error:", error);
      toast.error("An error occurred while saving the pet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAddPetModal} onOpenChange={setShowAddPetModal}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-blue-100 to-green-100 grid grid-cols-2 gap-4 p-6">
        <DialogHeader className="col-span-2">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <PawPrint className="w-6 h-6" />
            <span>Add New Pet</span>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="col-span-2 grid grid-cols-2 gap-6"
        >
          {/* Left Side */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="petName">Pet Name</Label>
              <Input
                id="petName"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                placeholder="Enter your pet's name"
              />
            </div>
            <div>
              <Label htmlFor="petAge">Pet Age</Label>
              <Input
                id="petAge"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                required
                placeholder="Enter your pet's age"
              />
            </div>
            <div>
              <Label htmlFor="petType">Pet Type</Label>
              <Select onValueChange={setPetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type of pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="petSpecies">Pet Species</Label>
              <Input
                id="petSpecies"
                value={petSpecies}
                onChange={(e) => setPetSpecies(e.target.value)}
                required
                placeholder="Enter your pet's species"
              />
            </div>
            <div>
              <Label htmlFor="petServices">Pet Services</Label>
              <Select
                multiple // Enables multiple selection
                onValueChange={(value) => {
                  handleArrayChange(setPetServices, value);
                  setPetPayment(calculateTotalPayment([...petServices, value]));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select services for your pet" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(servicePayments).map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {petServices.length > 0 && (
                <div className="mt-2">
                  <Label>Payment Amount:</Label>
                  <div className="font-semibold">
                    {petServices
                      .map((service) => `${servicePayments[service]} PHP`)
                      .join(", ")}
                  </div>
                  <div>Total: {petPayment} PHP</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="petDate">Pet Date</Label>
              <Input
                id="petDate"
                type="date"
                onChange={(e) => handleArrayChange(setPetDate, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="petTime">Pet Time</Label>
              <Input
                id="petTime"
                type="time"
                onChange={(e) => handleArrayChange(setPetTime, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="petClinic">Pet Clinic</Label>
              <Select
                multiple // Enables multiple selection
                onValueChange={(value) =>
                  handleArrayChange(setPetClinic, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinic 1">Clinic 1</SelectItem>
                  <SelectItem value="Clinic 2">Clinic 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="petRoom">Pet Room</Label>
              <Select
                multiple // Enables multiple selection
                onValueChange={(value) => handleArrayChange(setPetRoom, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room 1">Room 1</SelectItem>
                  <SelectItem value="Room 2">Room 2</SelectItem>
                  <SelectItem value="Room 3">Room 3</SelectItem>
                  <SelectItem value="Room 4">Room 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="petPhoto">Pet Photo</Label>
              <Input
                id="petPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => setPetPhoto(e.target.files[0])}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="col-span-2 mt-4 w-full"
            disabled={loading}
            loading={loading ? "true" : "false"}
          >
            {loading ? "Saving..." : "Add Pet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
