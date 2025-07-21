// Use URL-safe alphabet without ambiguous characters
const alphabet = "0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function generateGraphId(): string {
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

/**
 * Generates a unique, URL-safe graph ID
 * @returns A 12-character string safe for use in URLs
 */
export function createGraphId(): string {
  return generateGraphId();
}

/**
 * Validates if a string is a valid graph ID format
 * @param graphId The string to validate
 * @returns true if the string matches the expected graph ID format
 */
export function isValidGraphId(graphId: string): boolean {
  // Check length and character set
  return graphId.length === 12 && /^[0-9A-HJ-NP-Za-hj-np-z]{12}$/.test(graphId);
}
