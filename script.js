// HORLOGE VFR
function calculateVFREndTime(date, lat = 44.8, lon = -0.5) {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const declination = 0.409 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const hourAngle = Math.acos(-Math.tan(lat * rad) * Math.tan(declination));
  const sunsetUTCMinutes = 720 + ((-lon * 4) + (hourAngle / rad * 4));
  const sunset = new Date(date);
  sunset.setUTCHours(Math.floor(sunsetUTCMinutes / 60));
  sunset.setUTCMinutes(Math.floor(sunsetUTCMinutes % 60));
  return new Date(sunset.getTime() + 30 * 60000);
}

function updateClocks() {
  const now = new Date();
  document.getElementById('zoulouClock').textContent = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} Z`;
  document.getElementById('localClock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const vfrEnd = calculateVFREndTime(now);
  const remainingMin = Math.ceil((vfrEnd - now) / 60000);
  let nightText = `${String(vfrEnd.getHours()).padStart(2, '0')}:${String(vfrEnd.getMinutes()).padStart(2, '0')}`;
  if (remainingMin > 0 && remainingMin <= 180) nightText += ` (-${remainingMin}m)`;
  else if (remainingMin <= 0) nightText += ` (NUIT VFR)`;
  document.getElementById('vfrEndClock').textContent = nightText;
  
  if (!document.getElementById('airResourcesView').classList.contains('hidden')) {
    loadAirResources();
  }
}
setInterval(updateClocks, 1000); updateClocks();

const DEFAULT_ENGINS = ["VSAV", "FPT", "FPTSR", "EPA", "CCGC", "CCFM", "VL", "VLCG", "VLM"];
const DEFAULT_CENTRES = ["Castillon", "Libourne", "Branne", "Créon", "Pellegrue", "Sainte-Foy", "St-Émilion", "Autre"];
const DEFAULT_AIR_TYPES = ["Canadair", "Dash", "HBE", "Dragon", "Puma", "Aero (Guet)"];
const DEFAULT_AIR_CALLSIGNS = ["Pélican", "Milan", "Dragon", "Morane", "Horas", "Aero"];

const STORAGE_KEYS = ['saved_memos', 'saved_resources', 'saved_air_resources', 'custom_engins', 'custom_centres', 'custom_air_types', 'custom_air_callsigns', 'sitac_canvas_data', 'sitac_texts'];

// CONSTANTE DES OBJECTIFS SOAM
const SOAM_OBJECTIFS = {
  "personnes": {
    label: "Liée aux personnes",
    options: [
      "Protéger la population de...",
      "Limiter le nombre de victimes liées à...",
      "Éviter l'aggravation des victimes",
      "Éviter le sur-accident lié à...",
      "Protéger les intervenants de...",
      "Éviter la panique"
    ]
  },
  "incendie": {
    label: "Liée à l'incendie",
    options: [
      "Éviter la propagation au...",
      "Assurer l'extinction du feu",
      "Baisser l'intensité du foyer",
      "Préserver l'outil de production/bat. Admin."
    ]
  },
  "explosion": {
    label: "Liée à l'explosion",
    options: [
      "Éviter l'explosion de...",
      "Éviter la mise à feu"
    ]
  },
  "alimentation": {
    label: "Liée à l'alimentation",
    options: [
      "Pérenniser l'alimentation du dispositif"
    ]
  },
  "pollution": {
    label: "Liée à une pollution",
    options: [
      "Eviter la pollution de...",
      "Limiter la pollution de...",
      "Réduire les effets"
    ]
  },
  "rtn": {
    label: "Liée à du RTN",
    options: [
      "Identifier le produit et ses risques",
      "Limiter la dispersion du produit"
    ]
  }
};

// NAVIGATION PRINCIPALE & SITAC
const mainView = document.getElementById('mainView');
const sitacView = document.getElementById('sitacView');
const urbanMenuView = document.getElementById('urbanMenuView');
const urbanMessageLibreView = document.getElementById('urbanMessageLibreView');
const urbanAmbianceView = document.getElementById('urbanAmbianceView');
const urbanSapView = document.getElementById('urbanSapView');
const urbanFeuView = document.getElementById('urbanFeuView');
const urbanSRView = document.getElementById('urbanSRView');
const urbanGazView = document.getElementById('urbanGazView');
const urbanOpeDivView = document.getElementById('urbanOpeDivView');
const urbanNautView = document.getElementById('urbanNautView');
const urbanRenfortView = document.getElementById('urbanRenfortView');
const urbanVictimsView = document.getElementById('urbanVictimsView');

const forestMenuView = document.getElementById('forestMenuView');
const forestT0View = document.getElementById('forestT0View');
const forestT3View = document.getElementById('forestT3View');
const forestT20View = document.getElementById('forestT20View');
const forestTEteintView = document.getElementById('forestTEteintView');
const soamView = document.getElementById('soamView');
const resourcesView = document.getElementById('resourcesView');
const airResourcesView = document.getElementById('airResourcesView');
const detailView = document.getElementById('detailView');

function openSitac() {
  [mainView, urbanMenuView, urbanMessageLibreView, urbanAmbianceView, urbanSapView, urbanFeuView, urbanSRView, urbanGazView, urbanOpeDivView, urbanNautView, urbanRenfortView, urbanVictimsView, forestMenuView, forestT0View, forestT3View, forestT20View, forestTEteintView, soamView, resourcesView, airResourcesView, detailView].forEach(v => { if(v) v.classList.add('hidden'); });
  document.querySelector('.aero-clock-banner').classList.add('hidden');
  document.querySelector('.data-management-bar').classList.add('hidden');
  document.querySelector('h1').classList.add('hidden');
  sitacView.classList.remove('hidden');
  initSitacCanvas();
}

function closeSitac() {
  sitacView.classList.add('hidden');
  document.querySelector('.aero-clock-banner').classList.remove('hidden');
  document.querySelector('.data-management-bar').classList.remove('hidden');
  document.querySelector('h1').classList.remove('hidden');
  mainView.classList.remove('hidden');
}

document.getElementById('quickSwitchSitacBtn').addEventListener('click', openSitac);
document.getElementById('backToMessagesFromSitac').addEventListener('click', closeSitac);

// EXPORTATION DU RAPPORT COMPLET (MESSAGES + SITAC) EN PDF
document.getElementById('exportPdfReportBtn').addEventListener('click', () => {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  const sitacDataUrl = canvas.toDataURL();

  let textLayersHtml = '';
  document.querySelectorAll('.sitac-text-layer').forEach(layer => {
    const text = layer.querySelector('span').textContent;
    const left = layer.style.left;
    const top = layer.style.top;
    const color = layer.style.color;
    textLayersHtml += `<div style="position:absolute; left:${left}; top:${top}; color:${color}; font-weight:bold; font-size:14px; border:1px solid ${color}; padding:2px 6px; background:rgba(255,255,255,0.8);">${text}</div>`;
  });

  let memosHtml = '';
  if (memos.length === 0) {
    memosHtml = '<p style="color:#64748b; text-align:center;">Aucun message enregistré.</p>';
  } else {
    memos.forEach((memo) => {
      memosHtml += `
        <div style="margin-bottom: 12px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; page-break-inside: avoid;">
          <div style="font-size: 0.8rem; font-weight: bold; color: #475569; margin-bottom: 4px;">
            [${memo.forestTag || 'Note Libre'}] - ${memo.date}
          </div>
          <div style="font-size: 0.95rem; white-space: pre-wrap; color: #0f172a;">${memo.text}</div>
        </div>
      `;
    });
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Rapport Opérationnel - Suivi Ops</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
          h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .sitac-container { position: relative; width: 100%; max-width: 800px; height: 500px; border: 2px solid #94a3b8; margin: 20px auto; background: white; page-break-inside: avoid; }
          .sitac-container img { width: 100%; height: 100%; object-fit: contain; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Rapport Opérationnel &amp; Synthèse des Mémos</h1>
        <p><strong>Généré le :</strong> ${new Date().toLocaleString('fr-FR')}</p>

        <h2>1. SiTac (Situation Tactique)</h2>
        <div class="sitac-container">
          <img src="${sitacDataUrl}" alt="SiTac dessinée" />
          ${textLayersHtml}
        </div>

        <h2 style="page-break-before: always;">2. Historique des Messages Enregistrés</h2>
        <div>
          ${memosHtml}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
});

// CANVAS SITAC & CALQUES TEXTE
const canvas = document.getElementById('sitacCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('sitacCanvasContainer');
let isDrawing = false;
let currentColor = '#000000';
let isEraser = false;

function initSitacCanvas() {
  const rect = canvasContainer.getBoundingClientRect();
  if (canvas.width !== rect.width || canvas.height !== rect.height) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = rect.width; canvas.height = rect.height;
    ctx.drawImage(tempCanvas, 0, 0);
  }
  ctx.lineWidth = isEraser ? 25 : 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
}

window.addEventListener('resize', () => { if (!sitacView.classList.contains('hidden')) initSitacCanvas(); });

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; const pos = getPointerPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); });
canvas.addEventListener('mousemove', (e) => { if (!isDrawing) return; const pos = getPointerPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); });
window.addEventListener('mouseup', () => { isDrawing = false; saveSitacCanvasState(); });

canvas.addEventListener('touchstart', (e) => { isDrawing = true; const pos = getPointerPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => { if (!isDrawing) return; const pos = getPointerPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); e.preventDefault(); });
canvas.addEventListener('touchend', () => { isDrawing = false; saveSitacCanvasState(); });

function saveSitacCanvasState() { localStorage.setItem('sitac_canvas_data', canvas.toDataURL()); }
function loadSitacCanvasState() {
  const data = localStorage.getItem('sitac_canvas_data');
  if (data) { const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0); }; img.src = data; }
}
setTimeout(loadSitacCanvasState, 200);

function initSitacTexts() {
  const saved = JSON.parse(localStorage.getItem('sitac_texts') || '[]');
  if (canvasContainer.querySelectorAll('.sitac-text-layer').length === 0) {
    saved.forEach(item => addSitacTextLayer(item.text, parseInt(item.left) || 40, parseInt(item.top) || 40, item.color || '#000000', false));
  }
}
setTimeout(initSitacTexts, 300);

document.getElementById('addSitacTextBtn').addEventListener('click', () => {
  const txt = prompt("Saisissez le texte à ajouter sur la SiTac :");
  if (txt && txt.trim() !== '') addSitacTextLayer(txt.trim(), 40, 40, isEraser ? '#000000' : currentColor, true);
});

function addSitacTextLayer(text, posX, posY, color, save = true) {
  const layer = document.createElement('div');
  layer.className = 'sitac-text-layer';
  layer.style.left = posX + 'px'; layer.style.top = posY + 'px';
  layer.style.color = color; layer.style.border = `2px solid ${color}`;
  layer.innerHTML = `<span>${text}</span><div class="close-layer" title="Effacer">&times;</div>`;
  
  layer.querySelector('.close-layer').addEventListener('click', (e) => { layer.remove(); saveSitacTexts(); e.stopPropagation(); });

  let isDragging = false, startX, startY;
  function startDrag(clientX, clientY) { isDragging = true; startX = clientX - layer.offsetLeft; startY = clientY - layer.offsetTop; }
  function doDrag(clientX, clientY) { if (!isDragging) return; layer.style.left = (clientX - startX) + 'px'; layer.style.top = (clientY - startY) + 'px'; }
  function endDrag() { if (isDragging) { isDragging = false; saveSitacTexts(); } }

  layer.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.stopPropagation(); });
  window.addEventListener('mousemove', (e) => { doDrag(e.clientX, e.clientY); });
  window.addEventListener('mouseup', endDrag);

  layer.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.stopPropagation(); });
  window.addEventListener('touchmove', (e) => { if (!isDragging) return; doDrag(e.touches[0].clientX, e.touches[0].clientY); });
  window.addEventListener('touchend', endDrag);

  canvasContainer.appendChild(layer);
  if (save) saveSitacTexts();
}

function saveSitacTexts() {
  const layers = [];
  document.querySelectorAll('.sitac-text-layer').forEach(l => {
    layers.push({ text: l.querySelector('span').textContent, left: l.style.left, top: l.style.top, color: l.style.color });
  });
  localStorage.setItem('sitac_texts', JSON.stringify(layers));
}

document.querySelectorAll('.color-circle').forEach(circle => {
  circle.addEventListener('click', (e) => {
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    const col = e.target.getAttribute('data-color');
    if (col === 'eraser') { isEraser = true; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 25; }
    else { isEraser = false; currentColor = col; ctx.strokeStyle = currentColor; ctx.lineWidth = 3; }
  });
});

document.getElementById('clearSitacBtn').addEventListener('click', () => {
  if (confirm("Effacer le dessin de la SiTac ?")) { ctx.clearRect(0, 0, canvas.width, canvas.height); localStorage.removeItem('sitac_canvas_data'); }
});

// IMPORT / EXPORT / RESET
document.getElementById('exportDataBtn').addEventListener('click', () => {
  const dataToExport = {};
  STORAGE_KEYS.forEach(key => dataToExport[key] = JSON.parse(localStorage.getItem(key) || '[]'));
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `suivi_ops_${new Date().toISOString().slice(0, 10)}.json`; a.click();
});

document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFileInput').click());
document.getElementById('importFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      STORAGE_KEYS.forEach(key => { if (imported[key]) localStorage.setItem(key, JSON.stringify(imported[key])); });
      loadMemos(); loadResources(); loadAirResources(); updateTagsDisplay(); updateAirTagsDisplay();
      alert("Données importées avec succès !");
    } catch (err) { alert("Erreur lors de la lecture du fichier."); }
  };
  reader.readAsText(file);
});

document.getElementById('resetAllDataBtn').addEventListener('click', () => {
  if (confirm("⚠️ Réinitialiser l'ensemble des données, messages et dessins ?")) {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelectorAll('.sitac-text-layer').forEach(l => l.remove());
    loadMemos(); loadResources(); loadAirResources(); updateTagsDisplay(); updateAirTagsDisplay();
    alert("Réinitialisation effectuée !");
  }
});

// NAVIGATION MENUS
document.getElementById('openUrbanMenuBtn').addEventListener('click', () => { mainView.classList.add('hidden'); urbanMenuView.classList.remove('hidden'); });
document.getElementById('openForestMenuBtn').addEventListener('click', () => { mainView.classList.add('hidden'); forestMenuView.classList.remove('hidden'); });
document.getElementById('openSoamMenuBtn').addEventListener('click', () => { mainView.classList.add('hidden'); soamView.classList.remove('hidden'); if(document.getElementById('objectivesContainer').children.length===0) addObjectiveCard(); });
document.getElementById('openResourcesBtn').addEventListener('click', () => { mainView.classList.add('hidden'); resourcesView.classList.remove('hidden'); updateSelectOptions(); updateTagsDisplay(); loadResources(); });
document.getElementById('openAirResourcesBtn').addEventListener('click', () => { mainView.classList.add('hidden'); airResourcesView.classList.remove('hidden'); updateAirSelectOptions(); updateAirTagsDisplay(); loadAirResources(); });

document.querySelectorAll('.backToMainBtn').forEach(btn => btn.addEventListener('click', () => {
  const saveVicBtn = document.getElementById('saveUrbanVictimBtn');
  if(saveVicBtn) {
    saveVicBtn.removeAttribute('data-editing-index');
    saveVicBtn.textContent = "💾 Valider Bilan Victimes";
  }
  [urbanMenuView, urbanSapView, urbanFeuView, urbanSRView, urbanGazView, urbanOpeDivView, urbanNautView, urbanRenfortView, urbanVictimsView, forestMenuView, forestT0View, forestT3View, forestT20View, forestTEteintView, soamView, resourcesView, airResourcesView, detailView].forEach(c => { if(c) c.classList.add('hidden'); });
  if(mainView) mainView.classList.remove('hidden');
}));

document.querySelectorAll('.backToForestMenuBtn').forEach(btn => btn.addEventListener('click', () => {
  [forestT0View, forestT3View, forestT20View, forestTEteintView].forEach(c => { if(c) c.classList.add('hidden'); });
  if(forestMenuView) forestMenuView.classList.remove('hidden');
}));

document.querySelectorAll('.backToUrbanMenuBtn').forEach(btn => btn.addEventListener('click', () => {
  const saveVicBtn = document.getElementById('saveUrbanVictimBtn');
  if(saveVicBtn) {
    saveVicBtn.removeAttribute('data-editing-index');
    saveVicBtn.textContent = "💾 Valider Bilan Victimes";
  }
  [urbanSapView, urbanFeuView, urbanSRView, urbanGazView, urbanOpeDivView, urbanNautView, urbanRenfortView, urbanVictimsView].forEach(c => { if(c) c.classList.add('hidden'); });
  if(urbanMenuView) urbanMenuView.classList.remove('hidden');
}));

// NAVIGATION SOUS-MENUS URBAINS
document.getElementById('navSapBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanSapView.classList.remove('hidden'); });
document.getElementById('navFeuUrbainBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanFeuView.classList.remove('hidden'); });
document.getElementById('navSecoursRoutierBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanSRView.classList.remove('hidden'); });
document.getElementById('navFuiteGazBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanGazView.classList.remove('hidden'); });
document.getElementById('navOpeDivBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanOpeDivView.classList.remove('hidden'); });
document.getElementById('navOpeNautBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanNautView.classList.remove('hidden'); });
document.getElementById('navDemandeRenfortBtn').addEventListener('click', () => { urbanMenuView.classList.add('hidden'); urbanRenfortView.classList.remove('hidden'); });
document.getElementById('navTableauVictimesBtn').addEventListener('click', () => { 
  const saveVicBtn = document.getElementById('saveUrbanVictimBtn');
  if(saveVicBtn) {
    saveVicBtn.removeAttribute('data-editing-index');
    saveVicBtn.textContent = "💾 Valider Bilan Victimes";
  }
  document.getElementById('sumVicImpliques').value = '0';
  document.getElementById('sumVicUA').value = '0';
  document.getElementById('sumVicUR').value = '0';
  document.getElementById('sumVicDCD').value = '0';
  document.getElementById('sumNonVicSains').value = '0';
  document.getElementById('urbPrvEmplacement').value = '';
  updateVictimsSynthesisTitle();
  document.getElementById('victimsTableBody').innerHTML = '';
  urbanMenuView.classList.add('hidden'); urbanVictimsView.classList.remove('hidden'); 
  addVictimRow(); 
});

// NAVIGATION SOUS-MENUS FORÊT
document.getElementById('navT0Btn').addEventListener('click', () => { forestMenuView.classList.add('hidden'); forestT0View.classList.remove('hidden'); });
document.getElementById('navT3Btn').addEventListener('click', () => { forestMenuView.classList.add('hidden'); forestT3View.classList.remove('hidden'); });
document.getElementById('navT20Btn').addEventListener('click', () => { forestMenuView.classList.add('hidden'); forestT20View.classList.remove('hidden'); });
document.getElementById('navTEteintBtn').addEventListener('click', () => { forestMenuView.classList.add('hidden'); forestTEteintView.classList.remove('hidden'); });

// GESTION DES MESSAGES ET SAUVEGARDES
function saveMemoToStorage(text, tag, forceUnnumbered = false, isUrban = false, badgeColorStyle = '') {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  memos.unshift({ text, date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), isUnnumbered: forceUnnumbered, isUrban: isUrban, forestTag: tag, badgeColorStyle: badgeColorStyle });
  localStorage.setItem('saved_memos', JSON.stringify(memos));
  loadMemos();
}

function saveMemoToStorageWithRawData(text, tag, forceUnnumbered, isUrban, badgeColorStyle, rawVictimData) {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  memos.unshift({ 
    text, 
    date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), 
    isUnnumbered: forceUnnumbered, 
    isUrban: isUrban, 
    forestTag: tag, 
    badgeColorStyle: badgeColorStyle,
    rawVictimData: rawVictimData 
  });
  localStorage.setItem('saved_memos', JSON.stringify(memos));
  loadMemos();
}

function toggleMemoNumbering(index, isChecked) {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  memos[index].isUnnumbered = !isChecked;
  localStorage.setItem('saved_memos', JSON.stringify(memos));
  loadMemos();
}

function loadMemos() {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  const list = document.getElementById('memosList');
  if(!list) return;
  list.innerHTML = memos.length === 0 ? '<p style="color:#94a3b8; text-align:center;">Aucun message enregistré.</p>' : '';
  
  let currentSeq = 0;
  const memoNumbersMap = {};
  for (let i = memos.length - 1; i >= 0; i--) {
    if (!memos[i].isUnnumbered) { currentSeq++; memoNumbersMap[i] = currentSeq; }
  }

  memos.forEach((memo, index) => {
    const item = document.createElement('div');
    item.className = 'memo-item';
    let bClass = memo.badgeColorStyle || 'memo-badge-off';
    if (!memo.badgeColorStyle) {
      if(memo.isUrban) bClass = 'memo-badge-urban';
      else if(memo.forestTag === 'SOAM') bClass = 'memo-badge-soam';
      else if(memo.forestTag && memo.forestTag !== 'Note Libre') bClass = 'memo-badge-forest';
    }
    const numBadgeHtml = (!memo.isUnnumbered && memoNumbersMap[index]) ? `<span class="memo-badge-num">N°${memoNumbersMap[index]}</span>` : '';
    const isVictimMemo = memo.forestTag === 'Bilan Victimes';
    const editBtnHtml = isVictimMemo ? `<button class="btn-secondary" style="padding:2px 6px; font-size:0.75rem; margin-right:4px;" onclick="event.stopPropagation(); editVictimMemo(${index})">✏️ Modifier</button>` : '';

    item.innerHTML = `
      <div class="memo-content" onclick="openMemo(${index})">
        <div class="memo-header">
          ${numBadgeHtml}
          <span class="${bClass}">${memo.forestTag||'Note Libre'}</span>
          <span class="memo-date">${memo.date}</span>
        </div>
        <div class="memo-preview">${memo.text}</div>
      </div>
      <div class="memo-actions">
        ${editBtnHtml}
        <label class="memo-toggle-num" title="Numéroter" onclick="event.stopPropagation()">
          <input type="checkbox" ${!memo.isUnnumbered ? 'checked' : ''} onchange="toggleMemoNumbering(${index}, this.checked)"> 🔢 N°
        </label>
        <button class="btn-danger" onclick="event.stopPropagation(); deleteMemo(${index})">&times;</button>
      </div>
    `;
    list.appendChild(item);
  });
}

window.editVictimMemo = function(index) {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  const memo = memos[index];
  if (!memo || !memo.rawVictimData) return alert("Données brutes du tableau introuvables.");

  const data = memo.rawVictimData;
  document.getElementById('sumVicImpliques').value = data.imp || '0';
  document.getElementById('sumVicUA').value = data.ua || '0';
  document.getElementById('sumVicUR').value = data.ur || '0';
  document.getElementById('sumVicDCD').value = data.dcd || '0';
  document.getElementById('sumNonVicSains').value = data.sains || '0';
  document.getElementById('urbPrvEmplacement').value = data.prv || '';
  updateVictimsSynthesisTitle();

  const tbody = document.getElementById('victimsTableBody');
  tbody.innerHTML = '';
  if (data.rows && data.rows.length > 0) {
    data.rows.forEach(row => addVictimRow(row));
  } else {
    addVictimRow();
  }

  const saveVicBtn = document.getElementById('saveUrbanVictimBtn');
  if(saveVicBtn) {
    saveVicBtn.setAttribute('data-editing-index', index);
    saveVicBtn.textContent = "💾 Mettre à jour le Bilan Victimes";
  }

  [mainView, urbanMenuView, urbanSapView, urbanFeuView, urbanSRView, urbanGazView, urbanOpeDivView, urbanNautView, urbanRenfortView, urbanVictimsView, forestMenuView, forestT0View, forestT3View, forestT20View, forestTEteintView, soamView, resourcesView, airResourcesView, detailView].forEach(v => { if(v) v.classList.add('hidden'); });
  if(urbanVictimsView) urbanVictimsView.classList.remove('hidden');
};

function deleteMemo(index) {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  memos.splice(index, 1);
  localStorage.setItem('saved_memos', JSON.stringify(memos));
  loadMemos();
}

function openMemo(index) {
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');
  document.getElementById('detailContent').textContent = memos[index].text;
  document.getElementById('detailBadge').textContent = memos[index].forestTag || 'Note Libre';
  document.getElementById('detailDate').textContent = memos[index].date;
  mainView.classList.add('hidden');
  detailView.classList.remove('hidden');
}

document.getElementById('backBtn').addEventListener('click', () => { detailView.classList.add('hidden'); mainView.classList.remove('hidden'); });

document.getElementById('saveBtn').addEventListener('click', () => {
  const txt = document.getElementById('transcript').value.trim();
  const customTag = document.getElementById('freeMessageTagInput').value.trim() || 'Note Libre';
  const isNumbered = document.getElementById('noteNumCheck').checked;
  if (txt) { 
    saveMemoToStorage(txt, customTag, !isNumbered); 
    document.getElementById('transcript').value = ''; 
    document.getElementById('freeMessageTagInput').value = '';
  } else { alert("Veuillez saisir un texte."); }
});

// VALIDATION SECOURS À PERSONNE (SAP)
document.getElementById('saveUrbanSapBtn').addEventListener('click', () => {
  const nbrPersons = document.getElementById('sapNbrPersons').value.trim();
  const codeVictim = document.getElementById('sapCodeVictim').value.trim();
  const manyVicNum = document.getElementById('sapManyVictimsNum').value.trim();
  const illnessTxt = document.getElementById('sapIllnessTxt').value.trim();

  const psych = document.getElementById('sapPsychCheck').checked;
  const ebriete = document.getElementById('sapEbrietyCheck').checked;
  const street = document.getElementById('sapStreetCheck').checked;
  const noVicNoAct = document.getElementById('sapNoVicNoActCheck').checked;
  const falseAlarm = document.getElementById('sapFalseAlarmCheck').checked;
  const otherISee = document.getElementById('sapOtherISee').value.trim();

  let actionsList = [];
  document.querySelectorAll('.sapActionCheck:checked').forEach(cb => actionsList.push(cb.value));

  const evacSamu = document.getElementById('sapEvacSamuTxt').value.trim();
  const reorientFrom = document.getElementById('sapReorientFrom').value.trim();
  const reorientTo = document.getElementById('sapReorientTo').value.trim();
  const evacOutSect = document.getElementById('sapEvacOutSectTxt').value.trim();
  const dzTransport = document.getElementById('sapDzTransportTxt').value.trim();
  const reasonTxt = document.getElementById('sapReasonTxt').value.trim();
  const otherIDo = document.getElementById('sapOtherIDo').value.trim();

  let seeDetails = [];
  if (nbrPersons) seeDetails.push(`${nbrPersons} personne(s)`);
  if (codeVictim) seeDetails.push(`Code: ${codeVictim}`);
  if (manyVicNum) seeDetails.push(`Nombreuses victimes (${manyVicNum})`);
  if (illnessTxt) seeDetails.push(`Nature: ${illnessTxt}`);
  if (psych) seeDetails.push("Soins psy sans consentement (représentant de l'État)");
  if (ebriete) seeDetails.push("Signes d'ébriété");
  if (street) seeDetails.push("Personne à la rue (indigente)");
  if (noVicNoAct) seeDetails.push("Opération sans victime : aucune intervention");
  if (falseAlarm) seeDetails.push("Opération sans victime : fausse alerte");
  if (otherISee) seeDetails.push(otherISee);

  let doDetails = [];
  if (actionsList.length > 0) doDetails.push(`Actions: ${actionsList.join(', ')}`);
  if (evacSamu) doDetails.push(`Évacuation régulation SAMU: ${evacSamu}`);
  if (reorientFrom && reorientTo) doDetails.push(`Réorientation hôpital de ${reorientFrom} vers ${reorientTo}`);
  if (evacOutSect) doDetails.push(`Évacuation hors secteur/département: ${evacOutSect}`);
  if (dzTransport) doDetails.push(`Transport DZ: ${dzTransport}`);
  if (reasonTxt) doDetails.push(`Raison: ${reasonTxt}`);
  if (otherIDo) doDetails.push(`Autres: ${otherIDo}`);

  const text = `Secours À Personne (SAP) :\n` +
    `- Je vois : ${seeDetails.join(' | ') || 'Non précisé'}\n` +
    `- Je fais : ${doDetails.join(' | ') || 'Aucune action spécifique'}`;

  saveMemoToStorage(text, 'SAP', !document.getElementById('sapNumCheck').checked, true, 'memo-badge-urban');
  urbanSapView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// GESTION DE L'AFFICHAGE DES SOUS-MENUS ERP / INDUSTRIE / HABITATION (FEU URBAIN)
document.querySelectorAll('input[name="urbUsage"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const val = e.target.value;
    const subERP = document.getElementById('subSubMenuERP');
    const subInd = document.getElementById('subSubMenuIndustrie');
    const subHab = document.getElementById('subSubMenuHabitation');
    if (subERP) subERP.style.display = (val === 'ERP') ? 'block' : 'none';
    if (subInd) subInd.style.display = (val === 'Industrie') ? 'block' : 'none';
    if (subHab) subHab.style.display = (val === 'Habitation') ? 'block' : 'none';
  });
});

document.querySelectorAll('input[name="habFamily"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const sub3Div = document.getElementById('subSubMenuFamille3');
    if (sub3Div) {
      sub3Div.style.display = (e.target.value.includes('3e famille')) ? 'flex' : 'none';
    }
  });
});

document.querySelectorAll('.indICPECheck').forEach(chk => {
  chk.addEventListener('change', () => {
    const container = document.getElementById('dynamicNomenclatureInputs');
    if (!container) return;
    container.innerHTML = '';
    
    document.querySelectorAll('.indICPECheck:checked').forEach(c => {
      const val = c.value;
      if (val.includes('xxx')) {
        const prefix = val.charAt(0);
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'indNomInput';
        input.placeholder = `Préciser ${prefix}___ (ex: ${prefix}420)`;
        input.style.flex = '1';
        input.style.padding = '4px';
        container.appendChild(input);
      } else if (val === 'Autre') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'indNomInput';
        input.placeholder = 'Préciser autre industrie...';
        input.style.flex = '1';
        input.style.padding = '4px';
        container.appendChild(input);
      }
    });
  });
});

// VALIDATION FEU URBAIN EXHAUSTIF AVEC SOUS-MENUS ERP, INDUSTRIE ET HABITATION
document.getElementById('saveUrbanFeuBtn').addEventListener('click', () => {
  const rPlus = document.getElementById('urbRPlus').value.trim();
  const auR = document.getElementById('urbAuR').value.trim();
  const simpleRdc = document.getElementById('urbRezDeChaussee').checked;
  const usage = document.querySelector('input[name="urbUsage"]:checked')?.value || 'Habitation';
  
  let usageDetails = usage;
  if (usage === 'ERP') {
    let types = [];
    document.querySelectorAll('.erpTypeCheck:checked').forEach(cb => types.push(cb.value));
    let cats = [];
    document.querySelectorAll('.erpCatCheck:checked').forEach(cb => cats.push(cb.value));
    usageDetails += ` (Types ERP : ${types.join(', ') || 'Non précisé'} | Catégories : ${cats.join(', ') || 'Non précisée'})`;
  } else if (usage === 'Industrie') {
    let indOpts = [];
    document.querySelectorAll('.indICPECheck:checked').forEach(cb => indOpts.push(cb.value));
    let customInputs = [];
    document.querySelectorAll('.indNomInput').forEach(inp => { if(inp.value.trim()) customInputs.push(inp.value.trim()); });
    
    usageDetails += ` (Options : ${indOpts.join(', ') || 'Aucune'}${customInputs.length > 0 ? ' - Précisions: '+customInputs.join(', ') : ''})`;
  } else if (usage === 'Habitation') {
    const selectedFam = document.querySelector('input[name="habFamily"]:checked')?.value || 'Famille non précisée';
    let habDetails = selectedFam;
    if (selectedFam.includes('3e famille')) {
      let sub3s = [];
      document.querySelectorAll('.hab3SubCheck:checked').forEach(cb => sub3s.push(cb.value));
      if (sub3s.length > 0) {
        habDetails += ` [Sous-catégorie: ${sub3s.join(', ')}]`;
      }
    }
    usageDetails += ` (${habDetails})`;
  }

  const attenant = document.getElementById('urbAttenant').value.trim();
  const surfDetruite = document.getElementById('urbSurfDetruite').value.trim();
  const surfSol = document.getElementById('urbSurfSol').value.trim();
  const surfFumees = document.getElementById('urbSurfFumees').value.trim();
  
  let risques = [];
  document.querySelectorAll('.urbRisqueCheck:checked').forEach(cb => risques.push(cb.value));

  const sauvetage = document.getElementById('urbSauvetageCheck').checked;
  const miseSecu = document.getElementById('urbMiseSecuCheck').checked;
  const coupureFluides = document.getElementById('urbCoupureFluides').checked;
  const hbco = document.getElementById('urbHBCOCheck').checked;
  const extinction = document.getElementById('urbExtinctionTxt').value.trim();
  const deblai = document.getElementById('urbDeblaiTxt').value.trim();

  const propag = document.getElementById('urbPropagTxt').value.trim();
  const interruption = document.getElementById('urbInterruptionTxt').value.trim();
  const relogement = document.getElementById('urbRelogementTxt').value.trim();

  let localizationDesc = simpleRdc ? 'Simple RdC' : (rPlus || auR ? `Bâtiment R+${rPlus || '?'} au R${auR || '?'}` : 'Non précisé');

  let seeDetails = [`Localisation : ${localizationDesc}`, `Usage : ${usageDetails}`];
  if (attenant) seeDetails.push(`Attenant à : ${attenant}`);
  if (surfDetruite || surfSol) seeDetails.push(`Surfaces - Détruite: ${surfDetruite || '-'} m², Sol: ${surfSol || '-'} m²`);
  if (surfFumees) seeDetails.push(`Impact fumées : ${surfFumees} m²`);
  if (risques.length > 0) seeDetails.push(`Risques particuliers : ${risques.join(', ')}`);

  let actionsList = [];
  if (sauvetage) actionsList.push('Sauvetage');
  if (miseSecu) actionsList.push('Mise en sécurité');
  if (coupureFluides) actionsList.push('Coupure fluides');
  if (hbco) actionsList.push('Mesure HBCO');
  if (extinction) actionsList.push(`Extinction: ${extinction}`);
  if (deblai) actionsList.push(`Déblai: ${deblai}`);

  let prevList = [];
  if (propag) prevList.push(`Propagation/effondrement: ${propag}`);
  if (interruption) prevList.push(`Interruption d'activité: ${interruption}`);
  if (relogement) prevList.push(`Relogement: ${relogement}`);

  const text = `Feu Urbain :\n- Je vois : ${seeDetails.join(' | ')}\n- Je fais : ${actionsList.join(' | ') || 'Aucune'}\n- Je prévois : ${prevList.join(' | ') || 'Aucune'}`;
  
  saveMemoToStorage(text, 'Feu Urbain', !document.getElementById('urbFeuNumCheck').checked, true, 'memo-badge-urban');
  urbanFeuView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// VALIDATION SECOURS ROUTIERS (SR)
document.getElementById('saveUrbanSRBtn').addEventListener('click', () => {
  const typesVehicles = [
    { name: 'Piétons', nbr: document.getElementById('srNbrPietons').value.trim(), prec: document.getElementById('srPrecPietons').value.trim() },
    { name: '2 roues', nbr: document.getElementById('srNbr2Roues').value.trim(), prec: document.getElementById('srPrec2Roues').value.trim() },
    { name: 'VL', nbr: document.getElementById('srNbrVL').value.trim(), prec: document.getElementById('srPrecVL').value.trim() },
    { name: 'PL', nbr: document.getElementById('srNbrPL').value.trim(), prec: document.getElementById('srPrecPL').value.trim() },
    { name: 'TRAM', nbr: document.getElementById('srNbrTram').value.trim(), prec: document.getElementById('srPrecTram').value.trim() },
    { name: 'Train', nbr: document.getElementById('srNbrTrain').value.trim(), prec: document.getElementById('srPrecTrain').value.trim() },
    { name: 'Bus', nbr: document.getElementById('srNbrBus').value.trim(), prec: document.getElementById('srPrecBus').value.trim() }
  ];

  let implicDetails = [];
  typesVehicles.forEach(v => {
    const count = parseInt(v.nbr) || 0;
    if (count > 0 || v.prec) {
      implicDetails.push(`${count} ${v.name}${v.prec ? ' ('+v.prec+')' : ''}`);
    }
  });

  const danger = document.getElementById('srCodeDanger').value.trim();
  const matiere = document.getElementById('srCodeMatiere').value.trim();
  const fuiteCheck = document.getElementById('srFuiteMatiereCheck').checked;
  const fuiteTxt = document.getElementById('srFuiteTxt').value.trim();

  const circStatus = document.querySelector('input[name="srCircStatus"]:checked')?.value || 'Non précisé';
  const circSens = document.getElementById('srCircSens').value.trim();
  const circVoies = document.getElementById('srCircVoies').value.trim();

  let actionsList = [];
  document.querySelectorAll('.srActionCheck:checked').forEach(cb => actionsList.push(cb.value));

  const jonctionSmur = document.getElementById('srJonctionSmurTxt').value.trim();
  const pointEngagement = document.getElementById('srPointEngagementTxt').value.trim();

  let seeList = [];
  if (implicDetails.length > 0) seeList.push(`Implication : ${implicDetails.join(', ')}`);
  else seeList.push("Implication : Aucun véhicule chiffré");

  if (danger || matiere) seeList.push(`Matières dangereuses - Code danger: ${danger || '-'}, Code matière: ${matiere || '-'}`);
  if (fuiteCheck) seeList.push(`Fuite de matière (${fuiteTxt || 'précision non saisie'})`);
  
  let circDesc = `Circulation : ${circStatus}`;
  if (circSens) circDesc += ` dans le sens ${circSens}`;
  if (circVoies) circDesc += ` sur ${circVoies}`;
  seeList.push(circDesc);

  let doList = [];
  if (actionsList.length > 0) doList.push(`Actions : ${actionsList.join(', ')}`);
  if (jonctionSmur) doList.push(`Jonction SMUR/Hélico : ${jonctionSmur}`);
  if (pointEngagement) doList.push(`Point d'engagement renforts : ${pointEngagement}`);

  const text = `Secours Routiers (SR) :\n` +
    `- Je vois : ${seeList.join(' | ')}\n` +
    `- Je fais : ${doList.join(' | ') || 'Aucune action spécifique'}`;

  saveMemoToStorage(text, 'Secours Routiers', !document.getElementById('srNumCheck').checked, true, 'memo-badge-urban');
  urbanSRView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// VALIDATION FUITE DE GAZ
document.getElementById('saveUrbanGazBtn').addEventListener('click', () => {
  const vanne = document.querySelector('input[name="gazVanne"]:checked')?.value || 'Non précisé';
  const emplacement = document.querySelector('input[name="gazEmplacement"]:checked')?.value || 'Non précisé';
  const origine = document.getElementById('gazOrigineSelect').value || 'Non précisée';
  const pression = document.getElementById('gazPressionSelect').value || 'Non précisée';
  const diam = document.getElementById('gazDiametre').value.trim();
  const abonnes = document.getElementById('gazAbonnes').value.trim();

  const batTypes = ['Maisons', 'Immeubles', 'ERP / Commerces'];
  let batSummaries = [];
  batTypes.forEach((type, idx) => {
    const nbr = document.getElementById(`gazBatNbr_${idx}`).value.trim();
    const adr = document.getElementById(`gazBatAdr_${idx}`).value.trim();
    const evac = document.getElementById(`gazBatEvac_${idx}`).value.trim();
    const conf = document.getElementById(`gazBatConf_${idx}`).value.trim();
    if (nbr || adr || evac || conf) {
      batSummaries.push(`${type} -> Nbr: ${nbr||'0'}, Adr: ${adr||'-'}, Évac: ${evac||'0'}, Conf: ${conf||'0'}`);
    }
  });

  const perimetre = document.querySelector('input[name="gazPerimetre"]:checked')?.value || 'Aucun';
  const exp10m = document.getElementById('gazExp10m').value.trim();
  const expEaux = document.getElementById('gazExpEaux').value.trim();
  const expAssain = document.getElementById('gazExpAssain').value.trim();
  const expCoffres = document.getElementById('gazExpCoffres').value.trim();
  const expNulles = document.getElementById('gazExpNullesCheck').checked;

  let actionsList = [];
  document.querySelectorAll('.gazActionCheck:checked').forEach(cb => actionsList.push(cb.value));
  const fermetureCompteur = document.getElementById('gazFermetureCompteurTxt').value.trim();

  const prevEvacConf = document.getElementById('gazPrevEvacConfTxt').value.trim();
  const prevLongueDuree = document.getElementById('gazPrevLongueDureeCheck').checked;
  const prevTempsPurge = document.getElementById('gazPrevTempsPurgeTxt').value.trim();
  const prevAutre = document.getElementById('gazPrevAutreTxt').value.trim();

  let seeList = [
    `Vanne : ${vanne}`,
    `Emplacement : ${emplacement}`,
    `Origine : ${origine}`,
    `Pression : ${pression}`
  ];
  if (diam) seeList.push(`Diamètre : ${diam} mm`);
  if (abonnes) seeList.push(`Abonnés : ${abonnes}`);

  let doList = [`Périmètre : ${perimetre}`];
  let expList = [];
  if (exp10m) expList.push(`à 10m: ${exp10m}`);
  if (expEaux) expList.push(`eaux pluviales: ${expEaux}`);
  if (expAssain) expList.push(`assainissement: ${expAssain}`);
  if (expCoffres) expList.push(`coffres/caves: ${expCoffres}`);
  if (expNulles) expList.push(`nulles/non significatives`);
  
  if (expList.length > 0) doList.push(`Explosimétrie (% LIE) -> ${expList.join(', ')}`);
  if (actionsList.length > 0) doList.push(`Actions : ${actionsList.join(', ')}`);
  if (fermetureCompteur) doList.push(`Fermeture compteur : ${fermetureCompteur}`);

  let prevList = [];
  if (prevEvacConf) prevList.push(prevEvacConf);
  if (prevLongueDuree) prevList.push("Opération de longue durée");
  if (prevTempsPurge) prevList.push(`Temps de coupure/purge estimé : ${prevTempsPurge}`);
  if (prevAutre) prevList.push(prevAutre);

  const text = `Fuite de Gaz :\n` +
    `- Je vois : ${seeList.join(' | ')}\n` +
    (batSummaries.length > 0 ? `- Bâtiments & Personnes : \n  * ${batSummaries.join('\n  * ')}\n` : '') +
    `- Je fais : ${doList.join(' | ')}\n` +
    `- Je prévois : ${prevList.join(' | ') || 'Aucune'}`;

  saveMemoToStorage(text, 'Fuite de Gaz', !document.getElementById('gazNumCheck').checked, true, 'memo-badge-urban');
  urbanGazView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// VALIDATION OPÉRATIONS DIVERSES
document.getElementById('saveUrbanOpeDivBtn').addEventListener('click', () => {
  const mauvaisFctCheck = document.getElementById('divMauvaisFctCheck').checked;
  const mauvaisFctTxt = document.getElementById('divMauvaisFctTxt').value.trim();
  
  const courtCircCheck = document.getElementById('divCourtCircCheck').checked;
  const courtCircTxt = document.getElementById('divCourtCircTxt').value.trim();

  const cableCheck = document.getElementById('divCableCheck').checked;
  const objetMenacantCheck = document.getElementById('divObjetMenacantCheck').checked;
  const objetMenacantSurVP = document.getElementById('divMenacantVP').checked;
  const objetMenacantSurBat = document.getElementById('divMenacantBat').checked;
  const objetRisqueTxt = document.getElementById('divObjetRisqueTxt').value.trim();

  let animalDetails = [];
  if (document.getElementById('divAnimalBlesse').checked) animalDetails.push('Blessé');
  if (document.getElementById('divAnimalCoince').checked) animalDetails.push('Coincé');
  if (document.getElementById('divAnimalPerche').checked) animalDetails.push('Perché');
  if (document.getElementById('divAnimalDangereux').checked) animalDetails.push('Dangereux/Nuisible');
  const animalTypeTxt = document.getElementById('divAnimalTypeTxt').value.trim();

  const fuiteOu = document.getElementById('divFuiteOu').value.trim();
  const fuitePourquoi = document.getElementById('divFuitePourquoi').value.trim();
  const fuiteEntraine = document.getElementById('divFuiteEntraine').value.trim();
  const fuiteSurfaces = document.getElementById('divFuiteSurfaces').value.trim();

  const prpaCirc = document.getElementById('divPrpaCirc').value.trim();
  const prpaCode = document.getElementById('divPrpaCode').value.trim();
  const observations = document.getElementById('divObservations').value.trim();

  let actionsList = [];
  document.querySelectorAll('.divActionCheck:checked').forEach(cb => actionsList.push(cb.value));

  const miseSecuTxt = document.getElementById('divMiseSecuTxt').value.trim();
  const etaiementTxt = document.getElementById('divEtaiementTxt').value.trim();
  const bachageTxt = document.getElementById('divBachageTxt').value.trim();
  const tronconnageTxt = document.getElementById('divTronconnageTxt').value.trim();
  const animalNeutralisationTxt = document.getElementById('divAnimalNeutralisationTxt').value.trim();

  const porteFermee = document.getElementById('divPorteFermeeCheck').checked;
  const porteNonRefermee = document.getElementById('divPorteNonRefermeeCheck').checked;
  const ascCoupure = document.getElementById('divAscCoupureCheck').checked;
  const ascPortes = document.getElementById('divAscPortesCheck').checked;

  const prevLongueDuree = document.getElementById('divPrevLongueDureeCheck').checked;
  const prevImpactResident = document.getElementById('divPrevImpactResident').value.trim();
  const prevInterruption = document.getElementById('divPrevInterruption').value.trim();
  const prevRelogement = document.getElementById('divPrevRelogement').value.trim();
  const prevEffondrement = document.getElementById('divPrevEffondrement').value.trim();
  const prevAutre = document.getElementById('divPrevAutre').value.trim();

  let seeList = [];
  if (mauvaisFctCheck) seeList.push(`Mauvais fonctionnement : ${mauvaisFctTxt || 'précision non saisie'}`);
  if (courtCircCheck) seeList.push(`Court-circuit : ${courtCircTxt || 'précision non saisie'}`);
  if (cableCheck || objetMenacantCheck) {
    let chuteInfo = [];
    if (cableCheck) chuteInfo.push('Câble (HTA/HTB/MT/BT/téléphonique)');
    if (objetMenacantCheck) chuteInfo.push(`Objet menaçant (sur ${[objetMenacantSurVP?'VP':'', objetMenacantSurBat?'Bâtiment':''].filter(Boolean).join('/')})`);
    if (objetRisqueTxt) chuteInfo.push(`Précision: ${objetRisqueTxt}`);
    seeList.push(`Chute d'objets -> ${chuteInfo.join(', ')}`);
  }
  if (animalTypeTxt || animalDetails.length > 0) {
    seeList.push(`Animal : ${animalTypeTxt || 'Non précisé'} [${animalDetails.join(', ') || 'statut non précisé'}]`);
  }
  if (fuiteOu || fuitePourquoi) {
    seeList.push(`Fuite d'eau/inondation (Où: ${fuiteOu||'-'}, Pourquoi: ${fuitePourquoi||'-'}, Entraîné: ${fuiteEntraine||'-'}, Surfaces: ${fuiteSurfaces||'-'})`);
  }
  if (prpaCirc || prpaCode) {
    seeList.push(`Relevage PRPA (Circonstances: ${prpaCirc||'-'}, Code: ${prpaCode||'-'})`);
  }
  if (observations) seeList.push(`Observations : ${observations}`);

  let doList = [];
  if (actionsList.length > 0) doList.push(`Actions : ${actionsList.join(', ')}`);
  if (miseSecuTxt) doList.push(`Mise en sécurité/Sauvetage : ${miseSecuTxt}`);
  if (etaiementTxt) doList.push(`Étaiement : ${etaiementTxt}`);
  if (bachageTxt) doList.push(`Bâchage toiture : ${bachageTxt} m²`);
  if (tronconnageTxt) doList.push(`Tronçonnage : ${tronconnageTxt}`);
  if (animalNeutralisationTxt) doList.push(`Gestion animal : ${animalNeutralisationTxt}`);
  if (porteFermee || porteNonRefermee) {
    let porteInfo = [];
    if (porteFermee) porteInfo.push('Fermeture des accès réalisée');
    if (porteNonRefermee) porteInfo.push('Locaux non refermés, garde des biens non assurée');
    doList.push(`Ouverture de porte -> ${porteInfo.join(' | ')}`);
  }
  if (ascCoupure || ascPortes) {
    let ascInfo = [];
    if (ascCoupure) ascInfo.push('Coupure force motrice');
    if (ascPortes) ascInfo.push('Vérification portes palières');
    doList.push(`Ascenseur -> ${ascInfo.join(', ')}`);
  }

  let prevList = [];
  if (prevLongueDuree) prevList.push('Opération de longue durée');
  if (prevImpactResident) prevList.push(`Impact résidents : ${prevImpactResident}`);
  if (prevInterruption) prevList.push(`Interruption d'activité : ${prevInterruption}`);
  if (prevRelogement) prevList.push(`Relogement : ${prevRelogement}`);
  if (prevEffondrement) prevList.push(`Risque d'effondrement : ${prevEffondrement}`);
  if (prevAutre) prevList.push(prevAutre);

  const text = `Opérations Diverses :\n` +
    `- Je vois : ${seeList.join(' | ') || 'Non précisé'}\n` +
    `- Je fais : ${doList.join(' | ') || 'Aucune action spécifique'}\n` +
    `- Je prévois : ${prevList.join(' | ') || 'Aucune'}`;

  saveMemoToStorage(text, 'Opé. Diverses', !document.getElementById('opeDivNumCheck').checked, true, 'memo-badge-urban');
  urbanOpeDivView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// VALIDATION OPÉRATIONS NAUTIQUES
document.getElementById('saveUrbanNautBtn').addEventListener('click', () => {
  let personneAnimal = [];
  if (document.getElementById('nautTombeeLeau').checked) personneAnimal.push('Tombee à l’eau');
  if (document.getElementById('nautEnvasee').checked) personneAnimal.push('Envasée');
  if (document.getElementById('nautNoyee').checked) personneAnimal.push('Noyée');
  if (document.getElementById('nautCorpsFlottant').checked) personneAnimal.push('Corps flottant');

  let embarcationDiff = [];
  if (document.getElementById('nautDerive').checked) embarcationDiff.push('À la dérive (avarie...)');
  if (document.getElementById('nautEchouee').checked) embarcationDiff.push('Échouée');
  if (document.getElementById('nautFeu').checked) embarcationDiff.push('Feu');
  if (document.getElementById('nautVoieEau').checked) embarcationDiff.push('Voie d’eau');
  if (document.getElementById('nautChaviree').checked) embarcationDiff.push('Chavirée');
  if (document.getElementById('nautMouillage').checked) embarcationDiff.push('Au mouillage');

  const usageTransport = document.querySelector('input[name="nautUsageTransport"]:checked')?.value || 'Non précisé';
  const natureMarchandises = document.getElementById('nautNatureMarchandises').value.trim();
  const nomImmat = document.getElementById('nautNomImmat').value.trim();
  const dimensions = document.getElementById('nautDimensions').value.trim();

  const nbrTotal = document.getElementById('nautNautNbrTotal')?.value.trim();
  const nbrEquipage = document.getElementById('nautNbrEquipage').value.trim();
  const nbrPassagers = document.getElementById('nautNbrPassagers').value.trim();

  const vehiculeLeau = document.getElementById('nautVehiculeLeauCheck').checked;
  const inondationDesc = document.getElementById('nautInondationDesc').value.trim();
  const meteoMaree = document.getElementById('nautMeteoMaree').value.trim();
  const bilanVictimes = document.getElementById('nautBilanVictimes').value.trim();

  let actionsList = [];
  document.querySelectorAll('.nautActionCheck:checked').forEach(cb => actionsList.push(cb.value));

  const evacEmbarcation = document.getElementById('nautEvacEmbarcation').value.trim();
  const prvSitu = document.getElementById('nautPrvSitu').value.trim();
  const prmSitu = document.getElementById('nautPrmSitu').value.trim();
  const sectorisation = document.getElementById('nautSectorisation').value.trim();
  const pcSitu = document.getElementById('nautPcSitu').value.trim();

  const difficulteesParticulieres = document.getElementById('nautDifficulteesParticulieres').value.trim();
  const risqueSubmersion = document.getElementById('nautRisqueSubmersion').value.trim();
  const prevLongueDuree = document.getElementById('nautPrevLongueDureeCheck').checked;
  const risquePollution = document.getElementById('nautRisquePollutionCheck').checked;
  const autrePrevision = document.getElementById('nautAutrePrevision').value.trim();

  let seeList = [];
  if (personneAnimal.length > 0) seeList.push(`Personne / animal : ${personneAnimal.join(', ')}`);
  if (embarcationDiff.length > 0) seeList.push(`Embarcation en difficulté : ${embarcationDiff.join(', ')}`);
  seeList.push(`Usage : ${usageTransport}${natureMarchandises ? ' ('+natureMarchandises+')' : ''}`);
  if (nomImmat) seeList.push(`Nom/Immat : ${nomImmat}`);
  if (dimensions) seeList.push(`Dimensions : ${dimensions}`);
  if (nbrTotal || nbrEquipage || nbrPassagers) {
    seeList.push(`À bord -> Total: ${nbrTotal||'?'}, Équipage: ${nbrEquipage||'?'}, Passagers: ${nbrPassagers||'?'}`);
  }
  if (vehiculeLeau) seeList.push("Véhicule tombé à l'eau (présence/absence de victime)");
  if (inondationDesc) seeList.push(`Inondation : ${inondationDesc}`);
  if (meteoMaree) seeList.push(`Météo/Marée : ${meteoMaree}`);
  if (bilanVictimes) seeList.push(`Bilan victimes : ${bilanVictimes}`);

  let doList = [];
  if (actionsList.length > 0) doList.push(`Actions : ${actionsList.join(', ')}`);
  if (evacEmbarcation) doList.push(`Évacuation embarcation : ${evacEmbarcation}`);
  if (prvSitu) doList.push(`PRV : ${prvSitu}`);
  if (prmSitu) doList.push(`PRM : ${prmSitu}`);
  if (sectorisation) doList.push(`Sectorisation : ${sectorisation}`);
  if (pcSitu) doList.push(`PC situé à : ${pcSitu}`);

  let prevList = [];
  if (difficulteesParticulieres) prevList.push(`Difficultés : ${difficulteesParticulieres}`);
  if (risqueSubmersion) prevList.push(`Risque submersion : ${risqueSubmersion}`);
  if (prevLongueDuree) prevList.push("Opération de longue durée");
  if (risquePollution) prevList.push("Risque de pollution");
  if (autrePrevision) prevList.push(autrePrevision);

  const text = `Opérations Nautiques :\n` +
    `- Je vois : ${seeList.join(' | ') || 'Non précisé'}\n` +
    `- Je fais : ${doList.join(' | ') || 'Aucune action spécifique'}\n` +
    `- Je prévois : ${prevList.join(' | ') || 'Aucune'}`;

  saveMemoToStorage(text, 'Opé. Nautiques', !document.getElementById('nautNumCheck').checked, true, 'memo-badge-urban');
  urbanNautView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// VALIDATION DEMANDE DE RENFORTS
document.getElementById('saveUrbanRenfortBtn').addEventListener('click', () => {
  const pompVehicles = [
    { name: 'EP6', id: 'renfNbrEP6' },
    { name: 'VSAV', id: 'renfNbrVSAV' },
    { name: 'ECH', id: 'renfNbrECH' },
    { name: 'VSR', id: 'renfNbrVSR' },
    { name: 'CD1/CD2', id: 'renfNbrCD12' },
    { name: 'SMUR', id: 'renfNbrSMUR' },
    { name: 'Hélico', id: 'renfNbrHelico' },
    { name: 'Unités', id: 'renfNbrUnites' },
    { name: 'GPF', id: 'renfNbrGPF' },
    { name: 'VPE', id: 'renfNbrVPE' }
  ];

  let pompSummary = [];
  pompVehicles.forEach(item => {
    const val = parseInt(document.getElementById(item.id)?.value) || 0;
    if (val > 0) pompSummary.push(`${val} ${item.name}`);
  });

  const pompTexteLibre = document.getElementById('renfPompiersTexteLibre').value.trim();

  let servicesList = [];
  document.querySelectorAll('.renfServiceCheck:checked').forEach(cb => servicesList.push(cb.value));
  const serviceAutreTxt = document.getElementById('renfServiceAutreTxt').value.trim();
  if (serviceAutreTxt) servicesList.push(serviceAutreTxt);

  let details = [];
  if (pompSummary.length > 0) details.push(`Moyens Sapeurs-Pompiers : ${pompSummary.join(', ')}`);
  if (pompTexteLibre) details.push(`Précisions pompiers : ${pompTexteLibre}`);
  if (servicesList.length > 0) details.push(`Autres Services & Gestionnaires : ${servicesList.join(', ')}`);

  const text = `Demande de Renforts :\n- ${details.join('\n- ') || 'Aucun moyen demandé'}`;

  saveMemoToStorage(text, 'Renforts', !document.getElementById('renfNumCheck').checked, true, 'memo-badge-orange');
  urbanRenfortView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// BILAN & TABLEAU VICTIMES
function updateVictimsSynthesisTitle() {
  const imp = parseInt(document.getElementById('sumVicImpliques').value) || 0;
  const ua = parseInt(document.getElementById('sumVicUA').value) || 0;
  const ur = parseInt(document.getElementById('sumVicUR').value) || 0;
  const dcd = parseInt(document.getElementById('sumVicDCD').value) || 0;
  const sains = parseInt(document.getElementById('sumNonVicSains').value) || 0;
  const total = imp + ua + ur + dcd + sains;
  
  const titleEl = document.getElementById('victimsSynthTitle');
  if (titleEl) {
    titleEl.textContent = `SYNTHÈSE : (${total}) Concerné(s) [Impliqués: ${imp}, UA: ${ua}, UR: ${ur}, DCD: ${dcd}, Sains: ${sains}]`;
  }
}

function addVictimRow(data = {}) {
  const tbody = document.getElementById('victimsTableBody');
  if(!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" class="vic-vehicule" placeholder="Véhicule" value="${data.veh || ''}"></td>
    <td><input type="text" class="vic-age" placeholder="Sexe/Âge" value="${data.age || ''}"></td>
    <td><select class="vic-gravite"><option value="UR" ${data.grav==='UR'?'selected':''}>UR</option><option value="UA" ${data.grav==='UA'?'selected':''}>UA</option><option value="DCD" ${data.grav==='DCD'?'selected':''}>DCD</option></select></td>
    <td><input type="text" class="vic-dest" placeholder="Destination / CH" value="${data.dest || ''}"></td>
    <td><input type="text" class="vic-par" placeholder="Par..." value="${data.par || ''}"></td>
    <td><button class="btn-danger" style="padding:2px 6px;" onclick="this.parentElement.parentElement.remove()">&times;</button></td>
  `;
  tbody.appendChild(row);
}

document.getElementById('saveUrbanVictimBtn').addEventListener('click', () => {
  const imp = document.getElementById('sumVicImpliques').value || '0';
  const ua = document.getElementById('sumVicUA').value || '0';
  const ur = document.getElementById('sumVicUR').value || '0';
  const dcd = document.getElementById('sumVicDCD').value || '0';
  const sains = document.getElementById('sumNonVicSains').value || '0';
  const prv = document.getElementById('urbPrvEmplacement').value.trim() || 'Non précisé';

  let rowsData = [];
  let rowsSummary = [];
  document.querySelectorAll('#victimsTableBody tr').forEach(tr => {
    const veh = tr.querySelector('.vic-vehicule').value.trim();
    const age = tr.querySelector('.vic-age').value.trim();
    const grav = tr.querySelector('.vic-gravite').value;
    const dest = tr.querySelector('.vic-dest').value.trim();
    const par = tr.querySelector('.vic-par').value.trim();

    rowsData.push({ veh, age, grav, dest, par });
    if(veh || age || dest) {
      rowsSummary.push(`  - [${grav}] Véh: ${veh || '-'}, Sexe/Âge: ${age || '-'}, Dest: ${dest || '-'} (Par: ${par || '-'})`);
    }
  });

  const text = `Bilan & Tableau Victimes :\n- Synthèse : Impliqués: ${imp}, UA: ${ua}, UR: ${ur}, DCD: ${dcd}, Sains: ${sains}\n- Emplacement PRV : ${prv}\n- Détail individuel :\n${rowsSummary.length > 0 ? rowsSummary.join('\n') : '  Aucune victime détaillée.'}`;
  
  const rawVictimData = { imp, ua, ur, dcd, sains, prv, rows: rowsData };
  const isNumbered = document.getElementById('victimsNumCheck').checked;
  const saveVicBtn = document.getElementById('saveUrbanVictimBtn');
  const editingIndex = saveVicBtn.getAttribute('data-editing-index');
  const memos = JSON.parse(localStorage.getItem('saved_memos') || '[]');

  if (editingIndex !== null && editingIndex !== undefined && memos[editingIndex]) {
    memos[editingIndex].text = text;
    memos[editingIndex].rawVictimData = rawVictimData;
    memos[editingIndex].date = new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    memos[editingIndex].isUnnumbered = !isNumbered;
    localStorage.setItem('saved_memos', JSON.stringify(memos));
    
    saveVicBtn.removeAttribute('data-editing-index');
    saveVicBtn.textContent = "💾 Valider Bilan Victimes";
    loadMemos();
  } else {
    saveMemoToStorageWithRawData(text, 'Bilan Victimes', !isNumbered, true, 'memo-badge-urban', rawVictimData);
  }

  urbanVictimsView.classList.add('hidden'); 
  mainView.classList.remove('hidden');
});

// SAUVEGARDE FORÊT DÉTAILLÉE
document.getElementById('saveT0MsgBtn').addEventListener('click', () => {
  const commune = document.getElementById('forestCommune').value.trim() || 'Non renseignée';
  const lieuDit = document.getElementById('forestLieuDit').value.trim() || 'Non renseigné';
  let vegs = [];
  document.querySelectorAll('.vegCheck:checked').forEach(cb => vegs.push(cb.value));

  const text = `Arrivée SLLX (T0) :\n- Commune : ${commune}\n- Lieu-dit : ${lieuDit}\n- Type de végétation : ${vegs.join(', ') || 'Non précisé'}`;
  saveMemoToStorage(text, 'T0 Arrivée', !document.getElementById('t0NumCheck').checked, false, 'memo-badge-forest');
  forestT0View.classList.add('hidden'); forestMenuView.classList.add('hidden'); mainView.classList.remove('hidden');
});

document.getElementById('saveT3MsgBtn').addEventListener('click', () => {
  const feuDe = document.getElementById('t3FeuDe').value.trim() || 'Végétation';
  const surf = document.getElementById('t3Superficie').value.trim() || '-';
  const front = document.getElementById('t3FrontFeu').value.trim() || '-';
  const situation = document.querySelector('input[name="t3Situation"]:checked')?.value || 'Non précisée';
  const surfMen = document.getElementById('t3SurfaceMenacee').value.trim() || '-';
  const diffTxt = document.getElementById('t3DiffTexte').value.trim();
  let diffs = [];
  document.querySelectorAll('.t3DiffCheck:checked').forEach(cb => diffs.push(cb.value));
  if(diffTxt) diffs.push(diffTxt);

  const moyens = document.getElementById('t3MoyensSLLX').value.trim() || '-';
  const suff = document.getElementById('t3SecoursSuffisantsCheck').checked ? 'Suffisants' : 'Demande renforts';
  const unit = document.getElementById('t3NumUnit').value || '0';
  const gpf = document.getElementById('t3NumGPF').value || '0';
  const abe = document.getElementById('t3NumABE').value || '0';
  const hbe = document.getElementById('t3NumHBE').value || '0';
  const renfTxt = document.getElementById('t3RenfortTexte').value.trim();

  let auths = [];
  document.querySelectorAll('.t3AuthCheck:checked').forEach(cb => auths.push(cb.value));
  const authTxt = document.getElementById('t3AuthTexte').value.trim();
  if(authTxt) auths.push(authTxt);

  const pointEng = document.getElementById('t3PointEngagement').value.trim() || '-';
  const peiNum = document.getElementById('t3PeiNum').value.trim() || '-';
  const peiCoord = document.getElementById('t3PeiCoord').value.trim() || '-';
  let waterMoyens = [];
  document.querySelectorAll('.t3MoyenWaterCheck:checked').forEach(cb => waterMoyens.push(cb.value));
  const waterAutre = document.getElementById('t3MoyenAutreTexte').value.trim();
  if(waterAutre) waterMoyens.push(waterAutre);

  const text = `Reconnaissance T+3 (Ambiance) :\n- Feu de : ${feuDe}\n- Superficie : ${surf} | Front : ${front}\n- Situation : ${situation} | Menace : ${surfMen}\n- Difficultés : ${diffs.join(', ') || 'Aucune'}\n- Moyens sur place : ${moyens} (${suff})\n- Renforts demandés : Unités: ${unit}, GPF: ${gpf}, ABE: ${abe}, HBE: ${hbe} ${renfTxt ? '('+renfTxt+')' : ''}\n- Autorités/Services : ${auths.join(', ') || 'Aucun'}\n- Point d'engagement : ${pointEng}\n- Point d'eau : PEI N°${peiNum} (Coord: ${peiCoord}) - Moyens: ${waterMoyens.join(', ') || 'Aucun'}`;
  
  saveMemoToStorage(text, 'T+3 Ambiance', !document.getElementById('t3NumCheck').checked, false, 'memo-badge-forest');
  forestT3View.classList.add('hidden'); forestMenuView.classList.add('hidden'); mainView.classList.remove('hidden');
});

document.getElementById('saveT20MsgBtn').addEventListener('click', () => {
  const phase = document.querySelector('input[name="t20PhaseLutte"]:checked')?.value || 'Non précisée';
  const evol = document.querySelector('input[name="t20EvolSituation"]:checked')?.value || 'Non précisée';
  const surf = document.getElementById('t20Superficie').value.trim() || '-';
  const front = document.getElementById('t20FrontFeu').value.trim() || '-';
  
  let diffs = [];
  document.querySelectorAll('.t20DiffCheck:checked').forEach(cb => diffs.push(cb.value));
  const diffTxt = document.getElementById('t20DiffTexte').value.trim();
  if(diffTxt) diffs.push(diffTxt);

  let requals = [];
  document.querySelectorAll('.t20RequalCheck:checked').forEach(cb => requals.push(cb.value));

  const details = document.getElementById('t20TexteLibre').value.trim() || 'Aucun détail';
  const moyens = document.getElementById('t20MoyensSLLX').value.trim() || '-';
  const suff = document.getElementById('t20SecoursSuffisantsCheck').checked ? 'Suffisants' : 'Demande renforts';
  const unit = document.getElementById('t20NumUnit').value || '0';
  const gpf = document.getElementById('t20NumGPF').value || '0';
  const abe = document.getElementById('t20NumABE').value || '0';
  const hbe = document.getElementById('t20NumHBE').value || '0';
  const renfTxt = document.getElementById('t20RenfortTexte').value.trim();

  let auths = [];
  document.querySelectorAll('.t20AuthCheck:checked').forEach(cb => auths.push(cb.value));
  const authTxt = document.getElementById('t20AuthTexte').value.trim();
  if(authTxt) auths.push(authTxt);

  const text = `Compte Rendu T+20 :\n- Phase : ${phase} | Évolution : ${evol}\n- Superficie : ${surf} | Front : ${front}\n- Difficultés : ${diffs.join(', ') || 'Aucune'}\n${requals.length > 0 ? '- Requalification : '+requals.join(', ')+'\n' : ''}- Actions / Détails : ${details}\n- Moyens : ${moyens} (${suff})\n- Renforts demandés : Unités: ${unit}, GPF: ${gpf}, ABE: ${abe}, HBE: ${hbe} ${renfTxt ? '('+renfTxt+')' : ''}\n- Autorités/Services : ${auths.join(', ') || 'Aucun'}`;
  
  saveMemoToStorage(text, 'T+20 Situation', !document.getElementById('t20NumCheck').checked, false, 'memo-badge-forest');
  forestT20View.classList.add('hidden'); forestMenuView.classList.add('hidden'); mainView.classList.remove('hidden');
});

const ORIGINES_DATA = {
  "Naturelle": ["Foudre", "Chaleur spontanée"],
  "Accidentelle": ["Ligne électrique", "Voiture / Véhicule", "Chantier / Travaux", "Feu de décharge / Incinération", "Jet d'article de fumerie"],
  "Malveillance": ["Acte volontaire / Malveillant", "Destruction de biens"],
  "Involontaire travaux": ["Travaux forestiers", "Activité militaire", "Reprise d'incendie antérieur"],
  "Involontaire particuliers": ["Barbecue / Plein air", "Feu de jardin / Végétation", "Feu d'artifice / Pétard"]
};

function updateEteintOrigines() {
  const cause = document.getElementById('eteintCauseSelect').value;
  const panel = document.getElementById('eteintOriginePanel');
  const container = document.getElementById('eteintOrigineContainer');
  const autreTxt = document.getElementById('eteintOrigineAutreTxt');
  
  container.innerHTML = '';
  autreTxt.classList.add('hidden');

  if (cause === 'Inconnue' || !ORIGINES_DATA[cause]) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  const list = ORIGINES_DATA[cause];
  list.forEach(orig => {
    container.innerHTML += `<label class="checkbox-label"><input type="checkbox" class="eteintOrigineCheck" value="${orig}"> ${orig}</label>`;
  });
  container.innerHTML += `<label class="checkbox-label"><input type="checkbox" class="eteintOrigineCheck" value="Autre" onchange="document.getElementById('eteintOrigineAutreTxt').classList.toggle('hidden', !this.checked)"> Autre</label>`;
}

document.getElementById('saveTEteintMsgBtn').addEventListener('click', () => {
  const commune = document.getElementById('eteintCommune').value.trim() || 'Non renseignée';
  const lieuDit = document.getElementById('eteintLieuDit').value.trim() || '-';
  const coords = document.getElementById('eteintCoords').value.trim() || '-';
  const surf = document.getElementById('eteintSuperficie').value.trim() || '-';
  const veg = document.getElementById('eteintVegetation').value.trim() || '-';
  const cert = document.querySelector('input[name="eteintCauseCert"]:checked')?.value || '-';
  const cause = document.getElementById('eteintCauseSelect').value;
  
  let origines = [];
  document.querySelectorAll('.eteintOrigineCheck:checked').forEach(cb => origines.push(cb.value));
  const origAutre = document.getElementById('eteintOrigineAutreTxt').value.trim();
  if(origAutre) origines.push(origAutre);

  const decedes = document.getElementById('eteintDecedes').value || '0';
  const batDet = document.getElementById('eteintBatDetruits').value || '0';
  const batPart = document.getElementById('eteintBatPartiel').value || '0';
  const surv = document.querySelector('input[name="eteintSurveillance"]:checked')?.value || 'Non précisée';

  const text = `Feu Éteint :\n- Localisation : ${commune} (Lieu-dit: ${lieuDit}, Coords: ${coords})\n- Superficie détruite : ${surf} (${veg})\n- Cause : ${cause} (${cert})${origines.length > 0 ? ' - Origine: '+origines.join(', ') : ''}\n- Bilan humain/matériel : ${decedes} décédé(s), ${batDet} bâtiment(s) détruit(s), ${batPart} partiel(lement)\n- Surveillance assurée par : ${surv}`;
  
  saveMemoToStorage(text, 'Feu Éteint', !document.getElementById('eteintNumCheck').checked, false, 'memo-badge-forest');
  forestTEteintView.classList.add('hidden'); forestMenuView.classList.add('hidden'); mainView.classList.remove('hidden');
});

// SOAM
document.getElementById('addObjectiveBtn').addEventListener('click', addObjectiveCard);

function addObjectiveCard() {
  const container = document.getElementById('objectivesContainer');
  const card = document.createElement('div');
  card.className = 'soam-objective-card';

  let categoryOptionsHtml = '<option value="">-- Choisir une catégorie d\'objectif --</option>';
  for (const [key, cat] of Object.entries(SOAM_OBJECTIFS)) {
    categoryOptionsHtml += `<option value="${key}">${cat.label}</option>`;
  }

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
      <select class="soam-obj-category" onchange="updateSoamOptions(this)" style="flex:1; margin-right:8px; padding:6px; border-radius:4px; border:1px solid #cbd5e1;">
        ${categoryOptionsHtml}
      </select>
      <button class="btn-danger" style="padding:2px 6px;" onclick="this.parentElement.parentElement.remove(); updateSoamAgentsTotal();">&times;</button>
    </div>
    <div style="margin-bottom:6px;">
      <select class="soam-obj-select" style="width:100%; padding:6px; border-radius:4px; border:1px solid #cbd5e1;" disabled>
        <option value="">-- Sélectionnez d'abord une catégorie --</option>
      </select>
    </div>
    <textarea class="soam-obj-actions" placeholder="Actions prévues / Précisions..." style="height:50px; margin-bottom:8px; width:100%; padding:6px; border-radius:4px; border:1px solid #cbd5e1;"></textarea>
    <div style="display:flex; align-items:center; gap:10px;">
      <label style="font-size:0.8rem; font-weight:700; color:#5b21b6;">Moyens / Agents requis :</label>
      <input type="number" class="soam-obj-agents" min="0" value="0" style="width:80px; padding:4px;" oninput="updateSoamAgentsTotal()">
    </div>
  `;
  container.appendChild(card);
  updateSoamAgentsTotal();
}

window.updateSoamOptions = function(selectElement) {
  const card = selectElement.closest('.soam-objective-card');
  const optionSelect = card.querySelector('.soam-obj-select');
  const catKey = selectElement.value;

  if (!catKey || !SOAM_OBJECTIFS[catKey]) {
    optionSelect.innerHTML = '<option value="">-- Sélectionnez d\'abord une catégorie --</option>';
    optionSelect.disabled = true;
    return;
  }

  const optionsList = SOAM_OBJECTIFS[catKey].options;
  let html = '<option value="">-- Sélectionner l\'objectif --</option>';
  optionsList.forEach(opt => { html += `<option value="${opt}">${opt}</option>`; });
  html += `<option value="Autre">Autre (préciser dans les actions)</option>`;
  optionSelect.innerHTML = html;
  optionSelect.disabled = false;
};

function updateSoamAgentsTotal() {
  let total = 0;
  document.querySelectorAll('.soam-obj-agents').forEach(input => { total += parseInt(input.value) || 0; });
  const totalEl = document.getElementById('soamTotalAgents');
  if(totalEl) totalEl.textContent = total;
}

document.getElementById('saveSoamBtn').addEventListener('click', () => {
  const sit = document.getElementById('soamSituation').value.trim() || 'Non renseignée';
  let objsText = [];
  let totalAgents = 0;

  document.querySelectorAll('.soam-objective-card').forEach((card, idx) => {
    const catSelect = card.querySelector('.soam-obj-category');
    const catLabel = catSelect.selectedIndex > 0 ? catSelect.options[catSelect.selectedIndex].text : 'Non catégorisé';
    const optSelect = card.querySelector('.soam-obj-select');
    const selectedObj = optSelect.value ? optSelect.value : `Objectif ${idx+1}`;
    const acts = card.querySelector('.soam-obj-actions').value.trim() || '-';
    const agents = parseInt(card.querySelector('.soam-obj-agents').value) || 0;
    totalAgents += agents;
    objsText.push(`  • [${catLabel}] ${selectedObj} (Agents: ${agents}) :\n    Actions : ${acts}`);
  });

  const text = `Raisonnement SOAM :\n- Situation : ${sit}\n- Objectifs & Actions :\n${objsText.join('\n')}\n- Total Moyens Humains : ${totalAgents} Agent(s)`;
  saveMemoToStorage(text, 'SOAM', !document.getElementById('soamNumCheck').checked, false, 'memo-badge-soam');
  soamView.classList.add('hidden'); mainView.classList.remove('hidden');
});

// MOYENS SOL & AIR
function getCustomList(k, d) { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; }
function saveCustomList(k, l) { localStorage.setItem(k, JSON.stringify(l)); }

function updateSelectOptions() {
  const engins = getCustomList('custom_engins', DEFAULT_ENGINS);
  const centres = getCustomList('custom_centres', DEFAULT_CENTRES);
  document.getElementById('enginSelect').innerHTML = '<option value="">-- Engin --</option>' + engins.map(e => `<option value="${e}">${e}</option>`).join('');
  document.getElementById('centerSelect').innerHTML = '<option value="">-- Centre --</option>' + centres.map(c => `<option value="${c}">${c}</option>`).join('');
}

function updateAirSelectOptions() {
  const types = getCustomList('custom_air_types', DEFAULT_AIR_TYPES);
  const callsigns = getCustomList('custom_air_callsigns', DEFAULT_AIR_CALLSIGNS);
  document.getElementById('airTypeSelect').innerHTML = '<option value="">-- Type --</option>' + types.map(a => `<option value="${a}">${a}</option>`).join('');
  document.getElementById('airCallsignSelect').innerHTML = '<option value="">-- Indicatif --</option>' + callsigns.map(c => `<option value="${c}">${c}</option>`).join('');
}

function updateTagsDisplay() {
  const engins = getCustomList('custom_engins', DEFAULT_ENGINS);
  const centres = getCustomList('custom_centres', DEFAULT_CENTRES);
  document.getElementById('enginsTags').innerHTML = engins.map((e, idx) => `<div class="tag">${e} <span onclick="removeEnginTag(${idx})">&times;</span></div>`).join('');
  document.getElementById('centersTags').innerHTML = centres.map((c, idx) => `<div class="tag">${c} <span onclick="removeCenterTag(${idx})">&times;</span></div>`).join('');
}

function updateAirTagsDisplay() {
  const types = getCustomList('custom_air_types', DEFAULT_AIR_TYPES);
  const callsigns = getCustomList('custom_air_callsigns', DEFAULT_AIR_CALLSIGNS);
  document.getElementById('airTypesTags').innerHTML = types.map((t, idx) => `<div class="tag">${t} <span onclick="removeAirTypeTag(${idx})">&times;</span></div>`).join('');
  document.getElementById('airCallsignsTags').innerHTML = callsigns.map((c, idx) => `<div class="tag">${c} <span onclick="removeAirCallsignTag(${idx})">&times;</span></div>`).join('');
}

window.removeEnginTag = function(idx) { let engins = getCustomList('custom_engins', DEFAULT_ENGINS); engins.splice(idx, 1); saveCustomList('custom_engins', engins); updateSelectOptions(); updateTagsDisplay(); };
window.removeCenterTag = function(idx) { let centres = getCustomList('custom_centres', DEFAULT_CENTRES); centres.splice(idx, 1); saveCustomList('custom_centres', centres); updateSelectOptions(); updateTagsDisplay(); };
window.removeAirTypeTag = function(idx) { let types = getCustomList('custom_air_types', DEFAULT_AIR_TYPES); types.splice(idx, 1); saveCustomList('custom_air_types', types); updateAirSelectOptions(); updateAirTagsDisplay(); };
window.removeAirCallsignTag = function(idx) { let callsigns = getCustomList('custom_air_callsigns', DEFAULT_AIR_CALLSIGNS); callsigns.splice(idx, 1); saveCustomList('custom_air_callsigns', callsigns); updateAirSelectOptions(); updateAirTagsDisplay(); };

document.getElementById('addEnginBtn').addEventListener('click', () => {
  const val = document.getElementById('newEnginInput').value.trim().toUpperCase();
  if(val) { let engins = getCustomList('custom_engins', DEFAULT_ENGINS); if(!engins.includes(val)) { engins.push(val); saveCustomList('custom_engins', engins); } document.getElementById('newEnginInput').value = ''; updateSelectOptions(); updateTagsDisplay(); }
});

document.getElementById('addCenterBtn').addEventListener('click', () => {
  const val = document.getElementById('newCenterInput').value.trim();
  if(val) { let centres = getCustomList('custom_centres', DEFAULT_CENTRES); if(!centres.includes(val)) { centres.push(val); saveCustomList('custom_centres', centres); } document.getElementById('newCenterInput').value = ''; updateSelectOptions(); updateTagsDisplay(); }
});

document.getElementById('addAirTypeBtn').addEventListener('click', () => {
  const val = document.getElementById('newAirTypeInput').value.trim();
  if(val) { let types = getCustomList('custom_air_types', DEFAULT_AIR_TYPES); if(!types.includes(val)) { types.push(val); saveCustomList('custom_air_types', types); } document.getElementById('newAirTypeInput').value = ''; updateAirSelectOptions(); updateAirTagsDisplay(); }
});

document.getElementById('addAirCallsignBtn').addEventListener('click', () => {
  const val = document.getElementById('newAirCallsignInput').value.trim();
  if(val) { let callsigns = getCustomList('custom_air_callsigns', DEFAULT_AIR_CALLSIGNS); if(!callsigns.includes(val)) { callsigns.push(val); saveCustomList('custom_air_callsigns', callsigns); } document.getElementById('newAirCallsignInput').value = ''; updateAirSelectOptions(); updateAirTagsDisplay(); }
});

document.getElementById('addResourceBtn').addEventListener('click', () => {
  const engin = document.getElementById('enginSelect').value;
  const order = document.getElementById('orderSelect').value;
  const center = document.getElementById('centerSelect').value;
  if (!engin || !center) return alert("Sélectionnez au moins un type d'engin et un centre.");
  const fullName = order ? `${engin} ${order} (${center})` : `${engin} (${center})`;
  const resources = JSON.parse(localStorage.getItem('saved_resources') || '[]');
  resources.unshift({ name: fullName, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), onSite: true });
  localStorage.setItem('saved_resources', JSON.stringify(resources));
  loadResources();
});

function loadResources() {
  const resources = JSON.parse(localStorage.getItem('saved_resources') || '[]');
  const grid = document.getElementById('resourcesGrid');
  grid.innerHTML = resources.length === 0 ? '<p style="color:#94a3b8; text-align:center;">Aucun moyen engagé.</p>' : '';
  resources.forEach((res, index) => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <div class="resource-info">
        <div class="resource-title">${res.name}</div>
        <div class="${res.onSite ? 'badge-on' : 'badge-off'}">Engagé à ${res.time} - ${res.onSite ? 'Sur les lieux' : 'Quitté'}</div>
      </div>
      <div class="resource-buttons">
        <button class="btn-secondary" onclick="toggleResourceState(${index})">${res.onSite ? 'Libérer' : 'Réengager'}</button>
        <button class="btn-danger" onclick="deleteResource(${index})">Supprimer</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.toggleResourceState = function(index) {
  const resources = JSON.parse(localStorage.getItem('saved_resources') || '[]');
  resources[index].onSite = !resources[index].onSite;
  localStorage.setItem('saved_resources', JSON.stringify(resources));
  loadResources();
};

window.deleteResource = function(index) {
  const resources = JSON.parse(localStorage.getItem('saved_resources') || '[]');
  resources.splice(index, 1);
  localStorage.setItem('saved_resources', JSON.stringify(resources));
  loadResources();
};

document.getElementById('addAirResourceBtn').addEventListener('click', () => {
  const type = document.getElementById('airTypeSelect').value;
  const callsign = document.getElementById('airCallsignSelect').value;
  const number = document.getElementById('airNumberInput').value.trim();
  if (!type || !callsign || !number) return alert("Remplissez le type, l'indicatif et le numéro.");
  const airResources = JSON.parse(localStorage.getItem('saved_air_resources') || '[]');
  airResources.unshift({ type, callsign: `${callsign} ${number}`, drops: 0 });
  localStorage.setItem('saved_air_resources', JSON.stringify(airResources));
  loadAirResources();
  document.getElementById('airNumberInput').value = '';
});

function loadAirResources() {
  const airResources = JSON.parse(localStorage.getItem('saved_air_resources') || '[]');
  const grid = document.getElementById('airResourcesGrid');
  grid.innerHTML = airResources.length === 0 ? '<p style="color:#94a3b8; text-align:center;">Aucun moyen aérien.</p>' : '';
  airResources.forEach((air, index) => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <div class="resource-info">
        <div class="resource-title">${air.type} ${air.callsign}</div>
        <div class="badge-drop">💧 ${air.drops} largage(s)</div>
      </div>
      <div class="resource-buttons">
        <button class="btn-sky" onclick="incrementDrop(${index})">+1 Largage</button>
        <button class="btn-danger" onclick="deleteAirResource(${index})">Supprimer</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.incrementDrop = function(index) {
  const airResources = JSON.parse(localStorage.getItem('saved_air_resources') || '[]');
  airResources[index].drops++;
  localStorage.setItem('saved_air_resources', JSON.stringify(airResources));
  loadAirResources();
};

window.deleteAirResource = function(index) {
  const airResources = JSON.parse(localStorage.getItem('saved_air_resources') || '[]');
  airResources.splice(index, 1);
  localStorage.setItem('saved_air_resources', JSON.stringify(airResources));
  loadAirResources();
};

loadMemos();