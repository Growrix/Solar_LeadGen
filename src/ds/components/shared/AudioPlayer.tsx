import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AudioPlayerProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
  className?: string;
};

export function AudioPlayer({ className, ...props }: AudioPlayerProps) {
  return <audio controls className={cx("ui-audio", className)} {...props} />;
}
