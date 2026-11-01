(function () {
  // Prvky zadávacích polí
  const lengthInput = document.getElementById('draftLength');
  const diameterInput = document.getElementById('draftDiameter');
  const labelDiameterField = document.getElementById('labelDiameterField');
  const jprlInput = document.getElementById('draftJprl');
  const countInput = document.getElementById('draftCount');
  const draftVolumeLabel = document.getElementById('draftVolume');
  const topTotalSummary = document.getElementById('topTotalSummary');
  const listTotalSummary = document.getElementById('listTotalSummary');
  const dateLabel = document.getElementById('calcDateLabel');
  const listDateLabel = document.getElementById('listDateLabel');

  // Přepínač Střed / Čep
  const btnMeasureMid = document.getElementById('btnMeasureMid');
  const btnMeasureTop = document.getElementById('btnMeasureTop');

  // Obalové buňky polí
  const cellLength = document.getElementById('cellLength');
  const cellDiameter = document.getElementById('cellDiameter');
  const cellJprl = document.getElementById('cellJprl');
  const cellCk = document.getElementById('cellCk');

  // Tlačítka klávesnice
  const btnFocusLength = document.getElementById('btnFocusLength');
  const btnFocusDiameter = document.getElementById('btnFocusDiameter');
  const btnOddenek = document.getElementById('btnOddenek');
  const oddenekIcon = document.getElementById('oddenekIcon');
  const speciesLabel = document.getElementById('speciesLabel');
  const jakostLabel = document.getElementById('jakostLabel');
  const modLabel = document.getElementById('modLabel');
  const btnBackspace = document.getElementById('btnBackspace');
  const addLogRowBtn = document.getElementById('addLogRow');

  // Obrazovky a záložky
  const screenEntry = document.getElementById('screenEntry');
  const screenList = document.getElementById('screenList');
  const screenSummary = document.getElementById('screenSummary');
  const tabs = Array.from(document.querySelectorAll('.tab-item'));
  const logItems = document.getElementById('logItems');

  // Prvky sumáře
  const sumarHeaderTotal = document.getElementById('sumarHeaderTotal');
  const sumarTotalVolume = document.getElementById('sumarTotalVolume');
  const sumarTotalCount = document.getElementById('sumarTotalCount');
  const sumarOddenkyCount = document.getElementById('sumarOddenkyCount');
  const sumarTotalPrice = document.getElementById('sumarTotalPrice');
  const sumarSpeciesRows = document.getElementById('sumarSpeciesRows');
  const btnOpenPrices = document.getElementById('btnOpenPrices');

  // Spodní navigační lišta
  const btnBottomNew = document.getElementById('btnBottomNew');
  const btnBottomList = document.getElementById('btnBottomList');
  const btnBottomSend = document.getElementById('btnBottomSend');

  // Modální picker
  const pickerModal = document.getElementById('pickerModal');
  const pickerOptions = document.getElementById('pickerOptions');
  const btnSpecies = document.getElementById('btnSpecies');
  const btnJakost = document.getElementById('btnJakost');
  const btnMod = document.getElementById('btnMod');

  // Modální ceník dřevin
  const pricesModal = document.getElementById('pricesModal');
  const pricesListInputs = document.getElementById('pricesListInputs');
  const btnSavePrices = document.getElementById('btnSavePrices');

  // Modální exportní dialog (Odeslat)
  const exportModal = document.getElementById('exportModal');
  const exportFileName = document.getElementById('exportFileName');
  const exportDefaultPrice = document.getElementById('exportDefaultPrice');
  const btnExportCancel = document.getElementById('btnExportCancel');
  const btnExportCreate = document.getElementById('btnExportCreate');
  const btnAppMenu = document.getElementById('btnAppMenu');

  // Vnitřní stavy
  let items = [];
  let activeInput = lengthInput;
  let isOddenek = false;
  let currentSpecies = 'Smrk';
  let currentJakost = 'I';
  let currentMod = 'Kulatina';
  let measurePoint = 'stred'; // "stred" nebo "cep"

  // Výchozí ceník dřevin v Kč / m³
  let speciesPrices = {
    'Smrk': 2200,
    'Jedle': 2100,
    'Borovice': 2000,
    'Modřín': 3100,
    'Dub': 6500,
    'Buk': 2400,
    'Jasan': 3800,
    'Javor': 3000,
    'Lípa': 2300,
    'Olše': 2000,
    'Bříza': 1900,
    'Akát': 3200,
    'Třešeň': 4500,
    'Ořešák': 6000
  };

  const SPECIES_LIST = [
    'Akát', 'Borovice', 'Bříza', 'Buk', 'Dub', 'Jasan', 'Jilm',
    'Jabloň', 'Javor', 'Jeřáb', 'Jírovec', 'Habr', 'Hrušeň',
    'Lípa', 'Modřín', 'Olše', 'Osika', 'Ořešák', 'Platan',
    'Slivoň', 'Smrk', 'Švestka', 'Topol', 'Třešeň', 'Vrba', 'Jedle'
  ];
  const JAKOST_LIST = ['I - Jakost', 'II - Jakost', 'III - Jakost', 'IV - Jakost', 'V - Jakost', 'VI - Jakost'];
  const MOD_LIST = ['Kulatina', 'Kulatina bez kůry', 'Na stojato', 'Surák'];

  const parseNum = (val) => Number(String(val || '').replace(',', '.')) || 0;
  const formatVol = (val) => Number(val || 0).toFixed(2).replace('.', ',') + ' m³';

  const vibrate = (ms = 12) => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (_) {}
    }
  };

  // Ukládání a načítání z localStorage
  const saveState = () => {
    try {
      const payload = {
        items,
        currentSpecies,
        currentJakost,
        currentMod,
        measurePoint,
        speciesPrices,
        defaultPrice: exportDefaultPrice ? exportDefaultPrice.value : 2200,
        jprl: jprlInput ? jprlInput.value : '',
        ck: countInput ? countInput.value : ''
      };
      localStorage.setItem('kubiracka_data_v2', JSON.stringify(payload));
    } catch (_) {}
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem('kubiracka_data_v2');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.items)) items = data.items;
      if (data.currentSpecies) {
        currentSpecies = data.currentSpecies;
        if (speciesLabel) speciesLabel.textContent = currentSpecies;
      }
      if (data.currentJakost) {
        currentJakost = data.currentJakost;
        if (jakostLabel) jakostLabel.textContent = currentJakost;
      }
      if (data.currentMod) {
        currentMod = data.currentMod;
        if (modLabel) modLabel.textContent = currentMod.split(' ')[0];
      }
      if (data.measurePoint) {
        setMeasurePoint(data.measurePoint);
      }
      if (data.speciesPrices) {
        speciesPrices = Object.assign(speciesPrices, data.speciesPrices);
      }
      if (data.defaultPrice && exportDefaultPrice) {
        exportDefaultPrice.value = data.defaultPrice;
      }
      if (data.jprl && jprlInput) jprlInput.value = data.jprl;
      if (data.ck && countInput) countInput.value = data.ck;
    } catch (_) {}
  };

  // Přepínání Střed / Čep
  const setMeasurePoint = (mode) => {
    measurePoint = mode;
    if (btnMeasureMid) btnMeasureMid.classList.toggle('active', mode === 'stred');
    if (btnMeasureTop) btnMeasureTop.classList.toggle('active', mode === 'cep');
    if (labelDiameterField) {
      labelDiameterField.textContent = mode === 'cep' ? 'Čep[cm]' : 'Průměr[cm]';
    }
    updateDraft();
    saveState();
  };

  if (btnMeasureMid) btnMeasureMid.addEventListener('click', () => { vibrate(); setMeasurePoint('stred'); });
  if (btnMeasureTop) btnMeasureTop.addEventListener('click', () => { vibrate(); setMeasurePoint('cep'); });

  // Srážka kůry podle tabulek ČSN
  const getBarkDeduction = (species, diameter) => {
    if (currentMod === 'Kulatina bez kůry') return 0;
    const s = (species || '').toLowerCase();
    let coefficients;

    if (s.includes('smrk') || s.includes('jedle')) {
      coefficients = [0.57723, 0.006897, 1.3123];
    } else if (s.includes('borovice')) {
      coefficients = [0.24017, 0.001915, 1.7866];
    } else if (s.includes('modřín')) {
      coefficients = [1.7015, 0.008762, 1.4568];
    } else if (
      s.includes('buk') || s.includes('javor') || s.includes('habr') ||
      s.includes('jeřáb') || s.includes('lípa') || s.includes('osika') ||
      s.includes('platan') || s.includes('švest') || s.includes('slivoň') ||
      s.includes('třešeň') || s.includes('hrušeň') || s.includes('jabloň')
    ) {
      coefficients = [-0.04088, 0.16634, 0.56076];
    } else if (
      s.includes('dub') || s.includes('jasan') || s.includes('olše') ||
      s.includes('jilm') || s.includes('akát') || s.includes('bříza') ||
      s.includes('vrba') || s.includes('jírovec') || s.includes('topol') ||
      s.includes('ořešák')
    ) {
      coefficients = [1.2474, 0.042323, 1.0623];
    }

    if (!coefficients) return 0;
    const [p0, p1, p2] = coefficients;
    const add = ((s.includes('ořešák') || s.includes('jabloň')) && diameter > 41) ? 1 : 0;
    return Math.max(0, p0 + p1 * Math.pow(diameter, p2) + add);
  };

  // Výpočet objemu: pokud je měřen čep, dopočte se střed sbíhavostí 1 cm/m
  const calcRowVolume = (length, inputDiameter, species, point) => {
    if (length <= 0 || inputDiameter <= 0) return 0;

    let midDiameterWithBark = inputDiameter;
    if (point === 'cep') {
      midDiameterWithBark = inputDiameter + (length / 2) * 1.0;
    }

    const bark = getBarkDeduction(species || currentSpecies, midDiameterWithBark);
    const effMidDiameter = Math.max(1, midDiameterWithBark - bark);
    const radiusMeters = effMidDiameter / 200;
    return Math.PI * radiusMeters * radiusMeters * length;
  };

  const updateDraft = () => {
    if (!draftVolumeLabel || !lengthInput || !diameterInput) return;
    const l = parseNum(lengthInput.value);
    const d = parseNum(diameterInput.value);
    draftVolumeLabel.textContent = formatVol(calcRowVolume(l, d, currentSpecies, measurePoint));
  };

  const updateTotals = () => {
    const totalVol = items.reduce((sum, it) => sum + it.volume, 0);
    const totalCount = items.length;
    const str = `${totalVol.toFixed(2).replace('.', ',')} m³ | ${totalCount}ks`;
    if (topTotalSummary) topTotalSummary.textContent = str;
    if (listTotalSummary) listTotalSummary.textContent = str;
    renderSummary();
    saveState();
  };

  // Vykreslení SUMÁŘE
  const renderSummary = () => {
    if (!screenSummary) return;

    const totalVol = items.reduce((sum, it) => sum + it.volume, 0);
    const totalCount = items.length;
    const totalOddenky = items.filter(it => it.isOddenek).length;

    let totalCalculatedPrice = 0;
    items.forEach(it => {
      const p = speciesPrices[it.species] || parseNum(exportDefaultPrice ? exportDefaultPrice.value : 2200);
      totalCalculatedPrice += it.volume * p;
    });

    if (sumarHeaderTotal) sumarHeaderTotal.textContent = formatVol(totalVol);
    if (sumarTotalVolume) sumarTotalVolume.textContent = formatVol(totalVol);
    if (sumarTotalCount) sumarTotalCount.textContent = `${totalCount} ks`;
    if (sumarOddenkyCount) sumarOddenkyCount.textContent = `${totalOddenky} ks`;
    if (sumarTotalPrice) {
      sumarTotalPrice.textContent = totalCalculatedPrice > 0
        ? `${Math.round(totalCalculatedPrice).toLocaleString('cs-CZ')} Kč`
        : '0 Kč';
    }

    if (!sumarSpeciesRows) return;
    if (items.length === 0) {
      sumarSpeciesRows.innerHTML = '<tr><td colspan="4" class="text-center muted">Žádné zadané položky</td></tr>';
      return;
    }

    const map = {};
    items.forEach(it => {
      const sp = it.species || 'Nespecifikováno';
      if (!map[sp]) map[sp] = { count: 0, volume: 0 };
      map[sp].count += 1;
      map[sp].volume += it.volume;
    });

    sumarSpeciesRows.innerHTML = Object.entries(map).map(([sp, data]) => {
      const spPrice = speciesPrices[sp] || parseNum(exportDefaultPrice ? exportDefaultPrice.value : 2200);
      const rowPrice = data.volume * spPrice;
      return `
        <tr>
          <td><strong>${sp}</strong><br><small class="muted">${spPrice} Kč/m³</small></td>
          <td class="text-right">${data.count} ks</td>
          <td class="text-right"><strong>${data.volume.toFixed(2).replace('.', ',')} m³</strong></td>
          <td class="text-right">${Math.round(rowPrice).toLocaleString('cs-CZ')} Kč</td>
        </tr>
      `;
    }).join('');
  };

  // Aktivní pole
  const setActiveField = (field) => {
    if (!field) return;
    activeInput = field;

    if (field === lengthInput || field === diameterInput) {
      field.value = '';
      updateDraft();
    }

    [cellLength, cellDiameter, cellJprl, cellCk].forEach(c => c && c.classList.remove('is-active'));
    if (btnFocusLength) btnFocusLength.classList.remove('is-highlighted');
    if (btnFocusDiameter) btnFocusDiameter.classList.remove('is-highlighted');

    if (field === lengthInput) {
      if (cellLength) cellLength.classList.add('is-active');
      if (btnFocusLength) btnFocusLength.classList.add('is-highlighted');
    } else if (field === diameterInput) {
      if (cellDiameter) cellDiameter.classList.add('is-active');
      if (btnFocusDiameter) btnFocusDiameter.classList.add('is-highlighted');
    } else if (field === jprlInput) {
      if (cellJprl) cellJprl.classList.add('is-active');
    } else if (field === countInput) {
      if (cellCk) cellCk.classList.add('is-active');
    }
  };

  if (cellLength && lengthInput) cellLength.addEventListener('click', () => { vibrate(); setActiveField(lengthInput); });
  if (cellDiameter && diameterInput) cellDiameter.addEventListener('click', () => { vibrate(); setActiveField(diameterInput); });
  if (cellJprl && jprlInput) cellJprl.addEventListener('click', () => { vibrate(); setActiveField(jprlInput); });
  if (cellCk && countInput) cellCk.addEventListener('click', () => { vibrate(); setActiveField(countInput); });

  if (jprlInput) jprlInput.addEventListener('input', saveState);
  if (countInput) countInput.addEventListener('input', saveState);

  if (btnFocusLength && lengthInput) btnFocusLength.addEventListener('click', () => { vibrate(); setActiveField(lengthInput); });
  if (btnFocusDiameter && diameterInput) btnFocusDiameter.addEventListener('click', () => { vibrate(); setActiveField(diameterInput); });

  // Číselná klávesnice
  document.querySelectorAll('.key-digit, .key-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      vibrate();
      if (!activeInput) return;
      const key = btn.dataset.key;
      let cur = activeInput.value;
      if (key === '.' && cur.includes('.')) return;
      activeInput.value = cur + key;
      updateDraft();
    });
  });

  if (btnBackspace) {
    btnBackspace.addEventListener('click', () => {
      vibrate();
      if (!activeInput) return;
      activeInput.value = activeInput.value.slice(0, -1);
      updateDraft();
    });
  }

  if (btnOddenek && oddenekIcon) {
    btnOddenek.addEventListener('click', () => {
      vibrate();
      isOddenek = !isOddenek;
      oddenekIcon.textContent = isOddenek ? '☑' : '□';
      btnOddenek.classList.toggle('is-highlighted', isOddenek);
    });
  }

  // Přidání klády (+)
  if (addLogRowBtn && lengthInput && diameterInput) {
    addLogRowBtn.addEventListener('click', () => {
      vibrate(25);
      const l = parseNum(lengthInput.value);
      const d = parseNum(diameterInput.value);
      if (l <= 0 || d <= 0) {
        if (l <= 0) setActiveField(lengthInput);
        else setActiveField(diameterInput);
        return;
      }

      let midWithBark = d;
      if (measurePoint === 'cep') {
        midWithBark = d + (l / 2) * 1.0;
      }

      const vol = calcRowVolume(l, d, currentSpecies, measurePoint);
      const bark = getBarkDeduction(currentSpecies, midWithBark);
      const spPrice = speciesPrices[currentSpecies] || parseNum(exportDefaultPrice ? exportDefaultPrice.value : 2200);

      items.push({
        num: items.length + 1,
        volume: vol,
        length: l,
        inputDiameter: d,
        measurePoint: measurePoint,
        midDiameter: Number(midWithBark.toFixed(1)),
        bark: Number(bark.toFixed(1)),
        effDiameter: Number(Math.max(1, midWithBark - bark).toFixed(1)),
        species: currentSpecies,
        jakost: currentJakost,
        pricePerM3: spPrice,
        isOddenek: isOddenek,
        jprl: jprlInput ? jprlInput.value : '',
        ck: countInput ? countInput.value : String(items.length + 1)
      });

      diameterInput.value = '';
      if (countInput) countInput.value = String(items.length + 1);
      updateDraft();
      updateTotals();
      renderList();
      setActiveField(diameterInput);
    });
  }

  // Seznam klád (Kulatina)
  const renderList = () => {
    if (!logItems) return;
    logItems.innerHTML = '';
    items.forEach((item, idx) => {
      const row = document.createElement('article');
      row.className = 'log-row';
      const oddenekMark = item.isOddenek ? '<span class="log-tag">x</span>' : '';
      const pointMark = item.measurePoint === 'cep' ? ' (čep)' : '';
      row.innerHTML = `
        <div class="log-main-info">
          <span class="log-num">${idx + 1} ${oddenekMark}</span>
          <span class="log-vol">${formatVol(item.volume)}</span>
        </div>
        <div class="log-details">${item.species}, ${item.length.toFixed(1)}m, ${item.inputDiameter}cm${pointMark}, ${item.jakost}</div>
        <button type="button" class="log-del-btn" data-index="${idx}" aria-label="Smazat položku">
          <svg viewBox="0 0 24 24" class="trash-icon">
            <path d="M 5 6 L 19 6 L 17.5 21 L 6.5 21 Z" fill="none" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
            <path d="M 9 6 L 9 3 L 15 3 L 15 6" fill="none" stroke="currentColor" stroke-width="2"/>
            <line x1="9.5" y1="10.5" x2="14.5" y2="15.5" stroke="currentColor" stroke-width="2"/>
            <line x1="14.5" y1="10.5" x2="9.5" y2="15.5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      `;
      logItems.appendChild(row);
    });
  };

  if (logItems) {
    logItems.addEventListener('click', (e) => {
      const btn = e.target.closest('.log-del-btn');
      if (!btn) return;
      vibrate();
      const idx = Number(btn.dataset.index);
      items.splice(idx, 1);
      renderList();
      updateTotals();
    });
  }

  // Přepínání obrazovek
  const setScreen = (mode) => {
    [screenEntry, screenList, screenSummary].forEach(s => s && s.classList.remove('active'));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === mode));

    if (btnBottomNew) btnBottomNew.classList.toggle('active', mode === 'zadavani');
    if (btnBottomList) btnBottomList.classList.toggle('active', mode === 'kulatina');

    if (mode === 'kulatina') {
      if (screenList) screenList.classList.add('active');
      renderList();
    } else if (mode === 'sumar') {
      if (screenSummary) screenSummary.classList.add('active');
      renderSummary();
    } else {
      if (screenEntry) screenEntry.classList.add('active');
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vibrate();
      const target = tab.dataset.tab;
      if (target === 'kulatina') setScreen('kulatina');
      else if (target === 'sumar') setScreen('sumar');
      else setScreen('zadavani');
    });
  });

  if (btnBottomNew) btnBottomNew.addEventListener('click', () => { vibrate(); setScreen('zadavani'); });
  if (btnBottomList) btnBottomList.addEventListener('click', () => { vibrate(); setScreen('kulatina'); });

  // Dialog ceníku dřevin
  const renderPriceInputs = () => {
    if (!pricesListInputs) return;
    pricesListInputs.innerHTML = SPECIES_LIST.map(sp => {
      const val = speciesPrices[sp] || parseNum(exportDefaultPrice ? exportDefaultPrice.value : 2200);
      return `
        <div class="price-row-item">
          <label for="price_${sp}">${sp}</label>
          <input type="number" id="price_${sp}" data-species-price="${sp}" value="${val}" step="50" min="0">
        </div>
      `;
    }).join('');
  };

  const openPricesDialog = () => {
    renderPriceInputs();
    if (pricesModal) pricesModal.hidden = false;
  };

  if (btnOpenPrices) btnOpenPrices.addEventListener('click', openPricesDialog);

  if (btnSavePrices) {
    btnSavePrices.addEventListener('click', () => {
      vibrate();
      document.querySelectorAll('[data-species-price]').forEach(inp => {
        const sp = inp.dataset.speciesPrice;
        const val = parseNum(inp.value);
        if (val >= 0) speciesPrices[sp] = val;
      });
      if (pricesModal) pricesModal.hidden = true;
      saveState();
      renderSummary();
    });
  }

  if (pricesModal) {
    pricesModal.addEventListener('click', (e) => {
      if (e.target === pricesModal) pricesModal.hidden = true;
    });
  }

  // Modální picker (Dřeviny, Jakost, Mód)
  const openPicker = (list, onSelect) => {
    if (!pickerOptions || !pickerModal) return;
    pickerOptions.innerHTML = '';
    list.forEach(val => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'picker-item';
      btn.textContent = val;
      btn.addEventListener('click', () => {
        vibrate();
        onSelect(val);
        pickerModal.hidden = true;
        saveState();
      });
      pickerOptions.appendChild(btn);
    });
    pickerModal.hidden = false;
  };

  if (pickerModal) {
    pickerModal.addEventListener('click', (e) => {
      if (e.target === pickerModal) pickerModal.hidden = true;
    });
  }

  if (btnSpecies) {
    btnSpecies.addEventListener('click', () => {
      vibrate();
      openPicker(SPECIES_LIST, (val) => {
        currentSpecies = val;
        if (speciesLabel) speciesLabel.textContent = val;
        updateDraft();
      });
    });
  }

  if (btnJakost) {
    btnJakost.addEventListener('click', () => {
      vibrate();
      openPicker(JAKOST_LIST, (val) => {
        currentJakost = val.split(' ')[0];
        if (jakostLabel) jakostLabel.textContent = currentJakost;
      });
    });
  }

  if (btnMod) {
    btnMod.addEventListener('click', () => {
      vibrate();
      openPicker(MOD_LIST, (val) => {
        currentMod = val;
        if (modLabel) modLabel.textContent = val.split(' ')[0];
        updateDraft();
      });
    });
  }

  // Export do CSV
  const exportToCsv = (filename, defaultP) => {
    if (items.length === 0) {
      alert('V seznamu není žádná kláda k exportu.');
      return;
    }

    const headers = [
      'Pořadí',
      'Č.k.',
      'Dřevina',
      'Měření',
      'Délka (m)',
      'Naměřený průměr (cm)',
      'Středový průměr s kůrou (cm)',
      'Srážka kůry (cm)',
      'Čistý průměr bez kůry (cm)',
      'Jakost',
      'Oddenek',
      'JPRL',
      'Objem (m3)',
      'Cena za m3 (Kč)',
      'Celkem cena (Kč)'
    ];

    let grandPrice = 0;
    const rows = items.map((it, idx) => {
      const p = it.pricePerM3 || speciesPrices[it.species] || defaultP;
      const rowPrice = it.volume * p;
      grandPrice += rowPrice;
      return [
        idx + 1,
        `"${it.ck || idx + 1}"`,
        `"${it.species}"`,
        it.measurePoint === 'cep' ? 'ČEP' : 'STŘED',
        it.length.toFixed(1).replace('.', ','),
        it.inputDiameter,
        it.midDiameter.toString().replace('.', ','),
        (it.bark || 0).toString().replace('.', ','),
        (it.effDiameter || it.inputDiameter).toString().replace('.', ','),
        `"${it.jakost}"`,
        it.isOddenek ? 'ANO' : 'NE',
        `"${it.jprl || ''}"`,
        it.volume.toFixed(3).replace('.', ','),
        p.toString().replace('.', ','),
        rowPrice.toFixed(2).replace('.', ',')
      ].join(';');
    });

    const totalVol = items.reduce((sum, it) => sum + it.volume, 0);
    const summaryRow = [
      'CELKEM',
      `${items.length} ks`,
      '', '', '', '', '', '', '', '', '', '',
      totalVol.toFixed(3).replace('.', ','),
      '',
      grandPrice.toFixed(2).replace('.', ',')
    ].join(';');

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows, summaryRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename || 'kubirovani'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Exportní dialog (Odeslat)
  if (btnBottomSend && exportModal) {
    btnBottomSend.addEventListener('click', () => {
      vibrate();
      if (exportFileName && dateLabel) exportFileName.value = dateLabel.textContent;
      exportModal.hidden = false;
    });
  }

  if (btnExportCancel && exportModal) {
    btnExportCancel.addEventListener('click', () => {
      vibrate();
      exportModal.hidden = true;
    });
  }

  if (btnExportCreate && exportModal) {
    btnExportCreate.addEventListener('click', () => {
      vibrate(20);
      const fn = (exportFileName && exportFileName.value.trim()) || (dateLabel ? dateLabel.textContent : 'export');
      const defP = exportDefaultPrice ? parseNum(exportDefaultPrice.value) : 2200;
      exportModal.hidden = true;
      exportToCsv(fn, defP);
      saveState();
      setScreen('kulatina');
    });
  }

  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) exportModal.hidden = true;
    });
  }

  // Horní menu (tři tečky) -> Ceník a Smazání zakázky
  if (btnAppMenu) {
    btnAppMenu.addEventListener('click', () => {
      vibrate();
      const choice = confirm("Vyberte akci:\n\nOK = Upravit ceník dřevin\nStorno = Začít novou zakázku (smazat data)");
      if (choice) {
        openPricesDialog();
      } else {
        if (confirm('Opravdu chcete smazat všechny zadané klády a vyčistit zakázku?')) {
          items.length = 0;
          if (countInput) countInput.value = '1';
          if (lengthInput) lengthInput.value = '';
          if (diameterInput) diameterInput.value = '';
          updateDraft();
          updateTotals();
          renderList();
          setActiveField(lengthInput);
          setScreen('zadavani');
        }
      }
    });
  }

  // Inicializace
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  if (dateLabel) dateLabel.textContent = dateStr;
  if (listDateLabel) listDateLabel.textContent = dateStr;

  loadState();
  if (lengthInput) setActiveField(lengthInput);
  updateDraft();
  updateTotals();
  renderList();
})();