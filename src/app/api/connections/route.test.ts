import { DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import { jest } from "@jest/globals";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    connections: {
      deleteMany: jest.fn(),
    },
  },
}));

describe("Connections API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("DELETE /api/connections", () => {
    it("should delete a connection", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.connections.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 1,
      } as any);
      const request = new Request("http://localhost:3000/api/connections", {
        method: "DELETE",
        body: JSON.stringify({ source: "user1", target: "user2" }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(prisma.connections.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { profile_a: "user1", profile_b: "user2" },
            { profile_a: "user2", profile_b: "user1" },
          ],
        },
      });
    });

    it("should return 400 if source or target is missing", async () => {
      const request = new Request("http://localhost:3000/api/connections", {
        method: "DELETE",
        body: JSON.stringify({ source: "user1" }), // missing target
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Source and target are required" });
      expect(prisma.connections.deleteMany).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.connections.deleteMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database error") as any
      );
      const request = new Request("http://localhost:3000/api/connections", {
        method: "DELETE",
        body: JSON.stringify({ source: "user1", target: "user2" }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Failed to delete connection" });
    });
  });
});
