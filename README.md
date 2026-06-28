AI Driver Onboarding Document Checker
 Manivtha Tours & Travels — Student 1 Frontend

---

 Project Structure

```
src/
├── context/
│   └── AppContext.jsx          ← Global state (navigation, history, toast)
├── hooks/
│   ├── useDocChecker.js        ← AI validation logic hook
│   └── useFileUpload.js        ← File drag-drop & upload hook
├── utils/
│   └── reportUtils.js          ← Export, copy, format helpers
├── styles/
│   └── globals.css             ← CSS variables & reset
├── components/
│   ├── Header.jsx / .module.css
│   ├── Toast.jsx / .module.css
│   ├── ProgressSteps.jsx / .module.css
│   ├── PageHeader.jsx / .module.css
│   ├── UploadZone.jsx / .module.css
│   ├── DriverForm.jsx / .module.css
│   ├── StarRating.jsx / .module.css
│   ├── ResultPanel.jsx / .module.css
│   ├── CheckerPage.jsx / .module.css
│   ├── HistoryPage.jsx / .module.css
│   └── HistoryPageLayout.jsx / .module.css
├── App.jsx                     ← Root component + router
└── index.js                    ← React entry point
```

---

## Getting Started

```bash
 Install dependencies
npm install

 Start development server
npm start

Build for production
npm run build
```

App runs at: **http://localhost:3000**

---

 Features
- **Driver form** — name, phone, license number, expiry date, vehicle RC, joining date
- **File upload** — drag-and-drop zone with validation (PDF, JPG, PNG, max 10 MB each)
- **AI validation** — automated completeness and expiry checks with colour-coded flags
- **Export** — download plain-text report as `.txt`
- **Copy** — one-click copy to clipboard
- **Regenerate** — re-run the AI check
- **Star rating** — 1–5 star rating saved per check
- **History** — persistent browser localStorage history with export & delete
- **Toast notifications** — subtle feedback for all user actions
- **Responsive** — works on mobile and desktop

---

 Tech Stack
- React 18 (Create React App)
- CSS Modules (no inline styles, no styled-components)
- localStorage for history persistence
- No external UI libraries

---

 Student Roles
| Student | Role |
|---------|------|
| Student 1 | **Frontend** — this repository |
| Student 2 | Backend / AI Prompt Engineering |
| Student 3 | Database / Deployment |
