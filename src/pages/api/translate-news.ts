import type { APIRoute } from 'astro';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { getAdminAuth, getAdminDb } from '../../lib/firebase-admin';

export const prerender = false;

const json = (status: number, data: Record<string, unknown>) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

// Secret runtime via process.env (import.meta.env statis-inline saat build → kosong di prod)
const AWS_ACCESS_KEY_ID = import.meta.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = import.meta.env.AWS_REGION ?? process.env.AWS_REGION;
const awsReady = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION);
const client = awsReady
  ? new TranslateClient({
      region: AWS_REGION!,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
    })
  : undefined;

// AWS Translate batas 10.000 byte/request → belah body per paragraf
// (markdown lama dipisah \n\n; HTML dari CKEditor dibelah sebelum tiap tag blok)
function chunkParagraphs(text: string, maxBytes = 9000): string[] {
  const chunks: string[] = [];
  let current = '';
  for (const para of text.split(/\n\n+|(?=<(?:p|h[1-6]|ul|ol|blockquote)[\s>])/)) {
    if (Buffer.byteLength(current + para) > maxBytes && current) {
      chunks.push(current);
      current = '';
    }
    current += (current ? '\n\n' : '') + para;
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translate(text: string, target: 'en' | 'ja'): Promise<string> {
  const parts = chunkParagraphs(text);
  const out: string[] = [];
  for (const part of parts) {
    const res = await client!.send(
      new TranslateTextCommand({ Text: part, SourceLanguageCode: 'id', TargetLanguageCode: target })
    );
    out.push(res.TranslatedText ?? '');
  }
  return out.join('\n\n');
}

export const POST: APIRoute = async ({ request }) => {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return json(503, { error: 'firebase admin not configured' });
  if (!client) return json(503, { error: 'aws translate not configured' });

  // Hanya admin login (token Firebase valid) yang boleh memicu terjemahan
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token) return json(401, { error: 'missing token' });
  try {
    await auth.verifyIdToken(token);
  } catch {
    return json(401, { error: 'invalid token' });
  }

  let docId: string;
  try {
    docId = (await request.json()).docId;
  } catch {
    return json(400, { error: 'invalid JSON' });
  }
  if (!docId) return json(400, { error: 'missing docId' });

  const ref = db.collection('news').doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return json(404, { error: 'doc not found' });
  const src = snap.data()!;

  try {
    const fields = { title: src.title, description: src.description, body: src.body };
    const translations: Record<string, typeof fields> = {};
    for (const lang of ['en', 'ja'] as const) {
      translations[lang] = {
        title: await translate(fields.title, lang),
        description: await translate(fields.description, lang),
        body: await translate(fields.body, lang),
      };
    }
    await ref.update({ translations });
    return json(200, { ok: true, translations });
  } catch (err) {
    console.error('translate failed:', err);
    return json(502, { error: 'translation failed' });
  }
};
