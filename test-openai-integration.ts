/**
 * Test script for OpenAI integration
 * Run with: npx tsx test-openai-integration.ts
 *
 * Prerequisites:
 * 1. Set OPENAI_API_KEY in .env
 * 2. Run: npm run db:generate
 */

import { generateAnalysis, generateClientView, generateSessionSummary } from './src/services/openai'
import { detectRisks, scanForKeywords, hasRiskKeywords, getRiskSummary } from './src/services/safety'

// Sample therapy session transcript for testing
const SAMPLE_TRANSCRIPT = `
Therapist: Hi Sarah, thanks for coming in today. How have things been since our last session?

Client: Honestly, not great. I've been feeling really overwhelmed with work and everything at home. Sometimes I feel like I can't keep up, you know?

Therapist: I hear you. That sounds really challenging. Can you tell me more about what's been most overwhelming?

Client: Well, my boss keeps piling on more projects, and I'm also trying to take care of my mom who's been sick. I barely have time for myself. Last week I had a moment where I just thought... what's the point of all this? Like, maybe everyone would be better off without me having to juggle everything.

Therapist: Thank you for sharing that with me. When you had that thought about "what's the point," was that connected to any thoughts of harming yourself?

Client: No, no. I mean, I get frustrated and exhausted, but I'm not going to do anything. I just need better ways to cope with the stress.

Therapist: I appreciate you clarifying that. It sounds like you're recognizing the stress is affecting your thoughts, which is actually a good sign of self-awareness. What are some things that have helped you manage stress in the past?

Client: Exercise used to help a lot, but I haven't been to the gym in months. I also like journaling, but I feel too tired to even do that lately.

Therapist: Those are both excellent coping strategies. What if we worked on finding small ways to reintroduce those activities, even in very manageable doses? Maybe 10 minutes instead of an hour?

Client: That might work. I do miss how I felt after exercising. And maybe I could write just a few sentences before bed.

Therapist: That sounds like a great starting point. You've shown a lot of resilience dealing with everything on your plate. What else do you think might help?

Client: Maybe learning to say no at work sometimes? I always feel like I have to say yes to everything.

Therapist: That's a valuable insight. Setting boundaries can be really powerful. How about we explore some strategies for that?

Client: I'd like that. I think I need help figuring out how to do it without feeling guilty.

Therapist: Absolutely, we can work on that together. You're making good progress recognizing what you need.
`

async function testAnalysis() {
  console.log('\n=== Testing generateAnalysis() ===\n')

  try {
    const analysis = await generateAnalysis(SAMPLE_TRANSCRIPT)

    console.log('✓ Analysis completed successfully\n')
    console.log('Concerns:', analysis.concerns.length)
    analysis.concerns.forEach((c, i) => {
      console.log(`  ${i + 1}. [${c.severity}] ${c.text}`)
    })

    console.log('\nThemes:', analysis.themes.length)
    analysis.themes.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t}`)
    })

    console.log('\nGoals:', analysis.goals.length)
    analysis.goals.forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.text} (${g.timeline || 'no timeline'})`)
    })

    console.log('\nInterventions:', analysis.interventions.length)
    analysis.interventions.forEach((iv, i) => {
      console.log(`  ${i + 1}. ${iv.name}`)
      console.log(`     Rationale: ${iv.rationale}`)
    })

    console.log('\nHomework:', analysis.homework.length)
    analysis.homework.forEach((hw, i) => {
      console.log(`  ${i + 1}. ${hw.task}`)
    })

    console.log('\nStrengths:', analysis.strengths.length)
    analysis.strengths.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.text}`)
    })

    console.log('\nRisk Indicators:', analysis.riskIndicators.length)
    analysis.riskIndicators.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.severity}] ${r.type}`)
      console.log(`     Excerpt: "${r.excerpt.substring(0, 80)}..."`)
    })

    return analysis
  } catch (error) {
    console.error('✗ Analysis failed:', error)
    throw error
  }
}

async function testSafety() {
  console.log('\n=== Testing Safety Detection ===\n')

  // Test keyword scanning
  console.log('--- Keyword Scan ---')
  const hasKeywords = hasRiskKeywords(SAMPLE_TRANSCRIPT)
  console.log(`Has risk keywords: ${hasKeywords}`)

  const keywordMatches = scanForKeywords(SAMPLE_TRANSCRIPT)
  console.log(`Keyword matches found: ${keywordMatches.length}`)
  keywordMatches.forEach((match, i) => {
    console.log(`  ${i + 1}. [${match.type}] "${match.keyword}"`)
    console.log(`     Context: ${match.excerpt.substring(0, 100)}...`)
  })

  // Test full risk detection
  console.log('\n--- Full Risk Detection (with AI) ---')
  try {
    const risks = await detectRisks(SAMPLE_TRANSCRIPT)
    console.log(`✓ Risk detection completed. Found ${risks.length} risk(s)\n`)

    risks.forEach((risk, i) => {
      console.log(`  ${i + 1}. [${risk.severity}] ${risk.type}`)
      console.log(`     Excerpt: "${risk.excerpt.substring(0, 80)}..."`)
      if (risk.keyword) {
        console.log(`     Keyword: "${risk.keyword}"`)
      }
    })

    const summary = getRiskSummary(risks)
    console.log('\nRisk Summary:')
    console.log(`  Total: ${summary.total}`)
    console.log(`  Highest Severity: ${summary.highestSeverity}`)
    console.log(`  By Severity:`, summary.bySeverity)
    console.log(`  By Type:`, summary.byType)

    return risks
  } catch (error) {
    console.error('✗ Risk detection failed:', error)
    throw error
  }
}

async function testClientView() {
  console.log('\n=== Testing generateClientView() ===\n')

  const mockTherapistContent = {
    concerns: [
      { text: 'Work-related stress and burnout', severity: 'MODERATE' as const },
      { text: 'Caregiver burden from supporting ill parent', severity: 'MODERATE' as const }
    ],
    themes: ['Overwhelm', 'Self-care deficit', 'Boundary-setting'],
    goals: [
      { text: 'Develop stress management techniques', timeline: 'short-term' },
      { text: 'Establish work-life boundaries', timeline: 'medium-term' }
    ],
    interventions: [
      { name: 'Cognitive-Behavioral Therapy', rationale: 'Address negative thought patterns' },
      { name: 'Mindfulness techniques', rationale: 'Reduce stress and increase present-moment awareness' }
    ],
    homework: [
      { task: 'Practice 10 minutes of exercise daily', rationale: 'Reintroduce physical activity gradually' },
      { task: 'Journal for 5 minutes before bed', rationale: 'Process emotions and reduce nighttime rumination' }
    ],
    strengths: [
      { text: 'High self-awareness and insight', excerpts: [] },
      { text: 'Demonstrates resilience in managing multiple responsibilities', excerpts: [] }
    ]
  }

  try {
    const clientView = await generateClientView(mockTherapistContent)

    console.log('✓ Client view generated successfully\n')
    console.log('Summary:')
    console.log(`  ${clientView.summary}\n`)

    console.log('Your Goals:')
    clientView.yourGoals.forEach((goal, i) => {
      console.log(`  ${i + 1}. ${goal}`)
    })

    console.log('\nWhat We Are Doing:')
    clientView.whatWeAreDoing.forEach((intervention, i) => {
      console.log(`  ${i + 1}. ${intervention}`)
    })

    console.log('\nYour Homework:')
    clientView.yourHomework.forEach((hw, i) => {
      console.log(`  ${i + 1}. ${hw}`)
    })

    console.log('\nYour Strengths:')
    clientView.yourStrengths.forEach((strength, i) => {
      console.log(`  ${i + 1}. ${strength}`)
    })

    console.log('\nNext Time:')
    console.log(`  ${clientView.nextTime}`)

    return clientView
  } catch (error) {
    console.error('✗ Client view generation failed:', error)
    throw error
  }
}

async function testSessionSummary() {
  console.log('\n=== Testing generateSessionSummary() ===\n')

  try {
    const summary = await generateSessionSummary(SAMPLE_TRANSCRIPT)

    console.log('✓ Session summaries generated successfully\n')
    console.log('Therapist Summary:')
    console.log(`  ${summary.therapistSummary}\n`)

    console.log('Client Summary:')
    console.log(`  ${summary.clientSummary}`)

    return summary
  } catch (error) {
    console.error('✗ Session summary generation failed:', error)
    throw error
  }
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║  OpenAI Integration Test Suite                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  // Check environment
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n✗ ERROR: OPENAI_API_KEY not found in environment variables')
    console.error('  Please add it to your .env file and try again.\n')
    process.exit(1)
  }

  console.log('\n✓ OPENAI_API_KEY found in environment')
  console.log(`  API Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...\n`)

  const results = {
    analysis: null as any,
    risks: null as any,
    clientView: null as any,
    summary: null as any,
  }

  try {
    // Test 1: Analysis
    results.analysis = await testAnalysis()

    // Test 2: Safety
    results.risks = await testSafety()

    // Test 3: Client View
    results.clientView = await testClientView()

    // Test 4: Session Summary
    results.summary = await testSessionSummary()

    // Success summary
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║  ✓ ALL TESTS PASSED                                       ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')

    console.log('Integration is working correctly! You can now:')
    console.log('  1. Start your development server: npm run dev')
    console.log('  2. Create a session with a transcript')
    console.log('  3. POST to /api/sessions/:id/analyze')
    console.log('  4. GET from /api/sessions/:id/compare\n')

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗')
    console.error('║  ✗ TESTS FAILED                                           ║')
    console.error('╚════════════════════════════════════════════════════════════╝\n')
    console.error('Error:', error)
    console.error('\nPlease check:')
    console.error('  1. OPENAI_API_KEY is valid')
    console.error('  2. OpenAI API is accessible')
    console.error('  3. You have sufficient API credits')
    console.error('  4. Network connection is working\n')
    process.exit(1)
  }
}

// Run tests
runTests()
