/**
 * TAVA TREATMENT PLAN GENERATOR - DATABASE SEED SCRIPT
 *
 * This script populates the database with comprehensive demo data including:
 * - 2 Demo therapists (Dr. Sarah Chen, Dr. Marcus Williams)
 * - 4 Demo clients (Alex, Jordan, Casey, Taylor)
 * - 3 Realistic therapy session transcripts
 * - Complete workflow examples (impressions, AI analysis, treatment plans)
 * - Risk flag demonstration (Taylor's crisis session)
 *
 * PREREQUISITES:
 * 1. Database must be running and accessible
 * 2. Run `npm run db:push` to create schema
 * 3. Run `npm run db:generate` to generate Prisma client
 *
 * USAGE:
 *   npx tsx prisma/seed.ts
 *   OR
 *   npm run db:seed
 *
 * LOGIN CREDENTIALS (all use password "demo123"):
 *   Therapists: sarah@tava.demo, marcus@tava.demo
 *   Clients: alex@tava.demo, jordan@tava.demo, casey@tava.demo, taylor@tava.demo
 */

import { PrismaClient, Role, SessionStatus, PlanStatus, RiskLevel } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('   Make sure your database is running and DATABASE_URL is correct in .env\n');
    console.error('   Steps to fix:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify DATABASE_URL in .env');
    console.error('   3. Run: npm run db:push\n');
    throw error;
  }
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ============================================================================
// REALISTIC THERAPY TRANSCRIPTS
// ============================================================================

const TRANSCRIPT_ALEX_WORK_ANXIETY = `THERAPIST: [00:00:15] Good to see you again, Alex. How has your week been?

CLIENT: [00:00:22] Honestly? Pretty rough. The presentation I mentioned is Friday and I've barely slept. Maybe three hours last night?

THERAPIST: [00:00:35] Three hours. That must be exhausting. Tell me more about what's keeping you up.

CLIENT: [00:00:45] It's this constant loop in my head. I keep rehearsing what I'm going to say, then I think about all the ways it could go wrong. My manager will be there, and the VP of our division. If I mess this up...

THERAPIST: [00:01:05] What happens if you mess it up?

CLIENT: [00:01:12] I could lose my credibility. They might think I'm not ready for the promotion I've been working toward. Or worse, that they made a mistake hiring me in the first place.

THERAPIST: [00:01:28] Those sound like really high stakes. Have you given presentations before?

CLIENT: [00:01:35] Yeah, plenty. But this one feels different. It's about the new initiative I've been leading, and if they don't buy in, six months of work could just... disappear.

THERAPIST: [00:01:52] So there's both the performance anxiety about presenting and the anxiety about the outcome of the project itself.

CLIENT: [00:02:05] Exactly. And my body has been freaking out too. Yesterday during the dry run with my team, my hands were shaking so badly I could barely hold my notes. My heart was racing, I was sweating... it was humiliating.

THERAPIST: [00:02:25] That sounds really uncomfortable. Did your team notice?

CLIENT: [00:02:30] I don't think so? I tried to play it off, kept my hands behind my back mostly. But I was so aware of it the whole time.

THERAPIST: [00:02:42] Let's pause there. When you noticed those physical sensations - the racing heart, the sweating, the shaking - what thoughts were going through your mind?

CLIENT: [00:03:00] "Everyone can see how nervous I am. They're going to think I don't know what I'm talking about. I'm going to fail."

THERAPIST: [00:03:12] And when you had those thoughts, how did that affect your anxiety level?

CLIENT: [00:03:18] It got worse. Like, way worse. I almost felt like I couldn't breathe for a second.

THERAPIST: [00:03:30] That makes sense. I'm hearing a pattern we've talked about before - the anxiety creates physical symptoms, which then create more anxious thoughts, which intensify the physical symptoms. Does that sound familiar?

CLIENT: [00:03:48] Yeah, it's that cycle again. I know it logically, but in the moment, it feels so real.

THERAPIST: [00:04:00] It IS real - your body is genuinely responding to perceived threat. The question is whether the threat is as dangerous as your mind is telling you it is. Have you been practicing the breathing exercises we worked on?

CLIENT: [00:04:18] I've tried a few times, but honestly, when I'm that anxious, I forget about them. Or I feel like they won't work anyway.

THERAPIST: [00:04:32] That's really common. The tools feel hardest to access when we need them most. What about the thought records? Have you been keeping track of these anxious thoughts?

CLIENT: [00:04:45] Not really. I keep meaning to, but by the end of the day I'm so exhausted I just crash.

THERAPIST: [00:05:00] Okay. So we have the sleep deprivation making everything harder, and then the tools we've discussed aren't being used consistently. Is that a fair summary?

CLIENT: [00:05:12] Yeah... I know I should be doing them. I'm sorry.

THERAPIST: [00:05:18] Hey, no apologies needed. I'm not scolding you. I'm trying to understand what the barriers are. It sounds like the sleep issue is making it harder to manage the anxiety, and the anxiety is making it harder to sleep.

CLIENT: [00:05:35] That's exactly it. It's this vicious cycle and I don't know how to break it.

THERAPIST: [00:05:45] Let's work on that today. First, I want to understand more about what happens at night. Walk me through last night. What time did you go to bed?

CLIENT: [00:06:00] I got in bed around 10:30, which is normal for me. But then I just lay there, mind racing. I tried reading, scrolling on my phone, but nothing helped.

THERAPIST: [00:06:15] What were you thinking about while you were lying there?

CLIENT: [00:06:20] The presentation, mostly. And then I started thinking about how I wasn't sleeping, and how tired I'd be today, which made me more anxious...

THERAPIST: [00:06:35] Another cycle. What finally happened?

CLIENT: [00:06:40] I think I dozed off around 2 AM, then woke up at 5 and couldn't fall back asleep. So I just got up and came to work early.

THERAPIST: [06:55] And how are you feeling now, energy-wise?

CLIENT: [00:07:02] Honestly? Like a zombie. I've had so much coffee I feel jittery, but I'm still exhausted. It's not sustainable.

THERAPIST: [00:07:18] No, it's not. And I'm concerned that you're setting yourself up for the exact outcome you're afraid of - being too exhausted to present well on Friday. We need to intervene on this sleep issue immediately.

CLIENT: [00:07:35] What can I do though? I can't just turn my brain off.

THERAPIST: [00:07:42] You're right, we can't just flip a switch. But we can create better conditions for sleep and interrupt some of these patterns. Let me ask you - have you taken any time off work this week?

CLIENT: [00:07:58] No, I've been going in early and staying late, trying to prepare more.

THERAPIST: [00:08:05] How is that affecting your stress level?

CLIENT: [00:08:10] Making it worse, probably. But I feel like if I just prepare enough, I'll feel confident.

THERAPIST: [00:08:20] Has that worked? Do you feel more confident now than you did on Monday?

CLIENT: [00:08:27] ...No. If anything, I feel more anxious because I keep finding things I think I should add or change.

THERAPIST: [00:08:40] So the extra preparation isn't actually building confidence. It might even be feeding the anxiety by giving you more time to catastrophize and second-guess yourself.

CLIENT: [00:08:55] I hate that you're right.

THERAPIST: [00:09:00] I know it's frustrating. But this is actually good information. It means the solution isn't more preparation - it's managing your anxiety and taking care of your basic needs. Let's talk about a concrete plan for the next three nights before Friday.

CLIENT: [00:09:20] Okay. I'm willing to try anything at this point.

THERAPIST: [00:09:25] First, sleep hygiene basics. No screens for one hour before bed. That means no phone, no laptop, no TV. I know that's hard, but the blue light and the stimulation are working against you.

CLIENT: [00:09:42] What am I supposed to do for an hour?

THERAPIST: [00:09:46] We'll get to that. Second, you're going to leave work at 5 PM sharp for the next three days. Not 6, not 7. Five.

CLIENT: [00:09:58] I don't know if I can do that...

THERAPIST: [00:10:02] What's the fear there?

CLIENT: [00:10:07] That I won't be ready. That I'll forget something important.

THERAPIST: [00:10:15] And if you continue on this path - no sleep, high anxiety, exhausted - will you be ready?

CLIENT: [00:10:24] ...No.

THERAPIST: [00:10:28] So we're trying something different. At 5 PM, you close your laptop and you leave. We're going to prioritize your wellbeing over additional preparation, because your wellbeing is actually what's going to help you succeed.

CLIENT: [00:10:45] Okay. I can try that.

THERAPIST: [00:10:50] Good. Now, for that hour before bed. I want you to do something that's calming but engaging enough to keep your mind occupied. What used to relax you before all this started?

CLIENT: [00:11:05] I used to read fiction. I haven't picked up a novel in months.

THERAPIST: [00:11:12] Perfect. Can you read fiction for 30 minutes before bed?

CLIENT: [00:11:18] Yeah, I think so. That actually sounds nice.

THERAPIST: [00:11:24] And then the last 30 minutes, I want you to do a body scan meditation. I'm going to send you a link to a guided one that's specifically for sleep. It's going to help you notice and release the physical tension you're carrying.

CLIENT: [00:11:42] I've tried meditation before and I'm terrible at it. My mind just wanders.

THERAPIST: [00:11:50] Everyone's mind wanders. That's not failing at meditation - that's just what minds do. The practice is noticing when it happens and gently bringing your attention back. And you don't have to be "good" at it for it to help you sleep.

CLIENT: [00:12:08] Alright, I'll try it.

THERAPIST: [00:12:12] Now let's talk about what happens if you're lying in bed and you've been there for 20 minutes and you're still not asleep. What's the plan?

CLIENT: [00:12:24] Usually I just stay there hoping I'll fall asleep eventually.

THERAPIST: [00:12:30] That can actually make things worse because your brain starts associating your bed with being awake and anxious. Instead, if you're not asleep after 20 minutes, I want you to get up, go to another room, and do something boring in dim light. Read something dull, fold laundry, something like that. Then when you feel sleepy, go back to bed.

CLIENT: [00:12:55] That feels counterintuitive.

THERAPIST: [00:12:58] I know. But we want your bed to be associated with sleep, not with lying awake worrying. This is a technique called stimulus control.

CLIENT: [00:13:10] Okay, I'll try it.

THERAPIST: [00:13:14] Now let's tackle the worry itself. When you're lying there thinking about the presentation, your brain is in problem-solving mode, right? It thinks if it just works hard enough, it can prevent something bad from happening.

CLIENT: [00:13:30] Yeah, exactly.

THERAPIST: [00:13:33] But at 1 AM, you're not actually problem-solving. You're just spinning. So we need to give your brain a different job. Have you heard of worry time?

CLIENT: [00:13:45] No, what's that?

THERAPIST: [00:13:48] It's where you schedule a specific 15-minute period during the day to worry. You write down all your concerns, think through them, make any plans you need to make. Then when worries pop up at other times - like at bedtime - you remind yourself, "I have time set aside for this tomorrow at 4 PM. I don't need to figure this out right now."

CLIENT: [00:14:15] Does that actually work?

THERAPIST: [00:14:18] For many people, yes. It helps contain the worry instead of letting it take over your whole day and night. Would you be willing to try it?

CLIENT: [00:14:28] Sure. So I'd do this tomorrow at work?

THERAPIST: [00:14:32] Yes, but not right before bed. Mid-afternoon is usually good. Set a timer for 15 minutes, write down everything you're worried about regarding the presentation, and think through any actual action steps. Then when you're done, you close the notebook and move on.

CLIENT: [00:14:52] Okay. I can do that.

THERAPIST: [00:14:55] Good. Let's also work on challenging some of those catastrophic thoughts. You mentioned being afraid you could lose your credibility or that they'd think hiring you was a mistake. Let's look at the evidence. How long have you been at this company?

CLIENT: [00:15:15] Three years. I've gotten good performance reviews every year.

THERAPIST: [00:15:22] And this project you're presenting - you said you've been leading it for six months. Did someone assign you to lead it?

CLIENT: [00:15:32] Yeah, my manager specifically asked me to take it on because of my background.

THERAPIST: [00:15:40] So they trusted you with a significant initiative. Have you given updates along the way?

CLIENT: [00:15:47] Yes, weekly meetings with my manager, monthly with the steering committee.

THERAPIST: [00:15:55] And have they expressed concerns about your work or your competence?

CLIENT: [00:16:02] No... actually, my manager said last week that she's impressed with how I've handled it.

THERAPIST: [00:16:12] So let's look at the evidence. Three years of good reviews, trusted with a major project, positive feedback along the way. And on the other side, the fear that one presentation could erase all of that. Does that seem proportional?

CLIENT: [00:16:32] When you put it like that... no. It sounds kind of ridiculous.

THERAPIST: [00:16:40] Not ridiculous. Anxiety isn't logical, and it's really good at making threats seem bigger than they are. But we can challenge it with facts. Even if the presentation doesn't go perfectly - which, by the way, no presentation does - is it really going to undo three years of demonstrated competence?

CLIENT: [00:17:02] Probably not. But it still feels like it could.

THERAPIST: [00:17:08] And that's the difference between what anxiety tells us and what's actually likely to happen. We've been working on recognizing that difference. How are you feeling right now compared to when you walked in?

CLIENT: [00:17:25] A little better, honestly. Like maybe I have some control over this.

THERAPIST: [00:17:32] You do. Not over whether you feel anxious - that's not always in our control. But over how you respond to it, and how you take care of yourself. Let's summarize the plan. What are you going to do differently today?

CLIENT: [00:17:48] Leave work at 5. No screens before bed. Read for 30 minutes, then do the meditation thing. And if I can't sleep, get up instead of just lying there.

THERAPIST: [00:18:05] Perfect. And tomorrow during the day?

CLIENT: [00:18:10] The worry time thing at 4 PM.

THERAPIST: [00:18:14] Great. I want you to check in with me on Thursday - just send me a quick email about how the sleep has been going and how you're feeling about Friday. And we'll talk again next week to debrief. How does that sound?

CLIENT: [00:18:32] Good. I'm actually feeling hopeful for the first time in days.

THERAPIST: [00:18:38] That's great to hear. Remember, you've prepared well for this presentation. The issue isn't your competence or your readiness - it's managing the anxiety and taking care of yourself. You've got this.

CLIENT: [00:18:55] Thank you. I really appreciate your help with this.

THERAPIST: [00:19:00] Of course. That's what I'm here for. I'll see you next week, and I'll be thinking about you on Friday. You're going to do great.`;

const TRANSCRIPT_JORDAN_DEPRESSION = `THERAPIST: [00:00:10] Hi Jordan, come on in. How have you been since our last session?

CLIENT: [00:00:18] Okay, I guess. Some days better than others.

THERAPIST: [00:00:25] Tell me about the better days. What made them better?

CLIENT: [00:00:32] Um, Tuesday was actually decent. I managed to get out of bed before 10, took a shower, even made myself a real breakfast instead of just coffee.

THERAPIST: [00:00:48] Those sound like significant accomplishments given where you've been. How did it feel to do those things?

CLIENT: [00:00:58] It felt... normal? Which I guess is good. But also kind of sad that basic self-care feels like an achievement now.

THERAPIST: [00:01:12] I hear both the progress and the frustration with yourself. Let's acknowledge both - yes, it's hard that things that used to be automatic now take effort. And also, yes, you did those things even though they were hard. That takes real strength.

CLIENT: [00:01:35] I guess. It doesn't feel like strength. It feels like I'm barely keeping my head above water.

THERAPIST: [00:01:45] What do the harder days look like?

CLIENT: [00:01:50] Like yesterday. I didn't get out of bed until 2 PM. Spent the whole day in my pajamas, scrolling through my phone, not really even seeing what I was looking at. Ordered food because I couldn't face cooking.

THERAPIST: [00:02:10] What was going through your mind yesterday?

CLIENT: [00:02:16] Just... what's the point? I don't have anywhere to be. No one's counting on me. I used to have meetings, deadlines, people expecting things from me. Now I'm just... floating.

THERAPIST: [00:02:35] The job loss is still hitting you hard. It's been almost three months now, right?

CLIENT: [00:02:42] Ten weeks. Not that I'm counting or anything. [Laughs bitterly]

THERAPIST: [00:02:50] You mentioned last time that you had worked there for six years. That's a huge loss - not just the income, but the structure, the identity, the relationships.

CLIENT: [00:03:05] Yeah. I keep thinking I should be over it by now. People lose jobs all the time. I need to just move on.

THERAPIST: [00:03:18] Should. That's an interesting word. Who says you should be over it by now?

CLIENT: [00:03:27] I don't know. Society? Everyone else seems to bounce back faster than me.

THERAPIST: [00:03:35] How do you know how fast everyone else bounces back?

CLIENT: [00:03:40] I guess I don't. But I see people on LinkedIn posting about their new jobs and they all seem so positive and motivated and I'm just... not.

THERAPIST: [00:03:55] Social media tends to show us people's highlight reels, not their struggles. But let's focus on you. You're not just dealing with job loss. What else has been affected?

CLIENT: [00:04:10] Everything. My whole routine is gone. I used to wake up at 6:30, go to the gym, be at my desk by 8:30. Now I have nowhere to be. And the financial stress is constant. I'm burning through my savings. I lie awake at night doing math in my head, figuring out how many more months I can cover rent.

THERAPIST: [00:04:38] That sounds exhausting and scary.

CLIENT: [00:04:42] It is. And I know I should be job hunting more aggressively, but every time I sit down to look at postings or update my resume, I just feel overwhelmed and shut down.

THERAPIST: [00:04:58] What happens when you feel overwhelmed? Walk me through it.

CLIENT: [00:05:05] I'll open my laptop with good intentions, go to a job site, and there are thousands of postings. I start reading requirements and I think, "I don't have that skill" or "I'm not qualified enough" or "This sounds terrible." And then I think about having to do interviews, convince someone to hire me, start over somewhere new... and it just feels impossible.

THERAPIST: [00:05:35] So the overwhelm comes from seeing the whole enormous task at once, plus the self-doubt about your qualifications, plus anticipating future challenges. That's a lot all at once.

CLIENT: [00:05:50] When you say it like that, yeah, no wonder I shut down.

THERAPIST: [00:05:56] Have you applied to any positions in the last two weeks?

CLIENT: [00:06:02] One. And I didn't hear back. Which just confirmed what I already thought - I'm not good enough.

THERAPIST: [00:06:12] One application, no response, equals you're not good enough. Is that the logic?

CLIENT: [00:06:20] I know it sounds harsh when you repeat it back to me.

THERAPIST: [00:06:25] I'm not saying it to be harsh. I'm pointing out that your mind is drawing a very big conclusion from very limited data. How many applications do you think it typically takes to get a response?

CLIENT: [00:06:40] I don't know. A lot, I guess. When I was hiring before, we'd get hundreds of applications for one position.

THERAPIST: [00:06:50] Right. So one application with no response doesn't actually tell us much about you or your qualifications. It's just math.

CLIENT: [00:07:00] I know you're right logically, but it doesn't feel that way.

THERAPIST: [00:07:08] Feelings are valid even when they're not factual. Your feeling of inadequacy is real and painful, and it's also not an accurate reflection of your capabilities. Both things can be true.

CLIENT: [00:07:25] So what do I do with that?

THERAPIST: [00:07:28] We work on creating some distance between the feeling and the truth. But let's step back. The job search is clearly a major stressor, but it's not the only thing going on. Tell me about your social connections. How much have you been seeing friends or family?

CLIENT: [00:07:48] Not much. My mom calls every few days and I usually don't answer. I feel like I don't have anything good to tell her.

THERAPIST: [00:08:00] What about friends?

CLIENT: [00:08:03] Most of my friends were from work. We'd grab lunch, happy hours after big projects, that kind of thing. Now I don't see them. A couple people texted after I left, but I didn't really keep up the conversation. What am I going to say? "Still unemployed and depressed, how about you?"

THERAPIST: [00:08:25] So you've lost your daily social connections too. That's another significant loss. Humans need connection. When we isolate, even if it feels protective, it usually makes depression worse.

CLIENT: [00:08:42] I know I should reach out to people, but I don't have the energy. And I feel like I'd just bring them down.

THERAPIST: [00:08:52] That's the depression talking. It tells you you're a burden, that you have nothing to offer, that people don't want to hear from you. But is that true? Have people told you they don't want to hear from you?

CLIENT: [00:09:08] No. Actually, my friend Sam texted last week asking if I wanted to meet for coffee. I said I was busy.

THERAPIST: [00:09:18] But you weren't busy.

CLIENT: [00:09:20] No. I just didn't want to have to fake being okay.

THERAPIST: [00:09:27] What if you didn't have to fake it? What if you could just be honest - "I'm going through a hard time, but I'd like to see you"?

CLIENT: [00:09:38] That feels vulnerable. And what if they judge me?

THERAPIST: [00:09:45] That's a real fear. And it's also true that most people who care about us want to support us when we're struggling. What's your sense of Sam? Is Sam someone who would judge you for having a hard time?

CLIENT: [00:10:02] No, Sam's really kind. We've been friends since college. They've opened up to me about their struggles before.

THERAPIST: [00:10:15] So there's evidence that Sam is trustworthy and that your friendship has space for vulnerability. What would it mean to reach back out?

CLIENT: [00:10:28] I guess I could text them back. Maybe suggest coffee this week.

THERAPIST: [00:10:35] That would be great. And you don't have to have a long conversation or make it a big thing. Even just spending an hour with someone who cares about you can help lift the mood a bit. Let's call that a concrete action item - reach out to Sam by tomorrow. Can you commit to that?

CLIENT: [00:10:52] Yeah. I can do that.

THERAPIST: [00:10:56] Good. Now let's talk about structure. One of the things that happens when we lose our job is we lose the external structure that was organizing our days. Depression loves that void - it fills it with nothing. What we need to do is create some intentional structure.

CLIENT: [00:11:18] Like what?

THERAPIST: [00:11:20] Let's start small. You mentioned Tuesday felt better, and you got up before 10, showered, made breakfast. What if we made that the baseline? For the next week, your goal is to be out of bed by 10 every day, take a shower, and eat something nutritious. Not just coffee.

CLIENT: [00:11:42] That feels doable on good days, but what about the hard days?

THERAPIST: [00:11:50] On hard days, you do it anyway. Not because you feel motivated, but because it's the structure. We're creating some non-negotiables that you do regardless of mood. The routine itself can start to improve the mood over time.

CLIENT: [00:12:08] Okay. I can try.

THERAPIST: [00:12:12] Beyond the morning routine, what else? Is there anything you used to enjoy that you've stopped doing?

CLIENT: [00:12:20] I used to go to this pottery class on Wednesday nights. I haven't gone since I lost my job.

THERAPIST: [00:12:28] Why not?

CLIENT: [00:12:30] I don't know. It felt frivolous? Like I should be spending every minute job hunting.

THERAPIST: [00:12:38] And how's that working? Has spending every minute thinking about job hunting made you more effective at it?

CLIENT: [00:12:45] No. It's made me more paralyzed.

THERAPIST: [00:12:50] Right. So what if we reframe the pottery class not as frivolous, but as essential? It's something you enjoy, it gets you out of the house, it's creative, and it connects you with other people. Those are all things that help with depression.

CLIENT: [00:13:10] I guess when you put it that way...

THERAPIST: [00:13:14] Could you go this Wednesday?

CLIENT: [00:13:18] Maybe. I'd have to check if my membership is still active.

THERAPIST: [00:13:24] Okay, so that's action item number two - check on the pottery class and if it's still active, go on Wednesday. If it's not active, we'll find something else. The point is getting you back into activities that bring some joy or meaning.

CLIENT: [00:13:42] Alright. I'll check.

THERAPIST: [00:13:46] Now, the job search. I don't want to ignore that stressor, but I also don't want it to be this amorphous, all-consuming thing. What if we contained it? One hour a day, same time every day, dedicated to job stuff. You set a timer, you work on applications or networking or whatever needs doing, and when the timer goes off, you're done for the day.

CLIENT: [00:14:12] Just one hour?

THERAPIST: [00:14:14] You said you're currently avoiding it because it feels overwhelming. One focused hour is better than eight hours of avoidance. And it gives you permission to not think about it the rest of the day. When the worry comes up - and it will - you can say, "I have time set aside for this tomorrow from 2 to 3. I don't need to think about it now."

CLIENT: [00:14:42] That actually sounds like a relief.

THERAPIST: [00:14:46] Good. So, morning routine, reach out to Sam, pottery class, one hour of job stuff per day. That's our plan for this week. How are you feeling about all of that?

CLIENT: [00:15:00] Honestly? A little overwhelmed, but also like maybe I have a path forward? It's more concrete than what I've been doing, which is basically nothing.

THERAPIST: [00:15:14] That's a great insight. And if it feels like too much, we can adjust. But I have a sense that you're more capable than you're giving yourself credit for. We're not trying to fix everything at once. We're just trying to create some small, positive actions that can start shifting the trajectory.

CLIENT: [00:15:36] Okay. Yeah. I can try this.

THERAPIST: [00:15:40] Before we wrap up, let's talk about one more thing. You mentioned lying awake doing financial math. How much sleep are you getting?

CLIENT: [00:15:52] Not enough. Maybe five or six hours, but it's broken up. I wake up a lot.

THERAPIST: [00:16:00] And when you wake up, what are you thinking about?

CLIENT: [00:16:05] Money. The future. What I'm going to do if I can't find a job. Whether I'll have to move back in with my parents. It spirals.

THERAPIST: [00:16:18] Okay. So we need some tools for managing the nighttime anxiety. Have you ever tried a thought dump before bed?

CLIENT: [00:16:28] What's that?

THERAPIST: [00:16:30] It's where you take 10 minutes before bed to write down everything you're worried about and anything you need to remember for the next day. It gets it out of your head and onto paper, which can help your brain let go of it.

CLIENT: [00:16:48] I could try that.

THERAPIST: [00:16:50] And then if you wake up in the middle of the night worrying, you remind yourself, "I already wrote that down. I don't need to solve it right now." It's not foolproof, but it can help.

CLIENT: [00:17:05] Okay. I'll add it to the list.

THERAPIST: [00:17:08] We're at time, but I want to end by acknowledging something. You're going through a really significant life transition and dealing with depression on top of that. It makes sense that things feel hard right now. But you showed up today, you engaged, and you're willing to try some new strategies. Those are all signs of resilience, even if it doesn't feel that way.

CLIENT: [00:17:35] Thank you. I needed to hear that.

THERAPIST: [00:17:40] I'll see you next week, same time. Send me a text if you need support before then, okay?

CLIENT: [00:17:48] Okay. Thanks.`;

const TRANSCRIPT_TAYLOR_CRISIS = `THERAPIST: [00:00:08] Hi Taylor. Thanks for coming in. How have you been?

CLIENT: [00:00:16] I've been... I don't know. It's been a weird week.

THERAPIST: [00:00:24] Weird how?

CLIENT: [00:00:28] Just like... nothing feels real? I've been going through the motions but it's like I'm watching myself from outside my body.

THERAPIST: [00:00:42] That sounds like dissociation. Have you experienced that before?

CLIENT: [00:00:48] Yeah, sometimes. But it's been more intense lately.

THERAPIST: [00:00:54] What do you think is triggering it?

CLIENT: [00:01:00] I don't know. Everything? Nothing? I just feel so disconnected from everyone and everything.

THERAPIST: [00:01:12] Tell me more about the disconnection. When did you first notice it getting worse?

CLIENT: [00:01:20] Maybe last month? After my roommate moved out. The apartment feels so empty now. I used to hate having a roommate, thought I'd love living alone, but now it's just... silent. All the time.

THERAPIST: [00:01:40] How often are you seeing other people?

CLIENT: [00:01:45] Not much. I go to work, come home, that's about it.

THERAPIST: [00:01:52] What about friends? Family?

CLIENT: [00:01:58] I haven't really felt like seeing anyone. My friends invite me out but I always make an excuse. And my family... we're not really close.

THERAPIST: [00:02:12] So you're spending most of your time alone. How does that feel?

CLIENT: [00:02:18] Lonely. But also like it's what I deserve? I don't know. People are better off without me around anyway.

THERAPIST: [00:02:30] That's a strong statement. What makes you think people are better off without you?

CLIENT: [00:02:38] I just... I'm not fun to be around right now. I'm always tired, I don't have anything interesting to say. I'd just drag everyone down.

THERAPIST: [00:02:52] Have people told you that you drag them down?

CLIENT: [00:02:58] No, but I can tell. They probably invite me out of obligation, not because they actually want me there.

THERAPIST: [00:03:10] That sounds like your depression talking. What evidence do you have that they don't want you there?

CLIENT: [00:03:18] I don't know. It's just a feeling.

THERAPIST: [00:03:24] Okay. Let's come back to that. You mentioned feeling disconnected and lonely. How's your mood been overall?

CLIENT: [00:03:35] Low. Really low. Some days I don't see the point in getting out of bed.

THERAPIST: [00:03:44] Do you get out of bed on those days?

CLIENT: [00:03:48] I have to for work. But on weekends, sometimes I stay in bed until late afternoon. I just don't have the energy.

THERAPIST: [00:04:00] What do you do when you're in bed? Are you sleeping?

CLIENT: [00:04:06] Not really. Mostly just lying there, staring at the ceiling or scrolling on my phone. Time just passes.

THERAPIST: [00:04:18] What are you thinking about when you're lying there?

CLIENT: [00:04:24] How tired I am of everything. How nothing feels worth the effort. Sometimes I wonder if things would be better if I just... wasn't here.

THERAPIST: [00:04:40] When you say "wasn't here," what does that mean to you?

CLIENT: [00:04:48] Like... if I just didn't exist. If I hadn't been born, or if I could just disappear.

THERAPIST: [00:05:00] Have you been having thoughts about hurting yourself or ending your life?

CLIENT: [00:05:08] Not really. Not like planning anything. I just think sometimes about how much easier it would be for everyone if I wasn't around. Like, would anyone even notice? Would they be sad, or would they just be relieved?

THERAPIST: [00:05:28] Those sound like really painful thoughts. How often are you having them?

CLIENT: [00:05:36] I don't know. A few times a week? Especially late at night when I can't sleep.

THERAPIST: [00:05:46] When you have these thoughts, do you ever think about how you would do it? Do you have a plan?

CLIENT: [00:05:56] No. Nothing specific. I've thought about it in abstract ways, like "I could just take all the pills in my medicine cabinet" or whatever, but I'm not actually going to do that. I'm too much of a coward anyway.

THERAPIST: [00:06:15] Calling yourself a coward for not acting on suicidal thoughts concerns me. It's not cowardice to stay alive - it's survival. But I'm hearing that you're having frequent thoughts about not wanting to exist, you've thought about methods even if not in detail, and you're feeling very isolated and disconnected. That's a lot of risk factors coming together.

CLIENT: [00:06:42] I'm fine. I'm not going to do anything. I just feel this way sometimes.

THERAPIST: [00:06:50] I hear that you don't have an immediate plan, and that's important. But "feeling this way sometimes" is still concerning, especially with everything else you're describing. Have you talked to anyone else about these thoughts?

CLIENT: [00:07:06] No. Who would I talk to? I don't want to burden anyone with my problems.

THERAPIST: [00:07:15] There's that word again - burden. You keep saying that you'd drag people down, that they're better off without you, that you don't want to burden anyone. Do you believe that about yourself?

CLIENT: [00:07:30] I don't know. Maybe? I just feel like I have nothing to offer. I'm just taking up space.

THERAPIST: [00:07:42] Taylor, I want you to know that what you're experiencing right now - the hopelessness, the isolation, the thoughts about not existing - these are symptoms of depression. They're not facts about you or your worth. But they are serious, and we need to address them directly.

CLIENT: [00:08:04] I don't want to go to the hospital or anything. I'm managing.

THERAPIST: [00:08:12] I'm not talking about hospitalization right now. But I am concerned, and I want to make sure you're safe. Can we talk about what support looks like for you right now?

CLIENT: [00:08:26] I guess. What do you mean?

THERAPIST: [00:08:30] First, I want to establish that you can reach out for help if these thoughts get worse or if you start to feel like you might act on them. Do you have the crisis hotline number?

CLIENT: [00:08:44] No. I wouldn't call anyway.

THERAPIST: [00:08:48] I'd like you to have it just in case. And I want to check - do you have access to means? Medications, weapons, anything like that?

CLIENT: [00:09:00] I have some old prescriptions in my bathroom cabinet. No weapons.

THERAPIST: [00:09:08] Would you be willing to have someone hold onto those medications for you? Maybe a family member or friend?

CLIENT: [00:09:18] I don't want to tell anyone about this. They'll freak out.

THERAPIST: [00:09:24] You don't have to tell them why. You could just say you're trying to declutter or that your therapist recommended it for safety. But having that barrier there can be really important.

CLIENT: [00:09:38] I'll think about it.

THERAPIST: [00:09:42] Okay. I'd like to follow up on that next session. Now, the isolation is a big piece of this. Depression tells us to withdraw, but isolation makes depression worse. It's a vicious cycle.

CLIENT: [00:09:58] I know I should see people more. I just don't have the energy.

THERAPIST: [00:10:06] I understand. But I'm going to push back a little - sometimes we have to do things before we feel motivated to do them. You mentioned your friends have been inviting you out. When's the last time someone invited you to something?

CLIENT: [00:10:24] My coworker asked if I wanted to grab drinks after work tomorrow.

THERAPIST: [00:10:30] And what did you say?

CLIENT: [00:10:33] I haven't responded yet. I was going to say I'm busy.

THERAPIST: [00:10:40] What if instead, you said yes? Just for an hour. You don't have to stay long or be "fun" or perform for anyone. Just be there, in the presence of another person.

CLIENT: [00:10:56] I don't know...

THERAPIST: [00:11:00] I know it feels hard. But this is important. The isolation is feeding the depression, and the depression is feeding the isolation. We need to interrupt that cycle. Can you commit to going, even just for one drink?

CLIENT: [00:11:18] I guess I could try.

THERAPIST: [00:11:22] Good. That's a start. Now, I want to talk about your safety between now and our next session. I'm concerned about the frequency of these thoughts about not existing, and I want to make sure we have a plan.

CLIENT: [00:11:38] What kind of plan?

THERAPIST: [00:11:42] A safety plan. We identify warning signs, coping strategies, people you can reach out to, and what to do in a crisis. It's not about me not trusting you - it's about giving you a roadmap for when things feel overwhelming.

CLIENT: [00:12:00] Okay. What do we do?

THERAPIST: [00:12:04] First, let's identify your warning signs. What happens before you have these thoughts about not existing? Are there triggers or patterns?

CLIENT: [00:12:18] Usually it's at night, like I said. When I'm alone in the apartment and it's quiet. The thoughts just spiral.

THERAPIST: [00:12:30] Okay, so nighttime and being alone in silence are triggers. What else?

CLIENT: [00:12:38] Sometimes it's after work, especially if I had a hard day or felt like I messed something up. I'll come home and just feel worthless.

THERAPIST: [00:12:52] Alright. So we have nighttime isolation and perceived failures at work. When you notice these warning signs, what can you do? What are some coping strategies that have worked for you in the past?

CLIENT: [00:13:08] I don't know if anything really works. Sometimes I'll watch TV or listen to music, but it doesn't always help.

THERAPIST: [00:13:20] Distraction can be helpful, but we might need more active coping strategies. What about reaching out to someone? Even if it's just a text?

CLIENT: [00:13:32] I told you, I don't want to burden anyone.

THERAPIST: [00:13:36] Okay, we're going to challenge that belief, but for now, is there anyone in your life who you think might actually want to hear from you when you're struggling?

CLIENT: [00:13:48] Maybe my sister. We're not super close, but she's checked in on me a few times lately.

THERAPIST: [00:14:00] That sounds like she cares. Would you be willing to text her when you're having a hard time? It doesn't have to be a big conversation - even just "Having a rough night, could use some distraction" or something like that.

CLIENT: [00:14:18] Maybe. I can try.

THERAPIST: [00:14:22] Good. What else? Physical activity can help sometimes - going for a walk, doing some stretching, anything to shift the energy.

CLIENT: [00:14:36] I used to like walking, but I haven't done it in a while.

THERAPIST: [00:14:42] What if we added that to the safety plan? When you notice the warning signs, you go for a 10-minute walk, even if it's just around the block.

CLIENT: [00:14:54] Okay. I can do that.

THERAPIST: [00:14:58] And if the coping strategies aren't helping and you're still feeling unsafe, you need to reach out for professional help. That could be calling me, calling the crisis line, or if it's really urgent, going to the ER.

CLIENT: [00:15:16] I really don't want to go to the hospital.

THERAPIST: [00:15:20] I understand. And hopefully it won't come to that. But if you're in danger, that's what those resources are there for. Your safety is the priority.

CLIENT: [00:15:32] Okay.

THERAPIST: [00:15:35] I'm going to type this up and give you a copy before you leave today. And I want to see you again soon - let's schedule for three days from now instead of our usual week. Can you do that?

CLIENT: [00:15:50] Yeah, I think so.

THERAPIST: [00:15:54] Good. I know this is hard, Taylor. But I'm glad you're talking about this, and I'm here to help. You're not a burden, and you don't have to go through this alone.

CLIENT: [00:16:08] Thanks. I'll try to believe that.

THERAPIST: [00:16:12] That's all I ask. Let's check in on Friday, and in the meantime, please use the safety plan if you need it. And text your coworker back about those drinks.

CLIENT: [00:16:26] Okay. I will.`;

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Starting seed process...\n');

  // Test database connection first
  await testConnection();

  // ----------------------------------------------------------------------------
  // STEP 1: Clean up existing demo data
  // ----------------------------------------------------------------------------
  console.log('🧹 Cleaning up existing demo data...');

  const demoEmails = [
    'sarah@tava.demo',
    'marcus@tava.demo',
    'alex@tava.demo',
    'jordan@tava.demo',
    'casey@tava.demo',
    'taylor@tava.demo'
  ];

  // Delete users (cascades will handle related data)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: demoEmails
      }
    }
  });

  console.log('✅ Cleanup complete\n');

  // ----------------------------------------------------------------------------
  // STEP 2: Create Therapists
  // ----------------------------------------------------------------------------
  console.log('👨‍⚕️ Creating demo therapists...');

  const passwordHash = await hashPassword('demo123');

  // Dr. Sarah Chen - LMFT
  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah@tava.demo',
      passwordHash,
      role: Role.THERAPIST,
    }
  });

  const drSarah = await prisma.therapist.create({
    data: {
      userId: sarahUser.id,
      licenseNumber: 'LMFT-CA-12345',
      specialty: 'Anxiety Disorders, Cognitive Behavioral Therapy (CBT)',
      preferences: {
        defaultModalities: ['CBT', 'ACT', 'Mindfulness-based'],
        focusAreas: ['Anxiety', 'Work stress', 'Sleep issues', 'Panic disorder']
      }
    }
  });

  // Dr. Marcus Williams - PsyD
  const marcusUser = await prisma.user.create({
    data: {
      email: 'marcus@tava.demo',
      passwordHash,
      role: Role.THERAPIST,
    }
  });

  const drMarcus = await prisma.therapist.create({
    data: {
      userId: marcusUser.id,
      licenseNumber: 'PSY-CA-67890',
      specialty: 'Trauma-Focused Therapy, EMDR',
      preferences: {
        defaultModalities: ['EMDR', 'CPT', 'Trauma-Focused CBT'],
        focusAreas: ['PTSD', 'Complex trauma', 'Dissociation']
      }
    }
  });

  console.log('✅ Created Dr. Sarah Chen (LMFT) and Dr. Marcus Williams (PsyD)\n');

  // ----------------------------------------------------------------------------
  // STEP 3: Create Clients (linked to Dr. Chen)
  // ----------------------------------------------------------------------------
  console.log('👥 Creating demo clients...');

  // Alex Morgan - Work anxiety case
  const alexUser = await prisma.user.create({
    data: {
      email: 'alex@tava.demo',
      passwordHash,
      role: Role.CLIENT,
    }
  });

  const alex = await prisma.client.create({
    data: {
      userId: alexUser.id,
      therapistId: drSarah.id,
      displayName: 'Alex Morgan'
    }
  });

  // Jordan Rivera - Depression/life transition
  const jordanUser = await prisma.user.create({
    data: {
      email: 'jordan@tava.demo',
      passwordHash,
      role: Role.CLIENT,
    }
  });

  const jordan = await prisma.client.create({
    data: {
      userId: jordanUser.id,
      therapistId: drSarah.id,
      displayName: 'Jordan Rivera'
    }
  });

  // Casey Thompson - Panic disorder
  const caseyUser = await prisma.user.create({
    data: {
      email: 'casey@tava.demo',
      passwordHash,
      role: Role.CLIENT,
    }
  });

  const casey = await prisma.client.create({
    data: {
      userId: caseyUser.id,
      therapistId: drSarah.id,
      displayName: 'Casey Thompson'
    }
  });

  // Taylor Kim - High-risk demo case
  const taylorUser = await prisma.user.create({
    data: {
      email: 'taylor@tava.demo',
      passwordHash,
      role: Role.CLIENT,
    }
  });

  const taylor = await prisma.client.create({
    data: {
      userId: taylorUser.id,
      therapistId: drSarah.id,
      displayName: 'Taylor Kim'
    }
  });

  console.log('✅ Created 4 demo clients: Alex, Jordan, Casey, and Taylor\n');

  // ----------------------------------------------------------------------------
  // STEP 4: Create Sessions with Transcripts
  // ----------------------------------------------------------------------------
  console.log('📝 Creating therapy sessions...');

  // Session 1: Alex - Work Anxiety (complete workflow)
  const alexSession = await prisma.session.create({
    data: {
      clientId: alex.id,
      therapistId: drSarah.id,
      sessionDate: new Date('2025-11-25T14:00:00Z'),
      transcript: TRANSCRIPT_ALEX_WORK_ANXIETY,
      status: SessionStatus.PLAN_MERGED
    }
  });

  // Session 2: Jordan - Depression (complete workflow with approved plan)
  const jordanSession = await prisma.session.create({
    data: {
      clientId: jordan.id,
      therapistId: drSarah.id,
      sessionDate: new Date('2025-11-27T15:30:00Z'),
      transcript: TRANSCRIPT_JORDAN_DEPRESSION,
      status: SessionStatus.PLAN_MERGED
    }
  });

  // Session 3: Taylor - Crisis (analyzed with risk flags)
  const taylorSession = await prisma.session.create({
    data: {
      clientId: taylor.id,
      therapistId: drSarah.id,
      sessionDate: new Date('2025-11-28T10:00:00Z'),
      transcript: TRANSCRIPT_TAYLOR_CRISIS,
      status: SessionStatus.AI_ANALYZED
    }
  });

  // Session 4: Casey - Placeholder (transcript only)
  const caseySession = await prisma.session.create({
    data: {
      clientId: casey.id,
      therapistId: drSarah.id,
      sessionDate: new Date('2025-11-29T13:00:00Z'),
      transcript: 'THERAPIST: [00:00:10] Hi Casey, how have you been?\nCLIENT: [00:00:18] Better this week. The breathing exercises are really helping...\n[Additional session content would be here]',
      status: SessionStatus.TRANSCRIPT_UPLOADED
    }
  });

  console.log('✅ Created 4 therapy sessions\n');

  // ----------------------------------------------------------------------------
  // STEP 5: Create TherapistImpressions (Alex's session)
  // ----------------------------------------------------------------------------
  console.log('💭 Creating therapist impressions...');

  await prisma.therapistImpressions.create({
    data: {
      sessionId: alexSession.id,
      concerns: [
        {
          text: 'Significant work-related anxiety with physical symptoms (trembling, racing heart, sweating)',
          severity: 'moderate',
          excerptIds: ['00:02:05', '00:02:25']
        },
        {
          text: 'Severe sleep disruption (3 hours/night) affecting functioning',
          severity: 'high',
          excerptIds: ['00:00:22', '00:06:40']
        },
        {
          text: 'Catastrophic thinking patterns about work performance',
          severity: 'moderate',
          excerptIds: ['00:01:12', '00:03:00']
        }
      ],
      highlights: [
        {
          excerpt: 'I keep rehearsing what I\'m going to say, then I think about all the ways it could go wrong.',
          timestamp: '00:00:45',
          note: 'Classic rumination pattern'
        },
        {
          excerpt: 'Everyone can see how nervous I am. They\'re going to think I don\'t know what I\'m talking about. I\'m going to fail.',
          timestamp: '00:03:00',
          note: 'Automatic negative thoughts - good CBT target'
        },
        {
          excerpt: 'I\'m actually feeling hopeful for the first time in days.',
          timestamp: '00:18:32',
          note: 'Positive shift after intervention'
        }
      ],
      themes: [
        'Performance anxiety',
        'Catastrophic thinking',
        'Sleep disruption',
        'Mind-body connection in anxiety',
        'Avoidance of coping tools'
      ],
      goals: [
        {
          text: 'Improve sleep hygiene to restore normal sleep patterns',
          timeline: 'immediate (3 days)',
          excerptIds: ['00:09:00', '00:10:28']
        },
        {
          text: 'Implement CBT techniques (breathing, thought records) consistently',
          timeline: 'short-term (2-4 weeks)',
          excerptIds: ['00:04:00', '00:04:32']
        },
        {
          text: 'Challenge catastrophic thinking patterns about work performance',
          timeline: 'ongoing',
          excerptIds: ['00:15:15', '00:16:32']
        }
      ],
      diagnoses: [
        {
          code: 'F41.1',
          description: 'Generalized Anxiety Disorder'
        }
      ],
      modalities: [
        'Cognitive Behavioral Therapy (CBT)',
        'Sleep hygiene education',
        'Anxiety management techniques'
      ],
      riskObservations: {
        level: 'low',
        notes: 'No safety concerns. Client is highly functional despite anxiety. Has insight and is motivated for treatment.',
        excerptIds: []
      },
      strengths: [
        {
          text: 'Strong work ethic and professional competence (3 years good reviews)',
          excerptIds: ['00:15:15']
        },
        {
          text: 'Willing to try new interventions despite skepticism',
          excerptIds: ['00:11:42', '00:13:10']
        },
        {
          text: 'Good insight into anxiety patterns',
          excerptIds: ['00:03:48']
        }
      ],
      sessionQuality: {
        rapport: 'excellent',
        engagement: 'high',
        resistance: 'low',
        notes: 'Client was open and collaborative. Showed good understanding of interventions.'
      }
    }
  });

  console.log('✅ Created therapist impressions for Alex\n');

  // ----------------------------------------------------------------------------
  // STEP 6: Create AIAnalysis (Alex's session)
  // ----------------------------------------------------------------------------
  console.log('🤖 Creating AI analysis...');

  await prisma.aIAnalysis.create({
    data: {
      sessionId: alexSession.id,
      concerns: [
        {
          text: 'Acute insomnia related to performance anxiety (3 hours sleep)',
          severity: 'high',
          excerptIds: ['00:00:22', '00:06:00']
        },
        {
          text: 'Physical manifestations of anxiety interfering with work performance',
          severity: 'moderate',
          excerptIds: ['00:02:05']
        },
        {
          text: 'Cognitive distortions: catastrophizing, mind reading',
          severity: 'moderate',
          excerptIds: ['00:01:12', '00:03:00']
        }
      ],
      themes: [
        'Performance anxiety and fear of evaluation',
        'Sleep-anxiety cycle',
        'Somatic anxiety symptoms',
        'Perfectionism and high self-expectations',
        'Underutilization of coping strategies'
      ],
      goals: [
        {
          text: 'Restore adequate sleep (7+ hours) through sleep hygiene and anxiety management',
          timeline: 'immediate',
          excerptIds: ['00:09:25']
        },
        {
          text: 'Regular use of CBT techniques (breathing exercises, thought records)',
          timeline: 'short-term',
          excerptIds: ['00:04:00']
        },
        {
          text: 'Restructure catastrophic thoughts about work performance',
          timeline: 'ongoing',
          excerptIds: ['00:15:55']
        }
      ],
      interventions: [
        {
          name: 'Sleep Hygiene Protocol',
          rationale: 'Address immediate sleep crisis with behavioral interventions: no screens 1hr before bed, strict work cutoff at 5 PM, structured wind-down routine'
        },
        {
          name: 'Cognitive Restructuring',
          rationale: 'Challenge catastrophic predictions by examining evidence of past competence and proportionality of feared outcomes'
        },
        {
          name: 'Stimulus Control',
          rationale: 'Re-associate bed with sleep rather than anxious wakefulness (get up if not asleep in 20 minutes)'
        },
        {
          name: 'Worry Time Scheduling',
          rationale: 'Contain rumination by designating specific time for problem-solving, reducing nighttime mental activity'
        }
      ],
      homework: [
        {
          task: 'Leave work at 5 PM daily for next 3 days',
          rationale: 'Prevent burnout and create space for self-care before presentation'
        },
        {
          task: 'Implement bedtime routine: 30 min fiction reading + 30 min body scan meditation',
          rationale: 'Establish sleep-promoting rituals to replace rumination'
        },
        {
          task: 'Schedule 15-minute "worry time" at 4 PM daily',
          rationale: 'Contain anxious thoughts to designated period, reducing nighttime intrusion'
        },
        {
          task: 'Email check-in Thursday re: sleep and presentation anxiety',
          rationale: 'Monitor progress and adjust interventions if needed before critical event'
        }
      ],
      strengths: [
        {
          text: 'Strong professional track record despite anxiety',
          excerptIds: ['00:15:15']
        },
        {
          text: 'High level of insight into anxiety patterns',
          excerptIds: ['00:03:48']
        },
        {
          text: 'Motivated and collaborative in treatment',
          excerptIds: ['00:18:32']
        }
      ],
      riskIndicators: [],
      rawOutput: {
        model: 'gpt-4',
        timestamp: new Date('2025-11-25T14:45:00Z'),
        note: 'Full AI analysis response would be stored here for debugging'
      }
    }
  });

  console.log('✅ Created AI analysis for Alex\n');

  // ----------------------------------------------------------------------------
  // STEP 7: Create TreatmentPlan with versions (Alex)
  // ----------------------------------------------------------------------------
  console.log('📋 Creating treatment plans...');

  // Alex's treatment plan with 2 versions (showing history)
  const alexPlan = await prisma.treatmentPlan.create({
    data: {
      clientId: alex.id,
    }
  });

  // Version 1 (initial draft)
  const alexPlanV1 = await prisma.treatmentPlanVersion.create({
    data: {
      treatmentPlanId: alexPlan.id,
      versionNumber: 1,
      sourceSessionId: alexSession.id,
      status: PlanStatus.DRAFT,
      therapistContent: {
        diagnosis: {
          primary: 'F41.1 - Generalized Anxiety Disorder',
          severity: 'Moderate',
          specifiers: ['With sleep disturbance', 'With anxious distress']
        },
        presentingProblems: [
          'Work-related performance anxiety with significant physical symptoms',
          'Severe insomnia (3 hours/night) secondary to anxiety',
          'Catastrophic thinking patterns about professional competence',
          'Avoidance of established coping strategies when anxious'
        ],
        treatmentGoals: [
          {
            goal: 'Reduce insomnia and restore normal sleep patterns (7+ hours)',
            target: 'Within 2 weeks',
            measurable: 'Sleep diary tracking hours and quality',
            status: 'active'
          },
          {
            goal: 'Decrease physical anxiety symptoms during work presentations',
            target: '50% reduction in 4 weeks',
            measurable: 'Subjective anxiety rating (0-10 scale)',
            status: 'active'
          },
          {
            goal: 'Implement CBT techniques (thought records, breathing) proactively',
            target: '5x per week by week 3',
            measurable: 'Self-monitoring log',
            status: 'active'
          }
        ],
        interventions: [
          {
            modality: 'Cognitive Behavioral Therapy',
            techniques: ['Cognitive restructuring', 'Exposure to anxiety triggers', 'Behavioral experiments'],
            frequency: 'Weekly 50-minute sessions'
          },
          {
            modality: 'Sleep Hygiene Education',
            techniques: ['Stimulus control', 'Sleep restriction', 'Relaxation training'],
            frequency: 'Integrated into weekly sessions'
          }
        ],
        assessments: [
          'GAD-7 (baseline: would be scored)',
          'Insomnia Severity Index',
          'Weekly anxiety symptom check-ins'
        ],
        riskFactors: 'Low risk. No safety concerns. High functioning with stable support system.',
        strengths: 'Strong insight, professional competence, motivated for treatment, good therapeutic alliance',
        frequency: 'Weekly 50-minute sessions',
        duration: '12-16 weeks with reassessment at 8 weeks'
      },
      clientContent: undefined // Not approved yet
    }
  });

  // Version 2 (revised after therapist edits, still draft)
  const alexPlanV2 = await prisma.treatmentPlanVersion.create({
    data: {
      treatmentPlanId: alexPlan.id,
      versionNumber: 2,
      sourceSessionId: alexSession.id,
      status: PlanStatus.DRAFT,
      therapistContent: {
        diagnosis: {
          primary: 'F41.1 - Generalized Anxiety Disorder',
          severity: 'Moderate',
          specifiers: ['With sleep disturbance', 'With anxious distress']
        },
        presentingProblems: [
          'Work-related performance anxiety with significant physical symptoms (trembling, tachycardia, sweating)',
          'Severe insomnia (3 hours/night) with rumination and worry',
          'Catastrophic thinking patterns about professional evaluation',
          'Anxiety-avoidance cycle preventing use of coping skills'
        ],
        treatmentGoals: [
          {
            goal: 'Restore normal sleep patterns',
            target: '7+ hours within 2 weeks',
            measurable: 'Sleep diary (hours, quality, time to fall asleep)',
            status: 'active'
          },
          {
            goal: 'Reduce physical anxiety symptoms during work presentations',
            target: '50% reduction in subjective distress within 4 weeks',
            measurable: 'SUDS rating before/during/after presentations',
            status: 'active'
          },
          {
            goal: 'Consistent use of CBT coping strategies',
            target: '5+ times per week by week 3',
            measurable: 'Self-monitoring thought records and breathing practice log',
            status: 'active'
          },
          {
            goal: 'Challenge and restructure catastrophic thoughts',
            target: 'Ongoing throughout treatment',
            measurable: 'Thought records showing alternative perspectives',
            status: 'active'
          }
        ],
        interventions: [
          {
            modality: 'Cognitive Behavioral Therapy (CBT)',
            techniques: [
              'Cognitive restructuring of catastrophic predictions',
              'Behavioral experiments testing anxious beliefs',
              'Exposure to feared work scenarios',
              'Thought record completion'
            ],
            frequency: 'Weekly 50-minute sessions'
          },
          {
            modality: 'Sleep-Focused CBT',
            techniques: [
              'Sleep hygiene education and implementation',
              'Stimulus control procedures',
              'Worry time scheduling',
              'Body scan meditation for sleep'
            ],
            frequency: 'Integrated into weekly sessions + daily practice'
          },
          {
            modality: 'Anxiety Management Skills',
            techniques: [
              'Diaphragmatic breathing',
              'Progressive muscle relaxation',
              'Grounding techniques for acute anxiety'
            ],
            frequency: 'Daily practice between sessions'
          }
        ],
        assessments: [
          'GAD-7 (Generalized Anxiety Disorder scale) - baseline and every 4 weeks',
          'Insomnia Severity Index - baseline and every 2 weeks',
          'SUDS (Subjective Units of Distress) - weekly',
          'Thought records - reviewed in each session'
        ],
        riskFactors: 'Low risk for harm. No safety concerns. Highly functional with stable employment and support system. Anxiety is situational and responsive to intervention.',
        strengths: 'Excellent insight into anxiety patterns, strong work ethic and professional competence, motivated and collaborative in treatment, willing to try new strategies despite skepticism, good therapeutic rapport',
        frequency: 'Weekly 50-minute sessions for 12-16 weeks',
        duration: '12-16 weeks with reassessment at 8 weeks. May transition to bi-weekly if symptoms stabilize.',
        additionalNotes: 'Client has upcoming high-stakes presentation on Friday. Immediate focus on sleep restoration and acute anxiety management. Follow-up email check-in scheduled for Thursday.'
      },
      clientContent: undefined,
      editedAt: new Date('2025-11-25T15:30:00Z')
    }
  });

  // Update treatment plan to reference current version
  await prisma.treatmentPlan.update({
    where: { id: alexPlan.id },
    data: { currentVersionId: alexPlanV2.id }
  });

  // Jordan's treatment plan (approved - visible in client view)
  const jordanPlan = await prisma.treatmentPlan.create({
    data: {
      clientId: jordan.id,
    }
  });

  const jordanPlanV1 = await prisma.treatmentPlanVersion.create({
    data: {
      treatmentPlanId: jordanPlan.id,
      versionNumber: 1,
      sourceSessionId: jordanSession.id,
      status: PlanStatus.APPROVED,
      therapistContent: {
        diagnosis: {
          primary: 'F32.1 - Major Depressive Disorder, Single Episode, Moderate',
          specifiers: ['With anxious distress', 'In context of life transition']
        },
        presentingProblems: [
          'Depressive symptoms following job loss (10 weeks)',
          'Loss of structure, identity, and purpose',
          'Social isolation and withdrawal from support network',
          'Financial stress and uncertainty about future',
          'Job search avoidance due to overwhelm and self-doubt',
          'Disrupted sleep with rumination'
        ],
        treatmentGoals: [
          {
            goal: 'Establish daily structure and routine',
            target: 'Consistent morning routine (out of bed by 10 AM, shower, breakfast) within 1 week',
            measurable: 'Daily activity log',
            status: 'active'
          },
          {
            goal: 'Re-engage with social support',
            target: 'One social activity per week, starting this week',
            measurable: 'Social contact log',
            status: 'active'
          },
          {
            goal: 'Implement structured job search approach',
            target: '1 hour daily of focused job search activities by week 2',
            measurable: 'Application tracking, time log',
            status: 'active'
          },
          {
            goal: 'Reduce depressive symptoms',
            target: '50% reduction in PHQ-9 score within 8 weeks',
            measurable: 'PHQ-9 every 2 weeks',
            status: 'active'
          },
          {
            goal: 'Reconnect with enjoyable activities',
            target: 'Resume pottery class or similar activity within 2 weeks',
            measurable: 'Activity tracking',
            status: 'active'
          }
        ],
        interventions: [
          {
            modality: 'Behavioral Activation',
            techniques: [
              'Activity scheduling',
              'Pleasure and mastery ratings',
              'Graded task assignment',
              'Overcoming avoidance patterns'
            ],
            frequency: 'Weekly sessions + daily implementation'
          },
          {
            modality: 'Cognitive Therapy',
            techniques: [
              'Identifying and challenging negative self-talk',
              'Cognitive restructuring re: self-worth and capabilities',
              'Examining evidence for/against negative beliefs'
            ],
            frequency: 'Weekly sessions + thought records between sessions'
          },
          {
            modality: 'Problem-Solving Therapy',
            techniques: [
              'Breaking down overwhelming tasks (job search)',
              'Time management strategies',
              'Setting realistic, achievable goals'
            ],
            frequency: 'Integrated into weekly sessions'
          }
        ],
        assessments: [
          'PHQ-9 (Depression screening) - baseline and every 2 weeks',
          'Daily activity logs',
          'Sleep diary',
          'Job search tracking'
        ],
        riskFactors: 'Low to moderate risk. No current suicidal ideation. Monitor for worsening if financial situation deteriorates or job search continues to be unsuccessful. Client has insight and is engaged in treatment.',
        strengths: 'Good insight into depression patterns, has identified supportive relationships (friend Sam, sister), previous experience with self-care activities (gym, pottery), willingness to try new strategies despite low motivation, therapeutic rapport',
        frequency: 'Weekly 50-minute sessions',
        duration: '12-16 weeks, with possibility of extending if needed',
        additionalNotes: 'Immediate focus on establishing structure and re-engaging socially. Client has action items: text friend Sam, check on pottery class, implement morning routine.'
      },
      clientContent: {
        whatWeAreWorkingOn: [
          'Building a daily routine to help you feel more grounded',
          'Reconnecting with friends and people who care about you',
          'Finding a manageable approach to job searching that doesn\'t feel overwhelming',
          'Doing activities you used to enjoy, like pottery',
          'Challenging thoughts like "I\'m not good enough" or "I\'m a burden"'
        ],
        ourGoalsTogether: [
          'Get back to a morning routine - out of bed by 10, shower, and a real breakfast',
          'Meet up with at least one friend or do one social thing each week',
          'Spend one focused hour a day on job search stuff (not all day!)',
          'Get back to pottery class or find another activity you enjoy',
          'Feel less depressed overall as we work through this transition'
        ],
        whatToExpect: [
          'We\'ll meet once a week to check in on how things are going',
          'Between sessions, you\'ll try out the strategies we discuss - like sticking to your morning routine, reaching out to friends, and doing your daily job search hour',
          'We\'ll track your mood and activities to see what helps',
          'This is a really hard time for you, and it makes sense that you\'re struggling. We\'re going to take it step by step'
        ],
        howLongWeWillWork: 'We\'ll plan on 12-16 weeks together, meeting weekly. We\'ll check in along the way to see how you\'re doing and adjust as needed.',
        yourActionSteps: [
          'Text Sam back about meeting for coffee',
          'Check if your pottery class membership is still active',
          'Stick to the morning routine we talked about: out of bed by 10, shower, breakfast',
          'Try the thought dump before bed to help with the nighttime worrying',
          'Spend one hour a day (same time each day) on job search activities'
        ]
      }
    }
  });

  await prisma.treatmentPlan.update({
    where: { id: jordanPlan.id },
    data: { currentVersionId: jordanPlanV1.id }
  });

  console.log('✅ Created treatment plans for Alex (2 versions) and Jordan (approved)\n');

  // ----------------------------------------------------------------------------
  // STEP 8: Create RiskFlags (Taylor's session)
  // ----------------------------------------------------------------------------
  console.log('⚠️  Creating risk flags...');

  await prisma.riskFlag.create({
    data: {
      sessionId: taylorSession.id,
      riskType: 'SI',
      severity: RiskLevel.MODERATE,
      excerpt: 'Sometimes I wonder if things would be better if I just... wasn\'t here. Like... if I just didn\'t exist. If I hadn\'t been born, or if I could just disappear.',
      acknowledged: false
    }
  });

  await prisma.riskFlag.create({
    data: {
      sessionId: taylorSession.id,
      riskType: 'SI',
      severity: RiskLevel.MODERATE,
      excerpt: 'I just think sometimes about how much easier it would be for everyone if I wasn\'t around. Like, would anyone even notice? Would they be sad, or would they just be relieved?',
      acknowledged: false
    }
  });

  await prisma.riskFlag.create({
    data: {
      sessionId: taylorSession.id,
      riskType: 'SI',
      severity: RiskLevel.MODERATE,
      excerpt: 'I\'ve thought about it in abstract ways, like "I could just take all the pills in my medicine cabinet" or whatever, but I\'m not actually going to do that. I\'m too much of a coward anyway.',
      acknowledged: false
    }
  });

  await prisma.riskFlag.create({
    data: {
      sessionId: taylorSession.id,
      riskType: 'escalation',
      severity: RiskLevel.HIGH,
      excerpt: 'Calling yourself a coward for not acting on suicidal thoughts concerns me. Multiple passive SI statements with some consideration of means (medications). Significant isolation and hopelessness.',
      acknowledged: false
    }
  });

  console.log('✅ Created 4 risk flags for Taylor (SI and escalation)\n');

  // ----------------------------------------------------------------------------
  // STEP 9: Create SessionSummaries
  // ----------------------------------------------------------------------------
  console.log('📄 Creating session summaries...');

  await prisma.sessionSummary.create({
    data: {
      sessionId: alexSession.id,
      therapistSummary: `Alex presented with acute work-related anxiety and severe insomnia (3 hours/night) related to an upcoming high-stakes presentation. Physical symptoms include trembling, racing heart, and sweating. Catastrophic thinking patterns evident ("I'll lose my credibility", "They made a mistake hiring me").

Client has been over-preparing for the presentation, which paradoxically increases anxiety rather than building confidence. Has not been using previously learned CBT techniques (breathing exercises, thought records) due to overwhelm and skepticism about their effectiveness.

Interventions implemented:
- Sleep hygiene protocol (no screens 1 hour before bed, strict 5 PM work cutoff, structured wind-down with reading and body scan meditation)
- Stimulus control for insomnia (get up after 20 minutes if not asleep)
- Worry time scheduling (15 min at 4 PM daily)
- Cognitive restructuring (examined evidence of competence: 3 years good reviews, positive feedback on current project)

Client showed good insight and engagement. Left session feeling more hopeful. Will check in via email Thursday before Friday presentation. Follow-up session scheduled for next week to debrief.`,
      clientSummary: `We talked about your anxiety and sleep issues related to your big presentation on Friday. We came up with a concrete plan to help you sleep better and manage the worry:

- Leave work at 5 PM for the next 3 days (no staying late!)
- No screens for 1 hour before bed
- Read fiction for 30 minutes, then do a guided body scan meditation
- If you can't sleep after 20 minutes, get up and do something boring in dim light
- Set aside 15 minutes at 4 PM tomorrow to write down all your worries about the presentation

We also talked about challenging those catastrophic thoughts. You've been at your company for 3 years with great reviews, you were specifically asked to lead this project, and your manager said she's impressed with your work. One presentation isn't going to erase all of that.

Check in with me by email on Thursday to let me know how it's going. You've got this!`
    }
  });

  await prisma.sessionSummary.create({
    data: {
      sessionId: jordanSession.id,
      therapistSummary: `Jordan presented with continued depressive symptoms 10 weeks post-job loss. Reports fluctuating mood with some days showing small improvements (Tuesday: out of bed by 10, showered, made breakfast) and others marked by significant withdrawal (yesterday: in bed until 2 PM, entire day in pajamas).

Primary struggles: loss of structure and purpose, social isolation (avoiding friends from work, not responding to mother's calls), financial stress with catastrophizing about future, job search avoidance due to overwhelm and self-doubt. One application in 2 weeks, no response, which client interpreted as confirmation of inadequacy.

Depression is affecting multiple domains: self-care, social connections, productivity, sleep (rumination and financial worry). Client endorses feelings of being a burden and questions whether friends genuinely want to see them.

Interventions implemented:
- Behavioral activation: established morning routine as non-negotiable baseline (out of bed by 10, shower, nutritious breakfast)
- Social re-engagement: encouraged response to friend Sam's coffee invitation
- Structured job search: 1 hour daily at consistent time (vs. current avoidance pattern)
- Activity resumption: check on pottery class membership, return to enjoyable activities
- Cognitive restructuring: challenged belief about being a burden, examined evidence

Client showed good insight and willingness to try new approach despite low motivation. Action items: text Sam, check pottery class, implement morning routine, thought dump before bed. Good therapeutic rapport.`,
      clientSummary: `We talked about how you're doing since losing your job 10 weeks ago. You mentioned that Tuesday was a better day - you got up before 10, showered, and made breakfast - which is great! But other days, like yesterday, have been really hard.

It makes sense that you're struggling. You didn't just lose a paycheck; you lost your whole routine, your sense of purpose, and the people you used to see every day. That's a lot all at once.

Here's our plan for this week:

1. Morning routine: Out of bed by 10, shower, and eat real food (not just coffee). Every day, even the hard days.

2. Reach out to Sam about coffee. You don't have to pretend to be okay - just be honest that you're going through a tough time.

3. Check if your pottery class is still active and go this Wednesday if it is. This isn't frivolous - it's important for your mental health.

4. Job search: One focused hour per day, same time every day. When the timer goes off, you're done thinking about job stuff for the day.

5. Before bed: Write down your worries for 10 minutes to get them out of your head.

Remember: Depression is lying to you when it says you're a burden or that people don't want to hear from you. Sam reached out because they care. Your mom calls because she cares. You're going through something really hard, and it's okay to lean on people who care about you.`
    }
  });

  await prisma.sessionSummary.create({
    data: {
      sessionId: taylorSession.id,
      therapistSummary: `**HIGH RISK SESSION - SAFETY CONCERNS**

Taylor presented with significant depressive symptoms, passive suicidal ideation, and multiple risk factors requiring immediate attention.

**Risk Assessment:**
- Passive SI: "wonder if things would be better if I just... wasn't here", "if I could just disappear"
- Frequency: "a few times a week, especially late at night"
- Some consideration of means: "I could just take all the pills in my medicine cabinet" (though states no active plan)
- Concerning statement: "I'm too much of a coward anyway" (reframes not acting as personal failure)
- Hopelessness: "would anyone even notice?", "people are better off without me"
- Severe isolation: roommate moved out, declining all social invitations, minimal family contact
- Dissociation: "nothing feels real", "watching myself from outside my body"
- Depressive symptoms: low mood, anhedonia, no energy, staying in bed most of weekend

**Protective Factors:**
- No active plan or immediate intent
- Attending therapy
- Still going to work
- Has some social connections (coworker, sister) even if not utilizing them

**Interventions:**
- Safety planning completed (warning signs, coping strategies, emergency contacts)
- Identified triggers: nighttime isolation, perceived work failures
- Coping strategies: text sister, 10-min walk, use crisis line if needed
- Discussed removing access to means (medications in cabinet) - client ambivalent
- Pushed for social engagement: encouraged accepting coworker's invitation for drinks tomorrow
- Scheduled follow-up in 3 days instead of usual week

**Clinical Concerns:**
- Isolation is both symptom and risk factor
- Belief that they are a burden may prevent help-seeking
- Depression severity warrants close monitoring
- Client minimizes concerns ("I'm fine, I'm not going to do anything")

**Action Items:**
- Give written safety plan before client leaves
- Follow up in 3 days (Friday)
- Monitor for escalation
- Consider medication evaluation if symptoms don't improve

This is a high-risk case requiring close clinical attention.`,
      clientSummary: null // Not generated yet due to safety concerns requiring therapist review first
    }
  });

  console.log('✅ Created session summaries for Alex, Jordan, and Taylor\n');

  // ----------------------------------------------------------------------------
  // STEP 10: Create TherapistImpressions and AIAnalysis for Jordan
  // ----------------------------------------------------------------------------
  console.log('💭 Creating additional impressions and analysis for Jordan...');

  await prisma.therapistImpressions.create({
    data: {
      sessionId: jordanSession.id,
      concerns: [
        {
          text: 'Major depressive episode in context of job loss and life transition',
          severity: 'moderate',
          excerptIds: ['00:01:50', '00:04:10']
        },
        {
          text: 'Social isolation and withdrawal from support network',
          severity: 'moderate',
          excerptIds: ['00:07:48', '00:08:25']
        },
        {
          text: 'Job search avoidance with cognitive distortions about self-worth',
          severity: 'moderate',
          excerptIds: ['00:04:42', '00:06:20']
        },
        {
          text: 'Belief that they are a burden to others',
          severity: 'moderate',
          excerptIds: ['00:08:42', '00:10:38']
        }
      ],
      highlights: [
        {
          excerpt: 'Tuesday was actually decent. I managed to get out of bed before 10, took a shower, even made myself a real breakfast.',
          timestamp: '00:00:32',
          note: 'Evidence of capacity for self-care on better days'
        },
        {
          excerpt: 'What\'s the point? I don\'t have anywhere to be. No one\'s counting on me.',
          timestamp: '00:02:16',
          note: 'Loss of purpose and structure central to depression'
        },
        {
          excerpt: 'I know I should be job hunting more aggressively, but every time I sit down to look at postings or update my resume, I just feel overwhelmed and shut down.',
          timestamp: '00:04:42',
          note: 'Avoidance driven by overwhelm, not lack of motivation'
        },
        {
          excerpt: 'I feel like I\'d just bring them down.',
          timestamp: '00:08:52',
          note: 'Believes they are burden - barrier to connection'
        }
      ],
      themes: [
        'Loss and grief related to job loss',
        'Loss of identity, structure, and purpose',
        'Social isolation and withdrawal',
        'Financial stress and uncertainty',
        'Avoidance and overwhelm',
        'Negative self-perception and self-worth issues'
      ],
      goals: [
        {
          text: 'Establish consistent daily structure (morning routine)',
          timeline: 'immediate (this week)',
          excerptIds: ['00:11:20']
        },
        {
          text: 'Re-engage with social support network',
          timeline: 'immediate (this week)',
          excerptIds: ['00:10:28']
        },
        {
          text: 'Implement structured, time-limited job search approach',
          timeline: 'short-term (1-2 weeks)',
          excerptIds: ['00:14:12']
        },
        {
          text: 'Resume previously enjoyable activities (pottery)',
          timeline: 'short-term (2 weeks)',
          excerptIds: ['00:13:14']
        },
        {
          text: 'Reduce overall depressive symptoms',
          timeline: 'ongoing (8-12 weeks)',
          excerptIds: []
        }
      ],
      diagnoses: [
        {
          code: 'F32.1',
          description: 'Major Depressive Disorder, Single Episode, Moderate'
        }
      ],
      modalities: [
        'Behavioral Activation',
        'Cognitive Therapy',
        'Problem-Solving Therapy'
      ],
      riskObservations: {
        level: 'low-moderate',
        notes: 'No current SI or safety concerns. However, prolonged isolation, financial stress, and continued unemployment could increase risk. Monitor for hopelessness and emerging SI. Client has insight and is engaged.',
        excerptIds: []
      },
      strengths: [
        {
          text: 'Good insight into depression patterns and impact',
          excerptIds: ['00:05:50']
        },
        {
          text: 'Has identified supportive relationships (Sam, sister)',
          excerptIds: ['00:09:38', '00:10:02']
        },
        {
          text: 'Previous engagement in self-care activities (gym, pottery)',
          excerptIds: ['00:12:20']
        },
        {
          text: 'Willingness to try new strategies despite low motivation',
          excerptIds: ['00:15:36']
        }
      ],
      sessionQuality: {
        rapport: 'good',
        engagement: 'moderate-high',
        resistance: 'low',
        notes: 'Client was open about struggles and receptive to interventions despite expressing doubt.'
      }
    }
  });

  await prisma.aIAnalysis.create({
    data: {
      sessionId: jordanSession.id,
      concerns: [
        {
          text: 'Moderate major depressive episode triggered by job loss',
          severity: 'moderate',
          excerptIds: ['00:02:16', '00:04:10']
        },
        {
          text: 'Significant social isolation and withdrawal',
          severity: 'moderate',
          excerptIds: ['00:08:25']
        },
        {
          text: 'Cognitive distortions about self-worth tied to employment status',
          severity: 'moderate',
          excerptIds: ['00:06:20']
        },
        {
          text: 'Job search paralysis due to overwhelm',
          severity: 'moderate',
          excerptIds: ['00:05:05']
        }
      ],
      themes: [
        'Identity loss tied to career/employment',
        'Grief and adjustment to life transition',
        'Isolation as both symptom and maintaining factor',
        'Avoidance driven by overwhelm and self-doubt',
        'Financial anxiety and future uncertainty',
        'Perceived burdensomeness to others'
      ],
      goals: [
        {
          text: 'Create and maintain daily structure to combat amorphous depression',
          timeline: 'immediate',
          excerptIds: ['00:11:18']
        },
        {
          text: 'Break isolation pattern through social re-engagement',
          timeline: 'immediate',
          excerptIds: ['00:10:35']
        },
        {
          text: 'Contain job search to prevent overwhelm (1 hour daily)',
          timeline: 'this week',
          excerptIds: ['00:14:06']
        },
        {
          text: 'Resume meaningful activities (pottery) for mood and connection',
          timeline: '2 weeks',
          excerptIds: ['00:13:24']
        }
      ],
      interventions: [
        {
          name: 'Behavioral Activation',
          rationale: 'Depression thrives in void of structure. Non-negotiable morning routine creates baseline activation regardless of mood, breaking cycle of inactivity'
        },
        {
          name: 'Social Re-engagement',
          rationale: 'Isolation maintains depression. Even one social contact per week can significantly improve mood. Challenge belief about being burden by testing assumption with safe friend (Sam)'
        },
        {
          name: 'Contained Job Search Protocol',
          rationale: 'Overwhelm leads to avoidance. Time-boxing job search (1 hour daily) makes task manageable and gives permission to not worry about it rest of day'
        },
        {
          name: 'Activity Resumption',
          rationale: 'Returning to previously enjoyed activities (pottery) reconnects client with pleasure, mastery, and social opportunities. Reframes self-care as essential, not frivolous'
        },
        {
          name: 'Cognitive Restructuring',
          rationale: 'Challenge overgeneralization from one job rejection and belief about being burden. Examine evidence for/against these beliefs'
        }
      ],
      homework: [
        {
          task: 'Morning routine daily: out of bed by 10 AM, shower, nutritious breakfast',
          rationale: 'Establish non-negotiable baseline structure to combat depression\'s pull toward inactivity'
        },
        {
          task: 'Text friend Sam by tomorrow to accept coffee invitation',
          rationale: 'First step in breaking isolation. Test assumption about being burden with supportive friend'
        },
        {
          task: 'Check pottery class membership status and attend Wednesday if active',
          rationale: 'Re-engage with meaningful activity that provides pleasure, mastery, and social connection'
        },
        {
          task: 'One hour of job search daily at consistent time (e.g., 2-3 PM)',
          rationale: 'Make job search manageable through time-containment. Reduce avoidance by reducing overwhelm'
        },
        {
          task: 'Thought dump before bed (10 minutes of writing worries)',
          rationale: 'Address nighttime rumination about finances by externalizing worries onto paper'
        }
      ],
      strengths: [
        {
          text: 'Shows capacity for self-care on better days',
          excerptIds: ['00:00:32']
        },
        {
          text: 'Good insight into depression patterns',
          excerptIds: ['00:05:50']
        },
        {
          text: 'Has supportive relationships available (Sam, sister)',
          excerptIds: ['00:10:02']
        },
        {
          text: 'History of meaningful activities and self-care',
          excerptIds: ['00:12:20']
        }
      ],
      riskIndicators: [],
      rawOutput: {
        model: 'gpt-4',
        timestamp: new Date('2025-11-27T16:15:00Z'),
        note: 'Full AI analysis response for debugging'
      }
    }
  });

  console.log('✅ Created impressions and AI analysis for Jordan\n');

  // ----------------------------------------------------------------------------
  // DONE!
  // ----------------------------------------------------------------------------
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   - 2 therapists: Dr. Sarah Chen, Dr. Marcus Williams');
  console.log('   - 4 clients: Alex, Jordan, Casey, Taylor');
  console.log('   - 4 sessions with realistic transcripts');
  console.log('   - Full workflow data for Alex (impressions, AI analysis, treatment plan v1 & v2)');
  console.log('   - Complete workflow for Jordan (impressions, AI analysis, approved treatment plan)');
  console.log('   - Crisis case for Taylor with 4 risk flags');
  console.log('   - Session summaries for Alex, Jordan, and Taylor');
  console.log('\n🔐 Login credentials (all use password "demo123"):');
  console.log('   Therapist: sarah@tava.demo or marcus@tava.demo');
  console.log('   Clients: alex@tava.demo, jordan@tava.demo, casey@tava.demo, taylor@tava.demo\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
