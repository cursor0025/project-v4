import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json(
        { error: 'UNAUTHORIZED', message: 'Utilisateur non connecté' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        role,
        business_name,
        gender,
        age,
        wilaya,
        commune,
        address,
        referral_code,
        is_active,
        newsletter,
        updated_at
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return Response.json(
        { error: 'PROFILE_FETCH_FAILED', message: profileError.message },
        { status: 500 }
      )
    }

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
      },
      { status: 200 }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return Response.json({ error: 'INTERNAL_ERROR', message }, { status: 500 })
  }
}
