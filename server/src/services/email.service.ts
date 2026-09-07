import { Resend } from 'resend';
import { getWelcomeEmailTemplate } from '../emails/welcome.email';
import { getResetPasswordEmailTemplate } from '../emails/reset-password.email';
import { getVerifyEmailTemplate } from '../emails/verify-email.email';

// Initialize core client instance securely
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_unconfigured');
const EMAIL_FROM = process.env.EMAIL_FROM || 'ChemEng Portal <noreply@chemengportal.com>';

export interface OpportunityItem {
  title: string;
  company: string;
  type: string;
  location: string | null;
}

export class EmailService {
  private static async deliver(to: string, subject: string, html: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[EMAIL BACKUP LOG] Outbound mail muted. Target: ${to} | Subject: "${subject}"`);
      return;
    }

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error(`[CRITICAL EMAIL API EXCEPTION] Failed to dispatch mail to: ${to}. Details:`, error);
    }
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const { subject, html } = getWelcomeEmailTemplate(name);
    await this.deliver(to, subject, html);
  }

  static async sendResetPasswordEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const { subject, html } = getResetPasswordEmailTemplate(name, resetUrl);
    await this.deliver(to, subject, html);
  }

  static async sendVerifyEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    const { subject, html } = getVerifyEmailTemplate(name, verifyUrl);
    await this.deliver(to, subject, html);
  }

  static async sendEventReminderEmail(to: string, name: string, eventTitle: string, eventDate: string, eventUrl: string): Promise<void> {
    const subject = `Reminder: ${eventTitle} is coming up!`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #495057;">
        <h2 style="color: #1a63ef;">🧪 ChemEng Portal Event Alert</h2>
        <p>Hi ${name},</p>
        <p>This is a quick notification loop reminding you about your upcoming event registration status:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 10px 0; color: #212529;">${eventTitle}</h3>
          <p style="margin: 0;">📅 <strong>Date/Lifespan Context:</strong> ${eventDate}</p>
        </div>
        <p><a href="${eventUrl}" style="display: inline-block; background-color: #1a63ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Event Workspace Details</a></p>
      </div>
    `;
    await this.deliver(to, subject, html);
  }

  static async sendOpportunityAlertEmail(to: string, name: string, opportunities: OpportunityItem[]): Promise<void> {
    const subject = 'Your ChemEng Career Digest';
    
    // Dynamically render row entries mapping explicit industry vacancies
    const listingRows = opportunities.map(opp => `
      <div style="padding: 16px 0; border-bottom: 1px solid #e9ecef;">
        <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #1a63ef;">${opp.title}</h4>
        <p style="margin: 0; font-size: 14px; color: #212529;"><strong>Company:</strong> ${opp.company} | 💼 <strong>Class:</strong> ${opp.type}</p>
        ${opp.location ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #6c757d;">📍 ${opp.location}</p>` : ''}
      </div>
    `).join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #495057;">
        <h2 style="color: #1a63ef; margin-bottom: 8px;">🧪 ChemEng Portal</h2>
        <h3 style="margin-top: 0; color: #212529;">New Core Placements Tailored For You, ${name}</h3>
        <p>Here are your customized chemical engineering digests matching open industrial or research sectors:</p>
        <div style="margin: 24px 0;">
          ${listingRows.length > 0 ? listingRows : '<p style="color: #6c757d;">No new matching sectors posted today.</p>'}
        </div>
        <p><a href="${process.env.APP_URL || 'http://localhost:5173'}/opportunities" style="display: inline-block; background-color: #1a63ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Explore All Placement Channels</a></p>
      </div>
    `;
    await this.deliver(to, subject, html);
  }
}