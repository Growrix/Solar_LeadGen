import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  DocsShell,
  Field,
  Grid,
  Heading,
  Icon,
  Inline,
  Input,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  ThemeSwitcher,
  ArrowRight,
  Home,
  Mail,
  Phone,
  Zap,
} from "@/ds";

const nav = [
  { label: "Overview", href: "#overview" },
  { label: "Typography", href: "#typography" },
  { label: "Buttons", href: "#buttons" },
  { label: "Forms", href: "#forms" },
  { label: "Cards", href: "#cards" },
  { label: "Icons", href: "#icons" },
];

export default function ComponentLibraryPage() {
  return (
    <DocsShell
      title={
        <Inline justify="between">
          <Inline>
            <span>Component Library</span>
            <Badge tone="info">DS-only</Badge>
          </Inline>
          <ThemeSwitcher />
        </Inline>
      }
      nav={nav}
    >
      <Stack>
        <section id="overview" className="ui-stack">
          <Heading variant={2}>Design System surface</Heading>
          <Text tone="muted">
            This page showcases the components exported from <code>@/ds</code>. It intentionally avoids legacy UI
            components and legacy semantic classes.
          </Text>
          <Divider />
        </section>

        <section id="typography" className="ui-stack">
          <Heading variant={3}>Typography</Heading>
          <Card>
            <CardContent>
              <Stack gap="tight">
                <Heading variant={1}>Heading 1</Heading>
                <Heading variant={2}>Heading 2</Heading>
                <Heading variant={3}>Heading 3</Heading>
                <Heading variant={4}>Heading 4</Heading>
                <Text>Body text</Text>
                <Text tone="muted">Muted body text</Text>
              </Stack>
            </CardContent>
          </Card>
        </section>

        <section id="buttons" className="ui-stack">
          <Heading variant={3}>Buttons</Heading>
          <Grid cols={2}>
            <Card>
              <CardHeader>
                <Heading variant={4}>Variants</Heading>
              </CardHeader>
              <CardContent>
                <Stack gap="tight">
                  <Inline>
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                  </Inline>
                  <Inline>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="text">
                      Text <Icon icon={ArrowRight} size="sm" aria-hidden />
                    </Button>
                  </Inline>
                  <Inline>
                    <Button variant="danger">Danger</Button>
                    <Button variant="icon" aria-label="Icon button">
                      <Icon icon={Zap} size="sm" aria-hidden />
                    </Button>
                  </Inline>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heading variant={4}>Loading</Heading>
              </CardHeader>
              <CardContent>
                <Stack gap="tight">
                  <Button isLoading loadingText="Loading…">Submit</Button>
                  <Button variant="secondary" isLoading>
                    Secondary
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </section>

        <section id="forms" className="ui-stack">
          <Heading variant={3}>Forms</Heading>
          <Card>
            <CardContent>
              <Stack gap="compact">
                <Field id="name" label="Name" hint="Example field using DS primitives">
                  <Input placeholder="Jane Doe" />
                </Field>

                <Field id="email" label="Email">
                  <Input type="email" placeholder="jane@example.com" />
                </Field>

                <Field id="plan" label="Plan">
                  <Select defaultValue="standard">
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                  </Select>
                </Field>

                <Checkbox defaultChecked label="Send updates" />

                <Stack gap="tight">
                  <Radio name="contact" defaultChecked label="Email" description="Preferred" />
                  <Radio name="contact" label="Phone" />
                </Stack>

                <Switch defaultChecked label="Enable notifications" />

                <Inline>
                  <Button>Save</Button>
                  <Button variant="secondary">Cancel</Button>
                </Inline>
              </Stack>
            </CardContent>
          </Card>
        </section>

        <section id="cards" className="ui-stack">
          <Heading variant={3}>Cards</Heading>
          <Grid cols={2}>
            <Card>
              <CardHeader>
                <Inline justify="between">
                  <Heading variant={4}>Example card</Heading>
                  <Badge tone="success">Active</Badge>
                </Inline>
              </CardHeader>
              <CardContent>
                <Text tone="muted">Card structure uses DS spacing, border, and surface tokens.</Text>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heading variant={4}>Compact content</Heading>
              </CardHeader>
              <CardContent>
                <Stack gap="tight">
                  <Text>Use Grid/Stack/Inline for layout; avoid app-level spacing.</Text>
                  <Button variant="ghost">Learn more</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </section>

        <section id="icons" className="ui-stack">
          <Heading variant={3}>Icons</Heading>
          <Card>
            <CardContent>
              <Inline>
                <Icon icon={Home} aria-hidden />
                <Icon icon={Mail} aria-hidden />
                <Icon icon={Phone} aria-hidden />
                <Icon icon={Zap} aria-hidden />
              </Inline>
              <Text tone="muted">Icons are imported via the DS (keeps lucide-react behind the boundary).</Text>
            </CardContent>
          </Card>
        </section>
      </Stack>
    </DocsShell>
  );
}
