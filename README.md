# InsightFlow AI — Stadium Intelligence System

> An intelligent, explainable recommendation engine for large-scale physical events.

---

## What Is InsightFlow AI?

InsightFlow AI is a multi-factor decision engine designed for stadiums, arenas, and large events. Instead of naïvely recommending the *nearest* option, it **thinks before it answers** — weighing crowd density, wait times, distance, and user intent together — then explains every decision in plain language.

The system mimics how a knowledgeable local would guide you: *"Don't go to Food Court A, it's packed. Food Court C is a 60-second walk away and practically empty."*

---

## Project Structure

```
Batman/
├── backend/
│   ├── app.py              ← Flask server + Multi-Factor Decision Engine
│   └── requirements.txt
├── frontend/
│   ├── index.html          ← Single-page UI
│   └── static/
│       ├── css/style.css
│       └── js/app.js
├── data/
│   └── mock_data.json      ← Mock venue/crowd/wait data
└── README.md
```

---

## Reasoning Engine Design

### Core Philosophy
Most recommendation systems return the **nearest** or **most popular** result. InsightFlow AI rejects this. It treats every query as a multi-dimensional optimisation problem with explicit trade-off analysis.

### The Four Decision Factors

| Factor | Weight | Why It Matters |
|--------|--------|----------------|
| Wait Time | 45% | Time is the scarcest resource at events |
| Crowd Density | 35% | Density predicts comfort and safety |
| Distance | 20% | Walking distance, but not the priority |
| User Intent | — | Gates which venue category to consider |

### Scoring Formula
```
score(venue) = 0.45 × wait_norm + 0.35 × crowd_norm + 0.20 × dist_norm
```
A **lower score is better**. All three inputs are normalised to [0, 1] before weighting.

---

## Decision-Making Steps

Every query triggers this internal process:

```
Step 1: IDENTIFY
  → Parse user intent (food / restroom / exit / medical / merch / parking)
  → Retrieve all matching venues from the dataset

Step 2: EVALUATE
  → For each venue, compute the composite score
  → Tag crowd level: low | medium | high | very_high
  → Note absolute wait time and distance

Step 3: COMPARE
  → Sort venues by score (ascending = better)
  → Identify the nearest option (may NOT be optimal)
  → Identify the fastest option (may require more walking)
  → Find the optimal balance point

Step 4: SELECT & EXPLAIN
  → Choose the venue with the lowest composite score
  → Formulate a plain-language explanation of WHY
  → Identify a credible alternative (e.g. if distance matters to user)
  → Assign a confidence level based on score margin
```

This is implemented both in `backend/app.py` (Python scoring engine) and reinforced via a structured system prompt to Claude, which adds natural-language reasoning.

---

## Why This Approach Builds User Trust

### 1. Explainability > Black Box
When the system says *"Go to Food Court C"*, it also says *why*: Food Court A has an 18-minute wait; Food Court C is slightly farther but only 4 minutes. Users can **verify** the logic and choose to override it.

### 2. Counter-Intuitive Recommendations Are Justified
Without explanation, recommending a farther venue feels wrong. With the reasoning step, it feels *obviously right*. Transparency turns surprising recommendations into confident ones.

### 3. Alternatives Respect User Autonomy
The system always surfaces a backup recommendation with its own trade-off note. This acknowledges that preferences vary — some users will always prioritise distance over time.

### 4. Step-by-Step UI Animation
The UI shows the four reasoning steps activating in sequence before the answer appears. This is not just visual polish — it signals that the system is *working through the problem*, not pattern-matching.

### 5. Venue Score Table
The full ranked table of all options is shown with colour-coded crowd badges and mini score bars. Users can see exactly why option #1 beat option #2.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + Flask 3 |
| AI Reasoning | Anthropic Claude via `/v1/messages` |
| Data | JSON mock dataset |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Fonts | Bebas Neue, DM Sans, JetBrains Mono |

---

## Setup & Running

### 1. Install dependencies
```bash
cd Batman/backend
pip install -r requirements.txt
```

### 2. Optional: Set Anthropic API key
The project runs completely out-of-the-box with its built-in Intelligent Multi-Factor Decision Engine (no API key required). 

If you wish to use Anthropic's Claude for LLM-based responses, set the environment variable:
```bash
# PowerShell
$env:ANTHROPIC_API_KEY = "your-api-key-here"

# Command Prompt
set ANTHROPIC_API_KEY=your-api-key-here
```
If the key is unset or unavailable, the backend automatically uses the built-in decision engine.

### 3. Run the server
```bash
python app.py
```

### 4. Open the UI
Navigate to `http://localhost:5000` in your browser.

---

## Example Query & Response

**User at Section A (North Stand) asks:** *"Where can I get food quickly?"*

**InsightFlow AI responds:**

> **Recommended: Food Court C**
>
> Food Court A is the nearest at 120 m but is operating at 88% capacity with an 18-minute queue. Food Court C at 180 m has only 30% occupancy and a 4-minute wait, saving approximately 14 minutes overall. The 60-metre walk takes under 90 seconds, making it the clear optimal choice.
>
> **Alternative:** Food Court B (East Zone) — moderate crowd at 55%, 8-minute wait. A reasonable middle ground if you prefer the East side.

---

## Dataset

`data/mock_data.json` contains mock venues across six categories:

- **Food Courts** (A, B, C, D)
- **Restrooms** (N1, N2, E1, S1)
- **Exits** (North, East, South, West)
- **Medical Aid Stations** (1, 2)
- **Merchandise Stores** (A, B, C)
- **Parking Lots** (North, East, West)

Each venue has: `id`, `name`, `zone`, `distance_from_center_m`, `crowd_density`, `crowd_percent`, `wait_time_min`, `capacity`, `current_occupancy`.

---

## Future Enhancements

- Real-time IoT crowd sensor integration
- GPS-based user location (replace manual section selection)
- Historical wait time prediction (ML model)
- Multi-language support
- Mobile PWA with push alerts for sudden crowd surges

---

*Built with InsightFlow AI reasoning engine — because the nearest option is rarely the best one.*
