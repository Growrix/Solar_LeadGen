import * as React from "react";

import { Alert } from "../components/shared/Alert";
import { Stack } from "../primitives/Stack";
import { Text } from "../primitives/Text";

export type ErrorBlockProps = {
  title?: string;
  message?: string;
  actions?: React.ReactNode;
};

export function ErrorBlock({ title = "Something went wrong", message, actions }: ErrorBlockProps) {
  return (
    <Alert tone="danger">
      <Stack gap="compact">
        <Text className="text-label">{title}</Text>
        {message ? (
          <Text className="text-body-small">{message}</Text>
        ) : null}
        {actions ? <div className="ui-row">{actions}</div> : null}
      </Stack>
    </Alert>
  );
}
