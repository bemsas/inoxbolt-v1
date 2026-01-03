# InoxBolt Search Page - UX Design Specification

## Document Information
- **Version**: 1.0
- **Created**: 2026-01-03
- **Target Users**: Industrial buyers, engineers, procurement teams
- **Languages**: English (EN) / Spanish (ES)

---

## 1. Page Layout Wireframe

### Desktop Layout (1440px+)

```
+-----------------------------------------------------------------------------------+
|  [Logo]    [Catalogues]  [Contact]                      [EN|ES]  [Theme Toggle]   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                                                                   |
|                     FIND YOUR FASTENERS                                           |
|               Over 2 million items from trusted suppliers                         |
|                                                                                   |
|    +-----------------------------------------------------------------------+      |
|    |  [Search Icon]  Search by product, DIN/ISO code, material...    [X]  |      |
|    +-----------------------------------------------------------------------+      |
|    |  [M8]  [DIN 933]  [A2 Stainless]  [Hex Bolt]  [Clear All]            |      |
|    +-----------------------------------------------------------------------+      |
|                                                                                   |
|    +-- Recent Searches --+  +-- Popular Categories --+                           |
|    | M8x30 hex bolt      |  | [Bolt] [Screw] [Nut]  |                           |
|    | DIN 934 A4          |  | [Washer] [Anchor]     |                           |
|    | ISO 4017 M10        |  |                       |                           |
|    +---------------------+  +-----------------------+                           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-------------+  +-----------------------------------------------------------+   |
|  | FILTERS     |  |  Results (247 items)              [List|Grid] [Sort v]   |   |
|  |             |  +-----------------------------------------------------------+   |
|  | > Category  |  |                                                          |   |
|  |   [x] Bolts |  |  +------------------------+  +------------------------+  |   |
|  |   [ ] Screws|  |  | DIN 933 Hex Bolt       |  | ISO 4017 Hex Cap Screw |  |   |
|  |   [ ] Nuts  |  |  | M8x30 | A2-70          |  | M10x40 | A4-80         |  |   |
|  |   [ ] Wash..|  |  | REYHER | p.45          |  | KLIMAS | p.127         |  |   |
|  |             |  |  | [Inquire] [AI ?]       |  | [Inquire] [AI ?]       |  |   |
|  | > Material  |  |  +------------------------+  +------------------------+  |   |
|  |   [x] A2    |  |                                                          |   |
|  |   [ ] A4    |  |  +------------------------+  +------------------------+  |   |
|  |   [ ] 8.8   |  |  | DIN 931 Hex Bolt       |  | DIN 912 Socket Cap     |  |   |
|  |             |  |  | M8x50 | A2-70          |  | M8x25 | 12.9           |  |   |
|  | > Standard  |  |  | BOSSARD | p.89         |  | REYHER | p.203         |  |   |
|  |   [x] DIN   |  |  | [Inquire] [AI ?]       |  | [Inquire] [AI ?]       |  |   |
|  |   [ ] ISO   |  |  +------------------------+  +------------------------+  |   |
|  |             |  |                                                          |   |
|  | > Thread    |  +-----------------------------------------------------------+   |
|  |   M6-M12    |  |  [< Prev]  Page 1 of 25  [Next >]                        |   |
|  |   [=====]   |  +-----------------------------------------------------------+   |
|  |             |  |                                                          |   |
|  | > Supplier  |  |  +-- Related Categories ---------------------------+     |   |
|  |   [ ] REYHER|  |  | Looking for matching nuts? Washers? Try:        |     |   |
|  |   [ ] KLIMAS|  |  | [DIN 934 Nuts] [DIN 125 Washers] [Lock Wash.]   |     |   |
|  |             |  |  +----------------------------------------------+     |   |
|  | [Apply]     |  |                                                          |   |
|  | [Reset]     |  |                                                          |   |
|  +-------------+  +-----------------------------------------------------------+   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                           [Footer]                                                |
+-----------------------------------------------------------------------------------+
```

### Tablet Layout (768px - 1024px)

```
+---------------------------------------------------+
|  [Logo]              [EN|ES]  [Filter] [Theme]    |
+---------------------------------------------------+
|                                                   |
|          FIND YOUR FASTENERS                      |
|                                                   |
|  +---------------------------------------------+  |
|  | [Search Icon] Search products...       [X]  |  |
|  +---------------------------------------------+  |
|  | [M8] [A2] [DIN 933]          [Clear All]   |  |
|  +---------------------------------------------+  |
|                                                   |
+---------------------------------------------------+
|  Results (247)                    [Sort v]        |
+---------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  | DIN 933 Hex Bolt M8x30                      |  |
|  | A2-70 | REYHER p.45            [97% match] |  |
|  | [Inquire]  [Ask AI]                         |  |
|  +---------------------------------------------+  |
|                                                   |
|  +---------------------------------------------+  |
|  | ISO 4017 Hex Cap Screw M10x40              |  |
|  | A4-80 | KLIMAS p.127           [94% match] |  |
|  | [Inquire]  [Ask AI]                         |  |
|  +---------------------------------------------+  |
|                                                   |
+---------------------------------------------------+

// Filter Sheet (slides from bottom on tap)
+---------------------------------------------------+
| FILTERS                              [X Close]    |
+---------------------------------------------------+
| Category        Material        Standard          |
| [Bolts v]       [A2 v]          [DIN v]          |
|                                                   |
| Thread Size                     Supplier          |
| M6 [====|====] M24             [REYHER v]        |
|                                                   |
| [Reset Filters]                [Apply (247)]      |
+---------------------------------------------------+
```

### Mobile Layout (< 768px)

```
+-------------------------------+
|  [=]  [Logo]     [Search] [EN]|
+-------------------------------+
|                               |
|    FIND YOUR FASTENERS        |
|                               |
| +---------------------------+ |
| | Search products...    [X] | |
| +---------------------------+ |
| | [M8] [A2] [x]             | |
| +---------------------------+ |
|                               |
+-------------------------------+
| [Filter (3)] Results: 247     |
+-------------------------------+
|                               |
| +---------------------------+ |
| | DIN 933 Hex Bolt M8x30    | |
| | A2-70 | REYHER            | |
| | p.45          [97%]       | |
| | [Inquire] [?]             | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| | ISO 4017 M10x40           | |
| | A4-80 | KLIMAS            | |
| | p.127         [94%]       | |
| | [Inquire] [?]             | |
| +---------------------------+ |
|                               |
| [Load More]                   |
+-------------------------------+
```

---

## 2. Component Hierarchy

```
SearchPage/
├── SearchPageHeader/
│   └── (Logo, Nav, Language toggle - from existing Navbar)
│
├── SearchHero/
│   ├── HeroTitle (h1 - bilingual)
│   ├── HeroSubtitle (p - bilingual)
│   └── SearchBarContainer/
│       ├── SearchInput (main search field)
│       │   ├── SearchIcon
│       │   ├── Input field
│       │   ├── ClearButton (X)
│       │   └── KeyboardHint (Cmd+K)
│       ├── ActiveFiltersBar/
│       │   ├── FilterChip[] (removable tags)
│       │   └── ClearAllButton
│       └── SearchSuggestions/ (dropdown)
│           ├── RecentSearches/
│           │   └── RecentItem[]
│           ├── SuggestedTerms/
│           │   └── SuggestionItem[]
│           └── QuickCategories/
│               └── CategoryButton[]
│
├── SearchResultsSection/
│   ├── FiltersSidebar/ (desktop)
│   │   ├── FilterGroup (Category)
│   │   │   └── CheckboxList
│   │   ├── FilterGroup (Material)
│   │   │   └── CheckboxList
│   │   ├── FilterGroup (Standard)
│   │   │   └── CheckboxList
│   │   ├── FilterGroup (Thread Size)
│   │   │   └── RangeSlider
│   │   ├── FilterGroup (Supplier)
│   │   │   └── CheckboxList
│   │   └── FilterActions (Apply/Reset)
│   │
│   ├── FiltersSheet/ (mobile - bottom sheet)
│   │   └── (Same filter groups in horizontal layout)
│   │
│   └── ResultsArea/
│       ├── ResultsHeader/
│       │   ├── ResultCount
│       │   ├── ViewToggle (list/grid)
│       │   └── SortSelect
│       ├── ResultsGrid/
│       │   └── ProductCard[] (existing component)
│       │       ├── variant="default" (grid)
│       │       └── variant="compact" (list)
│       ├── Pagination/
│       │   └── PageButtons
│       └── RelatedSuggestions/
│           └── SuggestionChip[]
│
├── InquiryModal/ (existing component)
│
└── AskAIButton/ (floating - opens ChatPanel)
```

---

## 3. User Flow: Search to Inquiry

### Primary Flow

```
[1. LAND ON PAGE]
       |
       v
[2. TYPE IN SEARCH BAR]
       |
       +---> [2a. See autocomplete suggestions]
       |           |
       |           v
       |     [Select suggestion]
       |           |
       v           |
[3. PRESS ENTER / CLICK SEARCH]
       |<----------+
       v
[4. VIEW RESULTS]
       |
       +---> [4a. Refine with filters]
       |           |
       |           v
       |     [Results update instantly]
       |           |
       v           |
[5. CLICK PRODUCT CARD]
       |<----------+
       |
       +---> [5a. Click "Ask AI"]
       |           |
       |           v
       |     [AI explains product specs]
       |           |
       v           |
[6. CLICK "INQUIRE"]
       |<----------+
       v
[7. INQUIRY MODAL OPENS]
       |
       +---> [7a. Fill quantity, notes]
       |
       v
[8. SEND VIA WHATSAPP / EMAIL]
       |
       v
[9. SUCCESS - CONTINUE BROWSING]
```

### State Diagram

```
                    +-------------+
                    | EMPTY STATE |<------------------+
                    +-------------+                   |
                          |                           |
                    [user types]                      |
                          v                           |
                    +-------------+                   |
                    |  SEARCHING  |                   |
                    +-------------+                   |
                          |                           |
                    [results load]                    |
                          v                           |
            +--------------------------+              |
            |      RESULTS SHOWN       |              |
            |  (can apply filters)     |              |
            +--------------------------+              |
                    |         |                       |
            [no results]   [has results]              |
                    |         |                       |
                    v         v                       |
            +----------+  +------------+              |
            | NO MATCH |  | BROWSING   |              |
            +----------+  +------------+              |
                    |         |                       |
            [try AI?]    [click card]                 |
                    |         |                       |
                    v         v                       |
            +----------+  +------------+              |
            | ASK AI   |  | CARD MODAL |              |
            +----------+  +------------+              |
                    |         |                       |
                    |    [click inquire]              |
                    |         |                       |
                    |         v                       |
                    |    +----------+                 |
                    +--->| INQUIRY  |                 |
                         | MODAL    |                 |
                         +----------+                 |
                              |                       |
                         [send/close]                 |
                              |                       |
                              +-----------------------+
```

---

## 4. Filter Interaction Patterns

### Filter Types and Behaviors

| Filter | Type | Behavior | Default |
|--------|------|----------|---------|
| Category | Multi-select checkbox | OR logic within | All selected |
| Material | Multi-select checkbox | OR logic within | All selected |
| Standard | Multi-select checkbox | OR logic within | All selected |
| Thread Size | Range slider | Min-Max (M3-M36) | Full range |
| Supplier | Multi-select checkbox | OR logic within | All selected |

### Filter Logic

```
Results = (Category_A OR Category_B)
          AND (Material_A OR Material_B)
          AND (Standard_A OR Standard_B)
          AND (ThreadSize >= Min AND ThreadSize <= Max)
          AND (Supplier_A OR Supplier_B)
          AND (MatchesSearchQuery)
```

### Desktop Filter Interaction

```
+------------------+
| > Category    [-]| <-- Collapsible section
+------------------+
|  [x] Bolts   (89)|  <-- Count shows matching items
|  [ ] Screws  (45)|
|  [x] Nuts    (67)|
|  [ ] Washers (34)|
|  [Show more v]   |  <-- Expands to show all
+------------------+

// On checkbox click:
1. Filter updates immediately (no "Apply" needed)
2. Results area shows loading skeleton
3. New results appear with animation (fade + slide)
4. Result count updates
5. URL updates with filter params (?category=bolts,nuts&material=a2)
```

### Mobile Filter Sheet Interaction

```
// Trigger: Tap "Filter (N)" button
// N = number of active filters

[Filter Sheet Animation]
1. Sheet slides up from bottom
2. Background dims (50% black overlay)
3. Sheet height: 70% of viewport
4. Drag handle at top for dismiss

[Inside Sheet]
- Horizontal tabs: Category | Material | Standard | Thread | Supplier
- Or: Vertical scrollable list with all filters
- "Apply" button fixed at bottom
- "Reset" link to clear all

[Dismiss]
- Tap outside sheet
- Tap X button
- Swipe down
- Tap "Apply"
```

### Active Filters Bar

```
+----------------------------------------------------------------+
| Active: [A2 x] [DIN x] [M8-M12 x] [Bolts x]     [Clear All]    |
+----------------------------------------------------------------+

// Behavior:
- Each chip shows filter value with X to remove
- Tapping X removes that filter and updates results
- "Clear All" resets all filters
- Bar only visible when filters are active
- Horizontal scroll on mobile if many filters
```

---

## 5. Mobile Responsive Considerations

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop XL | 1440px+ | 3-column results grid |
| Desktop | 1024-1440px | 2-column results grid |
| Tablet | 768-1024px | 2-column grid, sheet filters |
| Mobile L | 480-768px | 1-column, bottom sheet |
| Mobile S | <480px | 1-column, compact cards |

### Mobile-Specific Adaptations

#### Search Input
```
Desktop:                        Mobile:
+---------------------------+   +-------------------+
| [Q] Search products, DIN..|   | [Q] Search...  [X]|
| codes, materials...   [X] |   +-------------------+
+---------------------------+

- Shorter placeholder on mobile
- Full-width input
- Sticky header with search on scroll
```

#### Filter Button (Mobile)
```
+-------------------------------+
| [Filter (3)]  247 results     |
+-------------------------------+

- Shows count of active filters
- Tapping opens bottom sheet
- Badge appears when filters active
```

#### Product Cards (Mobile)
```
+---------------------------+
| DIN 933 Hex Bolt M8x30    |  <- Product name
| +-------+ A2-70 | REYHER  |  <- Material | Supplier
| | [IMG] | p.45    [97%]   |  <- Page | Score
| +-------+                 |
| [Inquire]  [Ask AI ?]     |  <- Actions
+---------------------------+

- Stacked layout
- Smaller typography
- Touch-friendly button sizes (44px min)
```

#### Infinite Scroll vs Pagination
```
Mobile: Infinite scroll with "Load More" button
        - Initial load: 10 items
        - Load more: +10 items per tap
        - Skeleton loader during fetch

Desktop: Traditional pagination
         - 24 items per page
         - Page numbers with prev/next
```

### Touch Targets

```
Minimum sizes (following WCAG):
- Buttons: 44x44px
- Checkboxes: 44x44px (tap area)
- Filter chips: 32px height min
- Card actions: 44px touch area

Spacing:
- Between cards: 16px mobile, 24px desktop
- Filter items: 12px vertical gap
- Button groups: 8px gap
```

### Gestures

| Gesture | Action |
|---------|--------|
| Pull down (on results) | Refresh search |
| Swipe left (on card) | Reveal quick actions |
| Swipe down (on filter sheet) | Dismiss sheet |
| Long press (on filter) | Show filter info tooltip |

---

## 6. Animations and Transitions

### Page Load Sequence

```
Timeline (ms):
0     - Page structure renders
100   - Hero title fades in (duration: 600ms, ease-out)
200   - Subtitle fades in (duration: 500ms)
300   - Search bar slides up + fades (duration: 400ms)
500   - Quick categories appear (stagger: 50ms each)
700   - Page ready for interaction
```

### Search Interactions

```css
/* Search Input Focus */
.search-input:focus {
  box-shadow: 0 0 0 4px rgba(0, 128, 128, 0.15);
  border-color: var(--inox-teal);
  transition: all 200ms ease-out;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  transform-origin: top center;
  animation: dropdown-in 200ms ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Typing indicator during search */
.search-loader {
  animation: pulse 1.5s infinite;
}
```

### Results Loading

```css
/* Skeleton shimmer effect */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Results appear animation */
.result-card {
  animation: card-in 300ms ease-out backwards;
}

.result-card:nth-child(1) { animation-delay: 0ms; }
.result-card:nth-child(2) { animation-delay: 50ms; }
.result-card:nth-child(3) { animation-delay: 100ms; }
/* ... stagger up to 150ms max total */

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Filter Interactions

```css
/* Filter expand/collapse */
.filter-group-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms ease-out;
}

.filter-group-content.expanded {
  grid-template-rows: 1fr;
}

/* Checkbox animation */
.checkbox:checked ~ .checkmark {
  animation: check-bounce 300ms ease-out;
}

@keyframes check-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Filter chip removal */
.filter-chip.removing {
  animation: chip-out 200ms ease-in forwards;
}

@keyframes chip-out {
  to {
    opacity: 0;
    transform: scale(0.8);
    margin: 0 -20px 0 0;
  }
}
```

### Mobile Sheet Animation

```css
/* Bottom sheet */
.filter-sheet {
  transform: translateY(100%);
  transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);
}

.filter-sheet.open {
  transform: translateY(0);
}

/* Backdrop */
.sheet-backdrop {
  opacity: 0;
  transition: opacity 250ms ease-out;
}

.sheet-backdrop.visible {
  opacity: 1;
}
```

### Micro-interactions

```css
/* Button hover/press */
.btn-inquire {
  transition: all 150ms ease-out;
}

.btn-inquire:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 128, 128, 0.25);
}

.btn-inquire:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Card hover */
.product-card {
  transition: all 200ms ease-out;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--inox-teal-50);
}

/* Score badge pulse on high relevance */
.score-badge.high {
  animation: score-pulse 2s ease-in-out infinite;
}

@keyframes score-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}
```

---

## 7. Search Suggestions / Autocomplete

### Suggestion Categories

```
+-----------------------------------------------------------+
| [Search Input: "M8 hex"]                                   |
+-----------------------------------------------------------+
| RECENT SEARCHES                                    [Clear] |
|   [Clock] M8x30 hex bolt A2                               |
|   [Clock] DIN 933 M10                                     |
+-----------------------------------------------------------+
| SUGGESTIONS                                               |
|   [Star] M8 hex bolt - most popular                       |
|   [Doc]  M8 hex cap screw DIN 933                         |
|   [Doc]  M8 hex flange bolt                               |
+-----------------------------------------------------------+
| QUICK FILTERS                                             |
|   Material: [A2] [A4] [8.8]                               |
|   Standard: [DIN 933] [ISO 4017] [DIN 931]               |
+-----------------------------------------------------------+
```

### Common Fastener Terms (Autocomplete Dictionary)

```javascript
const FASTENER_TERMS = {
  categories: [
    'hex bolt', 'hex cap screw', 'socket head cap screw',
    'flange bolt', 'carriage bolt', 'eye bolt',
    'hex nut', 'lock nut', 'flange nut', 'wing nut',
    'flat washer', 'spring washer', 'lock washer',
    'set screw', 'grub screw', 'machine screw'
  ],
  standards: [
    'DIN 933', 'DIN 931', 'DIN 912', 'DIN 934', 'DIN 125',
    'ISO 4017', 'ISO 4014', 'ISO 4762', 'ISO 4032', 'ISO 7089'
  ],
  materials: [
    'A2 stainless', 'A4 stainless', '304 stainless', '316 stainless',
    '8.8 grade', '10.9 grade', '12.9 grade',
    'zinc plated', 'hot dip galvanized', 'brass'
  ],
  threads: [
    'M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M14', 'M16',
    'M18', 'M20', 'M22', 'M24', 'M27', 'M30', 'M36'
  ]
};

// Spanish translations
const FASTENER_TERMS_ES = {
  categories: [
    'tornillo hexagonal', 'tornillo cabeza hexagonal',
    'tornillo allen', 'tornillo de brida',
    'tuerca hexagonal', 'tuerca autoblocante',
    'arandela plana', 'arandela grower'
  ]
  // ...
};
```

### Recent Searches Storage

```javascript
// localStorage structure
{
  "inoxbolt_recent_searches": [
    {
      "query": "M8x30 hex bolt A2",
      "timestamp": 1704307200000,
      "resultCount": 45
    },
    {
      "query": "DIN 933 M10",
      "timestamp": 1704220800000,
      "resultCount": 23
    }
    // Max 10 items, FIFO
  ]
}
```

---

## 8. Empty States

### No Search Yet (Initial State)

```
+------------------------------------------------+
|                                                |
|            [Search illustration]               |
|                                                |
|        Start searching for fasteners           |
|                                                |
|   Try: "M8 hex bolt" or "DIN 933 stainless"   |
|                                                |
|   Popular categories:                          |
|   [Hex Bolts] [Socket Screws] [Nuts]          |
|                                                |
+------------------------------------------------+
```

### No Results Found

```
+------------------------------------------------+
|                                                |
|           [No results illustration]            |
|                                                |
|      No products found for "xyz123abc"         |
|                                                |
|   Suggestions:                                 |
|   - Check your spelling                        |
|   - Try a different product code               |
|   - Use fewer or different keywords            |
|   - Browse by category below                   |
|                                                |
|   [Clear Search] [Ask AI Assistant]            |
|                                                |
|   Popular searches:                            |
|   [M8 bolts] [A2 stainless] [DIN 933]         |
|                                                |
+------------------------------------------------+
```

### Error State

```
+------------------------------------------------+
|                                                |
|              [Error illustration]              |
|                                                |
|         Something went wrong                   |
|                                                |
|   We couldn't complete your search.            |
|   Please try again in a moment.                |
|                                                |
|   [Try Again] [Contact Support]                |
|                                                |
+------------------------------------------------+
```

---

## 9. Accessibility Considerations

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move through interactive elements |
| Enter | Activate button/link, submit search |
| Escape | Close dropdown/modal, clear search |
| Arrow Up/Down | Navigate suggestions |
| Cmd/Ctrl + K | Focus search input (global) |

### Screen Reader Annotations

```html
<!-- Search input -->
<input
  role="combobox"
  aria-label="Search products by name, code, or material"
  aria-expanded="true"
  aria-controls="search-suggestions"
  aria-activedescendant="suggestion-3"
/>

<!-- Results region -->
<div
  role="region"
  aria-label="Search results"
  aria-live="polite"
  aria-busy="false"
>
  <p class="sr-only">247 products found for "M8 hex bolt"</p>
  ...
</div>

<!-- Filter group -->
<fieldset>
  <legend>Filter by Material</legend>
  <div role="group" aria-label="Material options">
    ...
  </div>
</fieldset>

<!-- Product card -->
<article
  aria-label="DIN 933 Hex Bolt M8x30, A2 stainless steel, from REYHER catalogue page 45"
>
  ...
</article>
```

### Color Contrast

- All text: minimum 4.5:1 ratio
- Interactive elements: minimum 3:1 ratio
- Focus indicators: visible 3px outline

### Focus Management

- Search input auto-focused on page load (desktop)
- Modal traps focus when open
- Focus returns to trigger element on modal close
- Skip link to main content

---

## 10. Bilingual Content

### Translation Keys

```javascript
const SEARCH_TRANSLATIONS = {
  // Hero
  'search.hero.title': {
    en: 'Find Your Fasteners',
    es: 'Encuentra Tus Fijaciones'
  },
  'search.hero.subtitle': {
    en: 'Over 2 million items from trusted suppliers',
    es: 'Mas de 2 millones de articulos de proveedores confiables'
  },

  // Search
  'search.placeholder': {
    en: 'Search by product, DIN/ISO code, material...',
    es: 'Buscar por producto, codigo DIN/ISO, material...'
  },
  'search.placeholder.short': {
    en: 'Search products...',
    es: 'Buscar productos...'
  },

  // Filters
  'filter.category': { en: 'Category', es: 'Categoria' },
  'filter.material': { en: 'Material', es: 'Material' },
  'filter.standard': { en: 'Standard', es: 'Norma' },
  'filter.thread': { en: 'Thread Size', es: 'Tamano de Rosca' },
  'filter.supplier': { en: 'Supplier', es: 'Proveedor' },
  'filter.apply': { en: 'Apply Filters', es: 'Aplicar Filtros' },
  'filter.reset': { en: 'Reset', es: 'Restablecer' },
  'filter.clear_all': { en: 'Clear All', es: 'Limpiar Todo' },

  // Categories
  'category.bolt': { en: 'Bolts', es: 'Pernos' },
  'category.screw': { en: 'Screws', es: 'Tornillos' },
  'category.nut': { en: 'Nuts', es: 'Tuercas' },
  'category.washer': { en: 'Washers', es: 'Arandelas' },
  'category.anchor': { en: 'Anchors', es: 'Anclajes' },

  // Results
  'results.count': {
    en: '{count} products found',
    es: '{count} productos encontrados'
  },
  'results.no_results': {
    en: 'No products found',
    es: 'No se encontraron productos'
  },
  'results.loading': {
    en: 'Searching...',
    es: 'Buscando...'
  },
  'results.sort.relevance': {
    en: 'Most Relevant',
    es: 'Mas Relevante'
  },
  'results.sort.name_asc': {
    en: 'Name (A-Z)',
    es: 'Nombre (A-Z)'
  },

  // Actions
  'action.inquire': { en: 'Inquire', es: 'Consultar' },
  'action.request_quote': { en: 'Request Quote', es: 'Solicitar Cotizacion' },
  'action.ask_ai': { en: 'Ask AI', es: 'Preguntar a IA' },
  'action.view_details': { en: 'View Details', es: 'Ver Detalles' },

  // Recent searches
  'recent.title': { en: 'Recent Searches', es: 'Busquedas Recientes' },
  'recent.clear': { en: 'Clear', es: 'Limpiar' },

  // Suggestions
  'suggestions.popular': {
    en: 'Popular Searches',
    es: 'Busquedas Populares'
  },
  'suggestions.categories': {
    en: 'Browse Categories',
    es: 'Explorar Categorias'
  },

  // Empty states
  'empty.initial.title': {
    en: 'Start searching for fasteners',
    es: 'Comienza a buscar fijaciones'
  },
  'empty.initial.hint': {
    en: 'Try: "M8 hex bolt" or "DIN 933 stainless"',
    es: 'Prueba: "perno hexagonal M8" o "DIN 933 inoxidable"'
  },
  'empty.no_results.title': {
    en: 'No products found',
    es: 'No se encontraron productos'
  },
  'empty.no_results.tips': {
    en: [
      'Check your spelling',
      'Try a different product code',
      'Use fewer or different keywords',
      'Browse by category below'
    ],
    es: [
      'Revisa la ortografia',
      'Prueba un codigo de producto diferente',
      'Usa menos palabras o diferentes',
      'Explora por categoria abajo'
    ]
  }
};
```

---

## 11. URL Structure & State Management

### URL Parameters

```
/search
/search?q=M8+hex+bolt
/search?q=M8&material=a2,a4&category=bolt
/search?q=DIN+933&standard=din&thread=m8-m12&supplier=reyher&page=2&sort=name

Parameters:
- q: search query (encoded)
- material: comma-separated material codes
- category: comma-separated category slugs
- standard: comma-separated standard types (din, iso)
- thread: thread range (m6-m12)
- supplier: comma-separated supplier codes
- page: page number (default: 1)
- sort: sort order (relevance, name_asc, name_desc, score)
- view: display mode (grid, list)
```

### State Synchronization

```javascript
// URL <-> State sync
const [searchState, setSearchState] = useState({
  query: '',
  filters: {
    material: [],
    category: [],
    standard: [],
    threadRange: { min: 'M3', max: 'M36' },
    supplier: []
  },
  sort: 'relevance',
  page: 1,
  view: 'grid'
});

// On filter change -> update URL
// On URL change (back/forward) -> update state
// Debounce URL updates to prevent excessive history entries
```

---

## 12. Performance Considerations

### Loading Strategy

1. **Initial page load**: Render search hero immediately
2. **Deferred**: Load filter options from API
3. **On search**: Show skeleton cards, fetch results
4. **Pagination**: Prefetch next page on scroll near bottom

### Caching

```javascript
// Query result caching (client-side)
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxEntries: 50,        // Max cached queries
  staleWhileRevalidate: true
};

// Filter options caching
// Cache filter facets (categories, materials, etc.) for 1 hour
```

### Optimizations

- Debounce search input (300ms)
- Virtualize long result lists (>100 items)
- Lazy load images in cards
- Prefetch product detail data on hover
- Use URL state to enable back/forward navigation

---

## 13. Implementation Priority

### Phase 1: Core Search (MVP)
1. Search input with RAG integration
2. Basic results display using ProductCard
3. Inquiry modal flow (existing)
4. Mobile responsive layout

### Phase 2: Filters & Refinement
1. Filter sidebar (desktop)
2. Filter bottom sheet (mobile)
3. Active filters bar
4. URL state management

### Phase 3: Enhancements
1. Search suggestions/autocomplete
2. Recent searches
3. Sort options
4. View toggle (grid/list)

### Phase 4: Polish
1. Animations and transitions
2. Empty states
3. Error handling
4. Accessibility audit
5. Performance optimization

---

## 14. Technical Notes

### Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| ProductCard | `components/product/ProductCard.tsx` | Results display |
| InquiryModal | `components/product/InquiryModal.tsx` | Quote request flow |
| ProductDetailModal | `components/product/ProductDetailModal.tsx` | Product details |
| useRAG / RAGContext | `contexts/RAGContext.tsx` | Search API |
| useRAGSearch | `hooks/useRAGSearch.ts` | Search hook |
| useLanguage | `contexts/LanguageContext.tsx` | i18n |
| Checkbox | `components/ui/checkbox.tsx` | Filter inputs |
| Select | `components/ui/select.tsx` | Sort dropdown |
| Sheet | `components/ui/sheet.tsx` | Mobile filters |
| Command | `components/ui/command.tsx` | Autocomplete base |
| Skeleton | `components/ui/skeleton.tsx` | Loading states |

### New Components Needed

| Component | Purpose |
|-----------|---------|
| SearchPage | Main page container |
| SearchHero | Hero section with search input |
| SearchInput | Enhanced search with suggestions |
| FiltersSidebar | Desktop filter panel |
| FiltersSheet | Mobile filter bottom sheet |
| FilterGroup | Collapsible filter section |
| ActiveFiltersBar | Current filter chips display |
| ResultsHeader | Count, sort, view toggle |
| ResultsGrid | Product card grid/list |
| SearchPagination | Page navigation |
| EmptyState | Various empty state variants |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | POST | Main search (existing) |
| `/api/search/suggest` | GET | Autocomplete suggestions |
| `/api/search/facets` | GET | Available filter values |

---

## Appendix A: Color Reference

```css
:root {
  --inox-teal: #008080;
  --inox-teal-50: rgba(0, 128, 128, 0.5);
  --inox-blue: #1e3a5f;
  --inox-orange: #f97316;

  /* Material badge colors (from product.ts) */
  --material-a2: bg-emerald-100 text-emerald-800;
  --material-a4: bg-blue-100 text-blue-800;
  --material-8-8: bg-amber-100 text-amber-800;
  --material-10-9: bg-orange-100 text-orange-800;
  --material-12-9: bg-red-100 text-red-800;
}
```

## Appendix B: Icon Reference

Using Lucide React icons (already in project):

- Search: `Search`
- Clear: `X`
- Filter: `SlidersHorizontal`
- Sort: `ArrowUpDown`
- Grid view: `LayoutGrid`
- List view: `List`
- Expand: `ChevronDown`
- Collapse: `ChevronUp`
- Clock (recent): `Clock`
- Star (popular): `Star`
- Document: `FileText`
- Inquire: `MessageSquare`
- AI: `Sparkles`
- External link: `ExternalLink`
