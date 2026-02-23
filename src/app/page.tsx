import Link from "next/link";
import { BookOpen, Newspaper, LayoutGrid, CalendarDays, ArrowRight, Sparkles, Quote, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Quote Cards",
    description: "60 days of book wisdom turned into beautiful, shareable quote cards with multiple templates.",
    color: "bg-blue-50 text-blue-600 border-blue-200/60",
  },
  {
    icon: Newspaper,
    title: "AI News Hub",
    description: "Curate trending AI news, generate captions and images automatically with AI.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  },
  {
    icon: LayoutGrid,
    title: "Content Hub",
    description: "Plan, create, and track posts across LinkedIn and Instagram from one dashboard.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
  },
  {
    icon: CalendarDays,
    title: "Smart Calendar",
    description: "Visual scheduling with date conflict detection — never double-book a post day.",
    color: "bg-purple-50 text-purple-600 border-purple-200/60",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">QuotePost</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-6 border border-blue-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Content Creation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
          Create Stunning Content for{" "}
          <span className="text-blue-600">LinkedIn</span> &{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Instagram
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered quote cards, trending news curation, and a complete content hub
          — plan, create, and track your social media posts all in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-base transition-colors shadow-lg shadow-blue-600/25"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-center gap-8 md:gap-16 text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-slate-900">
              <Quote className="w-5 h-5 text-blue-600" />
              60
            </div>
            <p className="text-sm text-slate-500 mt-1">Quote Cards</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-slate-900">
              <Zap className="w-5 h-5 text-emerald-600" />
              AI
            </div>
            <p className="text-sm text-slate-500 mt-1">Powered Captions</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-slate-900">
              3
            </div>
            <p className="text-sm text-slate-500 mt-1">Platforms</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          Everything you need to grow your presence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border ${f.color} mb-4`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to level up your content game?
          </h2>
          <p className="text-blue-100 mb-8">
            Start creating professional content for LinkedIn and Instagram today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-blue-600 bg-white hover:bg-blue-50 rounded-xl font-medium text-base transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        QuotePost &copy; 2026 &middot; Built for content creators
      </footer>
    </div>
  );
}
