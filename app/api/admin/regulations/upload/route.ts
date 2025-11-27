import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/utils/supabase-admin';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const code = formData.get('code');
    const previousUrl = formData.get('previousUrl');

    if (!(file instanceof File) || typeof code !== 'string' || !code) {
      return NextResponse.json(
        { error: 'Invalid file or code' },
        { status: 400 },
      );
    }

    let supabase;
    try {
      supabase = createSupabaseAdminClient();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize Supabase client';
      return NextResponse.json(
        { error: message },
        { status: 500 },
      );
    }

    const filePath = `regulations/${code}/${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabase.storage.from('regulations').upload(filePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

    if (uploadError || !data?.path) {
      return NextResponse.json(
        { error: uploadError?.message ?? 'Failed to upload file to storage' },
        { status: 500 },
      );
    }

    if (typeof previousUrl === 'string' && previousUrl) {
      try {
        const url = new URL(previousUrl);
        const relativePath = url.pathname.replace(/^\/storage\/v1\/object\/public\//, '');
        if (relativePath) {
          await supabase.storage.from('regulations').remove([relativePath]);
        }
      } catch {
        // Ignore delete errors to avoid blocking the main flow
      }
    }

    const { data: publicUrlData } = supabase.storage.from('regulations').getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate public URL' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { publicUrl: publicUrlData.publicUrl },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}


