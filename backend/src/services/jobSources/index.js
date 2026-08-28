import { fetchDemoJobs } from "./demoSource.js";


export async function fetchAllExternalJobs() {
  const sources = await Promise.all([fetchDemoJobs()]);
  return sources.flat();
}
