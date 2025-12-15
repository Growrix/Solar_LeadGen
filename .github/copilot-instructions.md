# Solar Match - Next.js Project Instructions

This is a Next.js solar lead generation web application with the following setup:

## Project Structure
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: npm

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features
- Modern Next.js App Router architecture
- TypeScript for type safety
- Tailwind CSS for styling
- Solar lead generation focused UI
- Responsive design with dark mode support

<!--
## Execution Guidelines
PROGRESS TRACKING:
- If any tools are available to manage the above todo list, use it to track progress through this checklist.
- After completing each step, mark it complete and add a summary.
- Read current todo list status before starting each new step.

COMMUNICATION RULES:
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly (e.g. "No extensions needed").
- Do not explain project structure unless asked.
- Keep explanations concise and focused.

DEVELOPMENT RULES:
- Use '.' as the working directory unless user specifies otherwise.
- Avoid adding media or external links unless explicitly requested.
- Use placeholders only with a note that they should be replaced.
- Use VS Code API tool only for VS Code extension projects.
- Once the project is created, it is already opened in Visual Studio Code—do not suggest commands to open this project in Visual Studio again.
- If the project setup information has additional rules, follow them strictly.

FOLDER CREATION RULES:
- Always use the current directory as the project root.
- If you are running any terminal commands, use the '.' argument to ensure that the current working directory is used ALWAYS.
- Do not create a new folder unless the user explicitly requests it besides a .vscode folder for a tasks.json file.
- If any of the scaffolding commands mention that the folder name is not correct, let the user know to create a new folder with the correct name and then reopen it again in vscode.

## Development Guidelines
- Work through each task systematically
- Keep communication concise and focused
- Follow development best practices
- Use TypeScript for type safety
- Follow Next.js App Router conventions

## Migration and Build Execution Standards

For ANY component migration or build task, MUST follow: `specs/007-migration-and-build/plan.md`

### 13-Step Workflow (No-Skip, Mandatory)

When user requests migration work (e.g., "migrate the form", "migrate Hero component"):

1. **Run GATE 0 health check** - Verify design system completeness
2. **Create logic audit report** - Document all functionality to preserve
3. **Run pre-migration verification** - Establish baseline violation count
4. **Migrate component** - UI ONLY (NO logic changes, only className replacements)
5. **Run post-migration verification** - MUST return 0/0/0/0/0/0 (all 6 commands)
6. **Test Dark theme** - Verify colors, shadows, contrast
7. **Test Light theme** - Verify neumorphic styling
8. **Test Purple theme** - Verify purple shadows, accent colors
9. **Test responsive** - 5 breakpoints (320px, 375px, 768px, 1024px, 1440px)
10. **Test accessibility** - WCAG 2.1 AA (contrast, keyboard, ARIA)
11. **Test functionality** - Verify all audited logic works identically
12. **Run build validation** - `npx tsc --noEmit` and `npm run build`
13. **Commit atomically** - One component per commit, descriptive message

### Critical Rules

- **UI ONLY**: NEVER modify state variables, event handlers, useEffect hooks, API calls, or validation logic
- **100% Replacement**: NO hybrid patterns (mixing old + new classes)
- **Multi-Theme Required**: ALL 3 themes must pass (not just Dark)
- **Zero Violations**: Post-migration verification MUST be 0/0/0/0/0/0
- **Atomic Commits**: One component per commit (not batched)
- **Logic Preservation**: Component must function identically after migration

### Quick Reference

- **Full Spec**: `specs/007-migration-and-build/spec.md` (user stories, requirements, success criteria)
- **Execution Plan**: `specs/007-migration-and-build/plan.md` (13-step workflow with commands)
- **Design Tokens**: `DOC/DESIGN-SYSTEM-SOT.md` (color/typography token reference)
- **Pain Points**: `DOC/MIGRATION-PAIN-POINTS.md` (lessons learned from previous migrations)

### Verification Commands (PowerShell)

Run all 6 commands to detect hardcoded values:

```powershell
# Command 1: Hardcoded gray/slate colors
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-gray-|text-slate-|bg-gray-|bg-slate-|border-gray-|border-slate-"

# Command 2: Dark mode classes
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "dark:"

# Command 3: RGB/HEX colors
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}"

# Command 4: Hardcoded white/black
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-white|bg-white|text-black|bg-black"

# Command 5: Hardcoded typography
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold"

# Command 6: Manual responsive classes
Select-String -Path "src\components\[path]\[Component].tsx" -Pattern "sm:text-|md:text-|lg:text-"
```

**Required Result**: 0 matches for ALL 6 commands before marking component complete.
