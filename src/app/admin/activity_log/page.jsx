"use client";

import { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";

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
  ratingaCollectionId: "671bd05400135c37afc1",
};

// Initialize Appwrite client and database
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
const databases = new Databases(client);

// Helper function to determine activity message
// Helper function to determine activity message
const getActivityMessage = (log, collectionId) => {
  if (collectionId === appwriteConfig.userCollectionId) {
    return `${log.name || "A user"} registered an account.`;
  } else if (collectionId === appwriteConfig.petCollectionId) {
    // Fetch the user's name from userCollectionId when adding a pet
    const userName = log.userId
      ? fetchUserNameFromUserCollection(log.userId)
      : "A user";
    return `${userName} added a new pet: ${log.petName || "Unnamed pet"}.`;
  } else if (
    collectionId === appwriteConfig.roomCollectionId ||
    collectionId === appwriteConfig.room2CollectionId
  ) {
    return `${log.name || "A user"} booked a room: ${log.number || " "} - ${
      log.letter || " "
    }.`;
  } else if (collectionId === appwriteConfig.ratingCollectionId) {
    return `${log.name || "A user"} submitted a rating: ${
      log.rating || "No rating given"
    } stars.`;
  } else {
    return `${log.name || "A user"} performed an action.`;
  }
};

// Component to fetch and display activity logs
const PetActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState([]);

  // Fetch data from all specified collections
  const fetchAllLogs = async () => {
    try {
      const collectionIds = [
        appwriteConfig.userCollectionId,
        appwriteConfig.petCollectionId,
        appwriteConfig.roomCollectionId,
        appwriteConfig.room2CollectionId,
        appwriteConfig.ratingaCollectionId,
      ];

      const promises = collectionIds.map((collectionId) =>
        databases.listDocuments(appwriteConfig.databaseId, collectionId).then(
          (res) => res.documents.map((doc) => ({ ...doc, collectionId })) // Tag each document with its collectionId
        )
      );

      const results = await Promise.all(promises);

      const allLogs = results
        .flat() // Flatten results
        .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)); // Sort by `Created`

      setActivityLogs(allLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full h-full">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Activity Log</h2>
      </div>
      <div className="overflow-y-auto max-h-screen">
        {activityLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No activities found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {activityLogs.map((log) => (
              <li key={log.$id} className="px-6 py-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={log.image || "/default-avatar.png"} // Replace with your placeholder image
                      alt={log.name || "Activity"}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {getActivityMessage(log, log.collectionId)}
                    </p>
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
