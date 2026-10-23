import { GlowCard } from "@/components/effects/GlowCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/useQueries";
import { timestampToDate } from "@/utils/time";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Library,
  Link2,
  Megaphone,
  Mic,
  PenLine,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModuleCard {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  levels: string;
}

const modules: ModuleCard[] = [
  {
    title: "Mock Tests",
    description:
      "Full-length and topic-wise papers with a timed runner, question navigator and a CEFR result estimate.",
    to: "/mock-tests",
    icon: Sparkles,
    levels: "B1 · B2 · C1",
  },
  {
    title: "Reading",
    description:
      "Graded passages with multiple-choice and matching questions, a highlighter and a study timer.",
    to: "/reading",
    icon: BookOpen,
    levels: "B1 · B2 · C1",
  },
  {
    title: "Listening",
    description:
      "Audio practice with a custom player, playback speeds, skip controls and question sets.",
    to: "/listening",
    icon: Headphones,
    levels: "B1 · B2 · C1",
  },
  {
    title: "Speaking",
    description:
      "Question cards with prep and speaking countdowns plus a voice recorder you can replay.",
    to: "/speaking",
    icon: Mic,
    levels: "B1 · B2 · C1",
  },
  {
    title: "Writing",
    description:
      "Essay prompts with a live word counter, autosaved drafts and a collapsible model answer.",
    to: "/writing",
    icon: PenLine,
    levels: "B1 · B2 · C1",
  },
  {
    title: "Dictionary",
    description:
      "Definitions, synonyms, pronunciation and a CEFR level badge, with saved words and flashcards.",
    to: "/dictionary",
    icon: Library,
    levels: "B1 · B2 · C1",
  },
];

function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HomePage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const latest = (announcements ?? []).slice(0, 3);

  return (
    <div className="page-enter">
      <section className="relative overflow-hidden border-b border-border">
        <img
          src="/assets/generated/hero-cefr-abstract.dim_1536x1024.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="size-3.5" aria-hidden="true" />
            B1 · B2 · C1 Exam Preparation
          </span>
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-7xl">
            Elevate Your English.{" "}
            <span className="text-gradient">Master the CEFR Levels</span> with
            Expert-Led Practice.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            A complete study workspace for B1, B2 and C1 learners — timed mock
            tests, graded reading and listening, speaking and writing practice,
            and a dictionary that tracks the words you save.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/mock-tests"
              data-ocid="home.primary_button"
              className="btn-neon inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explore Modules
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/reading"
              data-ocid="home.secondary_button"
              className="btn-neon-accent inline-flex items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start Reading Practice
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Practice Modules"
          title="Everything you need in one workspace"
          description="Six focused modules, each built around real exam tasks and graded by CEFR level."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.to}
                to={module.to}
                data-ocid={`home.module.${module.title.toLowerCase()}_link`}
                className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GlowCard className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
                      {module.levels}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Open module
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </GlowCard>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Announcements"
            title="Latest from your teacher"
            description="New material, exam dates and study tips posted by the admin."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {isLoading &&
              Array.from({ length: 3 }, (_, i) => `announcement-${i}`).map(
                (id) => <Skeleton key={id} className="h-40 rounded-2xl" />,
              )}
            {!isLoading && latest.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No announcements yet. Check back soon for new study material.
              </p>
            )}
            {latest.map((announcement) => (
              <GlowCard
                key={announcement.id.toString()}
                className="flex flex-col gap-3 p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Megaphone className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {announcement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {announcement.body}
                </p>
                <time className="mt-auto font-mono text-xs text-muted-foreground">
                  {formatDate(announcement.createdAt)}
                </time>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <GlowCard className="flex flex-col items-center gap-6 p-10 text-center md:p-16">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Link2 className="size-6" aria-hidden="true" />
          </span>
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Curated resources, all in one directory
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Hand-picked external sites for grammar, vocabulary, listening and
            exam strategy — organised by category and CEFR level.
          </p>
          <Link
            to="/links"
            data-ocid="home.links_button"
            className="btn-neon inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse the directory
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </GlowCard>
      </section>
    </div>
  );
}
