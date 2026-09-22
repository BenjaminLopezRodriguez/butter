import Link from "next/link";

import { ReviewPlayer, type Pin } from "~/app/_components/review-player";

const pins: Pin[] = [
  {
    id: "question-cta",
    kind: "question",
    x: 63,
    y: 72,
    atMs: 7_000,
    author: "Butter",
    initials: "B",
    title: "Does the CTA below the order summary reduce completion?",
    body: "The call to action moves below the summary at this viewport. The recording shows the layout, but not whether the placement changes completion.",
    evidence: "Would need: completion rate by layout and viewport. Not connected to this review.",
  },
  {
    id: "suggestion-mobile",
    kind: "suggestion",
    x: 27,
    y: 40,
    atMs: 14_000,
    author: "Butter",
    initials: "B",
    title: "Mobile CTA requires additional scrolling",
    body: "At the captured mobile viewport, the payment fields and summary push the button past the first screen.",
    evidence: "viewport 390 × 844 · CTA enters after 312px scroll",
  },
  {
    id: "issue-payment",
    kind: "issue",
    x: 40,
    y: 84,
    atMs: 25_000,
    author: "Butter",
    initials: "B",
    title: "Payment submission has no immediate feedback",
    body: "The interface is unchanged after payment is submitted. With no pending state, a second click is a plausible response.",
    evidence: "“when I hit Pay there's a slight delay here” · frames at 02:14.2 and 02:16.1 identical",
  },
];

/** The screen under review. Deliberately plain — the comments are the subject. */
function CheckoutSurface() {
  return (
    <div className="absolute inset-0 bg-[#f6f3ee] p-8 text-[#1c1a17]">
      <div className="mx-auto flex h-full max-w-2xl flex-col">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a8177]">RELAY</p>

        <h2 className="mt-5 text-[22px] font-semibold">Complete your order</h2>

        <div className="mt-6 grid flex-1 grid-cols-5 gap-8">
          <div className="col-span-3 space-y-4">
            <div>
              <label className="text-[12px] text-[#6d655c]">Card number</label>
              <div className="mt-1.5 rounded-xl bg-white px-3 py-2.5 text-[13px] text-[#9b938a] shadow-sm">
                4242 4242 4242 4242
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#6d655c]">Expiry</label>
                <div className="mt-1.5 rounded-xl bg-white px-3 py-2.5 text-[13px] text-[#9b938a] shadow-sm">08 / 28</div>
              </div>
              <div>
                <label className="text-[12px] text-[#6d655c]">CVC</label>
                <div className="mt-1.5 rounded-xl bg-white px-3 py-2.5 text-[13px] text-[#9b938a] shadow-sm">•••</div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a8177]">ORDER SUMMARY</p>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between"><dt className="text-[#6d655c]">Pro plan</dt><dd>$84.00</dd></div>
              <div className="flex justify-between"><dt className="text-[#6d655c]">Tax</dt><dd>$0.00</dd></div>
              <div className="mt-3 flex justify-between border-t border-[#e2dcd3] pt-3 font-medium"><dt>Total</dt><dd>$84.00</dd></div>
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-[#1c1a17] py-3 text-center text-[14px] font-medium text-white">
          Pay $84.00
        </div>
      </div>
    </div>
  );
}

export default function DemoReviewPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-10">
      <div className="mx-auto mb-6 max-w-5xl">
        <Link href="/" className="font-mono text-[14px] font-medium text-brand">
          butter
        </Link>
      </div>

      <ReviewPlayer
        title="Checkout redesign — payment flow"
        branch="feat/checkout-redesign @ 4f7c21a"
        durationMs={38_000}
        pins={pins}
      >
        <CheckoutSurface />
      </ReviewPlayer>

      <p className="mx-auto mt-8 max-w-5xl text-[13px] text-faint">
        An example review. Press play — comments appear at the moment they were left.
      </p>
    </main>
  );
}
