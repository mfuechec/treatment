# Compare & Merge Workflow Implementation

This document describes the Compare & Merge workflow implementation for the Tava Treatment Plan Generator.

## Created Files

### 1. Components

#### `/src/components/comparison/CompareSection.tsx`
A reusable component for comparing therapist impressions with AI analysis for each section.

**Features:**
- Two-column comparison view
- Automatic alignment detection (aligned, AI surfaced, therapist only)
- Visual indicators: checkmark (aligned), lightning bolt (AI surfaced)
- Checkbox selection for items to include in merged plan
- Displays metadata: severity, timeline, rationale
- Real-time stats showing aligned count, AI surfaced count, therapist only count
- Responsive design with proper spacing and hover states

**Props:**
- `title`: Section title
- `therapistItems`: Items from therapist impressions
- `aiItems`: Items from AI analysis
- `selectedItems`: Set of selected item IDs
- `onToggleItem`: Callback for checkbox changes
- `type`: Section type (concerns, themes, goals, etc.)

#### `/src/components/comparison/MergeEditor.tsx`
A modal dialog for finalizing the merged treatment plan.

**Features:**
- Displays all selected items organized by section
- Inline editing of all items
- Add/remove items functionality
- Drag-and-drop reordering (visual indicators with GripVertical icon)
- Separate handling for simple lists (concerns, themes) and complex items (interventions, homework)
- Save as Draft or Create Treatment Plan options
- Full-screen responsive modal with scroll support

**Props:**
- `open`: Modal open state
- `onOpenChange`: Callback for modal state changes
- `selectedItems`: Selected items by category
- `onSave`: Callback with merged data and draft flag
- `isSaving`: Loading state for save operations

### 2. Pages

#### `/src/app/(dashboard)/therapist/sessions/[id]/compare/page.tsx`
The main Compare & Merge view page.

**Features:**
- Session header with client name and date
- Risk flags section (prominent display if any detected)
- Legend explaining alignment icons
- Six comparison sections:
  - Clinical Concerns
  - Session Themes
  - Treatment Goals
  - Client Strengths
  - Recommended Interventions (AI only)
  - Homework Assignments (AI only)
- Selection tracking across all sections
- "Create Merged Treatment Plan" button (disabled if nothing selected)
- Integration with MergeEditor for final editing
- Loading states and error handling
- Automatic navigation to plan view after creation
- Updates session status to PLAN_MERGED after successful creation

### 3. API Routes

#### `/src/app/api/plans/route.ts`
Handles listing and creating treatment plans.

**GET `/api/plans`**
- Lists treatment plans filtered by role
- Query params: `clientId`, `status`
- Therapists see their clients' plans
- Clients see only their own plans
- Returns plans with latest version

**POST `/api/plans`**
- Creates new treatment plan from merged data
- Validates therapist ownership of client and session
- Creates new plan or adds version to existing plan
- Auto-increments version numbers
- Updates session status to PLAN_MERGED
- Returns created plan with all versions

**Request Body:**
```json
{
  "sessionId": "string",
  "clientId": "string",
  "status": "DRAFT" | "APPROVED",
  "content": {
    "concerns": ["string"],
    "themes": ["string"],
    "goals": ["string"],
    "strengths": ["string"],
    "interventions": [{"name": "string", "rationale": "string"}],
    "homework": [{"task": "string", "rationale": "string"}]
  }
}
```

#### `/src/app/api/plans/[id]/route.ts`
Handles getting and updating individual treatment plans.

**GET `/api/plans/[id]`**
- Fetches plan with all versions
- Role-based access control
- Returns full plan details including client info

**PUT `/api/plans/[id]`**
- Updates current version's therapist content
- Only therapists can update
- Sets editedAt timestamp
- Validates ownership

**Request Body:**
```json
{
  "content": {
    "concerns": ["string"],
    "themes": ["string"],
    "goals": ["string"],
    "strengths": ["string"],
    "interventions": [{"name": "string", "rationale": "string"}],
    "homework": [{"task": "string", "rationale": "string"}]
  }
}
```

#### `/src/app/api/plans/[id]/approve/route.ts`
Handles plan approval and client-facing content generation.

**POST `/api/plans/[id]/approve`**
- Approves a treatment plan
- Generates client-facing version using GPT-4o-mini
- Translates clinical language to warm, accessible language
- Updates plan status to APPROVED
- Sets clientContent on version

**AI-Generated Client Content Structure:**
```json
{
  "summary": "Brief, encouraging overview paragraph",
  "whatWereWorkingOn": ["Goals in simple language"],
  "yourStrengths": ["Strengths in encouraging language"],
  "ourApproach": ["Interventions explained simply"],
  "betweenSessions": ["Homework in friendly, actionable language"]
}
```

## Data Flow

1. **Compare View Loading:**
   - Fetches session with impressions, AI analysis, and risk flags
   - Converts data to ComparisonItem format
   - Displays side-by-side comparison

2. **Item Selection:**
   - User checks/unchecks items across all sections
   - Selection state managed in Set for efficient lookups
   - Selected count displayed in footer

3. **Merge Editing:**
   - Opens MergeEditor modal with selected items
   - User can edit, add, remove, and reorder items
   - Two save options: Draft or Create Plan

4. **Plan Creation:**
   - POST to `/api/plans` with merged content
   - Server creates plan and version records
   - Updates session status
   - Redirects to plan detail view

5. **Plan Approval:**
   - POST to `/api/plans/[id]/approve`
   - AI generates client-friendly content
   - Plan status updated to APPROVED
   - Client can now view the plan

## User Experience Highlights

- **Visual Clarity:** Color-coded badges and icons make alignment obvious
- **Efficiency:** Bulk selection with checkboxes speeds up workflow
- **Flexibility:** Full editing capabilities in merge editor
- **Safety:** Draft mode allows saving work in progress
- **Client Focus:** AI translation ensures accessible communication
- **Risk Awareness:** Prominent risk flag display ensures safety considerations

## Technical Highlights

- **TypeScript:** Full type safety throughout
- **Responsive Design:** Works on all screen sizes
- **Loading States:** Proper feedback during async operations
- **Error Handling:** Comprehensive error messages
- **Role-Based Access:** Proper authorization checks
- **Optimistic Updates:** Smooth UI transitions
- **Accessibility:** Semantic HTML and ARIA attributes via Radix UI

## Next Steps

To complete the workflow, you may want to add:
1. Plan detail/view page at `/therapist/plans/[id]`
2. Client view of approved plans
3. Plan version history view
4. Plan comparison between versions
5. Export plan as PDF
6. Email plan to client

## Dependencies Used

- `@radix-ui/react-checkbox`: Checkbox components
- `@radix-ui/react-dialog`: Modal dialogs
- `lucide-react`: Icons
- `openai`: AI content generation
- `zod`: Request validation
- `next-auth`: Authentication
- `@prisma/client`: Database access
