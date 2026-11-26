import os, json, hashlib, datetime, pathlib, requests

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)
API_BASE = "https://v3.football.api-sports.io"
API_KEY = os.getenv("API_FOOTBALL_KEY", "").strip()
PAGE_ID = os.getenv("FACEBOOK_PAGE_ID", "").strip()
PAGE_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "").strip()
TODAY = datetime.datetime.now(datetime.timezone.utc).date()
STATE_FILE = DATA_DIR / "published_state.json"
LIVE_FILE = DATA_DIR / "live.json"

def api_get(path, params):
    if not API_KEY:
        raise RuntimeError("Le secret GitHub API_FOOTBALL_KEY est manquant.")
    r = requests.get(f"{API_BASE}/{path}", headers={"x-apisports-key": API_KEY},
                     params=params, timeout=30)
    r.raise_for_status()
    payload = r.json()
    if payload.get("errors"):
        raise RuntimeError(f"API-Football: {payload['errors']}")
    return payload.get("response", [])

def fetch_fixtures(date):
    return api_get("fixtures", {"date": date.isoformat(), "timezone": "Africa/Bamako"})

def normalize(item):
    f = item["fixture"]; teams = item["teams"]; goals = item.get("goals") or {}
    league = item.get("league") or {}
    status = f.get("status") or {}
    kickoff = f.get("date", "")
    try:
        kickoff = datetime.datetime.fromisoformat(kickoff.replace("Z","+00:00")).astimezone(
            datetime.timezone(datetime.timedelta(0))).strftime("%d/%m %H:%M UTC")
    except Exception:
        pass
    return {
      "id": f.get("id"), "league": league.get("name","Football"),
      "country": league.get("country",""), "home": (teams.get("home") or {}).get("name","Équipe domicile"),
      "away": (teams.get("away") or {}).get("name","Équipe extérieure"),
      "home_goals": goals.get("home"), "away_goals": goals.get("away"),
      "status": status.get("short","NS"), "elapsed": status.get("elapsed"), "kickoff": kickoff
    }

def fb_publish(message):
    if not (PAGE_ID and PAGE_TOKEN):
        print("Facebook non configuré : publication ignorée.")
        return False
    url = f"https://graph.facebook.com/v21.0/{PAGE_ID}/feed"
    r = requests.post(url, data={"message": message, "access_token": PAGE_TOKEN}, timeout=30)
    if not r.ok:
        raise RuntimeError(f"Facebook Graph API ({r.status_code}): {r.text[:500]}")
    print("Publication Facebook créée :", r.json().get("id"))
    return True

def load_state():
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception: pass
    return {}

def main():
    fixtures = []
    # Aujourd'hui et hier : couvre les matchs tardifs et les résultats récents.
    for day in (TODAY - datetime.timedelta(days=1), TODAY):
        fixtures.extend(fetch_fixtures(day))
    normalized = [normalize(x) for x in fixtures]
    normalized.sort(key=lambda x: (x.get("kickoff") or "", x.get("league") or ""))
    LIVE_FILE.write_text(json.dumps({
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "matches": normalized
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    state = load_state()
    published = 0
    for m in normalized:
        status = (m.get("status") or "").upper()
        # Publier les résultats finaux et les événements de score live, sans répéter
        # le même état à chaque exécution du workflow.
        if status in ("FT", "AET", "PEN"):
            key = f"{m['id']}:final:{m['home_goals']}-{m['away_goals']}"
            message = (f"🏁 RÉSULTAT FINAL | {m['league']}\\n"
                       f"{m['home']} {m['home_goals']} - {m['away_goals']} {m['away']}\\n"
                       f"🌍 {m['country']}\\n\\n#FootballSpotlight #Football")
        elif status in ("1H", "2H", "HT", "ET", "P", "LIVE", "INT"):
            key = f"{m['id']}:live:{m['home_goals']}-{m['away_goals']}:{status}:{m['elapsed']}"
            # Ne publier que les changements de score / mi-temps, pas chaque minute.
            score_key = f"{m['id']}:score:{m['home_goals']}-{m['away_goals']}:{status}"
            if state.get(score_key): 
                continue
            key = score_key
            message = (f"🔴 MATCH EN DIRECT | {m['league']}\\n"
                       f"{m['home']} {m['home_goals']} - {m['away_goals']} {m['away']}\\n"
                       f"⏱️ {m['elapsed'] or ''}′ | {m['country']}\\n\\n#FootballSpotlight #Live")
        else:
            continue
        if key in state:
            continue
        if fb_publish(message):
            state[key] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            published += 1

    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(normalized)} matchs enregistrés ; {published} nouvelle(s) publication(s) Facebook.")

if __name__ == "__main__":
    main()
