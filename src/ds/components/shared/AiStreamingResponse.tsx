import * as React from "react";

import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AiStreamingResponseProps = {
  text: string;
  isStreaming?: boolean;
  emptyPlaceholder?: React.ReactNode;
  className?: string;
};

export function AiStreamingResponse({ text, isStreaming, emptyPlaceholder = "—", className }: AiStreamingResponseProps) {
  const show = text?.length ? text : "";

  return (
    <div className={cx("ui-ai-stream", className)} aria-live={isStreaming ? "polite" : undefined}>
      {show ? (
        <Text>{show}</Text>
      ) : (
        <Text tone="muted">{emptyPlaceholder}</Text>
      )}
      {isStreaming ? <span className="ui-ai-stream__cursor" aria-hidden="true" /> : null}
    </div>
  );
}
