import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin, Briefcase, Clock } from "lucide-react";

function daysLeftLabel(deadline) {
  const days = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (days <= 0) return "Closes today";
  return `${days}d left`;
}

export default function JobCard({ job, onSave }) {
  return (
    <article className="job-card">
      <div className="job-top">
        <div>
          <p className="company">{job.company}</p>
          <h3>{job.title}</h3>
        </div>
        {onSave && <button className="icon-btn" onClick={() => onSave(job._id)} title="Save job"><Bookmark size={19}/></button>}
      </div>
      <div className="chips">
        <span><MapPin size={14}/>{job.location}</span>
        <span><Briefcase size={14}/>{job.jobType}</span>
        <span><Clock size={14}/>{job.workMode}</span>
      </div>
      <div className="skills">{(job.skills || []).slice(0, 5).map(s => <span key={s}>{s}</span>)}</div>
      {job.matchScore !== undefined && <div className="match">{job.matchScore}% Match</div>}
      <p className="muted">
  Posted {new Date(job.postedDate).toLocaleDateString()}
  {job.deadline && ` · ${daysLeftLabel(job.deadline)}`}
</p>
      <Link className="btn outline full" to={`/jobs/${job._id}`}>View Job</Link>
    </article>
  );
}
