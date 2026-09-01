import Job from "../models/Job.js";
import { fetchLinkedInJobs } from "../integrations/linkedin.js";
import { fetchMeroJobJobs } from "../integrations/merojobs.js";

export async function syncExternalJobs() {
  console.log("Starting external job synchronization...");

  const results = await Promise.allSettled([
    fetchLinkedInJobs(),
    fetchMeroJobJobs(),
  ]);

  const linkedInJobs =
    results[0].status === "fulfilled"
      ? results[0].value
      : [];

  const meroJobJobs =
    results[1].status === "fulfilled"
      ? results[1].value
      : [];

  const jobs = [
    ...linkedInJobs,
    ...meroJobJobs,
  ];

  console.log(
    `Fetched ${jobs.length} external jobs`
  );

  let created = 0;
  let updated = 0;

  for (const jobData of jobs) {
    try {
      const existing = await Job.findOne({
        source: jobData.source,
        externalId: jobData.externalId,
      });

      if (existing) {
        await Job.updateOne(
          {
            source: jobData.source,
            externalId: jobData.externalId,
          },
          {
            $set: jobData,
          }
        );

        updated++;
      } else {
        await Job.create(jobData);
        created++;
      }
    } catch (error) {
      console.error(
        `Failed to save ${jobData.source} job:`,
        error.message
      );
    }
  }

  console.log(
    `Job sync complete: ${created} created, ${updated} updated`
  );

  return {
    fetched: jobs.length,
    created,
    updated,
  };
}