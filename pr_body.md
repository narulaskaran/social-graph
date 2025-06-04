# LinkedIn URL Autocomplete

This PR implements autocomplete functionality for LinkedIn URLs in the "Add to the network" form. When typing in a LinkedIn URL, users can now select from a dropdown of profiles that already exist in the database.

## Changes

1. Added a new `/api/profiles` endpoint to fetch all profiles for autocomplete
2. Created a new `LinkedInUrlInput` component using shadcn/ui's Combobox component
3. Updated the `AddToNetworkModal` component to use the new `LinkedInUrlInput` component for both self and connection LinkedIn URLs

## Testing

1. Open the "Add to the network" modal
2. Start typing a LinkedIn URL or a name
3. Verify that matching profiles appear in the dropdown
4. Select a profile from the dropdown
5. Verify that the URL is filled in correctly
6. Submit the form and verify that the data is saved correctly

## Screenshots

[Add screenshots here if available]
