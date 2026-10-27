import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { WorkspaceDialogState } from "./workspace.types";

export function useWorkspaceManager() {
  const [workspaces, setWorkspaces] = useState(["Personal workspace"]);
  const [activeWorkspace, setActiveWorkspace] = useState("Personal workspace");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<WorkspaceDialogState | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDialog(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openDialog = (mode: WorkspaceDialogState["mode"], workspace: string | null = null) => {
    setName(mode === "edit" ? workspace ?? "" : "");
    setError("");
    setDialog({ mode, workspace });
    setMenuOpen(false);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError("Enter a workspace name.");
      return;
    }
    const currentName = dialog?.mode === "edit" ? dialog.workspace : null;
    if (workspaces.some((workspace) => workspace !== currentName && workspace.toLowerCase() === nextName.toLowerCase())) {
      setError("A workspace with that name already exists.");
      return;
    }
    if (currentName) {
      setWorkspaces((current) => current.map((workspace) => workspace === currentName ? nextName : workspace));
      if (activeWorkspace === currentName) setActiveWorkspace(nextName);
    } else {
      setWorkspaces((current) => [...current, nextName]);
      setActiveWorkspace(nextName);
    }
    setDialog(null);
    setError("");
  };

  const remove = () => {
    const workspace = dialog?.mode === "delete" ? dialog.workspace : null;
    if (!workspace || workspaces.length <= 1) return;
    const remaining = workspaces.filter((item) => item !== workspace);
    setWorkspaces(remaining);
    if (activeWorkspace === workspace) setActiveWorkspace(remaining[0]);
    setDialog(null);
    setError("");
  };

  const closeDialog = () => setDialog(null);

  return {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    menuOpen,
    setMenuOpen,
    dialog,
    name,
    setName,
    error,
    setError,
    menuRef,
    openDialog,
    save,
    remove,
    closeDialog,
  };
}
