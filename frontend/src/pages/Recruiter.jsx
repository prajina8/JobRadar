import { useEffect, useState } from "react";
import api from "../api/axios.js";

const blank = { title:"", company:"", description:"", requirements:"", skills:"", location:"Kathmandu", jobType:"Full-time", workMode:"Hybrid", experienceLevel:"Entry level", salary:"" };

export default function Recruiter() {
  const [form, setForm] = useState(blank);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [j,a] = await Promise.all([api.get("/jobs/mine"), api.get("/applications/recruiter")]);
    setJobs(j.data); setApps(a.data);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/jobs", {
      ...form,
      requirements: form.requirements.split("\n").filter(Boolean),
      skills: form.skills.split(",").map(x=>x.trim()).filter(Boolean)
    });
    setForm(blank); setMessage("Job published."); load();
  }

  async function status(id, value) {
    await api.patch(`/applications/${id}/status`, { status:value }); load();
  }

  return <main className="page">
    <div className="page-heading"><div><span className="eyebrow">Recruiter</span><h1>Recruiter workspace</h1></div></div>
    <div className="two-col">
      <section className="detail-card"><h2>Post a job</h2><p className="muted">Only recruiter-created jobs are manually published. External jobs are synchronized by source adapters.</p>
        <form onSubmit={create}>
          <label>Job title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
          <label>Company<input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label>
          <label>Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
          <label>Requirements <small>one per line</small><textarea value={form.requirements} onChange={e=>setForm({...form,requirements:e.target.value})}/></label>
          <label>Skills <small>comma separated</small><input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/></label>
          <label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
          <div className="form-row"><label>Type<select value={form.jobType} onChange={e=>setForm({...form,jobType:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Freelance</option></select></label><label>Mode<select value={form.workMode} onChange={e=>setForm({...form,workMode:e.target.value})}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label></div>
          <label>Experience<select value={form.experienceLevel} onChange={e=>setForm({...form,experienceLevel:e.target.value})}><option>Internship</option><option>Entry level</option><option>1-2 years</option><option>2-5 years</option><option>5+ years</option></select></label>
          <button className="btn">Publish Job</button>{message && <div className="success">{message}</div>}
        </form>
      </section>
      <section><h2>My jobs</h2>{jobs.map(j=><div className="application" key={j._id}><div><b>{j.title}</b><p>{j.company} · {j.location}</p></div><span className="status">{j.isActive ? "Active" : "Closed"}</span></div>)}<h2 className="mt">Applications</h2>{apps.map(a=><div className="application" key={a._id}><div><b>{a.applicant?.name}</b><p>{a.job?.title} · {a.applicant?.email}</p></div><select value={a.status} onChange={e=>status(a._id,e.target.value)}><option>Applied</option><option>Viewed</option><option>Shortlisted</option><option>Interview</option><option>Rejected</option><option>Accepted</option></select></div>)}</section>
    </div>
  </main>;
}
