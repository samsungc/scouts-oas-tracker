# OAS Badge Tracker — 6th Richmond Hill Scout Group

A web app for scouts to track their progress through OAS (Outdoors Achievement Scheme) badge requirements, built as a passion project to encourage scouts to earn more badges.

## About

Earning badges is one of the most rewarding parts of scouting — but it can be hard to stay on top of requirements, track progress, and know what's left to complete. This project was built to make that easier for the 6th Richmond Hill Scout Group.

Scouts can browse all available OAS badges, see exactly what each one requires, and submit evidence directly through the app. Scouters get a clean review queue to approve or reject submissions, keeping things moving without the paper trail. The goal is simple: lower the friction between a scout deciding to pursue a badge and actually earning it.

The frontend was developed with heavy assistance from [Claude](https://claude.ai) (Anthropic AI).

## How it works

1. **Browse** — Scouts browse available OAS badges and view the requirements for each one
2. **Submit** — Scouts upload evidence (photos, videos, or PDFs) for each requirement and submit for review
3. **Review** — Scouters approve or reject submissions, with notes sent back to the scout by email

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 6 + Django REST Framework + SimpleJWT |
| Database | PostgreSQL (hosted on Render) |
| Frontend | React 19 + Vite + React Router |
| Email | [Resend](https://resend.com) — transactional notifications for submission updates |
| File Storage | Amazon S3 — evidence uploads (photos, videos, PDFs) |
| Deployment | [Render](https://render.com) (backend + database), [Vercel](https://vercel.com) (frontend) |

## Local Development

### Backend

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver        # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
```
