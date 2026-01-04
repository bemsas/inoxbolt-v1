import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

// Quote request interface
interface QuoteRequest {
  // Company information
  companyName: string;
  taxId: string;
  companyType?: string;
  website?: string;

  // Contact information
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredLanguage?: 'es' | 'en' | 'de' | 'fr';

  // Delivery information
  deliveryCountry?: string;
  deliveryRegion?: string;
  postalCode?: string;

  // Quote details
  quoteContent: string;
  fileUrls?: string[];
  urgency?: 'normal' | 'urgent' | 'critical';
}

// Database quote type
interface Quote {
  id: string;
  company_name: string;
  tax_id: string;
  company_type: string | null;
  website: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  preferred_language: string;
  delivery_country: string | null;
  delivery_region: string | null;
  postal_code: string | null;
  quote_content: string;
  file_urls: string[] | null;
  urgency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateTaxId(taxId: string): boolean {
  // Spanish CIF/NIF/VAT validation (basic format check)
  // CIF: Letter + 7 digits + control digit/letter (e.g., A12345678)
  // NIF: 8 digits + letter or letter + 7 digits + letter (e.g., 12345678A, X1234567A)
  // VAT: Country code + number (e.g., ES12345678A)
  const taxIdRegex = /^([A-Z][0-9]{7}[A-Z0-9]|[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z]{2}[A-Z0-9]{2,13})$/i;
  return taxIdRegex.test(taxId.replace(/[\s-]/g, ''));
}

function sanitizeString(input: string | undefined | null, maxLength: number = 1000): string | null {
  if (!input) return null;
  return input.trim().substring(0, maxLength);
}

// Email notification function
async function sendQuoteNotification(quote: Quote): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured - skipping email notification');
    return false;
  }

  const urgencyColors: Record<string, string> = {
    normal: '#22c55e',
    urgent: '#f59e0b',
    critical: '#ef4444',
  };

  const urgencyLabels: Record<string, string> = {
    normal: 'Normal',
    urgent: 'Urgente',
    critical: 'Critico',
  };

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .field { margin-bottom: 12px; }
    .field-label { font-weight: 600; color: #475569; }
    .field-value { color: #1e293b; }
    .quote-content { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }
    .urgency-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: white; }
    .footer { background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px; text-align: center; }
    .files-list { list-style: none; padding: 0; }
    .files-list li { padding: 8px 12px; background: white; margin-bottom: 4px; border-radius: 4px; border: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nueva Solicitud de Presupuesto</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">InoxBolt - Plataforma de Fijaciones Industriales</p>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Informacion de la Empresa</div>
        <div class="field">
          <span class="field-label">Empresa:</span>
          <span class="field-value">${quote.company_name}</span>
        </div>
        <div class="field">
          <span class="field-label">CIF/NIF/VAT:</span>
          <span class="field-value">${quote.tax_id}</span>
        </div>
        ${quote.company_type ? `<div class="field"><span class="field-label">Tipo de Empresa:</span> <span class="field-value">${quote.company_type}</span></div>` : ''}
        ${quote.website ? `<div class="field"><span class="field-label">Web:</span> <span class="field-value"><a href="${quote.website}">${quote.website}</a></span></div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Informacion de Contacto</div>
        <div class="field">
          <span class="field-label">Nombre:</span>
          <span class="field-value">${quote.contact_name}</span>
        </div>
        <div class="field">
          <span class="field-label">Email:</span>
          <span class="field-value"><a href="mailto:${quote.contact_email}">${quote.contact_email}</a></span>
        </div>
        ${quote.contact_phone ? `<div class="field"><span class="field-label">Telefono:</span> <span class="field-value">${quote.contact_phone}</span></div>` : ''}
        <div class="field">
          <span class="field-label">Idioma preferido:</span>
          <span class="field-value">${quote.preferred_language?.toUpperCase() || 'ES'}</span>
        </div>
      </div>

      ${quote.delivery_country || quote.delivery_region || quote.postal_code ? `
      <div class="section">
        <div class="section-title">Direccion de Entrega</div>
        ${quote.delivery_country ? `<div class="field"><span class="field-label">Pais:</span> <span class="field-value">${quote.delivery_country}</span></div>` : ''}
        ${quote.delivery_region ? `<div class="field"><span class="field-label">Region:</span> <span class="field-value">${quote.delivery_region}</span></div>` : ''}
        ${quote.postal_code ? `<div class="field"><span class="field-label">Codigo Postal:</span> <span class="field-value">${quote.postal_code}</span></div>` : ''}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Detalles del Presupuesto</div>
        <div class="field">
          <span class="field-label">Urgencia:</span>
          <span class="urgency-badge" style="background-color: ${urgencyColors[quote.urgency] || urgencyColors.normal}">
            ${urgencyLabels[quote.urgency] || 'Normal'}
          </span>
        </div>
        <div class="field" style="margin-top: 16px;">
          <span class="field-label">Solicitud:</span>
        </div>
        <div class="quote-content">${quote.quote_content}</div>
      </div>

      ${quote.file_urls && quote.file_urls.length > 0 ? `
      <div class="section">
        <div class="section-title">Archivos Adjuntos</div>
        <ul class="files-list">
          ${quote.file_urls.map((url, i) => `<li><a href="${url}">Archivo ${i + 1}</a></li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>Este mensaje fue generado automaticamente por la plataforma InoxBolt.</p>
      <p>ID de solicitud: ${quote.id}</p>
      <p>Fecha: ${new Date(quote.created_at).toLocaleString('es-ES', { timeZone: 'Atlantic/Canary' })}</p>
    </div>
  </div>
</body>
</html>
`;

  const textBody = `
NUEVA SOLICITUD DE PRESUPUESTO - INOXBOLT

ID: ${quote.id}
Fecha: ${new Date(quote.created_at).toISOString()}

INFORMACION DE LA EMPRESA
-------------------------
Empresa: ${quote.company_name}
CIF/NIF/VAT: ${quote.tax_id}
${quote.company_type ? `Tipo: ${quote.company_type}` : ''}
${quote.website ? `Web: ${quote.website}` : ''}

CONTACTO
--------
Nombre: ${quote.contact_name}
Email: ${quote.contact_email}
${quote.contact_phone ? `Telefono: ${quote.contact_phone}` : ''}
Idioma: ${quote.preferred_language?.toUpperCase() || 'ES'}

${quote.delivery_country || quote.delivery_region || quote.postal_code ? `
DIRECCION DE ENTREGA
--------------------
${quote.delivery_country ? `Pais: ${quote.delivery_country}` : ''}
${quote.delivery_region ? `Region: ${quote.delivery_region}` : ''}
${quote.postal_code ? `Codigo Postal: ${quote.postal_code}` : ''}
` : ''}

DETALLES DEL PRESUPUESTO
------------------------
Urgencia: ${urgencyLabels[quote.urgency] || 'Normal'}

Solicitud:
${quote.quote_content}

${quote.file_urls && quote.file_urls.length > 0 ? `
ARCHIVOS ADJUNTOS
-----------------
${quote.file_urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}
` : ''}
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'InoxBolt <noreply@inoxbolt.es>',
        to: ['enquiries@inoxbolt.es'],
        subject: `[${urgencyLabels[quote.urgency] || 'Normal'}] Nueva Solicitud de Presupuesto - ${quote.company_name}`,
        html: htmlBody,
        text: textBody,
        reply_to: quote.contact_email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Create a new quote request
  if (req.method === 'POST') {
    try {
      const body: QuoteRequest = req.body;

      // Validate required fields
      const errors: string[] = [];

      if (!body.companyName || body.companyName.trim().length < 2) {
        errors.push('Company name is required (minimum 2 characters)');
      }

      if (!body.taxId || !validateTaxId(body.taxId)) {
        errors.push('Valid CIF/NIF/VAT number is required');
      }

      if (!body.contactName || body.contactName.trim().length < 2) {
        errors.push('Contact name is required (minimum 2 characters)');
      }

      if (!body.contactEmail || !validateEmail(body.contactEmail)) {
        errors.push('Valid email address is required');
      }

      if (!body.quoteContent || body.quoteContent.trim().length < 10) {
        errors.push('Quote content is required (minimum 10 characters)');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      // Validate urgency value
      const validUrgencies = ['normal', 'urgent', 'critical'];
      const urgency = validUrgencies.includes(body.urgency || '') ? body.urgency : 'normal';

      // Validate language
      const validLanguages = ['es', 'en', 'de', 'fr'];
      const preferredLanguage = validLanguages.includes(body.preferredLanguage || '') ? body.preferredLanguage : 'es';

      // Sanitize and prepare file URLs
      let fileUrls: string[] | null = null;
      if (body.fileUrls && Array.isArray(body.fileUrls) && body.fileUrls.length > 0) {
        fileUrls = body.fileUrls
          .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
          .slice(0, 10) // Limit to 10 files
          .map(url => url.trim());
      }

      // Insert quote into database
      const result = await sql<Quote>`
        INSERT INTO quotes (
          company_name,
          tax_id,
          company_type,
          website,
          contact_name,
          contact_email,
          contact_phone,
          preferred_language,
          delivery_country,
          delivery_region,
          postal_code,
          quote_content,
          file_urls,
          urgency,
          status
        ) VALUES (
          ${body.companyName.trim()},
          ${body.taxId.trim().toUpperCase()},
          ${sanitizeString(body.companyType, 100)},
          ${sanitizeString(body.website, 255)},
          ${body.contactName.trim()},
          ${body.contactEmail.trim().toLowerCase()},
          ${sanitizeString(body.contactPhone, 50)},
          ${preferredLanguage},
          ${sanitizeString(body.deliveryCountry, 100)},
          ${sanitizeString(body.deliveryRegion, 100)},
          ${sanitizeString(body.postalCode, 20)},
          ${body.quoteContent.trim()},
          ${fileUrls ? `{${fileUrls.map(u => `"${u.replace(/"/g, '\\"')}"`).join(',')}}` : null}::text[],
          ${urgency},
          'pending'
        )
        RETURNING *
      `;

      const quote = result.rows[0];

      // Send email notification (async, don't wait)
      const emailSent = await sendQuoteNotification(quote);

      return res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully',
        quoteId: quote.id,
        emailSent,
        createdAt: quote.created_at,
      });
    } catch (error) {
      console.error('Quote submission error:', error);
      return res.status(500).json({
        error: 'Failed to submit quote request',
        details: String(error),
      });
    }
  }

  // GET: List quotes (admin only - would need auth in production)
  if (req.method === 'GET') {
    try {
      // Check for admin secret (simple auth for now)
      const adminSecret = req.headers['x-admin-secret'];
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { status, limit = '50', offset = '0' } = req.query;

      let quotes;
      if (status && typeof status === 'string') {
        quotes = await sql<Quote>`
          SELECT * FROM quotes
          WHERE status = ${status}
          ORDER BY created_at DESC
          LIMIT ${parseInt(limit as string, 10)}
          OFFSET ${parseInt(offset as string, 10)}
        `;
      } else {
        quotes = await sql<Quote>`
          SELECT * FROM quotes
          ORDER BY created_at DESC
          LIMIT ${parseInt(limit as string, 10)}
          OFFSET ${parseInt(offset as string, 10)}
        `;
      }

      // Get total count
      const countResult = await sql`SELECT COUNT(*) as total FROM quotes`;
      const total = parseInt(countResult.rows[0].total, 10);

      return res.status(200).json({
        quotes: quotes.rows,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      });
    } catch (error) {
      console.error('Quote list error:', error);
      return res.status(500).json({
        error: 'Failed to list quotes',
        details: String(error),
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
