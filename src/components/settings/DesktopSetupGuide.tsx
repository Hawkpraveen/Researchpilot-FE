import { Download } from "lucide-react";
import "./desktop-setup-guide.styles.css";

export function DesktopSetupGuide() {
  return <details className="desktop-setup-guide">
    <summary>Download and install: view setup guide</summary>
    <ol>
      <li><strong>Open Ollama.</strong> Install Ollama and download a chat model on the computer you want to use.</li>
      <li><strong>Download the Windows connector.</strong> Extract the ZIP, then open ResearchPilot Connector from the extracted folder. If Windows shows a warning, check that you downloaded it from this app before continuing.</li>
      <li><strong>Connect your computer.</strong> In Settings, choose Local LLM, then “Other option: use the desktop connector”. Click “Connect this computer” and allow local-network access if your browser asks.</li>
      <li><strong>Choose a model.</strong> Pick an installed model from the list. Your choice saves automatically.</li>
      <li><strong>Start research.</strong> Keep Ollama and the connector running. Next time, open both again; you do not need to download the connector again.</li>
    </ol>
    <a className="secondary-button" href="/downloads/ResearchPilot-Connector.zip" download><Download size={15} /> Download Windows connector</a>
    <p>Already connected? You can read these steps anytime without disconnecting.</p>
  </details>;
}
