import * as React from "react";

import { Stack } from "../../primitives/Stack";
import { Grid } from "../../primitives/Grid";
import { Text } from "../../primitives/Text";
import { Accordion, AccordionItem } from "./Accordion";
import { BlogCard } from "./Marketing";

export function BlogList({ posts }: { posts: Array<{ id: string; title: string; excerpt?: string; href: string }> }) {
  return (
    <Grid cols={3}>
      {posts.map((p) => (
        <BlogCard key={p.id} title={p.title} excerpt={p.excerpt} href={p.href} />
      ))}
    </Grid>
  );
}

export function FAQAccordion({ items }: { items: Array<{ id: string; q: string; a: string }> }) {
  return (
    <Accordion type="multiple">
      {items.map((it) => (
        <AccordionItem key={it.id} value={it.id} title={it.q}>
          <Text tone="muted">{it.a}</Text>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function SiteFooter({
  columns,
}: {
  columns: Array<{
    id: string;
    title: string;
    links: Array<{ id?: string; label: string; href: string }>;
  }>;
}) {
  return (
    <footer className="ui-footer">
      <Grid cols={3}>
        {columns.map((c) => (
          <Stack key={c.id} gap="compact">
            <div className="text-heading-4">{c.title}</div>
            <ul className="ui-footer__links">
              {c.links.map((l, idx) => (
                <li key={l.id ?? `${c.id}:${l.href}:${l.label}:${idx}`}> 
                  <a className="ui-navlink ui-focus-ring" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </Stack>
        ))}
      </Grid>
    </footer>
  );
}

