"use client";
import React from 'react';
import { UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-16 w-16', // 64px
            userButtonTrigger: 'h-16 w-16'
          }
        }}
      />
    </header>
  );
} 