"use client";

import { useEffect, useState } from "react";

import { Finding, type ReviewFinding, Timeline } from "./review-primitives";

export type ReviewData = {
  title: string;
  branch: string;
  commit: string;
  durationMs: number;
  findings: ReviewFinding[];
};

function Player({ currentMs, onToggle }: { currentMs: number; onToggle: () => void }) {
  const minutes = Math.floor(currentMs / 60000);
  const seconds = Math.floor((currentMs % 60000) / 1000).toString().padStart(2, "0");
  const paymentMoment = currentMs >= 130000 && currentMs < 145000;

  return (
    <div className="relative min-h-[300px] overflow-hidden bg-[#f4f6fa] p-4 text-[#172033] sm:min-h-[420px] sm:p-7">
      <div className="mx-auto max-w-[660px]">
        <div className="flex items-center justify-between border-b border-[#d8deea] pb-4 text-[11px] text-[#536074]">
          <span className="font-semibold tracking-tight">RELAY / CHECKOUT</span>
          <span className="font-mono">Secure checkout</span>
        </div>
        <div className="grid gap-8 pt-8 sm:grid-cols-[1fr_190px]">
          <section>
            <p className="text-[11px] font-medium tracking-wide text-[#69768a]">PAYMENT</p>
            <h2 className="mt-2 text-[23px] font-semibold tracking-tight">Complete your order</h2>
            <label className="mt-6 block text-[11px] font-medium text-[#536074]">Card number</label>
            <div className="mt-2 border border-[#bcc6d6] bg-white px-3 py-3 text-[13px] text-[#778499]">4242 4242 4242 4242</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-medium text-[#536074]">Expiry</label><div className="mt-2 border border-[#bcc6d6] bg-white px-3 py-3 text-[13px] text-[#778499]">08 / 28</div></div>
              <div><label className="text-[11px] font-medium text-[#536074]">CVC</label><div className="mt-2 border border-[#bcc6d6] bg-white px-3 py-3 text-[13px] text-[#778499]">•••</div></div>
            </div>
            <button type="button" className={`mt-6 w-full px-4 py-3 text-[13px] font-medium ${paymentMoment ? "bg-[#172033] text-white" : "bg-[#172033] text-white"}`}>Pay $84.00</button>
            {paymentMoment ? <p className="mt-3 text-[11px] text-[#536074]"> </p> : null}
          </section>
          <aside className="border-t border-[#d8deea] pt-4 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0">
            <p className="text-[11px] font-medium tracking-wide text-[#69768a]">ORDER SUMMARY</p>
            <div className="mt-5 space-y-3 text-[12px] text-[#536074]"><p className="flex justify-between"><span>Pro plan</span><span>$84.00</span></p><p className="flex justify-between"><span>Tax</span><span>$0.00</span></p><p className="flex justify-between border-t border-[#d8deea] pt-3 font-medium text-[#172033]"><span>Total</span><span>$84.00</span></p></div>
          </aside>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-[#536074] sm:bottom-5 sm:left-7 sm:right-7">
        <button type="button" onClick={onToggle} className="border border-[#b6c0d0] bg-white px-2 py-1 text-[#172033]">PLAY</button>
        <span>{minutes}:{seconds} / 04:48</span>
      </div>
    </div>
  );
}

export function ReviewScreen({ review }: { review: ReviewData }) {
  const [selectedId, setSelectedId] = useState(review.findings[0]?.id);
  const [currentMs, setCurrentMs] = useState(review.findings[0]?.timestampMs ?? 0);
  const [playing, setPlaying] = useState(false);
  const selected = review.findings.find((finding) => finding.id === selectedId) ?? review.findings[0];

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => setCurrentMs((time) => Math.min(review.durationMs, time + 1000)), 1000);
    return () => window.clearInterval(interval);
  }, [playing, review.durationMs]);

  const selectFinding = (finding: ReviewFinding) => {
    setSelectedId(finding.id);
    setCurrentMs(finding.timestampMs);
    setPlaying(false);
  };
  const counts = ["issue", "suggestion", "question"].map((kind) => `${review.findings.filter((finding) => finding.kind === kind).length} ${kind}${review.findings.filter((finding) => finding.kind === kind).length === 1 ? "" : "s"}`);

  return (
    <main className="min-h-screen bg-ink text-fg">
      <header className="border-b border-line px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-2">
          <a href="/" className="font-mono text-[14px] font-medium text-butter">butter</a>
          <div className="min-w-0 border-l border-line pl-4">
            <h1 className="truncate text-[15px] font-medium">{review.title}</h1>
            <p className="mt-0.5 font-mono text-[10px] text-faint">{review.branch} @ {review.commit}</p>
          </div>
          <p className="w-full font-mono text-[10px] text-muted sm:ml-auto sm:w-auto">{counts.join(" · ")}</p>
        </div>
      </header>
      <div className="mx-auto max-w-[1440px]">
        <div className="grid border-b border-line lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
            <Player currentMs={currentMs} onToggle={() => setPlaying((value) => !value)} />
          </section>
          <aside className="bg-ink">
            <div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="text-[13px] font-medium">Findings</h2><span className="font-mono text-[10px] text-faint">{review.findings.length} open</span></div>
            <div className="max-h-[510px] space-y-2 overflow-auto p-3">
              {review.findings.map((finding) => <Finding key={finding.id} finding={finding} selected={selectedId === finding.id} onSelect={() => selectFinding(finding)} compact />)}
            </div>
          </aside>
        </div>
        <section className="border-b border-line bg-surface">
          <Timeline findings={review.findings} durationMs={review.durationMs} selectedId={selectedId} onSelect={selectFinding} />
        </section>
        <section className="grid lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] text-faint">SELECTED FINDING</p>
            {selected ? <div className="mt-3"><Finding finding={selected} selected onSelect={() => selectFinding(selected)} /></div> : null}
          </div>
          <aside className="p-4 sm:p-6">
            <p className="font-mono text-[10px] text-faint">DISCUSSION / DECISION HISTORY</p>
            <div className="mt-4 space-y-4 border-l border-line pl-4 text-[12px] leading-relaxed text-muted">
              <div><p className="font-mono text-[10px] text-faint">02:14 · presenter</p><p className="mt-1">“When I hit Pay there&apos;s a slight delay here.”</p></div>
              <div><p className="font-mono text-[10px] text-faint">open</p><p className="mt-1">No decision yet. The evidence stays attached while the team decides.</p></div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
