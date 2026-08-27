import { Link } from "react-router-dom";
import { Search, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> Smart job discovery</span>
          <h1>Find work that fits <span>your future.</span></h1>
          <p>Search jobs from multiple permitted sources and discover opportunities matched to your skills, interests, experience and preferred location.</p>
          <div className="hero-search">
            <Link to="/jobs" className="btn"><Search size={18}/> Explore Jobs</Link>
            <Link to="/register" className="btn outline">Create Profile</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="mini-card"><RefreshCw/><div><b>Fresh listings</b><small>Automatic source synchronization</small></div></div>
          <div className="mini-card"><Sparkles/><div><b>Personalized matches</b><small>Skill and preference scoring</small></div></div>
          <div className="mini-card"><ShieldCheck/><div><b>Verified accounts</b><small>Role-based access</small></div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><span className="eyebrow">How it works</span><h2>One profile. Better opportunities.</h2></div></div>
        <div className="features">
          <div className="feature"><b>01</b><h3>Build your profile</h3><p>Add skills, experience, interests and job preferences.</p></div>
          <div className="feature"><b>02</b><h3>Discover jobs</h3><p>Search and filter listings collected from supported sources.</p></div>
          <div className="feature"><b>03</b><h3>Get matched</h3><p>See a transparent match score and why a job fits you.</p></div>
        </div>
      </section>
    </main>
  );
}
