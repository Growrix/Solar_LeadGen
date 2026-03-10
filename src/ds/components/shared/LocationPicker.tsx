"use client";

import * as React from "react";

import { Field } from "./Field";
import { Input } from "../../primitives/Input";
import { Button } from "../../primitives/Button";
import { Text } from "../../primitives/Text";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type LocationValue = {
  lat: string;
  lng: string;
};

export type LocationPickerProps = {
  value: LocationValue;
  onValueChange: (value: LocationValue) => void;
  onUseCurrentLocation?: () => void;
  className?: string;
};

export function LocationPicker({ value, onValueChange, onUseCurrentLocation, className }: LocationPickerProps) {
  return (
    <div className={cx("ui-location", className)}>
      <div className="ui-location__row">
        <Field id="ui-location-lat" label="Latitude">
          <Input value={value.lat} onChange={(e) => onValueChange({ ...value, lat: e.target.value })} inputMode="decimal" placeholder="-33.86" />
        </Field>
        <Field id="ui-location-lng" label="Longitude">
          <Input value={value.lng} onChange={(e) => onValueChange({ ...value, lng: e.target.value })} inputMode="decimal" placeholder="151.21" />
        </Field>
      </div>
      <div className="ui-location__actions">
        <Button size="sm" variant="secondary" onClick={onUseCurrentLocation}>
          Use current location
        </Button>
        <Text tone="muted">Provide values or integrate geolocation in feature code.</Text>
      </div>
    </div>
  );
}
