# Travel Planner (HTML + CSS + JS + Python)

A simple travel planner web app that lets you:
- Create an itinerary (day-by-day)
- Add places/activities with time estimates
- Save and load itineraries as JSON
- Export an itinerary to a printable HTML page

## Run

### Option A: Static (no Python needed)
- Open `frontend/index.html` in your browser.

### Option B: With Python local server (recommended)
```bash
python -m http.server 8000 --directory frontend
```
Then open:
- http://localhost:8000

## Export (Python)
Export uses a small Python script to render an HTML file from the saved JSON.

```bash
python export.py frontend/data/trip.json export.html
```

## Files
- `frontend/index.html` - UI
- `frontend/styles.css` - styling
- `frontend/app.js` - client logic
- `frontend/data/` - saved trip JSON files
- `export.py` - server-side export to printable HTML

