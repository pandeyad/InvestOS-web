import { loginUrl } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

export function Landing() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-4">My trading journal</h1>
      <p className="text-zinc-400 mb-6">
        What I'm buying, when, why, and how it played out. Sign in with Google to
        see today's trades, history, and per-stock results. If any of it helps you,
        there's a tip jar.
      </p>
      <a
        href={loginUrl("/today")}
        className="inline-block px-4 py-2 rounded bg-zinc-100 text-zinc-900 hover:bg-white font-medium"
      >
        Sign in with Google
      </a>
      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
