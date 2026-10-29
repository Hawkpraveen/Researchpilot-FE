import { useState } from "react";
import type { FormEvent } from "react";
import type { AuthPageProps } from "./auth.types";

export function useAuthForm({ mode, onSignIn, onSignUp, onVerify, onModeChange }: Pick<AuthPageProps, "mode" | "onSignIn" | "onSignUp" | "onVerify" | "onModeChange">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupNotice, setSignupNotice] = useState("");
  const [signupNoticeIsError, setSignupNoticeIsError] = useState(false);

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSignIn(email.trim(), password);
  };

  const verify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onVerify(code);
  };

  const signup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setSignupNotice("Passwords do not match.");
      setSignupNoticeIsError(true);
      return;
    }
    await onSignUp(firstName.trim(), lastName.trim(), email.trim(), password);
    setSignupNotice("");
    setSignupNoticeIsError(false);
  };

  const startSignup = () => {
    setSignupNotice("");
    setSignupNoticeIsError(false);
    onModeChange("signup");
  };

  const backToSignIn = () => onModeChange("signin");
  const updateCode = (value: string) => setCode(value.replace(/\D/g, ""));

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    code,
    updateCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    confirmPassword,
    setConfirmPassword,
    signupNotice,
    signupNoticeIsError,
    signIn,
    verify,
    signup,
    startSignup,
    backToSignIn,
  };
}
