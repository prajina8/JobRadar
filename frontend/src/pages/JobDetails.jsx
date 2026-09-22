import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { decode } from "he";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

function daysLeftLabel(deadline) {
  const days = Math.ceil(
    (new Date(deadline) - Date.now()) / 86400000
  );

  if (days <= 0) {
    return "Closes today";
  }

  return `Apply by ${new Date(deadline).toLocaleDateString()} (${days} day${
    days === 1 ? "" : "s"
  } left)`;
}

function cleanJobDescription(description) {
  if (!description) {
    return "";
  }

  const cleaned = decode(String(description));

  return cleaned;
}

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((response) => {
        setJob(response.data);
      })
      .catch((error) => {
        console.error("Failed to load job:", error);
      });
  }, [id]);

  async function apply() {
    try {
      const { data } = await api.post(`/applications/${id}`);

      setMessage(`Application submitted for ${data.job.title}.`);
    } catch (err) {
      const data = err.response?.data;

      if (data?.sourceUrl) {
        window.open(data.sourceUrl, "_blank");
      }

      setMessage(data?.message || "Could not apply.");
    }
  }

  if (!job) {
    return <main className="page">Loading...</main>;
  }

  const cleanedDescription = cleanJobDescription(job.description);

  return (
    <main className="page narrow">
      <div className="detail-card">
        <span className="eyebrow">{job.source}</span>

        <h1>{job.title}</h1>

        <h3>{job.company}</h3>

        <div className="chips">
          <span>{job.location}</span>
          <span>{job.jobType}</span>
          <span>{job.workMode}</span>
          <span>{job.experienceLevel}</span>
        </div>

        <p className="muted">
          Posted{" "}
          {new Date(job.postedDate).toLocaleDateString()}

          {job.deadline && ` · ${daysLeftLabel(job.deadline)}`}
        </p>

        <hr />

        <h2>Description</h2>

        <div
          className="long job-description"
          dangerouslySetInnerHTML={{
            __html: cleanedDescription,
          }}
        />

        <h2>Requirements</h2>

        <ul>
          {(job.requirements || []).map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>

        <h2>Skills</h2>

        <div className="skills">
          {(job.skills || []).map((skill, index) => (
            <span key={index}>{skill}</span>
          ))}
        </div>

        {message && <div className="success">{message}</div>}

        {user?.role === "applicant" &&
          (job.isExternal ? (
            <a
              className="btn"
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Apply on source
            </a>
          ) : (
            <button className="btn" onClick={apply}>
              Apply Now
            </button>
          ))}
      </div>
    </main>
  );
}