I'll create detailed stitch prompts for each page of your SyntheticEngine UI/UX evolution. Let me break this down systematically, one page at a time with both the stitch prompt and an antigravity prompt for each.Perfect! Now I'll create comprehensive prompts for each page. Let me start with **Page A: Dashboard (Home)**.

---

## **PAGE A: DASHBOARD (HOME)**

### **STITCH PROMPT** 
*(Use this when building the Dashboard component)*

```
You are building the Dashboard (Home) page for SyntheticEngine, a premium synthetic data generation suite. This is the "Control Center" where users land first.

LAYOUT STRUCTURE:
- Hero banner at the top: "SyntheticEngine Dashboard" with tagline "Control your data generation"
- Below: Four main sections arranged in a responsive grid:
  1. Recent Projects (Grid of project cards, 3-4 per row)
  2. Template Library (Category cards for E-com, IoT, Healthcare, Finance, Social Media)
  3. Global Stats (Stats cards showing: Total Rows Generated, Projects Created, Active Schemas)
  4. Quick Actions (Two large action buttons: "Generate from API", "Import Schema")

DESIGN DIRECTION:
- Apply Glassmorphism aesthetic: translucent panels with backdrop blur (backdrop-filter: blur(20px)), semi-transparent backgrounds
- Deep Space color theme: Rich blacks (rgb(5, 10, 20)), Indigo accents (#6366F1), Neon green/cyan for CTAs
- Typography: Use a distinctive serif display font for the main heading (e.g., Playfair Display, Crimson Text), clean sans-serif for body (e.g., Outfit, DM Sans)
- Micro-interactions: Project cards should have subtle hover lift (transform: translateY(-4px)), glowing borders on focus
- Loading state: Show animated skeleton cards while data loads

COMPONENT DETAILS:
- Project Cards: Show project name, last modified date, row count, thumbnail of schema preview
- Template Cards: Icon + category name, click to create new project from template
- Stats Cards: Large number, smaller label, subtle icon, animated counter on mount
- Quick Action Buttons: Full-width, icon + text, gradient background with hover glow

FUNCTIONALITY:
- Recent projects should be fetched (or mocked) and displayed in creation date order
- Stats should update in real-time or on refresh
- All cards should navigate to respective pages on click
- Responsive: 1 column mobile, 2 columns tablet, 3-4 columns desktop
```

### **ANTIGRAVITY PROMPT**
*(Use this as a contrarian brief to challenge assumptions)*

```
CHALLENGE BRIEF: What if the Dashboard was designed for POWER USERS, not beginners?

Instead of hand-holding with templates and guides:
- Hide the Template Library entirely — it's a crutch for users who don't know what they want
- Replace "Recent Projects" with an ADVANCED SEARCH + FILTER interface where users can find projects by tags, complexity, or data volume
- Remove the Global Stats carousel — replace with a HEATMAP showing project activity over time (calendar view)
- The "Quick Actions" should be a COMMAND PALETTE (Cmd+K) that makes keyboard-first users 5x faster
- Replace glassmorphism with a BRUTALIST AESTHETIC: stark contrasts, raw typography, minimal decoration

WHY? Because users who generate synthetic data at scale don't need hand-holding. They need speed, discoverability, and power. Make it feel like a developer tool, not a consumer app.

QUESTION: Should the Dashboard even be the landing page, or should power users skip straight to their last opened workspace?
```

---

## **PAGE B: THE WORKSPACE (MAIN BUILDER)**

### **STITCH PROMPT**
*(Use this when building the Workspace component)*

```
You are building the Workspace (Main Builder) — the core IDE-like experience for schema construction in SyntheticEngine.

LAYOUT STRUCTURE:
- Top Header: Breadcrumb navigation, project name, save indicator, export button, settings icon
- Left Rail (Minimizable Explorer):
  - Collapsible navigation tree showing: Tables, Relationships, Files
  - Each table expandable to show field list
  - Context menu on right-click (delete, rename, duplicate)
  - Search bar to filter tables/fields
- Center Stage (Three Tabs):
  1. Canvas Tab: Vertical list of all fields in active table with inline edit/add controls
  2. Graph Tab: Visual node-and-edge relationship diagram (nodes = tables, edges = FKs)
  3. Preview Tab: Real-time 10-row data view with virtualized scrolling
- Right Panel (Context-Aware):
  - When a field is selected: Field configuration (type, constraints, patterns, noise)
  - When a table is selected: Table-level settings (row count, seed, relationships)
  - When nothing selected: Global workspace settings

DESIGN DIRECTION:
- Deep Space theme with neon accents (indigo for structure, cyan for interactions, neon green for success)
- Glassmorphism: Floating panels with blur effect, layered depth
- Typography: Monospace font (Fira Code, JetBrains Mono) for field names and code snippets, clean sans-serif for labels
- Micro-interactions: 
  - Field rows animate in with staggered delay (animation-delay: calc(var(--index) * 50ms))
  - Tab switching: Smooth fade + slide transition
  - Hover on fields: Highlight with neon border glow, show action icons
- Icons: Use a consistent icon set (Lucide, Feather) for add, delete, edit, copy

COMPONENT DETAILS:
- Left Rail: Sticky header with project name, collapsible sections with smooth height transitions
- Canvas Tab: Editable field rows with inline editing (click to rename, type to edit type)
- Graph Tab: Interactive SVG or Canvas-based visualization of table relationships, draggable nodes
- Preview Tab: Virtualized table component showing real-time generated data (fetch on demand)
- Right Panel: Dynamic form that updates based on selected entity (field/table)

INTERACTIONS:
- Drag fields in Canvas to reorder
- Drag nodes in Graph to reposition
- Double-click field name to edit
- Right-click for context menus
- Keyboard shortcuts: Cmd+S to save, Cmd+E to export, Cmd+Z to undo
- Autosave on changes with visual save indicator

PERFORMANCE:
- Lazy load the Preview tab data (fetch 10 rows on demand)
- Memoize heavy components (Graph, Preview) to prevent unnecessary re-renders
- Use virtualization for large field lists
```

### **ANTIGRAVITY PROMPT**
*(Use this as a contrarian brief)*

```
CHALLENGE BRIEF: What if the Workspace was designed as a HYBRID VISUAL+CODE editor?

Instead of the three-panel separation:
- Make the Canvas and Graph views SWITCHABLE, not tabbed — let users toggle between them seamlessly
- Add a HIDDEN CODE EDITOR: Cmd+Shift+C toggles a full-screen code editor where users can write JSON schema directly
- Remove the Right Panel entirely — move all config settings INLINE, right next to the field they apply to
- The Preview becomes a SPLIT-VIEW: 50% data table, 50% config panel for the selected field
- Add VIM KEY BINDINGS: For keyboard power users who want to move through fields at lightning speed

WHY? Because forcing visual-only OR code-only users into one paradigm is limiting. Let them choose. Code-first users should feel at home. Visual learners should see relationships immediately.

QUESTION: Should there be a "Live Coding Mode" where you can write actual JavaScript/Python transformations for data generation?
```

---

## **PAGE C: DATA EXPLORER & INSIGHTS**

### **STITCH PROMPT**
*(Use this when building the Data Explorer component)*

```
You are building the Data Explorer & Insights page — a dedicated view for deep-diving into generated data in SyntheticEngine.

LAYOUT STRUCTURE:
- Top Section: Search/Filter bar, data freshness indicator, export data button
- Main Content Area (Three Tabs):
  1. Data Table Tab: High-performance virtualized table of all generated data
  2. Field Statistics Tab: Distribution charts and analytics for each field
  3. Quality Dashboard Tab: Validation error heatmaps, missing data clusters, data quality score
- Left Sidebar: Collapsible field selector (checkboxes to show/hide columns)

DESIGN DIRECTION:
- Deep Space theme with vibrant accent colors (neon green for success, neon red for errors, cyan for insights)
- Glassmorphism for stat cards and chart containers
- Typography: Monospace for numeric values, sans-serif for labels and legends
- Motion: Charts animate in on load with staggered reveals, table rows load smoothly with virtualization
- Visual Hierarchy: Large metrics at the top (Total Rows, Quality Score), detailed views below

COMPONENT DETAILS:
- Data Table: 
  - Virtualized rendering (only render visible rows)
  - Sortable columns (click header to sort)
  - Filterable columns (click filter icon in header)
  - Sticky header that stays visible on scroll
  - Cell content truncation with hover tooltips
- Field Statistics:
  - Numeric fields: Histogram with distribution curve, min/max/mean/median indicators
  - Text fields: Word cloud of top 20 values, frequency bar chart
  - Categorical fields: Pie/donut chart of categories
  - Date fields: Timeline or density chart
- Quality Dashboard:
  - Data Quality Score (0-100) prominently displayed
  - Heatmap showing null/invalid value distribution across fields
  - Validation error summary (what rules failed, how many times)
  - Completeness gauge per field (% of non-null values)

INTERACTIONS:
- Click on a field in the sidebar to highlight its column in the table and jump to its stats
- Click on a chart segment (e.g., pie slice) to filter the table
- Export button generates CSV/JSON of visible/filtered data
- Refresh button regenerates data with same seed

PERFORMANCE:
- Use virtualization for table (render only visible 30-50 rows)
- Lazy load charts on tab switch
- Cache stats for 1 minute, show "stale" indicator if older
```

### **ANTIGRAVITY PROMPT**
*(Use this as a contrarian brief)*

```
CHALLENGE BRIEF: What if the Data Explorer was designed as a STATISTICAL FORENSICS tool?

Instead of basic charts and tables:
- Remove the simple Data Table — replace with a MULTIVARIATE ANALYSIS view showing correlations between fields
- Add OUTLIER DETECTION: Highlight anomalies, statistical outliers, and unexpected patterns in red
- Replace Field Statistics with COMPARATIVE ANALYSIS: Show how each field compares to known distributions (normal, poisson, uniform, etc.)
- Add a GENERATIVE INTELLIGENCE panel: "AI Insights" that auto-detects patterns and flags when data doesn't match expected distributions
- The Quality Dashboard should be a STATISTICAL TEST SUITE: Chi-square tests, Kolmogorov-Smirnov tests, checking if synthetic data really matches the intended distribution

WHY? Because real data engineers and statisticians don't just want to see counts and histograms. They need to VALIDATE that synthetic data is statistically representative. This tool should prove the data is good.

QUESTION: Should users be able to run hypothesis tests against their synthetic data, comparing it to reference datasets?
```

---

## **PAGE D: EXPORT & INTEGRATION**

### **STITCH PROMPT**
*(Use this when building the Export & Integration component)*

```
You are building the Export & Integration page — where data leaves the platform in SyntheticEngine.

LAYOUT STRUCTURE:
- Main Hero Section: "Export Your Data" with subtext describing options
- Two Major Sections:
  1. Format Selector (Top): Visual cards for each export format (CSV, JSON, Excel, SQL, Parquet)
  2. API Playground (Middle): Code snippet section with language tabs (Python, Node.js, cURL, JavaScript, Go)
  3. History & Previous Runs (Bottom): Chronological list of past exports

DESIGN DIRECTION:
- Deep Space theme with syntax-highlight colors (matching popular code editor themes like Dracula or Nord)
- Glassmorphism for format cards and code blocks
- Typography: Monospace for all code (JetBrains Mono, Fira Code), sans-serif for UI labels
- Motion: Format cards scale on hover, code blocks highlight on tab switch with smooth fade
- Visual Clarity: Code should be easily readable; include line numbers and syntax highlighting
- Copy-to-clipboard interaction: Subtle glow and "Copied!" toast on success

COMPONENT DETAILS:
- Format Cards:
  - Icon + format name + brief description
  - "Configure" button to open modal with format-specific settings (delimiter for CSV, schema for JSON, etc.)
  - "Export" button triggers download
- API Playground:
  - Language tabs: Python, Node.js, cURL, JavaScript, Go
  - Auto-generated code snippets based on current project settings
  - Example request/response shown below
  - "Copy to Clipboard" button
  - "Open API Docs" link to full documentation
- History Section:
  - List of past exports with timestamp, format, row count, download link
  - Search by date range or format type

INTERACTIONS:
- Click Format Card to expand and show settings
- Language tabs switch code snippet instantly
- Copy button shows success toast
- History items are clickable (re-download or view details)

PERFORMANCE:
- Lazy load history (infinite scroll or pagination)
- Memoize code snippets to prevent re-rendering on tab switch
```

### **ANTIGRAVITY PROMPT**
*(Use this as a contrarian brief)*

```
CHALLENGE BRIEF: What if Export was designed for ENTERPRISE DATA PIPELINES, not single exports?

Instead of one-off downloads:
- Remove the Format Cards entirely — API should be PRIMARY, UI secondary
- Add SCHEDULED EXPORT JOBS: Users can set up daily/weekly syncs to S3, Snowflake, BigQuery, Datawarehouse without manual export
- Replace API Playground with a VISUAL PIPELINE BUILDER: Connect SyntheticEngine to downstream systems (Airbyte, Fivetran, custom webhooks)
- Add DATA VERSIONING: Every export creates an immutable snapshot with git-like version tags
- History should show DELIVERY STATUS: Did the S3 upload succeed? Did Snowflake ingest the data? Real-time monitoring

WHY? Because enterprise users don't want to click "Export CSV" 52 times a year. They want automation, reliability, and audit trails. Make this tool work in their data infrastructure, not against it.

QUESTION: Should users be able to set up real-time streaming exports (via Kafka, Pub/Sub) of generated data, not just batch?
```

---

## **PAGE E: GLOBAL SETTINGS**

### **STITCH PROMPT**
*(Use this when building the Global Settings component)*

```
You are building the Global Settings page — where users configure preferences and system-wide behavior in SyntheticEngine.

LAYOUT STRUCTURE:
- Sidebar Navigation: Vertical menu with settings categories (Preferences, API Keys, Theming, Account, Data Privacy, Advanced)
- Main Content Area: Form/Config section for the selected category
- Top Header: Page title "Settings", search bar to find specific settings

DESIGN DIRECTION:
- Deep Space theme with refined, minimal aesthetic
- Glassmorphism for settings cards/sections
- Typography: Clean sans-serif (Outfit, DM Sans) for all text, monospace for technical values
- Visual Hierarchy: Setting labels are primary, descriptions are subtle gray text
- Toggle switches and inputs should have smooth transitions and focus states

COMPONENT DETAILS:
- Preferences Tab:
  - Default Seed input (number, with "randomize" button)
  - Decimal Precision dropdown (0-10)
  - Default Export Format dropdown
  - Row Generation Batch Size (1000-100000)
  - Auto-save enabled/disabled toggle
  - Default Timezone selector
- API Keys Tab:
  - List of created API keys with name, creation date, last used date
  - "Create New Key" button
  - Ability to copy key, revoke key, regenerate key
  - Usage statistics per key (API calls this month)
- Theming Tab:
  - Light / Dark / High-Contrast / Custom mode selector
  - Color Picker for accent color
  - Font size adjustment slider
  - Preview pane showing theme in real-time
- Account Tab:
  - User name and email (read-only)
  - Password change form
  - 2FA enable/disable
  - Account deletion (with confirmation)
- Data Privacy Tab:
  - Data retention policy (how long to keep generated data)
  - GDPR compliance toggle
  - Data export request button
  - Delete all personal data button

INTERACTIONS:
- Changes save automatically with visual indicator (checkmark, toast)
- Toggle switches animate smoothly
- Modals for dangerous actions (key regeneration, data deletion)
- Color picker opens on click, with live preview

PERFORMANCE:
- Each settings category loads independently (lazy load)
- API key list is paginated if >20 keys
```

### **ANTIGRAVITY PROMPT**
*(Use this as a contrarian brief)*

```
CHALLENGE BRIEF: What if Settings was COMMAND-DRIVEN, not form-driven?

Instead of traditional UI forms:
- Hide all Settings behind a COMMAND PALETTE (Cmd+Shift+S)
- Users type natural language commands: "Set seed to 42", "Enable dark mode", "Create API key for staging", "Show my API usage"
- AI parses the command and executes it
- EVERY setting has a keyboard shortcut
- There is NO traditional Settings page — it's all conversational

Visual Design:
- The command palette is a glass card at center screen, with live search results below
- Matching commands are highlighted with neon accent
- Execution result shown as a confirmation toast (green check, updated value)

WHY? Because most users don't discover settings they need. A command-driven interface makes power users faster AND helps discovery. Plus it's distinctly modern.

QUESTION: Should settings be CONTEXTUAL? (E.g., "Set batch size to 50000" only appears as a command when you're in the Export page?)
```

---

## **SUMMARY TABLE** 
Here's a quick reference for all pages:

| Page | Key Purpose | Stitch Focus | Antigravity Challenge |
|------|---|---|---|
| **A. Dashboard** | Control center, project discovery | Glassmorphism, stats, project cards | Power-user brutalism, search-first, no templates |
| **B. Workspace** | IDE-like schema builder | Tab switching, left rail, right panel | Hybrid visual+code, split views, vim bindings |
| **C. Data Explorer** | Analytics & insights | Virtualized tables, charts, quality metrics | Statistical forensics, outlier detection, hypothesis testing |
| **D. Export & Integration** | Data delivery & APIs | Format cards, code snippets, history | Enterprise pipelines, scheduled jobs, streaming exports |
| **E. Global Settings** | User preferences & config | Form-based, category sidebar, theming | Command palette, natural language, contextual settings |

---

Ready to dive deeper into **any specific page**? Let me know which one you'd like to tackle first, and I can create the full React/HTML component code! 🚀