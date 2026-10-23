import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";

interface ModelAnswerProps {
  answer: string;
  /** Stable id so multiple prompts on one page keep independent open state. */
  value: string;
}

/** Collapsible model answer revealed on demand for a writing prompt. */
export function ModelAnswer({ answer, value }: ModelAnswerProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={value}
        className="overflow-hidden rounded-xl border border-border bg-muted/40 px-4"
      >
        <AccordionTrigger
          data-ocid="writing.model_answer_toggle"
          className="text-sm font-semibold text-foreground hover:no-underline"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            Model answer
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p
            data-ocid="writing.model_answer"
            className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {answer}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
