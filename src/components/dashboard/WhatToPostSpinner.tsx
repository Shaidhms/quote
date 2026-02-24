"use client";

import { useState, useCallback } from "react";
import { Dices, Sparkles, RotateCw } from "lucide-react";

const OPTIONS = {
  postType: ["Quote Card", "News Take", "Personal Story", "Tutorial", "Poll", "Case Study", "Behind the Scenes"],
  platform: ["LinkedIn", "@meshaid", "@ai360withshaid"],
  topic: ["Artificial Intelligence", "Productivity", "Leadership", "Personal Brand", "Tech News", "Automation", "Career Growth"],
  mood: ["Inspiring", "Educational", "Conversational", "Bold", "Reflective", "Humorous"],
};

const LABELS: Record<string, { label: string; color: string; bg: string }> = {
  postType: { label: "Type", color: "text-blue-700", bg: "bg-blue-50" },
  platform: { label: "Platform", color: "text-purple-700", bg: "bg-purple-50" },
  topic: { label: "Topic", color: "text-emerald-700", bg: "bg-emerald-50" },
  mood: { label: "Mood", color: "text-amber-700", bg: "bg-amber-50" },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function WhatToPostSpinner() {
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = useCallback(() => {
    setSpinning(true);
    setResult(null);

    // Rapid shuffling effect
    const interval = setInterval(() => {
      setResult({
        postType: pickRandom(OPTIONS.postType),
        platform: pickRandom(OPTIONS.platform),
        topic: pickRandom(OPTIONS.topic),
        mood: pickRandom(OPTIONS.mood),
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setResult({
        postType: pickRandom(OPTIONS.postType),
        platform: pickRandom(OPTIONS.platform),
        topic: pickRandom(OPTIONS.topic),
        mood: pickRandom(OPTIONS.mood),
      });
      setSpinning(false);
    }, 800);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dices className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-semibold text-slate-700">
            What Should I Post?
          </h3>
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            spinning
              ? "bg-purple-100 text-purple-400"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-pink-700"
          }`}
        >
          {spinning ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              Spinning...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {result ? "Spin Again" : "Spin!"}
            </>
          )}
        </button>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(LABELS) as Array<keyof typeof LABELS>).map((key) => {
              const cfg = LABELS[key];
              return (
                <div
                  key={key}
                  className={`${cfg.bg} rounded-xl px-3 py-2.5 text-center transition-all ${
                    spinning ? "animate-pulse" : ""
                  }`}
                >
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {cfg.label}
                  </p>
                  <p className={`text-xs font-bold ${cfg.color}`}>
                    {result[key]}
                  </p>
                </div>
              );
            })}
          </div>

          {!spinning && (
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-sm text-slate-700">
                Write a{" "}
                <span className="font-bold text-amber-600">{result.mood}</span>{" "}
                <span className="font-bold text-blue-600">
                  {result.postType}
                </span>{" "}
                about{" "}
                <span className="font-bold text-emerald-600">
                  {result.topic}
                </span>{" "}
                for{" "}
                <span className="font-bold text-purple-600">
                  {result.platform}
                </span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
          <Dices className="w-8 h-8 text-slate-300" />
          <p className="text-xs">
            Feeling stuck? Hit spin for a creative prompt!
          </p>
        </div>
      )}
    </div>
  );
}
