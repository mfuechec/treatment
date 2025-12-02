# Quick Start: Compare & Merge Workflow

## Files Created

### Components
1. **`/src/components/comparison/CompareSection.tsx`**
   - Reusable comparison component for each section (concerns, themes, goals, etc.)
   - Shows alignment between therapist and AI items
   - Checkbox selection interface

2. **`/src/components/comparison/MergeEditor.tsx`**
   - Modal dialog for finalizing merged treatment plan
   - Edit, add, remove items
   - Save as draft or create plan

### Pages
3. **`/src/app/(dashboard)/therapist/sessions/[id]/compare/page.tsx`**
   - Main compare & merge view
   - Displays session info and risk flags
   - Six comparison sections
   - Integration with MergeEditor

### API Routes
4. **`/src/app/api/plans/route.ts`**
   - GET: List treatment plans (filtered by role)
   - POST: Create treatment plan from merged data

5. **`/src/app/api/plans/[id]/route.ts`**
   - GET: Get plan with all versions
   - PUT: Update plan content

6. **`/src/app/api/plans/[id]/approve/route.ts`**
   - POST: Approve plan and generate client-facing content using AI

## Usage Flow

1. **Navigate to Compare View:**
   ```
   /therapist/sessions/[sessionId]/compare
   ```

2. **Review Comparisons:**
   - See alignment indicators:
     - ✓ = Aligned (both noted)
     - ⚡ = AI Surfaced (you may have missed)
     - (blank) = Therapist Only

3. **Select Items:**
   - Check boxes for items to include in merged plan
   - Can select from therapist, AI, or both

4. **Create Merged Plan:**
   - Click "Create Merged Treatment Plan"
   - Review/edit in modal
   - Choose "Save as Draft" or "Create Treatment Plan"

5. **Approve Plan:**
   - After creation, navigate to plan detail
   - Click approve to generate client-facing version
   - AI translates clinical language to friendly text

## API Examples

### Create Plan
```typescript
POST /api/plans
{
  "sessionId": "session_id",
  "clientId": "client_id",
  "status": "DRAFT",
  "content": {
    "concerns": ["Anxiety in social situations"],
    "themes": ["Avoidance patterns"],
    "goals": ["Increase social confidence"],
    "strengths": ["High self-awareness"],
    "interventions": [
      {"name": "CBT", "rationale": "Address thought patterns"}
    ],
    "homework": [
      {"task": "Practice grounding", "rationale": "Build coping skills"}
    ]
  }
}
```

### Approve Plan
```typescript
POST /api/plans/[planId]/approve
```
Returns client-friendly content:
```json
{
  "summary": "Encouraging overview...",
  "whatWereWorkingOn": ["Simple goal descriptions"],
  "yourStrengths": ["Encouraging strengths"],
  "ourApproach": ["Simple interventions"],
  "betweenSessions": ["Friendly homework"]
}
```

## Key Features

- **Smart Alignment Detection:** Automatically identifies matching items
- **Flexible Selection:** Choose any combination of therapist/AI items
- **Rich Editing:** Full CRUD operations in merge editor
- **Draft Support:** Save work in progress
- **AI Translation:** Automatic client-friendly content generation
- **Risk Awareness:** Prominent risk flag display
- **Role-Based Access:** Proper authorization throughout
- **Version Management:** Tracks plan versions automatically

## Environment Variables Required

```bash
OPENAI_API_KEY=your_api_key_here  # For client content generation
DATABASE_URL=your_postgres_url     # For Prisma
NEXTAUTH_SECRET=your_secret        # For authentication
```

## Next Steps

To complete the workflow, consider adding:
1. Plan detail view page
2. Client portal for viewing approved plans
3. Version comparison UI
4. PDF export functionality
5. Email delivery of plans
