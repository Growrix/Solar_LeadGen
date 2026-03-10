import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Grid,
  Heading,
  Icon,
  Inline,
  PublicHeaderBar,
  PublicShell,
  Section,
  Stack,
  Text,
  ThemeSwitcher,
  ArrowRight,
  Sun,
  Zap,
} from "@/ds";

export default function ThemeTestPage() {
  return (
    <PublicShell
      header={
        <PublicHeaderBar>
          <Inline justify="between">
            <Inline>
              <Heading variant={3}>Theme Test</Heading>
              <Badge tone="info">Design System</Badge>
            </Inline>
            <ThemeSwitcher />
          </Inline>
        </PublicHeaderBar>
      }
    >
      <Section container="wide">
        <Stack gap="compact">
          <Heading variant={2}>Visual regression surface</Heading>
          <Text tone="muted">
            This page intentionally uses only the Design System. Use the theme switcher in the header to verify dark,
            light, and purple themes.
          </Text>
        </Stack>
      </Section>

      <Section tone="surface" container="wide">
        <Grid cols={3}>
          <Card>
            <CardHeader>
              <Inline justify="between">
                <Heading variant={4}>Buttons</Heading>
                <Icon icon={Zap} size="md" aria-hidden />
              </Inline>
            </CardHeader>
            <CardContent>
              <Stack gap="tight">
                <Inline>
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </Inline>
                <Inline>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </Inline>
              </Stack>
            </CardContent>
            <CardFooter>
              <Button variant="text">
                View states <Icon icon={ArrowRight} size="sm" aria-hidden />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Inline justify="between">
                <Heading variant={4}>Typography</Heading>
                <Icon icon={Sun} size="md" aria-hidden />
              </Inline>
            </CardHeader>
            <CardContent>
              <Stack gap="tight">
                <Heading variant={3}>Heading 3</Heading>
                <Text>Body text uses DS tokens and adapts to theme.</Text>
                <Text tone="muted">Muted body text for supporting detail.</Text>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Inline justify="between">
                <Heading variant={4}>Cards</Heading>
                <Icon icon={Zap} size="md" aria-hidden />
              </Inline>
            </CardHeader>
            <CardContent>
              <Stack gap="tight">
                <Text>Check borders, surface elevation, and focus rings across themes.</Text>
                <Button variant="secondary">Secondary action</Button>
              </Stack>
            </CardContent>
            <CardFooter>
              <Badge tone="neutral">Token-driven</Badge>
            </CardFooter>
          </Card>
        </Grid>
      </Section>

      <Section container="wide">
        <Card>
          <CardHeader>
            <Heading variant={3}>Quick checks</Heading>
          </CardHeader>
          <CardContent>
            <Stack gap="tight">
              <Text>1) Switch themes and verify contrast and readability.</Text>
              <Text>2) Tab through buttons to confirm focus ring visibility.</Text>
              <Text>3) Confirm the page has no legacy theme toggles.</Text>
            </Stack>
          </CardContent>
        </Card>
      </Section>
    </PublicShell>
  );
}
