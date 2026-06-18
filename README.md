# whoreadtos

> Who reads TOS? We do.

Chrome extension that detects Terms of Service pages and gives you a plain-English breakdown with a grade A–F in seconds.

## Project structure

```
whoreadtos/
├── extension/          Chrome extension (Manifest V3)
└── web/                Next.js backend + landing page
```

## Setup

### 1. Clone

```bash
git clone https://github.com/yourusername/whoreadtos.git
cd whoreadtos
```

### 2. Backend (web/)

```bash
cd web
npm install
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### 3. Run in development

```bash
cd web
npm run dev
# → http://localhost:3000
```

The API will be available at `http://localhost:3000/api/analyze`.

### 4. Point the extension to localhost (development)

Open `extension/popup.js` and change the first line:

```js
// Development
const API_BASE = 'http://localhost:3000';

// Production (default)
const API_BASE = 'https://whoreadtos.vercel.app';
```

### 5. Load the extension in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. The whoreadtos extension will appear in your toolbar

### 6. Test it

Navigate to any Terms of Service page (e.g. `github.com/terms`). The extension badge will show **TOS**. Click the icon to analyze.

## Deploy to Vercel

```bash
cd web
npx vercel --prod
```

Set `ANTHROPIC_API_KEY` in your Vercel project environment variables:

```
Settings → Environment Variables → ANTHROPIC_API_KEY
```

Or via CLI:

```bash
vercel env add ANTHROPIC_API_KEY
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

## How it works

1. **Detection** — `background.js` watches tab URLs and titles for TOS keywords and sets the badge
2. **Extraction** — When you click the popup on a TOS page, it extracts up to 8,000 chars of page text
3. **Analysis** — Text is sent to `/api/analyze` which calls Claude Haiku
4. **Results** — 5 key findings with risk levels + an A–F grade appear in the popup

## Privacy

- No user data is stored
- No analytics or tracking
- No account required
- Text is sent to the API only for analysis and discarded immediately
