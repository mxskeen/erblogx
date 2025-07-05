"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, createContext } from "react";
import { supabase } from '../services/supabase';

// Create the UserDetailContext
const UserDetailContext = createContext();

function Provider({ children }) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      createNewUser();
    }
  }, [user]);

  const createNewUser = async () => {
    try {
      // Check if user exists
      const { data: users, error } = await supabase
        .from('users')
        .select("*")
        .eq("email", user?.primaryEmailAddress.emailAddress);

      if (error) {
        console.error("Error checking user:", error);
        return;
      }

      // If user doesn't exist, create a new one
      if (users.length === 0) {
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              email: user?.primaryEmailAddress.emailAddress,
              name: user?.fullName || user?.firstName || "Unknown",
              username: user?.username,
              // Add other fields as needed
            },
          ]);

        if (insertError) {
          console.error("Error creating user:", insertError);
        } else {
          console.log("New user created:", data);
        }
      } else {
        console.log("User already exists:", users);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <UserDetailContext.Provider value={{}}>
      <div className="w-full">{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
