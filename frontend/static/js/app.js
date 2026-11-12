// ── InsightFlow AI — Stadium Intelligence Frontend Logic ────────────────────

const API_BASE = window.location.origin;

// Embedded Mock Dataset for Standalone / GitHub Pages Deployment
const EMBEDDED_MOCK_DATA = {
  venues: {
    food_courts: [
      { id: "FC-A", name: "Food Court A", zone: "North", distance_from_center_m: 120, crowd_density: "high", crowd_percent: 88, wait_time_min: 18, items: ["Burgers", "Pizza", "Sandwiches"] },
      { id: "FC-B", name: "Food Court B", zone: "East", distance_from_center_m: 210, crowd_density: "medium", crowd_percent: 55, wait_time_min: 8, items: ["Tacos", "Wraps", "Noodles"] },
      { id: "FC-C", name: "Food Court C", zone: "South", distance_from_center_m: 180, crowd_density: "low", crowd_percent: 30, wait_time_min: 4, items: ["Grilled Items", "Salads", "Beverages"] },
      { id: "FC-D", name: "Food Court D", zone: "West", distance_from_center_m: 300, crowd_density: "low", crowd_percent: 20, wait_time_min: 2, items: ["Desserts", "Ice Cream", "Snacks"] }
    ],
    restrooms: [
      { id: "WC-N1", name: "Restroom N1", zone: "North", distance_from_center_m: 90, crowd_density: "high", wait_time_min: 10, crowd_percent: 90 },
      { id: "WC-N2", name: "Restroom N2", zone: "North Upper", distance_from_center_m: 140, crowd_density: "medium", wait_time_min: 4, crowd_percent: 50 },
      { id: "WC-E1", name: "Restroom E1", zone: "East", distance_from_center_m: 200, crowd_density: "low", wait_time_min: 1, crowd_percent: 15 },
      { id: "WC-S1", name: "Restroom S1", zone: "South", distance_from_center_m: 160, crowd_density: "low", wait_time_min: 2, crowd_percent: 25 }
    ],
    exits: [
      { id: "EX-N", name: "North Exit", zone: "North", distance_from_center_m: 350, crowd_density: "very_high", wait_time_min: 20, crowd_percent: 95 },
      { id: "EX-E", name: "East Exit", zone: "East", distance_from_center_m: 390, crowd_density: "medium", wait_time_min: 7, crowd_percent: 55 },
      { id: "EX-S", name: "South Exit", zone: "South", distance_from_center_m: 420, crowd_density: "low", wait_time_min: 3, crowd_percent: 30 },
      { id: "EX-W", name: "West Exit", zone: "West", distance_from_center_m: 370, crowd_density: "low", wait_time_min: 2, crowd_percent: 20 }
    ],
    medical_aid: [
      { id: "MD-1", name: "Medical Aid Station 1", zone: "North", distance_from_center_m: 100, crowd_density: "low", wait_time_min: 1, crowd_percent: 10 },
      { id: "MD-2", name: "Medical Aid Station 2", zone: "South", distance_from_center_m: 220, crowd_density: "low", wait_time_min: 0, crowd_percent: 5 }
    ],
    merchandise: [
      { id: "MR-A", name: "Merchandise Store A", zone: "North", distance_from_center_m: 130, crowd_density: "very_high", wait_time_min: 25, crowd_percent: 95 },
      { id: "MR-B", name: "Merchandise Store B", zone: "East", distance_from_center_m: 250, crowd_density: "medium", wait_time_min: 10, crowd_percent: 60 },
      { id: "MR-C", name: "Merchandise Store C", zone: "West", distance_from_center_m: 310, crowd_density: "low", wait_time_min: 3, crowd_percent: 25 }
    ],
    parking: [
      { id: "PK-N", name: "North Parking", zone: "North", distance_from_center_m: 500, crowd_density: "high", wait_time_min: 30, crowd_percent: 85 },
      { id: "PK-E", name: "East Parking", zone: "East", distance_from_center_m: 480, crowd_density: "medium", wait_time_min: 15, crowd_percent: 60 },
      { id: "PK-W", name: "West Parking", zone: "West", distance_from_center_m: 520, crowd_density: "low", wait_time_min: 5, crowd_percent: 30 }
    ]
  }
};

let allVenuesCatalog = [];
let currentCategoryFilter = "all";
let currentSearchTerm = "";

const ZONE_DATA = {
  "Section A (North Stand)": {
    name: "North Stand — Zone A",
    density: "88%",
    densityBadge: "Heavy Flow",
    densityClass: "badge-high",
    wait: "18m",
    waitBadge: "High Latency",
    waitClass: "badge-high",
    gate: "95%",
    gateBadge: "Peak Rush",
    alt: "South (C)",
    altWait: "4m Wait",
    advisory: "North Stand food courts are currently at 88% capacity with 18-minute wait lines. Fans moving toward South Stand (Zone C) save an average of 14 minutes in line."
  },
  "Section B (East Stand)": {
    name: "East Stand — Zone B",
    density: "55%",
    densityBadge: "Moderate Flow",
    densityClass: "badge-high",
    wait: "8m",
    waitBadge: "Medium Queue",
    waitClass: "badge-high",
    gate: "55%",
    gateBadge: "Steady Flow",
    alt: "West (D)",
    altWait: "2m Wait",
    advisory: "East Stand has steady traffic with moderate wait times (8 mins). West Stand (Zone D) is less congested and only 3 minutes away."
  },
  "Section C (South Stand)": {
    name: "South Stand — Zone C",
    density: "30%",
    densityBadge: "Optimal Flow",
    densityClass: "badge-green",
    wait: "4m",
    waitBadge: "Very Fast",
    waitClass: "badge-green",
    gate: "30%",
    gateBadge: "Clear Gates",
    alt: "East (B)",
    altWait: "8m Wait",
    advisory: "South Stand is running at optimal throughput with low congestion (30% density) and under 4-minute wait times."
  },
  "Section D (West Stand)": {
    name: "West Stand — Zone D",
    density: "20%",
    densityBadge: "Minimal Flow",
    densityClass: "badge-green",
    wait: "2m",
    waitBadge: "Immediate",
    waitClass: "badge-green",
    gate: "20%",
    gateBadge: "Wide Open",
    alt: "North (A)",
    altWait: "18m Wait",
    advisory: "West Stand facilities are operating smoothly with near-zero wait times (2 mins) and 20% crowd capacity."
  },
  "Section E (Center Field)": {
    name: "Center Field — Zone E",
    density: "45%",
    densityBadge: "Balanced",
    densityClass: "badge-green",
    wait: "6m",
    waitBadge: "Normal",
    waitClass: "badge-green",
    gate: "40%",
    gateBadge: "Balanced",
    alt: "South (C)",
    altWait: "4m Wait",
    advisory: "Center field concourse has equal access to all stadium perimeter sectors. Heading toward South Stand minimizes wait times."
  }
};

// ── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadRadar();
  loadAllFacilities();
  initTicker();

  // Support direct query via URL params (?q=...)
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q");
  if (initialQuery) {
    setTimeout(() => {
      setQuery(initialQuery);
    }, 350);
  }

  // Enter submits query (Shift+Enter inserts newline)
  const queryInput = document.getElementById("query-input");
  if (queryInput) {
    queryInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitQuery();
      }
    });
  }
});

// ── Clock & Live Telemetry Ticker ───────────────────────────────────────────
function initTicker() {
  function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toISOString().split("T")[0];

    const syncEl = document.getElementById("last-updated");
    if (syncEl) syncEl.textContent = "Sync: " + timeStr;

    const tickerEl = document.getElementById("footer-ticker");
    if (tickerEl) tickerEl.textContent = `Live Telemetry: ${dateStr} ${timeStr} UTC+05:30`;

    // Micro-fluctuate attendee count for live organic feel
    const attEl = document.getElementById("attendees-count");
    if (attEl && Math.random() > 0.6) {
      const current = parseInt(attEl.textContent.replace(/,/g, ""), 10) || 48420;
      const change = Math.floor(Math.random() * 7) - 3;
      attEl.textContent = (current + change).toLocaleString();
    }
  }

  updateTime();
  setInterval(updateTime, 2000);
}

// ── Quick Query Helper ───────────────────────────────────────────────────────
function setQuery(text, btnElement = null) {
  const input = document.getElementById("query-input");
  if (input) {
    input.value = text;
  }

  if (btnElement) {
    const allQbtns = document.querySelectorAll(".qbtn");
    allQbtns.forEach(b => b.classList.remove("active-scenario"));
    btnElement.classList.add("active-scenario");
  }

  // Automatically trigger decision engine evaluation
  submitQuery();
}

// ── Interactive Stadium Map Zone Selector ───────────────────────────────────
function selectZone(locationKey) {
  const select = document.getElementById("location-select");
  if (select) {
    select.value = locationKey;
    onLocationChange(locationKey);
  }
}

function onLocationChange(locationKey) {
  const data = ZONE_DATA[locationKey] || ZONE_DATA["Section A (North Stand)"];

  // Update map SVG highlighting
  const zoneGroups = document.querySelectorAll(".zone-group");
  zoneGroups.forEach(g => {
    const z = g.getAttribute("data-zone");
    if (
      (locationKey.includes("North") && z === "North") ||
      (locationKey.includes("East") && z === "East") ||
      (locationKey.includes("South") && z === "South") ||
      (locationKey.includes("West") && z === "West")
    ) {
      g.classList.add("active");
    } else {
      g.classList.remove("active");
    }
  });

  // Update telemetry sidebar
  const title = document.getElementById("current-zone-title");
  if (title) title.textContent = data.name;

  const densVal = document.getElementById("zone-density-val");
  if (densVal) densVal.textContent = data.density;

  const densBadge = document.getElementById("zone-density-badge");
  if (densBadge) {
    densBadge.textContent = data.densityBadge;
    densBadge.className = `stat-badge ${data.densityClass}`;
  }

  const waitVal = document.getElementById("zone-wait-val");
  if (waitVal) waitVal.textContent = data.wait;

  const gateVal = document.getElementById("zone-gate-val");
  if (gateVal) gateVal.textContent = data.gate;

  const altVal = document.getElementById("zone-alt-val");
  if (altVal) altVal.textContent = data.alt;

  const advText = document.getElementById("zone-advisory-text");
  if (advText) advText.textContent = data.advisory;

  // If a query is already entered or chosen, re-evaluate automatically for the new location
  const input = document.getElementById("query-input");
  if (input && input.value.trim()) {
    submitQuery();
  }
}

function applyZoneQuery(queryText) {
  setQuery(queryText);
  const consoleSec = document.getElementById("console-section");
  if (consoleSec) {
    consoleSec.scrollIntoView({ behavior: "smooth" });
  }
}

// ── Load Radar Panel ────────────────────────────────────────────────────────
async function loadRadar() {
  let data = null;
  try {
    const res = await fetch(`${API_BASE}/api/venues`);
    if (res.ok) data = await res.json();
  } catch (e) {}

  if (!data || !data.venues) {
    data = EMBEDDED_MOCK_DATA;
  }

  const samples = [
    data.venues.food_courts?.[0],
    data.venues.food_courts?.[2],
    data.venues.restrooms?.[0],
    data.venues.restrooms?.[3],
    data.venues.exits?.[0],
    data.venues.exits?.[3],
  ].filter(Boolean);

  const container = document.getElementById("radar-list");
  if (!container) return;

  container.innerHTML = "";
  samples.forEach(v => {
    const pct = v.crowd_percent || 50;
    const level = v.crowd_density || "medium";
    container.innerHTML += `
      <div class="radar-item crowd-${level}">
        <span class="r-name" title="${v.name}">${v.name}</span>
        <div class="r-bar-wrap">
          <div class="r-bar bar-${level}" style="width:${pct}%"></div>
        </div>
        <span class="r-val">${pct}% · ${v.wait_time_min}m wait</span>
      </div>`;
  });
}

// ── Load Full Facility Directory ────────────────────────────────────────────
async function loadAllFacilities() {
  let data = null;
  try {
    const res = await fetch(`${API_BASE}/api/venues`);
    if (res.ok) data = await res.json();
  } catch (e) {}

  if (!data || !data.venues) {
    data = EMBEDDED_MOCK_DATA;
  }

  allVenuesCatalog = [];
  const catMap = {
    food_courts: { label: "Food Court", color: "#ff9a3c", border: "rgba(255, 154, 60, 0.4)", bg: "rgba(255, 154, 60, 0.12)" },
    restrooms: { label: "Restroom", color: "#00f2fe", border: "rgba(0, 242, 254, 0.4)", bg: "rgba(0, 242, 254, 0.12)" },
    exits: { label: "Stadium Exit", color: "#ff3366", border: "rgba(255, 51, 102, 0.4)", bg: "rgba(255, 51, 102, 0.12)" },
    medical_aid: { label: "Medical Aid", color: "#00ff88", border: "rgba(0, 255, 136, 0.4)", bg: "rgba(0, 255, 136, 0.12)" },
    merchandise: { label: "Merchandise Store", color: "#a855f7", border: "rgba(168, 85, 247, 0.4)", bg: "rgba(168, 85, 247, 0.12)" },
    parking: { label: "Parking Facility", color: "#3b82f6", border: "rgba(59, 130, 246, 0.4)", bg: "rgba(59, 130, 246, 0.12)" }
  };

  for (const [category, venues] of Object.entries(data.venues || {})) {
    const conf = catMap[category] || { label: category, color: "#00e5ff", border: "rgba(0, 229, 255, 0.4)", bg: "rgba(0, 229, 255, 0.12)" };
    venues.forEach(v => {
      allVenuesCatalog.push({
        ...v,
        categoryKey: category,
        categoryLabel: conf.label,
        categoryColor: conf.color,
        categoryBorder: conf.border,
        categoryBg: conf.bg
      });
    });
  }

  renderFacilities();
}

function filterFacilities(cat, btn) {
  currentCategoryFilter = cat;
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderFacilities();
}

function searchFacilities(term) {
  currentSearchTerm = (term || "").toLowerCase().trim();
  renderFacilities();
}

function renderFacilities() {
  const container = document.getElementById("facilities-grid");
  if (!container) return;

  const filtered = allVenuesCatalog.filter(v => {
    const matchesCat = currentCategoryFilter === "all" || v.categoryKey === currentCategoryFilter;
    const matchesSearch = !currentSearchTerm ||
      v.name.toLowerCase().includes(currentSearchTerm) ||
      (v.zone && v.zone.toLowerCase().includes(currentSearchTerm)) ||
      (v.categoryLabel && v.categoryLabel.toLowerCase().includes(currentSearchTerm));
    return matchesCat && matchesSearch;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-dim); font-family: var(--font-mono);">
        No facilities match your search criteria.
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(v => {
    const level = v.crowd_density || "medium";
    const pct = v.crowd_percent || 45;
    return `
      <div class="facility-card" style="border-left: 3.5px solid ${v.categoryColor};">
        <div class="fc-header">
          <span class="fc-type" style="color: ${v.categoryColor}; background: ${v.categoryBg}; border: 1px solid ${v.categoryBorder}; padding: 2px 8px; border-radius: 4px;">
            ${v.categoryLabel}
          </span>
          <span class="crowd-tag ${level}">${level.replace("_", " ")}</span>
        </div>
        <h4 class="fc-name">${v.name}</h4>
        <p class="fc-zone">Zone: <strong style="color: #fff;">${v.zone || "Concourse"}</strong> · Distance: <strong style="color: var(--neon-cyan);">${v.distance_from_center_m || 0}m</strong></p>
        <div class="fc-metrics">
          <div class="fc-metric-item">
            <span class="fc-m-lbl">Est. Wait</span>
            <span class="fc-m-val" style="color: ${v.wait_time_min > 10 ? 'var(--neon-coral)' : 'var(--neon-green)'};">${v.wait_time_min ?? 0} mins</span>
          </div>
          <div class="fc-metric-item">
            <span class="fc-m-lbl">Crowd Load</span>
            <span class="fc-m-val" style="color: ${pct > 75 ? 'var(--neon-coral)' : pct > 45 ? 'var(--neon-yellow)' : 'var(--neon-green)'};">${pct}%</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ── Client-Side Intelligent Multi-Factor Decision Engine ───────────────────
function detectIntentClient(query) {
  const q = query.toLowerCase();
  if (["food", "eat", "hungry", "snack", "drink", "burger", "pizza", "water", "beer", "coffee", "beverage", "meal"].some(w => q.includes(w))) return "food_courts";
  if (["toilet", "restroom", "washroom", "bathroom", "wc", "loo", "urinal", "lavatory"].some(w => q.includes(w))) return "restrooms";
  if (["exit", "leave", "go out", "way out", "gate", "evacuate", "egress"].some(w => q.includes(w))) return "exits";
  if (["medical", "first aid", "hurt", "injured", "sick", "doctor", "medic", "hospital", "paramedic", "help"].some(w => q.includes(w))) return "medical_aid";
  if (["merch", "merchandise", "jersey", "souvenir", "shop", "buy", "store", "shirt", "gear"].some(w => q.includes(w))) return "merchandise";
  if (["park", "car", "vehicle", "parking", "garage", "lot"].some(w => q.includes(w))) return "parking";
  return "general";
}

function runClientDecisionEngine(query, location) {
  const intent = detectIntentClient(query);
  let venues = (EMBEDDED_MOCK_DATA.venues[intent] || []);
  if (!venues.length) {
    venues = Object.values(EMBEDDED_MOCK_DATA.venues).flat();
  }
  const ranked = [...venues].sort((a, b) => computeScore(a, venues) - computeScore(b, venues));

  const best = ranked[0];
  const nearest = [...ranked].sort((a, b) => (a.distance_from_center_m || 0) - (b.distance_from_center_m || 0))[0];

  const bestName = best ? best.name : "Option";
  const bestZone = best ? best.zone : "General";
  const bestDist = best ? best.distance_from_center_m : 0;
  const bestWait = best ? best.wait_time_min : 0;
  const bestCrowd = (best ? best.crowd_density : "low").replace("_", " ");
  const bestPct = best ? best.crowd_percent : 0;

  const nearName = nearest ? nearest.name : "Nearest Option";
  const nearZone = nearest ? nearest.zone : "General";
  const nearDist = nearest ? nearest.distance_from_center_m : 0;
  const nearWait = nearest ? nearest.wait_time_min : 0;
  const nearCrowd = (nearest ? nearest.crowd_density : "low").replace("_", " ");
  const nearPct = nearest ? nearest.crowd_percent : 0;

  let reasoning = "";
  let alternative = "";

  if (best && nearest && best.id === nearest.id) {
    reasoning = `${bestName} is currently your optimal choice from ${location}. It is the closest option at just ${bestDist}m away with a low estimated wait time of ${bestWait} min and ${bestCrowd} crowd density (${bestPct}% capacity).`;
    alternative = ranked[1] ? `${ranked[1].name} (${ranked[1].zone} Zone, ${ranked[1].distance_from_center_m}m) is a reliable alternative with a ${ranked[1].wait_time_min}-min wait.` : "No alternative needed — current option is clearly the best match.";
  } else {
    const timeSaved = nearWait > bestWait ? `saving approx ${nearWait - bestWait} minutes in line` : "with minimal congestion";
    reasoning = `Although ${nearName} is physically closer (${nearDist}m), it currently has a ${nearWait}-min wait and ${nearCrowd} crowd density (${nearPct}%). Walking slightly further (${bestDist}m) to ${bestName} in ${bestZone} Zone drops your wait to only ${bestWait} min with ${bestCrowd} crowd, ${timeSaved}.`;
    alternative = `${nearName} (${nearZone} Zone) is available ${nearDist}m away if minimizing walking distance is your main priority, but expect an estimated ${nearWait}-min queue.`;
  }

  const confidence = (best && (best.crowd_density === "low" || best.crowd_density === "medium") && bestWait <= 10) ? "High" : "Medium";

  return {
    short_answer: `Recommended: ${bestName} (${bestZone} Zone)`,
    reasoning: reasoning,
    alternative: alternative,
    confidence: confidence,
    intent: intent,
    venues: ranked
  };
}

// ── Query Submission ────────────────────────────────────────────────────────
async function submitQuery() {
  const queryInput = document.getElementById("query-input");
  const locationSelect = document.getElementById("location-select");

  const query = queryInput ? queryInput.value.trim() : "";
  const location = locationSelect ? locationSelect.value : "Section A (North Stand)";

  if (!query) {
    shakeInput();
    return;
  }

  setLoading(true);
  showThinkingSteps();

  try {
    const res = await fetch(`${API_BASE}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, location }),
    });
    if (res.ok) {
      const data = await res.json();
      await finaliseSteps();
      renderResult(data);
      return;
    }
  } catch (err) {
    // API unreachable (e.g. GitHub Pages static hosting or offline)
  }

  // Fallback seamlessly to client-side decision engine
  const clientResult = runClientDecisionEngine(query, location);
  await finaliseSteps();
  renderResult(clientResult);
  setLoading(false);
}

// ── Loading state ───────────────────────────────────────────────────────────
function setLoading(on) {
  const btn = document.getElementById("ask-btn");
  const btxt = document.getElementById("btn-text");
  const bload = document.getElementById("btn-loader");
  const barrow = btn ? btn.querySelector(".btn-arrow") : null;

  if (btn) btn.disabled = on;
  if (btxt) btxt.classList.toggle("hidden", on);
  if (bload) bload.classList.toggle("hidden", !on);
  if (barrow) barrow.classList.toggle("hidden", on);
}

// ── Thinking Steps Animation ────────────────────────────────────────────────
function showThinkingSteps() {
  const idle = document.getElementById("idle-state");
  const res = document.getElementById("result-state");
  if (idle) idle.classList.add("hidden");
  if (res) res.classList.remove("hidden");

  const card = document.getElementById("answer-card");
  const wrap = document.getElementById("venues-table-wrap");
  if (card) card.style.opacity = "0";
  if (wrap) wrap.style.opacity = "0";

  const steps = ["step1", "step2", "step3", "step4"];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active", "done");
  });

  activateStep("step1");
}

function activateStep(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

async function finaliseSteps() {
  const steps = ["step1", "step2", "step3", "step4"];
  for (let i = 0; i < steps.length; i++) {
    await sleep(260);
    const el = document.getElementById(steps[i]);
    if (el) {
      el.classList.remove("active");
      el.classList.add("done");
    }
    if (i + 1 < steps.length) activateStep(steps[i + 1]);
  }
  await sleep(150);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Render Result ───────────────────────────────────────────────────────────
function renderResult(data) {
  const shortAns = document.getElementById("short-answer");
  const reasoning = document.getElementById("reasoning");
  const alt = document.getElementById("alternative");
  const intentDisp = document.getElementById("intent-display");
  const badge = document.getElementById("confidence-badge");
  const card = document.getElementById("answer-card");

  if (shortAns) shortAns.textContent = data.short_answer || "No optimal path detected";
  if (reasoning) reasoning.textContent = data.reasoning || "";
  if (alt) alt.textContent = data.alternative || "No alternative needed.";

  const intentName = (data.intent || data.intent_detected || "general").replace(/_/g, " ").toUpperCase();
  if (intentDisp) intentDisp.textContent = intentName;

  if (badge) {
    const conf = (data.confidence || "High").toLowerCase();
    badge.textContent = (data.confidence || "High") + " Confidence";
    badge.className = "confidence-badge " + (conf === "high" ? "" : conf);
  }

  if (card) {
    card.style.transition = "opacity 0.4s ease";
    card.style.opacity = "1";
  }

  // Render evaluation table
  if (data.venues && data.venues.length) {
    renderVenuesTable(data.venues);
  } else {
    const wrap = document.getElementById("venues-table-wrap");
    if (wrap) wrap.style.opacity = "0";
  }

  setLoading(false);
}

function renderVenuesTable(venues) {
  const tbody = document.getElementById("venues-tbody");
  const countBadge = document.getElementById("table-count");
  if (!tbody) return;

  if (countBadge) countBadge.textContent = `${venues.length} Facilities Ranked`;
  tbody.innerHTML = "";

  venues.forEach((v, idx) => {
    const score = computeScore(v, venues);
    const scorePct = Math.round(score * 100);
    const scoreColor = score < 0.35 ? "#00ff88" : score < 0.65 ? "#ffd000" : "#ff6b35";

    const tr = document.createElement("tr");
    if (idx === 0) tr.classList.add("best-row");

    tr.innerHTML = `
      <td>${idx === 0 ? "★ " : ""}${v.name}</td>
      <td><span style="font-family:var(--font-mono);font-size:0.78rem;">${v.zone || "Concourse"}</span></td>
      <td>${v.distance_from_center_m}m</td>
      <td><span class="crowd-tag ${v.crowd_density}">${(v.crowd_density || "medium").replace("_", " ")}</span></td>
      <td><strong>${v.wait_time_min}m</strong></td>
      <td>
        <div class="score-bar-cell">
          <div class="score-mini-bar">
            <div class="score-mini-fill" style="width:${scorePct}%; background:${scoreColor}"></div>
          </div>
          <span style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:${scoreColor}">${(score).toFixed(2)}</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const wrap = document.getElementById("venues-table-wrap");
  if (wrap) {
    wrap.style.transition = "opacity 0.5s ease 0.15s";
    wrap.style.opacity = "1";
  }
}

function computeScore(v, allVenues) {
  const maxDist = Math.max(...allVenues.map(x => x.distance_from_center_m || 0)) || 1;
  const weights = { low: 0.2, medium: 0.5, high: 0.8, very_high: 1.0 };
  const dNorm = (v.distance_from_center_m || 0) / maxDist;
  const wNorm = Math.min((v.wait_time_min || 0) / 30, 1.0);
  const cNorm = weights[v.crowd_density] || 0.5;
  return 0.45 * wNorm + 0.35 * cNorm + 0.20 * dNorm;
}

function renderError(msg) {
  const shortAns = document.getElementById("short-answer");
  const reasoning = document.getElementById("reasoning");
  const alt = document.getElementById("alternative");
  const card = document.getElementById("answer-card");

  if (shortAns) shortAns.textContent = "Evaluation Error";
  if (reasoning) reasoning.textContent = msg;
  if (alt) alt.textContent = "Please try again or select another query.";
  if (card) {
    card.style.opacity = "1";
  }
}

function shakeInput() {
  const el = document.getElementById("query-input");
  if (!el) return;
  el.style.animation = "none";
  el.offsetHeight; // force reflow
  el.style.animation = "shake 0.3s ease";
  el.focus();
}

// Shake animation definition
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  80% { transform: translateX(-3px); }
}
`;
document.head.appendChild(shakeStyle);
