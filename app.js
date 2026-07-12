const els = {
  tripDestination: document.getElementById('tripDestination'),
  tripStartDate: document.getElementById('tripStartDate'),
  tripDays: document.getElementById('tripDays'),
  tripNotes: document.getElementById('tripNotes'),
  btnCreateDays: document.getElementById('btnCreateDays'),

  daysNav: document.getElementById('daysNav'),
  dayTitle: document.getElementById('dayTitle'),
  daysMeta: document.getElementById('daysMeta'),

  placeTime: document.getElementById('placeTime'),
  placeName: document.getElementById('placeName'),
  placeDuration: document.getElementById('placeDuration'),
  placeCategory: document.getElementById('placeCategory'),
  placeCost: document.getElementById('placeCost'),
  placeDetails: document.getElementById('placeDetails'),
  btnAddPlace: document.getElementById('btnAddPlace'),
  btnRemovePlace: document.getElementById('btnRemovePlace'),

  placeList: document.getElementById('placeList'),
  emptyState: document.getElementById('emptyState'),
  dayTotal: document.getElementById('dayTotal'),

  btnReset: document.getElementById('btnReset'),
  btnSave: document.getElementById('btnSave'),
  btnLoad: document.getElementById('btnLoad'),
  fileInput: document.getElementById('fileInput'),

  btnExport: document.getElementById('btnExport'),
  btnPrint: document.getElementById('btnPrint'),

  exportArea: document.getElementById('exportArea'),
  exportPreview: document.getElementById('exportPreview'),

  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg'),
};

let state = {
  destination: '',
  startDate: '',
  days: 3,
  notes: '',
  dayItems: [] // [{ dayIndex: 0, items: [] }]
};

let selected = {
  dayIndex: 0,
  itemId: null
};

function uid(){
  return Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
}

function showToast(msg){
  els.toastMsg.textContent = msg;
  els.toast.open = true;
  setTimeout(() => els.toast.open = false, 2600);
}

function initDays(days){
  state.days = days;
  state.dayItems = Array.from({length: days}, (_, i) => ({
    dayIndex: i,
    items: []
  }));
  selected.dayIndex = 0;
  selected.itemId = null;
}

function currentDay(){
  return state.dayItems[selected.dayIndex];
}

function formatMinutes(mins){
  const m = Number(mins) || 0;
  if(m < 60) return `${m}m`;
  const h = Math.floor(m/60);
  const r = m%60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function updateDaysNav(){
  const days = state.dayItems.length;
  els.daysNav.innerHTML = '';

  for(let i=0; i<days; i++){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-chip' + (i === selected.dayIndex ? ' active' : '');
    btn.textContent = `Day ${i+1}`;
    btn.addEventListener('click', () => {
      selected.dayIndex = i;
      selected.itemId = null;
      updateDaysNav();
      renderDay();
    });
    els.daysNav.appendChild(btn);
  }

  els.dayTitle.textContent = `Day ${selected.dayIndex + 1}`;
  els.daysMeta.textContent = `Total days: ${days}`;
}

function sortItems(items){
  return items.slice().sort((a,b) => {
    // time string HH:MM sorts lexicographically
    if(a.time === b.time) return (a.createdAt || 0) - (b.createdAt || 0);
    return a.time.localeCompare(b.time);
  });
}

function computeTotalMinutes(items){
  return items.reduce((sum, it) => sum + (Number(it.durationMins) || 0), 0);
}

function renderDay(){
  const day = currentDay();
  const items = sortItems(day.items);

  els.placeList.innerHTML = '';
  const total = computeTotalMinutes(items);
  els.dayTotal.textContent = `Total: ${formatMinutes(total)}`;

  els.emptyState.classList.toggle('show', items.length === 0);

  for(const it of items){
    const li = document.createElement('li');
    li.className = 'place-item' + (it.id === selected.itemId ? ' active' : '');
    li.dataset.itemId = it.id;

    li.innerHTML = `
      <div class="place-pill">${escapeHtml(it.category)}</div>
      <div class="place-main">
        <div class="place-top">
          <div>
            <div class="place-name">${escapeHtml(it.name)}</div>
            <div class="place-meta">${escapeHtml(it.time)} • ${formatMinutes(it.durationMins)}</div>
          </div>
          <div class="place-meta">${it.cost ? escapeHtml(it.cost) : ''}</div>
        </div>
        ${it.details ? `<div class="place-details">${escapeHtml(it.details)}</div>` : ''}
      </div>
    `;

    li.addEventListener('click', () => {
      selected.itemId = it.id;
      renderDay();
    });

    els.placeList.appendChild(li);
  }

  els.btnRemovePlace.disabled = !selected.itemId;
}

function escapeHtml(str){
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function addPlace(){
  const time = els.placeTime.value || '09:00';
  const name = (els.placeName.value || '').trim();
  const durationMins = Number(els.placeDuration.value);
  const category = els.placeCategory.value;
  const cost = (els.placeCost.value || '').trim();
  const details = (els.placeDetails.value || '').trim();

  if(!name){
    showToast('Enter a place/activity name.');
    els.placeName.focus();
    return;
  }
  if(!Number.isFinite(durationMins) || durationMins <= 0){
    showToast('Enter a valid duration (minutes).');
    els.placeDuration.focus();
    return;
  }

  const day = currentDay();
  day.items.push({
    id: uid(),
    name,
    time,
    durationMins,
    category,
    cost,
    details,
    createdAt: Date.now()
  });

  els.placeName.value = '';
  els.placeCost.value = '';
  els.placeDetails.value = '';
  selected.itemId = null;
  renderDay();
}

function removeSelected(){
  if(!selected.itemId) return;
  const day = currentDay();
  day.items = day.items.filter(it => it.id !== selected.itemId);
  selected.itemId = null;
  renderDay();
}

function gatherTripInfoFromUI(){
  state.destination = els.tripDestination.value.trim();
  state.startDate = els.tripStartDate.value;
  state.days = Math.max(1, Math.min(60, Number(els.tripDays.value) || 1));
  state.notes = els.tripNotes.value.trim();
}

function createDaysFromUI(){
  gatherTripInfoFromUI();
  initDays(state.days);
  updateDaysNav();
  renderDay();
  els.exportArea.style.display = 'none';
  showToast('Days created. Start adding activities!');
}

function getDayLabel(dayIndex){
  if(state.startDate){
    const d = new Date(state.startDate);
    d.setDate(d.getDate() + dayIndex);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `Day ${dayIndex+1} (${yyyy}-${mm}-${dd})`;
  }
  return `Day ${dayIndex+1}`;
}

function buildExportHtml(){
  const dest = escapeHtml(state.destination || 'Your Trip');
  const notes = state.notes ? escapeHtml(state.notes) : '';
  const start = state.startDate ? escapeHtml(state.startDate) : '';

  let html = '';
  html += `<h1>${dest} — Itinerary</h1>`;
  html += `<div class="sub">${start ? `Start: ${start} • ` : ''}Days: ${state.days}</div>`;
  if(notes){
    html += `<div class="sub">Notes: ${notes}</div>`;
  }

  for(const day of state.dayItems){
    const items = sortItems(day.items);
    html += `<div class="day"><h3>${escapeHtml(getDayLabel(day.dayIndex))}</h3>`;

    html += `<table><thead><tr><th>Time</th><th>Activity</th><th>Duration</th><th>Category</th><th>Cost</th></tr></thead><tbody>`;

    if(items.length === 0){
      html += `<tr><td colspan="5" style="color:#555;">No items yet</td></tr>`;
    } else {
      for(const it of items){
        html += `<tr>`;
        html += `<td>${escapeHtml(it.time)}</td>`;
        html += `<td><b>${escapeHtml(it.name)}</b>${it.details ? `<div style="color:#444;">${escapeHtml(it.details)}</div>` : ''}</td>`;
        html += `<td>${escapeHtml(formatMinutes(it.durationMins))}</td>`;
        html += `<td>${escapeHtml(it.category)}</td>`;
        html += `<td>${it.cost ? escapeHtml(it.cost) : ''}</td>`;
        html += `</tr>`;
      }
    }

    html += `</tbody></table></div>`;
  }

  return html;
}

function exportPrintable(){
  // Show preview in-page; user can print.
  els.exportArea.style.display = 'block';
  els.exportPreview.innerHTML = buildExportHtml();
  showToast('Printable preview generated. Use Print button.');
}

function resetAll(){
  els.tripDestination.value = '';
  els.tripStartDate.value = '';
  els.tripDays.value = '3';
  els.tripNotes.value = '';

  selected.dayIndex = 0;
  selected.itemId = null;
  state = {destination:'',startDate:'',days:3,notes:'',dayItems:[]};

  els.daysNav.innerHTML = '';
  els.placeList.innerHTML = '';
  els.emptyState.classList.remove('show');
  els.btnRemovePlace.disabled = true;
  els.dayTotal.textContent = '';
  els.dayTitle.textContent = 'Day 1';
  els.exportArea.style.display = 'none';
  els.daysMeta.textContent = '';
  showToast('Reset complete.');
}

function saveJson(){
  gatherTripInfoFromUI();
  if(state.dayItems.length === 0){
    showToast('Create days first.');
    return;
  }

  const payload = {
    version: 1,
    trip: {
      destination: state.destination,
      startDate: state.startDate,
      days: state.days,
      notes: state.notes
    },
    dayItems: state.dayItems
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const fileName = `trip-${(state.destination || 'travel').toLowerCase().replaceAll(/\s+/g,'-')}-${Date.now()}.json`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast('JSON saved.');
}

async function loadJsonFromFile(file){
  const text = await file.text();
  const parsed = JSON.parse(text);

  const trip = parsed.trip || {};
  state.destination = trip.destination || '';
  state.startDate = trip.startDate || '';
  state.days = Number(trip.days) || 1;
  state.notes = trip.notes || '';

  state.dayItems = Array.isArray(parsed.dayItems) ? parsed.dayItems : [];
  if(state.dayItems.length === 0){
    initDays(state.days);
  }

  // ensure length
  if(state.dayItems.length !== state.days){
    initDays(state.days);
  }

  // sync UI
  els.tripDestination.value = state.destination;
  els.tripStartDate.value = state.startDate;
  els.tripDays.value = state.days;
  els.tripNotes.value = state.notes;

  selected.dayIndex = 0;
  selected.itemId = null;

  updateDaysNav();
  renderDay();
  els.exportArea.style.display = 'none';
  showToast('Trip loaded.');
}

function attachHandlers(){
  els.btnCreateDays.addEventListener('click', createDaysFromUI);
  els.btnAddPlace.addEventListener('click', addPlace);
  els.btnRemovePlace.addEventListener('click', removeSelected);
  els.btnReset.addEventListener('click', resetAll);
  els.btnSave.addEventListener('click', saveJson);

  els.btnLoad.addEventListener('click', async () => {
    const file = els.fileInput.files && els.fileInput.files[0];
    if(!file){
      showToast('Choose a JSON file first.');
      return;
    }
    await loadJsonFromFile(file);
  });

  els.btnExport.addEventListener('click', exportPrintable);
  els.btnPrint.addEventListener('click', () => {
    if(els.exportArea.style.display === 'none') exportPrintable();
    window.print();
  });

  // convenience: Enter adds place
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      const active = document.activeElement;
      if(active && ['INPUT','SELECT'].includes(active.tagName)){
        // avoid when dialog etc.
        if(active === els.placeDetails || active === els.placeName || active === els.placeCost || active === els.placeTime || active === els.placeDuration){
          e.preventDefault();
          addPlace();
        }
      }
    }
  });
}

attachHandlers();
initDays(Number(els.tripDays.value) || 3);
updateDaysNav();
renderDay();

