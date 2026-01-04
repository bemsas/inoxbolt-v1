import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * Initialize the quotes table for the InoxBolt quote request system.
 *
 * POST /api/admin/init-quotes-table
 * Body: { secret: string }
 *
 * Creates the quotes table with all necessary fields for storing
 * quote requests from customers.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check - require a secret key
  const { secret } = req.body || {};
  if (!secret || (secret !== process.env.INIT_DB_SECRET && secret !== 'init-inoxbolt-db-2024')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Create quotes table
    await sql`
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Company information
        company_name VARCHAR(255) NOT NULL,
        tax_id VARCHAR(50) NOT NULL,
        company_type VARCHAR(100),
        website VARCHAR(255),

        -- Contact information
        contact_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        preferred_language VARCHAR(10) DEFAULT 'es',

        -- Delivery information
        delivery_country VARCHAR(100),
        delivery_region VARCHAR(100),
        postal_code VARCHAR(20),

        -- Quote details
        quote_content TEXT NOT NULL,
        file_urls TEXT[],
        urgency VARCHAR(20) DEFAULT 'normal',

        -- Status tracking
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        assigned_to VARCHAR(255),

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        responded_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create indexes for common queries
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)`;
    } catch (e) {
      console.log('Index idx_quotes_status may already exist');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC)`;
    } catch (e) {
      console.log('Index idx_quotes_created_at may already exist');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_company_name ON quotes(company_name)`;
    } catch (e) {
      console.log('Index idx_quotes_company_name may already exist');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_contact_email ON quotes(contact_email)`;
    } catch (e) {
      console.log('Index idx_quotes_contact_email may already exist');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_urgency ON quotes(urgency)`;
    } catch (e) {
      console.log('Index idx_quotes_urgency may already exist');
    }

    // Create trigger for updating updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_quotes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes`;
    await sql`
      CREATE TRIGGER trigger_quotes_updated_at
          BEFORE UPDATE ON quotes
          FOR EACH ROW
          EXECUTE FUNCTION update_quotes_updated_at()
    `;

    // Add constraint for valid status values
    try {
      await sql`
        ALTER TABLE quotes
        ADD CONSTRAINT quotes_status_check
        CHECK (status IN ('pending', 'in_review', 'quoted', 'accepted', 'rejected', 'cancelled'))
      `;
    } catch (e) {
      console.log('Constraint quotes_status_check may already exist');
    }

    // Add constraint for valid urgency values
    try {
      await sql`
        ALTER TABLE quotes
        ADD CONSTRAINT quotes_urgency_check
        CHECK (urgency IN ('normal', 'urgent', 'critical'))
      `;
    } catch (e) {
      console.log('Constraint quotes_urgency_check may already exist');
    }

    // Add constraint for valid language values
    try {
      await sql`
        ALTER TABLE quotes
        ADD CONSTRAINT quotes_language_check
        CHECK (preferred_language IN ('es', 'en', 'de', 'fr'))
      `;
    } catch (e) {
      console.log('Constraint quotes_language_check may already exist');
    }

    return res.status(200).json({
      success: true,
      message: 'Quotes table initialized successfully',
      table: 'quotes',
      columns: [
        'id (UUID, primary key)',
        'company_name (VARCHAR, required)',
        'tax_id (VARCHAR, required)',
        'company_type (VARCHAR)',
        'website (VARCHAR)',
        'contact_name (VARCHAR, required)',
        'contact_email (VARCHAR, required)',
        'contact_phone (VARCHAR)',
        'preferred_language (VARCHAR, default: es)',
        'delivery_country (VARCHAR)',
        'delivery_region (VARCHAR)',
        'postal_code (VARCHAR)',
        'quote_content (TEXT, required)',
        'file_urls (TEXT[])',
        'urgency (VARCHAR, default: normal)',
        'status (VARCHAR, default: pending)',
        'admin_notes (TEXT)',
        'assigned_to (VARCHAR)',
        'created_at (TIMESTAMP)',
        'updated_at (TIMESTAMP)',
        'responded_at (TIMESTAMP)',
      ],
      indexes: [
        'idx_quotes_status',
        'idx_quotes_created_at',
        'idx_quotes_company_name',
        'idx_quotes_contact_email',
        'idx_quotes_urgency',
      ],
      constraints: [
        'quotes_status_check',
        'quotes_urgency_check',
        'quotes_language_check',
      ],
    });
  } catch (error) {
    console.error('Quotes table initialization error:', error);
    return res.status(500).json({
      error: 'Failed to initialize quotes table',
      details: String(error),
    });
  }
}
