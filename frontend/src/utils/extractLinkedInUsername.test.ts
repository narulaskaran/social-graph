import { extractLinkedInUsername } from "./extractLinkedInUsername";

describe("extractLinkedInUsername", () => {
  it("extracts username from standard LinkedIn URL", () => {
    expect(
      extractLinkedInUsername("https://www.linkedin.com/in/narulaskaran/")
    ).toBe("narulaskaran");
    expect(extractLinkedInUsername("https://linkedin.com/in/johndoe")).toBe(
      "johndoe"
    );
  });

  it("returns null for invalid URLs", () => {
    expect(extractLinkedInUsername("https://www.google.com")).toBeNull();
    expect(extractLinkedInUsername("not a url")).toBeNull();
    expect(
      extractLinkedInUsername("https://www.linkedin.com/company/xyz/")
    ).toBeNull();
  });

  it("handles usernames with dashes, underscores, and dots", () => {
    expect(
      extractLinkedInUsername("https://www.linkedin.com/in/jane-doe_123.abc/")
    ).toBe("jane-doe_123.abc");
  });
});
