import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronDown, LogOut, Moon, Sun, UserRound } from "lucide-react";
import type { ProfileMenuProps } from "./workspace.types";
import { ProfileAvatar } from "./ProfileAvatar";

export function ProfileMenu({ session, theme, onToggleTheme, onSignOut }: ProfileMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = [session.user.first_name, session.user.last_name].filter(Boolean).join(" ") || session.user.email;
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <div className="profile-menu-wrap" ref={menuRef}>
    <button className={`profile-trigger ${open ? "profile-trigger-open" : ""}`} type="button" aria-label={`Open ${displayName} profile menu`} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <ProfileAvatar url={session.user.profile_url} initials={initials} className="top-avatar" /><span className="profile-trigger-name">{displayName}</span><ChevronDown size={14} />
    </button>
    {open && <div className="profile-menu" role="menu" aria-label="Profile menu">
      <div className="profile-menu-identity"><ProfileAvatar url={session.user.profile_url} initials={initials} className="profile-menu-avatar" /><span><strong>{displayName}</strong><small>{session.user.email}</small></span></div>
      <div className="menu-divider" />
      <button className="profile-menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/workspace/profile"); }}><UserRound size={16} /><span>Profile settings</span></button>
      <button className="profile-menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/workspace/settings"); }}><Building2 size={16} /><span>Workspace settings</span></button>
      <button className="profile-menu-item" role="menuitem" onClick={onToggleTheme}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>Switch to {theme === "light" ? "dark" : "light"} theme</span></button>
      <div className="menu-divider" />
      <button className="profile-menu-item profile-menu-signout" role="menuitem" onClick={() => { setOpen(false); void onSignOut(); }}><LogOut size={16} /><span>Sign out</span></button>
    </div>}
  </div>;
}
