# scouts-oas-tracker

Currently available api calls:
POST /api/auth/login/
POST /api/auth/refresh/
POST /api/submissions/
POST /api/submissions/{submission_id}/evidence/
POST /api/submissions/{submission_id}/submit/

PATCH /api/submissions/{submission_id}/
PUT /api/submissions/{submission_id}/

GET /api/users/me/
GET /api/badges/
GET /api/badges/{badge_id}/
GET /api/submissions/
GET /api/submissions/{submisison_id}/

DELETE /api/evidence/{evidence_id}
DELETE /api/submissions/{submission_id}

<!-- SCOUTER ONLY -->
POST /api/review/submissions/{submission_id}/reject/
POST /api/review/submissions/{submission_id}/approve/

GET /api/review/submissions/

