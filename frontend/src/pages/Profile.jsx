import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { api.get("/profile").then(r => setForm(r.data)); }, []);
  if (!form) return <main className="page">Loading profile...</main>;

  const update = (key, value) => setForm(f => ({...f, [key]: value}));
  async function save(e) {
    e.preventDefault();
    const { data } = await api.put("/profile", form);
    setForm(data);
    localStorage.setItem("smartjob_user", JSON.stringify(data));
    setMessage("Profile updated.");
  }

  return <main className="page narrow">
    <div className="detail-card"><span className="eyebrow">Your profile</span><h1>Build your career profile</h1>
      <form onSubmit={save}>
        <label>Name<input value={form.name || ""} onChange={e=>update("name",e.target.value)}/></label>
        <label>Location<input value={form.location || ""} onChange={e=>update("location",e.target.value)} placeholder="Kathmandu"/></label>
        <label>Bio<textarea value={form.bio || ""} onChange={e=>update("bio",e.target.value)} /></label>
        <label>Skills <small>comma separated</small><input value={(form.skills || []).join(", ")} onChange={e=>update("skills",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/></label>
        <label>Interests <small>comma separated</small><input value={(form.interests || []).join(", ")} onChange={e=>update("interests",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/></label>
        <label>Experience (years)<input type="number" min="0" value={form.experienceYears ?? 0} onChange={e=>update("experienceYears",Number(e.target.value))}/></label>
        <label>Education<input value={form.education || ""} onChange={e=>update("education",e.target.value)}/></label>
        <label>Preferred locations <small>comma separated</small><input value={(form.preferences?.locations || []).join(", ")} onChange={e=>update("preferences",{...form.preferences,locations:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label>
        <label>Desired roles <small>comma separated</small><input value={(form.preferences?.desiredRoles || []).join(", ")} onChange={e=>update("preferences",{...form.preferences,desiredRoles:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label>
        <label>Job types <small>comma separated</small><input value={(form.preferences?.jobTypes || []).join(", ")} onChange={e=>update("preferences",{...form.preferences,jobTypes:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label>
        <label>Resume URL<input value={form.resumeUrl || ""} onChange={e=>update("resumeUrl",e.target.value)} placeholder="Add a hosted resume URL"/></label>
        {message && <div className="success">{message}</div>}
        <button className="btn">Save profile</button>
      </form>
    </div>
  </main>;
}
