"use client";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface Profile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

interface LinkedInUrlInputProps {
  value: string;
  onChange: (value: string, profile?: Profile) => void;
  placeholder?: string;
}

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#18181b",
      paper: "#232326",
    },
    text: {
      primary: "#fff",
    },
  },
});

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
    profile,
  }));

  // Local MUI theme switching
  const [muiTheme, setMuiTheme] = React.useState(lightTheme);
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setMuiTheme(isDark ? darkTheme : lightTheme);
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setMuiTheme(isDarkNow ? darkTheme : lightTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // LinkedIn profile URL validation
  const linkedInProfileRegex =
    /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/i;
  const isValid = value === "" || linkedInProfileRegex.test(value);
  const errorText =
    !isValid && value !== ""
      ? "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)"
      : undefined;

  return (
    <ThemeProvider theme={muiTheme}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.url
        }
        isOptionEqualToValue={(option, val) => {
          const optionUrl = typeof option === "string" ? option : option.url;
          const valueUrl = typeof val === "string" ? val : val.url;
          return optionUrl === valueUrl;
        }}
        inputValue={value}
        onInputChange={(_, newInputValue, reason) => {
          // Prevent clearing on blur
          if (reason === "reset") return;
          onChange(newInputValue);
        }}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            onChange(newValue);
          } else if (newValue && typeof newValue === "object") {
            onChange(newValue.url, newValue.profile);
          } else {
            onChange("");
          }
        }}
        filterOptions={(opts, state) => {
          // Show all options if input is empty, otherwise filter by url or label
          if (!state.inputValue) return opts;
          const search = state.inputValue.toLowerCase();
          return opts.filter((opt) => {
            const url = typeof opt === "string" ? opt : opt.url;
            const label = typeof opt === "string" ? opt : opt.label;
            return (
              url.toLowerCase().includes(search) ||
              label.toLowerCase().includes(search)
            );
          });
        }}
        renderOption={(props, option) => (
          <li {...props} key={typeof option === "string" ? option : option.url}>
            {typeof option === "string" ? option : option.label}
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
            error={!isValid && value !== ""}
            helperText={errorText}
          />
        )}
      />
    </ThemeProvider>
  );
}
