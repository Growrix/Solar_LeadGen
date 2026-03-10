"use client";

import * as React from "react";

import { Card } from "./Card";
import { Field } from "./Field";
import { Input } from "../../primitives/Input";
import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type QrScannerStubProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  onScan?: (value: string) => void;
  title?: React.ReactNode;
  className?: string;
};

export function QrScannerStub({ value = "", onValueChange, onScan, title = "QR / Barcode Scanner (stub)", className }: QrScannerStubProps) {
  return (
    <Card className={cx("ui-qr", className)}>
      <div className="ui-qr__header">
        <div className="text-heading-4">{title}</div>
      </div>
      <div className="ui-qr__body">
        <div className="ui-qr__viewport" aria-hidden="true" />
        <Field id="ui-qr-value" label="Scanned value">
          <Input value={value} onChange={(e) => onValueChange?.(e.target.value)} placeholder="Paste or type a code" />
        </Field>
        <div className="ui-qr__actions">
          <Button size="sm" onClick={() => onScan?.(value)}>
            Use value
          </Button>
        </div>
      </div>
    </Card>
  );
}
