import React,{ useEffect, useState } from "react";
import api from "../api/axios.js";
import JobCard from "../components/JobCard.jsx";

export default function Recommendations() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => { api.get("/jobs/recommendations").then(r => setJobs(r.data)); }, []);
  return <main className="page"><div className="page-heading"><div><span className="eyebrow">Personalized</span><h1>Recommended for you</h1><p>Matches are based on your skills, interests, location, experience and job preferences.</p></div></div>
    {jobs.length ? <div className="job-grid">{jobs.map(j=><JobCard key={j._id} job={j}/>)}</div> : <div className="empty">Complete your profile to get better recommendations.</div>}
  </main>;
}
