// Moved from src/utils/extractLinkedInUsername.test.ts for test standardization
import { extractLinkedInUsername } from "../../src/utils/extractLinkedInUsername";

describe("extractLinkedInUsername", () => {
  it("extracts username from standard LinkedIn URL", () => {
    expect(
      extractLinkedInUsername("https://www.linkedin.com/in/john-doe-123456789/")
    ).toBe("john-doe-123456789");
  });

  it("returns null for invalid LinkedIn URL", () => {
    expect(
      extractLinkedInUsername("https://www.example.com/in/john-doe/")
    ).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractLinkedInUsername("")).toBeNull();
  });
});
