import Job from "../models/Job.js";

export async function deactivateExpiredJobs() {
  const result = await Job.updateMany(
    { isActive: true, deadline: { $lte: new Date() } },
    { $set: { isActive: false } }
  );

  if (result.modifiedCount) {
    console.log(`Deactivated ${result.modifiedCount} job(s) past their 10-day deadline.`);
  }

  return result.modifiedCount;
}