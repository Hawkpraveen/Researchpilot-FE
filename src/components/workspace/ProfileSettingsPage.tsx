import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import type { AuthSession } from "../../types";
import { ProfileAvatar } from "./ProfileAvatar";

async function prepareProfilePicture(file: File): Promise<Blob> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choose a PNG, JPEG, or WebP image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const image = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the image.");
    const cropSize = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - cropSize) / 2, (image.height - cropSize) / 2, cropSize, cropSize, 0, 0, 256, 256);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) throw new Error("This browser could not prepare the image.");
    if (blob.size > 512 * 1024) throw new Error("Could not compress the image below 512 KB. Choose a smaller picture.");
    return blob;
  } finally {
    image.close();
  }
}

export function ProfileSettingsPage({
  session,
  onSave,
  onUploadPicture,
  onDeletePicture,
}: {
  session: AuthSession;
  onSave: (firstName: string, lastName: string) => Promise<void>;
  onUploadPicture: (file: Blob) => Promise<void>;
  onDeletePicture: () => Promise<void>;
}) {
  const { user } = session;
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [pictureNotice, setPictureNotice] = useState("");
  const [pictureSaving, setPictureSaving] = useState(false);
  const pictureInput = useRef<HTMLInputElement>(null);
  const initials = [firstName, lastName].filter(Boolean).map((part) => part[0]).join("").toUpperCase() || user.email[0].toUpperCase();

  useEffect(() => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
  }, [user.first_name, user.last_name]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await onSave(firstName, lastName);
      setNotice("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPicture = async (file: File | undefined) => {
    if (!file) return;
    setPictureSaving(true);
    setPictureError("");
    setPictureNotice("");
    try {
      await onUploadPicture(await prepareProfilePicture(file));
      setPictureNotice("Profile picture updated.");
    } catch (uploadError) {
      setPictureError(uploadError instanceof Error ? uploadError.message : "Could not update your profile picture.");
    } finally {
      setPictureSaving(false);
      if (pictureInput.current) pictureInput.current.value = "";
    }
  };

  const deletePicture = async () => {
    setPictureSaving(true);
    setPictureError("");
    setPictureNotice("");
    try {
      await onDeletePicture();
      setPictureNotice("Profile picture removed.");
    } catch (deleteError) {
      setPictureError(deleteError instanceof Error ? deleteError.message : "Could not remove your profile picture.");
    } finally {
      setPictureSaving(false);
    }
  };

  return <div className="profile-settings-page">
    <div className="profile-settings-heading"><span className="eyebrow"><UserRound size={14} /> ACCOUNT</span><h1>Profile settings</h1><p>Keep your profile up to date so your workspace feels like yours.</p></div>
    <section className="form-card surface-card profile-settings-card">
      <div className="profile-card-heading"><div><span className="profile-section-kicker">PERSONAL DETAILS</span><h2>Make it yours</h2></div><span className="profile-card-caption">Changes apply across your workspace</span></div>
      <div className="profile-settings-identity">
        <ProfileAvatar url={user.profile_url} initials={initials} className="profile-settings-avatar" />
        <div><h2>{[user.first_name, user.last_name].filter(Boolean).join(" ") || user.email}</h2><p>{user.email}</p></div>
        {user.auth_type === "google" && <span className="profile-provider-badge"><Check size={13} /> Google account</span>}
      </div>
      <div className="profile-picture-actions">
        <input ref={pictureInput} className="profile-picture-input" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose profile picture" onChange={(event) => void uploadPicture(event.target.files?.[0])} />
        <button className="secondary-button" type="button" disabled={pictureSaving} onClick={() => pictureInput.current?.click()}>{pictureSaving ? <><LoaderCircle size={14} className="spin" /> Updating…</> : "Upload or replace picture"}</button>
        {user.profile_url && <button className="profile-picture-delete" type="button" disabled={pictureSaving} onClick={() => void deletePicture()}>Remove picture</button>}
        <span className="profile-picture-hint">Square crop · PNG, JPEG, or WebP · max 10 MB before compression</span>
      </div>
      {pictureError && <p className="profile-form-message error" role="alert">{pictureError}</p>}
      {pictureNotice && <p className="profile-form-message success" role="status">{pictureNotice}</p>}
      <form className="profile-settings-form" onSubmit={submit}>
        <div className="settings-fields grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="field-label" htmlFor="profile-first-name">First name<input id="profile-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} maxLength={100} autoComplete="given-name" required /></label>
          <label className="field-label" htmlFor="profile-last-name">Last name<input id="profile-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={50} autoComplete="family-name" required /></label>
        </div>
        <div className="profile-email-field"><label className="field-label" htmlFor="profile-email">Email address<input id="profile-email" value={user.email} readOnly aria-readonly="true" /></label><span className="profile-managed-tag">Managed</span></div>
        <div className="profile-security-note"><ShieldCheck size={15} /><span>Email and sign-in provider are managed by your account. Workspace name can be edited in Workspace settings.</span></div>
        {error && <p className="profile-form-message error" role="alert">{error}</p>}
        {notice && <p className="profile-form-message success" role="status">{notice}</p>}
        <div className="profile-settings-actions"><button className="primary-button" type="submit" disabled={saving || !firstName.trim() || !lastName.trim()}>{saving ? <><LoaderCircle size={15} className="spin" /> Saving…</> : <><Check size={15} /> Save profile</>}</button></div>
      </form>
    </section>
  </div>;
}
