"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/lib/db/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGraphId: string;
}

export default function AddConnectionModal({
  isOpen,
  onClose,
  currentGraphId,
}: AddConnectionModalProps) {
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState<Profile[]>([]);
  const [connectEveryone, setConnectEveryone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all profiles for the current graph
  const { data: graphData } = useQuery({
    queryKey: ["graph", currentGraphId],
    queryFn: async () => {
      const response = await fetch(`/api/graphs/${currentGraphId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch graph data");
      }
      return response.json();
    },
  });

  const profiles = graphData?.profiles || [];

  // Filter profiles based on input
  const filteredProfiles = profiles.filter((profile: Profile) => {
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    return fullName.includes(inputValue.toLowerCase()) && inputValue.length > 0;
  });

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsDropdownOpen(true);

    // Parse first and last name from input
    const nameParts = value.trim().split(" ");
    if (nameParts.length >= 2) {
      setFirstNameValue(nameParts[0]);
      setLastNameValue(nameParts.slice(1).join(" "));
    } else {
      setFirstNameValue(value);
      setLastNameValue("");
    }
  };

  // Handle profile selection
  const handleProfileSelect = (profile: Profile) => {
    setFirstNameValue(profile.first_name);
    setLastNameValue(profile.last_name);
    setInputValue(`${profile.first_name} ${profile.last_name}`);
    setIsDropdownOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstNameValue.trim() || !lastNameValue.trim()) return;

    setIsSubmitting(true);
    try {
      // Prepare the request body in the format expected by the API
      const requestBody = {
        self: {
          first_name: firstNameValue.trim(),
          last_name: lastNameValue.trim(),
        },
        connections: selectedConnections.map((connection) => ({
          first_name: connection.first_name,
          last_name: connection.last_name,
        })),
        connectEveryone,
      };

      // Add the new profile and connections using the graph-specific endpoint
      const addResponse = await fetch(`/api/graphs/${currentGraphId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || "Failed to add profile");
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["graph", currentGraphId] });

      // Reset form
      setFirstNameValue("");
      setLastNameValue("");
      setInputValue("");
      setSelectedConnections([]);
      setConnectEveryone(false);
      onClose();
    } catch (error) {
      console.error("Error adding connection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFirstNameValue("");
      setLastNameValue("");
      setInputValue("");
      setSelectedConnections([]);
      setConnectEveryone(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to the graph</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <Input
                    id="name"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Enter full name..."
                    className="pr-8"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              {filteredProfiles.length > 0 && inputValue && (
                <DropdownMenuContent className="w-full min-w-[200px] max-h-[200px] overflow-y-auto">
                  {filteredProfiles.slice(0, 10).map((profile: Profile) => {
                    const fullName = `${profile.first_name} ${profile.last_name}`;
                    return (
                      <DropdownMenuItem
                        key={profile.id}
                        onClick={() => handleProfileSelect(profile)}
                        className="cursor-pointer"
                      >
                        {fullName}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>

          {/* Selected connections display */}
          {selectedConnections.length > 0 && (
            <div className="space-y-2">
              <Label>Selected connections:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm"
                  >
                    <span>
                      {connection.first_name} {connection.last_name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedConnections((prev) =>
                          prev.filter((c) => c.id !== connection.id)
                        )
                      }
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add connection button */}
          {profiles.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Show a simple prompt to select from existing profiles
                const profileNames = profiles.map(
                  (p: Profile) => `${p.first_name} ${p.last_name}`
                );
                const selectedName = prompt(
                  "Select a profile to connect with:\n\n" +
                    profileNames.join("\n")
                );
                if (selectedName) {
                  const selectedProfile = profiles.find(
                    (p: Profile) =>
                      `${p.first_name} ${p.last_name}` === selectedName
                  );
                  if (
                    selectedProfile &&
                    !selectedConnections.find(
                      (c) => c.id === selectedProfile.id
                    )
                  ) {
                    setSelectedConnections((prev) => [
                      ...prev,
                      selectedProfile,
                    ]);
                  }
                }
              }}
            >
              + Add connection
            </Button>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="connectEveryone"
              checked={connectEveryone}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                setConnectEveryone(checked as boolean)
              }
            />
            <Label htmlFor="connectEveryone">Connect everyone?</Label>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting || !firstNameValue.trim() || !lastNameValue.trim()
            }
          >
            {isSubmitting ? "Adding..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
