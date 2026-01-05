# Advanced SaaS System Audit Prompt

## Objective
Conduct a comprehensive, advanced-level audit of the entire SaaS system, including all backend, frontend, and database layers. The goal is to identify opportunities for:
- Enhanced data structure (e.g., native JSON columns, relational improvements)
- Advanced querying, analytics, and reporting
- Security, compliance, and auditability
- Scalability and maintainability
- Modern best practices (state machines, event sourcing, CQRS, etc.)
- Observability, logging, and monitoring
- User experience and workflow optimization

## Instructions for the AI Auditor
1. **Systematic Coverage:**
   - Review all API endpoints, backend services, and business logic.
   - Analyze all database models, schema, and data types (including use of JSON, arrays, enums, relations).
   - Inspect frontend components for data flow, state management, and API usage.
   - Examine notification, event, and background job systems.

2. **Advanced Data Handling:**
   - Identify where structured data (e.g., JSON columns, arrays, enums) can replace plain text for better querying and analytics.
   - Recommend schema changes for future-proofing and reporting.
   - Suggest indexes, constraints, or partitioning for performance.

3. **Security & Compliance:**
   - Audit authentication, authorization, and access control boundaries.
   - Check for least-privilege, zero-trust, and audit log coverage.
   - Identify sensitive data and recommend encryption or masking where needed.

4. **Workflow & State:**
   - Ensure all critical entities use explicit state machines with allowed transitions.
   - Recommend improvements for workflow clarity, error handling, and rollback.

5. **Observability:**
   - Evaluate logging, tracing, and monitoring coverage.
   - Suggest improvements for incident response and root-cause analysis.

6. **Scalability & Maintainability:**
   - Identify bottlenecks, single points of failure, and code smells.
   - Recommend modularization, service boundaries, or microservices if appropriate.

7. **User Experience:**
   - Review UI/UX for clarity, validation, and feedback.
   - Suggest improvements for accessibility, onboarding, and workflow efficiency.

8. **Actionable Recommendations:**
   - For each finding, provide a clear recommendation, rationale, and (if possible) a code or schema example.
   - Prioritize recommendations by impact and effort.

## Output Format
- Executive summary (key findings, top priorities)
- Detailed findings by category (data, security, workflow, etc.)
- Actionable recommendations with rationale and examples
- Appendix: list of reviewed files, endpoints, and models

---

**Prompt for AI Auditor:**

> You are an expert SaaS architect and auditor. Perform a deep, advanced-level audit of this entire codebase and database. Identify all opportunities for advanced data structuring, analytics, security, workflow, and scalability improvements. For each, provide actionable recommendations, rationale, and examples. Follow the instructions above and output your findings in the specified format.
