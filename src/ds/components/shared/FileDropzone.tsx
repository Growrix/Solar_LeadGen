"use client";

import * as React from "react";

import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type FileDropzoneProps = {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  className?: string;
};

export function FileDropzone({ label = "Upload", hint = "Drag files here or browse", accept, multiple, onFilesChange, className }: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = React.useState(false);

  const emit = (list: FileList | null) => {
    if (!list) return;
    onFilesChange?.(Array.from(list));
  };

  return (
    <div
      className={cx("ui-drop", drag && "ui-drop--drag", className)}
      onDragEnter={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        emit(e.dataTransfer.files);
      }}
    >
      <div className="ui-drop__header">
        <div className="text-body-small">{label}</div>
        <Text tone="muted">{hint}</Text>
      </div>
      <div className="ui-row">
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
      </div>
      <input
        ref={inputRef}
        className="ui-drop__input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => emit(e.target.files)}
      />
    </div>
  );
}

