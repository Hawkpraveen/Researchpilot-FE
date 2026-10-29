import "./research-form.styles.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, LoaderCircle, Sparkles } from "lucide-react";
import type { NewResearchProps } from "./research-form.types";
import { researchCriteria, researchDepthOptions } from "./research-form.constants";
import type { CreateResearchRequest } from "../../types";

const steps = ["Question", "Criteria", "Context", "Budget"];

export function NewResearch({ form, submitting, onChange, onToggleCriterion, onSubmit, onCancel }: NewResearchProps) {
  const [step, setStep] = useState(1);
  const canContinue = step === 1 ? form.question.trim().length >= 12 : step === 2 ? form.criteria.length > 0 : true;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 4) {
      if (canContinue) setStep((current) => current + 1);
      return;
    }
    onSubmit(event);
  };

  return (
    <div className="form-page new-research-page research-wizard">
      <button className="back-link" onClick={onCancel}><ArrowLeft size={15} /> Back to overview</button>
      <div className="form-heading"><div className="eyebrow"><Sparkles size={14} /> NEW RESEARCH</div><h1>Start your research</h1><p>Answer a few focused questions and we’ll turn your decision into a source-linked research report.</p></div>
      <div className="research-progress" aria-label="Research setup steps">
        {steps.map((label, index) => { const number = index + 1; return <span key={label} className={`research-progress-step ${number === step ? "is-active" : ""} ${number < step ? "is-complete" : ""}`}><b>{String(number).padStart(2, "0")}</b> {label}{number < steps.length && <i />}</span>; })}
      </div>
      <form className={`research-form research-step-${step}`} onSubmit={handleSubmit}>
        <div className="form-main step-content">
          {step === 1 && <div className="form-card surface-card research-goal-card">
            <div className="form-section-title"><span className="form-step">01</span><div><h2>Your research question</h2><p>Start with the decision you need to make.</p></div></div>
            <label className="field-label" htmlFor="question">Research goal <span className="required">*</span></label>
            <textarea id="question" value={form.question} onChange={(e) => onChange({ ...form, question: e.target.value })} placeholder="Example: Compare three AI customer-support platforms for a 20-person startup, focusing on pricing, automation, integrations, and data security." rows={4} maxLength={1000} required />
            <div className="field-meta"><span>Be specific about the options and decision criteria.</span><span>{form.question.length}/1000</span></div>
            <label className="field-label top-gap" htmlFor="research-type">Research type</label>
            <select id="research-type" value={form.researchType} onChange={(e) => onChange({ ...form, researchType: e.target.value as CreateResearchRequest["researchType"] })}><option value="product-comparison">Product &amp; competitor comparison</option><option value="technical-research">Technical research</option><option value="business-decision">Business decision research</option></select>
          </div>}
          {step === 2 && <div className="form-card surface-card research-criteria-card">
            <div className="form-section-title"><span className="form-step">02</span><div><h2>What matters most?</h2><p>Select the criteria your research should address.</p></div></div>
            <div className="criteria-grid">{researchCriteria.map((criterion) => <label key={criterion} className={`criterion-option ${form.criteria.includes(criterion) ? "criterion-selected" : ""}`}><input type="checkbox" checked={form.criteria.includes(criterion)} onChange={() => onToggleCriterion(criterion)} /><span className="custom-check">{form.criteria.includes(criterion) && <Check size={12} />}</span><span>{criterion}</span></label>)}</div>
            <p className="step-validation">{form.criteria.length ? `${form.criteria.length} criteria selected` : "Choose at least one criterion to continue."}</p>
          </div>}
          {step === 3 && <div className="form-card surface-card research-context-card">
            <div className="form-section-title"><span className="form-step">03</span><div><h2>Constraints and context</h2><p>Optional details help make the research more practical.</p></div></div>
            <label className="field-label" htmlFor="constraints">Budget, team size, technical requirements…</label>
            <textarea id="constraints" value={form.constraints} onChange={(e) => onChange({ ...form, constraints: e.target.value })} placeholder="Example: Budget under $300/month, team of 20, must support SSO, prefer tools with a free trial." rows={4} maxLength={500} />
            <div className="field-meta"><span>You can skip this step if there are no constraints.</span><span>{form.constraints.length}/500</span></div>
          </div>}
          {step === 4 && <div className="form-card depth-card surface-card budget-panel">
            <div className="form-section-title"><span className="form-step">04</span><div><h2>Research budget</h2><p>Choose the search and time limits for this run.</p></div></div>
            {researchDepthOptions.map(({ value, title, detail, tag }) => <label key={value} className={`depth-option ${form.depth === value ? "depth-selected" : ""}`}><input type="radio" name="depth" value={value} checked={form.depth === value} onChange={() => onChange({ ...form, depth: value })} /><span className="depth-radio" /><span className="depth-copy"><strong>{title}</strong><small>{detail}</small></span><span className="depth-tag">{tag}</span></label>)}
          </div>}
          <div className="form-actions">
            {step === 1 ? <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button> : <button type="button" className="secondary-button" onClick={() => setStep((current) => current - 1)}><ChevronLeft size={16} /> Back</button>}
            <button type="submit" className="primary-button" disabled={submitting || !canContinue}>{submitting ? <><LoaderCircle size={16} className="spin" /> Starting research…</> : step === 4 ? <><Sparkles size={16} /> Run research</> : <>Continue <ArrowRight size={16} /></>}</button>
          </div>
        </div>

      </form>
    </div>
  );
}
