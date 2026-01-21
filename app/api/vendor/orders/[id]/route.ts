import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { apiLimiter } from '@/lib/rate-limit'
import { updateOrderSchema, validateData } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await apiLimiter(ip)
    
    if (!rateLimitResult.success) {
      return Response.json(
        { error: 'TOO_MANY_REQUESTS' },
        { status: 429 }
      )
    }

    const { id } = await context.params
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!vendor) {
      return Response.json({ error: 'VENDOR_NOT_FOUND' }, { status: 404 })
    }

    const body = await request.json()
    
    const validation = validateData(updateOrderSchema, body)
    if (!validation.success) {
      return Response.json(
        { error: 'VALIDATION_ERROR', errors: validation.errors },
        { status: 400 }
      )
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (validation.data.status) {
      updates.status = validation.data.status
    }
    
    if (validation.data.vendor_notes !== undefined) {
      updates.vendor_notes = validation.data.vendor_notes
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .eq('vendor_id', vendor.id)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!order) {
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 })
    }

    return Response.json({ order }, { status: 200 })
    
  } catch (e) {
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await apiLimiter(ip)
    
    if (!rateLimitResult.success) {
      return Response.json(
        { error: 'TOO_MANY_REQUESTS' },
        { status: 429 }
      )
    }

    const { id } = await context.params
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!vendor) {
      return Response.json({ error: 'VENDOR_NOT_FOUND' }, { status: 404 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('vendor_id', vendor.id)
      .single()

    if (error || !order) {
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 })
    }

    return Response.json({ order }, { status: 200 })
    
  } catch (e) {
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
