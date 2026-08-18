# PoliticalPulse Analytics Platform

A full-stack research platform for analyzing political communications, digital presence, and audience engagement patterns in India.

**Status:** Development Phase (v0.1.0)  
**Updated:** 2026-08-15

## 🎯 Overview

PoliticalPulse provides a comprehensive toolkit for:

- **Data Collection & Quality** - Import, validate, and assess political communications data
- **Analytics & Insights** - Aggregate engagement metrics, topic analysis, sentiment distribution
- **Peer Benchmarking** - Compare accounts against synthetic peer cohorts
- **AI-Driven Analysis** - Evidence-based insights and opportunity identification
- **Export & Reporting** - Generate reports in JSON, CSV, and text formats

## Current implementation status

The current submission demonstrates the complete local frontend/backend
architecture and API integration using a controlled demo dataset.

The analytics endpoints are functional and the React frontend consumes
the Express API.

The current dataset is synthetic/demo data and is intentionally separated
from the application layer so that real public-source data can be plugged
into the same analytics pipeline in a subsequent iteration.

Future extensions include:
- real public social-media data ingestion
- persistent database-backed analytics
- NLP-based language detection
- sentiment analysis
- topic classification
- dynamic peer benchmarking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+ (for data scripts)

### Installation

```bash
git clone <repo-url>
cd Political-Pulse
pnpm install
```

### Run Development Stack

```bash
# Terminal 1: Backend API
cd artifacts/api-server && pnpm dev

# Terminal 2: Frontend
cd artifacts/politicalpulse && pnpm dev

# Terminal 3: Data pipeline (optional)
cd scripts && python import_csv.py && python data_quality.py
```

**Access:**

- Frontend: http://localhost:5173
- API: http://localhost:3000/api

## 📊 Features

### Analytics Dashboard

- Real-time engagement metrics
- Topic distribution and trends
- Platform-specific performance
- Sentiment and language analysis
- Comment and interaction patterns

### Peer Benchmarking

- Compare against reference cohorts
- Identify performance gaps
- Contextualize metrics within peer groups
- Generate comparison reports

### AI Analyst

- Ask evidence-driven questions about your data
- Get structured responses with metrics and evidence
- Automatic opportunity identification
- Track patterns and trends

### Data Quality

- Automated validation checks
- Issue detection and reporting
- Quality scoring by dataset
- Data lineage and provenance

### Export & Reporting

- Export to JSON (structured data)
- Export to CSV (tabular data)
- Generate text summaries
- Batch reporting for multiple periods

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
API Gateway (Express)
    ↓
├─ Analytics Services (Python aggregations)
├─ AI Analyst (Evidence-driven responses)
├─ Export Services (JSON/CSV/PDF)
└─ Database (PostgreSQL, optional)
```

### Tech Stack

**Frontend:**

- React 19
- Vite
- TypeScript
- Recharts
- Tailwind CSS
- shadcn/ui

**Backend:**

- Express 5
- TypeScript
- Drizzle ORM
- Pino (logging)

**Data:**

- Python 3.10+
- pandas, numpy (analysis)
- PostgreSQL 14+ (optional)

## 📖 Documentation

- [Environment Contract](./ENVIRONMENT_CONTRACT.md) - Setup, deployment, API contract
- [API Documentation](#api-reference) - Endpoint reference and examples
- [Data Pipeline](./scripts/README.md) - CSV ingestion, quality checks, analytics
- [Component Guide](./artifacts/politicalpulse/COMPONENTS.md) - UI components

## 🔌 API Reference

### Analytics Endpoints

```
GET  /api/analytics/overview       - Activity summary
GET  /api/analytics/topics         - Topic distribution
GET  /api/analytics/sentiment      - Sentiment breakdown
GET  /api/analytics/languages      - Language mix
GET  /api/analytics/platforms      - Platform presence
GET  /api/analytics/engagement     - Engagement patterns
GET  /api/analytics/peers          - Peer profiles
GET  /api/analytics/peers/:id      - Specific peer
GET  /api/analytics/peers/:id/comparison
     - Peer comparison analysis
```

### AI Analyst Endpoints

```
POST /api/analyst                  - Ask a question
GET  /api/analyst/opportunities    - Get identified opportunities
GET  /api/analyst/context          - Get full analytics context
```

### Export Endpoints

```
GET  /api/export/json?include=...  - Export as JSON
GET  /api/export/csv?include=...   - Export as CSV
GET  /api/export/summary           - Text summary report
```

### Data Quality

```
GET  /api/quality                  - Quality report
```

### Health Check

```
GET  /api/healthz                  - Server status
```

## 💾 Data Schema

### Core Tables

**politicians**

- Account metadata (name, role, constituency, party)

**accounts**

- Platform-specific details (handle, followers, verified status)

**posts**

- Individual posts (content, date, platform, engagement metrics)

**comments**

- Post comments (author, text, sentiment, engagement)

**topics**

- Topic taxonomy and mappings

**peer_groups**

- Peer cohort definitions and benchmarks

**analysis_runs**

- Historical snapshots of analytics

See [lib/db/src/schema/index.ts](./lib/db/src/schema/index.ts) for complete definitions.

## 🔄 Data Pipeline

### 1. Import CSV

```bash
python scripts/import_csv.py
```

Normalizes CSV data:

- Validates required fields
- Deduplicates rows
- Normalizes dates and engagement metrics
- Generates import report

### 2. Quality Assessment

```bash
python scripts/data_quality.py
```

Checks for:

- Duplicate rows
- Missing values
- Invalid dates
- Malformed URLs
- Language classification issues

### 3. Analytics Aggregation

```bash
python scripts/analytics.py
```

Computes:

- Topic distribution and engagement
- Sentiment analysis by topic
- Language mix and multilingual content
- Engagement trends over time
- Platform-specific metrics

## 🎨 Frontend Usage

### Analytics Views

1. **Overview** - At-a-glance dashboard
2. **Topic Analysis** - Content themes and engagement
3. **Peer Benchmarking** - Comparison against cohorts
4. **Data Quality** - Assessment and issues
5. **AI Analyst** - Evidence-driven insights
6. **Improvement Opportunities** - Actionable recommendations

### Navigation

- Analyze: Main analytics dashboard
- Understand: Topic opportunities and peer comparison
- Synthesis: Overall analysis and data-driven insights
- Analyst: AI-powered Q&A
- Improve: Opportunity recommendations
- Provenance: Data quality and methodology

## 🛠️ Development

### Code Structure

```
artifacts/api-server/
├── src/
│   ├── routes/        # Endpoint handlers
│   ├── lib/           # Utilities & services
│   │   ├── logger.ts
│   │   ├── analyticsContext.ts   (Phase 5)
│   │   ├── aiAnalyst.ts          (Phase 5)
│   ├── app.ts         # Express setup
│   └── index.ts       # Entry point
└── tsconfig.json

artifacts/politicalpulse/
├── src/
│   ├── services/      # API clients
│   │   ├── api.ts     # Analytics fetchers
│   │   ├── aiService.ts (Updated Phase 6)
│   ├── features/      # Page components
│   │   └── analysis-pages.tsx
│   ├── components/    # UI components
│   └── types/         # TypeScript types
└── vite.config.ts
```

### Build & Test

```bash
# Typecheck all packages
pnpm run typecheck

# Build for production
pnpm run build

# Lint code
pnpm run lint

# Clean build artifacts
pnpm run clean
```

### Making Changes

1. **Add endpoint:**
   - Create route handler in `artifacts/api-server/src/routes/`
   - Register in `artifacts/api-server/src/routes/index.ts`

2. **Add API client:**
   - Add fetcher in `artifacts/politicalpulse/src/services/api.ts`
   - Use in component with fallback data

3. **Add quality check:**
   - Edit `scripts/data_quality.py`
   - Test with `python scripts/data_quality.py`

4. **Add type:**
   - Define in `artifacts/politicalpulse/src/types/index.ts`
   - Update TypeScript interfaces as needed

## 📊 Example Workflows

### Export Full Analytics Report

```bash
curl "http://localhost:3000/api/export/json?include=analytics,quality,peers,opportunities&period=12weeks" \
  > analytics_report.json
```

### Ask AI Analyst a Question

```bash
curl -X POST http://localhost:3000/api/analyst \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the strongest performing topics?",
    "accountName": "Darshan Puttannaiah",
    "period": "12 weeks"
  }'
```

### Get Identified Opportunities

```bash
curl "http://localhost:3000/api/analyst/opportunities?accountName=Darshan%20Puttannaiah&period=12weeks"
```

### Export as CSV

```bash
curl "http://localhost:3000/api/export/csv?include=topics,platforms,engagement" \
  > analytics.csv
```

## 🧪 Testing

### Manual Verification

- [ ] API responds: `curl http://localhost:3000/api/healthz`
- [ ] Analytics data loads in frontend
- [ ] Peer benchmarking view renders
- [ ] AI analyst responds to questions
- [ ] Exports generate without errors
- [ ] Data quality report accessible

### Automated Tests

```bash
pnpm run test           # Unit tests
pnpm run test:integration  # Integration tests
pnpm run test:coverage  # Coverage report
```

## 🔐 Security Considerations

### Current Status (Development)

- Mock data only
- CORS enabled for localhost
- No authentication required

### Production Requirements

- [ ] Add authentication/authorization
- [ ] Use HTTPS for all endpoints
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Secure environment variables
- [ ] Enable request logging for audit trails

See [ENVIRONMENT_CONTRACT.md](./ENVIRONMENT_CONTRACT.md#security-notes) for production checklist.

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd artifacts/politicalpulse
vercel deploy
```

### Backend (Heroku)

```bash
cd artifacts/api-server
heroku create <app>
heroku config:set NODE_ENV=production
git push heroku main
```

### Docker

```bash
docker build -f Dockerfile.backend -t political-pulse-api .
docker build -f Dockerfile.frontend -t political-pulse-web .
docker run -p 3000:3000 political-pulse-api
docker run -p 80:80 political-pulse-web
```

## 📝 Phases Completed

- ✅ Phase 1: Database schema
- ✅ Phase 2: CSV import pipeline
- ✅ Phase 3: Data quality assessment
- ✅ Phase 4: Analytics aggregation & endpoints
- ✅ Phase 5: AI analyst backend (analytics-context builder, evidence-driven responses)
- ✅ Phase 6: Frontend integration (live API wiring)
- ✅ Phase 7: Export flows & documentation

## 🗺️ Future Roadmap

- [ ] Real database connectivity (replace mock data)
- [ ] ML/NLP integration (sentiment & topic models)
- [ ] Historical tracking (multi-period analysis)
- [ ] Real-time data collection (API integrations)
- [ ] User authentication & multi-account support
- [ ] Report scheduling & email delivery
- [ ] Advanced visualization (maps, networks)
- [ ] REST API client generation

## 📄 License & Ethics

This project processes publicly available political communications data.

**Data Ethics Commitment:**

- Only public data collected
- No private/personal information stored
- Transparent labeling of synthetic/demo data
- Results used for research and analysis only
- No claims of political evaluation or judgment

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes: `pnpm run typecheck && pnpm run build`
4. Commit: `git commit -m "feat: description"`
5. Push and open PR

See [ENVIRONMENT_CONTRACT.md](./ENVIRONMENT_CONTRACT.md#contributing) for detailed guidelines.

## 📚 Additional Resources

- [Environment & Deployment Guide](./ENVIRONMENT_CONTRACT.md)
- [Data Pipeline Documentation](./scripts/README.md)
- [API Specification](./lib/api-spec/openapi.yaml)
- [Component Library](./artifacts/mockup-sandbox/)

---

**Version:** 0.1.0 (Development)  
**Last Updated:** 2026-08-15  
**Maintained by:** Development Team
