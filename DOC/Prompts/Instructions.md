commit all the changes to your local repository:
git add .
git commit -m "Your commit message"
Push the changes to the remote repository: git push to the branch-name: News Engine-Backend


 ***backup instruction***
Take a backup of the PostgreSQL database running in Docker to ensure data safety before making any significant changes. Use the following command to create a backup:
docker exec -t your_postgres_container pg_dumpall -c -U your_db_user > /path/to/backup/backup_$(date +%Y%m%d_%H%M%S).sql

***instruction***
each time you make commits, you must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Prompts\gitstatus.md file with the latest commit information to keep track of changes effectively. with the commit id ,timestamp, and a brief description of the changes made in that commit.make sure the push has the excatly current versions, so that it can be restored if needed. 

Git Backup Instruction Take a local backup of this current state of this site, make sure it restores to this exact state. you must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\gitstatus.md file with the latest commit information to keep track of changes effectively. with the commit id ,timestamp, and a brief description of the changes made in that commit.make sure the push has the excatly current versions, so that it can be restored if needed.

--------------------------------------------------------------------------------
time you make commits, you must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Prompts\gitstatus.md file with the latest commit information to keep track of changes effectively. Include the commit id, timestamp, and a brief description of the changes made in that commit. Make sure the push and backup have the exact current versions, so that it can be restored if needed.



***Git Backup Instruction *** 
Take a local backup of this current state of this site, make sure it restores to this exact state. you must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\gitstatus.md file with the latest commit information to keep track of changes effectively. with the commit id ,timestamp, and a brief description of the changes made in that commit.make sure the push has the excatly current versions, so that it can be restored if needed. Take a database backup (PostgreSQL in Docker)

***Git Commit***
After making changes to the codebase, you must commit those changes to your local Git repository with a descriptive commit message. This helps in tracking changes and maintaining version control. 

***chat/task continuation prompt***
This chat becomes very slow after many messages. To start a new chat and keep continuity, please crafft a prompt with the tasks are done are what to do next. so that we dont lose context. 


------------------------------------------------------------------------------------------------------

rayisselectricalandsolar@gmail.com

Admin123!Secure


***MY WORKFLOW***

***Phase 1 : Building SOT***
  - Here is my Initial Plan : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Plan\CHatGPT.md
  - Prepare the 6 phase SOT folder files in 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT as per the 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file . 

***Phase 2 : Frontend Planning***
- Here is the front end plan based on 6 phase SOT : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT\FEATURE-SOT.md
- Based on this frontend plan , Prepare the frontend UI UX prompts in
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder by following the :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\AI Prompting Guideline.md Instructions. 
- The Outcome should be followed by This : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Template_Comprehensive_UI UX.md

--------------------------------------------------------------------------------------


   ***Frontend Migration Workflow***
  - Here is the prototype we built with google ai studio :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\GoogleAIStudio UI UX\ai-news-engine-admin- V6
 
  - Follow the file instructions strictly while preparing the migration plan
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\FRONTEND-PROTOTYPE-WORKFLOW\README.md .

   - Create the Migration plan in the :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\MIGRATION.

  - Based on the Migration plan that you have created , Prepare the tasks.md file in the Migration folder as well followed by the template : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\.specify\templates\tasks-template.md

  ***Instructions*** 
  I only need to migrate the news frontend pages and its realted modals. 
  - News Page
  - News Details Page
  - Share Modal.


### EXECUTION-GRADE AI PROMPT

***Frontend Migration Workflow***
  1. CONTEXT
You are migrating a Google AI Studio prototype (V6) to the production Next.js codebase for the NEWS ENGINE feature. The migration must strictly follow the project’s prototype-first, SOT-driven workflow and all documentation standards.

2. WORKFLOW STEPS
Prototype Reference

Use the finalized prototype:
DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6
This prototype is the UI SOT (Source of Truth) for migration.
Migration Plan Preparation

Strictly follow:
DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md
Reference the migration playbook:
DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md
Create a detailed migration plan in:
DOC/FEATURES/NEWS ENGINE/MIGRATION/
Task Tracking

Prepare tasks.md in the MIGRATION folder using:
tasks-template.md
Do NOT create a tasks.md in the SOT folder for prototype-driven frontend features.
Verification & Documentation

After migration, run all verification gates (typecheck, build, theme checks, etc.) as per the migration contract.
Document verification results in the MIGRATION folder.
Update DOC/FEATURES/NEWS ENGINE/SOT/README.md to reflect migration status, deviations, and lessons learned.
SOT & Documentation Compliance

Ensure all SOT/README and index files are updated to reflect the new workflow and any changes.
All folderization and file creation must match the structure in DOC/FEATURES/NEWS ENGINE.
3. ENHANCEMENT RULES
Explicitly reference the migration playbook in all migration plans.
SOT/README must be updated after migration to maintain a single source of truth.
All verification steps must be documented and results stored in the MIGRATION folder.
Remove any instruction to create tasks.md in SOT for prototype-driven frontend features.
Ensure all documentation and plans are traceable, auditable, and compliant with the latest workflow.
4. SUCCESS CRITERIA
Migration plan and tasks.md exist in the MIGRATION folder, not SOT.
All steps reference the prototype, workflow README, and migration playbook.
SOT/README and index files are updated post-migration.
Verification results are documented.
No redundant or conflicting instructions remain in the guidelines.

  ***Instructions*** 
  I only need to migrate the news frontend pages and its realted modals. 
  - News Page
  - News Details Page
  - Share Modal.