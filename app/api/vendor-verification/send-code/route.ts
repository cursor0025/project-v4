import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVerificationCode, getCodeExpiration, canResendCode, isUserBlocked, getRemainingBlockTime, VERIFICATION_CONFIG } from '@/lib/verification';

// Client Supabase avec service role (accès admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { vendorEmail, vendorName } = await req.json();

    // Validation des paramètres
    if (!vendorEmail || !vendorName) {
      return NextResponse.json(
        { error: 'Paramètres manquants (vendorEmail, vendorName)' },
        { status: 400 }
      );
    }

    // 1. CRÉER OU RÉCUPÉRER L'UTILISATEUR
    let userId: string;

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', vendorEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Créer le user dans la table users
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: vendorEmail,
          full_name: vendorName,
          role: 'vendor'
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Erreur création user:', userError);
        return NextResponse.json(
          { error: 'Erreur création utilisateur' },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // 2. CRÉER OU RÉCUPÉRER LE VENDOR
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingVendor) {
      await supabase
        .from('vendors')
        .insert({
          user_id: userId,
          business_name: vendorName,
          email: vendorEmail
        });
    }

    // 3. RÉCUPÉRER LA VÉRIFICATION EXISTANTE
    const { data: existingVerif } = await supabase
      .from('vendor_verifications')
      .select('*')
      .eq('vendor_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Vérifier si le vendeur est bloqué
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

    // Vérifier si le vendeur est déjà vérifié
    if (existingVerif && existingVerif.is_verified) {
      return NextResponse.json(
        { error: 'Ce compte vendeur est déjà vérifié.' },
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

    // 4. GÉNÉRER LE NOUVEAU CODE
    const verificationCode = generateVerificationCode();
    const expiresAt = getCodeExpiration();

    // 5. CRÉER OU METTRE À JOUR LA VÉRIFICATION
    if (existingVerif && !existingVerif.is_verified) {
      const { error: updateError } = await supabase
        .from('vendor_verifications')
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
        .from('vendor_verifications')
        .insert({
          vendor_id: userId,
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

    // 6. ENVOYER L'EMAIL
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'vendor-verification',
        to: { email: vendorEmail, name: vendorName },
        data: {
          vendorName,
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
      debug_code: verificationCode
    });

  } catch (error: any) {
    console.error('Erreur API send-code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
