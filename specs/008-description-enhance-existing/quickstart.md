# Quickstart – Quote Builder Modal Enhancement

## Pre-migration Audit (Gate)
1. Read SOT files: improvement plan, calculation logic, research, guidelines.
2. Compare current modal logic to SOT; list gaps.
3. Confirm zero design-system violations baseline.

## Implement UI Enhancements Only
1. Integrate single calculator outputs into existing modal summary cards and preview.
2. Add options manager (up to three), using presets/duplicate flows.
3. Add compliance validation UI with inline errors.

## Verify & Test
1. Run 6 verification commands (design-system) – expect 0 matches.
2. Test themes: Dark, Light, Purple.
3. Test 5 breakpoints.
4. Validate payback N/A behavior when savings <= 0.
5. Confirm autosave/restore for drafts.

## Contracts
See `contracts/openapi.yaml` for endpoints used by the modal.
