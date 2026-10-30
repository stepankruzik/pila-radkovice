(function () {
  const root = document.querySelector('[data-kubirace]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('.calc-tab'));
  const panels = Array.from(root.querySelectorAll('.mode-panel'));
  const exportCsvButton = document.getElementById('exportCsv');
  const exportPdfButton = document.getElementById('exportPdf');
  const importExcelButton = document.getElementById('importExcelData');
  const excelPasteField = document.getElementById('excelPaste');
  const csvImportInput = document.getElementById('csvImport');
  const importDrawer = document.getElementById('importDrawer');
  const toggleImportButton = document.getElementById('toggleImport');
  const addLogRowButton = document.getElementById('addLogRow');
  const clearLogRowsButton = document.getElementById('clearLogRows');
  const cloneLastRowButton = document.getElementById('cloneLastRow');
  const logRowsContainer = document.getElementById('logRows');
  const logRowTemplate = document.getElementById('logRowTemplate');
  const resultLogTableWrap = document.getElementById('resultLogTableWrap');
  const resultLogTableBody = document.getElementById('resultLogTableBody');
  const resultLogEmpty = document.getElementById('resultLogEmpty');
  const beamPreviewCanvas = document.getElementById('beamPreviewCanvas');
  const beamPreviewLabel = document.getElementById('beamPreviewLabel');
  const stackCutModeInput = document.getElementById('stackCutMode');
  const stackWidthLabel = document.getElementById('stackWidthLabel');
  const stackHeightField = document.getElementById('stackHeightField');
  const stackCountXField = document.getElementById('stackCountXField');
  const stackCountYLabel = document.getElementById('stackCountYLabel');
  const draftLengthInput = document.getElementById('draftLength');
  const draftDiameterInput = document.getElementById('draftDiameter');
  const draftCountInput = document.getElementById('draftCount');
  const withoutBarkInput = document.getElementById('withoutBark');
  const draftVolumeLabel = document.getElementById('draftVolume');
  const topNetVolumeLabel = document.getElementById('topNetVolume');
  const topTotalPiecesLabel = document.getElementById('topTotalPieces');
  const logListStats = document.getElementById('logListStats');
  const logListVolumeLabel = document.getElementById('logListVolumeLabel');
  const calcDateLabel = document.getElementById('calcDateLabel');
  const speciesButtons = Array.from(root.querySelectorAll('[data-species]'));
  const fieldCards = Array.from(root.querySelectorAll('[data-focus-field]'));
  const keypadButtons = Array.from(root.querySelectorAll('.pad-key'));
  const bottomNewEntryButton = document.getElementById('bottomNewEntry');
  const bottomShowListButton = document.getElementById('bottomShowList');
  const bottomExportButton = document.getElementById('bottomExport');

  const labels = {
    netLabel: document.getElementById('netVolumeLabel'),
    weightLabel: document.getElementById('weightEstimateLabel'),
    net: document.getElementById('netVolume'),
    weight: document.getElementById('weightEstimate'),
    title: document.getElementById('calcModeTitle'),
    text: document.getElementById('calcExplanation')
  };
  const weightTile = labels.weight?.closest('.result-tile');

  const densities = {
    smrk: 450,
    borovice: 520,
    modrin: 590,
    dub: 700
  };

  const speciesLabels = {
    smrk: 'Smrk',
    borovice: 'Borovice',
    modrin: 'Modrin',
    dub: 'Dub'
  };

  const barkDeductionTables = {
    smrk: [0.7, 0.7, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.2, 1.2, 1.2, 1.3, 1.3, 1.3, 1.3, 1.4, 1.4, 1.4, 1.5, 1.5, 1.5, 1.5, 1.6, 1.6, 1.6, 1.7, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 1.9, 1.9, 1.9, 2.0, 2.0, 2.0, 2.1, 2.1, 2.1, 2.2, 2.2, 2.2, 2.3, 2.3, 2.3, 2.4, 2.4, 2.4],
    borovice: [0.4, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 0.8, 0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.3, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.8, 1.8, 1.9, 2.0, 2.0, 2.1, 2.2, 2.2, 2.3, 2.4, 2.5, 2.5, 2.6, 2.7, 2.8, 2.9, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.7, 3.8, 3.9],
    modrin: [2.0, 2.0, 2.0, 2.1, 2.1, 2.2, 2.2, 2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9, 3.0, 3.1, 3.1, 3.2, 3.3, 3.3, 3.4, 3.5, 3.5, 3.6, 3.7, 3.7, 3.8, 3.9, 3.9, 4.0, 4.1, 4.2, 4.2, 4.3, 4.4, 4.5, 4.5, 4.6, 4.7, 4.8, 4.9, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0],
    dub: [1.7, 1.8, 1.8, 1.9, 1.9, 2.0, 2.1, 2.1, 2.2, 2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9, 3.0, 3.0, 3.1, 3.2, 3.2, 3.3, 3.3, 3.4, 3.4, 3.5, 3.5, 3.6, 3.7, 3.7, 3.8, 3.8, 3.9, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2, 4.3, 4.4, 4.4, 4.5, 4.5, 4.6, 4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 5.0, 5.0, 5.1]
  };

  const sawKerfCm = 0.5;

  const state = {
    activeField: 'length',
    selectedSpecies: 'smrk',
    items: []
  };

  const formatVolume = (value) => `${Number(value || 0).toLocaleString('cs-CZ', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³`;
  const formatWeight = (value) => `${Math.round(Number(value || 0)).toLocaleString('cs-CZ')} kg`;
  const formatDate = (date) => date.toLocaleDateString('cs-CZ');
  const readNumber = (id) => Number(document.getElementById(id)?.value || 0);
  const readValue = (id) => document.getElementById(id)?.value || '';
  const densityFor = (species) => densities[species] || densities.smrk;
  const speciesLabel = (species) => speciesLabels[species] || speciesLabels.smrk;
  const toSafeNumber = (value) => Number(String(value ?? '').replace(',', '.').trim());
  const activeInputMap = {
    length: draftLengthInput,
    diameter: draftDiameterInput,
    count: draftCountInput
  };

  const normalizeSpecies = (value) => {
    const normalized = String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (normalized.includes('dub')) return 'dub';
    if (normalized.includes('modrin')) return 'modrin';
    if (normalized.includes('borov')) return 'borovice';
    return 'smrk';
  };

  const getMode = () => root.querySelector('.calc-tab.active')?.dataset.mode || 'kulatina';

  const calculateGrossVolume = (diameterCm, length, count) => {
    const radius = (diameterCm / 100) / 2;
    const grossSingle = Math.PI * radius * radius * length;
    return grossSingle * count;
  };

  const barkDeductionFor = (species, diameterCm) => {
    const table = barkDeductionTables[species] || barkDeductionTables.smrk;
    const roundedDiameter = Math.round(Number(diameterCm || 0));
    const clampedDiameter = Math.min(70, Math.max(10, roundedDiameter));
    return table[clampedDiameter - 10];
  };

  const calculateNetVolume = (diameterCm, length, count, species) => {
    const barkDeductionCm = barkDeductionFor(species, diameterCm);
    const netDiameterCm = Math.max(0, Number(diameterCm || 0) - barkDeductionCm);
    return calculateGrossVolume(netDiameterCm, length, count);
  };

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const getStackCutMode = () => stackCutModeInput?.value || 'edged';

  const syncStackMode = () => {
    const isNaOstro = getStackCutMode() === 'na-ostro';
    if (stackWidthLabel) stackWidthLabel.textContent = isNaOstro ? 'Tloušťka prkna (cm)' : 'Šířka trámu (cm)';
    if (stackHeightField) stackHeightField.hidden = isNaOstro;
    if (stackCountXField) stackCountXField.hidden = isNaOstro;
    if (stackCountYLabel) stackCountYLabel.textContent = isNaOstro ? 'Počet prken' : 'Kusy na výšku';
  };

  const getDraftValues = () => ({
    length: toSafeNumber(draftLengthInput?.value),
    diameter: toSafeNumber(draftDiameterInput?.value),
    count: toSafeNumber(draftCountInput?.value) || 0,
    species: state.selectedSpecies
  });

  const getDraftGross = () => {
    const draft = getDraftValues();
    if (draft.length <= 0 || draft.diameter <= 0 || draft.count <= 0) return 0;
    return calculateGrossVolume(draft.diameter, draft.length, draft.count);
  };

  const getDraftNet = () => {
    const draft = getDraftValues();
    if (draft.length <= 0 || draft.diameter <= 0 || draft.count <= 0) return 0;
    if (withoutBarkInput?.checked) {
      return calculateGrossVolume(draft.diameter, draft.length, draft.count);
    }
    return calculateNetVolume(draft.diameter, draft.length, draft.count, draft.species);
  };

  const syncFieldState = () => {
    fieldCards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.focusField === state.activeField);
    });
  };

  const setActiveField = (fieldName) => {
    state.activeField = fieldName;
    syncFieldState();
    root.dataset.keypad = 'visible';
    activeInputMap[fieldName]?.focus();
  };

  const hideKeypad = () => {
    root.dataset.keypad = 'hidden';
  };

  const syncSpeciesState = () => {
    speciesButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.species === state.selectedSpecies);
    });
  };

  const updateDraftDisplay = () => {
    const draft = getDraftValues();

    if (draftVolumeLabel) {
      draftVolumeLabel.textContent = formatVolume(getDraftNet());
    }

    syncFieldState();
    syncSpeciesState();
  };

  const renderLogRows = () => {
    if (!logRowsContainer || !logRowTemplate) return;
    logRowsContainer.innerHTML = '';

    state.items.forEach((item, index) => {
      const fragment = logRowTemplate.content.cloneNode(true);
      const row = fragment.querySelector('[data-log-row]');
      if (!row) return;

      row.dataset.index = String(index);
      const title = row.querySelector('[data-log-row-title]');
      const length = row.querySelector('[data-log-length]');
      const diameter = row.querySelector('[data-log-diameter]');
      const count = row.querySelector('[data-log-count]');
      const species = row.querySelector('[data-log-species]');
      const volume = row.querySelector('[data-log-row-volume]');

      if (title) title.textContent = `Kláda ${index + 1}`;
      if (length) length.textContent = `${String(item.length).replace('.', ',')} m`;
      if (diameter) diameter.textContent = `${String(item.diameter).replace('.', ',')} cm`;
      if (count) count.textContent = `${item.count} ks`;
      if (species) species.textContent = speciesLabel(item.species);
      if (volume) {
        volume.textContent = formatVolume(withoutBarkInput?.checked ? item.gross : item.net);
      }

      logRowsContainer.appendChild(row);
    });

    if (logListStats) {
      logListStats.textContent = state.items.length
        ? `${state.items.length} položek v seznamu`
        : 'Zatím bez klády';
    }
  };

  const renderResultLogTable = () => {
    if (!resultLogTableBody) return;

    resultLogTableBody.innerHTML = '';

    if (!state.items.length) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 6;
      emptyCell.className = 'result-log-empty';
      emptyCell.textContent = resultLogEmpty?.textContent || 'Zatim neni pridana zadna klada.';
      emptyRow.appendChild(emptyCell);
      resultLogTableBody.appendChild(emptyRow);
      return;
    }

    state.items.forEach((item, index) => {
      const row = document.createElement('tr');
      row.dataset.index = String(index);
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${String(item.length).replace('.', ',')} m</td>
        <td>${String(item.diameter).replace('.', ',')} cm</td>
        <td>${item.count} ks</td>
        <td>${Number(item.net || 0).toLocaleString('cs-CZ', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
        <td><button class="result-log-remove" type="button" data-remove-result-row aria-label="Smazat kladu">×</button></td>
      `;
      resultLogTableBody.appendChild(row);
    });
  };

  const renderBeamPreview = (preview) => {
    if (!beamPreviewCanvas) return;

    if (!preview || preview.minDiameter <= 0 || preview.totalWidth <= 0 || preview.totalHeight <= 0) {
      beamPreviewCanvas.innerHTML = '';
      if (beamPreviewLabel) beamPreviewLabel.textContent = 'Zadej rozmery';
      return;
    }

    const canvasSize = 320;
    const padding = 22;
    const available = canvasSize - (padding * 2);
    const scale = available / Math.max(preview.recommendedDiameter, preview.totalWidth, preview.totalHeight);
    const circleRadius = (preview.recommendedDiameter * scale) / 2;
    const innerCircleRadius = (preview.minDiameter * scale) / 2;
    const rectWidth = preview.width * scale;
    const rectHeight = preview.height * scale;
    const kerf = preview.sawKerfCm * scale;
    const blockWidth = preview.totalWidth * scale;
    const blockHeight = preview.totalHeight * scale;
    const center = canvasSize / 2;
    const originX = center - (blockWidth / 2);
    const originY = center - (blockHeight / 2);

    const pieces = [];
    for (let row = 0; row < preview.countY; row += 1) {
      for (let col = 0; col < preview.countX; col += 1) {
        const y = originY + (row * (rectHeight + kerf));
        let x = originX + (col * (rectWidth + kerf));
        let width = rectWidth;

        if (preview.cutMode === 'na-ostro') {
          const rowCenterY = y + (rectHeight / 2);
          const offsetFromCenter = Math.abs(rowCenterY - center);
          const chordWidth = offsetFromCenter >= innerCircleRadius
            ? 0
            : 2 * Math.sqrt((innerCircleRadius * innerCircleRadius) - (offsetFromCenter * offsetFromCenter));

          width = Math.max(0, chordWidth);
          x = center - (width / 2);
        }

        pieces.push(`
          <rect
            x="${x}"
            y="${y}"
            width="${width}"
            height="${rectHeight}"
            rx="4"
            fill="rgba(191, 142, 49, 0.72)"
            stroke="rgba(91, 61, 40, 0.45)"
            stroke-width="1.2"
          />
        `);
      }
    }

    beamPreviewCanvas.innerHTML = `
      <svg class="beam-preview-svg" viewBox="0 0 ${canvasSize} ${canvasSize}" role="img" aria-label="${escapeHtml(`${preview.pieceCount} ks v klade ${preview.recommendedDiameter} cm`)}">
        <circle cx="${center}" cy="${center}" r="${circleRadius}" fill="rgba(70, 87, 51, 0.12)" stroke="rgba(70, 87, 51, 0.65)" stroke-width="3" />
        <circle cx="${center}" cy="${center}" r="${innerCircleRadius}" fill="none" stroke="rgba(191, 142, 49, 0.6)" stroke-dasharray="5 5" stroke-width="2" />
        ${pieces.join('')}
      </svg>
    `;

    if (beamPreviewLabel) {
      beamPreviewLabel.textContent = preview.cutMode === 'na-ostro'
        ? `${preview.pieceCount} prken | na ostro | klada od ${preview.recommendedDiameter.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} cm`
        : `${preview.pieceCount} ks | ${preview.countX} x ${preview.countY} | klada od ${preview.recommendedDiameter.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} cm`;
    }
  };

  const parseImportText = (rawText) => rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = line.includes('\t')
        ? line.split('\t')
        : line.split(/[;,]/);

      return cells.map((cell) => cell.trim());
    })
    .map((cells) => {
      const diameter = toSafeNumber(cells[0]);
      const length = toSafeNumber(cells[1]);
      const count = cells[2] === undefined || cells[2] === '' ? 1 : toSafeNumber(cells[2]);
      const species = normalizeSpecies(cells[3] || 'smrk');

      if (diameter <= 0 || length <= 0 || count <= 0) {
        return null;
      }

      return {
        diameter,
        length,
        count,
        species,
        gross: calculateGrossVolume(diameter, length, count),
        net: calculateNetVolume(diameter, length, count, species)
      };
    })
    .filter(Boolean);

  const resetDraft = (values = {}) => {
    if (draftLengthInput) draftLengthInput.value = values.length ?? '';
    if (draftDiameterInput) draftDiameterInput.value = values.diameter ?? '';
    if (draftCountInput) draftCountInput.value = values.count ?? '1';
    state.selectedSpecies = values.species || 'smrk';
    state.activeField = values.activeField || 'length';
    updateDraftDisplay();
  };

  const addDraftRow = () => {
    const draft = getDraftValues();

    if (draft.length <= 0 || draft.diameter <= 0 || draft.count <= 0) {
      return;
    }

    state.items.push({
      ...draft,
      gross: calculateGrossVolume(draft.diameter, draft.length, draft.count),
      net: calculateNetVolume(draft.diameter, draft.length, draft.count, draft.species)
    });

    renderLogRows();
    renderResultLogTable();
    update();
    hideKeypad();
    resetDraft({
      length: draft.length,
      count: draft.count,
      species: draft.species,
      activeField: 'diameter'
    });
  };

  const clearRows = () => {
    state.items = [];
    renderLogRows();
    renderResultLogTable();
    update();
    resetDraft();
  };

  const buildLogResult = () => {
    const items = state.items;
    const gross = items.reduce((sum, item) => sum + item.gross, 0);
    const net = items.reduce((sum, item) => sum + (item.net || 0), 0);
    const withoutBarkDeduction = withoutBarkInput?.checked;
    const usable = withoutBarkDeduction ? gross : net;
    const weight = items.reduce((sum, item) => sum + ((withoutBarkDeduction ? item.gross : item.net || 0) * densityFor(item.species)), 0);
    const totalPieces = items.reduce((sum, item) => sum + item.count, 0);
    const itemLines = items.map((item, index) => (
      `${index + 1}. ${item.count} ks | ${item.length} m | prumer ${item.diameter} cm | ${speciesLabel(item.species)} | ${formatVolume(item.gross)}`
    ));

    const summaryLines = items.length
      ? [
        `Kulatina: ${items.length} radku / ${totalPieces} ks`,
        `Vzorec: V = pi * (d / 2)^2 * l, kde d je stredovy prumer v metrech`,
        '',
        'Polozky:',
        ...itemLines,
        '',
        `Hruby objem: ${formatVolume(gross)}`,
        `${withoutBarkDeduction ? 'Objem bez odectu kury' : 'Cisty objem'}: ${formatVolume(usable)}`,
        `Vysledny objem: ${formatVolume(usable)}`,
        `Orientacni hmotnost: ${formatWeight(weight)}`
      ]
      : [
        'Kulatina: zatim neni vyplnena zadna platna klada.',
        'Zadej prvni kladu pres velka pole nebo numerickou klavesnici dole.',
        '',
        `Hruby objem: ${formatVolume(gross)}`,
        `Cisty objem: ${formatVolume(net)}`,
        `Vysledny objem: ${formatVolume(usable)}`,
        `Orientacni hmotnost: ${formatWeight(weight)}`
      ];

    return {
      gross,
      net,
      usable,
      weight,
      grossLabel: 'Hruby objem',
      netLabel: withoutBarkDeduction ? 'Objem bez odectu kury' : 'Cisty objem',
      yieldLabel: 'Vyuzitelny objem',
      weightLabel: 'Odhad hmotnosti',
      grossDisplay: formatVolume(gross),
      netDisplay: formatVolume(usable),
      yieldDisplay: formatVolume(usable),
      weightDisplay: formatWeight(weight),
      totalPieces,
      title: 'Kulatina - rychle zadavani po jednotlivych kladach',
      text: items.length
        ? withoutBarkDeduction
          ? `Secteno ${items.length} radku a ${totalPieces} kusu bez odectu kury.`
          : `Secteno ${items.length} radku a ${totalPieces} kusu. Cisty objem je po odectu kury podle dreviny a stredove tloustky.`
        : withoutBarkDeduction
          ? 'Objem se pocita bez odectu kury. Zvol aktivni pole a zadej udaje o klade.'
          : 'Zvol aktivni pole, zadej delku, prumer a pocet kusu a pak kladu pridej tlacitkem plus.',
      summary: summaryLines.join('\n'),
      items
    };
  };

  const buildStackResult = () => {
    const cutMode = getStackCutMode();
    const isNaOstro = cutMode === 'na-ostro';
    const length = readNumber('stackLength');
    const width = readNumber('stackWidth');
    const height = isNaOstro ? width : readNumber('stackHeight');
    const allowance = readNumber('stackCoefficient');
    const countX = isNaOstro ? 1 : Math.max(1, Math.round(readNumber('stackCountX') || 1));
    const countY = Math.max(1, Math.round(readNumber('stackCountY') || 1));

    const totalWidth = (width * countX) + (Math.max(0, countX - 1) * sawKerfCm);
    const totalHeight = isNaOstro
      ? (width * countY) + (Math.max(0, countY - 1) * sawKerfCm)
      : (height * countY) + (Math.max(0, countY - 1) * sawKerfCm); 
    const pieceCount = countX * countY;
    const beamVolume = isNaOstro
      ? 0
      : (width / 100) * (height / 100) * length * pieceCount;
    const minDiameter = isNaOstro
      ? totalHeight
      : Math.sqrt((totalWidth * totalWidth) + (totalHeight * totalHeight));
    const recommendedDiameter = Math.ceil(minDiameter + allowance);
    const yieldRatio = minDiameter > 0
      ? ((totalWidth * totalHeight) / (Math.PI * Math.pow(minDiameter / 2, 2))) * 100
      : 0;

    return {
      gross: minDiameter,
      net: recommendedDiameter,
      usable: yieldRatio,
      weight: 0,
      grossLabel: 'Minimum na cepu',
      netLabel: 'Doporucit od',
      yieldLabel: isNaOstro ? 'Rez celkem' : 'Objem tramu',
      grossDisplay: `${minDiameter.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm`,
      netDisplay: `${recommendedDiameter.toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} cm`,
      yieldDisplay: isNaOstro
        ? `${(Math.max(0, countY - 1) * sawKerfCm).toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm`
        : `${formatVolume(beamVolume)}`,
      title: isNaOstro ? 'Prkna na ostro - potrebny prumer na cepu' : 'Tram z klady - potrebny prumer na tenkem konci',
      text: isNaOstro
        ? `Pocitano pro ${pieceCount} prken na ostro. Mezi kazdym rezem je automaticky mezera ${sawKerfCm.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm.`
        : `Pocitano pro ${pieceCount} ks v rozlozeni ${countX} x ${countY}. Mezi kazdym rezem je automaticky mezera ${sawKerfCm.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm. Viteznost prurezu je ${yieldRatio.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %.`,
      summary:
        isNaOstro
          ? `Prkna na ostro: ${pieceCount} ks, tloustka ${width} cm, delka ${length} m.\n`
          : `Tramky: ${pieceCount} ks, rozmer ${height} x ${width} cm, delka ${length} m.\n`
        + `Rozlozeni: ${countX} x ${countY}\n` +
        `Rez na kotouci: ${sawKerfCm.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm mezi kusy\n` +
        `Teoreticke minimum klady na cepu: ${minDiameter.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm\n` +
        `Doporuceny prumer s rezervou: ${recommendedDiameter.toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} cm\n` +
        (isNaOstro
          ? `Celkova vyska rezu: ${totalHeight.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm`
          : `Objem hotoveho tramu: ${formatVolume(beamVolume)}`),
      preview: {
        cutMode,
        width,
        height,
        countX,
        countY,
        pieceCount,
        sawKerfCm,
        totalWidth,
        totalHeight,
        minDiameter,
        recommendedDiameter
      }
    };
  };

  const update = () => {
    updateDraftDisplay();

    const mode = getMode();
    const result = mode === 'skladane'
      ? buildStackResult()
      : buildLogResult();

    if (labels.netLabel) labels.netLabel.textContent = result.netLabel || 'Cisty objem';
    if (labels.weightLabel) labels.weightLabel.textContent = result.weightLabel || 'Odhad hmotnosti';
    labels.net.textContent = result.netDisplay || formatVolume(result.net);
    labels.weight.textContent = result.weightDisplay || formatWeight(result.weight);
    renderBeamPreview(result.preview);
    labels.title.textContent = result.title;
    labels.text.textContent = result.text;
    if (topNetVolumeLabel) topNetVolumeLabel.textContent = result.netDisplay || formatVolume(result.net);
    if (topTotalPiecesLabel && result.totalPieces !== undefined) topTotalPiecesLabel.textContent = `${result.totalPieces} ks`;

    const showResultLog = mode === 'kulatina';
    const showWeightTile = mode === 'kulatina';
    if (resultLogTableWrap) resultLogTableWrap.hidden = !showResultLog;
    if (exportCsvButton) exportCsvButton.hidden = !showResultLog;
    if (exportPdfButton) exportPdfButton.hidden = !showResultLog;
    if (weightTile) weightTile.hidden = !showWeightTile;
  };

  const setMode = (mode) => {
    root.dataset.viewMode = mode;
    if (mode === 'zadavani') {
      hideKeypad();
    }
    tabs.forEach((tab) => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.modePanel !== mode;
    });

    if (mode === 'zadavani') {
      const kulatinaPanel = root.querySelector('[data-mode-panel="kulatina"]');
      if (kulatinaPanel) kulatinaPanel.hidden = false;
    }

    if (logListVolumeLabel) {
      logListVolumeLabel.textContent = withoutBarkInput?.checked ? 'Objem bez kůry' : 'Zadané položky';
    }
    renderLogRows();
    update();
  };

  const appendToActiveField = (value) => {
    const input = activeInputMap[state.activeField];
    if (!input) return;

    const next = String(input.value || '');
    if (value === ',' && next.includes(',')) return;
    input.value = `${next}${value}`;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handlePadAction = (action) => {
    const input = activeInputMap[state.activeField];
    if (!input) return;

    if (action === 'backspace') {
      input.value = String(input.value || '').slice(0, -1);
    }

    if (action === 'clear-field') {
      input.value = '';
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const triggerCsvDownload = () => {
    if (getMode() !== 'kulatina') {
      return;
    }

    const result = buildLogResult();
    const rows = [
      ['Polozka', 'Delka_m', 'Prumer_cm_v_kure', 'Pocet_ks', 'Cisty_objem_m3_bez_kury'],
      ...result.items.map((item, index) => [
        String(index + 1),
        String(item.length).replace('.', ','),
        String(item.diameter).replace('.', ','),
        String(item.count).replace('.', ','),
        Number(item.net || 0).toFixed(3).replace('.', ',')
      ])
    ];

    const csvContent = rows.map((row) => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kubirovacka-kulatina.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });

  fieldCards.forEach((card) => {
    card.addEventListener('click', () => setActiveField(card.dataset.focusField));
  });

  Object.entries(activeInputMap).forEach(([fieldName, input]) => {
    if (!input) return;

    input.addEventListener('focus', () => setActiveField(fieldName));
    input.addEventListener('input', () => updateDraftDisplay());
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      addDraftRow();
    });
  });

  speciesButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedSpecies = button.dataset.species || 'smrk';
      updateDraftDisplay();
    });
  });

  keypadButtons.forEach((button) => {
    if (button.dataset.key) {
      button.addEventListener('click', () => appendToActiveField(button.dataset.key));
    }

    if (button.dataset.action) {
      button.addEventListener('click', () => handlePadAction(button.dataset.action));
    }
  });

  root.addEventListener('input', (event) => {
    if (event.target.matches('#stackLength, #stackWidth, #stackHeight, #stackCoefficient, #stackCountX, #stackCountY, #stackCutMode')) {
      syncStackMode();
      update();
    }
  });

  root.addEventListener('change', (event) => {
    if (event.target.matches('select, input')) {
      if (event.target === withoutBarkInput) {
        renderLogRows();
      }
      update();
    }
  });

  if (addLogRowButton) {
    addLogRowButton.addEventListener('click', addDraftRow);
  }

  if (clearLogRowsButton) {
    clearLogRowsButton.addEventListener('click', clearRows);
  }

  if (cloneLastRowButton) {
    cloneLastRowButton.addEventListener('click', () => {
      const last = state.items[state.items.length - 1];
      if (!last) return;
      resetDraft(last);
    });
  }

  if (toggleImportButton && importDrawer) {
    toggleImportButton.addEventListener('click', () => {
      importDrawer.hidden = !importDrawer.hidden;
    });
  }

  if (logRowsContainer) {
    logRowsContainer.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-remove-log-row]');
      if (!removeButton) return;

      const row = removeButton.closest('[data-log-row]');
      const index = Number(row?.dataset.index);
      if (Number.isNaN(index)) return;

      state.items.splice(index, 1);
      renderLogRows();
      renderResultLogTable();
      update();
    });
  }

  if (resultLogTableBody) {
    resultLogTableBody.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-remove-result-row]');
      if (!removeButton) return;

      const row = removeButton.closest('tr');
      const index = Number(row?.dataset.index);
      if (Number.isNaN(index)) return;

      state.items.splice(index, 1);
      renderLogRows();
      renderResultLogTable();
      update();
    });
  }

  if (importExcelButton && excelPasteField) {
    importExcelButton.addEventListener('click', () => {
      const rows = parseImportText(excelPasteField.value);
      if (!rows.length) return;

      state.items = rows;
      renderLogRows();
      renderResultLogTable();
      update();
    });
  }

  if (csvImportInput) {
    csvImportInput.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const rows = parseImportText(text);
      if (rows.length) {
        state.items = rows;
        renderLogRows();
        renderResultLogTable();
        update();
      }

      csvImportInput.value = '';
    });
  }

  if (exportCsvButton) {
    exportCsvButton.addEventListener('click', triggerCsvDownload);
  }

  if (exportPdfButton) {
    exportPdfButton.addEventListener('click', () => window.print());
  }

  if (bottomNewEntryButton) {
    bottomNewEntryButton.addEventListener('click', () => {
      setMode('zadavani');
      resetDraft({ count: '1', species: state.selectedSpecies, activeField: 'length' });
    });
  }

  if (bottomShowListButton) {
    bottomShowListButton.addEventListener('click', () => {
      setMode('kulatina');
      logRowsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (bottomExportButton) {
    bottomExportButton.addEventListener('click', () => {
      if (getMode() === 'kulatina') triggerCsvDownload();
    });
  }

  if (calcDateLabel) {
    calcDateLabel.textContent = formatDate(new Date());
  }

  syncStackMode();
  resetDraft({
    length: '4',
    diameter: '28',
    count: '1',
    species: 'smrk'
  });
  renderLogRows();
  renderResultLogTable();
  setMode('kulatina');
  hideKeypad();
})();
