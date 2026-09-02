import Job from "../models/Job.js";

import { fetchLinkedInJobs } from "../integrations/linkedin.js";
import { fetchMeroJobJobs } from "../integrations/merojobs.js";
import { fetchOtherSourceJobs } from "../integrations/otherSources.js";

export async function syncExternalJobs() {
  console.log("=================================");
  console.log("Starting external job sync...");
  console.log("=================================");

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
    `LinkedIn jobs: ${linkedInJobs.length}`
  );

  console.log(
    `MeroJob jobs: ${meroJobJobs.length}`
  );

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const jobData of jobs) {
    try {
      const existingJob = await Job.findOne({
        source: jobData.source,
        externalId: jobData.externalId,
      });

      if (existingJob) {
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
      failed++;

      console.error(
        `Failed to save ${jobData.source} job:`,
        error.message
      );
    }
  }

  console.log("=================================");
  console.log("External job sync completed");
  console.log(`Fetched: ${jobs.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log("=================================");

  return {
    fetched: jobs.length,
    created,
    updated,
    failed,
  };
}