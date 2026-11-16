# MentyMate

**Earlier, Safer Mental Wellbeing Support**  
*Future Health Digital Innovation Challenge | Wellbeing: Challenge 10*

**Live Web App (PWA):** [mentymate.mategroup.id](https://mentymate.mategroup.id)

---

## Executive Summary

**How might we help individuals and communities recognize changes in wellbeing earlier and connect them to appropriate, trusted support while preserving privacy, autonomy, and human oversight?**

Screening volumes are rising, yet a persistent conversion gap remains between recognizing distress and reaching timely human care. Stigma, fragmented pathways, fear of sensitive data exposure, and uncertainty about where to go often delay support until a crisis occurs.

**MentyMate** is a bilingual (**English-first**, **Bahasa Indonesia** supported), offline-capable preventive mental wellbeing platform built to close that gap safely. It combines validated self-assessments, opt-in longitudinal mood and physical tracking, stepped local care navigation (including **Abu Dhabi / UAE** and **Indonesia** pathways), deterministic human-led crisis escalation, and granular user-controlled privacy, without ever claiming to diagnose or replace licensed clinicians.

---

## Alignment with Challenge 10 (6 Core Pillars)

| Challenge 10 Requirement | How MentyMate Solves It | Key Capabilities |
| :--- | :--- | :--- |
| **1. Validated Early Identification** | Helps users spot subtle emotional shifts over time without clinical overclaiming. | Validated **PHQ-9** and **GAD-7** (English & Indonesian-validated versions) with clear non-diagnostic explanations, personal baseline computation, SVG score trend chart, and daily cached AI pattern reflection. |
| **2. Stepped, Local Support Navigation** | Connects users to the least intensive, safe, effective support with transparent eligibility. | Offline-ready **4-7-8 breathing**, **5-4-3-2-1 grounding**, **guided journaling**, **MateGroup WhatsApp Community** peer support (with privacy boundary notice), and a filterable directory across **Abu Dhabi / UAE (`AE`)**, **Indonesia (`ID`)**, **US**, **UK**, and **Global** showing clear eligibility and voluntary referral follow-through confirmation. |
| **3. Human-Led High-Risk Escalation** | Detects crisis or self-harm risk deterministically and hands off to trained humans. | Deterministic keyword/phrase detection across AI chat and check-in notes plus **PHQ-9 Item 9** and severe score triggers. Immediately pauses AI chat to display pre-reviewed emergency numbers (`8001717 Estijaba`, `999`, `998` for Abu Dhabi/UAE; `112`, `119`, `LISA` for Indonesia; `988`; `111`; `findahelpline.com`) and saved **Trusted Contact** quick-call. |
| **4. Privacy, Consent & Autonomy** | Prevents covert monitoring and keeps sensitive wellbeing data under user control. | Data minimization, **granular revocable consent** per feature (`aiChat`, `moodTracking`, `selfAssessment`), optional **AES-256-GCM** field-level encryption for reflection notes, zero automatic sharing to WhatsApp or third parties, full **JSON data export**, and one-step **account deletion**. |
| **5. Coordinated Physical & Mental Care** | Connects physical signals with mental wellbeing for primary-care visibility. | Optional daily **physical wellbeing metrics** (sleep quality, sleep duration, energy level, physical activity minutes, stress level) combined with mood and screening scores into a printable **14-Day Clinician Wellbeing Summary** shared voluntarily by the user. |
| **6. Outcome & Safety Monitoring** | Measures real-world conversion, safety completion, and fairness without exposing PII. | Public, PII-free telemetry dashboard (`/impact`) tracking screening completion rate, daily check-ins, directory searches, voluntary referral follow-throughs, symptom improvement rate, crisis guidance completion, EN/ID language parity, and geography coverage. |

---

## End-to-End User Guide

### 1. Language Selection & Instant Crisis Access (No Sign-In Required)
- **Bilingual Switcher (`EN` / `ID`)**: MentyMate opens in **English** by default (`VITE_DEFAULT_LANGUAGE=en`, configurable via flag). Click the **US / Indonesia flag switcher** in the sidebar (or top header on mobile) at any time to switch between English and Bahasa Indonesia. When Bahasa Indonesia (`ID`) is active, the **Edukasi** (`/blog`) psychoeducation library is also unlocked.
- **Urgent Human Help (`Need urgent help?`)**: Accessible from every screen without signing in. Opens verified local emergency contacts and crisis helplines tailored to your selected country, along with your saved **Trusted Contact** if signed in.
- **Offline Readiness (PWA)**: Installable as a Progressive Web App. When offline, an inline status banner informs you that **Crisis Guidance** and **4-7-8 Breathing** remain available.

### 2. Stepped Local Support & Impact Telemetry (`/support` & `/impact`)
- **Self-Guided Calming (`/support`)**: Follow the animated **4-7-8 Breathing** exercise (auto-stops after one full cycle), practice **5-4-3-2-1 Grounding**, or use the **Guided Journaling Prompt**.
- **Peer Support**: Join the moderated **MateGroup WhatsApp Community**. A privacy modal confirms that no mood logs, chat history, or screening scores are ever shared automatically.
- **Professional & Urgent Directory**: Filter services by **Country** (`ID`, `AE`, `US`, `GB`, `ALL`), **Region** (`Abu Dhabi`, `Jabodetabek`, `Bandung`, `Surabaya`, `Yogyakarta`, `Bali`, `National`), and **Category** (`Urgent Helpline`, `Puskesmas / Primary Care`, `Hospital / RSJ`, `Psychologist`, `Psychiatrist`, `Tele-Mental Health`). Each card shows transparent **Eligibility** details and an **"I contacted this service"** confirmation button to measure real care hand-off.
- **Impact & Safety (`/impact`)**: Inspect live, aggregated, PII-free ecosystem metrics across outcomes, safety, language parity, and geography.

### 3. Account Creation & Granular Privacy Controls (`/register`, `/login`, `/privacy`)
1. **Register & Sign In**: Create an account with your preferred language (`en` / `id`), country (`ID`, `AE`, `US`, `GB`), and optional city/region.
2. **Manage Consents (`/privacy`)**: Independently grant or revoke consent for **AI Companion Chat**, **Daily Mood & Physical Check-in**, and **Validated Self-Assessments**.
3. **Trusted Contact & Data Ownership**: Save a Trusted Contact for quick access in crisis modals, download all personal records via **Export My Data (JSON)**, or permanently erase your account and all records via **Delete Account & All Data** (protected by an in-app confirmation modal).

### 4. Daily Mood & Physical Wellbeing (`/checkin`)
1. **Today**: Log your daily mood (`Good`, `Okay`, `Struggling`), optional reflection note, and optional physical metrics (sleep quality, sleep duration, energy, physical activity, stress). Confirm in the in-app modal to save once per day.
2. **History**: Review chronological mood, encrypted reflection notes, and physical metrics.
3. **AI Pattern Reflection**: Unlocked once today's check-in is saved. Generates a concise, non-diagnostic reflection and three practical healthy-habit suggestions, cached per day to avoid redundant AI calls.
4. **Clinician Summary**: View or print (**Print / Save PDF**) a structured 14-day physical and mental wellbeing summary to share voluntarily with a healthcare professional.

### 5. Validated Self-Assessments (`/assessment`) & AI Companion
- **PHQ-9 & GAD-7 (`/assessment`)**: Complete validated depression or anxiety screenings in English or Bahasa Indonesia, view your score and severity band alongside your **Personal Baseline** and longitudinal **SVG trend chart**. Any PHQ-9 Item 9 endorsement or severe threshold immediately opens **Crisis Guidance**.
- **MentyMate Companion (`Open Companion`)**: With AI Chat consent enabled, reflect on daily stress with a language-aware, non-clinical AI companion (`gemini-flash-lite-latest`). High-risk messages are intercepted deterministically before reaching the LLM and immediately trigger **Crisis Guidance**.

---

## Assumptions & Prototype Limitations

In accordance with the Future Health Challenge submission guidelines, the following assumptions and prototype boundaries apply:

- **Non-Diagnostic Scope**: MentyMate is a preventive awareness and care-navigation tool. It does not provide clinical diagnoses, prescriptions, or emergency medical dispatch.
- **External Human Referral Model**: MentyMate does not employ in-house clinicians; high-risk escalation directs users to verified national/local emergency services, crisis helplines, and external licensed providers.
- **Demographic Privacy vs. Fairness Granularity**: To uphold strict PII minimization in the prototype, MentyMate does not collect `age`, `gender`, or `nationality` fields; equity and accessibility monitoring currently tracks `language` (`en`/`id`) and `country` geography.
- **Clinician Hand-Off & Wearables**: The 14-day Clinician Summary is shared voluntarily by the user (print/PDF) rather than via live hospital EHR/FHIR integration, and wearable device sync is prepared as a schema hook (`wearableSource: 'manual' | 'future_wearable'`) for future connected-device integration.
- **Waiting Time Metric**: Clinical appointment waiting times are not tracked in this prototype without direct clinic scheduling APIs; instead, MentyMate tracks voluntary referral follow-through confirmations.

---

## Team

- **Bagus Angkasawan Sumantri Putra** | Founder & CEO/CTO, MateGroup
- **Sayyidah Hikma Lutfiyana** | Co-Founder & CPO/CMO, MateGroup
