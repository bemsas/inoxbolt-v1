import { sql } from '@vercel/postgres';

/**
 * Quote database types and operations for the InoxBolt platform.
 */

// Quote status enum
export type QuoteStatus = 'pending' | 'in_review' | 'quoted' | 'accepted' | 'rejected' | 'cancelled';

// Quote urgency enum
export type QuoteUrgency = 'normal' | 'urgent' | 'critical';

// Quote language enum
export type QuoteLanguage = 'es' | 'en' | 'de' | 'fr';

// Quote database interface
export interface Quote {
  id: string;
  company_name: string;
  tax_id: string;
  company_type: string | null;
  website: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  preferred_language: QuoteLanguage;
  delivery_country: string | null;
  delivery_region: string | null;
  postal_code: string | null;
  quote_content: string;
  file_urls: string[] | null;
  urgency: QuoteUrgency;
  status: QuoteStatus;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: Date;
  updated_at: Date;
  responded_at: Date | null;
}

// Quote creation data
export interface CreateQuoteData {
  companyName: string;
  taxId: string;
  companyType?: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredLanguage?: QuoteLanguage;
  deliveryCountry?: string;
  deliveryRegion?: string;
  postalCode?: string;
  quoteContent: string;
  fileUrls?: string[];
  urgency?: QuoteUrgency;
}

// Quote update data
export interface UpdateQuoteData {
  status?: QuoteStatus;
  adminNotes?: string;
  assignedTo?: string;
}

/**
 * Create a new quote in the database.
 */
export async function createQuote(data: CreateQuoteData): Promise<Quote> {
  const fileUrlsArray = data.fileUrls && data.fileUrls.length > 0
    ? `{${data.fileUrls.map(u => `"${u.replace(/"/g, '\\"')}"`).join(',')}}`
    : null;

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
      ${data.companyName},
      ${data.taxId},
      ${data.companyType || null},
      ${data.website || null},
      ${data.contactName},
      ${data.contactEmail},
      ${data.contactPhone || null},
      ${data.preferredLanguage || 'es'},
      ${data.deliveryCountry || null},
      ${data.deliveryRegion || null},
      ${data.postalCode || null},
      ${data.quoteContent},
      ${fileUrlsArray}::text[],
      ${data.urgency || 'normal'},
      'pending'
    )
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * Get a quote by ID.
 */
export async function getQuote(id: string): Promise<Quote | null> {
  const result = await sql<Quote>`
    SELECT * FROM quotes WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

/**
 * List quotes with optional filtering.
 */
export async function listQuotes(options?: {
  status?: QuoteStatus;
  urgency?: QuoteUrgency;
  limit?: number;
  offset?: number;
}): Promise<{ quotes: Quote[]; total: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let quotes;
  if (options?.status && options?.urgency) {
    quotes = await sql<Quote>`
      SELECT * FROM quotes
      WHERE status = ${options.status} AND urgency = ${options.urgency}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (options?.status) {
    quotes = await sql<Quote>`
      SELECT * FROM quotes
      WHERE status = ${options.status}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (options?.urgency) {
    quotes = await sql<Quote>`
      SELECT * FROM quotes
      WHERE urgency = ${options.urgency}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    quotes = await sql<Quote>`
      SELECT * FROM quotes
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const countResult = await sql`SELECT COUNT(*) as total FROM quotes`;
  const total = parseInt(countResult.rows[0].total, 10);

  return { quotes: quotes.rows, total };
}

/**
 * Update a quote.
 */
export async function updateQuote(id: string, data: UpdateQuoteData): Promise<Quote | null> {
  // Build dynamic update query
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (data.status !== undefined) {
    updates.push('status');
    values.push(data.status);
  }
  if (data.adminNotes !== undefined) {
    updates.push('admin_notes');
    values.push(data.adminNotes);
  }
  if (data.assignedTo !== undefined) {
    updates.push('assigned_to');
    values.push(data.assignedTo);
  }

  if (updates.length === 0) {
    return getQuote(id);
  }

  // For simplicity, handle each field separately
  if (data.status !== undefined) {
    await sql`UPDATE quotes SET status = ${data.status} WHERE id = ${id}`;
  }
  if (data.adminNotes !== undefined) {
    await sql`UPDATE quotes SET admin_notes = ${data.adminNotes} WHERE id = ${id}`;
  }
  if (data.assignedTo !== undefined) {
    await sql`UPDATE quotes SET assigned_to = ${data.assignedTo} WHERE id = ${id}`;
  }

  // If status is changing to 'quoted', 'accepted', or 'rejected', set responded_at
  if (data.status && ['quoted', 'accepted', 'rejected'].includes(data.status)) {
    await sql`UPDATE quotes SET responded_at = NOW() WHERE id = ${id} AND responded_at IS NULL`;
  }

  return getQuote(id);
}

/**
 * Delete a quote.
 */
export async function deleteQuote(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM quotes WHERE id = ${id}`;
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Get quote statistics.
 */
export async function getQuoteStats(): Promise<{
  total: number;
  pending: number;
  inReview: number;
  quoted: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  urgentPending: number;
  criticalPending: number;
}> {
  const total = await sql`SELECT COUNT(*) as count FROM quotes`;
  const pending = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'`;
  const inReview = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'in_review'`;
  const quoted = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'quoted'`;
  const accepted = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'accepted'`;
  const rejected = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'rejected'`;
  const cancelled = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'cancelled'`;
  const urgentPending = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'pending' AND urgency = 'urgent'`;
  const criticalPending = await sql`SELECT COUNT(*) as count FROM quotes WHERE status = 'pending' AND urgency = 'critical'`;

  return {
    total: Number(total.rows[0].count),
    pending: Number(pending.rows[0].count),
    inReview: Number(inReview.rows[0].count),
    quoted: Number(quoted.rows[0].count),
    accepted: Number(accepted.rows[0].count),
    rejected: Number(rejected.rows[0].count),
    cancelled: Number(cancelled.rows[0].count),
    urgentPending: Number(urgentPending.rows[0].count),
    criticalPending: Number(criticalPending.rows[0].count),
  };
}

/**
 * Search quotes by company name or email.
 */
export async function searchQuotes(query: string, limit: number = 20): Promise<Quote[]> {
  const searchPattern = `%${query}%`;
  const result = await sql<Quote>`
    SELECT * FROM quotes
    WHERE company_name ILIKE ${searchPattern}
       OR contact_email ILIKE ${searchPattern}
       OR contact_name ILIKE ${searchPattern}
       OR tax_id ILIKE ${searchPattern}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}
