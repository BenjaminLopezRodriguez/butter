"use client";

import {
  AiMagicIcon,
  Cancel01Icon,
  Link01Icon,
  PauseIcon,
  PlayIcon,
  Presentation01Icon,
} from "hugeicons-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

export type Pin = {
  id: string;
  kind: "issue" | "suggestion" | "question";
  /** Position on the surface, in percent. */
  x: number;
  y: number;
  atMs: number;
  author: string;
  initials: string;
  title: string;
  body: string;
  evidence: string;
};

const TONE = {
  issue: { ring: "ring-issue/50", dot: "bg-issue", text: "text-issue", label: "Issue" },
  suggestion: { ring: "ring-suggestion/50", dot: "bg-suggestion", text: "text-suggestion", label: "Suggestion" },
  question: { ring: "ring-question/50", dot: "bg-question", text: "text-question", label: "Question" },
} as const;

const clock = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export function ReviewPlayer({
  title,
  branch,
  durationMs,
  pins,
  children,
}: {
  title: string;
  branch: string;
  durationMs: number;
  pins: Pin[];
  children: React.ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [copied, setCopied] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, durationMs]);

  // A pin belongs to the moment it was left, so it appears as the playhead reaches it.
  const visible = pins.filter((p) => t >= p.atMs);
  const active = pins.find((p) => p.id === open) ?? null;

  const seek = (ms: number) => {
    setT(ms);
    setPlaying(false);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={presenting ? "fixed inset-0 z-50 overflow-auto bg-ink p-4 sm:p-8" : ""}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-medium text-fg">{title}</h1>
            <p className="mt-0.5 font-mono text-[12px] text-faint">{branch}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={share}
            className="h-9 gap-2 rounded-full px-3 text-[13px] text-muted hover:bg-raised hover:text-fg"
          >
            <Link01Icon size={15} strokeWidth={1.5} />
            {copied ? "Link copied" : "Share"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPresenting((v) => !v)}
            className="h-9 gap-2 rounded-full px-3 text-[13px] text-muted hover:bg-raised hover:text-fg"
          >
            {presenting ? <Cancel01Icon size={15} strokeWidth={1.5} /> : <Presentation01Icon size={15} strokeWidth={1.5} />}
            {presenting ? "Exit" : "Present"}
          </Button>
        </div>

        {/* The surface being reviewed, with comments left on top of it. */}
        <div className="relative rounded-3xl bg-surface soft-ring">
          <div className="relative aspect-[16/10] w-full">
            <div className="absolute inset-0 overflow-hidden rounded-t-3xl">{children}</div>

            {visible.map((p) => {
              const tone = TONE[p.kind];
              const isOpen = open === p.id;
              return (
                <div
                  key={p.id}
                  className="absolute"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    aria-label={`${tone.label} from ${p.author} at ${clock(p.atMs)}`}
                    aria-expanded={isOpen}
                    className={`group relative -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ${tone.ring} transition-transform hover:scale-110 ${isOpen ? "scale-110" : ""}`}
                  >
                    <Avatar className="size-9 rounded-full border-2 border-ink shadow-lg">
                      <AvatarFallback className="bg-raised text-[12px] font-medium text-fg">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-ink ${tone.dot}`} />
                  </button>

                  {isOpen ? (
                    <div
                      className={`absolute z-30 w-[300px] rounded-2xl bg-raised p-4 shadow-2xl soft-ring ${
                        p.y > 55 ? "bottom-7" : "top-7"
                      } ${p.x > 62 ? "right-4" : "left-4"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-medium ${tone.text}`}>{tone.label}</span>
                        <span className="font-mono text-[12px] text-faint tabular-nums">{clock(p.atMs)}</span>
                        <button
                          type="button"
                          onClick={() => setOpen(null)}
                          aria-label="Close comment"
                          className="ml-auto text-faint hover:text-fg"
                        >
                          <Cancel01Icon size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      <p className="mt-2 text-[14px] leading-snug font-medium text-fg">{p.title}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.body}</p>
                      <p className="mt-3 rounded-xl bg-surface px-3 py-2 font-mono text-[11px] leading-relaxed text-faint">
                        {p.evidence}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" className="h-8 flex-1 rounded-full bg-butter text-[12px] font-medium text-ink hover:bg-butter/90">
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 rounded-full px-3 text-[12px] text-muted hover:bg-surface hover:text-fg">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Transport */}
          <div className="relative z-10 flex items-center gap-4 rounded-b-3xl bg-raised/60 px-4 py-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause" : "Play"}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-butter text-ink transition-transform hover:scale-105"
            >
              {playing ? <PauseIcon size={16} strokeWidth={2} /> : <PlayIcon size={16} strokeWidth={2} />}
            </button>

            <div className="relative h-1.5 flex-1 rounded-full bg-line">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-butter/70"
                style={{ width: `${(t / durationMs) * 100}%` }}
              />
              {pins.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => seek(p.atMs)}
                  aria-label={`Jump to ${clock(p.atMs)}`}
                  style={{ left: `${(p.atMs / durationMs) * 100}%` }}
                  className={`absolute -top-1 size-3.5 -translate-x-1/2 rounded-full border-2 border-ink ${TONE[p.kind].dot} transition-transform hover:scale-125`}
                />
              ))}
            </div>

            <span className="shrink-0 font-mono text-[12px] text-muted tabular-nums">
              {clock(t)} / {clock(durationMs)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button className="h-10 gap-2 rounded-full bg-raised px-4 text-[13px] font-medium text-fg hover:bg-line">
            <AiMagicIcon size={16} strokeWidth={1.5} className="text-butter" />
            Send to AI
          </Button>
          <span className="text-[13px] text-faint">
            {visible.length} of {pins.length} comments so far
          </span>
        </div>
      </div>
    </div>
  );
}
