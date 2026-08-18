# CivicTrack — Digital Civic Issue Reporting Platform
### HackNova'26 · Problem Statement S-16 · SDG 11 — Sustainable Cities and Communities

---

## 1. Problem Statement

Citizens have no easy, transparent way to report civic issues — potholes, garbage overflow, broken streetlights, water leakage — and no way to track resolution. Complaints made via phone calls or municipal offices get lost in the system, leaving no accountability or status visibility for either citizens or authorities. This erodes public trust and results in civic issues going unresolved for months.

**Core pain points:**
- No single, trusted channel to report an issue
- No visibility into what happens after a report is filed
- No prioritization — a burst water main and a faded road marking get equal treatment
- No proof that a "resolved" issue was actually fixed
- Departments lack data to identify systemic, recurring problem areas

---

## 2. Target Audience

| Segment | Role |
|---|---|
| **Citizens** (primary) | Any urban resident reporting issues in their neighborhood |
| **Ward/field officers** (primary) | Municipal staff who triage, act on, and close issues |
| **Department heads / administrators** (secondary) | Oversee performance across wards and departments |
| **City leadership / council** (secondary) | Uses aggregate data for budget and policy decisions |
| **NGOs / RWAs (Resident Welfare Associations)** (secondary) | Advocate on behalf of communities, verify ground reality |

---

## 3. Solution Overview

**CivicTrack** is a citizen-to-government issue reporting and resolution platform with three connected surfaces:

1. **Citizen App/Web** — report issues in under 30 seconds with a photo, auto-location, and category
2. **Officer Console** — a triage and field-work tool for ward staff to act on assigned issues
3. **Admin Dashboard** — city-wide analytics, SLA compliance, and transparency reporting for administrators and the public

### Core Features
- Photo + geotagged issue submission, category auto-suggestion
- AI-assisted **duplicate detection** (image similarity + geo-proximity clustering)
- **Auto-routing** to the correct ward/department based on location and category
- Full status lifecycle: `Reported → Acknowledged → In Progress → Resolved → Verified`
- **SLA timers** with automatic escalation on breach
- **Proof-of-resolution**: officer must upload an after-photo; citizen confirms or disputes closure
- Public map + leaderboard for ward/department transparency
- **Offline-first** reporting (queues locally, syncs on reconnect)
- **WhatsApp/SMS bot** channel for non-smartphone or low-literacy users
- Upvoting and severity-weighted prioritization

---

## 4. What's Different From Existing Solutions

Reference apps: Swachhata App, MyGov, municipal apps (BBMP Sahaaya, PMC Care), FixMyStreet, SeeClickFix.

| Gap in Existing Apps | Why It Matters | CivicTrack's Fix |
|---|---|---|
| No enforced SLA | Issues sit at "In Progress" indefinitely | SLA timers + automatic escalation to next-level officer |
| Duplicate reports flood the system | Wastes officer time triaging the same pothole 50 times | AI clustering by geo-proximity + image similarity into one ticket, with an affected-citizens counter |
| No prioritization logic | Minor and critical issues treated equally | Severity-weighted score (category risk × upvotes × population density) |
| Poor department routing | Complaints ping-pong between departments | Rule-based + geofenced auto-routing engine, refined over time |
| Low citizen trust ("complaint black hole") | People stop reporting | Public status tracking + transparency leaderboard |
| No offline reporting | Requires data connectivity at the exact moment of noticing an issue | Offline-first local queue with background sync |
| No verification of resolution | Officers close tickets without proof | Mandatory after-photo + citizen confirm/dispute step |
| App-only, excludes non-smartphone users | Excludes a large user segment | WhatsApp/SMS bot reporting channel |

---

## 5. System Architecture

```
                         ┌─────────────────────────┐
                         │      Citizen Clients      │
                         │  Mobile App (iOS/Android) │
                         │  Web App (PWA)             │
                         │  WhatsApp/SMS Bot           │
                         └────────────┬──────────────┘
                                      │ HTTPS/REST + WebSocket
                                      ▼
                         ┌─────────────────────────┐
                         │        API Gateway         │
                         │ (Auth, Rate Limiting, LB)  │
                         └────────────┬──────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────────┐         ┌───────────────────┐
│  Core Service   │           │  Routing & Dedup    │         │  Notification Svc   │
│ (issues, users, │◄─────────┤  Engine              │         │ (push/SMS/email/    │
│  status, SLA)   │           │ - geo clustering     │         │  WhatsApp)           │
└───────┬────────┘           │ - image similarity   │         └───────────────────┘
        │                     │ - ward/dept mapping  │
        │                     └───────────────────┘
        ▼
┌───────────────┐    ┌───────────────────┐    ┌────────────────────┐
│  PostgreSQL     │    │  Object Storage     │    │  Analytics Store     │
│  + PostGIS       │    │  (S3 — photos)      │    │  (aggregates for      │
│  (issues, users, │    │                      │    │  dashboards)          │
│  wards, SLA logs)│    └───────────────────┘    └────────────────────┘
└───────────────┘
        ▲
        │
┌───────┴────────────────────────────────────────────────┐
│                     Officer Console (Web)                  │
│         Triage queue · field updates · resolution proof     │
└──────────────────────────────────────────────────────────┘
        ▲
        │
┌───────┴────────────────────────────────────────────────┐
│                    Admin Dashboard (Web)                    │
│   SLA compliance · ward leaderboard · heatmaps · exports     │
└──────────────────────────────────────────────────────────┘

Background Jobs (Queue: Redis/BullMQ)
 ├─ SLA breach checker → triggers escalation
 ├─ Duplicate clustering job
 ├─ Notification dispatch
 └─ Nightly analytics aggregation
```

### Design Principles for Robustness
- **Asynchronous processing**: image analysis, deduplication, and notifications run as background jobs, not inline with the citizen's submit request — keeps the app fast even under load
- **Idempotent submission**: client generates a UUID for each report; retried/offline-synced submissions never create duplicates from network retries
- **Graceful degradation**: if the dedup/ML service is down, reports still save immediately and get matched retroactively once the service recovers
- **Horizontal scalability**: stateless API layer behind a load balancer; DB read replicas for dashboard/analytics queries so they never slow down citizen-facing writes

---

## 6. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Citizen mobile app | React Native (or Flutter) | Single codebase for iOS/Android, offline storage support |
| Citizen web app | React + PWA (service workers) | Installable, works offline, no app-store friction |
| WhatsApp/SMS bot | WhatsApp Business API / Twilio | Reaches non-smartphone users |
| Backend API | Node.js (NestJS) or FastAPI (Python) | Structured, scalable, strong ecosystem for REST + background jobs |
| Database | PostgreSQL + PostGIS | Relational integrity + native geospatial queries for routing/clustering |
| Object storage | AWS S3 / Cloudflare R2 | Durable, cheap image storage with CDN delivery |
| Background jobs | Redis + BullMQ (or Celery if Python) | Reliable async processing for SLA checks, dedup, notifications |
| Image similarity (dedup) | CLIP embeddings / perceptual hashing (pHash) + PostGIS proximity | Fast, cheap duplicate detection without heavy ML infra |
| Real-time updates | WebSocket (Socket.IO) | Live status updates on officer console and citizen app |
| Notifications | Firebase Cloud Messaging, Twilio (SMS), Nodemailer (email) | Multi-channel reach |
| Admin dashboard | React + Recharts/Mapbox | Analytics visualizations, ward heatmaps |
| Auth | JWT + OAuth (Google/phone OTP) | Low-friction citizen sign-in; role-based access for officers/admins |
| Infra / hosting | Docker containers on AWS ECS / Railway / Render; managed Postgres (RDS) | Reproducible deploys, managed scaling, easy CI/CD |
| CI/CD | GitHub Actions | Automated test + deploy pipeline |
| Monitoring | Sentry (errors) + Grafana/Prometheus (metrics) | Production observability from day one |

---

## 7. Data Model (Core Entities)

```
User            (id, name, phone, email, role[citizen/officer/admin], ward_id)
Ward            (id, name, boundary_geojson, department_mapping)
Issue           (id, uuid, citizen_id, category, description, photo_url,
                 location (geo), ward_id, status, severity_score,
                 duplicate_of_issue_id, created_at, sla_due_at)
StatusHistory   (id, issue_id, status, changed_by, note, photo_url, timestamp)
Upvote          (id, issue_id, citizen_id)
Escalation      (id, issue_id, escalated_to, reason, timestamp)
Department      (id, name, category_mapping)
```

### Key Indexes
- Geospatial index (GIST) on `Issue.location` for proximity dedup and map queries
- Composite index on `(ward_id, status)` for officer queue performance
- Index on `sla_due_at` for the background SLA-breach scanner

---

## 8. Implementation Plan

### Phase 1 — Foundation (Days 1–2 in a hackathon / Weeks 1–2 in production)
- Auth (phone OTP / Google sign-in), core DB schema, ward boundary seed data
- Citizen submit flow: photo + geotag + category → API → DB
- Basic officer console: view assigned issues, update status

### Phase 2 — Intelligence Layer
- Auto-routing engine (geofence → ward → department mapping)
- Duplicate detection (perceptual hash + geo-proximity clustering)
- Severity scoring (category weight × upvotes × affected-citizen count)

### Phase 3 — Accountability Layer
- SLA timers per category, background breach-checker job
- Escalation workflow + notifications
- Proof-of-resolution flow (after-photo + citizen confirm/dispute)

### Phase 4 — Reach & Transparency
- Offline-first citizen app (local queue + sync)
- WhatsApp/SMS bot channel
- Public map view + ward leaderboard
- Admin analytics dashboard (SLA compliance, category trends, resolution time)

### Phase 5 — Production Hardening
- Load testing, rate limiting, abuse/spam prevention
- Monitoring, alerting, and backup/disaster recovery setup
- Accessibility audit (screen-reader support, multilingual UI)

---

## 9. Overcoming Key Difficulties

| Difficulty | Robust Mitigation |
|---|---|
| **Ward boundary data is often unavailable or messy** | Start with a simplified administrative grid (self-drawn GeoJSON zones); allow admins to refine boundaries later without code changes |
| **Spam / fake reports** | Rate-limit submissions per user/device, require photo + location match, add a lightweight reputation score that flags repeat-offender accounts for review |
| **Duplicate detection false positives/negatives** | Combine two signals (image similarity + geo-proximity) rather than either alone; keep a human-review step for merges rather than fully automatic hard-merging |
| **Officers not updating status** | SLA breach triggers automatic escalation + visibility on the admin leaderboard — creates organizational accountability pressure, not just app nagging |
| **Low digital literacy / no smartphone access** | WhatsApp/SMS bot channel covers reporting without needing an app install |
| **Connectivity issues at the point of reporting** | Offline-first local queue; report is saved on-device immediately and synced when back online |
| **Trust — "will this actually get fixed?"** | Public transparency (map + leaderboard) plus mandatory proof-of-resolution builds a verifiable track record over time |
| **Scaling to city-wide volume** | Stateless API + read replicas + async background processing keeps citizen-facing writes fast even as issue volume grows |
| **Multi-department jurisdiction conflicts** | Routing engine flags "unassigned/ambiguous" cases to a human triage queue instead of silently misrouting |

---

## 10. Security & Privacy Considerations

- Role-based access control (citizen / officer / admin) enforced at the API layer, not just UI
- Personal contact info (phone/email) never exposed on the public map — only issue location and status are public
- Photo uploads scanned for basic content moderation before public display
- All traffic over HTTPS; JWT tokens short-lived with refresh rotation
- Rate limiting and CAPTCHA on submission endpoints to prevent bot abuse
- Data retention policy: resolved issue data anonymized after a defined period for public analytics use

---

## 11. Success Metrics (For Pitch & Post-Launch Tracking)

| Metric | Target Signal |
|---|---|
| Average time to acknowledgment | Should drop sharply vs. baseline (no-app) reporting |
| SLA compliance rate | % of issues resolved within category SLA window |
| Duplicate reduction | % of raw reports successfully merged, reducing officer workload |
| Citizen re-engagement rate | % of users who report more than once (signals trust) |
| Resolution verification rate | % of "Resolved" issues confirmed (not disputed) by citizens |

---

## 12. Pitch Narrative (60-Second Version)

> "Every city has a pothole nobody fixes and a complaint that disappears into a black hole. CivicTrack turns civic reporting into a transparent, accountable pipeline — citizens report in seconds with a photo and location, our system automatically routes it to the right department, merges duplicates so officers aren't wasting time, and holds everyone accountable with SLA timers and proof-of-resolution. It works over WhatsApp for people without smartphones, and offline for people without signal. This isn't just another complaint app — it's the missing accountability layer between citizens and their city."

---

## 13. Roadmap Beyond Hackathon (Production Path)

1. **Pilot** with a single ward/municipal zone — validate routing accuracy and SLA logic with real officers
2. **Feedback loop** — refine ward boundaries, category list, and severity weights based on pilot data
3. **Scale** — onboard additional wards, integrate with existing municipal ERP/ticketing systems via API
4. **Open data** — publish anonymized aggregate data for researchers, journalists, and civic-tech NGOs
5. **Sustainability** — potential SaaS/B2G licensing model for municipal corporations
