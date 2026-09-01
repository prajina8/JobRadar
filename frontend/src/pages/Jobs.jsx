import React,{ useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios.js";
import JobCard from "../components/JobCard.jsx";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ q:"", location:"", jobType:"", workMode:"", experienceLevel:"", posted:"" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/jobs", { params: filters });
    setJobs(data.jobs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(id) {
    try { await api.post(`/jobs/${id}/save`); } catch {}
  }

  return <main className="page">
    <div className="page-heading"><div><span className="eyebrow">Explore</span><h1>Find your next job</h1></div></div>
    <form className="filters" onSubmit={e => { e.preventDefault(); load(); }}>
      <input placeholder="Job title, skill or company" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/>
      <input placeholder="Location" value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})}/>
      <select value={filters.jobType} onChange={e=>setFilters({...filters,jobType:e.target.value})}><option value="">All types</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Freelance</option></select>
      <select value={filters.workMode} onChange={e=>setFilters({...filters,workMode:e.target.value})}><option value="">All modes</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
      <select value={filters.posted} onChange={e=>setFilters({...filters,posted:e.target.value})}><option value="">Any date</option><option value="1">Today</option><option value="3">3 days</option><option value="7">7 days</option><option value="30">30 days</option></select>
      <button className="btn"><Search size={17}/> Search</button>
    </form>
    {loading ? <p>Loading jobs...</p> : jobs.length ? <div className="job-grid">{jobs.map(j=><JobCard key={j._id} job={j} onSave={save}/>)}</div> : <div className="empty">No jobs matched your search.</div>}
  </main>;
}
