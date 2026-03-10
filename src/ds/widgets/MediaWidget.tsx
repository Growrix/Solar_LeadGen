import * as React from "react";

export type MediaWidgetProps = {
  media: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function MediaWidget({ media, title, description, actions }: MediaWidgetProps) {
  return (
    <div className="ui-media-widget">
      <div className="ui-media-widget__media">{media}</div>
      <div className="ui-media-widget__body">
        {title ? <div className="ui-media-widget__title text-label">{title}</div> : null}
        {description ? <div className="ui-media-widget__desc text-body-small">{description}</div> : null}
        {actions ? <div className="ui-media-widget__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
