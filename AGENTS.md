<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sun Run Website Project Guide (2026 Edition)

Welcome! This document provides the context, structure, requirements, and historical background for the Sun Run charity run website.

---

## 1. Core Project Context

* **Current Time**: June 2026.
* **Goal**: Prepare the website for the upcoming **2nd edition of Sun Run (2026)**.
* **Date — CONFIRMED**: **12 September 2026**. The event is a festival that opens at **16:00**; the run itself starts at **18:30**. Use the run time (18:30) wherever the context is the race (schema.org `SportsEvent`, the "Ważne dane" card); use 16:00 only when describing the festival as a whole. Do **not** use `[RUN DATE 2026]` placeholders any more — the date is settled.
* **Hosting**: The website will be hosted on **Railway**.
* **Visuals & Branding**: The logo and unified design system are currently being updated. Use placeholder assets and layouts that can easily swap in the final branding once approved.

---

## 2. Organization & Communication Structure

Sun Run is an entirely grassroots initiative organized by local youth with the support of volunteers.

### Org Chart
* **Project Leader**: Jakub Delega (student from III LO im. Unii Lubelskiej).
* **Branches**:
  * **Administration**
  * **Execution**
  * **Promotion**
  * **Program** (Includes the Technical/Web Team and the Stage Team).
* **Coordinator of Program Branch**: Tosia Polkowska.
* **Technical Team Lead**: Wiktor.
* **Lead Web Developer**: Miłosz Kamiński.

### Communication Flow
Developer (Miłosz) $\rightarrow$ Wiktor $\rightarrow$ Tosia Polkowska $\rightarrow$ Jakub Delega.

---

## 3. The Beneficiary: Hospicjum Dobrego Samarytanina

The core charitable mission of Sun Run is to support the **Good Samaritan Hospice** in Lublin:
* **Address**: ul. Bernardyńska 11A, Lublin
* **KRS**: 0000 026 380 — zweryfikowany 2026-07-29 w oficjalnym rejestrze Ministerstwa Sprawiedliwości (`api-krs.ms.gov.pl`): „LUBELSKIE TOWARZYSTWO PRZYJACIÓŁ CHORYCH »HOSPICJUM DOBREGO SAMARYTANINA«”, Lublin. **Nie mylić z 0000318602** — ten numer należy do Fundacji DKMS z Warszawy i przez pomyłkę widniał wcześniej w tym pliku oraz na stronie.
* **Impact**: The hospice supports approximately 800 families of terminal cancer patients annually.
* **Requirement**: The website must highlight the Hospice as the main beneficiary. Prepare a dedicated "Our Goal for 2026" section that can be updated with the specific medical equipment or facility needs defined by the hospice for this year.

---

## 4. Historical Context: 2025 Edition (Reference Only)

The first edition was a major success. Use these details for the "History" or "Archive" sections to build credibility, but **do not** display them as current organization details.

* **Date**: September 6, 2025.
* **Attendance**: 350+ runners.
* **Location**: Park Ludowy, Lublin (al. J. Piłsudskiego).
* **Format**: 5 km distance (2 loops on asphalt paths; suitable for both running and walking).
* **Timing & Classifications**: Maintained by Datasport (OPEN category by gross time; age categories 14+, 30+, 50+ by net time).
* **Fundraising Focus**: Anti-bedsore mattresses and constructing a year-round hospice garden.
* **Pricing Tiers (2025 Template)**:
  * Tier 1 (until July 31): 60 PLN
  * Tier 2 (until September 3): 70 PLN
  * Tier 3 (on the day of the race): 80 PLN
* **Side Initiatives**:
  * **DKMS Bone Marrow Donor Day**: Bone marrow registry stand operated at the run.
  * **"Record for the Hospice" Campaign**: Participants recorded audio messages for patients, supported by KUL university and sports/cultural ambassadors (e.g., A. Mierzejewski, J. Wachnik, M. Cierniak).
  * **Honorary Patronage**: University of Life Sciences in Lublin (UP Lublin).
  * **Key Partners**: VIVO! Lublin, AS Babuni.

---

## 5. Website Requirements & Sections (2026 Edition)

When generating pages, navigation, or copywriting, focus on recruiting participants, volunteers, and sponsors for 2026.

### Current page inventory (as of 2026-07-31)

`/` (home), `/o-nas`, `/archiwum`, plus the admin panel at `/9874t3qbiufghs894q3bf98SGE843` (renamed from `/admin` on 2026-09-04 — deliberately obscure path as its only front-line protection, on top of the existing login. **Never list this path in `robots.txt`, sitemaps, or any other publicly-served file** — that would defeat the obscurity.). **There is no `/partnerzy` subpage** — it was deleted. Partners now live only as a section on the home page under the `#partnerzy` anchor, and those tiles are no longer links. Two consequences worth knowing:

* Nothing posts to `/api/contact` any more — the partner form lived on the deleted page. The endpoint and the admin panel that reads it still exist, so past submissions remain viewable.
* The empty-state text in the admin panel still refers to a "Dla Partnerów" page. Reword it once the staff decides where partner enquiries go.

### Registration link

Sign-ups: `https://frslublin.pl/pl/app/races/sign_up_form/295` — the form for this specific race, not the bare `frslublin.pl` home page.

### Key Sections:
1. **General Information**: Overview of the charity event.
2. **Registration / Pricing**:
   * **Important**: Registration itself is handled externally via the **FRS** system (frslublin.pl). The website should only link to it via a prominent Call to Action (e.g., "Register for 2026").
   * Use the 2025 pricing tiers as a structure template with placeholders for 2026 dates and prices.
3. **Route & Regulations**:
   * Map and regulations based on the 2025 layout (5 km in Park Ludowy, age 14+), with space for updates.
   * **CONFIRMED 2026 race data** (differs from 2025 — do not copy the old values):
     * Start of the run: **18:30** (the festival itself opens at 16:00)
     * Distance: **5 km (2 loops)**
     * Minimum age: **14**
     * Time limit: **80 minutes** (the 2025 edition had 60 — do not carry the old value over)
     * Certification: **PZLA** (Polish Athletics Association) — new for 2026
4. **About Us / Organizers**:
   * Highlight the youth-led nature of the team.
5. **Become a Volunteer**:
   * Recruitment module for the 2026 team.
6. **Sponsorship & Partners Zone**:
   * Currently just a strip of partner tiles on the home page. The dedicated subpage with sponsorship packages and the enquiry form was removed on 2026-07-31; the staff has not yet decided what replaces it.
7. **Results & Awards Archive**:
   * `/archiwum` covers the 2025 edition: intro text, four figures (363 participants, 5 km, 6.09.2025, ~13 800 PLN raised), press articles and a photo gallery.
   * The results section (Datasport classifications, age categories, link to full results) **was removed on the staff's instruction** — do not re-add it unless asked.
   * The 2025 side initiatives (DKMS donor point, "Rekord dla Hospicjum", UP Lublin honorary patronage) are described in section 4 above but **no longer appear anywhere on the site** — they went out with the "Wokół biegu" section.
