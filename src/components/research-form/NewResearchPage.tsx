import { ArrowLeft, ArrowRight, Check, LoaderCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { NewResearchProps } from "./research-form.types";
import { researchCriteria, researchDepthOptions } from "./research-form.constants";
import type { CreateResearchRequest } from "../../types";

export function NewResearch({ form, submitting, onChange, onToggleCriterion, onSubmit, onCancel }: NewResearchProps) {
  return (
    <div className="form-page">
      <button className="back-link" onClick={onCancel}><ArrowLeft size={15} /> Back to overview</button>
      <div className="form-heading"><div className="eyebrow"><Sparkles size={14} /> NEW RESEARCH PLAN</div><h1>What should we plan?</h1><p>Define the decision and criteria. ResearchPilot will prepare a bounded plan; web research and verified findings are not available yet.</p></div>
      <form className="research-form" onSubmit={onSubmit}>
        <div className="form-main">
          <div className="form-card surface-card">
            <div className="form-section-title"><span className="form-step">01</span><div><h2>Your research question</h2><p>Be specific about the decision you need to make.</p></div></div>
            <label className="field-label" htmlFor="question">Research goal <span className="required">*</span></label>
            <textarea id="question" value={form.question} onChange={(e) => onChange({ ...form, question: e.target.value })} placeholder="Example: Compare three AI customer-support platforms for a 20-person startup, focusing on pricing, automation, integrations, and data security." rows={5} maxLength={1000} required />
            <div className="field-meta"><span>Include your context, options, and decision criteria.</span><span>{form.question.length}/1000</span></div>
            <label className="field-label top-gap" htmlFor="research-type">Research type</label>
            <select id="research-type" value={form.researchType} onChange={(e) => onChange({ ...form, researchType: e.target.value as CreateResearchRequest["researchType"] })}>
              <option value="product-comparison">Product & competitor comparison</option>
              <option value="technical-research">Technical research</option>
              <option value="business-decision">Business decision research</option>
            </select>
          </div>

          <div className="form-card surface-card">
            <div className="form-section-title"><span className="form-step">02</span><div><h2>What matters most?</h2><p>Select the criteria the plan should address.</p></div></div>
            <div className="criteria-grid">
              {researchCriteria.map((criterion) => <label key={criterion} className={`criterion-option ${form.criteria.includes(criterion) ? "criterion-selected" : ""}`}><input type="checkbox" checked={form.criteria.includes(criterion)} onChange={() => onToggleCriterion(criterion)} /><span className="custom-check">{form.criteria.includes(criterion) && <Check size={12} />}</span><span>{criterion}</span></label>)}
            </div>
          </div>

          <div className="form-card surface-card">
            <div className="form-section-title"><span className="form-step">03</span><div><h2>Constraints and context</h2><p>Optional details to include in the research plan.</p></div></div>
            <label className="field-label" htmlFor="constraints">Budget, team size, technical requirements…</label>
            <textarea id="constraints" value={form.constraints} onChange={(e) => onChange({ ...form, constraints: e.target.value })} placeholder="Example: Budget under $300/month, team of 20, must support SSO, prefer tools with a free trial." rows={3} maxLength={500} />
          </div>
        </div>

        <aside className="form-side">
          <div className="form-card depth-card surface-card"><div className="form-section-title"><span className="form-step">04</span><div><h2>Plan budget</h2><p>Set the task and page limits for future research.</p></div></div>
            {researchDepthOptions.map(({ value, title, detail, tag }) => <label key={value} className={`depth-option ${form.depth === value ? "depth-selected" : ""}`}><input type="radio" name="depth" value={value} checked={form.depth === value} onChange={() => onChange({ ...form, depth: value })} /><span className="depth-radio" /><span className="depth-copy"><strong>{title}</strong><small>{detail}</small></span><span className="depth-tag">{tag}</span></label>)}
          </div>
          <div className="privacy-note"><ShieldCheck size={17} /><div><strong>No findings are claimed</strong><p>This version prepares a plan only. It does not search the web, verify claims, or produce evidence-backed recommendations.</p></div></div>
          <div className="budget-note"><Zap size={16} /><div><strong>No provider calls</strong><p>Planning does not call external search or model providers.</p></div></div>
        </aside>

        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={submitting}>{submitting ? <><LoaderCircle size={16} className="spin" /> Preparing plan…</> : <><Sparkles size={16} /> Create research plan <ArrowRight size={16} /></>}</button></div>
      </form>
    </div>
  );
}
