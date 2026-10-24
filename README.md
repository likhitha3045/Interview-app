# Interviewly — Real-time interview workspace

A responsive interview workspace built with React, TypeScript, Express, Socket.IO, MongoDB, JWT and WebRTC. Interviewers can invite candidate accounts, schedule rooms, chat live, and start peer-to-peer audio/video calls.

## Requirements

- Node.js 20+ (or 22+) and npm
- MongoDB running locally, or a MongoDB connection string

## Getting started

1. From this project directory, install dependencies with `npm install`.
2. Copy `.env.example` to `apps/server/.env`, then set `JWT_SECRET` to a long random value and `MONGODB_URI` to your MongoDB connection string. Local interviewer signup works without a code; set `INTERVIEWER_SIGNUP_CODE` in production to restrict interviewer accounts.
3. Copy `apps/web/.env.example` to `apps/web/.env` if the API is not at `http://localhost:4000`.
4. Run `npm run dev` at the project root. The UI runs at `http://localhost:5173`; the API and Socket.IO server run at `http://localhost:4000`.
5. Create and verify a company account, recruiter account, interviewer account, and candidate account. A company submits its profile and domain-matching company email, then submits vacancies. A recruiter manually reviews/verifies the company, then separately approves each vacancy to publish it. Only approved, open listings appear to candidates. In production, recruiter and interviewer signup require their matching `RECRUITER_SIGNUP_CODE` or `INTERVIEWER_SIGNUP_CODE`. After a candidate applies, the recruiter can schedule an interview and assign a verified interviewer. New accounts verify their email by entering a one-time 6-digit code sent to that address. The code expires after 10 minutes and allows up to five attempts. With SMTP unconfigured locally, the code is shown in the UI for development only. Pending interview invitations attach automatically when the invited candidate email is verified.

For actual email delivery, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. Production startup requires SMTP and interviewer/recruiter signup codes. Set `CLIENT_ORIGIN` to the frontend origin. `API_PUBLIC_URL` is used for other email links such as password resets and invitations. Interview invitation/update/cancellation and one-hour reminder emails follow the user’s email preference. In-app notifications are stored in MongoDB and remain available while a user is offline. Without SMTP in development, the registration response shows the verification code in the UI and the API terminal logs email activity; password recovery shows a local reset link. No email is delivered until SMTP is configured.

## Development checks

- `npm run lint` type-checks both workspaces.
- `npm run build` builds the server and web app.
- `npm test` runs the server's automated unit tests.

### Resend SMTP example

Create a Resend account, verify a sending domain (recommended for real recipients), and create an API key. Put these settings in the **untracked** `apps/server/.env` file; never commit the API key:

```dotenv
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
SMTP_FROM=Interviewly <no-reply@your-verified-domain.example>
```

Replace the sender address with an address on the domain verified with your mail provider. Restart the API after editing the environment file. The provider must allow delivery to the recipients you want to verify; some providers restrict unverified accounts to a test recipient list. Keep the API key private and never place it in the web app's environment file.

The browser must grant camera/microphone access for audio/video. Localhost is treated as a secure context by browsers; deployed clients need HTTPS. The API returns signed, one-hour TURN credentials when `TURN_URLS` and `TURN_SHARED_SECRET` are configured (compatible with coturn shared-secret authentication); otherwise calls use the configured `STUN_URLS` fallback and may fail on restrictive networks. Select a hosted TURN service that supports coturn's time-limited shared-secret REST authentication, then set its TURN URLs and shared secret on the API server. Some hosted TURN products issue credentials through their own API instead; those require a provider-specific adapter and are not interchangeable with this shared-secret setting. Never put a TURN shared secret in frontend environment variables.

## Features

- Role-based recruiter, interviewer and candidate sign-up with email verification, password reset, bcrypt password hashes, rate limits, security headers, and JWT-protected API/socket access
- Company accounts can submit company details and vacancies for a two-step recruiter review; job listings remain hidden from candidates until the company and vacancy are approved
- Email invitations that let new candidates register with the invited address; verification automatically attaches their pending interview(s)
- Recruiter job postings, candidate applications and pipeline stage tracking; recruiter dashboard metrics
- Editable candidate/interviewer/recruiter profiles with skills, education, projects, and résumé URL fields
- Interviewer rubric evaluation with private notes and a separate candidate-visible feedback summary
- Interview creation with candidate invitations, interviewer assignment, type/duration/instructions, rescheduling, cancellation, participant-scoped history, calendar export, room authorization, status transitions, and evaluations
- Authenticated one-to-one/group/interview-room Socket.IO chat with message search, replies, edit/delete, emoji reactions, unread counts, typing, delivery/read receipts, notification events and bounded file attachments
- Authenticated Socket.IO presence, durable notifications, email preferences, one-hour reminders, and WebRTC offer/answer/ICE signaling
- Responsive workspace, live room, camera/microphone and device controls, screen sharing, picture-in-picture, reconnect action, elapsed timer, and collaborative Monaco editor
- Optional browser-local call capture gated on both participants consenting; output downloads to the recorder's device and is never uploaded
- Private PDF/DOCX résumé uploads with content checks; downloads require the owner or a recruiter with an application to that recruiter's job

Company verification currently performs basic checks that the user email matches the submitted domain and the website host is under that domain, then relies on recruiter manual review. This is not legal/business-registry verification. The coding workspace synchronizes source and language but only executes code if a separately isolated Judge0-compatible sandbox is configured. AI question generation and the general-purpose AI assistant are optional and require `AI_API_KEY`; set `AI_API_URL` and `AI_MODEL` for a compatible provider. Assistant messages are sent to that provider and are not saved to the app database. Browser-local recording requires explicit consent from both interview participants and downloads to the local device; there is no hosted archive. File uploads currently use bounded MongoDB binary storage for this prototype; production should use private object storage, malware scanning, retention/erase policies, and signed download links. Recruiter role is organization-code gated in production; a separate full platform-admin role/user-management console, analytics charts, and managed recording are not implemented.

Résumé type checks verify the declared MIME type and basic file contents. They are not malware scanning or a full document parser; scan uploaded documents and use private object storage before production use.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify-email` (email and one-time code), `POST /api/auth/resend-verification`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`
- `GET/PATCH /api/profile`, `POST /api/profile/resume`, `GET /api/profile/resume/:id`, `GET/POST /api/jobs`, `POST /api/company/submission`, `GET /api/company/submission`, `POST /api/company/jobs`, `GET/PATCH /api/recruiter/company-submissions`, `GET/PATCH /api/recruiter/job-submissions`, `PATCH /api/jobs/:id`, `POST /api/jobs/:id/applications`, `GET /api/applications`, `PATCH /api/applications/:id/status`, `GET /api/recruiter/metrics`, `GET /api/recruiter/users`, `PATCH /api/recruiter/users/:id/status`
- `GET /api/interviews`, `POST /api/interviews` (recruiters assign a verified interviewer email), `PATCH /api/interviews/:id`, `PATCH /api/interviews/:id/status`, `GET /api/interviews/:id/calendar`, `POST /api/interviews/:id/feedback`, `POST/GET /api/interviews/:id/evaluation`
- `GET /api/notifications`, `PATCH /api/notifications/read-all`, `GET/PATCH /api/users/email-preferences`, `GET /api/rtc/ice-servers`
- `GET /api/interviews/:roomCode/messages`, `GET /api/health`
- `GET /api/conversations`, `POST /api/conversations`, `GET /api/conversations/:id/messages`, `POST /api/conversations/:id/attachments`, `POST /api/interviews/:roomCode/attachments`, `GET /api/chat/attachments/:id`, `GET /api/interviews/:roomCode/code`, `POST /api/interviews/:roomCode/code/run`, `POST /api/ai/interview-questions`
- Socket events: `room:join`, `room:peer-joined`, `presence:update`, `notification`, `chat:send`, `chat:message`, `chat:typing`, `chat:edit`, `chat:delete`, `chat:reaction`, `chat:read`, `conversation:join`, `conversation:send`, `conversation:typing`, `conversation:read`, `code:join`, `code:update`, `code:change`, `call:recording-consent`, `webrtc:offer`, `webrtc:answer`, `webrtc:ice`

## Deployment notes

Deploy the web and server workspaces separately or from the monorepo. Set server `MONGODB_URI`, a strong `JWT_SECRET`, `INTERVIEWER_SIGNUP_CODE`, `RECRUITER_SIGNUP_CODE`, SMTP settings, `API_PUBLIC_URL`, `CLIENT_ORIGIN` to the deployed frontend origin, and `PORT` as provided by the platform. Set frontend `VITE_API_URL` to the deployed API origin. Configure HTTPS and a TURN service with a shared secret for production-grade WebRTC connectivity; never commit environment files or production secrets. Add a managed MongoDB backup policy and production error monitoring before onboarding users. Calls are peer-to-peer and are not uploaded/archived by Interviewly. Local recording is browser-only and consent-gated. The shared Monaco editor syncs code; execution is only enabled when `JUDGE0_API_URL` points to an isolated Judge0-compatible sandbox. AI question generation and the general-purpose assistant are optional and need `AI_API_KEY` (plus optional `AI_API_URL`/`AI_MODEL`). File bytes are stored in MongoDB for this prototype; production should migrate to private object storage, malware scanning and retention controls.
