from flask import Flask, request, jsonify, send_from_directory
import json
import os
import re
import urllib.request
import urllib.error

app = Flask(__name__, template_folder="../frontend", static_folder="../frontend/static")

# ── Load mock data ───────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/mock_data.json")
with open(DATA_PATH) as f:
    MOCK_DATA = json.load(f)

# ── Anthropic client setup ───────────────────────────────────────────────────
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

def call_claude(system_prompt: str, user_message: str) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set.")

    payload = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1000,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}]
    }).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["content"][0]["text"]

# ── Scoring Engine ───────────────────────────────────────────────────────────
CROWD_WEIGHTS = {"low": 0.2, "medium": 0.5, "high": 0.8, "very_high": 1.0}

def score_venue(venue: dict, max_distance: float) -> float:
    """Lower score = better. Composite of normalised distance + wait + crowd."""
    dist_norm   = venue.get("distance_from_center_m", 0) / max(max_distance, 1)
    wait_norm   = min(venue.get("wait_time_min", 0) / 30, 1.0)
    crowd_norm  = CROWD_WEIGHTS.get(venue.get("crowd_density", "low"), 0.5)

    # Weighted sum: wait matters most, then crowd, then distance
    return 0.45 * wait_norm + 0.35 * crowd_norm + 0.20 * dist_norm

def detect_intent(query: str) -> str:
    q = query.lower()
    if any(w in q for w in ["food", "eat", "hungry", "snack", "drink", "burger", "pizza", "water", "beer", "coffee", "beverage", "meal"]):
        return "food_courts"
    if any(w in q for w in ["toilet", "restroom", "washroom", "bathroom", "wc", "loo", "urinal", "lavatory"]):
        return "restrooms"
    if any(w in q for w in ["exit", "leave", "go out", "way out", "gate", "evacuate", "egress"]):
        return "exits"
    if any(w in q for w in ["medical", "first aid", "hurt", "injured", "sick", "doctor", "medic", "hospital", "paramedic", "help"]):
        return "medical_aid"
    if any(w in q for w in ["merch", "merchandise", "jersey", "souvenir", "shop", "buy", "store", "shirt", "gear"]):
        return "merchandise"
    if any(w in q for w in ["park", "car", "vehicle", "parking", "garage", "lot"]):
        return "parking"
    return "general"

def rank_venues(venues: list) -> list:
    max_dist = max(v.get("distance_from_center_m", 0) for v in venues) or 1
    return sorted(venues, key=lambda v: score_venue(v, max_dist))

def generate_local_reasoning(intent: str, ranked: list, location: str, query: str) -> dict:
    """
    Intelligent Multi-Factor Decision Engine:
    Evaluates wait time, crowd density, and distance to produce transparent,
    plain-language reasoning and trade-off analysis.
    """
    if not ranked:
        return {
            "short_answer": "No venues matching your request were found.",
            "reasoning": f"Scanned all venue categories for '{query}' from {location}, but no active facilities matched.",
            "alternative": "Visit any stadium information desk or Section A North Stand for staff assistance.",
            "confidence": "Low",
            "intent_detected": intent
        }

    best = ranked[0]
    nearest = min(ranked, key=lambda v: v.get("distance_from_center_m", 9999))
    fastest = min(ranked, key=lambda v: (v.get("wait_time_min", 9999), v.get("distance_from_center_m", 9999)))

    best_name = best.get("name", "Option")
    best_zone = best.get("zone", "General")
    best_dist = best.get("distance_from_center_m", 0)
    best_wait = best.get("wait_time_min", 0)
    best_crowd = best.get("crowd_density", "low").replace("_", " ")
    best_pct = best.get("crowd_percent", 0)

    near_name = nearest.get("name", "Nearest Option")
    near_zone = nearest.get("zone", "General")
    near_dist = nearest.get("distance_from_center_m", 0)
    near_wait = nearest.get("wait_time_min", 0)
    near_crowd = nearest.get("crowd_density", "low").replace("_", " ")
    near_pct = nearest.get("crowd_percent", 0)

    short_answer = f"Recommended: {best_name} ({best_zone} Zone)"

    if best.get("id") == nearest.get("id"):
        reasoning = (
            f"{best_name} is currently your optimal choice from {location}. "
            f"It is the closest option at just {best_dist}m away with a low estimated wait time of "
            f"{best_wait} min and {best_crowd} crowd density ({best_pct}% capacity)."
        )
        if len(ranked) > 1:
            second = ranked[1]
            alternative = (
                f"{second['name']} ({second['zone']} Zone, {second['distance_from_center_m']}m) "
                f"is a reliable alternative with a {second['wait_time_min']}-min wait if you prefer heading that direction."
            )
        else:
            alternative = "No alternative needed — current option is clearly the best match."
    else:
        wait_diff = near_wait - best_wait
        dist_diff = best_dist - near_dist
        time_saved = f"saving approx {wait_diff} minutes in line" if wait_diff > 0 else "with minimal congestion"
        reasoning = (
            f"Although {near_name} is physically closer ({near_dist}m), it currently has a {near_wait}-min wait "
            f"and {near_crowd} crowd density ({near_pct}%). Walking slightly further ({best_dist}m) to "
            f"{best_name} in {best_zone} Zone drops your wait to only {best_wait} min with {best_crowd} crowd, "
            f"{time_saved}."
        )
        alternative = (
            f"{near_name} ({near_zone} Zone) is available {near_dist}m away if minimizing walking distance "
            f"is your only priority, but be prepared for an estimated {near_wait}-min queue."
        )

    confidence = "High" if best.get("crowd_density") in ["low", "medium"] and best_wait <= 10 else "Medium"

    return {
        "short_answer": short_answer,
        "reasoning": reasoning,
        "alternative": alternative,
        "confidence": confidence,
        "intent_detected": intent
    }

# ── System prompt for Claude ─────────────────────────────────────────────────
SYSTEM_PROMPT = """You are InsightFlow AI — the intelligent assistant for large-scale physical events such as stadiums and arenas.

You reason step-by-step BEFORE answering. Your thinking process:
  Step 1: Identify all possible options from the data provided.
  Step 2: Evaluate each option across four dimensions: distance, crowd density, estimated wait time, user intent.
  Step 3: Compare trade-offs explicitly.
  Step 4: Select the optimal choice — NOT necessarily the nearest one.

RESPONSE FORMAT (strictly follow this JSON schema):
{
  "short_answer": "<one-line recommendation>",
  "reasoning": "<2–4 sentences explaining WHY this is optimal considering distance, crowd, wait time>",
  "alternative": "<backup option with brief justification>",
  "confidence": "<High | Medium | Low>",
  "intent_detected": "<what category the user is asking about>"
}

Rules:
- Never recommend the nearest option if it has high crowd density or long wait.
- Prefer a balance of low wait time and reasonable distance.
- Be specific: mention venue names, wait times, crowd levels.
- Do NOT use Markdown inside the JSON string values.
- Return ONLY the JSON object, no extra text."""

# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    if os.path.exists(os.path.join(os.path.dirname(__file__), "../index.html")):
        return send_from_directory("..", "index.html")
    return send_from_directory("../frontend", "index.html")

@app.route("/favicon.ico")
def favicon():
    if os.path.exists(os.path.join(os.path.dirname(__file__), "../static/favicon.svg")):
        return send_from_directory("../static", "favicon.svg", mimetype="image/svg+xml")
    return send_from_directory("../frontend/static", "favicon.svg", mimetype="image/svg+xml")

@app.route("/static/<path:filename>")
def static_files(filename):
    if os.path.exists(os.path.join(os.path.dirname(__file__), "../static", filename)):
        return send_from_directory("../static", filename)
    return send_from_directory("../frontend/static", filename)

@app.route("/api/venues")
def get_venues():
    return jsonify(MOCK_DATA)

@app.route("/api/query", methods=["POST"])
def handle_query():
    body = request.get_json(force=True, silent=True) or {}
    query = body.get("query", "").strip()
    location = body.get("location", "Section A (North Stand)")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    # Detect intent & retrieve relevant venues
    intent = detect_intent(query)
    venues = MOCK_DATA["venues"].get(intent, [])

    # Fall back to all venues flattened if intent is general
    if not venues:
        venues = [v for group in MOCK_DATA["venues"].values() for v in group]

    ranked = rank_venues(venues)

    # First check if Anthropic API key is provided for external LLM call
    result = None
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if api_key:
        venue_summary = "\n".join([
            f"- {v['name']} (Zone: {v['zone']}, Distance: {v['distance_from_center_m']}m, "
            f"Crowd: {v['crowd_density']} [{v.get('crowd_percent', 0)}%], Wait: {v['wait_time_min']} min)"
            for v in ranked
        ])

        user_message = f"""User is at: {location}
User query: "{query}"

Venue data ({intent}):
{venue_summary}

Analyse all options and respond with the optimal recommendation in the specified JSON format."""

        try:
            raw = call_claude(SYSTEM_PROMPT, user_message)
            clean = re.sub(r"```json|```", "", raw).strip()
            result = json.loads(clean)
        except Exception as e:
            # Fall back to built-in reasoning engine if API fails
            result = None

    # If no API key or API call failed, use the built-in Intelligent Decision Engine
    if not result:
        result = generate_local_reasoning(intent, ranked, location, query)

    # Attach raw venue data and detected intent for UI display
    result["venues"] = ranked
    result["intent"] = intent
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
