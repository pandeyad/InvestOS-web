import { Disclaimer } from "@/components/Disclaimer";

export function About() {
  return (
    <div className="max-w-2xl prose prose-invert">
      <h1 className="text-2xl font-semibold mb-4">About</h1>
      <Disclaimer />
      <p className="text-zinc-300 mb-4">
        This is my personal trading journal. I run a NIFTY-100 equity rotation system
        that picks trades pre-market, places them at open, and manages exits via
        trailing stops and OCO GTTs. I publish the same trades I take, with reasoning,
        so anyone curious can follow along.
      </p>
      <p className="text-zinc-300 mb-4">
        I am not a SEBI-registered investment adviser or research analyst. Nothing
        here is a recommendation. If you choose to act on anything you read here, that
        is your decision and your risk.
      </p>
      <p className="text-zinc-300 mb-4">
        If this journal helps you, the tip jar is at <a className="text-amber-400 underline" href="/tip-jar">/tip-jar</a>.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-zinc-400">pandeyad22 [at] gmail [dot] com</p>
    </div>
  );
}
