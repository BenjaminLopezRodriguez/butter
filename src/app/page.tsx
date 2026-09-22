import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();
  const reviews = session?.user ? await api.review.list() : [];

  return (
    <HydrateClient>
      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <header className="mb-12 flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Butter</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Reviews your product like your team reviews code.
              </p>
            </div>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-600 hover:text-white"
            >
              {session ? "Sign out" : "Sign in with GitHub"}
            </Link>
          </header>

          {!session?.user ? (
            <p className="text-sm text-neutral-500">
              Sign in to record a demo and get timestamped findings.
            </p>
          ) : reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 p-10 text-center">
              <p className="text-sm text-neutral-400">No reviews yet.</p>
              <p className="mt-1 text-xs text-neutral-600">
                Record a demo, narrate what you are unsure about, and Butter files findings against it.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-900 border-y border-neutral-900">
              {reviews.map((review) => (
                <li key={review.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">{review.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {review.gitBranch ?? "no branch"} · {review.status}
                    </p>
                  </div>
                  <Link
                    href={`/reviews/${review.id}`}
                    className="text-xs text-neutral-400 hover:text-white"
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
