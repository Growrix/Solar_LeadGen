
***Prepare Phases In the Tasks.md***
- I want you to add a new phase and sub-phases as per required in the DOC\FEATURES\NEWS ENGINE\tasks.md based on the below scenario :

***phase 1***
- create the user story using the template :
`DOC.specify\templates\spec-template.md`
based on below Issues to solve. 
- Create the file in the : DOC\FEATURES\NEWS ENGINE\POST FEATURE\FIXING ISSUES

***Issues to solve***

- The AI image generation is failed due to access of dall-e-3. 
- The AI is not generating the appropriate image url from the free sources. 
- The Url only shows OG preview when I click on the Save to S3. The initial url should be auto saved to s3. And the overriding function should still remain as it is. 
- When I clicked on Approve Image> it is showing error that Image URL is invalid and blocking the approval while the image preview is also showing up. So, The publishing also getting blocked by this same issue. need to address and fix it. There should be no blocking when the preview is showing up in the auto publish function. But It should not block while doing it manually. there might be one reason i think, the image url is getting changed when I clicked on save to s3 button. 
- In order to use open AI gpt modals, I want you to enable and do all the necessary setting to use all the modals . e.g gpt5.2, 4 , Dall-e-3 , etc I want you to make sure all the models can be used. 

***new issues seems : The Find free image function is failing. check the screenshot.

***Phase 2 : Creating test Scripts***
- Create all the test scripts followed by the : `DOC\GUIDELINES & SOT\IMPLEMENTATION SOT\AI-implementation-testing-guidelines.md` instructions strictly based on the user story created in phase 1.
- Read the entire last phase user story In order to understand the exact pain point and issus to solve. 

***Phase 3: Fixing issues***
- prepare a step by step tasks list to fix all the visual issues mentioned above each one by one. 
- Each isuues fixing should be started with a short analysis section about the issue and why it is happening. Then Identify the root uase and fix them one by one. 
- The goal here is not to approach massive audit and massive planning. instead, get one issue and fix that first. Move to the next issue when you have done the first issues. This is how the workflow will be. Guard each pain points , do necessary audit, analysis, Identify root cause just focued on the each single pain points and fix them and repeate this process to solve each issues. 
- Make sure after fixing each issue, do a visual testing and confirm everything is working as expected.
- The tasks.md file should be updated accordingly. 

***phase 4: Post Fixing tests***
- in order to run the scripts and do the testing follow this : `DOC\GUIDELINES & SOT\IMPLEMENTATION SOT\AI-implementation-testing-guidelines.md`
- only move to the next phase if the tests are passed as per the user story. 
- If failed then fix and pass and then move to the next phase.


***Instructions***
- first, Address all my visual findings mentioned above by fixing them accordingly.
- Read all the latest audit reports carefull from the tasks.md : **Phase 6 checkpoint**:
- Final audit report: `DOC/FEATURES/NEWS ENGINE/Audit Reports/news-engine-expansion-phase14-phase6-post-feature-audit-2026-01-15.md`
- Final documentation bundle: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/Enhancement/news-engine-phase14-expansion-post-feature-docs-2026-01-15.md`
- Read the entire phase 14 and understand what was really applied and why it did not meet my expectation and the v3. 

***Strickt Rules***
- create an new phase in the tasks.md and lets continue tasking from there. 
- The tasks.md is the only master track record of all the tasks. so you need to update the tasks.md file accordingly for every action, change, sub-phase etc. Always refer to the tasks.md file before starting any new phase or sub-phase. Always update/Add with the executional tasks before any action. 
- Always work based on the bridge which is the last phase audit report and post feature documentations menioned in the tasks.md file for initial reference. But read the entire last phase if needed to understand what was done while tasking. 
**Task Planning Required:**
> - Before starting implementation, enumerate and lock all actionable tasks for this phase below, following `.specify/templates/tasks-template.md`.
> - Add subtasks for each UI, logic, and audit step as needed.
> - Do not begin until all tasks are planned and checked in.
**Note**
- Add this section "ask Planning Required" in each phase in the tasks.md file of the News Engine Feature where ever applicable.

***For Anykind of Supporting Docs to aviod hallucination*** follow this : DOC\GUIDELINES & SOT\README.md

