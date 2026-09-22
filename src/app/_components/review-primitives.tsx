"use client";

export type FindingKind = "issue" | "suggestion" | "question";

export type ReviewFinding = {
  id: string;
  kind: FindingKind;
  time: string;
  timestampMs: number;
  title: string;
  body: string;
  severity: string;
  confidence: "strong" | "some" | "needs_investigation";
  evidence: { source: string; detail: string }[];
  neededEvidence?: string;
  status?: "open" | "accepted" | "dismissed" | "resolved";
};

const tone = {
  issue: "border-issue/50 bg-issue/10 text-issue",
  suggestion: "border-suggestion/50 bg-suggestion/10 text-suggestion",
  question: "border-question/50 bg-question/10 text-question",
};

const markerTone = {
  issue: "bg-issue",
  suggestion: "bg-suggestion",
  question: "bg-question",
};

export function Finding({
  finding,
  selected = false,
  onSelect,
  compact = false,
}: {
  finding: ReviewFinding;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const confidence = finding.confidence.replaceAll("_", " ");

  return (
    <article
      className={`border bg-surface ${selected ? "border-faint" : "border-line"}`}
      aria-current={selected ? "true" : undefined}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 text-left"
        aria-label={`Open finding at ${finding.time}: ${finding.title}`}
      >
        <span className={`border px-1.5 py-0.5 font-mono text-[10px] ${tone[finding.kind]}`}>
          {finding.kind}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-muted">{finding.time}</span>
        <span className="ml-auto font-mono text-[10px] text-faint">{confidence}</span>
        <span className="w-full text-[13px] font-medium leading-snug text-fg">{finding.title}</span>
      </button>

      {!compact ? (
        <div className="border-t border-line px-4 py-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-faint">
            <span>severity: {finding.severity}</span>
            <span>confidence: {confidence}</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{finding.body}</p>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-3">
            {finding.evidence.map((item) => (
              <div key={`${item.source}-${item.detail}`} className="grid grid-cols-[72px_1fr] gap-2 font-mono text-[11px] leading-relaxed">
                <dt className="text-faint">{item.source}</dt>
                <dd className="text-muted">{item.detail}</dd>
              </div>
            ))}
          </dl>
          {finding.neededEvidence ? (
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
              <span className="font-medium text-muted">Would settle this: </span>
              {finding.neededEvidence}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
            <button type="button" className="border border-line px-2.5 py-1 text-[11px] text-muted hover:border-faint hover:text-fg">Accept</button>
            <button type="button" className="border border-line px-2.5 py-1 text-[11px] text-muted hover:border-faint hover:text-fg">Discuss</button>
            <button type="button" className="border border-line px-2.5 py-1 text-[11px] text-muted hover:border-faint hover:text-fg">Dismiss</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function Timeline({
  findings,
  durationMs,
  selectedId,
  onSelect,
}: {
  findings: ReviewFinding[];
  durationMs: number;
  selectedId?: string;
  onSelect?: (finding: ReviewFinding) => void;
}) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="relative h-5 border-y border-line bg-raised/40">
        {findings.map((finding) => {
          const left = `${Math.min(98, Math.max(1, (finding.timestampMs / durationMs) * 100))}%`;
          return (
            <button
              key={finding.id}
              type="button"
              onClick={() => onSelect?.(finding)}
              style={{ left }}
              className={`absolute top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 ${markerTone[finding.kind]} ${selectedId === finding.id ? "ring-2 ring-fg ring-offset-2 ring-offset-surface" : ""}`}
              aria-label={`Select ${finding.kind} at ${finding.time}`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-faint">
        <span>00:00</span>
        <span>01:12</span>
        <span>02:24</span>
        <span>03:36</span>
        <span>04:48</span>
      </div>
    </div>
  );
}
