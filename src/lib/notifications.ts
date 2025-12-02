import { prisma } from '@/lib/prisma'
import { NotificationType } from '@/generated/prisma'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    })
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Helper functions for specific notification types
export async function notifySessionUploaded(therapistUserId: string, clientName: string, sessionId: string) {
  return createNotification({
    userId: therapistUserId,
    type: 'SESSION_UPLOADED',
    title: 'New Session Uploaded',
    message: `A new therapy session transcript for ${clientName} has been uploaded.`,
    link: `/therapist/sessions/${sessionId}`
  })
}

export async function notifyPlanGenerated(therapistUserId: string, clientName: string, planId: string) {
  return createNotification({
    userId: therapistUserId,
    type: 'PLAN_GENERATED',
    title: 'Treatment Plan Generated',
    message: `AI has generated a treatment plan for ${clientName}. Review and approve when ready.`,
    link: `/therapist/plans/${planId}`
  })
}

export async function notifyPlanApproved(clientUserId: string, planId: string) {
  return createNotification({
    userId: clientUserId,
    type: 'PLAN_APPROVED',
    title: 'Treatment Plan Approved',
    message: 'Your therapist has approved a new treatment plan for you.',
    link: `/client/plans/${planId}`
  })
}

export async function notifyPlanUpdated(clientUserId: string, planId: string) {
  return createNotification({
    userId: clientUserId,
    type: 'PLAN_UPDATED',
    title: 'Treatment Plan Updated',
    message: 'Your treatment plan has been updated by your therapist.',
    link: `/client/plans/${planId}`
  })
}

export async function notifyRiskFlagDetected(therapistUserId: string, clientName: string, sessionId: string, riskType: string) {
  return createNotification({
    userId: therapistUserId,
    type: 'RISK_FLAG_DETECTED',
    title: 'Risk Flag Detected',
    message: `A ${riskType} risk indicator was detected for ${clientName}. Please review.`,
    link: `/therapist/sessions/${sessionId}`
  })
}

export async function notifyNewClient(therapistUserId: string, clientName: string) {
  return createNotification({
    userId: therapistUserId,
    type: 'NEW_CLIENT',
    title: 'New Client Added',
    message: `${clientName} has been added to your client list.`,
    link: '/therapist/clients'
  })
}
