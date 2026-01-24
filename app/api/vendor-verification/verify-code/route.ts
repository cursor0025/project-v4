import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client Supabase avec service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const { vendorEmail, code } = await req.json();

    // Validation
    if (!vendorEmail || !code) {
      return NextResponse.json(
        { error: 'Paramètres manquants (vendorEmail, code)' },
        { status: 400 }
      );
    }

    // 1. RÉCUPÉRER L'UTILISATEUR
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', vendorEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const userId = user.id;

    // 2. RÉCUPÉRER LA VÉRIFICATION
    const { data: verification, error: fetchError } = await supabase
      .from('vendor_verifications')
      .select('*')
      .eq('vendor_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Aucun code trouvé. Demandez un nouveau code.' },
        { status: 404 }
      );
    }

    // 3. VÉRIFIER SI BLOQUÉ
    if (verification.blocked_until) {
      const blockedUntil = new Date(verification.blocked_until);
      const now = new Date();
      
      if (now < blockedUntil) {
        const remainingMs = blockedUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        
        return NextResponse.json(
          {
            error: `Compte bloqué pendant ${remainingMinutes} minute(s)`,
            blockedFor: remainingMinutes
          },
          { status: 429 }
        );
      } else {
        // Débloquer
        await supabase
          .from('vendor_verifications')
          .update({ 
            blocked_until: null, 
            attempts: 0 
          })
          .eq('id', verification.id);
      }
    }

    // 4. VÉRIFIER SI DÉJÀ VÉRIFIÉ
    if (verification.is_verified) {
      return NextResponse.json(
        { error: 'Compte déjà vérifié' },
        { status: 400 }
      );
    }

    // 5. VÉRIFIER SI EXPIRÉ
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Code expiré. Demandez un nouveau code.' },
        { status: 400 }
      );
    }

    // 6. VÉRIFIER LE CODE
    const currentAttempts = verification.attempts || 0;

    if (verification.verification_code === code) {
      // ✅ CODE CORRECT
      const { error: updateError } = await supabase
        .from('vendor_verifications')
        .update({
          is_verified: true,
          attempts: 0
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error('🔴 Erreur mise à jour:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la validation' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Compte vendeur vérifié avec succès !'
      });

    } else {
      // ❌ CODE INCORRECT
      const newAttempts = currentAttempts + 1;
      const remainingAttempts = MAX_ATTEMPTS - newAttempts;

      if (newAttempts >= MAX_ATTEMPTS) {
        // BLOQUER
        const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);

        await supabase
          .from('vendor_verifications')
          .update({
            attempts: newAttempts,
            blocked_until: blockedUntil.toISOString()
          })
          .eq('id', verification.id);

        return NextResponse.json(
          {
            error: `Code incorrect. Compte bloqué pendant ${BLOCK_DURATION_MINUTES} minutes.`,
            blockedFor: BLOCK_DURATION_MINUTES,
            remainingAttempts: 0
          },
          { status: 429 }
        );
      } else {
        // INCRÉMENTER TENTATIVES
        await supabase
          .from('vendor_verifications')
          .update({ attempts: newAttempts })
          .eq('id', verification.id);

        return NextResponse.json(
          {
            error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).`,
            remainingAttempts
          },
          { status: 400 }
        );
      }
    }

  } catch (error: any) {
    console.error('🔴 Erreur API verify-code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
