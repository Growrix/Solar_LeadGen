# UI-First Workflow Quick Reference

**Version**: 1.0  
**Created**: October 28, 2025  
**Purpose**: One-page quick reference for UI-first, spec-driven development

---

## The Three-Phase Workflow

```
Phase 1: UI/UX FIRST → Phase 2: SPEC ALIGNMENT → Phase 3: BACKEND
    (Build & Iterate)      (Document Changes)      (Build to Spec)
```

**Rule**: UI → Spec Update → Backend → NEVER Backend First

---

## Phase 1: UI/UX First ⚡

**Goal**: Build approved UI before touching backend

**Steps**:
1. Research UI patterns (5-15% time)
2. Build UI mockup with mock data (20-30% time)
3. Review with stakeholder (5-10% time)
4. Iterate based on feedback (30-50% time)

**Tools**: Storybook, mock JSON, faker.js

**Output**: ✅ Approved UI with all interactions working

**Approval Gate**: No backend until UI explicitly approved

---

## Phase 2: Spec Alignment 📝

**Goal**: Update specs before backend

**Steps** (30 minutes total):
1. Update `spec.md`: Add FR/SC from approved UI (15 min)
2. Update `tasks.md`: List backend tasks (5 min)
3. Update `execution-plan.md`: Adjust timeline (10 min)

**Output**: ✅ Specs reflect approved UI

**Approval Gate**: No backend until specs updated

---

## Phase 3: Backend Implementation 💻

**Goal**: Build backend to serve approved UI

**Steps**:
1. Design API based on UI needs (10-15% time)
2. Implement backend (60-70% time)
3. Integrate with UI (15-20% time)
4. Test all scenarios (10-15% time)

**Rule**: If backend needs UI changes, **return to Phase 1**

**Output**: ✅ Working feature (UI + backend integrated)

---

## SpecKit Updates: Three-Tier System

### Tier 1: Real-Time (30 seconds)
**When**: Every task change  
**Update**: `tasks.md` ONLY

```markdown
- [x] TX01: Task done (2h) - Oct 28
- [ ] TX02: Task in progress (Status: IN PROGRESS)
- [ ] TX03: New discovered task - Discovered Oct 28
```

---

### Tier 2: Daily (2 minutes)
**When**: End of work session  
**Update**: `changelog.md`

```markdown
## October 28, 2025

### Added
- TX03: Why this task was added

### Changed
- TX02: What changed and why

### Fixed
- TX04: Error + root cause + solution

### Lessons Learned
- What you learned
```

---

### Tier 3: Weekly (30 minutes Friday 4pm)
**When**: End of week  
**Update**: `spec.md` + `execution-plan.md`

```bash
# 1. Review week (5 min)
grep "\[x\]" tasks.md | tail -20
cat changelog.md | head -100

# 2. Update spec.md (15 min)
- Add new FR from discovered tasks
- Mark completed SC with ✅
- Add edge cases from error fixes

# 3. Update execution-plan.md (10 min)
- Update phase status (% complete)
- Document scope changes
- Adjust timeline

# 4. Commit & push
git add . && git commit -m "Weekly sync" && git push
```

---

## When to Update What

| Event | Real-Time | Daily | Weekly |
|-------|-----------|-------|--------|
| Complete task | ✅ tasks.md | - | - |
| Discover task | ✅ tasks.md | ✅ changelog.md | ✅ spec.md |
| Fix error | ✅ tasks.md | ✅ changelog.md | ✅ spec.md |
| Add phase | ✅ tasks.md | ✅ changelog.md | ✅ execution-plan.md |
| Extend timeline | ✅ tasks.md | ✅ changelog.md | ✅ execution-plan.md |

---

## Red Flags 🚨

**STOP if you see**:
- ❌ Building backend before UI approved
- ❌ No UI approval gate
- ❌ Stale specs (backend without spec update)
- ❌ Hacking UI to fit backend (should be reverse)
- ❌ Skipping iteration (build UI once, no feedback)
- ❌ No mock data (backend before UI testable)
- ❌ Combined UI + backend work (lose benefits)

---

## Benefits

**Time Savings**: 40-60% less rework  
**Better Quality**: UI iterated until perfect  
**Clear Requirements**: Backend built for correct UI  
**Easy Resume**: Specs show what, why, and where

---

## Quick Example

**Feature**: User Profile

**Phase 1** (Week 1 - 16h):
- Research: 2h
- Build UI: 6h  
- Review: 1h
- Iterate: 5h
- Re-review: 1h
- Update specs: 1h
- **Output**: Approved UI ✅

**Phase 2** (30 min):
- Update spec.md: 15 min
- Update tasks.md: 10 min
- Update execution-plan.md: 5 min
- **Output**: Aligned specs ✅

**Phase 3** (Week 2 - 12h):
- API design: 2h
- Implementation: 6h
- Integration: 3h
- Testing: 1h
- **Output**: Working feature ✅

**Total**: 28.5 hours

**Compare to Backend-First**: 36 hours (27% MORE time wasted)

---

## Files Explained

**tasks.md**: What you're doing RIGHT NOW  
**changelog.md**: Why things changed  
**spec.md**: What the feature should do  
**execution-plan.md**: Where you're going

---

## Emergency: Specs Out of Sync?

**1-Hour Emergency Sync**:
1. Read completed tasks in `tasks.md` (10 min)
2. Add FR/SC to `spec.md` for each task (30 min)
3. Update `execution-plan.md` with current status (10 min)
4. Write brief `changelog.md` summarizing period (10 min)

---

## Remember

**UI defines contract → Backend serves contract**

**Not the other way around!**

---

**For Full Details**: See `.specify/memory/WORKFLOW-MANAGEMENT.md`  
**Industry Standards**: See `DOC/INDUSTRY-STANDARD-GUIDELINES.md` Section 1.6 and 15
