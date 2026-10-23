import type { MockTest } from "@/backend";
import { Variant_fullLength_topicWise } from "@/backend";
import type { AnswerValue } from "@/components/tests/QuestionView";
import { ResultSummary } from "@/components/tests/ResultSummary";
import { TestCard } from "@/components/tests/TestCard";
import {
  TestFilterBar,
  type TestFilters,
} from "@/components/tests/TestFilterBar";
import { TestRunner } from "@/components/tests/TestRunner";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTests } from "@/hooks/useQueries";
import { AlertCircle, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

type RunnerState =
  | { phase: "list" }
  | { phase: "running"; test: MockTest }
  | { phase: "result"; test: MockTest; answers: Record<number, AnswerValue> };

export default function MockTestsPage() {
  const { data: tests, isLoading, isError, refetch } = useTests();
  const [filters, setFilters] = useState<TestFilters>({
    level: null,
    skill: null,
  });
  const [runner, setRunner] = useState<RunnerState>({ phase: "list" });

  const filtered = useMemo(() => {
    const list = tests ?? [];
    return list.filter(
      (test) =>
        (filters.level === null || test.level === filters.level) &&
        (filters.skill === null || test.skill === filters.skill),
    );
  }, [tests, filters]);

  const fullLength = useMemo(
    () =>
      filtered.filter(
        (test) => test.kind === Variant_fullLength_topicWise.fullLength,
      ),
    [filtered],
  );
  const topicWise = useMemo(
    () =>
      filtered.filter(
        (test) => test.kind === Variant_fullLength_topicWise.topicWise,
      ),
    [filtered],
  );

  if (runner.phase === "running") {
    return (
      <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <TestRunner
          test={runner.test}
          onSubmit={(answers) =>
            setRunner({ phase: "result", test: runner.test, answers })
          }
          onExit={() => setRunner({ phase: "list" })}
        />
      </div>
    );
  }

  if (runner.phase === "result") {
    return (
      <div className="page-enter mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Results"
          title="Test summary"
          description="Your score, an estimated CEFR level and a full question-by-question review."
        />
        <div className="mt-8">
          <ResultSummary
            test={runner.test}
            answers={runner.answers}
            onRetake={() => setRunner({ phase: "running", test: runner.test })}
            onExit={() => setRunner({ phase: "list" })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Practice"
        title="Mock Tests"
        description="Full-length and topic-wise practice tests with a timed runner, question navigator and a CEFR result estimate."
      />

      <div className="mt-8 flex flex-col gap-6">
        <TestFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load tests"
            description="Something went wrong while fetching the mock tests. Please try again."
            action={
              <button
                type="button"
                data-ocid="tests.retry_button"
                onClick={() => void refetch()}
                className="rounded-full border border-primary/50 bg-primary/15 px-5 py-2 text-sm font-medium text-primary transition-smooth hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Retry
              </button>
            }
          />
        ) : (
          <Tabs defaultValue={Variant_fullLength_topicWise.fullLength}>
            <TabsList
              data-ocid="tests.kind.tab"
              className="h-11 w-full max-w-md rounded-full bg-muted p-1"
            >
              <TabsTrigger
                value={Variant_fullLength_topicWise.fullLength}
                data-ocid="tests.kind.full_length_tab"
                className="rounded-full"
              >
                Full-Length
              </TabsTrigger>
              <TabsTrigger
                value={Variant_fullLength_topicWise.topicWise}
                data-ocid="tests.kind.topic_wise_tab"
                className="rounded-full"
              >
                Topic-Wise
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value={Variant_fullLength_topicWise.fullLength}
              className="mt-6"
            >
              <TestGrid
                tests={fullLength}
                onStart={(test) => setRunner({ phase: "running", test })}
              />
            </TabsContent>
            <TabsContent
              value={Variant_fullLength_topicWise.topicWise}
              className="mt-6"
            >
              <TestGrid
                tests={topicWise}
                onStart={(test) => setRunner({ phase: "running", test })}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function TestGrid({
  tests,
  onStart,
}: {
  tests: MockTest[];
  onStart: (test: MockTest) => void;
}) {
  if (tests.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No tests match your filters"
        description="Try clearing a level or skill filter to see more practice tests."
      />
    );
  }

  return (
    <div
      data-ocid="tests.list"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tests.map((test, index) => (
        <TestCard
          key={String(test.id)}
          test={test}
          index={index}
          onStart={onStart}
        />
      ))}
    </div>
  );
}
