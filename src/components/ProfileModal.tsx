"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/db/types";
import * as React from "react";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {profile.first_name} {profile.last_name}
            </h3>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>ID: {profile.id}</p>
            <p>Graph: {profile.graph_id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
