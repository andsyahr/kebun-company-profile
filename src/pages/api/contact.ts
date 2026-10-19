import type { APIRoute } from 'astro'
import nodemailer from 'nodemailer'

export const prerender = false

const LIMITS: Record<string, number> = {
  category: 100,
  name: 100,
  company: 100,
  email: 200,
  phone: 50,
  message: 5000
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: import.meta.env.AUTH_EMAIL,
    clientId: import.meta.env.AUTH_CLIENT_ID,
    clientSecret: import.meta.env.AUTH_CLIENT_SECRET,
    refreshToken: import.meta.env.AUTH_REFRESH_TOKEN
  }
})

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function buildHtml(f: {
  category: string
  name: string
  company: string
  email: string
  phone: string
  message: string
}) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td>` +
    `<td style="padding:6px 0;font-size:14px;color:#111827">${value}</td></tr>`
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:20px;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e5e2da;border-radius:12px;overflow:hidden">
  <div style="background:#05384a;padding:10px 10px 5px 10px">
        <div style="width:120px;height:auto;margin: 0 auto">
          <img src="https://kebun.tech/logo.png" alt="PT Kebun Teknologi Indonesia" style="width:100%;height:auto;">
        </div>
      </div>
  <div style="padding:24px">
    <table style="border-collapse:collapse">${[
      row('Jenis', esc(f.category)),
      row('Nama', esc(f.name)),
      f.company && row('Perusahaan', esc(f.company)),
      row(
        'Email',
        `<a href="mailto:${esc(f.email)}" style="color:#074457">${esc(f.email)}</a>`
      ),
      f.phone && row('Telp/WA', esc(f.phone))
    ]
      .filter(Boolean)
      .join('')}</table>
    <div style="margin-top:16px;padding:16px;background:#f9f8f4;border-left:3px solid #05384a;border-radius:0 8px 8px 0;font-size:14px;color:#111827;white-space:pre-wrap">${esc(f.message)}</div>
  </div>
  <div style="padding:12px 24px;border-top:1px solid #e5e2da;font-size:12px;color:#9ca3af">Dikirim otomatis dari kebun.tech</div>
</div>
</body></html>`
}

const json = (status: number, error?: string) =>
  new Response(JSON.stringify(error ? { error } : { ok: true }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>
  try {
    data = await request.json()
  } catch {
    return json(400, 'invalid JSON')
  }

  // Honeypot terisi → bot; pura-pura sukses
  if (typeof data.website === 'string' && data.website) return json(200)

  const field = (key: string) =>
    typeof data[key] === 'string'
      ? (data[key] as string).trim().slice(0, LIMITS[key])
      : ''
  const category = field('category')
  const name = field('name')
  const company = field('company')
  const email = field('email')
  const phone = field('phone')
  const message = field('message')

  if (!category || !name || !message || !EMAIL_RE.test(email)) {
    return json(400, 'missing or invalid fields')
  }

  try {
    await transporter.sendMail({
      from: `Website kebun.tech <${import.meta.env.AUTH_EMAIL}>`,
      to: import.meta.env.CONTACT_TO,
      replyTo: email,
      subject: `[Contact] ${category} — ${name}`,
      html: buildHtml({ category, name, company, email, phone, message }),
      text: [
        `Jenis: ${category}`,
        `Nama: ${name}`,
        company && `Perusahaan: ${company}`,
        `Email: ${email}`,
        phone && `Telp/WA: ${phone}`,
        '',
        message
      ]
        .filter(Boolean)
        .join('\n')
    })
    return json(200)
  } catch (err) {
    console.error('contact send failed:', err)
    return json(500, 'send failed')
  }
}
