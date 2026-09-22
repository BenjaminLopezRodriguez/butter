import {
  Comment01Icon,
  Cursor01Icon,
  GitBranchIcon,
  Mic01Icon,
  RecordIcon,
  Search01Icon,
  Tick02Icon,
} from "hugeicons-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ThemeToggle } from "~/app/_components/theme";

const SIGNIN = "/api/auth/signin";

function Wordmark() {
  return (
    <span className="font-mono text-[15px] font-medium tracking-tight text-brand">
      butter
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-6">
          <ThemeToggle />
          <Button asChild size="sm" className="h-8 rounded-full bg-butter px-3 text-[13px] font-medium text-ink hover:bg-butter/90">
            <Link href={SIGNIN}>Start a review</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 -top-40 h-[820px]" />
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-0 text-center">
        <Badge
          variant="outline"
          className="mb-7 rounded-full border-transparent bg-raised px-3.5 py-1.5 font-mono text-[11px] font-normal text-muted"
        >
          Early — built in the open
        </Badge>

        <h1 className="mx-auto max-w-[19ch] text-[46px] leading-[1.02] font-normal tracking-[-0.02em] text-fg sm:text-[68px]">
          Your team reviews every line of code.{" "}
          <span className="font-serif italic text-muted">Nobody reviews the product.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-[58ch] text-[16px] leading-relaxed text-muted sm:text-[17px]">
          Record yourself using a build and talk through what you are unsure about.
          Butter returns timestamped findings — with the frames and quotes behind
          them — that your team accepts, discusses, or dismisses one at a time.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-10 rounded-full bg-butter px-5 text-[14px] font-medium text-ink hover:bg-butter/90">
            <Link href={SIGNIN}>Start a review</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-line/70 bg-transparent px-5 text-[14px] text-fg hover:bg-raised hover:text-fg"
          >
            <Link href="/reviews/demo">See a finished review</Link>
          </Button>
        </div>

        {/* The product, not a picture of an idea of the product. */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="soft-frame rounded-3xl p-[1.5px] shot-shadow">
            <div className="overflow-hidden rounded-[22px] bg-surface">
              <Image
                src="/review-screen.png"
                alt="A Butter review: the recording on the left, findings on the right, timeline markers below."
                width={2424}
                height={1636}
                priority
                className="w-full"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Bento() {
  const cell = "rounded-2xl bg-surface/80 p-7 soft-ring";

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="max-w-[24ch] text-[32px] leading-tight font-normal tracking-[-0.015em] text-fg sm:text-[40px]">
        A finding carries its <span className="font-serif italic">evidence</span>.
      </h2>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">
        Generic interface advice is easy to produce and easy to ignore. Everything
        Butter files points at the frame, the quote, or the event it came from.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className={`${cell} md:col-span-2`}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-issue">
              <Alert />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-issue/15 px-2.5 py-0.5 font-mono text-[11px] text-issue">
                  issue
                </span>
                <span className="font-mono text-[12px] text-muted tabular-nums">02:14</span>
                <span className="font-mono text-[11px] text-faint">strong evidence</span>
              </div>
              <h3 className="mt-3 text-[15px] font-medium text-fg">
                Payment submission has no immediate feedback
              </h3>
              <dl className="mt-4 space-y-1.5">
                {[
                  ["narration", "“when I hit Pay there's a slight delay here”"],
                  ["keyframes", "02:14.2 and 02:16.1 are identical"],
                  ["click", "submit at 02:14.180"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 font-mono text-[12px]">
                    <dt className="w-20 shrink-0 text-faint">{k}</dt>
                    <dd className="text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className={cell}>
          <Search01Icon size={18} className="text-question" strokeWidth={1.5} />
          <h3 className="mt-4 text-[15px] font-medium text-fg">
            It says when it does not know
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            An open question names the data that would settle it instead of guessing
            confidently. Correlation is not reported as cause.
          </p>
        </div>

        <div className={cell}>
          <Tick02Icon size={18} className="text-suggestion" strokeWidth={1.5} />
          <h3 className="mt-4 text-[15px] font-medium text-fg">Dismissals are answers</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Marking something intentional records that it was deliberate, so the next
            person finds the reason instead of reopening the argument.
          </p>
        </div>

        <div className={cell}>
          <GitBranchIcon size={18} className="text-muted" strokeWidth={1.5} />
          <h3 className="mt-4 text-[15px] font-medium text-fg">Tied to the build</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Every review carries its branch and commit, so a finding points at a
            version of the product rather than a memory of it.
          </p>
        </div>

        <div className={cell}>
          <Comment01Icon size={18} className="text-muted" strokeWidth={1.5} />
          <h3 className="mt-4 text-[15px] font-medium text-fg">Reviewed like a PR</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Each finding is addressed on its own — accepted, discussed, dismissed with
            a reason, or sent to GitHub or Linear as an issue.
          </p>
        </div>
      </div>
    </section>
  );
}

function Alert() {
  return (
    <span className="block h-2 w-2 rounded-full bg-issue" aria-hidden />
  );
}

function Editorial() {
  return (
    <section className="bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="text-[32px] leading-tight font-normal tracking-[-0.015em] text-fg sm:text-[40px]">
            Git remembers what changed.{" "}
            <span className="font-serif italic text-muted">Nothing remembers why.</span>
          </h2>
        </div>
        <div className="space-y-5 text-[15px] leading-relaxed text-muted">
          <p>
            Implementation history is preserved carefully — commits, pull requests,
            review threads. Product reasoning is not. It lives in Slack threads,
            meeting notes, recordings nobody rewatches, and people&apos;s memories.
          </p>
          <p>
            Six months later, <span className="text-fg">why is checkout one page?</span>{" "}
            has no answer, so the decision gets relitigated from scratch by people who
            were not there the first time.
          </p>
          <p>
            Butter keeps the reasoning attached to the moment it was made — the
            recording, the narration, the discussion, and what the team decided.
          </p>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    { icon: RecordIcon, title: "Record", text: "Capture the screen while you use the build. Clicks, route changes and viewport are captured on the same clock." },
    { icon: Mic01Icon, title: "Narrate", text: "Say what you are unsure about. A concern you voice outranks anything the review finds on its own." },
    { icon: Cursor01Icon, title: "Review", text: "Findings land on the timeline as issues, suggestions and questions, each with its evidence attached." },
    { icon: Tick02Icon, title: "Decide", text: "Accept, dismiss with a reason, or convert to an issue. The decision and its rationale are kept." },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-[32px] leading-tight font-normal tracking-[-0.015em] text-fg sm:text-[40px]">
        How a review <span className="font-serif italic">moves</span>
      </h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title}>
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-butter" strokeWidth={1.5} />
              <span className="font-mono text-[11px] text-faint tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <Separator className="my-4 bg-line/60" />
            <h3 className="text-[15px] font-medium text-fg">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-[20ch] text-[34px] leading-tight font-normal tracking-[-0.015em] text-fg sm:text-[44px]">
          Record your <span className="font-serif italic">next build</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted">
          Butter is early and built in the open. Sign in with GitHub, record a demo,
          and tell us whether the findings were worth reading.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-10 rounded-full bg-butter px-5 text-[14px] font-medium text-ink hover:bg-butter/90">
            <Link href={SIGNIN}>Start a review</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-full px-5 text-[14px] text-muted hover:bg-raised hover:text-fg"
          >
            <Link href="/reviews/demo">See a finished review</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <Hero />
      <Bento />
      <Editorial />
      <How />
      <Close />
      <footer>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Wordmark />
          <span className="font-mono text-[11px] text-faint">butter.ci</span>
        </div>
      </footer>
    </div>
  );
}
