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
* **KRS**: 0000 318 602
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

When generating pages, navigation, or copywriting, focus on recruiting participants, volunteers, and sponsors for 2026. Use placeholders like `[RUN DATE 2026]` for unconfirmed dates.

### Key Sections:
1. **General Information**: Overview of the charity event.
2. **Registration / Pricing**:
   * **Important**: Registration itself is handled externally via the **FRS** system (frslublin.pl). The website should only link to it via a prominent Call to Action (e.g., "Register for 2026").
   * Use the 2025 pricing tiers as a structure template with placeholders for 2026 dates and prices.
3. **Route & Regulations**:
   * Map and regulations based on the 2025 layout (5 km in Park Ludowy, 60 min limit, age 14+), with space for updates.
4. **About Us / Organizers**:
   * Highlight the youth-led nature of the team.
5. **Become a Volunteer**:
   * Recruitment module for the 2026 team.
6. **Sponsorship & Partners Zone**:
   * Detail package options for sponsors, media info, and placeholder sections for partners like DKMS.
7. **Results & Awards Archive**:
   * Link to "Results 2025" and outline 2026 trophy details.
