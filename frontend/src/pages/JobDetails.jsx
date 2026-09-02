import React,{ useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { api.get(`/jobs/${id}`).then(r => setJob(r.data)); }, [id]);

  async function apply() {
    try {
      const { data } = await api.post(`/applications/${id}`);
      setMessage(`Application submitted for ${data.job.title}.`);
    } catch (err) {
      const d = err.response?.data;
      if (d?.sourceUrl) window.open(d.sourceUrl, "_blank");
      setMessage(d?.message || "Could not apply.");
    }
  }

  if (!job) return <main className="page">Loading...</main>;

  return <main className="page narrow">
    <div className="detail-card">
      <span className="eyebrow">{job.source}</span>
      <h1>{job.title}</h1>
      <h3>{job.company}</h3>
      <div className="chips"><span>{job.location}</span><span>{job.jobType}</span><span>{job.workMode}</span><span>{job.experienceLevel}</span></div>
      <p className="muted">Posted {new Date(job.postedDate).toLocaleDateString()}</p>
      <hr/>
      <h2>Description</h2><p className="long">{job.description}</p>
      <h2>Requirements</h2><ul>{(job.requirements || []).map(r=><li key={r}>{r}</li>)}</ul>
      <h2>Skills</h2><div className="skills">{(job.skills || []).map(s=><span key={s}>{s}</span>)}</div>
      {message && <div className="success">{message}</div>}
      {user?.role === "applicant" && (
        job.isExternal
          ? <a className="btn" href={job.sourceUrl} target="_blank" rel="noreferrer">Apply on source</a>
          : <button className="btn" onClick={apply}>Apply Now</button>
      )}
    </div>
  </main>;
}
