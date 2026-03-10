import * as React from "react";

import { FullScreenModal } from "./FullScreenModal";
import { ResponsiveImage, type ResponsiveImageProps } from "./ResponsiveImage";

export type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  src: string;
  alt: string;
  imageProps?: Omit<ResponsiveImageProps, "src" | "alt">;
};

export function ImageViewer({ open, onClose, title = "Preview", src, alt, imageProps }: ImageViewerProps) {
  return (
    <FullScreenModal open={open} onClose={onClose} title={title} description={alt}>
      <div className="ui-imageviewer">
        <ResponsiveImage src={src} alt={alt} aspect={imageProps?.aspect ?? "video"} />
      </div>
    </FullScreenModal>
  );
}
