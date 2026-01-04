-- Migration: Create quotes table for InoxBolt quote request system
-- Date: 2024-01-04
-- Description: Creates the quotes table for storing customer quote requests

-- Create quotes table
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
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT quotes_status_check CHECK (status IN ('pending', 'in_review', 'quoted', 'accepted', 'rejected', 'cancelled')),
    CONSTRAINT quotes_urgency_check CHECK (urgency IN ('normal', 'urgent', 'critical')),
    CONSTRAINT quotes_language_check CHECK (preferred_language IN ('es', 'en', 'de', 'fr'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_company_name ON quotes(company_name);
CREATE INDEX IF NOT EXISTS idx_quotes_contact_email ON quotes(contact_email);
CREATE INDEX IF NOT EXISTS idx_quotes_urgency ON quotes(urgency);

-- Create compound index for status + urgency filtering
CREATE INDEX IF NOT EXISTS idx_quotes_status_urgency ON quotes(status, urgency);

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_quotes_search ON quotes USING gin(
    to_tsvector('spanish', coalesce(company_name, '') || ' ' || coalesce(contact_name, '') || ' ' || coalesce(contact_email, ''))
);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_quotes_updated_at ON quotes;
CREATE TRIGGER trigger_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_quotes_updated_at();

-- Add comments for documentation
COMMENT ON TABLE quotes IS 'Stores quote requests from customers';
COMMENT ON COLUMN quotes.tax_id IS 'CIF/NIF/VAT number of the company';
COMMENT ON COLUMN quotes.company_type IS 'Type of company (distributor, manufacturer, etc.)';
COMMENT ON COLUMN quotes.preferred_language IS 'Preferred language for communication (es, en, de, fr)';
COMMENT ON COLUMN quotes.urgency IS 'Urgency level of the quote request (normal, urgent, critical)';
COMMENT ON COLUMN quotes.status IS 'Current status of the quote (pending, in_review, quoted, accepted, rejected, cancelled)';
COMMENT ON COLUMN quotes.file_urls IS 'Array of URLs to uploaded files/documents';
COMMENT ON COLUMN quotes.responded_at IS 'Timestamp when the quote was responded to';
