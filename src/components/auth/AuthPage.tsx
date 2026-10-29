import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, LoaderCircle, Moon, ShieldCheck, Sparkles, Sun } from "lucide-react";
import type { AuthPageProps } from "./auth.types";
import { useAuthForm } from "./useAuthForm";
import { OAuthButtons } from "./OAuthButtons";

export function AuthView({ mode, theme, onThemeChange, onModeChange, loading, error, challenge, onSignIn, onSignUp, onVerify, onOAuth }: AuthPageProps) {
  const {
    email, setEmail, password, setPassword, code, updateCode,
    firstName, setFirstName, lastName, setLastName, confirmPassword, setConfirmPassword, signupNotice, signupNoticeIsError,
    signIn, verify, signup, startSignup, backToSignIn,
  } = useAuthForm({ mode, onSignIn, onSignUp, onVerify, onModeChange });
  const brand = <div className="auth-brand"><span className="brand-mark"><Sparkles size={19} /></span><div><strong>ResearchPilot</strong><small>Evidence-first decisions</small></div><button className="theme-toggle" type="button" onClick={onThemeChange} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button></div>;

  if (mode === "signup" && !challenge) return <main className={`auth-${theme} relative grid min-h-dvh place-items-center overflow-hidden px-3 py-2 sm:px-6 sm:py-8 ${theme === "dark" ? "bg-[#090e1b] text-[#edf2ff]" : "bg-[#f4f5fb] text-[#20283a]"}`}>
    <div className="pointer-events-none absolute -left-40 -top-48 size-[520px] rounded-full bg-[#dcd8ff]/65 blur-3xl [.auth-dark_&]:bg-[#322c78]/25" />
    <section className="relative grid w-full max-w-[980px] overflow-hidden rounded-2xl border border-[#e4e7f0] bg-white shadow-[0_30px_100px_-42px_rgba(34,39,78,0.3)] [.auth-dark_&]:border-[#252f46] [.auth-dark_&]:bg-[#101829] sm:rounded-[24px] lg:min-h-[650px] lg:grid-cols-[1fr_0.85fr]">
      <div className="flex items-center gap-2.5 border-b border-[#eceef3] px-4 py-3 sm:px-7 sm:py-4 [.auth-dark_&]:border-[#29354b]">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#7c73f2] to-[#544bd0] text-white"><Sparkles size={17} /></span>
        <span className="flex flex-col"><strong className="text-[12px] font-extrabold tracking-tight">ResearchPilot</strong><small className="text-[12px] text-[#7d8799] [.auth-dark_&]:text-[#a6b2c8]">Research workspace</small></span>
        <button className="ml-auto hidden rounded-lg px-2 py-2 text-[12px] font-bold text-[#5d53ca] max-[360px]:inline-flex [.auth-dark_&]:text-[#b4adff]" type="button" onClick={backToSignIn}>Sign in</button>
        <button className="grid size-9 place-items-center rounded-lg border border-[#e0e3ef] bg-[#f7f8fc] text-[#4d5a74] [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#182238] [.auth-dark_&]:text-[#edf2ff]" type="button" onClick={onThemeChange} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
      </div>
      <section className="min-w-0 px-3 py-3 sm:px-8 sm:py-6 lg:col-start-1 lg:row-start-2 lg:px-12 lg:py-8">
        <button className="mb-3 hidden items-center gap-1.5 rounded-lg py-1 text-[12px] font-semibold text-[#6259d1] hover:text-[#4037b5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7168df] sm:inline-flex" type="button" onClick={backToSignIn}><ArrowLeft size={15} /> Back to sign in</button>
        <div className="mb-4">
          <div className="mb-2 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.1px] text-[#6c63d7]"><Sparkles size={14} /> CREATE YOUR ACCOUNT</div>
          <h1 className="font-[Manrope] text-[25px] font-extrabold leading-tight tracking-[-0.8px] sm:text-[30px]">Create your workspace.</h1>
          <p className="mt-1.5 hidden text-[12px] leading-relaxed text-[#7d8799] [.auth-dark_&]:text-[#a6b2c8] sm:block">Start with a personal workspace for evidence-backed decisions.</p>
        </div>
        <form className="flex flex-col gap-2 sm:gap-3" onSubmit={signup}>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="signup-first-name">First name<input className="h-10 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none placeholder:text-[#aab2c0] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] sm:h-11" id="signup-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" autoComplete="given-name" required /></label>
            <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="signup-last-name">Last name<input className="h-10 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none placeholder:text-[#aab2c0] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] sm:h-11" id="signup-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" autoComplete="family-name" required /></label>
          </div>
          <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="signup-email">Work email<input className="h-10 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none placeholder:text-[#aab2c0] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] sm:h-11" id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></label>
          <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="signup-password">Password<input className="h-10 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none placeholder:text-[#aab2c0] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] sm:h-11" id="signup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" autoComplete="new-password" minLength={8} required /></label>
          <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="signup-confirm">Confirm password<input className="h-10 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none placeholder:text-[#aab2c0] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] sm:h-11" id="signup-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" minLength={8} required /></label>
          <button className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d53ca] to-[#7568dd] px-4 text-[12px] font-bold text-white shadow-[0_8px_20px_-8px_#5d53caaa] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7568dd]/25 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={15} className="spin" /> Creating account…</> : <>Create account <ArrowRight size={15} /></>}</button>
        </form>
        {error && <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#f3cdd1] bg-[#fff3f4] px-3 py-2.5 text-[12px] text-[#b34d57] [.auth-dark_&]:border-[#633743] [.auth-dark_&]:bg-[#3a202b] [.auth-dark_&]:text-[#ff9fa8]"><AlertCircle size={15} /> {error}</div>}
        {signupNotice && <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px] leading-relaxed ${signupNoticeIsError ? "bg-[#fff3f4] text-[#b34d57] [.auth-dark_&]:bg-[#3a202b] [.auth-dark_&]:text-[#ff9fa8]" : "bg-[#eaf8f1] text-[#16815c] [.auth-dark_&]:bg-[#143328] [.auth-dark_&]:text-[#70d5ac]"}`}>{signupNoticeIsError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />} {signupNotice}</div>}
        <p className="mt-3 text-center text-[12px] leading-relaxed text-[#929aa7] [.auth-dark_&]:text-[#a6b2c8] max-[360px]:hidden">Already have an account? <button className="font-bold text-[#5d53ca] [.auth-dark_&]:text-[#b4adff]" type="button" onClick={backToSignIn}>Sign in</button></p>
      </section>
      <aside className="hidden flex-col justify-center border-l border-[#eceef3] bg-gradient-to-br from-[#f7f8ff] to-[#f1f5fb] p-10 lg:col-start-2 lg:row-span-2 lg:flex [.auth-dark_&]:border-[#29354b] [.auth-dark_&]:from-[#151f38] [.auth-dark_&]:to-[#111a2e]">
        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#eeecff] text-[#655cd4] [.auth-dark_&]:bg-[#28264c] [.auth-dark_&]:text-[#d9d5ff]"><ShieldCheck size={22} /></div>
        <h2 className="font-[Manrope] text-[23px] font-extrabold leading-tight">Research you can trust starts with a clear workspace.</h2>
        <p className="mt-3 text-[12px] leading-relaxed text-[#718099] [.auth-dark_&]:text-[#a6b2c8]">Bring questions, sources, and decisions together. Keep evidence visible and your research organized.</p>
      </aside>
    </section>
  </main>;

  if (challenge) return <div className={`auth-shell auth-${theme}`}><div className="auth-glow" /><div className="auth-card auth-entry-card auth-challenge-card">
    {brand}
    <form className="auth-form auth-challenge-form" onSubmit={verify}>
      <div className="auth-heading"><div className="two-factor-icon"><KeyRound size={21} /></div><h1>Verify your identity.</h1><p>Enter the 6-digit code from your authenticator app to continue as super admin.</p></div>
      <label className="field-label" htmlFor="auth-code">Verification code<input id="auth-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => updateCode(event.target.value)} placeholder="000000" required /></label>
      <button className="primary-button auth-submit" disabled={loading || code.length !== 6}>{loading ? <><LoaderCircle size={16} className="spin" /> Verifying…</> : <>Verify and enter <ArrowRight size={16} /></>}</button>
    </form>
    {error && <div className="auth-error"><AlertCircle size={15} /> {error}</div>}
  </div></div>;

  return <main className={`auth-${theme} relative grid min-h-dvh place-items-center overflow-hidden px-4 py-2 sm:px-8 sm:py-10 [@media(max-height:800px)]:py-2 ${theme === "dark" ? "bg-[#090e1b] text-[#edf2ff]" : "bg-[#f4f5fb] text-[#20283a]"}`}>
    <div className="pointer-events-none absolute -left-40 -top-48 size-[520px] rounded-full bg-[#dcd8ff]/65 blur-3xl [.auth-dark_&]:bg-[#322c78]/25" />
    <div className="pointer-events-none absolute -bottom-56 -right-36 size-[520px] rounded-full bg-[#dce9ff]/70 blur-3xl [.auth-dark_&]:bg-[#1d4262]/25" />
    <section className="relative grid w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-[#e4e7f0] bg-white shadow-[0_30px_100px_-42px_rgba(34,39,78,0.3)] [.auth-dark_&]:border-[#252f46] [.auth-dark_&]:bg-[#101829] [.auth-dark_&]:shadow-[0_32px_100px_-45px_rgba(0,0,0,0.9)] md:min-h-[600px] md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[1.04fr_0.96fr]">
      <aside className="relative isolate hidden min-h-[270px] flex-col overflow-hidden bg-gradient-to-br from-[#302b75] via-[#5146ad] to-[#7567df] p-6 text-white md:flex md:min-h-full md:p-7 lg:p-12 [.auth-dark_&]:from-[#17172f] [.auth-dark_&]:via-[#282454] [.auth-dark_&]:to-[#423a83]">
        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 size-80 rounded-full border border-white/10 shadow-[0_0_0_36px_rgba(255,255,255,0.035),0_0_0_72px_rgba(255,255,255,0.025)]" />
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[13px] border border-white/20 bg-white/10 shadow-inner"><Sparkles size={19} /></span>
          <span className="flex flex-col gap-0.5"><strong className="font-[Manrope] text-[12px] font-extrabold tracking-[-0.3px]">ResearchPilot</strong><small className="whitespace-nowrap text-[12px] text-white/65">Evidence-first decisions</small></span>
        </div>
        <div className="my-auto max-w-[480px] py-9 [@media(max-height:800px)]:py-3">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-bold tracking-[1.4px] text-white/85 [@media(max-height:800px)]:mb-3"><ShieldCheck size={13} /> PRIVATE RESEARCH WORKSPACE</div>
          <h1 className="max-w-[470px] font-[Manrope] text-[26px] font-extrabold leading-[1.16] tracking-[-1px] md:text-[28px] lg:text-[30px] [@media(max-height:800px)]:md:text-[26px]">Turn complex questions into <span className="text-[#c9c4ff]">clear evidence.</span></h1>
          <p className="mt-4 max-w-[390px] text-[12px] leading-[1.85] text-white/70 [@media(max-height:800px)]:mt-2 [@media(max-height:800px)]:leading-relaxed">Bring your research, sources, and decisions into one thoughtful workspace—built to make every conclusion easier to trust.</p>
          <div className="mt-8 grid max-w-[440px] grid-cols-3 gap-2.5 [@media(max-height:800px)]:mt-4">
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 [@media(max-height:800px)]:p-2"><strong className="block text-[13px] font-extrabold [@media(max-height:800px)]:text-[12px]">Source-led</strong><span className="mt-1 block text-[12px] leading-relaxed text-white/60 [@media(max-height:800px)]:hidden">Ground every claim</span></div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 [@media(max-height:800px)]:p-2"><strong className="block text-[13px] font-extrabold [@media(max-height:800px)]:text-[12px]">Organized</strong><span className="mt-1 block text-[12px] leading-relaxed text-white/60 [@media(max-height:800px)]:hidden">Keep work together</span></div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 [@media(max-height:800px)]:p-2"><strong className="block text-[13px] font-extrabold [@media(max-height:800px)]:text-[12px]">Private</strong><span className="mt-1 block text-[12px] leading-relaxed text-white/60 [@media(max-height:800px)]:hidden">Stay in control</span></div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-[12px] text-white/55 [@media(max-height:800px)]:pt-3">
          <span>Research with clarity. Decide with confidence.</span>
          <button className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" type="button" onClick={onThemeChange} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
        </div>
      </aside>

      <div className="flex flex-col justify-center px-5 py-5 sm:px-8 sm:py-8 md:px-7 lg:px-14 lg:py-12">
        <div className="mb-5 flex items-center gap-3 md:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#7c73f2] to-[#544bd0] text-white"><Sparkles size={17} /></span>
          <span className="flex flex-col"><strong className="text-[12px] font-extrabold">ResearchPilot</strong><small className="text-[12px] text-[#7d8799] [.auth-dark_&]:text-[#a6b2c8]">Research workspace</small></span>
          <button className="ml-auto grid size-9 place-items-center rounded-lg border border-[#e0e3ef] bg-[#f7f8fc] text-[#4d5a74] [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#182238] [.auth-dark_&]:text-[#edf2ff]" type="button" onClick={onThemeChange} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
        </div>
        <div className="mb-5 hidden items-center gap-2 self-start rounded-full border border-[#e8e9f0] bg-[#f8f8fc] px-3 py-1.5 text-[12px] font-semibold text-[#687286] [.auth-dark_&]:border-[#303c54] [.auth-dark_&]:bg-[#182238] [.auth-dark_&]:text-[#b3bfd4] md:flex"><span className="size-1.5 rounded-full bg-[#36b987] shadow-[0_0_0_3px_#36b98722]" /> Secure workspace access</div>
        <div className="mb-5">
          <h2 className="font-[Manrope] text-[22px] font-extrabold tracking-[-0.6px] sm:text-[24px]">Welcome back</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#7d8799] [.auth-dark_&]:text-[#a6b2c8]">Sign in to continue your research.</p>
        </div>
        <form className="flex flex-col gap-3.5" onSubmit={signIn}>
          <label className="flex flex-col gap-2 text-[12px] font-bold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="auth-email">Email address<input className="h-12 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none transition placeholder:text-[#aab2c0] hover:border-[#c7c8da] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] [.auth-dark_&]:placeholder:text-[#718099] [.auth-dark_&]:hover:border-[#596784]" id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></label>
          <label className="flex flex-col gap-2 text-[12px] font-bold text-[#465061] [.auth-dark_&]:text-[#d9e1f0]" htmlFor="auth-password">Password<input className="h-12 w-full rounded-xl border border-[#dfe3ec] bg-white px-3.5 text-[12px] font-medium text-[#20283a] outline-none transition placeholder:text-[#aab2c0] hover:border-[#c7c8da] focus:border-[#776ce0] focus:ring-4 focus:ring-[#776ce0]/10 [.auth-dark_&]:border-[#35415a] [.auth-dark_&]:bg-[#0d1526] [.auth-dark_&]:text-[#edf2ff] [.auth-dark_&]:placeholder:text-[#718099] [.auth-dark_&]:hover:border-[#596784]" id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" required /></label>
          <button className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d53ca] to-[#7568dd] px-4 text-[12px] font-bold text-white shadow-[0_8px_20px_-8px_#5d53caaa] transition hover:-translate-y-0.5 hover:from-[#5147bc] hover:to-[#695bd0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7568dd]/25 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={15} className="spin" /> Signing in…</> : <>Continue <ArrowRight size={15} /></>}</button>
        </form>
        <p className="mt-3 self-center text-[12px] text-[#7d8799] [.auth-dark_&]:text-[#a6b2c8]">New to ResearchPilot? <button className="font-bold text-[#5d53ca] transition hover:text-[#4037b5] focus-visible:outline-none focus-visible:underline [.auth-dark_&]:text-[#b4adff] [.auth-dark_&]:hover:text-[#d2ccff]" type="button" onClick={startSignup}>Create an account</button></p>
        {error && <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#f3cdd1] bg-[#fff3f4] px-3 py-2.5 text-[12px] text-[#b34d57] [.auth-dark_&]:border-[#633743] [.auth-dark_&]:bg-[#3a202b] [.auth-dark_&]:text-[#ff9fa8]"><AlertCircle size={14} /> {error}</div>}
        <div>
          <div className="my-6 flex items-center gap-3 text-[12px] text-[#a3a8b2] before:h-px before:flex-1 before:bg-[#eceef3] after:h-px after:flex-1 after:bg-[#eceef3] [.auth-dark_&]:text-[#8290a8] [.auth-dark_&]:before:bg-[#2c3850] [.auth-dark_&]:after:bg-[#2c3850]"><span>OR CONTINUE WITH</span></div>
          <OAuthButtons loading={loading} theme={theme} onOAuth={onOAuth} />
        </div>
        <p className="mt-4 hidden text-center text-[12px] leading-relaxed text-[#9aa2af] [.auth-dark_&]:text-[#8290a8] sm:block [@media(max-height:800px)]:hidden">By continuing, you agree to keep provider credentials private and use only authorized research sources.</p>
      </div>
    </section>
  </main>;
}
