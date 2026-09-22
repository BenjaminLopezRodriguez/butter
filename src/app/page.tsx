import Link from "next/link";

import { Landing } from "~/app/_components/landing";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <HydrateClient>
        <main className="min-h-screen bg-ink">
          <Landing />
        </main>
      </HydrateClient>
    );
  }

  const reviews = await api.review.list();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-ink">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="flex items-center justify-between border-b border-line py-6">
            <span className="font-mono text-[15px] font-medium text-butter">butter</span>
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-faint">{session.user.name}</span>
              <Link
                href="/api/auth/signout"
                className="border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-faint hover:text-fg"
              >
                Sign out
              </Link>
            </div>
          </nav>

          <div className="flex items-baseline justify-between py-8">
            <h1 className="text-[20px] font-medium text-fg">Reviews</h1>
            <Link
              href="/reviews/new"
              className="bg-butter px-3 py-1.5 text-[13px] font-medium text-ink transition-opacity hover:opacity-90"
            >
              New review
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="border border-dashed border-line px-6 py-16 text-center">
              <p className="text-[14px] text-muted">No reviews yet.</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[13px] leading-relaxed text-faint">
                Record a demo of your build and narrate what you are unsure about. Findings
                come back on the timeline, ready to accept or dismiss.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {reviews.map((review) => (
                <li key={review.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-[14px] font-medium text-fg">{review.title}</p>
                    <p className="mt-1 font-mono text-[12px] text-faint">
                      {review.gitBranch ?? "no branch"} · {review.status}
                    </p>
                  </div>
                  <Link
                    href={`/reviews/${review.id}`}
                    className="text-[13px] text-muted transition-colors hover:text-fg"
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
