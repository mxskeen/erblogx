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
            avatarBox: 'h-8 w-8 sm:h-9 sm:w-9 border border-stone-200/80 shadow-sm',
            userButtonTrigger: 'h-8 w-8 sm:h-9 sm:w-9'
          }
        }}
      />
    </header>
  );
} 