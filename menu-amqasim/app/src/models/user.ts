import mongoose, { Schema, Document } from "mongoose";

export enum USER_ROLES {
   ADMIN = "ADMIN",
   SUPERADMIN = "SUPERADMIN",
   NORMAL = "NORMAL",
}

export interface IUser extends Document {
   _id: string;
   username: string;
   password: string;
   role: USER_ROLES;
   createdAt: Date;
   updatedAt: Date;
}

const userSchema = new Schema<IUser>(
   {
      username: {
         type: String,
         required: [true, "Username is required"],
         unique: true,
         trim: true,
         minlength: [3, "Username must be at least 3 characters long"],
      },
      password: {
         type: String,
         required: [true, "Password is required"],
         minlength: [6, "Password must be at least 6 characters long"],
         select: false, // Don't include password in queries by default
      },
      role: {
         type: String,
         enum: Object.values(USER_ROLES),
         default: USER_ROLES.NORMAL,
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
