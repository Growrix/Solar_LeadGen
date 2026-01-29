# Post-Implementation Feature Documentation Template

This template is for documenting a feature after E2E implementation and audit. It ensures the feature is fully understood, testable, and operable by any user or developer.

---

## 0. Overall Workflow & Audience
- **Who is this feature for?**
- **What is the end-to-end workflow?**
- **How does this feature fit into the broader system?**

---

## 1. Feature Overview
- **Feature Name:**
- **Purpose:**
- **Key Flows:**
- **Release Date:**
- **Main Tabs/Sections:**
  - List and explain each main tab/section, including its purpose and impact (not just how, but why).

---

## 2. Key Concepts & System Impact
- **Model Profile:**
  - What is it, why is it needed, and how does it affect the system?
- **AI Router:**
  - What is it, how does it impact automation and data flow?
- **Key Vault & Master Key:**
  - What is the Key Vault, why is the master key required, and what happens if it’s missing?
- **Review Modal & Provenance:**
  - What is the Review Modal, what is provenance, and why do image controls matter?

---

## 3. User Guide (English)
- Step-by-step instructions for all user actions and settings.
- Explain each main tab/section generically (do not mention specific page names).
- Include practical examples, edge cases, and troubleshooting tips.
- Include screenshots or diagrams if possible.

---

## 4. User Guide (Bengali / বাংলা)
- Step-by-step instructions in Bengali for all user actions and settings.
- Explain each main tab/section generically (do not mention specific page names).
- Include practical examples, edge cases, and troubleshooting tips.

---

## 5. Tooltip Reference
| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
|  |  |  |

---

## 6. Functionality Map
| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
|  |  |  |

---

## 7. E2E Flows & System Health
- Describe typical end-to-end flows (from source to published item, or equivalent for the feature).
- How to verify the system is working end-to-end.
- What are the most common errors or blockers, and how to resolve them?

---

## 8. Testing & Verification Checklist
- [ ] All UI triggers work and are connected to backend
- [ ] All API endpoints respond as expected
- [ ] All user flows (create, edit, delete, etc.) are functional
- [ ] All tooltips are present and accurate
- [ ] All settings and automation work as described
- [ ] ... (add feature-specific checks)

---

## 9. Known Limitations / Edge Cases
- List any known issues, limitations, or deferred items.
- What should an operator check after each release?

---

## 10. Final Sign-off
- [ ] All checklist items above are verified
- [ ] Feature is ready for production use
- **Sign-off by:**
- **Date:**
