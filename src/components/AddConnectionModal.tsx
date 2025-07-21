"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/lib/db/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";

interface ConnectionInput {
  first_name: string;
  last_name: string;
}

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

  const [connections, setConnections] = useState<ConnectionInput[]>([]);
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

  // Helper functions for managing connections
  const handleConnectionChange = (
    idx: number,
    field: keyof ConnectionInput,
    value: string
  ) => {
    setConnections((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addConnection = () =>
    setConnections((prev) => [...prev, { first_name: "", last_name: "" }]);

  const removeConnection = (idx: number) =>
    setConnections((prev) => prev.filter((_, i) => i !== idx));

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);

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
        connections: connections,
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
      setConnections([]);
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
      setConnections([]);
      setConnectEveryone(false);
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
            <div className="space-y-2">
              <Input
                id="name"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredProfiles.length > 0) {
                    e.preventDefault();
                    handleProfileSelect(filteredProfiles[0]); // Select first suggestion on Enter
                  }
                }}
                placeholder="Enter full name..."
              />
              {filteredProfiles.length > 0 && inputValue && (
                <div className="border rounded-md bg-muted/50 max-h-[150px] overflow-y-auto">
                  <div className="p-2 text-sm text-muted-foreground border-b">
                    Suggestions:
                  </div>
                  {filteredProfiles.slice(0, 10).map((profile: Profile) => {
                    const fullName = `${profile.first_name} ${profile.last_name}`;
                    return (
                      <div
                        key={profile.id}
                        onClick={() => handleProfileSelect(profile)}
                        className="p-2 text-sm hover:bg-muted cursor-pointer border-b last:border-b-0"
                      >
                        {fullName}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Connections */}
          <div className="space-y-2">
            <Label>Connections</Label>
            {connections.map((c, idx) => (
              <div
                key={idx}
                className="flex gap-2 mb-4 border rounded-lg p-4 bg-background/50"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="First name"
                      value={c.first_name}
                      onChange={(e) =>
                        handleConnectionChange(
                          idx,
                          "first_name",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Last name"
                      value={c.last_name}
                      onChange={(e) =>
                        handleConnectionChange(idx, "last_name", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove connection"
                  onClick={() => removeConnection(idx)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addConnection}
              className="mt-2"
            >
              + Add connection
            </Button>
          </div>

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
