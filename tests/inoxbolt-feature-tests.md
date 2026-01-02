# Inoxbolt Feature Test Suite

## Overview
Comprehensive test checklist for the Inoxbolt B2B fastener website with Vector RAG capabilities.

---

## 1. Core Website Tests

### 1.1 Homepage (`/`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| HOME-001 | Homepage loads successfully | Page renders without errors, status 200 | [ ] |
| HOME-002 | Navbar renders correctly | Logo, navigation links, search bar visible | [ ] |
| HOME-003 | Hero section displays | Hero text, CTA button, images load | [ ] |
| HOME-004 | ValueProps section renders | All value proposition cards display | [ ] |
| HOME-005 | LogisticsInfo section renders | Logistics information displays correctly | [ ] |
| HOME-006 | Suppliers section renders | Supplier logos and information display | [ ] |
| HOME-007 | Catalogues section renders | PDF catalogue links display | [ ] |
| HOME-008 | Contact section renders | Contact form and information display | [ ] |
| HOME-009 | Footer renders | Footer links and copyright display | [ ] |
| HOME-010 | Mobile responsive | All sections adapt to mobile viewport | [ ] |

### 1.2 Language Switching
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| LANG-001 | English is default language | Page loads in English | [ ] |
| LANG-002 | Switch to Spanish | All text changes to Spanish | [ ] |
| LANG-003 | Language persists | Selected language persists on navigation | [ ] |
| LANG-004 | Language selector visible | Language toggle in navbar works | [ ] |

### 1.3 Early Access Modal
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| MODAL-001 | Modal opens on CTA click | Modal appears with form | [ ] |
| MODAL-002 | Modal closes on X button | Modal dismisses correctly | [ ] |
| MODAL-003 | Modal closes on backdrop click | Modal dismisses on outside click | [ ] |
| MODAL-004 | Form validation works | Required fields show errors | [ ] |

---

## 2. Admin Panel Tests (`/admin`)

### 2.1 Admin Page Access
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| ADMIN-001 | Admin page loads | `/admin` route renders admin UI | [ ] |
| ADMIN-002 | Stats dashboard displays | Document counts and stats visible | [ ] |
| ADMIN-003 | Document table renders | Table with headers displays | [ ] |
| ADMIN-004 | Empty state shown | Appropriate message when no docs | [ ] |

### 2.2 Document Upload
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| UPLOAD-001 | Upload form visible | File input and supplier field display | [ ] |
| UPLOAD-002 | PDF file accepts | PDF files can be selected | [ ] |
| UPLOAD-003 | Non-PDF rejected | Error shown for non-PDF files | [ ] |
| UPLOAD-004 | Large file rejected | Error shown for files > 50MB | [ ] |
| UPLOAD-005 | Upload success | Document uploads, success message shown | [ ] |
| UPLOAD-006 | Document appears in list | New document shows in table | [ ] |
| UPLOAD-007 | Status shows pending | Initial status is "pending" | [ ] |
| UPLOAD-008 | Supplier field saves | Supplier name stored with document | [ ] |

### 2.3 Document Management
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| DOC-001 | Document delete works | Document removed from list | [ ] |
| DOC-002 | Delete confirmation | Confirmation before delete | [ ] |
| DOC-003 | Reindex button works | Reindex triggers, status changes | [ ] |
| DOC-004 | Status updates | Status changes from pending→processing→completed | [ ] |
| DOC-005 | Error status displays | Failed documents show error | [ ] |

---

## 3. API Endpoint Tests

### 3.1 Documents API (`/api/admin/documents`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| API-DOC-001 | GET returns documents | JSON array of documents returned | [ ] |
| API-DOC-002 | GET returns stats | Stats object included in response | [ ] |
| API-DOC-003 | POST uploads file | File stored in Blob, record created | [ ] |
| API-DOC-004 | POST validates PDF type | 400 error for non-PDF | [ ] |
| API-DOC-005 | POST validates file size | 400 error for oversized files | [ ] |
| API-DOC-006 | CORS headers present | Access-Control headers set | [ ] |

### 3.2 Document Detail API (`/api/admin/document`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| API-DET-001 | GET returns document | Document details returned | [ ] |
| API-DET-002 | GET 404 for invalid ID | 404 for non-existent document | [ ] |
| API-DET-003 | DELETE removes document | Document deleted from DB and Blob | [ ] |
| API-DET-004 | POST reindex triggers | Document status reset, reprocessing starts | [ ] |

### 3.3 Search API (`/api/search`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| API-SRCH-001 | POST searches content | Vector search returns results | [ ] |
| API-SRCH-002 | Query validation | 400 for query < 2 chars | [ ] |
| API-SRCH-003 | Results have scores | Similarity scores included | [ ] |
| API-SRCH-004 | Results have snippets | Content snippets included | [ ] |
| API-SRCH-005 | Supplier filter works | Results filtered by supplier | [ ] |
| API-SRCH-006 | Threshold filter works | Low-score results excluded | [ ] |

### 3.4 Chat API (`/api/chat`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| API-CHAT-001 | POST returns stream | Streaming response returned | [ ] |
| API-CHAT-002 | Session ID created | X-Session-Id header returned | [ ] |
| API-CHAT-003 | Sources included | X-Sources header with citations | [ ] |
| API-CHAT-004 | Message validation | 400 for empty message | [ ] |
| API-CHAT-005 | Context retrieval works | RAG context from chunks used | [ ] |
| API-CHAT-006 | History maintained | Previous messages in context | [ ] |

### 3.5 Database Init API (`/api/admin/init-db`)
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| API-INIT-001 | POST creates tables | All tables created successfully | [ ] |
| API-INIT-002 | Auth required | 401 without correct secret | [ ] |
| API-INIT-003 | Idempotent | Can run multiple times safely | [ ] |

---

## 4. RAG System Tests

### 4.1 Search Functionality
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| RAG-SRCH-001 | Search bar accepts input | Text input works | [ ] |
| RAG-SRCH-002 | Debounced search | Search triggers after typing stops | [ ] |
| RAG-SRCH-003 | Results dropdown shows | Results display below search bar | [ ] |
| RAG-SRCH-004 | Results clickable | Clicking result navigates/shows detail | [ ] |
| RAG-SRCH-005 | Empty results handled | "No results" message shown | [ ] |
| RAG-SRCH-006 | Loading state shown | Spinner during search | [ ] |

### 4.2 Chat Widget
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| RAG-CHAT-001 | Chat button visible | Floating button in bottom-right | [ ] |
| RAG-CHAT-002 | Chat panel opens | Panel slides in on click | [ ] |
| RAG-CHAT-003 | Chat panel closes | Panel closes on X or backdrop | [ ] |
| RAG-CHAT-004 | Message input works | Can type in chat input | [ ] |
| RAG-CHAT-005 | Send message | Message appears in chat | [ ] |
| RAG-CHAT-006 | Response streams | AI response streams word-by-word | [ ] |
| RAG-CHAT-007 | Sources displayed | Citation links shown with response | [ ] |
| RAG-CHAT-008 | Chat history shown | Previous messages visible | [ ] |
| RAG-CHAT-009 | Clear chat works | Chat history cleared | [ ] |

### 4.3 PDF Processing
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| RAG-PDF-001 | PDF text extracted | Text content parsed from PDF | [ ] |
| RAG-PDF-002 | Text chunked | Content split into chunks | [ ] |
| RAG-PDF-003 | Embeddings generated | Vector embeddings created | [ ] |
| RAG-PDF-004 | Chunks stored | Chunks saved to database | [ ] |
| RAG-PDF-005 | Page numbers tracked | Chunk page numbers preserved | [ ] |
| RAG-PDF-006 | Status updated | Document status changes correctly | [ ] |

---

## 5. Database Tests

### 5.1 Tables Exist
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| DB-001 | documents table exists | Table queryable | [ ] |
| DB-002 | chunks table exists | Table queryable | [ ] |
| DB-003 | processing_jobs table exists | Table queryable | [ ] |
| DB-004 | chat_sessions table exists | Table queryable | [ ] |
| DB-005 | chat_messages table exists | Table queryable | [ ] |
| DB-006 | pgvector extension enabled | Vector operations work | [ ] |

### 5.2 Data Integrity
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| DB-INT-001 | Document cascade delete | Deleting doc removes chunks | [ ] |
| DB-INT-002 | Session cascade delete | Deleting session removes messages | [ ] |
| DB-INT-003 | Foreign keys enforced | Invalid references rejected | [ ] |

---

## 6. Integration Tests

### 6.1 End-to-End Upload Flow
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| E2E-001 | Upload → Processing → Complete | Full upload flow works | [ ] |
| E2E-002 | Upload → Search finds content | Uploaded PDF searchable | [ ] |
| E2E-003 | Upload → Chat answers about content | Chat uses uploaded PDF | [ ] |

### 6.2 End-to-End Search Flow
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| E2E-SRCH-001 | Type query → Get results → View detail | Search flow complete | [ ] |

### 6.3 End-to-End Chat Flow
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| E2E-CHAT-001 | Open chat → Ask question → Get answer | Chat flow complete | [ ] |
| E2E-CHAT-002 | Multi-turn conversation | Follow-up questions work | [ ] |

---

## 7. Performance Tests

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| PERF-001 | Homepage loads < 3s | LCP under 3 seconds | [ ] |
| PERF-002 | Search response < 2s | API returns in 2 seconds | [ ] |
| PERF-003 | Chat first token < 1s | Streaming starts quickly | [ ] |
| PERF-004 | Admin list loads < 2s | Document list renders fast | [ ] |

---

## 8. Error Handling Tests

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| ERR-001 | 404 page for invalid routes | Friendly 404 page shown | [ ] |
| ERR-002 | API errors return JSON | Error responses have structure | [ ] |
| ERR-003 | Network error handling | User-friendly error messages | [ ] |
| ERR-004 | Upload failure recovery | Can retry after failure | [ ] |

---

## Running Tests with Claude-Flow

### Verification Check
```bash
npx claude-flow@alpha verify check --threshold 0.95
```

### Truth Score
```bash
npx claude-flow@alpha truth --format table
```

### Generate Report
```bash
npx claude-flow@alpha verify report --format html --export test-report.html
```

---

## Test Environment Requirements

- **Database**: Vercel Postgres with pgvector
- **Blob Storage**: Vercel Blob configured
- **API Keys**: OpenAI, Inngest configured
- **Test Data**: Sample PDF documents for upload testing
