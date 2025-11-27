import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/utils/supabase-admin';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get('file');
  const code = formData.get('code');
  const previousUrl = formData.get('previousUrl');

  if (!(file instanceof File) || typeof code !== 'string' || !code) {
    return NextResponse.json(
      { success: false, error: 'Invalid file or code' },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const filePath = `regulations/${code}/${Date.now()}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage.from('regulations').upload(filePath, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });

  if (error || !data?.path) {
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to upload file' },
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

  const { data: publicUrl } = supabase.storage.from('regulations').getPublicUrl(data.path);

  return NextResponse.json(
    {
      success: true,
      path: data.path,
      publicUrl: publicUrl.publicUrl,
    },
    { status: 200 },
  );
}


