import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

export interface SendVerificationEmailParams {
  email: string;
  code: string;
  userName?: string;
}

export async function sendVerificationEmail({
  email,
  code,
  userName,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "كود التحقق من البريد الإلكتروني - EE37",
      html: generateVerificationEmailHTML({ email, code, userName }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return { success: false, error: "Failed to send email" };
  }
}

function generateVerificationEmailHTML({
  email,
  code,
  userName,
}: SendVerificationEmailParams): string {
  const displayName = userName ?? email.split("@")[0];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>كود التحقق - EE37</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0A1628 0%, #1a2a4a 50%, #0A1628 100%); min-height: 100vh; font-family: 'Cairo', sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: rgba(255, 255, 255, 0.03); border-radius: 24px; overflow: hidden; backdrop-filter: blur(20px); border: 1px solid rgba(212, 168, 83, 0.2);">
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(212, 168, 83, 0.05) 100%); padding: 50px 40px 40px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 60%); animation: pulse 4s ease-in-out infinite;"></div>
                <div style="position: relative; z-index: 1;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D4A853 0%, #f0d48a 50%, #D4A853 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(212, 168, 83, 0.3), 0 0 60px rgba(212, 168, 83, 0.1);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7V12C3 17.5228 12 22 12 22C12 22 21 17.5228 21 12V7L12 2Z" fill="#0A1628" opacity="0.9"/>
                      <path d="M9 12L11 14L15 10" stroke="#D4A853" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h1 style="margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #FAF7F0; letter-spacing: 0.5px;">
                    أهلاً بك في EE37
                  </h1>
                  <p style="margin: 0; font-size: 15px; color: rgba(250, 247, 240, 0.6); font-weight: 400;">
                    منصة الدفعة السابعة والثلاثون
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 50px 30px; background: rgba(10, 22, 40, 0.5);">
              <div style="text-align: center;">
                <p style="margin: 0 0 24px; font-size: 16px; color: #FAF7F0; font-weight: 500; line-height: 1.8;">
                  مرحباً <span style="color: #D4A853; font-weight: 600;">${displayName}</span> 👋
                </p>
                <p style="margin: 0 0 32px; font-size: 14px; color: rgba(250, 247, 240, 0.7); font-weight: 400; line-height: 1.8;">
                  شكراً لتسجيلك في منصتنا. لإتمام عملية التسجيل، يرجى إدخال كود التحقق التالي:
                </p>
              </div>
              <div style="background: linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(212, 168, 83, 0.05) 100%); border-radius: 16px; padding: 30px; text-align: center; border: 1px solid rgba(212, 168, 83, 0.3);">
                <p style="margin: 0 0 16px; font-size: 13px; color: rgba(250, 247, 240, 0.6); font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">
                  كود التحقق
                </p>
                <div style="font-family: 'Cairo', sans-serif; font-size: 42px; font-weight: 800; color: #D4A853; letter-spacing: 12px; text-shadow: 0 4px 20px rgba(212, 168, 83, 0.4); direction: ltr; unicode-bidi: bidi-override;">
                  ${code.split("").join(" ")}
                </div>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 0; font-size: 13px; color: rgba(250, 247, 240, 0.6); font-weight: 400;">
                  هذا الكود صالح لمدة <span style="color: #D4A853; font-weight: 600;">30 دقيقة</span>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 50px 40px; background: rgba(10, 22, 40, 0.5);">
              <div style="background: linear-gradient(90deg, transparent 0%, rgba(212, 168, 83, 0.2) 50%, transparent 100%); height: 1px; margin-bottom: 24px;"></div>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 0.6;"></div>
                  </td>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 0.8;"></div>
                  </td>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 1;"></div>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 12px; color: rgba(250, 247, 240, 0.4); font-weight: 400; text-align: center; line-height: 1.8;">
                إذا لم تقم بإنشاء حساب على EE37، يرجى تجاهل هذا البريد الإلكتروني.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: rgba(250, 247, 240, 0.3); font-weight: 400; text-align: center;">
                © 2025 EE37 Platform. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    @media (max-width: 600px) {
      table[role="presentation"] > tr > td > table {
        max-width: 100% !important;
        border-radius: 16px !important;
      }
      td[style*="padding: 50px 40px"] {
        padding: 30px 20px !important;
      }
      td[style*="padding: 40px 50px"] {
        padding: 30px 20px !important;
      }
      .code-display {
        font-size: 32px !important;
        letter-spacing: 8px !important;
      }
    }
  </style>
</body>
</html>`;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getVerificationCodeExpiry(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now;
}

export interface SendPasswordResetEmailParams {
  email: string;
  token: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  email,
  token,
  userName,
}: SendPasswordResetEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "إعادة تعيين كلمة المرور - EE37",
      html: generatePasswordResetEmailHTML({ email, token, userName }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return { success: false, error: "Failed to send email" };
  }
}

function generatePasswordResetEmailHTML({
  email,
  token,
  userName,
}: SendPasswordResetEmailParams): string {
  const displayName = userName ?? email.split("@")[0];
  const resetUrl = `${env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور - EE37</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0A1628 0%, #1a2a4a 50%, #0A1628 100%); min-height: 100vh; font-family: 'Cairo', sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background: rgba(255, 255, 255, 0.03); border-radius: 24px; overflow: hidden; backdrop-filter: blur(20px); border: 1px solid rgba(212, 168, 83, 0.2);">
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(212, 168, 83, 0.05) 100%); padding: 50px 40px 40px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 60%); animation: pulse 4s ease-in-out infinite;"></div>
                <div style="position: relative; z-index: 1;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D4A853 0%, #f0d48a 50%, #D4A853 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(212, 168, 83, 0.3), 0 0 60px rgba(212, 168, 83, 0.1);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7V12C3 17.5228 12 22 12 22C12 22 21 17.5228 21 12V7L12 2Z" fill="#0A1628" opacity="0.9"/>
                      <path d="M12 11V13" stroke="#D4A853" stroke-width="2.5" stroke-linecap="round"/>
                      <circle cx="12" cy="17" r="1.5" fill="#D4A853"/>
                    </svg>
                  </div>
                  <h1 style="margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; color: #FAF7F0; letter-spacing: 0.5px;">
                    إعادة تعيين كلمة المرور
                  </h1>
                  <p style="margin: 0; font-size: 15px; color: rgba(250, 247, 240, 0.6); font-weight: 400;">
                    منصة الدفعة السابعة والثلاثون
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 50px 30px; background: rgba(10, 22, 40, 0.5);">
              <div style="text-align: center;">
                <p style="margin: 0 0 24px; font-size: 16px; color: #FAF7F0; font-weight: 500; line-height: 1.8;">
                  مرحباً <span style="color: #D4A853; font-weight: 600;">${displayName}</span> 👋
                </p>
                <p style="margin: 0 0 32px; font-size: 14px; color: rgba(250, 247, 240, 0.7); font-weight: 400; line-height: 1.8;">
                  لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لتعيين كلمة مرور جديدة.
                </p>
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4A853 0%, #f0d48a 50%, #D4A853 100%); color: #0A1628; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: 'Cairo', sans-serif; box-shadow: 0 10px 30px rgba(212, 168, 83, 0.3); transition: transform 0.2s ease;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; font-size: 13px; color: rgba(250, 247, 240, 0.6); font-weight: 400;">
                  أو انسخ هذا الرابط إلى المتصفح:
                </p>
                <p style="margin: 0; font-size: 12px; color: #D4A853; font-weight: 500; word-break: break-all; direction: ltr;">
                  ${resetUrl}
                </p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 0; font-size: 13px; color: rgba(250, 247, 240, 0.6); font-weight: 400;">
                  هذا الرابط صالح لمدة <span style="color: #D4A853; font-weight: 600;">1 ساعة</span>
                </p>
              </div>
              <div style="text-align: center; margin-top: 24px; padding: 16px; background: rgba(220, 53, 69, 0.1); border-radius: 12px; border: 1px solid rgba(220, 53, 69, 0.3);">
                <p style="margin: 0; font-size: 13px; color: rgba(250, 247, 240, 0.7); font-weight: 400;">
                  إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بالدعم إذا كان لديك أي مخاوف.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 50px 40px; background: rgba(10, 22, 40, 0.5);">
              <div style="background: linear-gradient(90deg, transparent 0%, rgba(212, 168, 83, 0.2) 50%, transparent 100%); height: 1px; margin-bottom: 24px;"></div>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 0.6;"></div>
                  </td>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 0.8;"></div>
                  </td>
                  <td style="padding: 0 10px;">
                    <div style="display: inline-block; width: 8px; height: 8px; background: #D4A853; border-radius: 50%; opacity: 1;"></div>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 12px; color: rgba(250, 247, 240, 0.4); font-weight: 400; text-align: center; line-height: 1.8;">
                إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم.
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: rgba(250, 247, 240, 0.3); font-weight: 400; text-align: center;">
                © 2025 EE37 Platform. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    @media (max-width: 600px) {
      table[role="presentation"] > tr > td > table {
        max-width: 100% !important;
        border-radius: 16px !important;
      }
      td[style*="padding: 50px 40px"] {
        padding: 30px 20px !important;
      }
      td[style*="padding: 40px 50px"] {
        padding: 30px 20px !important;
      }
      a[href] {
        display: block !important;
        text-align: center !important;
      }
    }
  </style>
</body>
</html>`;
}

export function getPasswordResetTokenExpiry(): Date {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now;
}

export function generatePasswordResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
