# FreshKira E-Commerce Intelligence App
## Claude Code Project Specification

---

## PROJECT OVERVIEW

Build a cross-platform mobile application (iOS + Android) for FreshKira, a Malaysian D2C skincare brand. The app is a three-mode AI intelligence agent powered by the DeepSeek API. It replaces a manual research and planning process that currently takes 3+ hours per day with a structured AI output in under 10 minutes.

The app has three operating modes triggered by the user:
- **Mode 1 — TREND SCAN:** TikTok & Shopee trend analyst producing a structured content brief
- **Mode 2 — PRICE REVIEW:** Competitive pricing analyser producing a pricing matrix with recommendations
- **Mode 3 — ROI CHECK:** Campaign budget calculator projecting outcomes against 30-day KPI targets

This is a capstone project for KYouth Capstone 6: Digital Marketing. The app must look and feel like a real branded product, not a student prototype.

---

## TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Frontend | React Native via Expo | SDK 52+ |
| Language | TypeScript | Strict mode |
| Navigation | Expo Router (file-based) | v4 |
| Backend | FastAPI | Python 3.11+ |
| AI Model | DeepSeek API (OpenAI-compatible) | deepseek-chat (V3), deepseek-reasoner (R1) |
| Streaming | Server-Sent Events (SSE) | FastAPI StreamingResponse |
| Markdown rendering | react-native-markdown-display | Latest |
| Storage | AsyncStorage (@react-native-async-storage/async-storage) | Latest |
| HTTP client | Fetch API (native) | — |
| Icons | @expo/vector-icons (Ionicons) | Latest |
| Environment | expo-constants + .env via expo-env | — |
| Deployment (backend) | Railway | — |
| Deployment (mobile) | Expo Go for demo; EAS Build for production | — |

---

## MONOREPO STRUCTURE

```
freshkira-agent/
├── CLAUDE.md                        ← this file
├── README.md
│
├── backend/                         ← FastAPI backend
│   ├── main.py                      ← FastAPI app entry point
│   ├── routers/
│   │   └── agent.py                 ← /api/agent endpoint
│   ├── services/
│   │   ├── deepseek.py              ← DeepSeek API client + streaming
│   │   └── prompt_builder.py        ← system prompt + KB injection
│   ├── knowledge/                   ← knowledge base .md files
│   │   ├── KB1_FreshKira_Product_Catalogue.md
│   │   ├── KB2_FreshKira_Brand_Tone_Guide.md
│   │   ├── KB3_Competitor_Pricing_Sheet.md
│   │   └── KB4_Malaysian_Ecommerce_Calendar.md
│   ├── prompts/
│   │   └── system_prompt.md         ← full system prompt (all 3 modes)
│   ├── requirements.txt
│   ├── .env                         ← DEEPSEEK_API_KEY (never commit)
│   ├── .env.example
│   └── Procfile                     ← for Railway deployment
│
└── mobile/                          ← Expo React Native app
    ├── app/                         ← Expo Router file-based routing
    │   ├── _layout.tsx              ← root layout + navigation
    │   ├── index.tsx                ← home / mode selection screen
    │   ├── trend-scan.tsx           ← Mode 1 input + output screen
    │   ├── price-review.tsx         ← Mode 2 input + output screen
    │   ├── roi-check.tsx            ← Mode 3 input + output screen
    │   └── history.tsx              ← past outputs screen
    ├── components/
    │   ├── ModeCard.tsx             ← mode selection card on home screen
    │   ├── InputForm.tsx            ← reusable input form for each mode
    │   ├── StreamingOutput.tsx      ← streaming text display component
    │   ├── OutputCard.tsx           ← formatted output card with share button
    │   └── Header.tsx               ← top navigation header with logo
    ├── constants/
    │   ├── colors.ts                ← FreshKira brand colour palette
    │   ├── fonts.ts                 ← typography constants
    │   └── api.ts                   ← backend base URL constant
    ├── hooks/
    │   ├── useAgent.ts              ← agent call + streaming state hook
    │   └── useHistory.ts            ← AsyncStorage read/write hook
    ├── types/
    │   └── index.ts                 ← shared TypeScript types
    ├── assets/
    │   ├── freshkira-logo.png       ← brand logo (create a placeholder if unavailable)
    │   └── icon.png                 ← app icon
    ├── app.json
    ├── tsconfig.json
    ├── package.json
    └── .env                         ← EXPO_PUBLIC_API_URL (backend URL)
```

---

## BRAND DESIGN SYSTEM

Apply these consistently across all screens. Never use hardcoded hex values outside `constants/colors.ts`.

```typescript
// constants/colors.ts
export const Colors = {
  primary: '#1A6B4A',        // FreshKira deep green — primary buttons, active states
  primaryLight: '#E8F5EE',   // light green — backgrounds, cards
  primaryMid: '#2E8B6A',     // mid green — hover states, secondary elements
  accent: '#F0C060',         // warm gold — highlights, mode 3 (ROI)
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#059669',

  // Mode colours
  modeTrendScan: '#1A6B4A',   // green — Mode 1
  modePriceReview: '#1E40AF', // blue — Mode 2
  modeROICheck: '#7C3AED',    // purple — Mode 3
};
```

**Typography:** Use system font (San Francisco on iOS, Roboto on Android) via `fontFamily: 'System'`. Sizes: 24 (screen title), 18 (section header), 16 (body), 14 (secondary), 12 (caption).

**Spacing:** 8px base unit. Use multiples: 8, 16, 24, 32, 48.

**Border radius:** 12px for cards, 8px for buttons, 24px for pills/badges.

---

## SCREEN SPECIFICATIONS

### Screen 1: Home (app/index.tsx)

**Purpose:** Mode selection. The first screen the user sees.

**Layout:**
- FreshKira logo top-centre (64px height)
- Tagline: "Brand Intelligence. In 10 minutes."
- Subtitle: "RM5,000 budget. 3-person team. Full agency output."
- Three `ModeCard` components stacked vertically
- Bottom: small "View History" link

**ModeCard component props:**
```typescript
interface ModeCardProps {
  mode: 'TREND_SCAN' | 'PRICE_REVIEW' | 'ROI_CHECK';
  title: string;
  subtitle: string;
  description: string;
  icon: string; // Ionicons name
  color: string; // from Colors
  onPress: () => void;
}
```

**Three mode cards:**

| Mode | Title | Subtitle | Icon |
|---|---|---|---|
| TREND_SCAN | Trend Scan | TikTok & Shopee intelligence | trending-up-outline |
| PRICE_REVIEW | Price Review | Competitive pricing matrix | pricetag-outline |
| ROI_CHECK | ROI Check | Budget & KPI projections | calculator-outline |

---

### Screen 2: Trend Scan (app/trend-scan.tsx)

**Purpose:** Collect input and display Mode 1 output.

**Input fields:**
1. Product category (text input, placeholder: "e.g. skincare, toner, sunscreen")
2. Target audience (text input, placeholder: "e.g. Gen Z Malaysian women 18–32")
3. Key competitor to monitor (text input, placeholder: "e.g. GlowMY", default: "GlowMY")
4. Additional context (multiline text, optional, placeholder: "Any campaign context, upcoming events, etc.")

**Pre-fill defaults:**
- Product category: "Malaysian skincare (toner, serum, moisturiser, sunscreen, sleeping mask)"
- Target audience: "Gen Z and Millennial Malaysian women, aged 18–32, Klang Valley"
- Competitor: "GlowMY"

**Submit button:** "Run Trend Scan" (primary green)

**Output display:** `StreamingOutput` component. Renders markdown as it streams in.

---

### Screen 3: Price Review (app/price-review.tsx)

**Purpose:** Collect pricing data and display Mode 2 output.

**Input fields:**
1. FreshKira price list (large multiline text, pre-filled with all 10 SKUs from KB1)
2. Competitor pricing data (large multiline text, placeholder with example format)
3. Upcoming sale events (text input, placeholder: "e.g. 11.11, 12.12, Raya")
4. Additional context (multiline text, optional)

**Pre-fill for FreshKira price list:**
```
FK-TON-001 Luminous Rice Toner 150ml — RM45
FK-SER-002 Snail Repair Serum 30ml — RM89
FK-MSK-003 Blemish Control Clay Mask 75ml — RM58
FK-MOI-004 Barrier Boost Moisturiser 50ml — RM72
FK-EYE-005 Brightening Vitamin C Eye Cream 15ml — RM95
FK-CLN-006 Gentle Foam Cleanser 150ml — RM38
FK-SUN-007 SPF 50 PA++++ Sunscreen Fluid 50ml — RM65
FK-EXF-008 AHA BHA Exfoliating Essence 30ml — RM79
FK-MSK-009 Overnight Sleeping Mask 60ml — RM68
FK-MST-010 Pore Minimising Essence Mist 100ml — RM42
```

**Submit button:** "Run Price Review" (primary blue)

---

### Screen 4: ROI Check (app/roi-check.tsx)

**Purpose:** Collect budget allocation and display Mode 3 output.

**Input fields:**
1. Total monthly budget (numeric input, default: "5000", prefix: "RM")
2. Budget breakdown (large multiline text, pre-filled with example allocation)
3. Average order value (numeric input, default: "75", prefix: "RM")
4. 30-day targets: followers (numeric, default: "10000"), orders (numeric, default: "500")
5. Additional context (multiline text, optional)

**Pre-fill for budget breakdown:**
```
TikTok Shop affiliate creators (3 micro, 10K–50K followers): RM1,500
Shopee Sponsored Ads (CPC): RM1,000
TikTok Shop LIVE sessions (team-run, 2x/week): RM0
Shopee Flash Sale slots (seller discount only): RM0
Content creation (smartphone + AI tools): RM0
Product seeding (5 micro-influencers, COGS only): RM500
Paid TikTok/Instagram boosting: RM500
Contingency: RM1,000
TOTAL: RM4,500
```

**Submit button:** "Run ROI Check" (primary purple)

**Note:** Mode 3 uses `deepseek-reasoner` (R1 model). Display a small badge "Powered by DeepSeek R1" near the output header to differentiate.

---

### Screen 5: History (app/history.tsx)

**Purpose:** View and revisit past agent outputs.

**Layout:**
- List of past runs, sorted newest first
- Each item shows: mode badge (colour-coded), timestamp, first 100 characters of output
- Tap to open full output in a modal
- Swipe left to delete individual history item
- "Clear All" button in the top-right header

**Storage:** AsyncStorage key `@freshkira/history`. Store as array of `HistoryItem`:
```typescript
interface HistoryItem {
  id: string;          // uuid
  mode: AgentMode;
  timestamp: string;   // ISO string
  input: string;       // user's combined input summary
  output: string;      // full markdown output
}
```

Maximum 50 items. Trim oldest when limit is reached.

---

## STREAMING OUTPUT COMPONENT

This is the most important UI component. The output must stream token-by-token like a typewriter, rendered as formatted markdown.

**Component: components/StreamingOutput.tsx**

States to handle:
- `idle` — nothing running, show placeholder
- `loading` — first tokens not yet received, show pulsing skeleton
- `streaming` — tokens arriving, render markdown progressively
- `done` — complete, show share button and "Save to History" button
- `error` — API or network error, show error message with retry button

**Behaviour:**
- Use `react-native-markdown-display` for markdown rendering
- Tables must render as scrollable horizontal views (Markdown tables are wide)
- Stream must update the displayed text on every chunk received from SSE
- "Copy to clipboard" button appears in the top-right of the output area when done
- "Share" button uses `react-native`'s `Share` API — shares plain text (strips markdown)
- "Save to History" button saves to AsyncStorage via `useHistory` hook

---

## TYPESCRIPT TYPES (types/index.ts)

```typescript
export type AgentMode = 'TREND_SCAN' | 'PRICE_REVIEW' | 'ROI_CHECK';

export interface AgentRequest {
  mode: AgentMode;
  userInput: string;        // the user's context/data for this run
}

export interface AgentStreamChunk {
  content: string;          // the text chunk from the stream
  done: boolean;            // true on final chunk
}

export interface HistoryItem {
  id: string;
  mode: AgentMode;
  timestamp: string;
  input: string;
  output: string;
}

export interface ModeConfig {
  mode: AgentMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  model: 'deepseek-chat' | 'deepseek-reasoner';
}
```

---

## CUSTOM HOOK: useAgent (hooks/useAgent.ts)

```typescript
// Signature only — Claude Code implements the body
export function useAgent() {
  // state: output (string), status (AgentStatus), error (string | null)
  // function: runAgent(request: AgentRequest) => Promise<void>
  //   - calls backend /api/agent with fetch + ReadableStream
  //   - reads SSE chunks and appends to output string
  //   - sets status through idle → loading → streaming → done / error
  //   - on done: saves to history via useHistory hook
  // function: reset() — clears output and sets status back to idle
  return { output, status, error, runAgent, reset };
}
```

---

## BACKEND SPECIFICATION

### FastAPI entry point (backend/main.py)

- Single FastAPI app
- CORS middleware: allow all origins in development; restrict to Expo and production domains in production
- Mount the `agent` router at `/api`
- Health check endpoint: `GET /health` returns `{ "status": "ok" }`

### Agent endpoint (backend/routers/agent.py)

```
POST /api/agent
Content-Type: application/json
Body: { "mode": "TREND_SCAN" | "PRICE_REVIEW" | "ROI_CHECK", "userInput": string }

Response: text/event-stream (SSE)
Each event: data: {"content": "...", "done": false}
Final event: data: {"content": "", "done": true}
```

**Validation:**
- `mode` must be one of the three valid values — return 422 if not
- `userInput` must not be empty — return 422 if empty
- Max `userInput` length: 5000 characters — return 413 if exceeded

### Prompt builder (backend/services/prompt_builder.py)

This service constructs the full message payload sent to DeepSeek. It:

1. Loads the system prompt from `prompts/system_prompt.md`
2. Loads all four KB files from the `knowledge/` directory
3. Concatenates them into a single system message:
```
[SYSTEM PROMPT CONTENT]

---
## KNOWLEDGE BASE

### KB1: FreshKira Product Catalogue
[KB1 content]

### KB2: Brand Tone Guide
[KB2 content]

### KB3: Competitor Pricing Sheet
[KB3 content]

### KB4: Malaysian E-Commerce Calendar
[KB4 content]
```
4. Constructs the user message from the mode trigger phrase + userInput:
```
TREND SCAN: [userInput]      ← for TREND_SCAN mode
PRICE REVIEW: [userInput]    ← for PRICE_REVIEW mode
ROI CHECK: [userInput]       ← for ROI_CHECK mode
```

**File loading:** Load KB files once at application startup (use FastAPI lifespan events), cache in memory. Do not reload on every request.

### DeepSeek client (backend/services/deepseek.py)

- Use the `openai` Python library with `base_url="https://api.deepseek.com"` and the DeepSeek API key
- Model selection:
  - TREND_SCAN → `deepseek-chat` (DeepSeek V3)
  - PRICE_REVIEW → `deepseek-chat` (DeepSeek V3)
  - ROI_CHECK → `deepseek-reasoner` (DeepSeek R1)
- Enable streaming: `stream=True`
- Max tokens: 4096 for V3 modes, 8192 for R1 (ROI calculations are longer)
- Temperature: 0.7 for V3 (creative but structured), 1.0 for R1 (R1 doesn't support temperature — omit the parameter)
- Stream each chunk as an SSE event immediately — do not buffer

**Important for R1:** DeepSeek-R1 returns `reasoning_content` (chain-of-thought) separately from `content`. Only stream the `content` field to the client — do not send `reasoning_content`. The thinking happens server-side invisibly.

### Environment variables

**Backend (.env):**
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
ENVIRONMENT=development
```

**Mobile (.env):**
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

In production, `EXPO_PUBLIC_API_URL` points to the Railway deployment URL.

### requirements.txt
```
fastapi
uvicorn[standard]
openai
python-dotenv
pydantic
```

### Procfile (Railway deployment)
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## SYSTEM PROMPT FILE (backend/prompts/system_prompt.md)

Create this file with the following content — this is the agent's core intelligence:

```
You are FreshKira's E-Commerce Intelligence Super Agent — an AI strategist built for a Malaysian D2C skincare brand competing on TikTok Shop and Shopee. Your job is to replace hours of manual competitor research, pricing analysis, and campaign ROI calculation.

## YOUR IDENTITY & CONTEXT

Brand: FreshKira — a Malaysian D2C skincare brand, 3-person team, Petaling Jaya, Selangor.
Legal entity: FreshKira Sdn. Bhd. JAKIM halal-certified. NPRA compliant. GMP-certified.
Current GMV: RM45,000/month.
Primary competitor: GlowMY (RM180,000/month, launched 3 months ago, posts 3x/day via AI content).
Monthly marketing budget: RM5,000 hard ceiling.
30-day KPI targets: 10,000 followers, 500 orders, RM60,000 GMV.

Every recommendation must be executable within RM5,000/month. Every output must reference the KPI targets and state whether the recommendation contributes to them.

## HOW YOU OPERATE

Detect the mode from the trigger phrase at the start of the user's message:
- "TREND SCAN:" → Mode 1: TikTok & Shopee Trend Analyst
- "PRICE REVIEW:" → Mode 2: Pricing Optimiser
- "ROI CHECK:" → Mode 3: ROI Calculator

Always confirm the active mode at the top of your response as a single bold header line.

## MODE 1: TREND ANALYST (trigger: TREND SCAN:)

Output structure (always follow this order):

**Section A: Platform Trend Summary**
- Top 5 TikTok content formats winning in Malaysia for this category (format name, why it works, ideal length)
- Top 3 trending TikTok sounds/audio (if available)
- Top 5 TikTok hashtags by reach
- Top 10 Shopee search keywords this month (flag commercial intent vs discovery intent)
- 3 long-tail keyword opportunities

**Section B: Competitor Radar**
Table with 3 rows: Competitor | Campaign mechanic | Why it works | Borrow vs. Avoid

**Section C: Content Brief Cards**
3 cards, each containing:
- Format (TikTok 15s / 30s / Shopee Live / Reel)
- Concept title
- Hook (exact opening line — write it out)
- Core message (one sentence)
- CTA (exact text)
- Hashtags (5–7, include at least 2 BM hashtags)
- Best posting time (MY timezone)
- Production difficulty (Low/Medium/High for 3-person team with smartphones)
- Est. production cost (RM)
- KPI contribution (projected followers and/or orders)

**Section D: Budget Allocation Snapshot**
Table showing how the 3 content ideas + any paid amplification fit within RM5,000/month.
Total must be ≤ RM5,000. Rebalance if over.

**Section E: Run This Next**
One specific action the team can take in the next 24 hours.

Malaysian Market Rules:
- All content hooks must include BM phrasing options alongside English
- Reference: Ramadan, Raya, Merdeka, CNY, Deepavali, 11.11, 12.12, school holidays
- Prioritise Shopee Live and TikTok Shop affiliate trends
- Zero generic global advice — everything must be grounded in Malaysian platform behaviour
- All content producible by a 3-person team with smartphones and AI tools

## MODE 2: PRICING OPTIMISER (trigger: PRICE REVIEW:)

Output structure:

**Section A: Competitive Pricing Matrix**
Table: SKU Name | FreshKira Price (RM) | Competitor Avg (RM) | Gap (RM) | Gap (%) | Position
Position: UNDERPRICED / COMPETITIVE / PREMIUM / OVERPRICED

**Section B: Net Margin Check**
Table: SKU | Retail Price | After TikTok Shop (8%) | After Shopee (5%) | After 20% 11.11 Discount | Margin Safe? (Y/N)

**Section C: SKU Recommendations**
For each SKU: Current situation | Recommendation (with RM figure) | Rationale | Risk | KPI link

**Section D: Seasonal Pricing Calendar**
Table covering: 11.11, 12.12, Raya, CNY, Shopee Birthday.
For each: Discount depth | SKUs to discount | Bundle opportunity | Flash sale vs voucher | Free shipping threshold

**Section E: Strategy Summary + Immediate Action**
One paragraph (max 100 words) + one single highest-impact action this week.

Malaysian Market Rules:
- Always account for platform commission rates in net margin
- JAKIM halal and KKM registration are free differentiators — use them to justify premium pricing
- Consider RM1–RM5 price increment psychology for Malaysian consumers
- "Buy 2 free 1" is the dominant bundle mechanic in Malaysian skincare

## MODE 3: ROI CALCULATOR (trigger: ROI CHECK:)

Use these Malaysian platform benchmarks:
- TikTok affiliate (micro 10K–100K): RM300–800/creator, 20–80 orders per activated creator
- TikTok Shop LIVE (2hr session): 300–1,500 viewers, 2–5% purchase rate, avg order RM75
- Shopee Sponsored Ads (CPC): RM0.20–0.50/click, 3–5% conversion
- Shopee Flash Sale: RM0 cash cost (seller discount only), 3–10x normal daily orders
- Product seeding: RM0 cash (COGS only), 500–2,000 views per post
- Paid TikTok/Meta ads: RM2–8 per new follower
- Average order value: RM75

Output structure:

**Section A: Budget Allocation Table**
Table: Channel | Planned Spend (RM) | % of Budget
Show total. Flag if over RM5,000.

**Section B: Projected Outcomes per Channel**
Table: Channel | Spend (RM) | Projected Reach | Followers Gained | Orders | GMV (RM) | Cost per Order
Show working for each calculation.

**Section C: KPI Gap Analysis**
Table: KPI | Target | Projected | Gap | Status (On track / At risk / Off track)
KPIs: Followers, Orders, GMV, Budget used

**Section D: Optimised Allocation (only if any KPI is At risk or Off track)**
Priority channel ranking (highest ROI first for FreshKira):
1. TikTok Shop LIVE (highest conversion, zero ad spend)
2. Shopee Flash Sale slots (zero cash cost, high volume)
3. Micro-affiliate seeding (scalable, measurable)
4. Shopee Sponsored Ads (predictable CPC)
5. Paid social ads (highest cost per follower — use last)

Show revised allocation table + revised projected outcomes.

**Section E: 30-Day ROI Summary**
Table: Total budget deployed | Total projected orders | Projected GMV | Cost per order | Cost per follower | ROAS (GMV ÷ spend) | Verdict

**Section F: Week-by-Week Execution Plan**
4 rows (Week 1–4): Focus | Key actions (max 3) | Budget this week (RM) | Expected outputs by end of week

## GENERAL RULES (all modes)

1. Never give vague advice. Every output must be specific enough to act on today.
2. Format all outputs as tables, headers, and bullets — no large prose paragraphs.
3. If real-time data is unavailable, state: "Based on platform behaviour patterns as of [month/year]. Verify in Shopee Seller Centre / TikTok Creative Centre before acting."
4. Write as if presenting to FreshKira's commercial director.
5. All outputs must reflect Malaysian platform behaviour. No generic global advice.
```

---

## KNOWLEDGE BASE FILES

Place the following files in `backend/knowledge/`. These are the files already created:

- `KB1_FreshKira_Product_Catalogue.md` — 10 SKUs with prices, KKM numbers, ingredients, bundles
- `KB2_FreshKira_Brand_Tone_Guide.md` — voice pillars, word bank, review framework, FAQs
- `KB3_Competitor_Pricing_Sheet.md` — Skintific, GlowMY, OatSkin, SkincraftMY, Luminos, SkinbyU pricing
- `KB4_Malaysian_Ecommerce_Calendar.md` — sale events, cultural moments, platform mechanics

Copy these files from wherever they are stored into `backend/knowledge/` before running the backend.

---

## ERROR HANDLING

### Backend errors to handle:
- DeepSeek API key missing → 500 with clear message
- DeepSeek API rate limit (429) → stream an error message: "The AI model is currently busy. Please try again in 30 seconds."
- DeepSeek API timeout → stream an error message after 30 seconds
- Invalid mode → 422 Unprocessable Entity
- KB files missing → warn in startup logs, continue without them (agent will still function)

### Mobile errors to handle:
- Network unreachable → show "No internet connection. Please check your connection and try again."
- Backend URL not configured → show setup instructions
- Stream interrupted mid-output → show what was received + "Response was interrupted. Please try again."
- Empty output from API → show "The agent did not return a response. Please try again."

All error states must show a "Try Again" button that resets the form and clears the output.

---

## NAVIGATION STRUCTURE

```
/ (index.tsx)          ← Tab: Home
/trend-scan            ← Stack pushed from Home
/price-review          ← Stack pushed from Home
/roi-check             ← Stack pushed from Home
/history               ← Tab: History
```

Use Expo Router's stack navigator inside a tab layout. Two tabs at the bottom: Home and History. The mode screens are pushed onto the stack from Home.

---

## RUNNING THE PROJECT

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your DEEPSEEK_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Mobile
```bash
cd mobile
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://localhost:8000
npx expo start
```

Scan the QR code with Expo Go on your phone.

For iOS simulator: press `i`. For Android emulator: press `a`.

---

## DEPLOYMENT

### Backend (Railway)
1. Push `backend/` to a GitHub repo
2. Connect Railway to the repo
3. Set environment variable: `DEEPSEEK_API_KEY`
4. Railway auto-detects the Procfile and deploys
5. Copy the Railway domain (e.g. `https://freshkira-agent.railway.app`)

### Mobile (update .env)
```
EXPO_PUBLIC_API_URL=https://freshkira-agent.railway.app
```

For the presentation demo, use Expo Go with the production backend URL. This way the app runs on real phones without needing a build.

---

## WHAT NOT TO DO

- Do not expose `DEEPSEEK_API_KEY` in the mobile app or any client-side code
- Do not use `axios` — use the native `fetch` API for the SSE stream
- Do not attempt to render markdown in plain `<Text>` components — use `react-native-markdown-display`
- Do not store API keys in `app.json` or `app.config.js`
- Do not block the UI during streaming — the input form should be disabled but not unmounted
- Do not send `reasoning_content` from DeepSeek R1 to the client — only send `content`
- Do not skip the loading skeleton — the first 2–5 seconds before streaming starts looks broken without it
- Do not use `expo-router`'s `<Redirect>` on the root — use the tab layout directly
- Do not reload KB files on every request — cache them at startup

---

## PRESENTATION DEMO CHECKLIST

Before presenting:
- [ ] Backend deployed to Railway and health check returns 200
- [ ] Mobile `.env` points to Railway URL (not localhost)
- [ ] All four KB files in `backend/knowledge/`
- [ ] Expo Go installed on the demo phone
- [ ] App loaded and home screen visible before going on stage
- [ ] Pre-run all three modes once to confirm outputs are working
- [ ] Screenshots of all three outputs saved locally as fallback
- [ ] Airplane mode fallback plan: screenshots in camera roll

---

*FreshKira E-Commerce Intelligence App | KYouth Capstone 6: Digital Marketing*
*Built with React Native (Expo) + TypeScript + DeepSeek API + FastAPI*
