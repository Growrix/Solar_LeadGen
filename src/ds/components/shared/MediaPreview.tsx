import * as React from "react";

import { Thumbnail, type ThumbnailProps } from "./Thumbnail";
import { Pressable } from "../../primitives/Pressable";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type MediaPreviewProps = {
  title?: string;
  meta?: string;
  onClick?: () => void;
  className?: string;
  thumbnail: ThumbnailProps;
};

export function MediaPreview({ title, meta, onClick, className, thumbnail }: MediaPreviewProps) {
  const Wrapper: React.ElementType = onClick ? Pressable : "div";

  return (
    <Wrapper
      className={cx("ui-media-preview", onClick && "ui-media-preview--pressable", className)}
      onClick={onClick}
    >
      <div className="ui-media-preview__thumb">
        <Thumbnail {...thumbnail} />
      </div>
      {(title || meta) && (
        <div className="ui-media-preview__body">
          {title ? <div className="ui-media-preview__title text-body-small">{title}</div> : null}
          {meta ? <div className="ui-media-preview__meta text-body-small ui-text-muted">{meta}</div> : null}
        </div>
      )}
    </Wrapper>
  );
}
