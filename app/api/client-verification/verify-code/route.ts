import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const { tempClientId, code, email, password, userData } = await req.json();

    if (!tempClientId || !code || !email || !password || !userData) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // 1. Récupérer la vérification
    const { data: verification, error: fetchError } = await supabase
      .from('client_verifications')
      .select('*')
      .eq('client_id', tempClientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Aucun code trouvé. Demandez un nouveau code.' },
        { status: 404 }
      );
    }

    // 2. Vérifier si bloqué
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
        await supabase
          .from('client_verifications')
          .update({ blocked_until: null, attempts: 0 })
          .eq('id', verification.id);
      }
    }

    // 3. Vérifier si déjà vérifié
    if (verification.is_verified) {
      return NextResponse.json(
        { error: 'Compte déjà vérifié' },
        { status: 400 }
      );
    }

    // 4. Vérifier si expiré
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Code expiré. Demandez un nouveau code.' },
        { status: 400 }
      );
    }

    // 5. Vérifier le code
    const currentAttempts = verification.attempts || 0;

    if (verification.verification_code === code) {
      // ✅ CODE CORRECT - Créer le compte
      
      // Créer dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Email déjà vérifié
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: 'client'
        }
      });

      if (authError || !authData.user) {
        console.error('Erreur création auth:', authError);
        return NextResponse.json(
          { error: 'Erreur création compte' },
          { status: 500 }
        );
      }

      // Créer le profil
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: authData.user.id,
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        gender: userData.gender,
        age: userData.age,
        phone: userData.phone,
        wilaya: userData.wilaya,
        commune: userData.commune,
        address: userData.address,
        referral_code: userData.referral || null,
        newsletter: userData.newsletter || false,
        role: 'client'
      }]);

      if (profileError) {
        console.error('Erreur profil:', profileError);
      }

      // Marquer comme vérifié
      await supabase
        .from('client_verifications')
        .update({ is_verified: true, attempts: 0 })
        .eq('id', verification.id);

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Compte client créé avec succès !',
        userId: authData.user.id
      });

    } else {
      // ❌ CODE INCORRECT
      const newAttempts = currentAttempts + 1;
      const remainingAttempts = MAX_ATTEMPTS - newAttempts;

      if (newAttempts >= MAX_ATTEMPTS) {
        const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);

        await supabase
          .from('client_verifications')
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
        await supabase
          .from('client_verifications')
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
    console.error('Erreur API verify-code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
