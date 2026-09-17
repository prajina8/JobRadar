import Job from "../models/Job.js";

import { fetchLinkedInJobs } from "../integrations/linkedin.js";
import { fetchMeroJobJobs } from "../integrations/merojobs.js";
import { fetchOtherSourceJobs } from "../integrations/otherSources.js";
import { fetchHimalayasJobs } from "../integrations/himalayas.js";
import { fetchRemoteOKJobs } from "../integrations/remoteok.js";
import { fetchArbeitnowJobs } from "../integrations/arbeitnow.js";
import { fetchAdzunaJobs } from "../integrations/adzuna.js";

// Sources that need no signup/key at all — always attempted.
// LinkedIn/MeroJob/"other" adapters stay in the list too but no-op (return [])
// until an authorized feed URL is set in .env — scraping those sites directly
// isn't done here since it breaks their terms of service / is legally risky.
const SOURCES = [
  { name: "LinkedIn", fetch: fetchLinkedInJobs },
  { name: "MeroJob", fetch: fetchMeroJobJobs },
  { name: "OtherSource", fetch: fetchOtherSourceJobs },
  { name: "Himalayas", fetch: fetchHimalayasJobs },
  { name: "RemoteOK", fetch: fetchRemoteOKJobs },
  { name: "Arbeitnow", fetch: fetchArbeitnowJobs },
  { name: "Adzuna", fetch: fetchAdzunaJobs },
];

export async function syncExternalJobs() {
  console.log("=================================");
  console.log("Starting external job feed sync...");
  console.log("=================================");

  const results = await Promise.allSettled(SOURCES.map((s) => s.fetch()));

  const jobs = results.flatMap((result, i) => {
    if (result.status === "fulfilled") return result.value;
    console.error(`${SOURCES[i].name} sync threw:`, result.reason?.message || result.reason);
    return [];
  });

  console.log(`Received ${jobs.length} external jobs.`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of jobs) {
    if (!raw.externalId || !raw.source) {
      skipped++;
      continue;
    }

    // Normalizers emit `postedAt`; the schema field is `postedDate`.
    const { postedAt, ...rest } = raw;
    const job = { ...rest, postedDate: postedAt || new Date() };

    const existingJob = await Job.findOne({ source: job.source, externalId: job.externalId });

    if (existingJob) {
      Object.assign(existingJob, job);
      await existingJob.save(); // pre-save hook re-applies the 10-day deadline cap
      updated++;
      continue;
    }

    await Job.create(job);
    inserted++;
  }

  console.log(`Inserted: ${inserted}  Updated: ${updated}  Skipped (no id): ${skipped}`);
  console.log("External job sync completed.");

  return { received: jobs.length, inserted, updated, skipped };
}