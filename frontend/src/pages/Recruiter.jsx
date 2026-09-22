import React, { useEffect, useState } from "react";
import { CheckCircle, LoaderCircle } from "lucide-react";
import api from "../api/axios.js";

const blank = {
  title: "",
  company: "",
  description: "",
  requirements: "",
  skills: "",
  location: "Kathmandu",
  jobType: "Full-time",
  workMode: "Hybrid",
  experienceLevel: "Entry level",
  salary: ""
};

export default function Recruiter() {
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  
  const [statusConfirmation, setStatusConfirmation] = useState(null);


  const [form, setForm] = useState(blank);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState("");

  async function load(isInitialLoad = false) {
    if (isInitialLoad) {
      setInitialLoading(true);
    }

    try {
      const [j, a] = await Promise.all([
        api.get("/jobs/mine"),
        api.get("/applications/recruiter")
      ]);

      setJobs(j.data);
      setApps(a.data);
    } catch (error) {
      console.error("Failed to load recruiter data:", error);

      if (isInitialLoad) {
        setMessage(
          error?.response?.data?.message ||
          "Failed to load recruiter data."
        );
      }
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      }
    }
  }

  useEffect(() => {
    load(true);
  }, []);

  
  async function create(e) {
    e.preventDefault();

    setPublishing(true);
    setMessage("");

    try {
      await api.post("/jobs", {
        ...form,

        requirements: form.requirements
          .split("\n")
          .map(item => item.trim())
          .filter(Boolean),

        skills: form.skills
          .split(",")
          .map(item => item.trim())
          .filter(Boolean)
      });

      setForm(blank);

      setMessage("Job published successfully.");

      await load();
    } catch (error) {
      console.error("Failed to publish job:", error);

      setMessage(
        error?.response?.data?.message ||
        "Failed to publish job. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  }

 
  function requestStatusUpdate(application, newStatus) {
    if (application.status === newStatus) {
      return;
    }

    setStatusConfirmation({
      id: application._id,
      applicantName: application.applicant?.name || "this applicant",
      oldStatus: application.status,
      newStatus
    });
  }

 
  async function confirmStatusUpdate() {
    if (!statusConfirmation) {
      return;
    }

    setUpdatingStatus(true);

    try {
      await api.patch(
        `/applications/${statusConfirmation.id}/status`,
        {
          status: statusConfirmation.newStatus
        }
      );

      await load();

      setStatusConfirmation(null);
    } catch (error) {
      console.error("Failed to update application status:", error);

      alert(
        error?.response?.data?.message ||
        "Failed to update application status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  
  if (initialLoading) {
    return (
      <main className="page">
        <div className="initial-loader">
          <LoaderCircle
            size={42}
            className="animate-spin"
          />

          <h2>Loading recruiter workspace...</h2>

          <p>
            Fetching your jobs and applications.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">

     
      <div className="page-heading">
        <div>
          <span className="eyebrow">Recruiter</span>
          <h1>Recruiter workspace</h1>
        </div>
      </div>

      <div className="two-col">

      
        <section className="detail-card">

          <h2>Post a job</h2>

          <p className="muted">
            Only recruiter-created jobs are manually published.
            External jobs are synchronized by source adapters.
          </p>

          <form onSubmit={create}>

           
            <label>
              Job title

              <input
                required
                value={form.title}
                onChange={e =>
                  setForm({
                    ...form,
                    title: e.target.value
                  })
                }
              />
            </label>

            
            <label>
              Company

              <input
                required
                value={form.company}
                onChange={e =>
                  setForm({
                    ...form,
                    company: e.target.value
                  })
                }
              />
            </label>

           
            <label>
              Description

              <textarea
                required
                value={form.description}
                onChange={e =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              />
            </label>

            
            <label>
              Requirements

              <small>one per line</small>

              <textarea
                value={form.requirements}
                onChange={e =>
                  setForm({
                    ...form,
                    requirements: e.target.value
                  })
                }
              />
            </label>

           
            <label>
              Skills

              <small>comma separated</small>

              <input
                value={form.skills}
                onChange={e =>
                  setForm({
                    ...form,
                    skills: e.target.value
                  })
                }
              />
            </label>

          
            <label>
              Location

              <input
                value={form.location}
                onChange={e =>
                  setForm({
                    ...form,
                    location: e.target.value
                  })
                }
              />
            </label>

            {/* Job type + Work mode */}
            <div className="form-row">

              <label>
                Type

                <select
                  value={form.jobType}
                  onChange={e =>
                    setForm({
                      ...form,
                      jobType: e.target.value
                    })
                  }
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                  <option>Freelance</option>
                </select>
              </label>

              <label>
                Mode

                <select
                  value={form.workMode}
                  onChange={e =>
                    setForm({
                      ...form,
                      workMode: e.target.value
                    })
                  }
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </label>

            </div>

            
            <label>
              Experience

              <select
                value={form.experienceLevel}
                onChange={e =>
                  setForm({
                    ...form,
                    experienceLevel: e.target.value
                  })
                }
              >
                <option>Internship</option>
                <option>Entry level</option>
                <option>1-2 years</option>
                <option>2-5 years</option>
                <option>5+ years</option>
              </select>
            </label>

            <button
              className="btn"
              type="submit"
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Publishing...
                </>
              ) : (
                "Publish Job"
              )}
            </button>

            
            {message && (
              <div className="success">
                {message}
              </div>
            )}

          </form>

        </section>

       
        <section>

          <h2>My jobs</h2>

          
          {jobs.map(j => (
            <div
              className="application"
              key={j._id}
            >
              <div>
                <b>{j.title}</b>

                <p>
                  {j.company} · {j.location}
                </p>
              </div>

              <span className="status">
                {j.isActive ? "Active" : "Closed"}
              </span>
            </div>
          ))}

          
          <h2 className="mt">
            Applications
          </h2>

          {apps.map(a => (
            <div
              className="application"
              key={a._id}
            >

              <div>
                <b>
                  {a.applicant?.name || "Unknown applicant"}
                </b>

                <p>
                  {a.job?.title || "Unknown job"} ·{" "}
                  {a.applicant?.email || "No email"}
                </p>
              </div>

              <select
                value={a.status}
                onChange={e =>
                  requestStatusUpdate(
                    a,
                    e.target.value
                  )
                }
                disabled={updatingStatus}
              >
                <option>Applied</option>
                <option>Viewed</option>
                <option>Shortlisted</option>
                <option>Interview</option>
                <option>Rejected</option>
                <option>Accepted</option>
              </select>

            </div>
          ))}

        </section>

      </div>

      
      {statusConfirmation && (

        <div className="modal-overlay">

          <div className="confirm-modal">

            <div className="confirm-icon">
              <CheckCircle size={24} />
            </div>

            <h2>
              Update application status?
            </h2>

            <p>
              Do you want to update{" "}
              <strong>
                {statusConfirmation.applicantName}
              </strong>
              's status from{" "}
              <strong>
                {statusConfirmation.oldStatus}
              </strong>{" "}
              to{" "}
              <strong>
                {statusConfirmation.newStatus}
              </strong>
              ?
            </p>

            <div className="confirm-actions">

              <button
                type="button"
                className="ghost"
                onClick={() =>
                  setStatusConfirmation(null)
                }
                disabled={updatingStatus}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn"
                onClick={confirmStatusUpdate}
                disabled={updatingStatus}
              >

                {updatingStatus ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={17} />

                    Update Status
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}