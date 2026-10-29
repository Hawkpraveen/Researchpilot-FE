import type { ResearchJob } from "../../types";

type Sources = NonNullable<ResearchJob["report"]>["sources"];

export function CitedText({ text, sources }: { text: string; sources: Sources }) {
  return <span className="whitespace-pre-line">{text.split(/(\[S\d+\])/g).map((part, index) => {
    const source = sources.find((item) => `[${item.id}]` === part);
    if (!source) return part;
    return <a key={index} href={source.url} target="_blank" rel="noreferrer" title={source.title} className="text-[#8275ed] underline underline-offset-2">{part}</a>;
  })}</span>;
}
