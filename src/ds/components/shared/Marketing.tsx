import * as React from "react";

import { Button } from "../../primitives/Button";
import { Card } from "./Card";
import { Grid } from "../../primitives/Grid";
import { Stack } from "../../primitives/Stack";
import { Text } from "../../primitives/Text";

export type HeroSectionProps = {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
  className?: string;
};

export function HeroSection({ kicker, title, lede, primaryAction, secondaryAction, className }: HeroSectionProps) {
  return (
    <div className={className ? `ui-hero ${className}` : "ui-hero"}>
      <Stack>
        {kicker ? <div className="ui-kicker">{kicker}</div> : null}
        <h1 className="text-heading-1">{title}</h1>
        {lede ? <div className="text-body-large ui-center">{lede}</div> : null}
        <div className="ui-hero__actions ui-row ui-row--center">
          {primaryAction ? (
            primaryAction.href ? (
              <a className="ui-button ui-button--md ui-button--primary ui-focus-ring" href={primaryAction.href}>
                {primaryAction.label}
              </a>
            ) : (
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )
          ) : null}
          {secondaryAction ? (
            secondaryAction.href ? (
              <a className="ui-button ui-button--md ui-button--secondary ui-focus-ring" href={secondaryAction.href}>
                {secondaryAction.label}
              </a>
            ) : (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          ) : null}
        </div>
      </Stack>
    </div>
  );
}

export type Feature = { id: string; title: React.ReactNode; description?: React.ReactNode };
export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <Grid cols={3}>
      {features.map((f) => (
        <Card key={f.id}>
          <Stack gap="compact">
            <div className="text-heading-4">{f.title}</div>
            {f.description ? <Text tone="muted">{f.description}</Text> : null}
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}

export function TestimonialCard({ quote, name, meta }: { quote: React.ReactNode; name: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <Card>
      <Stack gap="compact">
        <div className="text-body">“{quote}”</div>
        <div className="ui-row ui-row--between">
          <div className="text-body-small">{name}</div>
          {meta ? <Text tone="muted">{meta}</Text> : null}
        </div>
      </Stack>
    </Card>
  );
}

export type PriceTier = { id: string; title: React.ReactNode; price: React.ReactNode; bullets: React.ReactNode[]; featured?: boolean };
export function PricingTable({ tiers }: { tiers: PriceTier[] }) {
  return (
    <Grid cols={3}>
      {tiers.map((t) => (
        <Card key={t.id}>
          <div className={t.featured ? "ui-pricing ui-pricing--featured" : "ui-pricing"}>
            <Stack>
              <div className="text-heading-4">{t.title}</div>
              <div className="text-heading-2">{t.price}</div>
              <ul className="ui-pricing__list">
                {t.bullets.map((b, idx) => (
                  <li key={idx} className="text-body-small">
                    {b}
                  </li>
                ))}
              </ul>
              <Button>{t.featured ? "Start" : "Choose"}</Button>
            </Stack>
          </div>
        </Card>
      ))}
    </Grid>
  );
}

export function BlogCard({ title, excerpt, href }: { title: React.ReactNode; excerpt?: React.ReactNode; href: string }) {
  return (
    <Card>
      <Stack gap="compact">
        <a className="ui-navlink ui-focus-ring" href={href}>
          <span className="text-heading-4">{title}</span>
        </a>
        {excerpt ? <Text tone="muted">{excerpt}</Text> : null}
      </Stack>
    </Card>
  );
}

export function NewsletterSignup({ title = "Newsletter" }: { title?: React.ReactNode }) {
  return (
    <Card>
      <Stack>
        <div className="text-heading-4">{title}</div>
        <div className="ui-row">
          <input className="ui-input ui-focus-ring" placeholder="you@example.com" type="email" />
          <Button>Subscribe</Button>
        </div>
        <Text tone="muted">Mock UI only.</Text>
      </Stack>
    </Card>
  );
}

