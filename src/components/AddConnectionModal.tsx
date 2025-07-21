"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

interface ConnectionInput {
  first_name: string;
  last_name: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface NameAutocompleteProps {
  firstNameValue: string;
  lastNameValue: string;
  onNameChange: (firstName: string, lastName: string) => void;
  firstNamePlaceholder?: string;
  lastNamePlaceholder?: string;
  profiles: Profile[];
  required?: boolean;
}

function NameAutocomplete({
  firstNameValue,
  lastNameValue,
  onNameChange,
  firstNamePlaceholder = "First name",
  lastNamePlaceholder = "Last name",
  profiles,
  required,
}: NameAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Update input display when values change externally
  React.useEffect(() => {
    const displayValue =
      firstNameValue || lastNameValue
        ? `${firstNameValue} ${lastNameValue}`.trim()
        : "";
    setInputValue(displayValue);
  }, [firstNameValue, lastNameValue]);

  // Filter profiles based on input
  const filteredProfiles = profiles.filter((profile) => {
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    return fullName.includes(inputValue.toLowerCase());
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);

    // If input is cleared, clear both names
    if (!value.trim()) {
      onNameChange("", "");
      return;
    }

    // Try to split the input into first and last name
    const parts = value.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      onNameChange(firstName, lastName);
    } else if (parts.length === 1) {
      // Only first name entered
      onNameChange(parts[0], "");
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    onNameChange(profile.first_name, profile.last_name);
    setInputValue(`${profile.first_name} ${profile.last_name}`);
    setOpen(false);
  };

  return (
    <div className="flex gap-2 flex-1">
      <div className="flex-1 relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <input
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required={required}
                placeholder={`${firstNamePlaceholder} ${lastNamePlaceholder}`}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setOpen(true)}
              />
              {filteredProfiles.length > 0 && inputValue && (
                <ChevronsUpDown className="absolute right-2 top-2.5 h-4 w-4 shrink-0 opacity-50" />
              )}
            </div>
          </PopoverTrigger>
          {filteredProfiles.length > 0 && inputValue && (
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandEmpty>No matching people found.</CommandEmpty>
                <CommandGroup>
                  {filteredProfiles.slice(0, 10).map((profile) => {
                    const fullName = `${profile.first_name} ${profile.last_name}`;
                    const isSelected =
                      firstNameValue === profile.first_name &&
                      lastNameValue === profile.last_name;

                    return (
                      <CommandItem
                        key={profile.id}
                        value={fullName}
                        onSelect={() => handleProfileSelect(profile)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {fullName}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>

      {/* Hidden inputs for form validation */}
      <input
        type="hidden"
        name="first_name"
        value={firstNameValue}
        required={required}
      />
      <input
        type="hidden"
        name="last_name"
        value={lastNameValue}
        required={required}
      />
    </div>
  );
}

export function AddConnectionModal({
  trigger,
  graphId,
}: {
  trigger: React.ReactNode;
  graphId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [self, setSelf] = React.useState({
    first_name: "",
    last_name: "",
  });
  const [connections, setConnections] = React.useState<ConnectionInput[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [connectEveryone, setConnectEveryone] = React.useState(false);

  const queryClient = useQueryClient();

  // Fetch existing profiles for autocomplete
  const { data: profilesData } = useQuery({
    queryKey: ["profiles", graphId],
    queryFn: async () => {
      const apiUrl = graphId ? `/api/graphs/${graphId}` : "/api/graph";
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json();
    },
    enabled: open, // Only fetch when modal is open
  });

  const profiles: Profile[] = profilesData?.profiles || [];

  const handleSelfNameChange = (firstName: string, lastName: string) => {
    setSelf({ first_name: firstName, last_name: lastName });
  };

  const handleConnectionNameChange = (
    idx: number,
    firstName: string,
    lastName: string
  ) => {
    setConnections((prev) =>
      prev.map((c, i) =>
        i === idx ? { first_name: firstName, last_name: lastName } : c
      )
    );
  };

  const addConnection = () =>
    setConnections((prev) => [...prev, { first_name: "", last_name: "" }]);
  const removeConnection = (idx: number) =>
    setConnections((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiUrl = graphId ? `/api/graphs/${graphId}/add` : "/api/add";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          self,
          connections,
          connectEveryone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add connections");
      }

      const result = await res.json();
      console.log(result);

      // Invalidate and refetch the graph data to refresh the visualization
      await queryClient.invalidateQueries({
        queryKey: ["graph", graphId],
      });

      // Also invalidate the profiles query for autocomplete
      await queryClient.invalidateQueries({
        queryKey: ["profiles", graphId],
      });

      // Reset form and close modal
      setOpen(false);
      setSelf({ first_name: "", last_name: "" });
      setConnections([]);
      setConnectEveryone(false);
    } catch (err) {
      console.error("Error adding connections:", err);
      // TODO: Add proper error handling UI
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add to the network</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <fieldset disabled={submitting} className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium">Your Name</label>
              <NameAutocomplete
                firstNameValue={self.first_name}
                lastNameValue={self.last_name}
                onNameChange={handleSelfNameChange}
                profiles={profiles}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium">Connections</label>
              {connections.map((c, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 mb-4 border rounded-lg p-4 bg-background/50"
                >
                  <NameAutocomplete
                    firstNameValue={c.first_name}
                    lastNameValue={c.last_name}
                    onNameChange={(firstName, lastName) =>
                      handleConnectionNameChange(idx, firstName, lastName)
                    }
                    profiles={profiles}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove connection"
                    onClick={() => removeConnection(idx)}
                  >
                    -
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
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="connect-everyone"
                  checked={connectEveryone}
                  onChange={(e) => setConnectEveryone(e.target.checked)}
                  className="rounded border-input bg-background"
                />
                <label htmlFor="connect-everyone" className="text-sm">
                  Connect everyone?
                </label>
              </div>
            </div>
          </fieldset>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
