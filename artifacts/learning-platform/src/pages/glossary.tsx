import { useState, useMemo, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import MascotSticker from "@/components/MascotSticker";
import { GLOSSARY, type GlossaryTerm } from "@/data/glossary";

// course tag colours
const COURSE_COLORS: Record<string, string> = {
  "Foundations of Probability": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Logic & Critical Thinking":  "bg-violet-50 text-violet-700 border-violet-200",
  "CS Fundamentals":            "bg-sky-50 text-sky-700 border-sky-200",
  "Data Analysis Essentials":   "bg-emerald-50 text-emerald-700 border-emerald-200",
  "The Geometry of Chance":     "bg-amber-50 text-amber-700 border-amber-200",
  "Neural Networks":            "bg-rose-50 text-rose-700 border-rose-200",
  "Physics of Motion":          "bg-purple-50 text-purple-700 border-purple-200",
};

function termColor(courseTitle: string) {
  return COURSE_COLORS[courseTitle] ?? "bg-gray-50 text-gray-700 border-gray-200";
}

function firstLetter(terms: GlossaryTerm[]) {
  return [...new Set(terms.map((t) => t.term[0].toUpperCase()))].sort();
}

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const letterRefs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.courseTitle.toLowerCase().includes(q)
    );
  }, [search]);

  // Group by first letter
  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(term);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = useMemo(() => firstLetter(filtered), [filtered]);

  function scrollTo(letter: string) {
    letterRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 font-display">Glossary</h1>
            <p className="text-muted-foreground">
              {GLOSSARY.length} key terms — search or browse A–Z
            </p>
          </div>
          <MascotSticker pose="study" size={145} className="flex-shrink-0" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="glossary-search"
            placeholder="Search terms, definitions, or courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-11"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* A–Z jump strip (hidden when searching) */}
        {!search && (
          <div className="flex flex-wrap gap-1 mb-6">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollTo(letter)}
                className="w-8 h-8 rounded-lg text-xs font-bold text-muted-foreground hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Results count when filtering */}
        {search && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length === 0 ? "No results" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </p>
        )}

        {/* Term groups */}
        {groups.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No terms found</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(([letter, terms], gi) => (
              <section
                key={letter}
                ref={(el) => { letterRefs.current[letter] = el; }}
              >
                {/* Letter divider */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-black text-indigo-500 w-8">{letter}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  {terms.map((term, ti) => (
                    <motion.div
                      key={term.term}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (gi * 0.03 + ti * 0.02) }}
                      className="bg-card border border-card-border rounded-2xl px-5 py-4 flex gap-4 items-start"
                    >
                      {/* Term + definition */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base mb-1">{term.term}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {term.definition}
                        </p>
                      </div>

                      {/* Right: course tag + lesson link */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${termColor(term.courseTitle)}`}
                        >
                          {term.courseTitle}
                        </span>
                        <Link href={`/lessons/${term.lessonId}`}>
                          <span className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap transition-colors cursor-pointer">
                            → {term.lessonTitle}
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
