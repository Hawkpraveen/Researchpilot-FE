import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfilePicture as requestDeleteProfilePicture, getCurrentSession, signIn as requestSignIn, signInWithOAuth, signOut as requestSignOut, signUp as requestSignUp, updateProfile as requestUpdateProfile, uploadProfilePicture as requestUploadProfilePicture, verifyTwoFactor } from "../../services/authApi";
import { ApiError } from "../../services/authApi";
import type { AuthSession } from "../../types";

export function useAuth() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState<AuthSession | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((currentSession) => {
        if (active && currentSession) setSession(currentSession);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not restore your session.");
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeMode = (mode: "signin" | "signup") => {
    setError("");
    navigate(mode === "signup" ? "/signup" : "/login");
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const nextSession = await requestSignIn(email, password);
      if (nextSession.requiresTwoFactor) {
        setChallenge(nextSession);
        navigate("/verify");
      } else {
        setSession(nextSession);
        setChallenge(null);
        showToast("Signed in successfully.", "success");
        navigate("/workspace");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sign in.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const nextSession = await requestSignUp(firstName, lastName, email, password);
      setSession(nextSession);
      setChallenge(null);
      showToast("Your workspace and account are ready.", "success");
      navigate("/workspace");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create your account.";
      if (err instanceof ApiError && err.code === "EMAIL_ALREADY_REGISTERED") {
        setError("");
        showToast("This email is already registered. Please sign in.", "error");
        navigate("/login");
      } else {
        setError(message);
        showToast(message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code: string) => {
    if (!challenge?.challengeId) {
      setError("Your verification session has expired. Please sign in again.");
      setChallenge(null);
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setSession(await verifyTwoFactor(challenge.challengeId, code));
      setChallenge(null);
      showToast("Verification complete.", "success");
      navigate("/workspace");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not verify code.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError("");
    try {
      await requestSignOut();
    } catch (err: unknown) {
      console.error("Could not revoke the signed-out session", err);
    } finally {
      setSession(null);
      setChallenge(null);
      navigate("/login");
    }
  };

  const oauthSignIn = async (provider: "google" | "microsoft", idToken: string) => {
    setLoading(true);
    setError("");
    try {
      const nextSession = await signInWithOAuth(provider, idToken);
      setSession(nextSession);
      setChallenge(null);
      showToast("Signed in successfully.", "success");
      navigate("/workspace");
    } catch (err) {
      const message = err instanceof Error ? err.message : `Could not sign in with ${provider === "google" ? "Google" : "Microsoft"}.`;
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    const user = await requestUpdateProfile(firstName, lastName);
    setSession((current) => current ? { ...current, user } : current);
  };

  const updateProfilePicture = async (file: Blob) => {
    const user = await requestUploadProfilePicture(file);
    setSession((current) => current ? { ...current, user } : current);
  };

  const removeProfilePicture = async () => {
    const user = await requestDeleteProfilePicture();
    setSession((current) => current ? { ...current, user } : current);
  };

  return {
    session,
    initializing,
    loading,
    error,
    challenge,
    toast,
    changeMode,
    signIn,
    signUp,
    verify,
    signOut,
    oauthSignIn,
    updateProfile,
    updateProfilePicture,
    removeProfilePicture,
    clearError: () => setError(""),
    dismissToast: () => setToast(null),
  };
}
