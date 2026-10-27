import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSession, signIn as requestSignIn, signInDemo, signOut as requestSignOut, signUp as requestSignUp, verifyTwoFactor } from "../../services/authApi";
import type { AuthSession } from "../../types";

export function useAuth() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((currentSession) => {
        if (active && currentSession) setSession(currentSession);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not restore your session.");
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
        navigate("/workspace");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const nextSession = await requestSignUp(name, email, password);
      setSession(nextSession);
      setChallenge(null);
      navigate("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const signInToDemo = async () => {
    setLoading(true);
    setError("");
    try {
      setSession(await signInDemo());
      setChallenge(null);
      navigate("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open demo.");
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
      navigate("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code.");
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

  const showOAuthPlaceholder = () => {
    setError("OAuth is a UI placeholder for now. The backend integration will be added next.");
  };

  return {
    session,
    loading,
    error,
    challenge,
    changeMode,
    signIn,
    signUp,
    signInToDemo,
    verify,
    signOut,
    showOAuthPlaceholder,
    clearError: () => setError(""),
  };
}
