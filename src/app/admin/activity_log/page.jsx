"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Appwrite configuration
const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67094c000023e950be96",
  databaseId: "670a040f000893eb8e06",
  userCollectionId: "670a04240019b97fcf05",
  petCollectionId: "670ab2db00351bc09a92",
  bucketId: "670ab439002597c2ae84",
  roomCollectionId: "6738afcd000d644b6853",
  room2CollectionId: "674dace4000dcbb1badf",
  ratingCollectionId: "671bd05400135c37afc1",
  loginCollectionId: "675ef04a002af3e4430c",
};

// Initialize Appwrite client and database
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
const databases = new Databases(client);

const fetchUserDetailsFromUserCollection = async (userId) => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );
    return {
      email: response.email || "Unknown Email",
      avatar: response.avatar || "/default-avatar.png",
      name: response.name || "Unknown User",
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      email: "Unknown Email",
      avatar: "/default-avatar.png",
      name: "Unknown User",
    };
  }
};

const fetchUserDetailsFromLoginCollection = async (userId) => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.loginCollectionId,
      userId
    );
    return {
      email: response.email || "Unknown Email",
      avatar: response.avatar || "/default-avatar.png",
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { email: "Unknown Email", avatar: "/default-avatar.png" };
  }
};

// Helper function to determine activity message
const getActivityMessage = async (log, collectionId) => {
  if (collectionId === appwriteConfig.userCollectionId) {
    const { name, email } = log.userId
      ? await fetchUserDetailsFromUserCollection(log.userId)
      : { name: "A user", email: "Unknown Email" };
    return `${name} (${email}) registered an account.`;
  } else if (collectionId === appwriteConfig.petCollectionId) {
    const { email } = log.userId
      ? await fetchUserDetailsFromUserCollection(log.userId)
      : { email: "A user" };
    if (log.action === "set_appointment") {
      return `${email} set an appointment.`;
    }
    return `${email} added a new pet: ${log.petName || "Unnamed pet"}.`;
  } else if (
    collectionId === appwriteConfig.roomCollectionId ||
    collectionId === appwriteConfig.room2CollectionId
  ) {
    const { email } = log.userId
      ? await fetchUserDetailsFromUserCollection(log.userId)
      : { email: "A user" };
    return `${email} booked a room: ${log.number || " "} - ${
      log.letter || " "
    }`;
  } else if (collectionId === appwriteConfig.ratingCollectionId) {
    const { email } = log.userId
      ? await fetchUserDetailsFromUserCollection(log.userId)
      : { email: "A user" };
    return `${email} submitted a rating: ${
      log.overallExperience || "No rating given"
    } stars.`;
  } else if (collectionId === appwriteConfig.loginCollectionId) {
    const { email, avatar } = await fetchUserDetailsFromLoginCollection(
      log.$id
    );
    return `${email} logged in.`;
  } else {
    const { email } = log.userId
      ? await fetchUserDetailsFromUserCollection(log.userId)
      : { email: "A user" };
    return `${email} performed an action.`;
  }
};

const PetActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("all");

  const fetchAllLogs = async () => {
    try {
      const collectionIds = [
        appwriteConfig.userCollectionId,
        appwriteConfig.petCollectionId,
        appwriteConfig.roomCollectionId,
        appwriteConfig.room2CollectionId,
        appwriteConfig.ratingCollectionId,
        appwriteConfig.loginCollectionId,
      ];

      const promises = collectionIds.map((collectionId) =>
        databases
          .listDocuments(appwriteConfig.databaseId, collectionId)
          .then((res) => res.documents.map((doc) => ({ ...doc, collectionId })))
      );

      const results = await Promise.all(promises);

      const allLogs = results
        .flat()
        .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

      // Fetch activity messages with user emails, avatars, and phone numbers resolved
      const logsWithMessages = await Promise.all(
        allLogs.map(async (log) => {
          let details;
          if (log.collectionId === appwriteConfig.userCollectionId) {
            details = await fetchUserDetailsFromUserCollection(log.$id);
          } else if (log.collectionId === appwriteConfig.loginCollectionId) {
            details = await fetchUserDetailsFromLoginCollection(log.$id);
          } else {
            details = log.userId
              ? await fetchUserDetailsFromUserCollection(log.userId)
              : {
                  email: "A user",
                  avatar: "/default-avatar.png",
                  name: "Unknown User",
                };
          }

          return {
            ...log,
            message: await getActivityMessage(log, log.collectionId),
            avatar: details.avatar,
          };
        })
      );

      setActivityLogs(logsWithMessages);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const filteredLogs = activityLogs.filter((log) => {
    if (selectedActivity === "all") return true;
    if (
      selectedActivity === "register" &&
      log.collectionId === appwriteConfig.userCollectionId
    )
      return true;
    if (
      selectedActivity === "login" &&
      log.collectionId === appwriteConfig.loginCollectionId
    )
      return true;
    if (
      selectedActivity === "pet" &&
      log.collectionId === appwriteConfig.petCollectionId
    )
      return true;
    if (
      selectedActivity === "room" &&
      (log.collectionId === appwriteConfig.roomCollectionId ||
        log.collectionId === appwriteConfig.room2CollectionId)
    )
      return true;
    if (
      selectedActivity === "rating" &&
      log.collectionId === appwriteConfig.ratingCollectionId
    )
      return true;
    return false;
  });

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full h-full">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Activity Log</h2>
        <div className="mt-4">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="register">Register Account</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="pet">Add Pet</SelectItem>
              <SelectItem value="room">Book Room</SelectItem>
              <SelectItem value="rating">Submit Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-y-auto max-h-screen">
        {filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No activities found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <li key={log.$id} className="px-6 py-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={log.avatar}
                      alt={log.email || "Activity"}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{log.message}</p>
                    {log.collectionId === appwriteConfig.userCollectionId && (
                      <p className="text-xs text-gray-500">
                        Phone: {log.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(log.$createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Main page component
const ActivityLog = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="col-span-1">
            <PetActivityLog />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLog;
