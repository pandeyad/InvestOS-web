import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

  const accent = "var(--md-primary)";
  const accentContainer = "var(--md-primary-container)";

  return (
    <div className="max-w-[880px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-1.5">Lessons</h1>
      <p className="md-body-medium text-on-surface-variant mb-6 m-0">
        Rules distilled from closed trades. They update as the journal grows.
      </p>

      {lessons === null && <p className="text-on-surface-variant">Loading…</p>}

      {lessons && lessons.length === 0 && (
        <div
          className="bg-surface-container-low border rounded-2xl p-10 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <span
            className="material-symbols-rounded mb-3 text-on-surface-variant"
            style={{ fontSize: 48 }}
          >
            menu_book
          </span>
          <div className="md-title-medium mb-1">No consolidated lessons yet</div>
          <div className="text-[13px] text-on-surface-variant">
            They appear after ~10 closed trades.
          </div>
        </div>
      )}

      {lessons?.map((l, i) => {
        const rules = l.rules
          .split(/\n+/)
          .map((s) => s.trim().replace(/^[0-9]+[\.\)]\s*/, ""))
          .filter(Boolean);
        return (
          <div
            key={l.id}
            className="bg-surface-container-low border rounded-2xl p-6 mb-4.5 shadow-card animate-card-in"
            style={{
              borderColor: "var(--md-outline-variant)",
              animationDelay: `${i * 90}ms`,
              marginBottom: 18,
            }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className="grid place-items-center w-9 h-9 rounded-xl"
                style={{ background: accentContainer, color: accent }}
              >
                <span className="material-symbols-rounded ms-fill">lightbulb</span>
              </span>
              <div>
                <div className="md-title-medium">Distilled from {l.source_count} closed trades</div>
                <div className="text-[12.5px] text-on-surface-variant">
                  {l.created_at.slice(0, 10)}
                </div>
              </div>
            </div>
            {rules.map((text, j) => (
              <div
                key={j}
                className="flex gap-3.5 py-2.5 border-t animate-row-in"
                style={{
                  borderColor: "var(--md-outline-variant)",
                  animationDelay: `${j * 60}ms`,
                }}
              >
                <span
                  className="material-symbols-rounded flex-none"
                  style={{ fontSize: 20, color: accent }}
                >
                  check_circle
                </span>
                <span className="md-body-large" style={{ lineHeight: 1.55 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
