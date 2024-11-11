import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "appwrite";
import { Permission, Role } from "appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "67094c000023e950be96",
  databaseId: "670a040f000893eb8e06",
  userCollectionId: "670a04240019b97fcf05",
  petCollectionId: "670ab2db00351bc09a92",
  bucketId: "670ab439002597c2ae84",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export { account, storage, avatars, databases }; // Export the necessary objects

// Ensure a Fresh Session
export async function ensureFreshSession() {
  try {
    const currentSession = await account.get();
    if (currentSession) {
      console.warn("Existing session found. Deleting current session.");
      await account.deleteSession("current");
    }
  } catch (error) {
    console.log("No active session found. Proceeding.");
  }
}

export async function uploadFileAndGetUrl(file) {
  try {
    const response = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file
    );
    console.log("File uploaded successfully:", response);

    // Construct the public URL
    const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${response.bucketId}/files/${response.$id}/view?project=${appwriteConfig.projectId}`;
    console.log("Constructed File URL:", fileUrl);

    return fileUrl;
  } catch (error) {
    console.error("Error uploading file or constructing URL:", error.message);
    throw new Error("Failed to upload file or construct URL.");
  }
}

// Create User with Personal and Pet Info
export async function createUser(
  personalInfo,
  petInfo,
  role = "admin",
  petPayment
) {
  try {
    await ensureFreshSession();

    const phone = personalInfo.phone.replace(/\D/g, "").trim();
    if (phone.length > 11) {
      throw new Error("Phone number must be 11 characters or fewer.");
    }

    // Upload the avatar and get the constructed URL
    let avatarUrl = "/placeholder.svg";
    if (personalInfo.ownerPhoto) {
      avatarUrl = await uploadFileAndGetUrl(personalInfo.ownerPhoto);
    }

    // Create user account
    const newAccount = await account.create(
      ID.unique(),
      personalInfo.email,
      personalInfo.password,
      personalInfo.name
    );
    console.log("Account created:", newAccount);

    // Create user document
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        name: personalInfo.name,
        email: personalInfo.email,
        phone,
        avatar: avatarUrl, // Store the avatar URL directly
        role,
      }
    );
    console.log("User document created:", newUser);

    // Upload the pet photo and store its URL

    let petPhotoUrl = "/placeholder.svg";
    if (petInfo.photo) {
      petPhotoUrl = await uploadFileAndGetUrl(petInfo.photo);
    }

    // Create pet document with petPayment included
    const petDocument = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.petCollectionId,
      ID.unique(),
      {
        ownerId: newAccount.$id,
        petName: petInfo.name,
        petType: petInfo.type,
        petSpecies: petInfo.species,
        petAge: petInfo.age,
        petServices: petInfo.services, // Ensure it is an array, not a string
        petPhotoId: petPhotoUrl, // Store pet photo URL
        petClinic: petInfo.clinic,
        petRoom: petInfo.room,
        petDate: petInfo.date,
        petTime: petInfo.time,
        petPayment: petPayment, // Adding the calculated payment
      }
    );
    console.log("Pet document created:", petDocument);

    // Create session for the user
    const session = await account.createEmailPasswordSession(
      personalInfo.email,
      personalInfo.password
    );
    console.log("Session created:", session);

    return { newUser, petDocument };
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw new Error(error.message || "Error during user registration");
  }
}
// Upload File to Appwrite Storage
export async function uploadFile(file) {
  try {
    const response = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file
    );
    console.log("File upload response:", response); // Debugging log
    return response.$id; // Ensure the file ID is returned
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw new Error("File upload failed");
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const existingSession = await account.get();
    if (existingSession) {
      console.warn("Existing session found. Deleting current session.");
      await account.deleteSession("current");
    }
  } catch (error) {
    console.log("No active session found. Proceeding with login.");
  }

  // Now attempt to create a new session
  try {
    const session = await account.createEmailPasswordSession(email, password);

    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("Unable to retrieve account.");
    return currentAccount;
  } catch (error) {
    console.error("Error signing in:", error.message);
    throw new Error(error.message || "Error signing in");
  }
}

// Fetch Current Account
export async function getAccount() {
  try {
    console.log("Fetching current account...");
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access. Redirecting to login.");
      return null;
    }
    throw new Error(error.message || "Error fetching account");
  }
}

// Get Current User Document
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount || !currentAccount.$id)
      throw new Error("No account found.");

    const currentUserResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUserResponse || currentUserResponse.total === 0)
      throw new Error("No user document found.");

    const userDocument = currentUserResponse.documents[0];

    // Fetch avatar URL from storage if available
    const avatarUrl = userDocument.avatar
      ? (
          await storage.getFileView(
            appwriteConfig.bucketId,
            userDocument.avatar
          )
        ).href
      : "/placeholder.svg"; // Fallback to placeholder if no avatar

    return { ...userDocument, avatarUrl };
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
}

export const fetchUserAndPetInfo = async (userId) => {
  try {
    if (!userId) throw new Error("Invalid User ID");

    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    const ownerId = user.accountId || userId;

    const petDocuments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.petCollectionId,
      [Query.equal("ownerId", ownerId)]
    );

    const pet = petDocuments.total > 0 ? petDocuments.documents[0] : null;

    // Fetch user avatar URL from storage if available
    const userAvatarUrl = user.ownerPhotoId
      ? (await storage.getFileView(appwriteConfig.bucketId, user.ownerPhotoId))
          .href
      : "/placeholder.svg"; // Use placeholder image if not available

    // Fetch pet avatar URL from storage if available
    const petAvatarUrl = pet?.petPhotoId
      ? (await storage.getFileView(appwriteConfig.bucketId, pet.petPhotoId))
          .href
      : "/placeholder.svg"; // Use placeholder image if not available

    return {
      user: { ...user, avatarUrl: userAvatarUrl },
      pet: pet ? { ...pet, avatarUrl: petAvatarUrl } : null,
    };
  } catch (error) {
    console.error("Error fetching user or pet data:", error.message);
    throw new Error(
      error.message.includes("document not found")
        ? "User or pet information not found."
        : "Error fetching user or pet data"
    );
  }
};

export async function signOut() {
  try {
    await account.deleteSession("current");
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out:", error.message);
    throw new Error("Error signing out");
  }
}

export const getUserRole = async (userId) => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId, // Your actual Database ID
      appwriteConfig.userCollectionId, // Your actual User Collection ID
      userId // The userId for which you want to get the role
    );

    return response.role; // Assuming 'role' is stored in the user document
  } catch (error) {
    console.error("Error fetching user role:", error.message);
    throw new Error("Could not fetch user role");
  }
};

// List accounts from the user collection
export const listAccounts = async () => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching accounts:", error.message);
    throw error;
  }
};

export const createAccount = async (email, password, accountData) => {
  try {
    // Step 1: Create account in Appwrite's Authentication
    const user = await account.create(ID.unique(), email, password);

    // Step 2: Add account data to your database (using Appwrite database)
    const newAccountInDatabase = await databases.createDocument(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.userCollectionId, // Collection ID for users
      ID.unique(), // Unique document ID
      {
        ...accountData,
        accountId: user.$id, // Add the accountId field
        email: user.email,
      }
    );

    return { user, newAccountInDatabase };
  } catch (error) {
    console.error("Error creating account:", error.message);
    throw error;
  }
};

// Update an existing account in the user collection
export const updateAccount = async (accountId, updatedData) => {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      accountId,
      updatedData
    );
  } catch (error) {
    console.error("Error updating account:", error.message);
    throw error;
  }
};

// Delete an account from the user collection
export const deleteAccount = async (accountId) => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      accountId
    );
  } catch (error) {
    console.error("Error deleting account:", error.message);
    throw error;
  }
};
// Function to save an appointment to the database
export const saveAppointmentToDatabase = async (appointmentData) => {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.petCollectionId,
      ID.unique(),
      appointmentData
    );
    console.log("Appointment saved:", response);
  } catch (error) {
    console.error("Error saving appointment:", error.response || error);
    throw new Error("Failed to save appointment.");
  }
};

// Save pet to Appwrite database
export async function savePetToDatabase(petData) {
  try {
    console.log("Saving pet data:", petData); // Log to verify structure
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.petCollectionId,
      ID.unique(),
      petData
    );
    console.log("Pet data saved successfully:", response);
  } catch (error) {
    console.error("Error saving pet data:", error.message);
    throw new Error("Failed to save pet data");
  }
}

// Check if the user is authenticated
export const checkAuth = async () => {
  try {
    const session = await account.get();
    return session ? true : false;
  } catch (error) {
    console.error("User is not authenticated:", error);
    return false;
  }
};
export async function uploadPhoto(file) {
  try {
    const response = await storage.createFile(
      appwriteConfig.bucketId, // Your Appwrite bucket ID
      ID.unique(),
      file
    );
    // Construct URL to access the uploaded file
    return storage.getFilePreview(appwriteConfig.bucketId, response.$id).href; // Or use getFileView for a direct download link
  } catch (error) {
    console.error("Error uploading photo:", error.message);
    throw new Error("Failed to upload photo");
  }
}
export async function getCurrentUserId() {
  try {
    const currentUser = await account.get();
    console.log("Current User ID:", currentUser.$id); // Debug log
    return currentUser.$id;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    throw new Error("User not authenticated");
  }
}

export async function getPetPhotoIdByName(petName) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.petCollectionId,
      [
        Query.equal("petName", petName), // Query to match the petName field
      ]
    );

    // Check if any documents were found and return the petPhotoId
    if (response.documents.length > 0) {
      return response.documents[0].petPhotoId;
    } else {
      console.log("No pet found with that name.");
      return null; // No pet found
    }
  } catch (error) {
    console.error("Error fetching pet photo ID:", error);
    throw new Error("Could not retrieve pet photo ID");
  }
}
