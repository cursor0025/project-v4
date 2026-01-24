// lib/email-templates/welcome.ts

export function getWelcomeEmail(userName: string, role: 'client' | 'vendor', dashboardUrl: string) {
    const isVendor = role === 'vendor';
    
    const title = isVendor ? 'Bienvenue sur BZM Marketplace !' : 'Bienvenue chez BZM !';
    const subtitle = isVendor 
      ? 'Votre boutique est prête à vendre' 
      : 'Commencez vos achats dès maintenant';
    
    const ctaText = isVendor ? 'Accéder à ma boutique' : 'Découvrir les produits';
    const benefits = isVendor 
      ? [
          '📦 Gestion simplifiée de vos produits',
          '💰 Paiements sécurisés et rapides',
          '📊 Statistiques en temps réel',
          '🎯 Visibilité maximale pour vos produits'
        ]
      : [
          '🛍️ Des milliers de produits disponibles',
          '🚚 Livraison rapide partout en Algérie',
          '💳 Paiement 100% sécurisé',
          '⭐ Support client réactif'
        ];
  
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, ${isVendor ? '#16a34a' : '#3b82f6'} 0%, ${isVendor ? '#15803d' : '#2563eb'} 100%);
        padding: 50px 30px;
        text-align: center;
        color: white;
      }
      .header h1 {
        margin: 0 0 10px 0;
        font-size: 32px;
        font-weight: 700;
      }
      .header p {
        margin: 0;
        font-size: 16px;
        opacity: 0.95;
      }
      .content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 20px;
        color: #1f2937;
        margin-bottom: 20px;
        font-weight: 600;
      }
      .message {
        font-size: 16px;
        color: #4b5563;
        margin-bottom: 30px;
        line-height: 1.7;
      }
      .benefits {
        background: #f9fafb;
        border-radius: 12px;
        padding: 25px;
        margin: 30px 0;
      }
      .benefits h3 {
        margin: 0 0 15px 0;
        color: ${isVendor ? '#16a34a' : '#3b82f6'};
        font-size: 18px;
        font-weight: 600;
      }
      .benefits ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .benefits li {
        padding: 10px 0;
        font-size: 15px;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
      }
      .benefits li:last-child {
        border-bottom: none;
      }
      .cta-button {
        display: inline-block;
        background: ${isVendor ? '#16a34a' : '#3b82f6'};
        color: white;
        text-decoration: none;
        padding: 16px 40px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        margin: 20px 0;
        transition: background 0.3s;
      }
      .cta-button:hover {
        background: ${isVendor ? '#15803d' : '#2563eb'};
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
        color: #6b7280;
      }
      .footer a {
        color: ${isVendor ? '#16a34a' : '#3b82f6'};
        text-decoration: none;
      }
      .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #e5e7eb, transparent);
        margin: 30px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 ${title}</h1>
        <p>${subtitle}</p>
      </div>
      
      <div class="content">
        <p class="greeting">Bonjour <strong>${userName}</strong>,</p>
        
        <p class="message">
          ${isVendor 
            ? 'Félicitations ! Votre compte vendeur a été créé avec succès. Vous pouvez maintenant commencer à ajouter vos produits et développer votre activité sur BZM Marketplace.' 
            : 'Votre compte a été créé avec succès ! Nous sommes ravis de vous compter parmi nous. Découvrez dès maintenant notre sélection de produits.'
          }
        </p>
  
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="cta-button">
            ${ctaText}
          </a>
        </div>
  
        <div class="divider"></div>
  
        <div class="benefits">
          <h3>${isVendor ? '🚀 Vos avantages vendeur' : '🎁 Vos avantages'}</h3>
          <ul>
            ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
  
        <p class="message">
          ${isVendor 
            ? 'Notre équipe est là pour vous accompagner dans votre réussite. N\'hésitez pas à nous contacter si vous avez des questions.' 
            : 'Si vous avez la moindre question, notre équipe support est à votre disposition.'
          }
        </p>
      </div>
      
      <div class="footer">
        <p><strong>BZM Marketplace</strong></p>
        <p>La marketplace algérienne de confiance</p>
        <p style="margin-top: 15px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help">Centre d'aide</a> • 
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact">Contact</a>
        </p>
        <p style="margin-top: 20px; font-size: 12px;">
          © ${new Date().getFullYear()} BZM Marketplace. Tous droits réservés.
        </p>
      </div>
    </div>
  </body>
  </html>
    `;
  }
  