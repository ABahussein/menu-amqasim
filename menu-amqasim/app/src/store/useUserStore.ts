import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum UserRole {
   ADMIN = "ADMIN",
   USER = "USER",
   SUPERADMIN = "SUPERADMIN",
}

export type UserStoreState = {
   role: UserRole | null;
   username: string | null;
   token: string | null;
   setUser: (role: UserRole, token: string, username: string) => void;
   clearUser: () => void;
};

const userStore = create<UserStoreState>();
const useUserStore = userStore(
   persist(
      (set) => ({
         role: null,
         username: null,
         token: null,
         setUser: (role, token, username) =>
            set(() => ({ role, token, username })),
         clearUser: () => {
            set(() => ({ role: null, token: null, username: null }));
         },
      }),
      {
         name: "user-storage",
      }
   )
);

export default useUserStore;
