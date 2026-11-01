(function () {
  // Prvky zadávacích polí
  const lengthInput = document.getElementById('draftLength');
  const diameterInput = document.getElementById('draftDiameter');
  const jprlInput = document.getElementById('draftJprl');
  const countInput = document.getElementById('draftCount');
  const draftVolumeLabel = document.getElementById('draftVolume');
  const topTotalSummary = document.getElementById('topTotalSummary');
  const listTotalSummary = document.getElementById('listTotalSummary');
  const dateLabel = document.getElementById('calcDateLabel');
  const listDateLabel = document.getElementById('listDateLabel');

  // Obalové buňky polí pro vizuální zvýraznění (zlatá linka)
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

  // Obrazovky a záložky
  const screenEntry = document.getElementById('screenEntry');
  const screenList = document.getElementById('screenList');
  const tabs = document.querySelectorAll('.tab-item');
  const logItems = document.getElementById('logItems');

  // Spodní navigační lišta
  const btnBottomNew = document.getElementById('btnBottomNew');
  const btnBottomList = document.getElementById('btnBottomList');
  const btnBottomSend = document.getElementById('btnBottomSend');

  // Modální picker (Dřevina, Jakost, Mód)
  const pickerModal = document.getElementById('pickerModal');
  const pickerOptions = document.getElementById('pickerOptions');

  // Modální exportní dialog (Odeslat)
  const exportModal = document.getElementById('exportModal');
  const exportFileName = document.getElementById('exportFileName');
  const exportPrice = document.getElementById('exportPrice');
  const btnExportCancel = document.getElementById('btnExportCancel');
  const btnExportCreate = document.getElementById('btnExportCreate');

  // Vnitřní stavy
  const items = [];
  let activeInput = lengthInput;
  let isOddenek = false;
  let currentSpecies = 'Smrk';
  let currentJakost = 'I';
  let currentMod = 'Kulatina'; // "Kulatina", "Kulatina bez kůry", "Na stojato", "Surák"

  // Číselníky pro dialogy
  const SPECIES_LIST = [
    'Akát', 'Borovice', 'Bříza', 'Buk', 'Dub', 'Jasan', 'Jilm',
    'Jabloň', 'Javor', 'Jeřáb', 'Jírovec', 'Habr', 'Hrušeň',
    'Lípa', 'Modřín', 'Olše', 'Osika', 'Ořešák', 'Platan',
    'Slivoň', 'Smrk', 'Švestka', 'Topol', 'Třešeň', 'Vrba', 'Jedle'
  ];
  const JAKOST_LIST = ['I - Jakost', 'II - Jakost', 'III - Jakost', 'IV - Jakost', 'V - Jakost', 'VI - Jakost'];
  const MOD_LIST = ['Kulatina', 'Kulatina bez kůry', 'Na stojato', 'Surák'];

  const parseNum = (val) => Number(String(val || '').replace(',', '.')) || 0;
  const formatVol = (val) => val.toFixed(2).replace('.', ',') + ' m³';

  // Celková tloušťka odečtu kůry (2k) podle koeficientů z tabulek.
  const getBarkDeduction = (species, diameter) => {
    if (currentMod === 'Kulatina bez kůry') {
      return 0;
    }

    const s = (species || '').toLowerCase();
    let coefficients;

    if (s.includes('smrk') || s.includes('jedle')) {
      coefficients = [0.57723, 0.006897, 1.3123];
    } else if (s.includes('borovice')) {
      coefficients = [0.24017, 0.001915, 1.7866];
    } else if (s.includes('modřín')) {
      coefficients = [1.7015, 0.008762, 1.4568];
    } else if (
      s.includes('buk') ||
      s.includes('javor') ||
      s.includes('habr') ||
      s.includes('jeřáb') ||
      s.includes('lípa') ||
      s.includes('osika') ||
      s.includes('platan') ||
      s.includes('švest') ||
      s.includes('slivoň') ||
      s.includes('třešeň') ||
      s.includes('hrušeň') ||
      s.includes('jabloň')
    ) {
      coefficients = [-0.04088, 0.16634, 0.56076];
    } else if (
      s.includes('dub') ||
      s.includes('jasan') ||
      s.includes('olše') ||
      s.includes('jilm') ||
      s.includes('akát') ||
      s.includes('bříza') ||
      s.includes('vrba') ||
      s.includes('jírovec') ||
      s.includes('topol') ||
      s.includes('ořešák')
    ) {
      coefficients = [1.2474, 0.042323, 1.0623];
    }

    if (!coefficients) {
      return 0;
    }

    const [p0, p1, p2] = coefficients;
    const additionalDeduction = (
      (s.includes('ořešák') || s.includes('jabloň')) &&
      diameter > 41
    ) ? 1 : 0;
    return Math.max(0, p0 + p1 * Math.pow(diameter, p2) + additionalDeduction);
  };

  // Výpočet objemu podle Huberova vzorce z průměru bez kůry
  const calcRowVolume = (length, diameter, species) => {
    if (length <= 0 || diameter <= 0) return 0;
    const bark = getBarkDeduction(species || currentSpecies, diameter);
    const effDiameter = Math.max(1, diameter - bark);
    const radiusMeters = effDiameter / 200;
    return Math.PI * radiusMeters * radiusMeters * length;
  };

  const updateDraft = () => {
    const l = parseNum(lengthInput.value);
    const d = parseNum(diameterInput.value);
    draftVolumeLabel.textContent = formatVol(calcRowVolume(l, d, currentSpecies));
  };

  const updateTotals = () => {
    const totalVol = items.reduce((sum, it) => sum + it.volume, 0);
    const totalCount = items.length;
    const str = `${totalVol.toFixed(2).replace('.', ',')} m³ | ${totalCount}ks`;
    topTotalSummary.textContent = str;
    listTotalSummary.textContent = str;
  };

  // Přepnutí aktivního pole + automatické vymazání délky/průměru při překliku
  const setActiveField = (field) => {
    activeInput = field;

    if (field === lengthInput || field === diameterInput) {
      field.value = '';
      updateDraft();
    }

    [cellLength, cellDiameter, cellJprl, cellCk].forEach(c => c.classList.remove('is-active'));
    btnFocusLength.classList.remove('is-highlighted');
    btnFocusDiameter.classList.remove('is-highlighted');

    if (field === lengthInput) {
      cellLength.classList.add('is-active');
      btnFocusLength.classList.add('is-highlighted');
    } else if (field === diameterInput) {
      cellDiameter.classList.add('is-active');
      btnFocusDiameter.classList.add('is-highlighted');
    } else if (field === jprlInput) {
      cellJprl.classList.add('is-active');
    } else if (field === countInput) {
      cellCk.classList.add('is-active');
    }
  };

  // Kliknutí do bílé zadávací karty
  cellLength.addEventListener('click', () => setActiveField(lengthInput));
  cellDiameter.addEventListener('click', () => setActiveField(diameterInput));
  cellJprl.addEventListener('click', () => setActiveField(jprlInput));
  cellCk.addEventListener('click', () => setActiveField(countInput));

  // Tlačítka Délka a Průměr na klávesnici
  btnFocusLength.addEventListener('click', () => setActiveField(lengthInput));
  btnFocusDiameter.addEventListener('click', () => setActiveField(diameterInput));

  // Zadávání číslic 0-9 a tečky přes klávesnici
  document.querySelectorAll('.key-digit, .key-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeInput) return;
      const key = btn.dataset.key;
      let cur = activeInput.value;
      if (key === '.' && cur.includes('.')) return;
      activeInput.value = cur + key;
      updateDraft();
    });
  });

  // Přepínač Oddenek
  btnOddenek.addEventListener('click', () => {
    isOddenek = !isOddenek;
    oddenekIcon.textContent = isOddenek ? '☑' : '□';
    btnOddenek.classList.toggle('is-highlighted', isOddenek);
  });

  // Tlačítko + (Přidání klády do seznamu)
  document.getElementById('addLogRow').addEventListener('click', () => {
    const l = parseNum(lengthInput.value);
    const d = parseNum(diameterInput.value);
    if (l <= 0 || d <= 0) {
      if (l <= 0) setActiveField(lengthInput);
      else setActiveField(diameterInput);
      return;
    }

    const vol = calcRowVolume(l, d, currentSpecies);
    items.push({
      num: items.length + 1,
      volume: vol,
      length: l,
      diameter: d,
      species: currentSpecies,
      jakost: currentJakost,
      isOddenek: isOddenek,
      jprl: jprlInput.value,
      ck: countInput.value
    });

    diameterInput.value = '';
    countInput.value = String(items.length + 1);
    updateDraft();
    updateTotals();
    renderList();
    setActiveField(diameterInput);
  });

  // Vykreslení seznamu klád
  const renderList = () => {
    logItems.innerHTML = '';
    items.forEach((item, idx) => {
      const row = document.createElement('article');
      row.className = 'log-row';
      const oddenekMark = item.isOddenek ? '<span class="log-tag">x</span>' : '';
      row.innerHTML = `
        <div class="log-main-info">
          <span class="log-num">${idx + 1} ${oddenekMark}</span>
          <span class="log-vol">${formatVol(item.volume)}</span>
        </div>
        <div class="log-details">${item.species}, ${item.length.toFixed(1)}, ${item.diameter}, ${item.jakost}</div>
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

  // Mazání klády ze seznamu přes koš
  logItems.addEventListener('click', (e) => {
    const btn = e.target.closest('.log-del-btn');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    items.splice(idx, 1);
    renderList();
    updateTotals();
  });

  // Přepínání obrazovek
  const showEntryScreen = () => {
    screenEntry.classList.add('active');
    screenList.classList.remove('active');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'zadavani'));
    btnBottomNew.classList.add('active');
    btnBottomList.classList.remove('active');
  };

  const showListScreen = () => {
    screenEntry.classList.remove('active');
    screenList.classList.add('active');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'kulatina'));
    btnBottomNew.classList.remove('active');
    btnBottomList.classList.add('active');
    renderList();
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab === 'kulatina' || tab.dataset.tab === 'sumar') showListScreen();
      else showEntryScreen();
    });
  });

  btnBottomNew.addEventListener('click', showEntryScreen);
  btnBottomList.addEventListener('click', showListScreen);

  // Modální picker
  const openPicker = (list, onSelect) => {
    pickerOptions.innerHTML = '';
    list.forEach(val => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'picker-item';
      btn.textContent = val;
      btn.addEventListener('click', () => {
        onSelect(val);
        pickerModal.hidden = true;
      });
      pickerOptions.appendChild(btn);
    });
    pickerModal.hidden = false;
  };

  pickerModal.addEventListener('click', (e) => {
    if (e.target === pickerModal) pickerModal.hidden = true;
  });

  // Výběr Dřeviny (s okamžitým přepočtem kůry)
  document.getElementById('btnSpecies').addEventListener('click', () => {
    openPicker(SPECIES_LIST, (val) => {
      currentSpecies = val;
      speciesLabel.textContent = val;
      updateDraft();
    });
  });

  // Výběr Jakosti
  document.getElementById('btnJakost').addEventListener('click', () => {
    openPicker(JAKOST_LIST, (val) => {
      currentJakost = val.split(' ')[0];
      jakostLabel.textContent = currentJakost;
    });
  });

  // Výběr Módu
  document.getElementById('btnMod').addEventListener('click', () => {
    openPicker(MOD_LIST, (val) => {
      currentMod = val;
      modLabel.textContent = val.split(' ')[0];
      updateDraft();
    });
  });

  // Exportní dialog (Odeslat)
  btnBottomSend.addEventListener('click', () => {
    exportFileName.value = dateLabel.textContent;
    exportModal.hidden = false;
  });

  btnExportCancel.addEventListener('click', () => {
    exportModal.hidden = true;
  });

  btnExportCreate.addEventListener('click', () => {
    exportModal.hidden = true;
    showListScreen();
  });

  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) exportModal.hidden = true;
  });

  // Celá obrazovka
  document.getElementById('toggleFullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Inicializace
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  dateLabel.textContent = dateStr;
  listDateLabel.textContent = dateStr;
  setActiveField(lengthInput);
  updateDraft();
  updateTotals();
})();