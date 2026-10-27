import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Moon, Sun, UserRound } from "lucide-react";
import type { ProfileMenuProps } from "./workspace.types";

export function ProfileMenu({ session, theme, onToggleTheme, onSignOut }: ProfileMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = session.user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

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
    <button className={`profile-trigger ${open ? "profile-trigger-open" : ""}`} type="button" aria-label={`Open ${session.user.name} profile menu`} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="top-avatar">{initials}</span><span className="profile-trigger-name">{session.user.name}</span><ChevronDown size={14} />
    </button>
    {open && <div className="profile-menu" role="menu" aria-label="Profile menu">
      <div className="profile-menu-identity"><span className="profile-menu-avatar">{initials}</span><span><strong>{session.user.name}</strong><small>{session.user.email}</small></span></div>
      <div className="menu-divider" />
      <button className="profile-menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/workspace/settings"); }}><UserRound size={16} /><span>Workspace settings</span></button>
      <button className="profile-menu-item" role="menuitem" onClick={onToggleTheme}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>Switch to {theme === "light" ? "dark" : "light"} theme</span></button>
      <div className="menu-divider" />
      <button className="profile-menu-item profile-menu-signout" role="menuitem" onClick={() => { setOpen(false); void onSignOut(); }}><LogOut size={16} /><span>Sign out</span></button>
    </div>}
  </div>;
}
