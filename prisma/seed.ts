import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Example profiles
  await prisma.profile.createMany({
    data: [
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
    ],
  });

  // Example connections (undirected)
  await prisma.connections.createMany({
    data: [
      { profile_a: "alice-smith", profile_b: "bob-jones" },
      { profile_a: "bob-jones", profile_b: "carol-lee" },
      { profile_a: "carol-lee", profile_b: "alice-smith" },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
