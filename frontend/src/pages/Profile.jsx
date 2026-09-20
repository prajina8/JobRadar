import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { resolveAvatarUrl } from "../utils/asset.js";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { api.get("/profile").then(r => setForm(r.data)); }, []);
  if (!form) return <main className="page">Loading profile...</main>;

  const update = (key, value) => setForm(f => ({...f, [key]: value}));
  async function save(e) {
    e.preventDefault();
    const { data } = await api.put("/profile", form);
    setForm(data);
    updateUser(data);
    setMessage("Profile updated.");
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setAvatarError("");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be smaller than 3MB.");
      return;
    }

    const body = new FormData();
    body.append("avatar", file);

    setAvatarUploading(true);
    try {
      const { data } = await api.post("/profile/avatar", body);
      setForm(data);
      updateUser(data);
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Could not upload image.");
    } finally {
      setAvatarUploading(false);
    }
  }

  return <main className="page narrow">
    <div className="detail-card"><span className="eyebrow">Your profile</span><h1>Build your career profile</h1>

      <div className="avatar-row">
        <div className="avatar-preview">
          {form.avatar
            ? <img src={resolveAvatarUrl(form.avatar)} alt="Profile" />
            : <span className="avatar-fallback">{(form.name || "?").charAt(0).toUpperCase()}</span>}
        </div>
        <div>
          <button
            type="button"
            className="btn outline small"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading..." : form.avatar ? "Change photo" : "Add photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            hidden
          />
          <p className="muted avatar-hint">JPG, PNG, WEBP or GIF, up to 3MB.</p>
          {avatarError && <div className="error">{avatarError}</div>}
        </div>
      </div>

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