# OAS Badge Tracker — 6th Richmond Hill Scout Group

A web app for scouts to track their progress through OAS (Outdoors Achievement Scheme) badge requirements. Scouts can submit evidence for each requirement, and scouters can review and approve or reject submissions.

## Background

This project was built to complement the troop website created by Scouter Kit for the 6th Richmond Hill Scout Group. The entire frontend was built by [Claude](https://claude.ai) (Anthropic AI).

## Tech Stack

- **Backend:** Django 6 + Django REST Framework, SimpleJWT, PostgreSQL
- **Frontend:** React + Vite

## Setup

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

## Roles

| Role | Description |
|------|-------------|
| `scout` | Can view badges, create submissions, and upload evidence |
| `scouter` | Can review, approve, and reject submitted work |
| `admin` | Full access |

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login/` | Login — returns `{access, refresh}` |
| `POST` | `/api/auth/refresh/` | Refresh access token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me/` | Current user info `{id, username, role}` |

### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/badges/` | List all badges (public) |
| `GET` | `/api/badges/{badge_id}/` | Badge detail with requirements (public) |

### Submissions (Scout)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/submissions/` | List own submissions |
| `POST` | `/api/submissions/` | Create a new submission |
| `GET` | `/api/submissions/{id}/` | Submission detail |
| `PATCH` | `/api/submissions/{id}/` | Update draft submission |
| `PUT` | `/api/submissions/{id}/` | Update draft submission |
| `DELETE` | `/api/submissions/{id}/` | Delete draft submission |
| `POST` | `/api/submissions/{id}/submit/` | Submit for review |
| `POST` | `/api/submissions/{id}/evidence/` | Upload evidence (photo, video, or PDF — max 10 MB) |
| `DELETE` | `/api/evidence/{evidence_id}/` | Remove evidence from a draft submission |

### Review (Scouter/Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/review/submissions/` | List all submitted work |
| `POST` | `/api/review/submissions/{id}/approve/` | Approve a submission |
| `POST` | `/api/review/submissions/{id}/reject/` | Reject — requires `{reviewer_notes}` |
