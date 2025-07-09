"use client";
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';

export default function ConfirmSignOutButton() {
  return (
    <SignOutButton
      onClick={e => {
        if (!window.confirm("Are you sure you want to log out?")) {
          e.preventDefault();
        }
      }}
    >
      <Button className="rounded-full w-full text-sm sm:text-base py-2 sm:py-3">
        Log Out
      </Button>
    </SignOutButton>
  );
} 