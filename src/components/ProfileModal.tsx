"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
}

interface ProfileModalProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({
  profile,
  open,
  onOpenChange,
}: ProfileModalProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </h3>
          </div>
          <div>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View LinkedIn Profile
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
