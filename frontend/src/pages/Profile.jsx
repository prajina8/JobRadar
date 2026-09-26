import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { resolveAvatarUrl } from "../utils/asset.js";
import TagInput from "../components/TagInput.jsx";
import {
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Edit3,
  User,
  Award,
  FileText,
  Heart,
  Target,
  X,
  Check,
  ExternalLink,
  Upload,
  Trash2,
} from "lucide-react";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = ["application/pdf"];

function ProfileSection({ icon: Icon, title, children, className = "" }) {
  return (
    <section className={`profile-section-card ${className}`}>
      <div className="profile-section-header">
        <div className="profile-section-title">
          {Icon && <Icon size={18} strokeWidth={2.2} />}
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="profile-toggle-row">
      <div className="profile-toggle-info">
        <span className="profile-toggle-label">{label}</span>
        {description && <span className="profile-toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`profile-switch ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="profile-switch-thumb" />
      </button>
    </div>
  );
}

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

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

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

  function openResumePicker() {
    setResumeError("");
    if (resumeInputRef.current) resumeInputRef.current.click();
  }

  async function handleResumeChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeError("");

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Please select a PDF file.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setResumeUploading(true);
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await api.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((current) => ({ ...current, ...data }));
      setOriginalForm((current) => ({ ...current, ...data }));
      updateUser(data);
      setMessage("Resume uploaded successfully.");
    } catch (err) {
      console.error("Failed to upload resume:", err);
      setResumeError(err.response?.data?.message || "Could not upload your resume.");
    } finally {
      setResumeUploading(false);
      event.target.value = "";
    }
  }

  async function removeResume() {
    try {
      const { data } = await api.delete("/profile/resume");
      setForm((current) => ({ ...current, ...data }));
      setOriginalForm((current) => ({ ...current, ...data }));
      updateUser(data);
      setMessage("Resume removed.");
    } catch (err) {
      console.error("Failed to remove resume:", err);
      setResumeError(err.response?.data?.message || "Could not remove resume.");
    }
  }

  function getInitials(name) {
    if (!name) return "?";
    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
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
          {error ? (
            <div className="alert error">{error}</div>
          ) : (
            <div className="profile-loading-spinner" />
          )}
        </div>
      </main>
    );
  }

  const avatarUrl = resolveAvatarUrl(form.avatar || user?.avatar);

  const avatarInput = (
    <input ref={fileInputRef} type="file" accept={ALLOWED_AVATAR_TYPES.join(",")} onChange={handleAvatarChange} hidden />
  );

  const resumeInput = (
    <input ref={resumeInputRef} type="file" accept="application/pdf" onChange={handleResumeChange} hidden />
  );

  
  if (mode === "settings") {
    return (
      <main className="page profile-page">
        {avatarInput}
        {resumeInput}

      
        <div className="profile-page-header">
          <div className="profile-page-header-text">
            <h1>Account Settings</h1>
            <p>Manage your password and privacy preferences</p>
          </div>
          <button type="button" className="btn outline" onClick={() => setMode("view")}>
            <X size={16} /> Close
          </button>
        </div>

        {passwordMessage && <div className="alert success">{passwordMessage}</div>}
        {passwordError && <div className="alert error">{passwordError}</div>}

       
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <Lock size={18} strokeWidth={2.2} />
              <h2>Change Password</h2>
            </div>
          </div>
          <form onSubmit={submitPasswordChange} className="profile-settings-form">
            <label className="profile-field">
              <span>Current Password</span>
              <div className="profile-input-wrap">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                  placeholder="Enter current password"
                />
                <button type="button" className="profile-input-icon" onClick={() => setShowCurrentPw(!showCurrentPw)} aria-label="Toggle password visibility">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <div className="profile-form-row">
              <label className="profile-field">
                <span>New Password</span>
                <div className="profile-input-wrap">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                    minLength={6}
                    required
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" className="profile-input-icon" onClick={() => setShowNewPw(!showNewPw)} aria-label="Toggle password visibility">
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <label className="profile-field">
                <span>Confirm New Password</span>
                <div className="profile-input-wrap">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    minLength={6}
                    required
                    placeholder="Re-enter new password"
                  />
                  <button type="button" className="profile-input-icon" onClick={() => setShowConfirmPw(!showConfirmPw)} aria-label="Toggle password visibility">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="btn" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        {privacyMessage && <div className="alert success">{privacyMessage}</div>}
        {privacyError && <div className="alert error">{privacyError}</div>}

      
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <Eye size={18} strokeWidth={2.2} />
              <h2>Privacy Settings</h2>
            </div>
          </div>
          <form onSubmit={submitPrivacyChange}>
            <div className="profile-privacy-group">
              <h3 className="profile-privacy-group-title">Profile Visibility</h3>
              <div className="profile-visibility-options">
                <label className={`profile-visibility-option ${privacyForm.profileVisibility === "public" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="public"
                    checked={privacyForm.profileVisibility === "public"}
                    onChange={() => setPrivacyForm((f) => ({ ...f, profileVisibility: "public" }))}
                  />
                  <div className="profile-visibility-content">
                    <div className="profile-visibility-icon">
                      <Globe size={20} />
                    </div>
                    <div>
                      <strong>Public</strong>
                      <span>Visible to recruiters and other users</span>
                    </div>
                  </div>
                </label>
                <label className={`profile-visibility-option ${privacyForm.profileVisibility === "private" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="private"
                    checked={privacyForm.profileVisibility === "private"}
                    onChange={() => setPrivacyForm((f) => ({ ...f, profileVisibility: "private" }))}
                  />
                  <div className="profile-visibility-content">
                    <div className="profile-visibility-icon">
                      <Lock size={20} />
                    </div>
                    <div>
                      <strong>Private</strong>
                      <span>Hidden from search and recruiter views</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="profile-privacy-group">
              <h3 className="profile-privacy-group-title">Contact Information</h3>
              <Toggle
                checked={privacyForm.showEmail}
                onChange={(val) => setPrivacyForm((f) => ({ ...f, showEmail: val }))}
                label="Show email on public profile"
                description="Recruiters can see your email address"
              />
              <Toggle
                checked={privacyForm.showPhone}
                onChange={(val) => setPrivacyForm((f) => ({ ...f, showPhone: val }))}
                label="Show phone on public profile"
                description="Recruiters can see your phone number"
              />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn" disabled={privacySaving}>
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
        {resumeInput}
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        {avatarError && <div className="alert error">{avatarError}</div>}

        <form className="profile-edit-form" onSubmit={save}>
          <div className="profile-page-header">
            <div className="profile-page-header-text">
              <h1>Edit Profile</h1>
              <p>Update your personal and professional information</p>
            </div>
            <button type="button" className="btn outline" onClick={backToView}>
              <X size={16} /> Cancel
            </button>
          </div>

       
          <ProfileSection title="Profile Photo" icon={Camera}>
            <div className="profile-photo-edit-row">
              {avatarUrl ? (
                <img src={avatarUrl} alt={form.name || "Profile"} className="profile-avatar-lg" referrerPolicy="no-referrer" />
              ) : (
                <div className="profile-avatar-lg profile-avatar-fallback">{getInitials(form.name)}</div>
              )}
              <div className="profile-photo-actions">
                <button type="button" className="btn small outline" onClick={openAvatarPicker} disabled={avatarUploading}>
                  <Camera size={15} /> {avatarUploading ? "Uploading..." : "Change Photo"}
                </button>
                <span className="profile-photo-hint">JPG, PNG, WEBP or GIF · Max 3 MB</span>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Basic Information" icon={User}>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Full Name</span>
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
              <textarea value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} rows={4} placeholder="Tell employers about yourself..." />
            </label>
          </ProfileSection>

         
          <ProfileSection title="Professional Information" icon={Award}>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Education</span>
                <input type="text" value={form.education || ""} onChange={(e) => update("education", e.target.value)} placeholder="e.g. B.Sc. CSIT" />
              </label>
              <TagInput label="Skills" values={form.skills || []} onChange={(v) => update("skills", v)} placeholder="Type a skill, press Enter or ," />
              <TagInput label="Interests" values={form.interests || []} onChange={(v) => update("interests", v)} placeholder="Type an interest, press Enter or ," />
            </div>
          </ProfileSection>

          <ProfileSection title="Job Preferences" icon={Target}>
            <div className="profile-form-grid">
              <TagInput
                label="Preferred Locations"
                values={form.preferences?.locations || []}
                onChange={(v) => updatePreference("locations", v)}
                placeholder="Kathmandu, Remote"
              />
              <TagInput
                label="Desired Roles"
                values={form.preferences?.desiredRoles || []}
                onChange={(v) => updatePreference("desiredRoles", v)}
                placeholder="Frontend Developer"
              />
              <TagInput
                label="Job Types"
                values={form.preferences?.jobTypes || []}
                onChange={(v) => updatePreference("jobTypes", v)}
                placeholder="Full-time, Internship"
              />
            </div>
          </ProfileSection>

          
          <ProfileSection title="Resume / CV" icon={FileText}>
            <div className="profile-resume-upload">
              <div className="profile-resume-upload-row">
                <div className="profile-resume-upload-icon">
                  <FileText size={28} />
                </div>
                <div className="profile-resume-upload-info">
                  <strong>Upload your CV / Resume</strong>
                  <span>PDF files only · Max 5 MB</span>
                </div>
                <button type="button" className="btn small outline" onClick={openResumePicker} disabled={resumeUploading}>
                  <Upload size={15} /> {resumeUploading ? "Uploading..." : form.resumeUrl ? "Replace CV" : "Upload CV"}
                </button>
              </div>
              {form.resumeUrl && (
                <div className="profile-resume-current">
                  <FileText size={16} />
                  <span className="profile-resume-filename">{form.resumeUrl.split("/").pop()}</span>
                  <a href={resolveAvatarUrl(form.resumeUrl)} target="_blank" rel="noreferrer" className="profile-resume-view-link">
                    <ExternalLink size={13} /> Preview
                  </a>
                  <button type="button" className="profile-resume-remove" onClick={removeResume} title="Remove resume">
                    <X size={14} />
                  </button>
                </div>
              )}
              {resumeError && <div className="alert error">{resumeError}</div>}
            </div>
          </ProfileSection>

          <div className="profile-form-actions">
            <button type="button" className="btn outline" onClick={backToView} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              <Check size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="page profile-page">
      {avatarInput}
      {resumeInput}
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {avatarError && <div className="alert error">{avatarError}</div>}

      
      <section className="profile-hero-card">
       
        <div className="profile-cover">
          <div className="profile-cover-pattern" />
        </div>

        <div className="profile-hero-actions">
          <button type="button" className="profile-icon-btn" onClick={enterEditing} title="Edit profile" aria-label="Edit profile">
            <Edit3 size={17} />
          </button>
          <button type="button" className="profile-icon-btn profile-settings-btn" onClick={() => setMenuOpen((v) => !v)} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} aria-label="Profile options">
            <Settings size={18} />
          </button>
          {menuOpen && (
            <div className="profile-dropdown">
              <button
                type="button"
                onMouseDown={() => {
                  enterSettings();
                  setMenuOpen(false);
                }}
              >
                <Settings size={14} /> 
              </button>
            </div>
          )}
        </div>

        
        <div className="profile-hero-body">
         
          <div className="profile-avatar-col">
            <div className="profile-avatar-ring">
              {avatarUrl ? (
                <img src={avatarUrl} alt={form.name || "Profile"} className="profile-avatar-img" referrerPolicy="no-referrer" />
              ) : (
                <div className="profile-avatar-img profile-avatar-fallback">{getInitials(form.name)}</div>
              )}
              <button
                type="button"
                className="profile-avatar-camera"
                onClick={openAvatarPicker}
                disabled={avatarUploading}
                title="Change photo"
                aria-label="Change photo"
              >
                {avatarUploading ? (
                  <div className="profile-avatar-spinner" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
            </div>
          </div>

          
          <div className="profile-info-col">
            <div className="profile-name-row">
              <h1 className="profile-name">{displayValue(form.name)}</h1>
            </div>

            <div className="profile-qualification-row">
              <span className="profile-role-badge">
                <Briefcase size={13} /> {getRoleText()}
              </span>
              {form.education && (
                <span className="profile-edu-badge">
                  <GraduationCap size={13} /> {form.education}
                </span>
              )}
              {form.experienceYears > 0 && (
                <span className="profile-exp-badge">{form.experienceYears} yrs exp</span>
              )}
            </div>

            <div className="profile-contact-row">
              {form.location && (
                <span className="profile-contact-item">
                  <MapPin size={13} /> {form.location}
                </span>
              )}
              {form.email && (
                <span className="profile-contact-item">
                  <Mail size={13} /> {form.email}
                </span>
              )}
              {form.phone && (
                <span className="profile-contact-item">
                  <Phone size={13} /> {form.phone}
                </span>
              )}
            </div>

            <div className="profile-skills-row">
              <div className="profile-skill-group">
                <span className="profile-skill-label">Skills</span>
                <div className="profile-tags">
                  {form.skills?.length ? (
                    form.skills.slice(0, 8).map((skill, i) => (
                      <span className="profile-tag" key={`${skill}-${i}`}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="profile-empty">Not added yet</span>
                  )}
                  {form.skills?.length > 8 && <span className="profile-tag profile-tag-more">+{form.skills.length - 8}</span>}
                </div>
              </div>
              {form.interests?.length > 0 && (
                <div className="profile-skill-group">
                  <span className="profile-skill-label">
                    <Heart size={11} /> Interests
                  </span>
                  <div className="profile-tags">
                    {form.interests.slice(0, 5).map((interest, i) => (
                      <span className="profile-tag profile-tag-amber" key={`${interest}-${i}`}>
                        {interest}
                      </span>
                    ))}
                    {form.interests.length > 5 && <span className="profile-tag profile-tag-more">+{form.interests.length - 5}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

     
      <div className="profile-content-grid">
        <ProfileSection title="About" icon={User}>
          <p className="profile-about-text">{displayValue(form.bio)}</p>
        </ProfileSection>

        
        <ProfileSection title="Experience" icon={Briefcase}>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Years of Experience</span>
            <strong>{form.experienceYears ?? 0} yrs</strong>
          </div>
        </ProfileSection>

        
        <ProfileSection title="Education" icon={GraduationCap}>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Education</span>
            <strong>{displayValue(form.education)}</strong>
          </div>
        </ProfileSection>

        <ProfileSection title="Job Preferences" icon={Target} className="profile-full-card">
          <div className="profile-prefs-grid">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Preferred Locations</span>
              <div className="profile-tags">
                {form.preferences?.locations?.length ? (
                  form.preferences.locations.map((l, i) => (
                    <span className="profile-tag" key={`${l}-${i}`}>
                      {l}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">Not added yet</span>
                )}
              </div>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Desired Roles</span>
              <div className="profile-tags">
                {form.preferences?.desiredRoles?.length ? (
                  form.preferences.desiredRoles.map((r, i) => (
                    <span className="profile-tag" key={`${r}-${i}`}>
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">Not added yet</span>
                )}
              </div>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Job Types</span>
              <div className="profile-tags">
                {form.preferences?.jobTypes?.length ? (
                  form.preferences.jobTypes.map((t, i) => (
                    <span className="profile-tag" key={`${t}-${i}`}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="profile-empty">Not added yet</span>
                )}
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Resume / CV" icon={FileText} className="profile-full-card">
          {form.resumeUrl ? (
            <div className="profile-resume-view">
              <div className="profile-resume-file">
                <FileText size={20} />
                <span>{form.resumeUrl.split("/").pop() || "Resume.pdf"}</span>
              </div>
              <a href={resolveAvatarUrl(form.resumeUrl)} target="_blank" rel="noreferrer" className="profile-resume-link">
                <ExternalLink size={15} /> View Resume
              </a>
            </div>
          ) : (
            <p className="profile-empty">No resume added yet. Click the edit button to upload your CV.</p>
          )}
        </ProfileSection>
      </div>
    </main>
  );
}

export default Profile;