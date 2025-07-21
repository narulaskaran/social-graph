import { POST } from "@/app/api/add/route";
import { getDatabase } from "@/lib/db";

describe("POST /api/add", () => {
  let db: any;

  beforeEach(async () => {
    // Get the actual MockDatabase instance
    db = getDatabase();

    // Clear the database
    await db.clearDatabase();
  });

  afterEach(async () => {
    // Clean up
    await db.clearDatabase();
  });

  it("successfully adds profiles and connections", async () => {
    const spy = jest.spyOn(db, "upsertConnections");

    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [
          {
            first_name: "Bob",
            last_name: "Johnson",
          },
          {
            first_name: "Carol",
            last_name: "Williams",
          },
        ],
        connectEveryone: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("connects everyone when connectEveryone is true", async () => {
    const spy = jest.spyOn(db, "upsertConnections");

    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [
          {
            first_name: "Bob",
            last_name: "Johnson",
          },
        ],
        connectEveryone: true,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("returns 400 if self profile fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          // last_name is missing
        },
        connections: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing self profile fields");
  });

  it("returns 400 if connections is not an array", async () => {
    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: "not-an-array",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Connections must be an array");
  });

  it("handles database errors", async () => {
    const spy = jest
      .spyOn(db, "upsertConnections")
      .mockRejectedValueOnce(new Error("DB Error"));

    const request = new Request("http://localhost:3000/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        self: {
          first_name: "Alice",
          last_name: "Smith",
        },
        connections: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    spy.mockRestore();
  });
});
