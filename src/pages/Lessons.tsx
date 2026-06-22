import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

type Lesson = {
  id: number;
  source_count: number;
  rules: string;
  is_active: boolean;
  created_at: string;
};

export function Lessons() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);

  useEffect(() => {
    api<Lesson[]>("/public/lessons").then((r) => setLessons(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Lessons</h1>
      <Disclaimer />
      {lessons === null && <p className="text-zinc-500">Loading…</p>}
      {lessons && lessons.length === 0 && (
        <p className="text-zinc-500">No consolidated lessons yet. They appear after ~10 closed trades.</p>
      )}
      {lessons?.map((l) => (
        <div key={l.id} className="border border-zinc-800 rounded p-4 mb-4">
          <div className="text-xs text-zinc-500 mb-2">
            Distilled from {l.source_count} closed trades · {l.created_at.slice(0, 10)}
          </div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans">{l.rules}</pre>
        </div>
      ))}
    </div>
  );
}
