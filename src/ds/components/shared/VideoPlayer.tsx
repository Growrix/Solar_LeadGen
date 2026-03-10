import * as React from "react";

export type VideoPlayerProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  poster?: string;
};

export function VideoPlayer({ className, controls = true, src, ...props }: VideoPlayerProps) {
  const safeSrc = typeof src === "string" && src.trim().length === 0 ? undefined : src;
  return <video className={className ?? "ui-video"} controls={controls} src={safeSrc} {...props} />;
}
