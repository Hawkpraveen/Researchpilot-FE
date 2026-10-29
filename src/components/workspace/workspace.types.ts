import type { AuthSession, ResearchJob } from "../../types";
import type { FormEvent } from "react";

export type WorkspaceDialogState = { mode: "create" | "edit" | "delete"; workspace: string | null };

export interface WorkspaceSidebarProps {
  session: AuthSession;
  workspaceName: string;
  jobs: ResearchJob[];
  activeJob: ResearchJob | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onOpenJob: (job: ResearchJob) => void;
  onStartNew: () => void;
}

export interface WorkspaceLayoutProps {
  session: AuthSession;
  workspaceName: string;
  theme: "light" | "dark";
  jobs: ResearchJob[];
  activeJob: ResearchJob | null;
  loading: boolean;
  error: string;
  onToggleTheme: () => void;
  onSignOut: () => Promise<void>;
  onOpenJob: (job: ResearchJob) => void;
  onStartNew: () => void;
  onDismissError: () => void;
}

export interface ProfileMenuProps {
  session: AuthSession;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => Promise<void>;
}

export interface WorkspaceDialogProps {
  dialog: WorkspaceDialogState;
  error: string;
  name: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}
