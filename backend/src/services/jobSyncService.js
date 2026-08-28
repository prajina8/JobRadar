import Job from "../models/Job.js";
import { fetchAllExternalJobs } from "./jobSources/index.js";

export async function syncExternalJobs() {
  const jobs = await fetchAllExternalJobs();
  let created = 0;
  let updated = 0;

  for (const item of jobs) {
    const result = await Job.updateOne(
      { source: item.source, externalId: item.externalId },
      {
        $set: {
          ...item,
          isExternal: true,
          isActive: true
        }
      },
      { upsert: true }
    );
    if (result.upsertedCount) created++;
    else if (result.modifiedCount) updated++;
  }

  return { fetched: jobs.length, created, updated };
}
