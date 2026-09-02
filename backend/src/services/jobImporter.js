
import Job from "../models/Job.js";

import { fetchLinkedInJobs } from "../integrations/linkedin.js";
import { fetchMeroJobJobs } from "../integrations/merojobs.js";
import { fetchOtherSourceJobs } from "../integrations/otherSources.js";

export async function syncExternalJobs() {
  console.log("=================================");
  console.log("Starting external job sync...");
  console.log("=================================");

  // Fetch jobs from all external sources
  const results = await Promise.allSettled([
    fetchLinkedInJobs(),
    fetchMeroJobJobs(),
    fetchOtherSourceJobs(),
  ]);

  const linkedInJobs =
    results[0].status === "fulfilled"
      ? results[0].value
      : [];

  const meroJobJobs =
    results[1].status === "fulfilled"
      ? results[1].value
      : [];

  const otherJobs =
    results[2].status === "fulfilled"
      ? results[2].value
      : [];

  // Combine all external jobs
  const jobs = [
    ...linkedInJobs,
    ...meroJobJobs,
    ...otherJobs,
  ];

  console.log(
    `LinkedIn jobs: ${linkedInJobs.length}`
  );

  console.log(
    `MeroJob jobs: ${meroJobJobs.length}`
  );

  console.log(
    `Other source jobs: ${otherJobs.length}`
  );

  console.log(
    `Total external jobs: ${jobs.length}`
  );

  let created = 0;
  let updated = 0;
  let failed = 0;

  // Save jobs to MongoDB
  for (const jobData of jobs) {
    try {
      if (!jobData.externalId) {
        console.warn(
          `Skipping ${jobData.source} job because externalId is missing.`
        );

        failed++;
        continue;
      }

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

