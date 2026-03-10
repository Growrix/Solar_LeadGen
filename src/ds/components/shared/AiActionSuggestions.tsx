import * as React from "react";

import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AiSuggestion = {
  id: string;
  label: string;
  onSelect?: () => void;
};

export type AiActionSuggestionsProps = {
  suggestions: AiSuggestion[];
  label?: string;
  className?: string;
};

export function AiActionSuggestions({ suggestions, label = "Suggestions", className }: AiActionSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div className={cx("ui-ai-suggestions", className)} aria-label={label}>
      {suggestions.map((s) => (
        <Button key={s.id} size="sm" variant="secondary" onClick={s.onSelect}>
          {s.label}
        </Button>
      ))}
    </div>
  );
}
