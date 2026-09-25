import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { resolveAvatarUrl } from "../utils/asset.js";
import TagInput from "../components/TagInput.jsx";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function Profile() {
  const { user, updateUser } = useAuth();

  const [mode, setMode] = useState("view"); 
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [privacyForm, setPrivacyForm] = useState({ profileVisibility: "public", showEmail: true, showPhone: false });
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState("");
  const [privacyError, setPrivacyError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setError("");
      const { data } = await api.get("/profile");
      setForm(data);
      setOriginalForm(data);
      setPrivacyForm({
        profileVisibility: data.privacy?.profileVisibility || "public",
        showEmail: data.privacy?.showEmail ?? true,
        showPhone: data.privacy?.showPhone ?? false,
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.response?.data?.message || "Could not load your profile. Please try again.");
    }
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updatePreference(key, value) {
    setForm((current) => ({
      ...current,
      preferences: { ...(current.preferences || {}), [key]: value },
    }));
  }

  function enterEditing() {
    setMessage("");
    setError("");
    setAvatarError("");
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enterSettings() {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage("");
    setPasswordError("");
    setPrivacyMessage("");
    setPrivacyError("");
    setMode("settings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToView() {
    setForm(originalForm);
    setMode("view");
    setMessage("");
    setError("");
    setAvatarError("");
  }

  async function save(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const { data } = await api.put("/profile", form);
      setForm(data);
      setOriginalForm(data);
      updateUser(data);
      setMode("view");
      setMessage("Profile updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Could not update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function openAvatarPicker() {
    setAvatarError("");
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError("");
    setMessage("");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Please select a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Profile picture must be smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((current) => ({ ...current, ...data }));
      setOriginalForm((current) => ({ ...current, ...data }));
      updateUser(data);
      setMessage("Profile picture updated successfully.");
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      setAvatarError(err.response?.data?.message || "Could not upload your profile picture.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function submitPasswordChange(e) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      await api.put("/profile/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Password updated successfully.");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function submitPrivacyChange(e) {
    e.preventDefault();
    setPrivacyMessage("");
    setPrivacyError("");

    try {
      setPrivacySaving(true);
      const { data } = await api.put("/profile/privacy", privacyForm);
      updateUser(data);
      setPrivacyMessage("Privacy settings saved.");
    } catch (err) {
      setPrivacyError(err.response?.data?.message || "Could not save privacy settings.");
    } finally {
      setPrivacySaving(false);
    }
  }

  function getInitials(name) {
    if (!name) return "?";
    return name.trim().split(" ").slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
  }

  function getRoleText() {
    if (form?.preferences?.desiredRoles?.length) return form.preferences.desiredRoles[0];
    return "Job Seeker";
  }

  function displayValue(value) {
    return value || "Not added yet";
  }

  if (!form) {
    return (
      <main className="page profile-page">
        <div className="profile-loading">
          {error ? <div className="alert error">{error}</div> : <p>Loading profile...</p>}
        </div>
      </main>
    );
  }

  const avatarUrl = resolveAvatarUrl(form.avatar || user?.avatar);

  const avatarInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ALLOWED_AVATAR_TYPES.join(",")}
      onChange={handleAvatarChange}
      hidden
    />
  );

  
  if (mode === "settings") {
    return (
      <main className="page profile-page">
        <div className="profile-edit-header">
          <h1>Settings</h1>
          <button type="button" className="profile-cancel-button" onClick={() => setMode("view")}>
            Back to Profile
          </button>
        </div>

        {passwordMessage && <div className="alert success">{passwordMessage}</div>}
        {passwordError && <div className="alert error">{passwordError}</div>}

        <section className="profile-edit-card">
          <div className="profile-edit-card-header"><h2>Change Password</h2></div>
          <form onSubmit={submitPasswordChange}>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </label>
              <label className="profile-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  minLength={6}
                  required
                />
              </label>
              <label className="profile-field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  minLength={6}
                  required
                />
              </label>
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="profile-save-button" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        {privacyMessage && <div className="alert success">{privacyMessage}</div>}
        {privacyError && <div className="alert error">{privacyError}</div>}

        <section className="profile-edit-card">
          <div className="profile-edit-card-header"><h2>Privacy Settings</h2></div>
          <form onSubmit={submitPrivacyChange}>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Profile Visibility</span>
                <select
                  value={privacyForm.profileVisibility}
                  onChange={(e) => setPrivacyForm((f) => ({ ...f, profileVisibility: e.target.value }))}
                >
                  <option value="public">Public — visible to recruiters</option>
                  <option value="private">Private — hidden from search</option>
                </select>
              </label>
              <label className="profile-field profile-toggle-field">
                <span>Show email on public profile</span>
                <input
                  type="checkbox"
                  checked={privacyForm.showEmail}
                  onChange={(e) => setPrivacyForm((f) => ({ ...f, showEmail: e.target.checked }))}
                />
              </label>
              <label className="profile-field profile-toggle-field">
                <span>Show phone on public profile</span>
                <input
                  type="checkbox"
                  checked={privacyForm.showPhone}
                  onChange={(e) => setPrivacyForm((f) => ({ ...f, showPhone: e.target.checked }))}
                />
              </label>
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="profile-save-button" disabled={privacySaving}>
                {privacySaving ? "Saving..." : "Save Privacy Settings"}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

 
  if (mode === "edit") {
    return (
      <main className="page profile-page">
        {avatarInput}
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        {avatarError && <div className="alert error">{avatarError}</div>}

        <form className="profile-edit-form" onSubmit={save}>
          <div className="profile-edit-header">
            <h1>Edit Profile</h1>
            <button type="button" className="profile-cancel-button" onClick={backToView}>Cancel</button>
          </div>

          <section className="profile-edit-card">
            <div className="profile-edit-card-header"><h2>Profile Photo</h2></div>
            <div className="profile-photo-edit-row">
              {avatarUrl ? (
                <img src={avatarUrl} alt={form.name || "Profile"} className="profile-avatar profile-avatar-edit" />
              ) : (
                <div className="profile-avatar profile-avatar-edit profile-avatar-fallback">{getInitials(form.name)}</div>
              )}
              <div className="profile-photo-actions">
                <button type="button" className="profile-upload-button" onClick={openAvatarPicker} disabled={avatarUploading}>
                  {avatarUploading ? "Uploading..." : "Change Photo"}
                </button>
                <span className="profile-photo-size">JPG, PNG, WEBP or GIF · Max 3 MB</span>
              </div>
            </div>
          </section>

          <section className="profile-edit-card">
            <div className="profile-edit-card-header"><h2>Basic Information</h2></div>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Name</span>
                <input type="text" value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" />
              </label>
              <label className="profile-field">
                <span>Location</span>
                <input type="text" value={form.location || ""} onChange={(e) => update("location", e.target.value)} placeholder="City, Country" />
              </label>
              <label className="profile-field">
                <span>Phone</span>
                <input type="text" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" />
              </label>
              <label className="profile-field">
                <span>Experience (years)</span>
                <input type="number" min="0" value={form.experienceYears ?? 0} onChange={(e) => update("experienceYears", Number(e.target.value))} />
              </label>
            </div>
            <label className="profile-field profile-field-full">
              <span>About</span>
              <textarea value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} rows={5} placeholder="Tell employers about yourself..." />
            </label>
          </section>

          <section className="profile-edit-card">
            <div className="profile-edit-card-header"><h2>Professional Information</h2></div>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Education</span>
                <input type="text" value={form.education || ""} onChange={(e) => update("education", e.target.value)} placeholder="e.g. B.Sc. CSIT" />
              </label>
              <TagInput label="Skills" values={form.skills || []} onChange={(v) => update("skills", v)} placeholder="Type a skill, press Enter or ," />
              <TagInput label="Interests" values={form.interests || []} onChange={(v) => update("interests", v)} placeholder="Type an interest, press Enter or ," />
            </div>
          </section>

          <section className="profile-edit-card">
            <div className="profile-edit-card-header"><h2>Job Preferences</h2></div>
            <div className="profile-form-grid">
              <TagInput label="Preferred Locations" values={form.preferences?.locations || []} onChange={(v) => updatePreference("locations", v)} placeholder="Kathmandu, Remote" />
              <TagInput label="Desired Roles" values={form.preferences?.desiredRoles || []} onChange={(v) => updatePreference("desiredRoles", v)} placeholder="Frontend Developer" />
              <TagInput label="Job Types" values={form.preferences?.jobTypes || []} onChange={(v) => updatePreference("jobTypes", v)} placeholder="Full-time, Internship" />
            </div>
          </section>

          <section className="profile-edit-card">
            <div className="profile-edit-card-header"><h2>Resume</h2></div>
            <label className="profile-field">
              <span>Resume URL</span>
              <input type="text" value={form.resumeUrl || ""} onChange={(e) => update("resumeUrl", e.target.value)} placeholder="https://..." />
            </label>
          </section>

          <div className="profile-form-actions">
            <button type="button" className="profile-cancel-button" onClick={backToView} disabled={saving}>Cancel</button>
            <button type="submit" className="profile-save-button" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="page profile-page">
      {avatarInput}
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {avatarError && <div className="alert error">{avatarError}</div>}

      <section className="profile-header-card">
        <div className="profile-cover"></div>

        <div className="profile-header-menu">
          <button
            type="button"
            className="profile-edit-icon"
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            title="Profile options"
            aria-label="Profile options"
          >
            ✎
          </button>
          {menuOpen && (
            <div className="profile-header-dropdown">
              <button type="button" onMouseDown={() => { enterEditing(); setMenuOpen(false); }}>Edit Profile</button>
              <button type="button" onMouseDown={() => { enterSettings(); setMenuOpen(false); }}>Settings</button>
            </div>
          )}
        </div>

        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt={form.name || "Profile"} className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar-fallback">{getInitials(form.name)}</div>
            )}
            <button
              type="button"
              className="profile-avatar-camera"
              onClick={openAvatarPicker}
              disabled={avatarUploading}
              title="Change photo"
              aria-label="Change photo"
            >
              {avatarUploading ? "…" : "📷"}
            </button>
          </div>

          <div className="profile-main-info">
            <h1 className="profile-name">{displayValue(form.name)}</h1>
            <p className="profile-location">{form.location || "Location not added"}</p>
            <p className="profile-role">
              {getRoleText()}
              {form.education && (<><span className="profile-separator">•</span>{form.education}</>)}
            </p>
            <div className="profile-meta">
              {form.email && <span>{form.email}</span>}
              {form.phone && <span>{form.phone}</span>}
            </div>
          </div>

          <div className="profile-header-side">
            <div className="profile-mini-section">
              <h3>Skills</h3>
              <div className="profile-tags">
                {form.skills?.length ? (
                  form.skills.map((skill, i) => <span className="profile-tag" key={`${skill}-${i}`}>{skill}</span>)
                ) : (
                  <span className="profile-empty">Not added yet</span>
                )}
              </div>
            </div>
            <div className="profile-mini-section">
              <h3>Interests</h3>
              <div className="profile-tags">
                {form.interests?.length ? (
                  form.interests.map((interest, i) => <span className="profile-tag" key={`${interest}-${i}`}>{interest}</span>)
                ) : (
                  <span className="profile-empty">Not added yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="profile-card profile-about-card">
          <div className="profile-card-header"><h2>About</h2><button type="button" className="profile-section-edit" onClick={enterEditing}>Edit</button></div>
          <p className="profile-about-text">{displayValue(form.bio)}</p>
        </section>

        <section className="profile-card">
          <div className="profile-card-header"><h2>Experience</h2><button type="button" className="profile-section-edit" onClick={enterEditing}>Edit</button></div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Years of Experience</span>
            <strong>{form.experienceYears ?? 0} yrs</strong>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-header"><h2>Education</h2><button type="button" className="profile-section-edit" onClick={enterEditing}>Edit</button></div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Education</span>
            <strong>{displayValue(form.education)}</strong>
          </div>
        </section>

        <section className="profile-card profile-full-card">
          <div className="profile-card-header"><h2>Job Preferences</h2><button type="button" className="profile-section-edit" onClick={enterEditing}>Edit</button></div>
          <div className="profile-preferences-grid">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Preferred Locations</span>
              <div className="profile-tags">
                {form.preferences?.locations?.length ? form.preferences.locations.map((l, i) => <span className="profile-tag" key={`${l}-${i}`}>{l}</span>) : <span className="profile-empty">Not added yet</span>}
              </div>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Desired Roles</span>
              <div className="profile-tags">
                {form.preferences?.desiredRoles?.length ? form.preferences.desiredRoles.map((r, i) => <span className="profile-tag" key={`${r}-${i}`}>{r}</span>) : <span className="profile-empty">Not added yet</span>}
              </div>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Job Types</span>
              <div className="profile-tags">
                {form.preferences?.jobTypes?.length ? form.preferences.jobTypes.map((t, i) => <span className="profile-tag" key={`${t}-${i}`}>{t}</span>) : <span className="profile-empty">Not added yet</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="profile-card profile-full-card">
          <div className="profile-card-header"><h2>Resume</h2><button type="button" className="profile-section-edit" onClick={enterEditing}>Edit</button></div>
          {form.resumeUrl ? (
            <a href={resolveAvatarUrl(form.resumeUrl)} target="_blank" rel="noreferrer" className="profile-resume-link">View Resume</a>
          ) : (
            <p className="profile-empty">No resume added yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;