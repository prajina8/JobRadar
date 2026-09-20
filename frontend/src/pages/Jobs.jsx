import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const JOBS_PAGE_SIZE = 24;

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
  const preferredLocations = normalizeArray(profile.preferences?.locations);

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

    score += Math.round(skillPercentage * 55);
  }

  const locationIsAMatch =
    (applicantLocation &&
      jobLocation &&
      (jobLocation.includes(applicantLocation) ||
        applicantLocation.includes(jobLocation))) ||
    preferredLocations.some((loc) => jobLocation.includes(loc)) ||
    job.workMode === "Remote";

  if (locationIsAMatch) {
    score += 15;
  }

 
  const preferredJobTypes = normalizeArray(profile.preferences?.jobTypes);
  const jobType = job.jobType?.toLowerCase()?.trim();

  if (jobType && preferredJobTypes.includes(jobType)) {
    score += 15;
  }

  const interestsAndRoles = [
    ...normalizeArray(profile.interests),
    ...normalizeArray(profile.preferences?.desiredRoles)
  ];
  const title = job.title?.toLowerCase() || "";

  if (interestsAndRoles.some((term) => term && title.includes(term))) {
    score += 15;
  }

  return Math.min(score, 100);
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [profile, setProfile] = useState(null);

  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    setJobs([]);
    setPage(1);
    fetchJobs(1, false);
  }, []);

 
  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null);
      return;
    }
    api.get("/profile").then((res) => setProfile(res.data)).catch(() => setProfile(null));
  }, [isLoggedIn]);

  async function fetchJobs(pageToLoad, append) {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");

      const response = await api.get("/jobs", {
        params: { page: pageToLoad, limit: JOBS_PAGE_SIZE }
      });

      const { jobs: newJobs = [], page: currentPage = pageToLoad, pages = 1, total = 0 } = response.data;

      setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
      setPage(currentPage);
      setHasMore(currentPage < pages);
      setTotalJobs(total);
    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load jobs."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function loadMore() {
    fetchJobs(page + 1, true);
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
  }, 
  [jobs, search, locationFilter]);

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

        <button onClick={() => fetchJobs(1, false)}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="jobs-page">

     

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

      {!search && !locationFilter && hasMore && (
        <div className="load-more-wrap">
          <button
            className="load-more"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : `Load more jobs (${jobs.length} of ${totalJobs})`}
          </button>
        </div>
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

        .load-more-wrap {
          display: flex;
          justify-content: center;
          margin: 10px 0 40px;
        }

        .load-more {
          padding: 12px 22px;
          border-radius: 8px;
          border: 1px solid #f97316;
          background: white;
          color: #f97316;
          font-weight: 600;
        }

        .load-more:hover:not(:disabled) {
          background: #fff3e8;
        }

        .load-more:disabled {
          opacity: 0.6;
          cursor: default;
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
