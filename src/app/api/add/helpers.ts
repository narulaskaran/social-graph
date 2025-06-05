import { prisma } from "@/lib/prisma";

export async function upsertProfile(
  linkedin_username: string,
  first_name: string,
  last_name: string
) {
  return prisma.profile.upsert({
    where: { linkedin_username },
    update: { first_name, last_name },
    create: { linkedin_username, first_name, last_name },
  });
}

export async function upsertConnection(profile_a: string, profile_b: string) {
  // Ensure idempotency by lexicographically ordering profile_a and profile_b
  const [a, b] = [profile_a, profile_b].sort();
  return prisma.connections.upsert({
    where: { profile_a_profile_b: { profile_a: a, profile_b: b } },
    update: {},
    create: { profile_a: a, profile_b: b },
  });
}
