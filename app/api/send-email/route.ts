import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json();

    if (!to?.email || !data) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'vendor-verification') {
      const { vendorName, verificationCode } = data;

      subject = '🔐 Votre code de vérification Vendeur - BZMarket';
      
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .code-container {
      background: #fff7ed;
      border: 2px solid #f97316;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code {
      font-size: 48px;
      font-weight: 800;
      color: #f97316;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .validity {
      font-size: 14px;
      color: #dc2626;
      margin-top: 15px;
      font-weight: 600;
    }
    .instructions {
      background: #f9fafb;
      border-left: 4px solid #f97316;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .instructions h3 {
      margin: 0 0 10px 0;
      color: #f97316;
      font-size: 16px;
    }
    .instructions ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
      color: #555;
    }
    .warning {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #991b1b;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ BZMarket</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Vérification de votre compte vendeur</p>
    </div>
    
    <div class="content">
      <p class="greeting">Bonjour <strong>${vendorName}</strong>,</p>
      
      <p>Bienvenue sur BZMarket ! Pour finaliser la création de votre compte vendeur, utilisez le code ci-dessous :</p>
      
      <div class="code-container">
        <div class="code-label">Votre code de vérification</div>
        <div class="code">${verificationCode}</div>
        <div class="validity">⏱️ Valide pendant 15 minutes</div>
      </div>
      
      <div class="instructions">
        <h3>📋 Instructions :</h3>
        <ul>
          <li>Entrez ce code à 6 chiffres dans le formulaire</li>
          <li>Vous avez <strong>3 tentatives</strong> maximum</li>
          <li>Le code expire après <strong>15 minutes</strong></li>
        </ul>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Attention :</strong> Si vous n'avez pas demandé ce code, ignorez cet email.
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Cordialement,<br>
        <strong>L'équipe BZMarket</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>BZMarket</strong></p>
      <p>© ${new Date().getFullYear()} Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
      `;
    } else if (type === 'client-verification') {
      const { clientName, verificationCode } = data;

      subject = '🔐 Votre code de vérification - BZMarket';
      
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .code-container {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code {
      font-size: 48px;
      font-weight: 800;
      color: #3b82f6;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .validity {
      font-size: 14px;
      color: #dc2626;
      margin-top: 15px;
      font-weight: 600;
    }
    .instructions {
      background: #f9fafb;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .instructions h3 {
      margin: 0 0 10px 0;
      color: #3b82f6;
      font-size: 16px;
    }
    .instructions ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
      color: #555;
    }
    .warning {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #991b1b;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ BZMarket</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Vérification de votre compte client</p>
    </div>
    
    <div class="content">
      <p class="greeting">Bonjour <strong>${clientName}</strong>,</p>
      
      <p>Bienvenue sur BZMarket ! Pour finaliser la création de votre compte, utilisez le code ci-dessous :</p>
      
      <div class="code-container">
        <div class="code-label">Votre code de vérification</div>
        <div class="code">${verificationCode}</div>
        <div class="validity">⏱️ Valide pendant 15 minutes</div>
      </div>
      
      <div class="instructions">
        <h3>📋 Instructions :</h3>
        <ul>
          <li>Entrez ce code à 6 chiffres dans le formulaire</li>
          <li>Vous avez <strong>3 tentatives</strong> maximum</li>
          <li>Le code expire après <strong>15 minutes</strong></li>
        </ul>
      </div>
      
      <div class="warning">
        ⚠️ <strong>Attention :</strong> Si vous n'avez pas demandé ce code, ignorez cet email.
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Cordialement,<br>
        <strong>L'équipe BZMarket</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>BZMarket</strong></p>
      <p>© ${new Date().getFullYear()} Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
      `;
    } else {
      return NextResponse.json(
        { error: 'Type d\'email non supporté' },
        { status: 400 }
      );
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'BZMarket <onboarding@resend.dev>',
      to: [to.email],
      subject: subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      return NextResponse.json(
        { error: 'Erreur envoi email' },
        { status: 500 }
      );
    }

    console.log('✅ Email envoyé:', emailData?.id);

    return NextResponse.json({
      success: true,
      message: 'Email envoyé',
      emailId: emailData?.id
    });

  } catch (error: any) {
    console.error('❌ Erreur API send-email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
