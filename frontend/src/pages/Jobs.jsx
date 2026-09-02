import React,{ useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function getApplicantProfile() {
  try {
    const storedProfile = localStorage.getItem("profile");

    if (!storedProfile) return null;

    return JSON.parse(storedProfile);
  } catch {
    return null;
  }
}

function normalizeArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).toLowerCase().trim());
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean);
  }

  return [];
}

function calculateMatchScore(job, profile) {
  if (!profile) return 0;

  let score = 0;

  const applicantSkills = normalizeArray(profile.skills);
  const jobSkills = normalizeArray(job.skills);

  const applicantLocation =
    profile.location?.toLowerCase()?.trim() || "";

  const jobLocation =
    job.location?.toLowerCase()?.trim() || "";

 

  if (applicantSkills.length && jobSkills.length) {
    const matchingSkills = applicantSkills.filter((skill) =>
      jobSkills.some(
        (jobSkill) =>
          jobSkill.includes(skill) ||
          skill.includes(jobSkill)
      )
    );

    const skillPercentage =
      matchingSkills.length / applicantSkills.length;

    score += Math.round(skillPercentage * 70);
  }


  if (
    applicantLocation &&
    jobLocation &&
    (jobLocation.includes(applicantLocation) ||
      applicantLocation.includes(jobLocation))
  ) {
    score += 20;
  }

 
  const preferredJobType =
    profile.preferredJobType?.toLowerCase()?.trim();

  const jobType =
    job.jobType?.toLowerCase()?.trim();

  if (
    preferredJobType &&
    jobType &&
    preferredJobType === jobType
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const user = getCurrentUser();
  const profile = getApplicantProfile();

  const isLoggedIn = Boolean(user);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/jobs`);

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load jobs."
      );
    } finally {
      setLoading(false);
    }
  }



  const filteredJobs = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    const locationText = locationFilter.toLowerCase().trim();

    return jobs.filter((job) => {
      const title =
        job.title?.toLowerCase() || "";

      const company =
        job.company?.toLowerCase() || "";

      const description =
        job.description?.toLowerCase() || "";

      const location =
        job.location?.toLowerCase() || "";

      const skills = normalizeArray(job.skills);

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        company.includes(searchText) ||
        description.includes(searchText) ||
        skills.some((skill) =>
          skill.includes(searchText)
        );

      const matchesLocation =
        !locationText ||
        location.includes(locationText);

      return matchesSearch && matchesLocation;
    });
  }, [jobs, search, locationFilter]);


  const sortedJobs = useMemo(() => {
    const jobsWithScore = filteredJobs.map((job) => ({
      ...job,
      matchScore: calculateMatchScore(job, profile),
    }));

   
    if (isLoggedIn && profile) {
      return jobsWithScore.sort(
        (a, b) => b.matchScore - a.matchScore
      );
    }

    // Guest:
    // simply show all jobs
    return jobsWithScore;
  }, [filteredJobs, profile, isLoggedIn]);

  const recommendedJobs = useMemo(() => {
    if (!isLoggedIn || !profile) return [];

    return sortedJobs.filter(
      (job) => job.matchScore >= 40
    );
  }, [sortedJobs, isLoggedIn, profile]);

  const otherJobs = useMemo(() => {
    if (!isLoggedIn || !profile) return sortedJobs;

    return sortedJobs.filter(
      (job) => job.matchScore < 40
    );
  }, [sortedJobs, isLoggedIn, profile]);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString();
  }

  function JobCard({ job }) {
    return (
      <div className="job-card">
        <div className="job-card-header">
          <div>
            <h3>{job.title}</h3>

            <p className="company">
              {job.company || "Company not specified"}
            </p>
          </div>

          {isLoggedIn &&
            profile &&
            job.matchScore > 0 && (
              <span className="match-score">
                {job.matchScore}% match
              </span>
            )}
        </div>

        <p>
          📍 {job.location || "Location not specified"}
        </p>

        {job.jobType && (
          <p>💼 {job.jobType}</p>
        )}

        {job.skills?.length > 0 && (
          <div className="skills">
            {job.skills.map((skill, index) => (
              <span key={index}>
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="job-footer">
          <small>
            Posted{" "}
            {formatDate(
              job.postedAt || job.createdAt
            )}
          </small>

          {job.source && (
            <small>
              Source: {job.source}
            </small>
          )}

          <Link
            to={`/jobs/${job._id}`}
            className="view-job"
          >
            View Job
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="jobs-page">
        <h1>Find Your Next Job</h1>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page">
        <h1>Find Your Next Job</h1>
        <p>{error}</p>

        <button onClick={fetchJobs}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="jobs-page">

      {/* Header */}

      <div className="jobs-header">
        <div>
          <h1>Find Your Next Job</h1>

          {!isLoggedIn ? (
            <p>
              Browse all available jobs.
              Create an account to get personalized
              recommendations.
            </p>
          ) : profile ? (
            <p>
              Jobs are personalized according to
              your profile.
            </p>
          ) : (
            <p>
              Create your applicant profile to get
              personalized job recommendations.
            </p>
          )}
        </div>
      </div>

    

      <div className="job-search">

        <input
          type="text"
          placeholder="Search jobs, skills or companies..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Location..."
          value={locationFilter}
          onChange={(e) =>
            setLocationFilter(e.target.value)
          }
        />

      </div>

    

      {!isLoggedIn && (
        <section>
          <div className="section-header">
            <h2>All Jobs</h2>
            <span>
              {sortedJobs.length} jobs
            </span>
          </div>

          {sortedJobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <div className="jobs-grid">
              {sortedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                />
              ))}
            </div>
          )}
        </section>
      )}



      {isLoggedIn && profile && (
        <>
          <section>
            <div className="section-header">
              <h2>Recommended Jobs</h2>

              <span>
                {recommendedJobs.length} matches
              </span>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="empty-state">
                <h3>
                  No strong matches yet
                </h3>

                <p>
                  We couldn't find jobs that strongly
                  match your current profile.
                  You can still browse all other jobs below.
                </p>
              </div>
            ) : (
              <div className="jobs-grid">
                {recommendedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="section-header">
              <h2>Other Available Jobs</h2>

              <span>
                {otherJobs.length} jobs
              </span>
            </div>

            {otherJobs.length === 0 ? (
              <p>No other jobs found.</p>
            ) : (
              <div className="jobs-grid">
                {otherJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      
      {isLoggedIn && !profile && (
        <section>
          <div className="profile-message">
            <h2>Create your profile</h2>

            <p>
              Complete your applicant profile to
              receive personalized job recommendations.
            </p>

            <Link
              to="/profile"
              className="create-profile"
            >
              Create Profile
            </Link>
          </div>

          <div className="section-header">
            <h2>All Available Jobs</h2>
          </div>

          <div className="jobs-grid">
            {sortedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
              />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .jobs-page {
          max-width: 1200px;
          margin: auto;
          padding: 30px 20px;
        }

        .jobs-header {
          margin-bottom: 25px;
        }

        .jobs-header h1 {
          margin-bottom: 8px;
        }

        .job-search {
          display: flex;
          gap: 12px;
          margin-bottom: 35px;
        }

        .job-search input {
          flex: 1;
          padding: 13px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
        }

        section {
          margin-bottom: 45px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fill, minmax(330px, 1fr));
          gap: 20px;
        }

        .job-card {
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 20px;
          background: white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.06);
        }

        .job-card-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .job-card h3 {
          margin: 0 0 6px;
        }

        .company {
          font-weight: 600;
        }

        .match-score {
          background: #fff3e8;
          color: #e66a00;
          padding: 6px 10px;
          border-radius: 20px;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 600;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 15px 0;
        }

        .skills span {
          background: #f3f3f3;
          padding: 5px 9px;
          border-radius: 15px;
          font-size: 12px;
        }

        .job-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .view-job,
        .create-profile {
          margin-left: auto;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 7px;
          background: #f97316;
          color: white;
        }

        .empty-state,
        .profile-message {
          padding: 25px;
          border-radius: 10px;
          background: #fff7ed;
          margin-bottom: 25px;
        }

        @media (max-width: 700px) {
          .job-search {
            flex-direction: column;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}