# Database Seed Script Documentation

## Overview

The seed script (`prisma/seed.ts`) populates your database with comprehensive demo data for the Tava Treatment Plan Generator, including realistic therapy sessions, complete workflow examples, and a crisis demonstration case.

## What Gets Created

### 1. Demo Therapists (2)
- **Dr. Sarah Chen** (sarah@tava.demo)
  - License: LMFT-CA-12345
  - Specialty: Anxiety Disorders, Cognitive Behavioral Therapy (CBT)
  - Password: `demo123`

- **Dr. Marcus Williams** (marcus@tava.demo)
  - License: PSY-CA-67890
  - Specialty: Trauma-Focused Therapy, EMDR
  - Password: `demo123`

### 2. Demo Clients (4, all linked to Dr. Chen)
- **Alex Morgan** (alex@tava.demo) - Work anxiety case
- **Jordan Rivera** (jordan@tava.demo) - Depression/life transition
- **Casey Thompson** (casey@tava.demo) - Panic disorder (minimal data)
- **Taylor Kim** (taylor@tava.demo) - High-risk crisis demo case
- All passwords: `demo123`

### 3. Realistic Therapy Transcripts (3 comprehensive sessions)

#### Transcript 1: Alex - Work Anxiety (~19 minutes)
A complete CBT session addressing:
- Performance anxiety about upcoming presentation
- Severe insomnia (3 hours/night)
- Physical anxiety symptoms (trembling, racing heart)
- Catastrophic thinking patterns
- Sleep hygiene intervention
- Cognitive restructuring

**Demonstrates:**
- Full therapist impressions workflow
- AI analysis integration
- Treatment plan with 2 versions (showing revision history)
- Session summaries (therapist + client views)

#### Transcript 2: Jordan - Depression (~18 minutes)
A behavioral activation session covering:
- Job loss and identity crisis
- Social isolation and withdrawal
- Financial stress and job search avoidance
- Loss of routine and structure
- Belief about being a burden

**Demonstrates:**
- Complete workflow (impressions + AI analysis)
- APPROVED treatment plan (visible in client view)
- Client-friendly language translation
- Session summaries

#### Transcript 3: Taylor - Crisis (~16 minutes)
A high-risk session with subtle crisis indicators:
- Passive suicidal ideation ("if I just... wasn't here")
- Hopelessness and isolation
- Consideration of means (medications)
- Dissociation and disconnection
- Safety planning intervention

**Demonstrates:**
- Risk flag detection system
- 4 risk flags (3 SI, 1 escalation)
- High-severity risk indicators
- Safety plan documentation

### 4. Complete Data Workflow Examples

#### Alex's Session (Complete Workflow)
```
Session → TherapistImpressions → AIAnalysis → TreatmentPlan v1 → TreatmentPlan v2 → SessionSummary
Status: PLAN_MERGED (final state)
```

#### Jordan's Session (Approved Plan)
```
Session → TherapistImpressions → AIAnalysis → TreatmentPlan v1 (APPROVED) → SessionSummary
Status: PLAN_MERGED
Client View: ✅ Available (plan approved)
```

#### Taylor's Session (Crisis - In Progress)
```
Session → RiskFlags (4 flagged) → SessionSummary (therapist only)
Status: AI_ANALYZED
Risk Flags: ⚠️ MODERATE SI (3), ⚠️ HIGH escalation (1)
Client View: ❌ Not available (safety concern pending review)
```

## Prerequisites

### 1. Database Setup

Your database must be running and accessible. The project uses Prisma Accelerate by default.

**Option A: If using the provided DATABASE_URL** (Prisma Accelerate)
- Ensure the Prisma Accelerate connection in `.env` is valid
- The connection string should start with `prisma+postgres://`

**Option B: If using local PostgreSQL**
1. Make sure PostgreSQL is running:
   ```bash
   brew services start postgresql@14
   # OR
   pg_ctl -D /usr/local/var/postgres start
   ```

2. Create a database:
   ```bash
   createdb tava_treatment
   ```

3. Update `.env` with direct connection:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tava_treatment?schema=public"
   ```

### 2. Schema Setup

Push the Prisma schema to your database:

```bash
npm run db:push
```

This creates all tables, enums, and relationships defined in `prisma/schema.prisma`.

### 3. Generate Prisma Client

Generate the Prisma client code:

```bash
npm run db:generate
```

This creates the TypeScript types and client in `src/generated/prisma/`.

## Running the Seed Script

### Method 1: Using npm script (recommended)
```bash
npm run db:seed
```

### Method 2: Direct execution
```bash
npx tsx prisma/seed.ts
```

## Expected Output

```
🌱 Starting seed process...

✅ Database connection successful

🧹 Cleaning up existing demo data...
✅ Cleanup complete

👨‍⚕️ Creating demo therapists...
✅ Created Dr. Sarah Chen (LMFT) and Dr. Marcus Williams (PsyD)

👥 Creating demo clients...
✅ Created 4 demo clients: Alex, Jordan, Casey, and Taylor

📝 Creating therapy sessions...
✅ Created 4 therapy sessions

💭 Creating therapist impressions...
✅ Created therapist impressions for Alex

🤖 Creating AI analysis...
✅ Created AI analysis for Alex

📋 Creating treatment plans...
✅ Created treatment plans for Alex (2 versions) and Jordan (approved)

⚠️  Creating risk flags...
✅ Created 4 risk flags for Taylor (SI and escalation)

📄 Creating session summaries...
✅ Created session summaries for Alex, Jordan, and Taylor

💭 Creating additional impressions and analysis for Jordan...
✅ Created impressions and AI analysis for Jordan

✨ Seed completed successfully!

📊 Summary:
   - 2 therapists: Dr. Sarah Chen, Dr. Marcus Williams
   - 4 clients: Alex, Jordan, Casey, Taylor
   - 4 sessions with realistic transcripts
   - Full workflow data for Alex (impressions, AI analysis, treatment plan v1 & v2)
   - Complete workflow for Jordan (impressions, AI analysis, approved treatment plan)
   - Crisis case for Taylor with 4 risk flags
   - Session summaries for Alex, Jordan, and Taylor

🔐 Login credentials (all use password "demo123"):
   Therapist: sarah@tava.demo or marcus@tava.demo
   Clients: alex@tava.demo, jordan@tava.demo, casey@tava.demo, taylor@tava.demo
```

## Features of the Seed Data

### 1. Idempotent Design
The script can be run multiple times safely:
- Deletes existing demo data first (emails matching `*.tava.demo`)
- Uses cascade deletes to clean up related records
- Creates fresh data on each run

### 2. Password Security
- All passwords are hashed using bcrypt (10 rounds)
- Demo password: `demo123` for all accounts
- Stored as secure hashes in the database

### 3. Realistic Content
- **Timestamps**: All dialog includes realistic timestamps
- **Clinical language**: Authentic therapeutic dialog
- **Progression**: Sessions show natural conversation flow
- **Variety**: Different presenting problems, modalities, and outcomes

### 4. Complete Relational Data
- Proper foreign key relationships
- Therapist-client assignments
- Session-impression-analysis chains
- Treatment plan versioning
- Risk flag associations

### 5. Workflow State Examples
- `TRANSCRIPT_UPLOADED`: Casey's session (minimal processing)
- `AI_ANALYZED`: Taylor's session (analyzed, risks flagged)
- `PLAN_MERGED`: Alex and Jordan's sessions (complete workflow)

## Using the Demo Data

### Login as Therapist
```
Email: sarah@tava.demo
Password: demo123
```

**You can:**
- View all 4 clients (Alex, Jordan, Casey, Taylor)
- See Alex's complete workflow with 2 plan versions
- Review Jordan's approved treatment plan
- Respond to Taylor's crisis flags
- Upload new transcripts for Casey

### Login as Client
```
Email: jordan@tava.demo
Password: demo123
```

**You can:**
- View your approved treatment plan in plain language
- See session summary
- Review goals and action steps

### Login as High-Risk Client
```
Email: taylor@tava.demo
Password: demo123
```

**You can:**
- Experience restricted view (no plan visible yet due to crisis)
- See that session is being reviewed

## Troubleshooting

### Error: "Cannot find module '../src/generated/prisma'"
**Solution:** Run `npm run db:generate`

### Error: "Cannot fetch data from service" or "Can't reach database server"
**Solution:**
1. Check if database is running
2. Verify `DATABASE_URL` in `.env`
3. Test connection: `npx prisma db push`

### Error: "P2002: Unique constraint failed"
**Solution:** The script already handles cleanup, but if you encounter this:
```bash
# Manual cleanup
npx prisma studio
# Delete users with emails ending in @tava.demo
```

### Error: Module 'bcryptjs' not found
**Solution:** Install dependencies
```bash
npm install
```

### Seed runs but no data appears
**Solution:**
1. Check you're connected to the correct database
2. Verify in Prisma Studio: `npm run db:studio`
3. Check console for error messages

## Inspecting Seeded Data

### Using Prisma Studio (Recommended)
```bash
npm run db:studio
```
Opens a GUI at http://localhost:5555 where you can browse all tables.

### Using psql
```bash
psql -d tava_treatment

-- View users
SELECT email, role FROM "User";

-- View sessions with status
SELECT s.id, c."displayName", s."sessionDate", s.status
FROM "Session" s
JOIN "Client" c ON s."clientId" = c.id;

-- View risk flags
SELECT rf."riskType", rf.severity, c."displayName"
FROM "RiskFlag" rf
JOIN "Session" s ON rf."sessionId" = s.id
JOIN "Client" c ON s."clientId" = c.id;
```

## Modifying the Seed Data

The seed script is highly modular. To customize:

### Add More Clients
```typescript
const newClient = await prisma.client.create({
  data: {
    userId: newUser.id,
    therapistId: drSarah.id,
    displayName: 'Your Client Name'
  }
});
```

### Add More Transcripts
1. Define the transcript as a constant (see existing examples)
2. Create a session with the transcript
3. Optionally add impressions, analysis, and plans

### Change Demo Credentials
```typescript
const passwordHash = await hashPassword('your-password');
```

### Add More Therapists
Follow the pattern for `drSarah` and `drMarcus` in the seed script.

## Data Schema Reference

For complete schema details, see:
- `prisma/schema.prisma` - Database schema
- `ARCHITECTURE.md` - System architecture
- `PRD.md` - Product requirements

## Security Note

This seed data is for **development and demo purposes only**:
- Uses well-known passwords (`demo123`)
- Contains fictional PHI (Protected Health Information)
- Email domains use `.demo` TLD
- Should NOT be used in production

For production:
- Remove or disable seed script
- Use strong, unique passwords
- Implement proper authentication
- Follow HIPAA compliance guidelines

## Next Steps After Seeding

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Login as therapist:**
   - Go to http://localhost:3000
   - Login with sarah@tava.demo / demo123

3. **Explore the workflows:**
   - View Alex's session to see complete treatment plan workflow
   - Review Jordan's approved plan (visible in client view)
   - Check Taylor's risk flags

4. **Test new sessions:**
   - Upload a transcript for Casey
   - Add your own impressions
   - Trigger AI analysis
   - Compare results

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `QUICK_START.md` for setup steps
3. See `ARCHITECTURE.md` for system overview
4. Check `OPENAI_INTEGRATION.md` for AI features
