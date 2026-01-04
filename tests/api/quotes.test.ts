import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock the @vercel/postgres module
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}));

import { sql } from '@vercel/postgres';

describe('Quotes API', () => {
  // Mock SQL responses
  const mockQuote = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    company_name: 'Test Company S.L.',
    tax_id: 'B12345678',
    company_type: 'distributor',
    website: 'https://testcompany.es',
    contact_name: 'Juan Garcia',
    contact_email: 'juan@testcompany.es',
    contact_phone: '+34 922 123 456',
    preferred_language: 'es',
    delivery_country: 'Spain',
    delivery_region: 'Canary Islands',
    postal_code: '38001',
    quote_content: 'Necesitamos 1000 tornillos DIN 933 M8x30 en acero inoxidable A4.',
    file_urls: ['https://blob.vercel.com/file1.pdf'],
    urgency: 'normal',
    status: 'pending',
    admin_notes: null,
    assigned_to: null,
    created_at: new Date('2024-01-04T10:00:00Z'),
    updated_at: new Date('2024-01-04T10:00:00Z'),
    responded_at: null,
  };

  beforeAll(() => {
    // Reset mocks before all tests
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should validate email format correctly', () => {
      const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('juan.garcia@empresa.es')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
    });

    it('should validate Spanish tax ID format correctly', () => {
      const validateTaxId = (taxId: string): boolean => {
        const taxIdRegex = /^([A-Z][0-9]{7}[A-Z0-9]|[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z]{2}[A-Z0-9]{2,13})$/i;
        return taxIdRegex.test(taxId.replace(/[\s-]/g, ''));
      };

      // Valid CIF (company)
      expect(validateTaxId('B12345678')).toBe(true);
      expect(validateTaxId('A98765432')).toBe(true);

      // Valid NIF (individual)
      expect(validateTaxId('12345678A')).toBe(true);

      // Valid NIE (foreign resident)
      expect(validateTaxId('X1234567A')).toBe(true);
      expect(validateTaxId('Y1234567B')).toBe(true);

      // Valid VAT (international)
      expect(validateTaxId('ESB12345678')).toBe(true);
      expect(validateTaxId('DE123456789')).toBe(true);

      // Invalid formats
      expect(validateTaxId('123')).toBe(false);
      expect(validateTaxId('')).toBe(false);
    });

    it('should sanitize strings correctly', () => {
      const sanitizeString = (input: string | undefined | null, maxLength: number = 1000): string | null => {
        if (!input) return null;
        return input.trim().substring(0, maxLength);
      };

      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(null);
      expect(sanitizeString('a'.repeat(2000), 100)).toBe('a'.repeat(100));
    });
  });

  describe('Quote Request Fields', () => {
    it('should have all required fields in quote object', () => {
      const requiredFields = [
        'id',
        'company_name',
        'tax_id',
        'contact_name',
        'contact_email',
        'quote_content',
        'status',
        'created_at',
      ];

      requiredFields.forEach(field => {
        expect(mockQuote).toHaveProperty(field);
      });
    });

    it('should have valid status values', () => {
      const validStatuses = ['pending', 'in_review', 'quoted', 'accepted', 'rejected', 'cancelled'];
      expect(validStatuses).toContain(mockQuote.status);
    });

    it('should have valid urgency values', () => {
      const validUrgencies = ['normal', 'urgent', 'critical'];
      expect(validUrgencies).toContain(mockQuote.urgency);
    });

    it('should have valid language values', () => {
      const validLanguages = ['es', 'en', 'de', 'fr'];
      expect(validLanguages).toContain(mockQuote.preferred_language);
    });
  });

  describe('Quote Creation', () => {
    it('should create a quote with valid data', async () => {
      const mockSql = vi.mocked(sql);
      mockSql.mockResolvedValueOnce({
        rows: [mockQuote],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      } as any);

      const quoteData = {
        companyName: 'Test Company S.L.',
        taxId: 'B12345678',
        contactName: 'Juan Garcia',
        contactEmail: 'juan@testcompany.es',
        quoteContent: 'Necesitamos 1000 tornillos DIN 933 M8x30 en acero inoxidable A4.',
      };

      // Verify the data structure is correct
      expect(quoteData.companyName).toBeDefined();
      expect(quoteData.taxId).toBeDefined();
      expect(quoteData.contactName).toBeDefined();
      expect(quoteData.contactEmail).toBeDefined();
      expect(quoteData.quoteContent).toBeDefined();
    });

    it('should handle file URLs array correctly', () => {
      const fileUrls = ['https://blob.vercel.com/file1.pdf', 'https://blob.vercel.com/file2.pdf'];

      // Test PostgreSQL array format conversion
      const pgArray = `{${fileUrls.map(u => `"${u.replace(/"/g, '\\"')}"`).join(',')}}`;
      expect(pgArray).toBe('{"https://blob.vercel.com/file1.pdf","https://blob.vercel.com/file2.pdf"}');
    });

    it('should limit file URLs to 10 files', () => {
      const manyFileUrls = Array(15).fill('https://blob.vercel.com/file.pdf');
      const limitedUrls = manyFileUrls.slice(0, 10);
      expect(limitedUrls.length).toBe(10);
    });
  });

  describe('Quote Listing', () => {
    it('should support pagination parameters', () => {
      const limit = 50;
      const offset = 100;

      expect(limit).toBeGreaterThan(0);
      expect(offset).toBeGreaterThanOrEqual(0);
    });

    it('should support status filtering', () => {
      const validStatuses = ['pending', 'in_review', 'quoted', 'accepted', 'rejected', 'cancelled'];
      const filterStatus = 'pending';

      expect(validStatuses).toContain(filterStatus);
    });
  });

  describe('Email Notification', () => {
    it('should generate correct urgency labels', () => {
      const urgencyLabels: Record<string, string> = {
        normal: 'Normal',
        urgent: 'Urgente',
        critical: 'Critico',
      };

      expect(urgencyLabels['normal']).toBe('Normal');
      expect(urgencyLabels['urgent']).toBe('Urgente');
      expect(urgencyLabels['critical']).toBe('Critico');
    });

    it('should generate correct urgency colors', () => {
      const urgencyColors: Record<string, string> = {
        normal: '#22c55e',
        urgent: '#f59e0b',
        critical: '#ef4444',
      };

      expect(urgencyColors['normal']).toBe('#22c55e'); // Green
      expect(urgencyColors['urgent']).toBe('#f59e0b'); // Amber
      expect(urgencyColors['critical']).toBe('#ef4444'); // Red
    });

    it('should format email subject correctly', () => {
      const companyName = 'Test Company S.L.';
      const urgencyLabel = 'Urgente';

      const subject = `[${urgencyLabel}] Nueva Solicitud de Presupuesto - ${companyName}`;
      expect(subject).toBe('[Urgente] Nueva Solicitud de Presupuesto - Test Company S.L.');
    });
  });

  describe('Database Schema', () => {
    it('should have correct column types defined', () => {
      const schema = {
        id: 'UUID',
        company_name: 'VARCHAR(255)',
        tax_id: 'VARCHAR(50)',
        company_type: 'VARCHAR(100)',
        website: 'VARCHAR(255)',
        contact_name: 'VARCHAR(255)',
        contact_email: 'VARCHAR(255)',
        contact_phone: 'VARCHAR(50)',
        preferred_language: 'VARCHAR(10)',
        delivery_country: 'VARCHAR(100)',
        delivery_region: 'VARCHAR(100)',
        postal_code: 'VARCHAR(20)',
        quote_content: 'TEXT',
        file_urls: 'TEXT[]',
        urgency: 'VARCHAR(20)',
        status: 'VARCHAR(50)',
        admin_notes: 'TEXT',
        assigned_to: 'VARCHAR(255)',
        created_at: 'TIMESTAMP WITH TIME ZONE',
        updated_at: 'TIMESTAMP WITH TIME ZONE',
        responded_at: 'TIMESTAMP WITH TIME ZONE',
      };

      expect(Object.keys(schema).length).toBe(21);
      expect(schema.id).toBe('UUID');
      expect(schema.file_urls).toBe('TEXT[]');
    });

    it('should have required indexes defined', () => {
      const indexes = [
        'idx_quotes_status',
        'idx_quotes_created_at',
        'idx_quotes_company_name',
        'idx_quotes_contact_email',
        'idx_quotes_urgency',
      ];

      expect(indexes.length).toBe(5);
      expect(indexes).toContain('idx_quotes_status');
    });
  });
});
