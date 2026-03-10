import * as React from "react";

import { Modal, type ModalProps } from "./Modal";

export type FullScreenModalProps = Omit<ModalProps, "className"> & {
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function FullScreenModal({ className, ...props }: FullScreenModalProps) {
  return <Modal {...props} className={cx("ui-modal__panel--fullscreen", className)} />;
}
