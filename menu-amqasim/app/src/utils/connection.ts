import mongoose from "mongoose";
import { MONGOURI } from "../config";

let isConnected: boolean = false;

export const initConnection = async (): Promise<typeof mongoose> => {
   if (isConnected) {
      console.log("Database already connected.");
      return mongoose;
   }

   try {
      const connection = await mongoose.connect(MONGOURI, {
         maxPoolSize: 10,
         serverSelectionTimeoutMS: 5000,
         socketTimeoutMS: 45000,
         bufferCommands: false,
      });

      isConnected = true;
      console.log("Database connection initialized successfully.");

      // Handle connection events
      mongoose.connection.on("connected", () => {
         console.log("Mongoose connected to MongoDB");
      });

      mongoose.connection.on("error", (err) => {
         console.error("Mongoose connection error:", err);
         isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
         console.log("Mongoose disconnected");
         isConnected = false;
      });

      return connection;
   } catch (error) {
      console.error("Failed to initialize database connection:", error);
      isConnected = false;
      throw error;
   }
};

export const closeConnection = async () => {
   if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log("Database connection closed.");
   }
};

export const getConnectionStatus = (): boolean => {
   return isConnected;
};
