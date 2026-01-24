import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVerificationCode, getCodeExpiration, canResendCode, isUserBlocked, getRemainingBlockTime, VERIFICATION_CONFIG } from '@/lib/verification';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Paramètres manquants (email, firstName, lastName)' },
        { status: 400 }
      );
    }

    // 1. Vérifier si l'email existe déjà dans auth.users
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
    const userExists = existingAuthUser?.users?.some(u => u.email === email);

    if (userExists) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // 2. Créer un ID temporaire pour ce client (avant création auth)
    const tempClientId = `temp_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    // 3. Récupérer la vérification existante
    const { data: existingVerif } = await supabase
      .from('client_verifications')
      .select('*')
      .eq('client_id', tempClientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Vérifier si bloqué
    if (existingVerif && existingVerif.blocked_until) {
      if (isUserBlocked(existingVerif.blocked_until)) {
        const remainingMinutes = getRemainingBlockTime(existingVerif.blocked_until);
        return NextResponse.json(
          { 
            error: 'Trop de tentatives. Compte temporairement bloqué.',
            blockedFor: remainingMinutes,
            message: `Veuillez réessayer dans ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
          },
          { status: 429 }
        );
      }
    }

    // Vérifier si déjà vérifié
    if (existingVerif && existingVerif.is_verified) {
      return NextResponse.json(
        { error: 'Ce compte est déjà vérifié.' },
        { status: 400 }
      );
    }

    // Vérifier le nombre de renvois
    if (existingVerif && existingVerif.resend_count >= VERIFICATION_CONFIG.MAX_RESENDS) {
      return NextResponse.json(
        { error: `Nombre maximum de renvois atteint (${VERIFICATION_CONFIG.MAX_RESENDS}). Contactez le support.` },
        { status: 429 }
      );
    }

    // Vérifier le délai entre renvois
    if (existingVerif && existingVerif.last_sent_at) {
      if (!canResendCode(existingVerif.last_sent_at)) {
        return NextResponse.json(
          { error: 'Veuillez attendre 1 minute avant de renvoyer un code.' },
          { status: 429 }
        );
      }
    }

    // 4. Générer le code
    const verificationCode = generateVerificationCode();
    const expiresAt = getCodeExpiration();

    // 5. Créer ou mettre à jour la vérification
    if (existingVerif && !existingVerif.is_verified) {
      const { error: updateError } = await supabase
        .from('client_verifications')
        .update({
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          resend_count: (existingVerif.resend_count || 0) + 1,
          last_sent_at: new Date().toISOString()
        })
        .eq('id', existingVerif.id);

      if (updateError) {
        console.error('Erreur mise à jour vérification:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du code' },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from('client_verifications')
        .insert({
          client_id: tempClientId,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          resend_count: 0,
          last_sent_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erreur création vérification:', insertError);
        return NextResponse.json(
          { error: 'Erreur lors de la création du code' },
          { status: 500 }
        );
      }
    }

    // 6. Envoyer l'email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'client-verification',
        to: { email, name: `${firstName} ${lastName}` },
        data: {
          clientName: `${firstName} ${lastName}`,
          verificationCode
        }
      })
    });

    if (!emailResponse.ok) {
      console.error('Erreur envoi email');
    }

    return NextResponse.json({
      success: true,
      message: 'Code de vérification envoyé par email',
      expiresIn: VERIFICATION_CONFIG.CODE_VALIDITY_MINUTES,
      tempClientId, // Pour récupérer lors de la vérification
      debug_code: verificationCode // À RETIRER EN PRODUCTION
    });

  } catch (error: any) {
    console.error('Erreur API send-code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
