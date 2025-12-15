# Monitoring

## What It Is
Continuous measurement of system health via metrics, alerts, and dashboards (errors, latency, throughput, resource usage).

## Why It Matters
Enables proactive detection, rapid incident response, and capacity planning.

## Core Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| API Latency P95 | Time for critical endpoints | < 400ms |
| Error Rate | % failed requests | < 1% |
| Throughput | Requests/min | Tracked |
| LCP | User performance | < 2s |
| Subscription Conversion | Upgrade success % | Monitored |

## Alerting
- Severity thresholds (warn/info) with escalation path.
- Deduplicate repeated incidents.

## Dashboards
- Real-time latency & error charts.
- Release impact comparison panel.

## Pitfalls / Anti-Patterns
- Alert fatigue from low-signal triggers.
- Missing correlation IDs blocking trace linking.

## AI Guidance
Ask: "Propose monitoring metrics for new queue worker; list name, type, rationale." Provide feature summary.
