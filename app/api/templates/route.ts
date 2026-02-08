import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');

  if (!categoryId) {
    return NextResponse.json({ error: 'category_id requis' }, { status: 400 });
  }

  try {
    const { data: mapping, error: mappingError } = await supabase
      .from('category_templates')
      .select('template_code')
      .eq('category_id', parseInt(categoryId))
      .single();

    if (mappingError || !mapping) {
      return NextResponse.json({ error: 'Template non configuré' }, { status: 404 });
    }

    const { data: template, error: templateError } = await supabase
      .from('product_templates')
      .select('*')
      .eq('code', mapping.template_code)
      .single();

    const { data: attributes, error: attrError } = await supabase
      .from('template_attributes')
      .select('*')
      .eq('template_code', mapping.template_code)
      .order('level', { ascending: true });

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      code: template.code,
      name: template.name,
      has_variants: template.has_variants,
      variant_config: template.variant_config || [],
      attributes: (attributes || []).map(attr => ({
        code: attr.code,
        label: attr.label,
        type: attr.type,
        level: attr.level,
        required: attr.required,
        options: attr.options || []
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
