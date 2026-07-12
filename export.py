import argparse
import json
import html
from pathlib import Path
import datetime


def format_minutes(mins):
    try:
        m = int(mins)
    except Exception:
        return str(mins)
    if m < 60:
        return f"{m}m"
    h, r = divmod(m, 60)
    return f"{h}h {r}m".strip() if r else f"{h}h"


def day_label(start_date, day_index):
    if not start_date:
        return f"Day {day_index + 1}"
    y, m, d = map(int, start_date.split('-'))
    dt = datetime.date(y, m, d) + datetime.timedelta(days=day_index)
    return f"Day {day_index + 1} ({dt.isoformat()})"


def escape(s):
    return html.escape(str(s or ""), quote=True)


def export_to_html(data, out_path: Path):
    trip = data.get("trip", {})
    day_items = data.get("dayItems") or []

    destination = escape(trip.get("destination") or "Your Trip")
    start_date = trip.get("startDate")
    notes = trip.get("notes")
    days = int(trip.get("days") or len(day_items) or 1)

    parts = []
    parts.append('<!doctype html>')
    parts.append('<html lang="en">')
    parts.append('<head>')
    parts.append('<meta charset="utf-8" />')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1" />')
    parts.append('<title>Printable Itinerary</title>')
    parts.append('<style>')
    parts.append('body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#000;}')
    parts.append('table{width:100%;border-collapse:collapse;margin-top:8px;}')
    parts.append('th,td{border:1px solid #d9d9d9;padding:8px;font-size:13px;text-align:left;vertical-align:top;}')
    parts.append('th{background:#f4f4f4;}')
    parts.append('.sub{color:#333;font-size:13px;margin-top:4px;}')
    parts.append('.day{margin-top:18px;}')
    parts.append('</style>')
    parts.append('</head>')
    parts.append('<body>')

    parts.append(f"<h1>{destination} — Itinerary</h1>")
    sub = []
    if start_date:
        sub.append(f"Start: {escape(start_date)}")
    sub.append(f"Days: {days}")
    parts.append(f"<div class='sub'>{' • '.join(sub)}</div>")
    if notes:
        parts.append(f"<div class='sub'>Notes: {escape(notes)}</div>")

    for day in day_items:
        idx = int(day.get("dayIndex", 0))
        label = escape(day_label(start_date, idx))
        items = day.get("items") or []
        parts.append(f"<div class='day'><h3>{label}</h3>")
        parts.append('<table><thead><tr><th>Time</th><th>Activity</th><th>Duration</th><th>Category</th><th>Cost</th></tr></thead><tbody>')

        if not items:
            parts.append("<tr><td colspan='5'>No items yet</td></tr>")
        else:
            for it in items:
                t = escape(it.get("time") or "")
                name = escape(it.get("name") or "")
                details = it.get("details")
                dur = escape(format_minutes(it.get("durationMins")))
                cat = escape(it.get("category") or "")
                cost = escape(it.get("cost") or "")

                detail_html = f"<div style='color:#444;margin-top:4px;'>{escape(details)}</div>" if details else ""

                parts.append(
                    "<tr>"
                    f"<td>{t}</td>"
                    f"<td><b>{name}</b>{detail_html}</td>"
                    f"<td>{dur}</td>"
                    f"<td>{cat}</td>"
                    f"<td>{cost}</td>"
                    "</tr>"
                )

        parts.append("</tbody></table></div>")

    parts.append('</body></html>')

    out_path.write_text("\n".join(parts), encoding='utf-8')


def main():
    ap = argparse.ArgumentParser(description='Export Travel Planner JSON to printable HTML.')
    ap.add_argument('input_json', help='Path to trip JSON file (saved by the web app).')
    ap.add_argument('output_html', help='Output HTML file path.')
    args = ap.parse_args()

    inp = Path(args.input_json)
    outp = Path(args.output_html)

    data = json.loads(inp.read_text(encoding='utf-8'))
    export_to_html(data, outp)
    print(f"Exported: {outp}")


if __name__ == '__main__':
    main()

