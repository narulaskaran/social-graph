"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

interface Profile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

interface LinkedInUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LinkedInUrlInput({
  value,
  onChange,
  placeholder = "https://www.linkedin.com/in/your-profile",
}: LinkedInUrlInputProps) {
  const [open, setOpen] = React.useState(false);

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json();
    },
  });

  const filteredProfiles = React.useMemo(() => {
    if (!value) return profiles;
    const searchTerm = value.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.linkedin_username.toLowerCase().includes(searchTerm) ||
        `${profile.first_name} ${profile.last_name}`
          .toLowerCase()
          .includes(searchTerm)
    );
  }, [profiles, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search profiles..."
            value={value}
            onValueChange={onChange}
          />
          <CommandEmpty>No profiles found.</CommandEmpty>
          <CommandGroup>
            {filteredProfiles.map((profile) => (
              <CommandItem
                key={profile.linkedin_username}
                value={`https://www.linkedin.com/in/${profile.linkedin_username}`}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value ===
                      `https://www.linkedin.com/in/${profile.linkedin_username}`
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {profile.first_name} {profile.last_name} (
                {profile.linkedin_username})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
