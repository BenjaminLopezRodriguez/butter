import { notFound } from "next/navigation";

import { ReviewScreen, type ReviewData } from "~/app/_components/review-screen";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

const formatTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000).toString().padStart(2, "0");
  return `${minutes.toString().padStart(2, "0")}:${seconds}`;
};

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const review = await api.review.byId({ id });
  if (!review) notFound();

  const data: ReviewData = {
    title: review.title,
    branch: review.gitBranch ?? "no branch",
    commit: review.gitCommit?.slice(0, 7) ?? "uncommitted",
    durationMs: review.durationMs ?? 1,
    findings: review.findings.map((finding) => ({
      id: finding.id,
      kind: finding.type === "observation" ? "question" : finding.type,
      time: formatTime(finding.timestampMs),
      timestampMs: finding.timestampMs,
      title: finding.title,
      body: finding.body,
      severity: finding.severity,
      confidence: finding.confidence,
      neededEvidence: finding.neededEvidence?.join(" "),
      status: finding.status,
      evidence: finding.evidence.map((item) => ({
        source: item.source,
        detail: item.summary ?? item.label,
      })),
    })),
  };

  return (
    <HydrateClient>
      <ReviewScreen review={data} />
    </HydrateClient>
  );
}
