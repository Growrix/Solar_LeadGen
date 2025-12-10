# SpecKit Workflow Management System

**Version**: 1.0  
**Created**: October 28, 2025  
**Purpose**: Practical workflow for maintaining SpecKit alignment when plans change frequently

---

## The Problem

**Reality of Development**:
- Plans change frequently as you learn more
- New tasks discovered during implementation
- Errors require fixes not in original spec
- Hard to keep all SpecKit files synchronized
- Only updating `tasks.md` causes spec drift

**Pain Points**:
1. Fresh plan → Modifications on the go → Original spec becomes outdated
2. Error handling adds unplanned work → Specs don't reflect reality
3. New phases added mid-implementation → Previous specs incomplete
4. Multiple files to update (spec.md, tasks.md, execution-plan.md, changelog.md) → Time-consuming

---

## The Solution: Lightweight Spec Maintenance

### Core Philosophy

**"Just-In-Time Spec Updates"** - Update specs WHEN you make decisions, not before or after.

**Minimum Viable Spec Maintenance**:
1. **Always Update**: `tasks.md` (you're already doing this ✅)
2. **Quick Update**: `changelog.md` (1-2 sentences per change)
3. **Weekly Sync**: `spec.md` + `execution-plan.md` (batch update)

---

## Three-Tier Workflow System

### Tier 1: Real-Time Updates (Immediate - 30 seconds)

**When**: Every time you complete a task, discover new work, or fix an error

**Update Only**: `tasks.md`

```markdown
## Phase 4.14: User Profile Enhancement

### In Progress
- [ ] T320: Build user profile UI mockup (Status: In Progress)

### Completed
- [x] T318: Research best profile UI patterns (2h) - Oct 28, 2025
- [x] T319: Design profile card component (1.5h) - Oct 28, 2025

### Discovered Tasks (Added On-The-Go)
- [ ] T321: Fix profile image upload error (Status: Blocker) - Discovered during T320
- [ ] T322: Add email validation to profile form - User feedback during UI review
```

**Why This Works**:
- You're already doing this
- Fast (30 seconds)
- Single source of truth for current work
- Easy to see what's actually happening

---

### Tier 2: Quick Context Updates (Daily - 2 minutes)

**When**: End of each work session or when something significant changes

**Update**: `changelog.md`

**Format**: Brief, bullet-point entries

```markdown
# Changelog - Phase 4.14

## October 28, 2025

### Added
- T321: Profile image upload error fix (discovered during UI implementation)
- T322: Email validation for profile form (user feedback during review)

### Changed
- T320: UI mockup took longer than planned (2h → 4h) due to responsive layout complexity
- Switched from modal to full-page profile editor (better UX on mobile)

### Fixed
- Profile image upload failed with files > 2MB (added compression)

### Lessons Learned
- Always test image upload with large files in development
- Mobile-first design requires more time for profile pages (add 50% buffer)
```

**Why This Works**:
- Captures "why" decisions were made
- Documents discovered issues
- Takes only 2 minutes
- Provides context for future you (or team)

---

### Tier 3: Weekly Spec Sync (Weekly - 30 minutes)

**When**: End of week or before starting new phase

**Update**: `spec.md` + `execution-plan.md`

**Process**:

#### Step 1: Review Your Week (5 minutes)
```bash
# Check what tasks were completed
grep "\[x\]" tasks.md | grep "Oct 28"

# Check what changed
cat changelog.md | head -50
```

#### Step 2: Update `spec.md` (15 minutes)

**Add New Requirements** (from discovered tasks):
```markdown
### Functional Requirements

**User Profile Management:**
- FR-067: System MUST validate email format on profile update (Added: T322 - Oct 28)
- FR-068: System MUST compress images > 2MB before upload (Added: T321 - Oct 28)
```

**Update Success Criteria** (from completed work):
```markdown
### Success Criteria

**User Profile:**
- SC-045: Profile UI renders correctly on mobile (320px, 375px, 414px) ✅ Completed Oct 28
- SC-046: Profile images upload successfully (< 10MB, compressed to 2MB) ✅ Completed Oct 28
```

#### Step 3: Update `execution-plan.md` (10 minutes)

**Update Phase Status**:
```markdown
## Phase 4.14: User Profile Enhancement

**Status**: In Progress (75% complete)  
**Started**: October 25, 2025  
**Estimated Completion**: October 30, 2025 (was Oct 29, extended by 1 day)

**Completed Tasks**: 8/10 original + 2/2 discovered = 10/12 total
**Blockers**: None (T321 resolved)

**Scope Changes**:
- Added T321: Image upload error fix (2h)
- Added T322: Email validation (1h)
- Extended timeline: Mobile-first design took longer than planned

**Next Phase**: Phase 4.15: Profile Settings (starts Oct 31)
```

**Why This Works**:
- Batch updates save time (30 min once vs 5 min daily)
- Weekly rhythm is manageable
- Specs stay aligned without daily overhead
- Clear history of what changed and why

---

## Handling Common Scenarios

### Scenario 1: Fresh Plan → Modifications On-The-Go

**Initial Plan** (Monday):
```markdown
## Phase 4.14: User Profile Enhancement
- T318: Research UI patterns (2h)
- T319: Build profile UI (4h)
- T320: Implement backend (3h)
```

**Reality** (Tuesday):
```markdown
## Phase 4.14: User Profile Enhancement

### Original Tasks
- [x] T318: Research UI patterns (2h) - DONE
- [x] T319: Build profile UI (4h → 6h) - DONE (took longer)
- [ ] T320: Implement backend (3h) - WAITING (UI approval)

### Discovered During Implementation
- [x] T321: Fix image upload error (2h) - DONE
- [ ] T322: Add email validation (1h) - IN PROGRESS
- [ ] T323: Add mobile-responsive profile header (2h) - TODO
```

**What to Update**:
- ✅ **Immediately**: `tasks.md` (add T321, T322, T323)
- ✅ **End of Day**: `changelog.md` (explain why tasks added)
- ✅ **End of Week**: `spec.md` (add FR-067, FR-068), `execution-plan.md` (update timeline)

**Workflow**:
1. Discover new task → Add to `tasks.md` immediately
2. Complete/modify task → Update `changelog.md` at end of day
3. Friday 4pm → Batch update `spec.md` + `execution-plan.md`

---

### Scenario 2: Error Handling Adds Unplanned Work

**Example**: Profile page crashes when user has no avatar

**Immediate Action** (when error discovered):
```markdown
# tasks.md
## Phase 4.14

### Discovered Tasks
- [ ] T324: Fix profile crash when user has no avatar (Status: BLOCKER) - Oct 28, 3pm
  - Error: "Cannot read property 'url' of null"
  - Impact: All users without avatars cannot view profile
  - Priority: P0 (blocks release)
```

**End of Day** (changelog update):
```markdown
# changelog.md
## October 28, 2025

### Fixed
- T324: Profile crash when user has no avatar
  - Root cause: Avatar component didn't handle null avatar URL
  - Solution: Added fallback to default avatar + null checks
  - Lesson: Always test edge cases (empty states, null values)
  - Time: 1h (unplanned)
```

**End of Week** (spec sync):
```markdown
# spec.md
### Edge Cases (Updated Oct 28)

**User Profile Edge Cases:**
- What happens when user has no avatar? → Show default avatar (Added: T324)
- What happens when avatar URL is invalid? → Show default avatar + log error
- What happens when avatar fails to load? → Show default avatar + retry button

### Functional Requirements
- FR-069: System MUST display default avatar when user avatar is null or invalid (Added: T324 - Oct 28)
```

---

### Scenario 3: Adding New Phases Mid-Implementation

**Original Plan**:
- Phase 4.14: User Profile Enhancement (current)
- Phase 4.15: Settings Page (next)

**Mid-Implementation Discovery**: Need notification system for profile updates

**What to Do**:

1. **Immediately** - Add to `tasks.md`:
```markdown
## Discovered Future Work

### Phase 4.14.5: Profile Notifications (NEW - Oct 28)
Priority: P1 (required before launch)
- [ ] T325: Design notification UI for profile updates
- [ ] T326: Implement email notifications
- [ ] T327: Add in-app notification bell icon
Estimated: 8h
```

2. **End of Day** - Update `changelog.md`:
```markdown
## October 28, 2025

### Added
- Phase 4.14.5: Profile Notifications (NEW)
  - Reason: User testing revealed need for update notifications
  - Impact: Extends Phase 4.14 timeline by 1 week
  - Decision: Add as sub-phase to keep profile work grouped
```

3. **End of Week** - Update `execution-plan.md`:
```markdown
## Execution Timeline (Updated Oct 28)

- ✅ Phase 4.14: User Profile Enhancement (Oct 25-30)
- 🆕 Phase 4.14.5: Profile Notifications (Oct 31 - Nov 3) **NEW**
- ⏸️ Phase 4.15: Settings Page (Nov 4-10) **DELAYED by 4 days**
```

---

## SpecKit File Responsibilities

### `tasks.md` - The Master Todo List
**Update**: Real-time (every task change)  
**Owner**: Developer (you)  
**Purpose**: Track current work, discovered tasks, blockers

**What Goes Here**:
- All tasks (original + discovered)
- Task status (TODO, IN PROGRESS, DONE, BLOCKED)
- Time estimates (original + actual)
- Discovery notes ("why this task was added")

---

### `changelog.md` - The "What Changed and Why" Log
**Update**: Daily (end of work session)  
**Owner**: Developer (you)  
**Purpose**: Capture decisions, fixes, lessons learned

**What Goes Here**:
- New tasks added (why?)
- Scope changes (what changed from plan?)
- Errors fixed (root cause + solution)
- Lessons learned (what would you do differently?)

**Format**:
```markdown
## [Date]

### Added
- What new tasks/features were added
- Why they were necessary

### Changed
- What was modified from original plan
- Why it changed

### Fixed
- What errors were discovered
- How they were resolved

### Lessons Learned
- What you learned that will improve future work
```

---

### `spec.md` - The Feature Contract
**Update**: Weekly (batch sync)  
**Owner**: Developer (you) + Stakeholders  
**Purpose**: Define what the feature should do (functional requirements, success criteria)

**What Goes Here**:
- Functional requirements (FR-XXX)
- Success criteria (SC-XXX)
- Edge cases
- User stories

**When to Update**:
- End of week batch sync
- Before major feature review/demo
- When scope significantly changes (>20% new work)

---

### `execution-plan.md` - The Project Timeline
**Update**: Weekly (batch sync)  
**Owner**: Developer (you)  
**Purpose**: Track phases, timelines, and overall progress

**What Goes Here**:
- Phase definitions
- Task counts (planned vs actual)
- Timeline estimates (start/end dates)
- Dependencies between phases
- Blockers and risks

**When to Update**:
- End of week batch sync
- When adding/removing phases
- When timelines shift significantly (>2 days)

---

## Quick Reference: When to Update What

| Trigger | Update Immediately | Update Daily | Update Weekly |
|---------|-------------------|--------------|---------------|
| Complete a task | `tasks.md` ✅ | - | - |
| Discover new task | `tasks.md` ✅ | `changelog.md` 📝 | `spec.md` 📊 |
| Fix an error | `tasks.md` ✅ | `changelog.md` 📝 | `spec.md` 📊 |
| Change UI design | `tasks.md` ✅ | `changelog.md` 📝 | - |
| Add new phase | `tasks.md` ✅ | `changelog.md` 📝 | `execution-plan.md` 📊 |
| Task takes longer | `tasks.md` ✅ | `changelog.md` 📝 | `execution-plan.md` 📊 |
| Scope change >20% | `tasks.md` ✅ | `changelog.md` 📝 | `spec.md` + `execution-plan.md` 📊 |

**Legend**:
- ✅ Real-time (30 seconds)
- 📝 End of day (2 minutes)
- 📊 End of week (30 minutes)

---

## Weekly Sync Routine (Friday 4pm - 30 minutes)

### Step 1: Review Your Week (5 min)
```bash
# Check completed tasks
grep "\[x\]" tasks.md | tail -20

# Check discovered tasks
grep "Discovered" tasks.md

# Read changelog for context
cat changelog.md | head -100
```

### Step 2: Update spec.md (15 min)

**Add New Requirements**:
```markdown
# Find all discovered tasks from this week
grep -A 2 "Discovered" tasks.md

# For each significant discovery, add:
- New FR-XXX in spec.md (if it changes "what" the feature does)
- New edge case (if it's an error you fixed)
- Updated success criteria (if it changes acceptance)
```

**Mark Completed Success Criteria**:
```markdown
# Find completed tasks
grep "\[x\]" tasks.md | grep "T3"

# Match to success criteria and mark complete
- SC-045: Profile UI mobile-responsive ✅ Oct 28 (T319)
```

### Step 3: Update execution-plan.md (10 min)

**Update Phase Status**:
- Completed task count
- Timeline adjustments
- New phases added
- Blockers resolved/new

**Update Next Phase**:
- When will it start? (push back if current phase extended)
- Any dependencies from current phase?

### Step 4: Commit & Push
```bash
git add tasks.md changelog.md spec.md execution-plan.md
git commit -m "Weekly spec sync: Phase 4.14 progress, added T321-T324"
git push
```

---

## Benefits of This System

### 1. Low Overhead
- Real-time updates: 30 seconds per task
- Daily updates: 2 minutes
- Weekly sync: 30 minutes
- **Total weekly time**: ~45 minutes (vs 2+ hours for daily spec updates)

### 2. Captures Reality
- Plans change → `tasks.md` shows what actually happened
- Errors happen → `changelog.md` explains why and how you fixed it
- Scope creeps → Weekly sync adjusts specs to match reality

### 3. Maintains Alignment
- `tasks.md` = What you're doing RIGHT NOW
- `changelog.md` = Why things changed
- `spec.md` = What the feature should do (updated weekly)
- `execution-plan.md` = Where you're going (updated weekly)

### 4. Easy to Resume After Breaks
- Read `tasks.md` → See current status
- Read `changelog.md` → Remember context ("why did I add this?")
- Read `spec.md` → Understand feature goals
- Read `execution-plan.md` → See big picture

### 5. Clear History for Team/Stakeholders
- "Why did this take longer?" → Check `changelog.md`
- "What changed from original plan?" → Check `changelog.md`
- "What's the current scope?" → Check `spec.md` + `tasks.md`
- "When will we be done?" → Check `execution-plan.md`

---

## Example Weekly Sync (Real Workflow)

**Friday 4pm - Week of Oct 21-28, 2025**

### Your Week
- Started Phase 4.14: User Profile Enhancement
- Completed 10 original tasks + 4 discovered tasks
- Fixed 2 critical errors
- UI took longer than planned (mobile complexity)

### 30-Minute Sync Process

**Step 1: Review (5 min)**
```bash
# Check what you did
grep "\[x\]" tasks.md | grep "Oct 2[1-8]"
# Output: 14 tasks completed

# Check what changed
cat changelog.md
# Output: Added T321-T324, fixed 2 errors, learned 3 lessons
```

**Step 2: Update spec.md (15 min)**

Add new requirements from discovered tasks:
```markdown
- FR-067: Email validation on profile update (T322)
- FR-068: Image compression > 2MB (T321)
- FR-069: Default avatar for null values (T324)
```

Update success criteria:
```markdown
- SC-045: Mobile-responsive profile UI ✅ Oct 28
- SC-046: Image upload < 10MB ✅ Oct 28
- SC-047: Email validation working ✅ Oct 28
```

Add edge cases:
```markdown
- Profile crash when no avatar → Fixed with default avatar (T324)
- Image upload fails > 2MB → Auto-compress to 2MB (T321)
```

**Step 3: Update execution-plan.md (10 min)**

```markdown
## Phase 4.14: User Profile Enhancement

**Status**: 95% Complete  
**Timeline**: Oct 25-30 (originally Oct 25-29, extended 1 day)  
**Tasks**: 14/14 complete (10 original + 4 discovered)  
**Blockers**: None (all resolved)

**Scope Changes**:
- Added T321-T324 (error fixes + enhancements)
- Mobile UI took longer than estimated (+2h)
- Total time: 32h (estimated 28h, +14% variance)

**Lessons Learned**:
- Mobile-first design needs 25% time buffer for profiles
- Always test edge cases (null values, large files)
- User feedback during UI review is valuable (caught T322 early)

**Next**: Phase 4.14.5 starts Oct 31 (notification system)
```

**Total Time**: 28 minutes ✅

---

## Templates for Quick Updates

### Daily Changelog Template
```markdown
## [Date]

### Added
- [Task ID]: [Description] - [Why added]

### Changed
- [Task ID]: [What changed] - [Why changed]

### Fixed
- [Task ID]: [Error description]
  - Root cause: [Why it happened]
  - Solution: [How you fixed it]
  - Time: [Hours spent]

### Lessons Learned
- [What you learned]
```

### Weekly Spec Update Template
```markdown
# spec.md Updates

## New Functional Requirements (from this week)
- FR-XXX: [Requirement] (Added: [Task ID] - [Date])

## Updated Success Criteria
- SC-XXX: [Criteria] ✅ [Date] ([Task ID])

## New Edge Cases
- [Scenario] → [Solution] (Added: [Task ID])

---

# execution-plan.md Updates

## Phase [Number]: [Name]
**Status**: [% Complete]
**Timeline**: [Start] - [End] (originally [Original End], extended by [Days])
**Tasks**: [Completed]/[Total] complete
**Scope Changes**: [List changes]
**Lessons Learned**: [List lessons]
**Next**: [Next phase name] starts [Date]
```

---

## Troubleshooting

### "I forgot to update specs for 2 weeks"

**Solution**: Emergency Sync (1 hour)

1. Read all completed tasks in `tasks.md` (10 min)
2. For each significant task, add FR/SC to `spec.md` (30 min)
3. Update `execution-plan.md` with current phase status (10 min)
4. Write brief `changelog.md` entry summarizing 2 weeks (10 min)

### "My specs are completely out of sync with code"

**Solution**: Spec Audit (2-3 hours, one-time)

1. Review actual implemented features in code (1h)
2. Rewrite `spec.md` to match reality (1h)
3. Update `execution-plan.md` with actual timeline (30 min)
4. Going forward, use this workflow to stay aligned

### "I have too many phases/tasks to track"

**Solution**: Consolidate

- Archive completed phases (move to `archive/` folder)
- Keep only current + next 2 phases in main files
- Reference archived phases when needed

---

## Integration with Your UI-First Workflow

### Phase 1: UI/UX First

**Start of Phase**:
```markdown
# tasks.md
## Phase X.X: [Feature]

### UI/UX Tasks (DO FIRST)
- [ ] TX01: Research UI patterns
- [ ] TX02: Build UI mockup (Storybook)
- [ ] TX03: Review UI with stakeholder
- [ ] TX04: Iterate UI based on feedback

**APPROVAL GATE**: ✅ UI approved before backend
```

**During UI Work**:
- Add discovered UI tasks to `tasks.md` immediately
- Update `changelog.md` daily with design decisions

**After UI Approval**:
- Update `spec.md` with UI-related success criteria
- Mark UI tasks complete in `execution-plan.md`

### Phase 2: Spec Alignment

**Before Backend**:
- Batch update `spec.md` with all UI decisions
- Add FR/SC based on approved UI
- Update `execution-plan.md` with backend tasks

### Phase 3: Backend Implementation

**During Backend**:
- Update `tasks.md` with backend tasks/discoveries
- Update `changelog.md` with API decisions

**After Backend**:
- Weekly sync updates `spec.md` + `execution-plan.md`

---

## Summary: Your New Workflow

**Real-Time (30 sec per event)**:
- Complete task → Update `tasks.md`
- Discover task → Add to `tasks.md`
- Start task → Mark in progress in `tasks.md`

**Daily (2 min at end of day)**:
- Review day's work
- Update `changelog.md` with changes/fixes/lessons

**Weekly (30 min on Friday 4pm)**:
- Review week's `tasks.md` + `changelog.md`
- Update `spec.md` with new FR/SC/edge cases
- Update `execution-plan.md` with phase status/timeline
- Commit and push all changes

**Result**: Specs stay aligned with minimal overhead, you can handle plan changes gracefully, and you have clear history for yourself and others.

---

**End of Workflow Management Guide**
