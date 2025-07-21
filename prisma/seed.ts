import { getDatabase } from "../src/lib/db/index";
import type { Database, Profile, Connection } from "../src/lib/db/types";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  10
);

async function main() {
  const db = getDatabase();

  // Create a default graph for seed data
  const defaultGraph = await db.createGraph();
  const graph_id = defaultGraph.id;

  // Generate ids for profiles
  const aliceId = nanoid();
  const bobId = nanoid();
  const carolId = nanoid();

  // Example profiles
  await db.upsertProfiles([
    {
      id: aliceId,
      first_name: "Alice",
      last_name: "Smith",
      graph_id,
    },
    {
      id: bobId,
      first_name: "Bob",
      last_name: "Jones",
      graph_id,
    },
    {
      id: carolId,
      first_name: "Carol",
      last_name: "Lee",
      graph_id,
    },
  ]);

  // Example connections (undirected)
  await db.upsertConnections([
    { profile_a_id: aliceId, profile_b_id: bobId, graph_id },
    { profile_a_id: bobId, profile_b_id: carolId, graph_id },
    { profile_a_id: carolId, profile_b_id: aliceId, graph_id },
  ]);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Database disconnection is handled by the implementations
  });
