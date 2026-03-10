import * as React from "react";

import { Card } from "../../structures/Card";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type WebWidgetFrameProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Defaults to Card for web runtime. */
  asCard?: boolean;
};

export function WebWidgetFrame({ asCard = true, className, children, ...props }: WebWidgetFrameProps) {
  if (!asCard) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <Card className={cx(className)} {...props}>
      {children}
    </Card>
  );
}
