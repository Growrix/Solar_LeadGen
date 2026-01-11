# Model Profile Modal Enhancement — Notes & Prompts

**Context:**
- Current modal for Model Profile (see screenshot) uses free-text fields for Provider and Model ID.
- User feedback: This is error-prone; should be dropdowns to avoid mistakes.
- Future: May use providers beyond OpenAI (e.g., Deepseek, Gemini, etc.), so the UI should be extensible.
- User is in testing phase; no implementation yet—just collect all notes, pain points, and prompts for future enhancement.

---

## User Prompts & Pain Points

 - "I think in this modal the Provider and Model ID should be selected as a dropdown, so that there is no chance to make mistakes."
 - "I do not know which model id exactly working in the system."
 - "Now we are using openAI but in future we might use Deepseek/Gemini etc."
 - "As we are on testing phase I do not want you to implement anything yet. Just keep all the notes that I have mentioned including my prompts by creating a file and updating it on the go, and finally we will do these enhancements later once we have all the contexts and pain point findings of enhancement."
 - "Also this modal has no closing button (only Save). User suggests adding a close (X) button at top-right corner for better UX."
 - "We only have adding profile option but there is no remove options. It's a bad UX."

---

## Enhancement Ideas (to revisit after testing phase)

- Provider field should be a dropdown (OpenAI, Deepseek, Gemini, etc.)
- Model ID field should be a dropdown, dynamically populated based on selected provider
- UI should show which Model IDs are actually supported/working in the current system
- Add helper text or tooltips to clarify provider/model compatibility
- Consider auto-detecting available models from backend or config
- Keep this file updated with any new pain points or enhancement prompts

---

**(Update this file with further findings or user prompts as testing continues.)**
