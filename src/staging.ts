import { readdir } from "fs/promises";
import { join } from "path";

const STAGING_PENDING = join(process.cwd(), "state", "staging", "pending");

/**
 * Count proposals in the staging area awaiting human review.
 */
export async function countStagingProposals(): Promise<number> {
  try {
    const files = await readdir(STAGING_PENDING);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}
