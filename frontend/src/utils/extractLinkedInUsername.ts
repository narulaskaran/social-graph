/**
 * Extracts the LinkedIn username from a profile URL.
 * E.g., https://www.linkedin.com/in/narulaskaran/ => narulaskaran
 */
export function extractLinkedInUsername(url: string): string | null {
  try {
    const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_.]+)/);
    if (match && match[1]) {
      return match[1].replace(/\/$/, "");
    }
    return null;
  } catch {
    return null;
  }
}
