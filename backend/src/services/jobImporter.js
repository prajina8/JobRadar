import Job from "../models/Job.js";

import {
  fetchLinkedInJobs,
} from "../integrations/linkedin.js";

import {
  fetchMeroJobJobs,
} from "../integrations/merojobs.js";

import {
  fetchOtherSourceJobs,
} from "../integrations/otherSources.js";

import {
  fetchHimalayasJobs,
} from "../integrations/himalayas.js";

import {
  fetchRemoteOKJobs,
} from "../integrations/remoteok.js";

export async function syncExternalJobs() {
  console.log(
    "================================="
  );

  console.log(
    "Starting authorized job feed sync..."
  );

  console.log(
    "================================="
  );

  const results =
    await Promise.allSettled([
      fetchLinkedInJobs(),
      fetchMeroJobJobs(),
      fetchOtherSourceJobs(),
      fetchHimalayasJobs(),
      fetchRemoteOKJobs(),
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

  const jobs = [
    ...linkedInJobs,
    ...meroJobJobs,
    ...otherJobs,
  ];

  console.log(
    `Received ${jobs.length} external jobs.`
  );

  let inserted = 0;
  let updated = 0;

  for (const job of jobs) {
    if (!job.externalId || !job.source) {
      continue;
    }

    const existingJob =
      await Job.findOne({
        source: job.source,
        externalId: job.externalId,
      });

    if (existingJob) {
      Object.assign(existingJob, job);

      await existingJob.save();

      updated++;

      continue;
    }

    await Job.create(job);

    inserted++;
  }

  console.log(
    `Inserted: ${inserted}`
  );

  console.log(
    `Updated: ${updated}`
  );

  console.log(
    "External job sync completed."
  );

  return {
    received: jobs.length,
    inserted,
    updated,
  };
}