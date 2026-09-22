import { type ReviewData } from "~/app/_components/review-screen";

export const demoReview: ReviewData = {
  title: "Checkout redesign — payment flow",
  branch: "feat/checkout-redesign",
  commit: "4f7c21a",
  durationMs: 288000,
  findings: [
    { id: "question-cta", kind: "question", time: "01:31", timestampMs: 91000, title: "Does placing the CTA after the order summary reduce completion?", body: "The call to action moves below the order summary at this viewport. The recording shows the layout, but not whether the placement changes completion.", severity: "medium", confidence: "needs_investigation", neededEvidence: "Completion rate by checkout layout and viewport, with enough sessions to compare the two placements.", evidence: [{ source: "keyframe", detail: "CTA begins below the summary at 01:31" }, { source: "funnel", detail: "not connected to this review" }] },
    { id: "suggestion-mobile", kind: "suggestion", time: "01:36", timestampMs: 96000, title: "Mobile CTA requires additional scrolling", body: "At the captured mobile viewport, payment fields and the order summary push the CTA beyond the initial view.", severity: "low", confidence: "some", evidence: [{ source: "viewport", detail: "390 × 844 at 01:36" }, { source: "scroll", detail: "CTA enters after 312px scroll" }] },
    { id: "issue-payment", kind: "issue", time: "02:14", timestampMs: 134000, title: "Payment submission has no immediate feedback", body: "The interface is unchanged after payment is submitted. With no pending state, a second click is a plausible response.", severity: "high", confidence: "strong", evidence: [{ source: "narration", detail: "“when I hit Pay there’s a slight delay here”" }, { source: "keyframes", detail: "02:14.2 and 02:16.1 are identical" }, { source: "click", detail: "submit at 02:14.180" }] },
  ],
};
