"""Copy esotico.ca's new marketing subscribers from Squarespace into Sender.net.

Buyers who tick "keep me informed" at checkout become Squarespace contacts with acceptsMarketing = true. Sender.net (the
free email tool) has no Squarespace connection, so this runs on a schedule (GitHub Actions, .github/workflows/) and:
  1. reads Squarespace's contact list and keeps those who opted in to marketing in the last LOOKBACK_DAYS;
  2. for each one, asks Sender whether that email already exists - if it does (active, unsubscribed or bounced), it is
     LEFT ALONE, so nobody who unsubscribed in Sender is ever re-added (Canada's anti-spam law, CASL);
  3. adds the new ones to the Sender group named SENDER_GROUP (found by its title), which starts the welcome email.
The lookback overlaps the schedule, so a missed run is caught by the next one; step 2 makes a repeat harmless.

The repository is public, so this prints COUNTS ONLY - never an email address or a name.

Environment (GitHub repository secrets):
  SQUARESPACE_API_KEY   Squarespace developer API key with the Contacts read-only permission (CONTACT_READONLY)
  SENDER_API_TOKEN      Sender.net API access token
  SENDER_GROUP          optional, the Sender group's name (default "Website subscribers"); the welcome automation
                        watches this group
  LOOKBACK_DAYS         optional, default 3
  DRY_RUN               optional, "1" = report what would be added, add nothing
Sources: developers.squarespace.com/commerce-apis/contacts (GET /v1/contacts; the filtered POST /v1/contacts/query refuses read-only keys);
api.sender.net (GET /v2/groups, GET /v2/subscribers/{email}, POST /v2/subscribers)."""
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SQ = os.environ.get("SQ_URL", "https://api.squarespace.com/v1/contacts")      # override: tests only
SENDER = os.environ.get("SENDER_URL", "https://api.sender.net/v2/subscribers")  # override: tests only
GROUPS = os.environ.get("SENDER_GROUPS_URL", "https://api.sender.net/v2/groups")  # override: tests only
UA = "esotico-subscriber-sync/1.0 (hello@esotico.ca)"


def call(method, url, token, body=None, tries=5):
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(tries):
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"Bearer {token}", "User-Agent": UA,
            "Content-Type": "application/json", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                raw = r.read()
                return r.status, (json.loads(raw) if raw else {})
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < tries - 1:          # rate limited: wait and retry
                time.sleep(2 ** attempt * 5)
                continue
            raw = e.read()
            try:
                return e.code, json.loads(raw) if raw else {}
            except ValueError:
                return e.code, {}
    return 429, {}


def squarespace_opt_ins(key, since):
    # The plain list (GET /v1/contacts), filtered here: a read-only key is refused by the filtered search
    # (POST /v1/contacts/query answered 403 AUTHORIZATION_ERROR on 29 Sep 2026 while this list answered 200).
    out, cursor = [], None
    while True:
        url = SQ + "?pageSize=1000" + (f"&cursor={urllib.parse.quote(cursor, safe='')}" if cursor else "")
        status, page = call("GET", url, key)
        if status != 200:
            why = {k: page.get(k) for k in ("type", "subtype", "message", "detail", "title") if page.get(k)}
            sys.exit(f"Squarespace Contacts API answered {status} {why}; "
                     "check SQUARESPACE_API_KEY and its Contacts (Read Only) permission")
        for c in page.get("contacts", []):
            pe = c.get("primaryEmail") or {}
            am = pe.get("acceptsMarketing") or {}
            joined = am.get("joinedOn")
            if not (pe.get("email") and am.get("acceptsMarketing") and not am.get("leftOn") and joined):
                continue
            if dt.datetime.fromisoformat(joined.replace("Z", "+00:00")) < since:
                continue
            out.append({"email": pe["email"].strip().lower(),
                        "firstname": c.get("firstName") or "", "lastname": c.get("lastName") or ""})
        pg = page.get("pagination") or {}
        cursor = pg.get("nextPageCursor")
        if not pg.get("hasNextPage") or not cursor:
            return out


def sender_group_id(token, title):
    url = GROUPS
    while url:
        status, page = call("GET", url, token)
        if status != 200:
            sys.exit(f"Sender groups API answered {status}; check SENDER_API_TOKEN")
        for g in page.get("data", []):
            if (g.get("title") or "").strip().lower() == title.strip().lower():
                return g["id"]
        url = (page.get("links") or {}).get("next")
    sys.exit(f'No Sender group named "{title}"; create it in Sender (Subscribers > Groups)')


def main():
    key, token = (os.environ.get(k, "").strip() for k in ("SQUARESPACE_API_KEY", "SENDER_API_TOKEN"))
    missing = [n for n, v in (("SQUARESPACE_API_KEY", key), ("SENDER_API_TOKEN", token)) if not v]
    if missing:
        sys.exit("Missing secrets: " + ", ".join(missing))
    group = sender_group_id(token, os.environ.get("SENDER_GROUP") or "Website subscribers")
    days = int(os.environ.get("LOOKBACK_DAYS") or 3)
    dry = os.environ.get("DRY_RUN") == "1"
    since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)

    people = {p["email"]: p for p in squarespace_opt_ins(key, since)}      # one row per email
    added = existing = failed = 0
    for email, p in people.items():
        status, _ = call("GET", f"{SENDER}/{urllib.parse.quote(email, safe='')}", token)
        if status == 200:
            existing += 1                                                  # never touched: may have unsubscribed
            continue
        if status != 404:
            failed += 1
            continue
        if dry:
            added += 1
            continue
        status, _ = call("POST", SENDER, token, {"email": email, "firstname": p["firstname"],
                                                 "lastname": p["lastname"], "groups": [group],
                                                 "trigger_automation": True})
        if status in (200, 201):
            added += 1
        else:
            failed += 1
    print(f"Opted in at checkout in the last {days} days: {len(people)}. "
          f"{'Would add' if dry else 'Added'} to Sender: {added}. Already in Sender (left alone): {existing}. "
          f"Failed: {failed}.")
    if failed:
        sys.exit(1)                                                        # a red run emails the repo owner


if __name__ == "__main__":
    main()
