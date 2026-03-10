import * as React from "react";

import { Modal, type ModalProps } from "./Modal";

export type BottomSheetProps = Omit<ModalProps, "variant">;

export function BottomSheet(props: BottomSheetProps) {
  return <Modal {...props} variant="bottom-sheet" />;
}
