import { getDatabase } from "../src/lib/db/index";
import type { Database } from "../src/lib/db/types";

async function main() {
  const db = getDatabase();

  // Example profiles
  await db.upsertProfiles([
    {
      linkedin_username: "alice-smith",
      first_name: "Alice",
      last_name: "Smith",
    },
    {
      linkedin_username: "bob-jones",
      first_name: "Bob",
      last_name: "Jones",
    },
    {
      linkedin_username: "carol-lee",
      first_name: "Carol",
      last_name: "Lee",
    },
  ]);

  // Example connections (undirected)
  await db.upsertConnections([
    { profile_a: "alice-smith", profile_b: "bob-jones" },
    { profile_a: "bob-jones", profile_b: "carol-lee" },
    { profile_a: "carol-lee", profile_b: "alice-smith" },
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
