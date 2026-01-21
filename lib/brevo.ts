import * as SibApiV3Sdk from '@sendinblue/client';

// Configuration du client Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

interface EmailParams {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
  tags?: string[];
}

export async function sendEmail(params: EmailParams) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.sender = params.sender || {
      email: 'monsieurz002@gmail.com',
      name: 'BZMarket'
    };
    sendSmtpEmail.to = [params.to];
    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.htmlContent = params.htmlContent;
    sendSmtpEmail.tags = params.tags || [];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error: any) {
    console.error('❌ Erreur Brevo:', error.response?.body || error);
    return { success: false, error: error.message };
  }
}
