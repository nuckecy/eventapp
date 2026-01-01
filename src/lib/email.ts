/**
 * Email Service
 * Handles email notifications using Resend
 */

export interface SendEmailParams {
  to: string | string[]
  subject: string
  body: string
  from?: string
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface RequestSubmittedEmailParams {
  requestNumber: string
  title: string
  eventType: string
  department: string
  eventDate: string
  submittedBy: string
  viewUrl: string
}

export interface RequestReturnedEmailParams {
  requestNumber: string
  title: string
  feedback: string
  returnedBy: string
  editUrl: string
}

export interface RequestApprovedEmailParams {
  requestNumber: string
  title: string
  eventType: string
  eventDate: string
  location: string
  approvedBy: string
  viewUrl: string
}

export interface RequestDeletedEmailParams {
  requestNumber: string
  title: string
  reason: string
  deletedBy: string
}

/**
 * Check if Resend is configured
 * @returns True if RESEND_API_KEY is set
 */
function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Get the default "from" email address
 * @returns From email address
 */
function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "events@church.com"
}

/**
 * Send a notification email
 * @param params - Email parameters
 * @returns Success status
 */
export async function sendNotificationEmail(
  params: SendEmailParams
): Promise<boolean> {
  const { to, subject, body, from = getFromEmail() } = params

  // Check if Resend is configured
  if (!isResendConfigured()) {
    console.warn(
      "[EmailService] Resend not configured. Email not sent.",
      "Subject:",
      subject
    )
    console.log("[EmailService] Email preview:")
    console.log("To:", to)
    console.log("From:", from)
    console.log("Subject:", subject)
    console.log("Body:", body)
    return false
  }

  try {
    // TODO: Uncomment when Resend package is installed
    /*
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const emailData = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: body,
    }

    const response = await resend.emails.send(emailData)

    if (response.error) {
      console.error('[EmailService] Error sending email:', response.error)
      return false
    }

    console.log('[EmailService] Email sent successfully:', response.data?.id)
    return true
    */

    // Mock implementation for development
    console.log("[EmailService] Mock: Email sent")
    console.log("To:", to)
    console.log("Subject:", subject)
    return true
  } catch (error) {
    console.error("[EmailService] Error sending email:", error)
    return false
  }
}

/**
 * Email Templates
 */

/**
 * Generate email template for request submitted
 * @param params - Template parameters
 * @returns Email subject and body
 */
export function getRequestSubmittedEmailTemplate(
  params: RequestSubmittedEmailParams
): EmailTemplate {
  const {
    requestNumber,
    title,
    eventType,
    department,
    eventDate,
    submittedBy,
    viewUrl,
  } = params

  const subject = `New Event Request: ${title}`

  const body = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); color: white; padding: 30px; border-radius: 8px; }
          .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
          .button { display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-radius: 6px; margin-top: 20px; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; width: 140px; color: #666; }
          .detail-value { flex: 1; color: #333; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">New Event Request Submitted</h1>
          </div>

          <div class="content">
            <p>Hello Admin,</p>
            <p>A new event request has been submitted and requires your review.</p>

            <div class="details">
              <div class="detail-row">
                <div class="detail-label">Request ID:</div>
                <div class="detail-value">${requestNumber}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Title:</div>
                <div class="detail-value"><strong>${title}</strong></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Type:</div>
                <div class="detail-value">${eventType}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Department:</div>
                <div class="detail-value">${department}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Date:</div>
                <div class="detail-value">${eventDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Submitted By:</div>
                <div class="detail-value">${submittedBy}</div>
              </div>
            </div>

            <a href="${viewUrl}" class="button">Review Request</a>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Please review this request at your earliest convenience.
            </p>
          </div>

          <div class="footer">
            <p>Church Event Management System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, body }
}

/**
 * Generate email template for request returned
 * @param params - Template parameters
 * @returns Email subject and body
 */
export function getRequestReturnedEmailTemplate(
  params: RequestReturnedEmailParams
): EmailTemplate {
  const { requestNumber, title, feedback, returnedBy, editUrl } = params

  const subject = `Request Returned: ${title}`

  const body = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px; }
          .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
          .button { display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .feedback { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Request Returned for Revision</h1>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>Your event request <strong>${requestNumber}: ${title}</strong> has been returned for revision.</p>

            <div class="feedback">
              <h3 style="margin-top: 0; color: #ef4444;">Feedback:</h3>
              <p style="margin-bottom: 0;">${feedback}</p>
            </div>

            <p><strong>Returned by:</strong> ${returnedBy}</p>

            <a href="${editUrl}" class="button">Edit Request</a>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Please review the feedback, make the necessary changes, and resubmit your request.
            </p>
          </div>

          <div class="footer">
            <p>Church Event Management System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, body }
}

/**
 * Generate email template for request approved
 * @param params - Template parameters
 * @returns Email subject and body
 */
export function getRequestApprovedEmailTemplate(
  params: RequestApprovedEmailParams
): EmailTemplate {
  const {
    requestNumber,
    title,
    eventType,
    eventDate,
    location,
    approvedBy,
    viewUrl,
  } = params

  const subject = `Event Approved: ${title}`

  const body = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); color: white; padding: 30px; border-radius: 8px; }
          .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
          .button { display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .success-badge { display: inline-block; background: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin-top: 20px; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; width: 140px; color: #666; }
          .detail-value { flex: 1; color: #333; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🎉 Event Request Approved!</h1>
          </div>

          <div class="content">
            <p>Congratulations!</p>
            <p>Your event request has been approved and is now published on the church calendar.</p>

            <div class="success-badge">✓ APPROVED</div>

            <div class="details">
              <div class="detail-row">
                <div class="detail-label">Request ID:</div>
                <div class="detail-value">${requestNumber}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Title:</div>
                <div class="detail-value"><strong>${title}</strong></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Type:</div>
                <div class="detail-value">${eventType}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Event Date:</div>
                <div class="detail-value">${eventDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Location:</div>
                <div class="detail-value">${location}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Approved By:</div>
                <div class="detail-value">${approvedBy}</div>
              </div>
            </div>

            <a href="${viewUrl}" class="button">View Event</a>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Your event is now visible to all church members on the public calendar.
            </p>
          </div>

          <div class="footer">
            <p>Church Event Management System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, body }
}

/**
 * Generate email template for request deleted
 * @param params - Template parameters
 * @returns Email subject and body
 */
export function getRequestDeletedEmailTemplate(
  params: RequestDeletedEmailParams
): EmailTemplate {
  const { requestNumber, title, reason, deletedBy } = params

  const subject = `Request Deleted: ${title}`

  const body = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px; }
          .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px; }
          .warning { background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .reason { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Request Deleted</h1>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>Your event request <strong>${requestNumber}: ${title}</strong> has been permanently deleted from the system.</p>

            <div class="warning">
              <p style="margin: 0; font-weight: 600; color: #dc2626;">
                This action cannot be undone. The request has been removed from the database.
              </p>
            </div>

            <div class="reason">
              <h3 style="margin-top: 0; color: #ef4444;">Reason for Deletion:</h3>
              <p style="margin-bottom: 0;">${reason}</p>
            </div>

            <p><strong>Deleted by:</strong> ${deletedBy}</p>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you have questions about this decision, please contact the church administration.
            </p>
          </div>

          <div class="footer">
            <p>Church Event Management System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, body }
}

/**
 * Helper functions for sending specific notification emails
 */

/**
 * Send request submitted notification to admins
 */
export async function sendRequestSubmittedEmail(
  to: string | string[],
  params: RequestSubmittedEmailParams
): Promise<boolean> {
  const template = getRequestSubmittedEmailTemplate(params)
  return sendNotificationEmail({
    to,
    subject: template.subject,
    body: template.body,
  })
}

/**
 * Send request returned notification to creator
 */
export async function sendRequestReturnedEmail(
  to: string,
  params: RequestReturnedEmailParams
): Promise<boolean> {
  const template = getRequestReturnedEmailTemplate(params)
  return sendNotificationEmail({
    to,
    subject: template.subject,
    body: template.body,
  })
}

/**
 * Send request approved notification
 */
export async function sendRequestApprovedEmail(
  to: string | string[],
  params: RequestApprovedEmailParams
): Promise<boolean> {
  const template = getRequestApprovedEmailTemplate(params)
  return sendNotificationEmail({
    to,
    subject: template.subject,
    body: template.body,
  })
}

/**
 * Send request deleted notification
 */
export async function sendRequestDeletedEmail(
  to: string | string[],
  params: RequestDeletedEmailParams
): Promise<boolean> {
  const template = getRequestDeletedEmailTemplate(params)
  return sendNotificationEmail({
    to,
    subject: template.subject,
    body: template.body,
  })
}
