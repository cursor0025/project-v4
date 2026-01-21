import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/brevo';
import { getWelcomeEmail } from '@/lib/email-templates/welcome';

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json();

    // Validation
    if (!type || !to?.email || !to?.name) {
      return NextResponse.json(
        { error: 'Paramètres manquants (type, to.email, to.name)' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    // Sélection du template
    switch (type) {
      case 'welcome':
        subject = 'Bienvenue sur BZMarket ! 🎉';
        htmlContent = getWelcomeEmail(
          data.userName || to.name,
          data.loginUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/login`
        );
        break;

      default:
        return NextResponse.json(
          { error: `Type d'email inconnu: ${type}` },
          { status: 400 }
        );
    }

    // Envoi
    const result = await sendEmail({
      to: { email: to.email, name: to.name },
      subject,
      htmlContent,
      tags: [type, 'bzmarket']
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email envoyé avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Erreur API send-email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
