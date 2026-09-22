import Link from "next/link";

/** The artifact the whole product exists to produce. */
function Finding({
  kind,
  time,
  title,
  body,
  evidence,
  note,
}: {
  kind: "issue" | "suggestion" | "question";
  time: string;
  title: string;
  body: string;
  evidence: { source: string; detail: string }[];
  note?: string;
}) {
  const tone = {
    issue: "text-issue border-issue/40 bg-issue/10",
    suggestion: "text-suggestion border-suggestion/40 bg-suggestion/10",
    question: "text-question border-question/40 bg-question/10",
  }[kind];

  return (
    <article className="border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <span className={`border px-2 py-0.5 font-mono text-[11px] tracking-wide ${tone}`}>
          {kind}
        </span>
        <span className="font-mono text-[13px] text-muted tabular-nums">{time}</span>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {kind === "question" ? "needs investigation" : "strong evidence"}
        </span>
      </header>

      <div className="px-5 py-4">
        <h3 className="text-[15px] font-medium text-fg">{title}</h3>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">{body}</p>

        {note ? (
          <p className="mt-3 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-faint">
            {note}
          </p>
        ) : null}

        <dl className="mt-4 space-y-1">
          {evidence.map((e) => (
            <div key={e.source} className="flex gap-3 font-mono text-[12px]">
              <dt className="w-20 shrink-0 text-faint">{e.source}</dt>
              <dd className="text-muted">{e.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="flex gap-2 border-t border-line px-5 py-3">
        {["Accept", "Discuss", "Dismiss"].map((action) => (
          <span
            key={action}
            className="border border-line px-2.5 py-1 text-[12px] text-muted"
          >
            {action}
          </span>
        ))}
      </footer>
    </article>
  );
}

/** Marks sit where findings landed in the recording. */
function Timeline() {
  const marks = [
    { at: 12, kind: "question" },
    { at: 31, kind: "suggestion" },
    { at: 46, kind: "issue" },
    { at: 52, kind: "issue" },
    { at: 78, kind: "question" },
  ] as const;

  const color = {
    issue: "bg-issue",
    suggestion: "bg-suggestion",
    question: "bg-question",
  };

  return (
    <div className="mt-6">
      <div className="relative h-px w-full bg-line">
        {marks.map((m) => (
          <span
            key={`${m.kind}-${m.at}`}
            style={{ left: `${m.at}%` }}
            className={`absolute -top-1 h-2 w-[3px] ${color[m.kind]}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-faint tabular-nums">
        <span>0:00</span>
        <span>4:52</span>
      </div>
    </div>
  );
}

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-16">
      <h2 className="max-w-[26ch] text-[22px] leading-snug font-medium text-fg">{title}</h2>
      {lead ? (
        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted">{lead}</p>
      ) : null}
      {children}
    </section>
  );
}

export function Landing() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <nav className="flex items-center justify-between py-6">
        <span className="font-mono text-[15px] font-medium text-butter">butter</span>
        <Link
          href="/api/auth/signin"
          className="border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-faint hover:text-fg"
        >
          Sign in
        </Link>
      </nav>

      <header className="pt-16 pb-12">
        <h1 className="max-w-[20ch] text-[40px] leading-[1.1] font-semibold tracking-tight text-fg sm:text-[52px]">
          Your team reviews every line of code. Nobody reviews the product.
        </h1>
        <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-muted">
          Record yourself using a build and talk through what you are showing, questioning,
          or unsure about. Butter turns the recording, your narration, and what happened
          on screen into timestamped findings — the kind your team can accept, discuss,
          or dismiss, one at a time.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/api/auth/signin"
            className="bg-butter px-4 py-2 text-[14px] font-medium text-ink transition-opacity hover:opacity-90"
          >
            Start a review
          </Link>
          <span className="font-mono text-[12px] text-faint">
            sign in with GitHub
          </span>
        </div>
      </header>

      <div className="pb-16">
        <Finding
          kind="issue"
          time="02:14"
          title="Payment submission has no immediate feedback"
          body="The interface is unchanged for about two seconds after the user submits payment. Nothing indicates the action was received, so the likely response is a second click."
          note="Suggested: move the Pay button into a pending state on submit, before the network call returns."
          evidence={[
            { source: "narration", detail: "“when I hit Pay there's a slight delay here”" },
            { source: "keyframes", detail: "02:14.2 and 02:16.1 are identical" },
            { source: "click", detail: "submit at 02:14.180" },
          ]}
        />
        <Timeline />
      </div>

      <Section
        title="Git remembers what changed. Nothing remembers why."
        lead="Implementation history is preserved carefully — commits, pull requests, review threads. Product reasoning is not. It lives in Slack threads, meeting notes, Loom recordings nobody rewatches, and people's memories. Six months later the question “why is checkout one page?” has no answer, so the decision gets relitigated from scratch."
      />

      <Section
        title="Evidence before opinion"
        lead="Generic interface advice is easy to produce and easy to ignore. A finding is only worth a teammate's attention if it says what it saw."
      >
        <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-5">
            <p className="font-mono text-[11px] text-faint">what tools usually say</p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              Make the button larger and increase contrast.
            </p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-mono text-[11px] text-faint">what a finding says</p>
            <p className="mt-3 text-[14px] leading-relaxed text-fg">
              You asked whether people discover “Create workspace.” It sits below the fold
              at 1440×900, and the cursor moves toward pricing before returning to it.
              Whether that costs conversion is not visible in the recording — funnel
              drop-off by viewport would settle it.
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-[64ch] text-[14px] leading-relaxed text-faint">
          When Butter cannot tell the difference between correlation and cause, it says so
          and names the evidence that would decide it, rather than guessing confidently.
        </p>
      </Section>

      <Section
        title="A review moves like a pull request"
        lead="Every finding is addressed individually, by a person. Butter proposes and gathers; it does not change your product or overrule your team."
      >
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {[
            {
              step: "Record",
              text: "Capture the screen and your microphone while you use the build. Clicks, route changes and viewport are captured alongside it, on one clock.",
            },
            {
              step: "Narrate",
              text: "Say what you are unsure about. A concern you voice outranks anything the review finds on its own.",
            },
            {
              step: "Review",
              text: "Findings arrive on the timeline as issues, suggestions and questions, each with the frames and quotes behind it.",
            },
            {
              step: "Decide",
              text: "Accept, dismiss with a reason, or convert to a GitHub or Linear issue. The decision and its rationale are kept.",
            },
          ].map((s, i) => (
            <li key={s.step} className="flex gap-6 py-4">
              <span className="w-6 shrink-0 pt-0.5 font-mono text-[12px] text-faint tabular-nums">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[14px] font-medium text-fg">{s.step}</h3>
                <p className="mt-1 max-w-[58ch] text-[14px] leading-relaxed text-muted">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="What your team gets out of it"
        lead="The recording is the entry point. What accumulates is the useful part."
      >
        <dl className="mt-8 space-y-6">
          {[
            {
              t: "Review before it ships, not after",
              d: "The person who built it walks through it while it is still cheap to change. Findings land as work, not as a meeting.",
            },
            {
              t: "Dismissals are answers too",
              d: "Marking something intentional records that it was deliberate. The next person to raise it finds the reason instead of reopening the argument.",
            },
            {
              t: "Rationale survives the people who had it",
              d: "Why checkout is one page, when the CTA moved, what evidence there was, and whether it worked — attached to the review where it was decided.",
            },
            {
              t: "Everyone reviews the same thing",
              d: "A teammate opens the review, jumps to 02:14, and sees exactly what you saw. No scheduling, no rewatching a twenty-minute recording to find the moment.",
            },
          ].map((item) => (
            <div key={item.t} className="border-l-2 border-line pl-5">
              <dt className="text-[14px] font-medium text-fg">{item.t}</dt>
              <dd className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
                {item.d}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="border-t border-line py-16">
        <h2 className="text-[22px] font-medium text-fg">Record your next build</h2>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          Butter is early and built in the open. Sign in with GitHub, record a demo, and
          tell us whether the findings were worth reading.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/api/auth/signin"
            className="bg-butter px-4 py-2 text-[14px] font-medium text-ink transition-opacity hover:opacity-90"
          >
            Start a review
          </Link>
          <a
            href="https://github.com/BenjaminLopezRodriguez/butter"
            className="text-[13px] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            Read the source
          </a>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-line py-8">
        <span className="font-mono text-[13px] text-butter">butter</span>
        <span className="font-mono text-[11px] text-faint">butter.ci</span>
      </footer>
    </div>
  );
}
