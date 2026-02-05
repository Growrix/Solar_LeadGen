import * as React from "react";

export type VideoPlayerProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  poster?: string;
};

export function VideoPlayer({ className, controls = true, ...props }: VideoPlayerProps) {
  return <video className={className ?? "ui-video"} controls={controls} {...props} />;
}
