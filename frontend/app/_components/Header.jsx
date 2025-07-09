"use client";
import React from 'react';
import { UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 p-2 sm:p-4 z-50">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16',
            userButtonTrigger: 'h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16'
          }
        }}
      />
    </header>
  );
} 