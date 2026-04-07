package com.studenttracker.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.url:http://localhost:5173}")
    private String appUrl;

    @Value("${spring.mail.username:noreply@semesteros.app}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String firstName, String token) {
        String resetLink = appUrl + "/reset-password?token=" + token;
        String subject = "Reset your SemesterOS password";
        String html = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f5f5f5;font-family:'DM Sans',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
                    <tr><td align="center">
                      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                        <tr>
                          <td style="background:#1e1a1a;padding:32px 40px;text-align:center;">
                            <span style="font-family:'Georgia',serif;font-size:24px;color:#f49585;font-weight:400;">SemesterOS</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1e1a1a;">Hi %s,</h2>
                            <p style="margin:0 0 24px;color:#555;line-height:1.6;">
                              We received a request to reset your password. Click the button below to choose a new one.
                              This link expires in <strong>15 minutes</strong>.
                            </p>
                            <div style="text-align:center;margin:32px 0;">
                              <a href="%s" style="background:#f49585;color:#1e1018;text-decoration:none;padding:14px 32px;border-radius:99px;font-weight:700;font-size:15px;display:inline-block;">
                                Reset Password
                              </a>
                            </div>
                            <p style="margin:24px 0 0;color:#999;font-size:13px;line-height:1.6;">
                              If you didn't request this, you can safely ignore this email — your password won't change.
                            </p>
                            <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
                            <p style="margin:0;color:#bbb;font-size:12px;">
                              Or paste this link in your browser:<br>
                              <a href="%s" style="color:#f49585;word-break:break-all;">%s</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(firstName, resetLink, resetLink, resetLink);

        sendEmail(toEmail, subject, html);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            logger.info("Email sent to {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
