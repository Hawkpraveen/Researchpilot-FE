import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { DesktopSetupGuide } from "../settings/DesktopSetupGuide";
import "./guide.styles.css";

const chapters = ["Connect a model", "Start research", "Follow progress", "Read your report", "Find your projects", "Settings and help"];

export function AppGuide() {
  const [chapter, setChapter] = useState(0);
  return <div className="app-guide">
    <header className="app-guide-heading">
      <div className="eyebrow"><BookOpen size={16} /> YOUR RESEARCHPILOT GUIDE</div>
      <h1>A little help, whenever you need it</h1>
      <p>Choose a topic or follow the guide from the beginning. You can reopen it from Guide at the top of any workspace page, even after setup is complete.</p>
    </header>
    <div className="app-guide-layout">
      <nav className="app-guide-topics" aria-label="Guide topics">
        {chapters.map((title, index) => <button key={title} type="button" aria-current={chapter === index ? "step" : undefined} onClick={() => setChapter(index)}><span>{index + 1}</span>{title}</button>)}
      </nav>
      <section className="surface-card app-guide-content" aria-labelledby="guide-chapter-title">
        <p className="app-guide-count">Topic {chapter + 1} of {chapters.length}</p>
        <h2 id="guide-chapter-title">{chapters[chapter]}</h2>
        <div key={chapter}>
          {chapter === 0 && <>
            <p>Open Settings and choose where your model runs. For a local model, you have two ways to connect. Choose whichever suits you.</p>
            <details open className="app-guide-detail">
              <summary>Option 1: connect through your browser</summary>
              <ol>
                <li>Install and open Ollama on this computer, with a chat model downloaded.</li>
                <li>In Settings, choose <strong>Local LLM (your computer)</strong>. Follow “Open Ollama” and “Allow this website”. The guide provides a command to copy once.</li>
                <li>Click <strong>Connect Ollama</strong>. Allow local access if your browser asks.</li>
                <li>Choose an installed model when the list appears. Your choice saves automatically.</li>
              </ol>
              <p>Keep Ollama running and this ResearchPilot tab open while research runs. No ResearchPilot connector download is needed.</p>
              <p>Already finished? Use <strong>View setup guide again</strong> in Settings. Reading it does not disconnect your model.</p>
            </details>
            <DesktopSetupGuide />
            <details className="app-guide-detail">
              <summary>Use an API key instead</summary>
              <p>In Settings, choose OpenAI, Anthropic Claude, or Custom OpenAI-compatible. Enter the endpoint, model and API key, test the configuration, then save it. Provider charges depend on your account; ResearchPilot does not automatically switch you to a paid provider.</p>
            </details>
            <Link className="primary-button" to="/workspace/settings">Open connection settings <ArrowRight size={15} /></Link>
          </>}
          {chapter === 1 && <>
            <p>Click <strong>New research</strong> in the sidebar. The form takes you through four short steps.</p>
            <ol>
              <li><strong>Question:</strong> describe the decision you want help with. Include the names or websites of anything you want researched.</li>
              <li><strong>Criteria:</strong> choose what matters, such as cost, features or security.</li>
              <li><strong>Context:</strong> add constraints like your budget or team size. You can skip this step.</li>
              <li><strong>Budget:</strong> choose the search and time limits, then start the run.</li>
            </ol>
            <p className="app-guide-example">Try: “Compare three project management tools for a team of five, focusing on free plans and ease of use.”</p>
            <Link className="primary-button" to="/workspace/research/new">Open new research <ArrowRight size={15} /></Link>
          </>}
          {chapter === 2 && <>
            <p>After you start, the report page shows whether the research is queued, running or finished. Keep your local model connection available while it runs.</p>
            <ul>
              <li><strong>Clarification needed:</strong> choose the intended subject or add a website or short description.</li>
              <li><strong>Limited coverage:</strong> some evidence is missing. Read the gaps before relying on the findings.</li>
              <li><strong>Research interrupted:</strong> check the error and your model connection, then use Research again when available.</li>
            </ul>
            <p>If a connection fails, return to Settings. For browser mode, keep Ollama and this tab open. For desktop mode, keep Ollama and the connector running.</p>
            <Link className="secondary-button" to="/workspace/settings">Check my connection</Link>
          </>}
          {chapter === 3 && <>
            <p>Open a finished project to review the report.</p>
            <ol>
              <li>Start with <strong>Overview</strong> to understand the findings.</li>
              <li>Open <strong>Sources</strong> to follow links and check the supporting evidence.</li>
              <li>Review gaps, conflicts and limited coverage before making a decision.</li>
              <li>Use <strong>Research again</strong> if you want to repeat the run, or start new research with a more specific question.</li>
            </ol>
            <p>A planning-only result is not a completed evidence report. Check the report status before treating its contents as verified findings.</p>
            <Link className="secondary-button" to="/workspace">Find a report</Link>
          </>}
          {chapter === 4 && <>
            <p>Your projects appear in the sidebar. On a small screen, open the menu first.</p>
            <ul>
              <li>Use <strong>Find a project</strong> to search your projects.</li>
              <li>Use All projects, Active or Completed to narrow the list.</li>
              <li>Open a project to see its progress or report. Quick preview gives you a short look from the sidebar.</li>
              <li>Use a project’s action menu to rename or delete it.</li>
            </ul>
            <Link className="secondary-button" to="/workspace">Open overview</Link>
          </>}
          {chapter === 5 && <>
            <ul>
              <li><strong>Change models:</strong> open Settings, connect your provider and choose the model you want.</li>
              <li><strong>Rename your workspace:</strong> use Workspace name in Settings and save.</li>
              <li><strong>Edit your profile:</strong> open your profile menu at the top of the page.</li>
              <li><strong>Change theme:</strong> use the sun or moon button at the top of the page.</li>
              <li><strong>Review setup:</strong> the browser and desktop connection guides remain available after connecting.</li>
            </ul>
            <p>You can return to any topic in this guide anytime. Opening the guide does not change your saved settings.</p>
            <Link className="primary-button" to="/workspace/settings">Open settings</Link>
          </>}
        </div>
        <footer className="app-guide-navigation">
          <button className="secondary-button" type="button" disabled={chapter === 0} onClick={() => setChapter(chapter - 1)}><ArrowLeft size={15} /> Previous</button>
          {chapter < chapters.length - 1 ? <button className="primary-button" type="button" onClick={() => setChapter(chapter + 1)}>Next topic <ArrowRight size={15} /></button> : <button className="secondary-button" type="button" onClick={() => setChapter(0)}>Read from the beginning</button>}
        </footer>
      </section>
    </div>
  </div>;
}
