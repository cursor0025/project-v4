export function getWelcomeEmail(userName: string, loginUrl: string): string {
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f4f7fa; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }
      .logo { font-size: 32px; margin-bottom: 10px; }
      .header-text { color: white; font-size: 24px; font-weight: 600; }
      .content { padding: 40px 30px; }
      .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
      .message { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
      .button { display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
      .btn-container { text-align: center; margin: 30px 0; }
      .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🛒</div>
        <div class="header-text">Bienvenue sur BZMarket</div>
      </div>
      <div class="content">
        <div class="greeting">Bonjour ${userName} !</div>
        <div class="message">
          Votre compte BZMarket a été créé avec succès. Vous faites maintenant partie de notre communauté marketplace multivendeur.
        </div>
        <div class="message">
          Vous pouvez dès maintenant explorer notre catalogue et effectuer vos achats.
        </div>
        <div class="btn-container">
          <a href="${loginUrl}" class="button">Accéder à mon compte</a>
        </div>
      </div>
      <div class="footer">
        <p>© 2026 BZMarket - Marketplace Multivendeur</p>
      </div>
    </div>
  </body>
  </html>
    `;
  }
  