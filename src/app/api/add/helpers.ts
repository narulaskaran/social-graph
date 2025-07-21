import { getDatabase } from "@/lib/db";

export async function upsertProfileHelper(
  id: string,
  first_name: string,
  last_name: string,
  graph_id: string
) {
  const db = getDatabase();
  return db.upsertProfile({
    id,
    first_name,
    last_name,
    graph_id,
  });
}
