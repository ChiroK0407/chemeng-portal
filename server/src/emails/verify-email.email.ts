export function getVerifyEmailTemplate(name: string, verifyUrl: string) {
  const subject = 'Verify your email';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 10px 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
              <tr>
                <td align="center" style="background-color: #ffffff; padding: 40px 40px 20px 40px; border-bottom: 1px solid #e9ecef;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a63ef; tracking-tight: -0.5px;">
                    🧪 ChemEng Portal
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px; color: #495057; line-height: 1.6; font-size: 16px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #212529; font-weight: 600;">Hello, ${name}</h2>
                  <p style="margin: 0 0 20px 0;">Thank you for registering an account on our engineering space. To verify your email address and activate your interactive platform status, please click the confirmation button below:</p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${verifyUrl}" target="_blank" style="display: inline-block; background-color: #1a63ef; color: #ffffff; font-weight: 600; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(26,99,239,0.2);">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 20px 0;">Verifying your account unlocks high-priority features, including submitting simulation abstracts and applying directly to recruiter listings.</p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d; word-break: break-all;">Button dysfunctional? Link backup URL:<br><a href="${verifyUrl}" style="color: #1a63ef;">${verifyUrl}</a></p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #f8f9fa; padding: 24px 40px; border-top: 1px solid #e9ecef; font-size: 13px; color: #6c757d;">
                  <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} ChemEng Portal. All rights reserved.</p>
                  <p style="margin: 0;">This is an automated lifecycle communication verification sequence loop.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return { subject, html };
}