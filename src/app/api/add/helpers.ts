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
  return prisma.connections.upsert({
    where: { profile_a_profile_b: { profile_a, profile_b } },
    update: {},
    create: { profile_a, profile_b },
  });
}
