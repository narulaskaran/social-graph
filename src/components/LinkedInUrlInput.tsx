"use client";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
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
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json();
    },
  });

  // Build options as LinkedIn URLs with label
  const options = profiles.map((profile) => ({
    label: `${profile.first_name} ${profile.last_name} (${profile.linkedin_username})`,
    url: `https://www.linkedin.com/in/${profile.linkedin_username}`,
  }));

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.url
      }
      inputValue={value}
      onInputChange={(_, newInputValue) => onChange(newInputValue)}
      onChange={(_, newValue) => {
        if (typeof newValue === "string") {
          onChange(newValue);
        } else if (newValue && typeof newValue === "object") {
          onChange(newValue.url);
        }
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.url}>
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={undefined}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          fullWidth
        />
      )}
    />
  );
}
