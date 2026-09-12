const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const country = "in";

async function fetchJobs(query = "developer", page = 1) {
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(query)}&results_per_page=20`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Adzuna API error: ${res.status}`);
  }

  const data = await res.json();

  return data.results || [];
}

export { fetchJobs };