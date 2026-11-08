/**
 * ============================================================================
 * FLORIPA VELO - VIEW: MAIS (CONFIGURAÇÕES, DESTINOS, BIKE, DICAS & BACKUP)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.More = {
  searchResults: [],
  searchFeedback: 'Pesquise por bairro, praia ou ponto de referência em Floripa.',
  selectedTireType: 'mtb',
  activeIcon: 'option-1',

  selectTireType(type) {
    this.selectedTireType = type;
    this.render();
  },

  selectAppIcon(optionName) {
    this.activeIcon = optionName;
    const favicon = window.FloripaVelo.Utils.$("link[rel*='icon']");
    if (favicon) {
      favicon.href = `assets/icon-${optionName}.svg`;
    }
    const headerIcon = window.FloripaVelo.Utils.$('.header-icon');
    if (headerIcon) {
      headerIcon.src = `assets/icon-${optionName}.svg`;
    }
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  // Atualizar dados de perfil
  updateConfig(key, value) {
    const val = parseFloat(value);
    const config = window.FloripaVelo.State.config;
    if (!config) return;

    if (key === 'L') config.L = Math.max(3, val || config.L);
    else if (key === 'meta') config.meta = Math.max(5, val || config.meta);
    else if (key === 'dias') config.dias = Math.min(6, Math.max(1, val || config.dias));
    else if (key === 'vel') config.vel = Math.min(45, Math.max(8, val || config.vel));

    window.FloripaVelo.State.save();
    window.FloripaVelo.App.renderAll();
  },

  // Alterar ponto de partida via busca
  async changeOriginBySearch() {
    const query = window.FloripaVelo.Utils.$('#pBusca').value.trim();
    const msgEl = window.FloripaVelo.Utils.$('#pMsg');
    if (!query) return;

    try {
      msgEl.textContent = 'Buscando localização…';
      const results = await window.FloripaVelo.Routing.searchPlaces(query);
      if (!results.length) {
        msgEl.textContent = 'Local não encontrado. Tente outro nome ou bairro.';
        return;
      }

      const match = results[0];
      const config = window.FloripaVelo.State.config;
      config.nome = match.nome;
      config.lat = match.lat;
      config.lng = match.lng;

      window.FloripaVelo.State.save();
      msgEl.textContent = 'Atualizando previsão e rotas de bicicleta…';

      await window.FloripaVelo.Weather.fetchForecast(config, true);
      await window.FloripaVelo.Routing.recalculateAllDestinations(
        window.FloripaVelo.State.destinations,
        config
      );
      window.FloripaVelo.State.save();
      window.FloripaVelo.App.renderAll();
      msgEl.textContent = 'Local de partida atualizado!';
    } catch (e) {
      msgEl.textContent = 'Serviço de busca indisponível no momento.';
    }
  },

  // Alterar ponto de partida via GPS
  changeOriginByGps() {
    const msgEl = window.FloripaVelo.Utils.$('#pMsg');
    if (!navigator.geolocation) {
      msgEl.textContent = 'Geolocalização não suportada neste aparelho.';
      return;
    }

    msgEl.textContent = 'Obtendo posição do GPS…';
    navigator.geolocation.getCurrentPosition(
      async pos => {
        msgEl.textContent = 'Identificando bairro pelo GPS…';
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const detectedName = await window.FloripaVelo.Routing.reverseGeocode(lat, lng);

        const config = window.FloripaVelo.State.config;
        config.nome = detectedName;
        config.lat = lat;
        config.lng = lng;

        window.FloripaVelo.State.save();
        msgEl.textContent = `Local detectado: ${detectedName}`;

        await window.FloripaVelo.Weather.fetchForecast(config, true);
        await window.FloripaVelo.Routing.recalculateAllDestinations(
          window.FloripaVelo.State.destinations,
          config
        );
        window.FloripaVelo.State.save();
        window.FloripaVelo.App.renderAll();
      },
      () => {
        msgEl.textContent = 'Permissão de localização negada.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  },

  // Busca de destinos
  async searchDestinations() {
    const query = window.FloripaVelo.Utils.$('#dBusca').value.trim();
    if (!query) return;

    this.searchFeedback = 'Buscando…';
    this.searchResults = [];
    this.render();

    this.searchResults = await window.FloripaVelo.Routing.searchPlaces(query);
    this.searchFeedback = this.searchResults.length
      ? ''
      : 'Nenhum local encontrado. Tente digitar apenas o bairro (ex: "Lagoa da Conceição" ou "Campeche").';
    this.render();
  },

  // Adicionar preset com 1 clique
  async addPresetDestination(presetId) {
    const preset = window.FloripaVelo.Config.PRESET_DESTINATIONS.find(p => p.id === presetId);
    if (!preset) return;

    const newDest = {
      id: window.FloripaVelo.Utils.uid(),
      nome: preset.nome,
      lat: preset.lat,
      lng: preset.lng,
      ref: preset.ref
    };

    window.FloripaVelo.State.destinations.push(newDest);
    this.searchFeedback = `Calculando rota para ${preset.nome}…`;
    this.render();

    await window.FloripaVelo.Routing.calculateDestinationRoute(
      newDest,
      window.FloripaVelo.State.config
    );

    window.FloripaVelo.State.save();
    this.searchFeedback = `${preset.nome} adicionado com sucesso!`;
    window.FloripaVelo.App.renderAll();
  },

  // Selecionar resultado da busca
  async selectSearchResult(index) {
    const chosen = this.searchResults[index];
    this.searchResults = [];

    const newDest = {
      id: window.FloripaVelo.Utils.uid(),
      nome: chosen.nome,
      lat: chosen.lat,
      lng: chosen.lng,
      ref: chosen.ref
    };

    window.FloripaVelo.State.destinations.push(newDest);
    this.searchFeedback = 'Calculando rota de bicicleta pelo OpenStreetMap…';
    this.render();

    await window.FloripaVelo.Routing.calculateDestinationRoute(
      newDest,
      window.FloripaVelo.State.config
    );

    window.FloripaVelo.State.save();
    this.searchFeedback = 'Destino adicionado com sucesso! Você pode editar a distância se quiser.';
    window.FloripaVelo.App.renderAll();
  },

  // Recalcular rota de um destino
  async recalculateDestination(id) {
    const dest = window.FloripaVelo.State.destinations.find(x => x.id === id);
    if (!dest) return;

    this.searchFeedback = `Recalculando rota para ${dest.nome}…`;
    this.render();

    await window.FloripaVelo.Routing.calculateDestinationRoute(
      dest,
      window.FloripaVelo.State.config
    );

    window.FloripaVelo.State.save();
    this.searchFeedback = 'Rota recalculada com sucesso!';
    window.FloripaVelo.App.renderAll();
  },

  // Editar km de ida manualmente
  editDestinationKm(id, val) {
    const dest = window.FloripaVelo.State.destinations.find(x => x.id === id);
    const num = parseFloat(val);
    if (dest && num > 0) {
      dest.kmIda = num;
      window.FloripaVelo.State.save();
      this.render();
      window.FloripaVelo.Views.Today.render();
      window.FloripaVelo.Views.Week.render();
    }
  },

  // Editar nome do destino
  editDestinationName(id, val) {
    const dest = window.FloripaVelo.State.destinations.find(x => x.id === id);
    if (dest && val.trim()) {
      dest.nome = val.trim();
      window.FloripaVelo.State.save();
      window.FloripaVelo.Views.Today.render();
      window.FloripaVelo.Views.Week.render();
    }
  },

  deleteDestination(id) {
    window.FloripaVelo.State.destinations = window.FloripaVelo.State.destinations.filter(x => x.id !== id);
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
    window.FloripaVelo.Views.Week.render();
  },

  // Manutenção da bicicleta
  editBikeItem(id, field, value) {
    const item = window.FloripaVelo.State.bike.itens.find(x => x.id === id);
    if (!item) return;

    if (field === 'nome') {
      if (value.trim()) item.nome = value.trim();
    } else if (field === 'cada') {
      item.cada = Math.max(1, parseFloat(value) || item.cada);
    }

    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  markBikeItemDone(id) {
    const item = window.FloripaVelo.State.bike.itens.find(x => x.id === id);
    if (item) {
      item.ult = window.FloripaVelo.State.getTotalBikeKm();
      window.FloripaVelo.State.save();
      this.render();
      window.FloripaVelo.Views.Today.render();
    }
  },

  deleteBikeItem(id) {
    window.FloripaVelo.State.bike.itens = window.FloripaVelo.State.bike.itens.filter(x => x.id !== id);
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  addBikeItem() {
    window.FloripaVelo.State.bike.itens.push({
      id: window.FloripaVelo.Utils.uid(),
      nome: 'Nova manutenção / ajuste',
      cada: 300,
      ult: null
    });
    window.FloripaVelo.State.save();
    this.render();
  },

  editBikeExtraKm(value) {
    window.FloripaVelo.State.bike.extra = Math.max(0, parseFloat(value) || 0);
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  // Backup e restauração
  exportBackup() {
    const { config, completedRides, destinations, schedule, bike, checklist } = window.FloripaVelo.State;
    const backupData = {
      C: config,
      F: completedRides,
      D: destinations,
      A: schedule,
      B: bike,
      ck: checklist,
      dataExportacao: new Date().toISOString()
    };

    window.FloripaVelo.Utils.downloadFile(
      'floripa-velo-backup.json',
      JSON.stringify(backupData, null, 2),
      'application/json'
    );
  },

  importBackup(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj.C) throw new Error('Arquivo de backup inválido');

        window.FloripaVelo.State.config = obj.C;
        window.FloripaVelo.State.completedRides = obj.F || [];
        window.FloripaVelo.State.destinations = obj.D || [];
        window.FloripaVelo.State.schedule = obj.A || [];
        window.FloripaVelo.State.bike = obj.B || window.FloripaVelo.State.bike;
        window.FloripaVelo.State.checklist = obj.ck || {};

        window.FloripaVelo.State.save();
        await window.FloripaVelo.Weather.fetchForecast(obj.C, true);
        window.FloripaVelo.App.renderAll();
        alert('Backup restaurado com sucesso!');
      } catch (e) {
        alert('Erro ao importar backup: formato de arquivo inválido.');
      }
    };
    reader.readAsText(file);
  },

  render() {
    const el = window.FloripaVelo.Utils.$('#v-mais');
    const { config, destinations, bike } = window.FloripaVelo.State;
    const { esc } = window.FloripaVelo.Utils;
    const Config = window.FloripaVelo.Config;
    const Routing = window.FloripaVelo.Routing;

    if (!config) return;

    const totalBikeKm = window.FloripaVelo.State.getTotalBikeKm();

    el.innerHTML = `
      <h1>Mais</h1>
      <div class="sub">Ajustes da sua conta, destinos em Floripa, manutenção da bicicleta e dicas.</div>

      <!-- Meu perfil -->
      <div class="card" style="margin-top:12px">
        <div class="lbl">Meu Perfil & Ponto de Partida</div>
        <div class="sub">Saindo habitualmente de: <b>${esc(config.nome)}</b></div>

        <div class="f" style="margin-top:8px">
          <input id="pBusca" placeholder="Mudar partida (ex: Kobrasol, Trindade, Lagoa)" style="flex:1">
          <button class="btn" onclick="window.FloripaVelo.Views.More.changeOriginBySearch()">Buscar</button>
          <button class="btn" onclick="window.FloripaVelo.Views.More.changeOriginByGps()">Meu GPS</button>
        </div>
        <div class="sub" id="pMsg" style="margin-top:6px;font-weight:700"></div>

        <div class="f" style="margin-top:10px">
          <label class="sub">Longão base (km)<br>
            <input class="sm" type="number" step="1" value="${Math.round(config.L)}"
                   onchange="window.FloripaVelo.Views.More.updateConfig('L', this.value)">
          </label>
          <label class="sub">Meta final (km)<br>
            <input class="sm" type="number" value="${config.meta}"
                   onchange="window.FloripaVelo.Views.More.updateConfig('meta', this.value)">
          </label>
          <label class="sub">Dias por semana<br>
            <input class="sm" type="number" min="1" max="6" value="${config.dias}"
                   onchange="window.FloripaVelo.Views.More.updateConfig('dias', this.value)">
          </label>
          <label class="sub">Velocidade média (km/h)<br>
            <input class="sm" type="number" value="${config.vel}"
                   onchange="window.FloripaVelo.Views.More.updateConfig('vel', this.value)">
          </label>
        </div>
      </div>

      <!-- Destinos em Floripa -->
      <div class="card">
        <div class="lbl">Meus Destinos em Floripa</div>
        <div class="sub">
          O app calcula a quilometragem por ciclovias e o alinhamento do vento para cada destino.
        </div>

        <!-- Sugestões populares em Floripa para adicionar com 1 toque -->
        <div class="lbl" style="margin-top:14px">Lugares clássicos para adicionar rápido:</div>
        <div class="preset-grid">
          ${Config.PRESET_DESTINATIONS.map(p => `
            <button class="preset-chip" onclick="window.FloripaVelo.Views.More.addPresetDestination('${p.id}')">
              + ${esc(p.nome.split('(')[0].trim())}
            </button>
          `).join('')}
        </div>

        <!-- Lista de destinos cadastrados -->
        ${destinations.map(d => {
          const idaKm = Routing.getDestinationOneWayKm(d, config);
          const bearing = window.FloripaVelo.Utils.bearingDegrees([config.lat, config.lng], [d.lat, d.lng]);
          const dir = window.FloripaVelo.Utils.getWindDirectionName(bearing);

          return `
            <div class="pt">
              <div class="f" style="margin:0">
                <input value="${esc(d.nome)}" style="flex:1"
                       onchange="window.FloripaVelo.Views.More.editDestinationName('${d.id}', this.value)">
                <button class="btn" onclick="window.FloripaVelo.Views.More.deleteDestination('${d.id}')">Remover</button>
              </div>

              <div class="f" style="margin-top:6px">
                <span class="sub">Ida:</span>
                <input class="sm" type="number" step="0.5" value="${idaKm}"
                       onchange="window.FloripaVelo.Views.More.editDestinationKm('${d.id}', this.value)">
                <span class="sub">km</span>
                <span class="tag ${d.kmIda ? '' : d.rota && !d.rota.estimada ? '' : 'o'}">
                  ${d.kmIda ? 'ajuste manual' : d.rota && !d.rota.estimada ? 'rota ciclovia OSM' : 'estimativa'}
                </span>
                <button class="btn sm" onclick="window.FloripaVelo.Views.More.recalculateDestination('${d.id}')">
                  Recalcular Rota
                </button>
              </div>

              <div class="sub" style="margin-top:4px">
                Rumo ao <b>${dir}</b>
                ${d.rota && d.rota.up ? `· Subida acumulada ~${d.rota.up} m na ida` : ''}
                ${d.ref ? `· (${esc(d.ref)})` : ''}
              </div>
            </div>
          `;
        }).join('')}

        <!-- Busca personalizada -->
        <div class="f" style="margin-top:14px">
          <input id="dBusca" placeholder="Ex.: Ponta das Canas, Campeche, UFSC" style="flex:1">
          <button class="btn p" onclick="window.FloripaVelo.Views.More.searchDestinations()">Buscar</button>
        </div>

        ${this.searchResults.length ? `
          <div class="sub" style="margin-top:8px">Selecione o local correto:</div>
          ${this.searchResults.map((res, idx) => `
            <div class="pt">
              <button class="btn" style="width:100%;text-align:left;text-transform:none"
                      onclick="window.FloripaVelo.Views.More.selectSearchResult(${idx})">
                <b>${esc(res.nome)}</b> · <span class="sub">${esc(res.ref)}</span>
              </button>
            </div>
          `).join('')}
        ` : ''}

        <div class="sub" id="dMsg" style="margin-top:6px">${this.searchFeedback}</div>
      </div>

      <!-- Minha bicicleta e manutenções -->
      <div class="card">
        <div class="lbl">Minha Bicicleta</div>
        <div class="sub">
          Total rodado na bike: <b>${Math.round(totalBikeKm)} km</b>
          (pedais registrados + quilometragem anterior).
        </div>

        <div class="f" style="margin-top:8px">
          <label class="sub">Km que a bike já tinha antes do app<br>
            <input class="sm" type="number" value="${bike.extra}"
                   onchange="window.FloripaVelo.Views.More.editBikeExtraKm(this.value)">
          </label>
        </div>

        <div class="lbl" style="margin-top:16px">Plano de Manutenção Periódica:</div>
        ${bike.itens.map(item => {
          const remaining = item.ult == null ? null : item.cada - (totalBikeKm - item.ult);
          const isExpired = remaining != null && remaining <= 0;

          return `
            <div class="pt">
              <input value="${esc(item.nome)}" style="width:100%"
                     onchange="window.FloripaVelo.Views.More.editBikeItem('${item.id}', 'nome', this.value)">

              <div class="f" style="margin-top:6px">
                <span class="sub">A cada</span>
                <input class="sm" type="number" value="${item.cada}"
                       onchange="window.FloripaVelo.Views.More.editBikeItem('${item.id}', 'cada', this.value)">
                <span class="sub">km</span>

                <span class="tag ${isExpired ? 'o' : ''}">
                  ${remaining == null ? 'sem registro ainda' : isExpired ? `venceu há ${Math.round(-remaining)} km` : `faltam ${Math.round(remaining)} km`}
                </span>
              </div>

              <div class="f" style="margin-top:6px">
                <button class="btn k" onclick="window.FloripaVelo.Views.More.markBikeItemDone('${item.id}')">
                  Fiz Hoje
                </button>
                <button class="btn" onclick="window.FloripaVelo.Views.More.deleteBikeItem('${item.id}')">
                  Remover
                </button>
              </div>
            </div>
          `;
        }).join('')}

        <div class="f" style="margin-top:10px">
          <button class="btn" onclick="window.FloripaVelo.Views.More.addBikeItem()">+ Nova Manutenção</button>
        </div>
      </div>

      <!-- Guia de Calibragem no Posto -->
      <div class="card">
        <div class="lbl">Calibrador de Pneus no Posto (Quantas Libras?)</div>
        <div class="sub">Selecione o tipo de pneu da sua bicicleta para ver a pressão recomendada:</div>
        <div class="f" style="margin-top:8px">
          <button class="btn ${this.selectedTireType === 'mtb' ? 'k' : ''}" onclick="window.FloripaVelo.Views.More.selectTireType('mtb')">
            MTB (Largo)
          </button>
          <button class="btn ${this.selectedTireType === 'urbana' ? 'k' : ''}" onclick="window.FloripaVelo.Views.More.selectTireType('urbana')">
            Urbana / Híbrida
          </button>
          <button class="btn ${this.selectedTireType === 'speed' ? 'k' : ''}" onclick="window.FloripaVelo.Views.More.selectTireType('speed')">
            Speed (Fino)
          </button>
        </div>

        ${(() => {
          const calib = Config.CALIBRADOR_PNEUS[this.selectedTireType];
          return `
            <div class="time-calc-box" style="margin-top:10px;background:#FFF">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px">${calib.nome}</div>
              <div class="f" style="gap:16px;margin:6px 0">
                <div><span class="sub">Pneu Dianteiro:</span><br><b style="font-size:18px">${calib.psiFrente}</b></div>
                <div><span class="sub">Pneu Traseiro:</span><br><b style="font-size:18px">${calib.psiTras}</b></div>
              </div>
              <div class="sub" style="margin-top:6px;font-size:12px">${calib.dica}</div>
            </div>
          `;
        })()}
      </div>

      <!-- Dicas essenciais do iniciante -->
      <div class="card">
        <div class="lbl">Dicas Essenciais</div>
        ${Config.DICAS_INICIANTE.map(dica => `
          <div class="tip-box">
            <b>${dica.titulo}</b>
            <div>${dica.texto}</div>
          </div>
        `).join('')}
      </div>

      <!-- Contatos de emergência -->
      <div class="card" style="border-left:6px solid #B91C1C">
        <div class="lbl" style="color:#B91C1C">Contatos de Emergência</div>
        <div class="sub">Socorro médico e apoio operacional em Florianópolis:</div>
        <div class="sos-row">
          <a class="sos-btn" href="tel:192">SAMU 192</a>
          <a class="sos-btn" href="tel:193">BOMBEIROS 193</a>
          <a class="sos-btn" href="tel:153">GUARDA 153</a>
          <a class="sos-btn" href="tel:190">PM 190</a>
        </div>
      </div>

      <!-- Backup e dados -->
      <div class="card">
        <div class="lbl">Backup & Segurança dos Dados</div>
        <div class="sub">
          Todos os seus dados ficam guardados exclusivamente no seu navegador (sem cadastro ou servidor).
          Recomendamos baixar um backup de vez em quando.
        </div>

        <div class="f" style="margin-top:12px">
          <button class="btn k" onclick="window.FloripaVelo.Views.More.exportBackup()">
            Baixar Arquivo de Backup (.json)
          </button>
        </div>

        <div class="f" style="margin-top:10px">
          <label class="sub">Restaurar backup anterior<br>
            <input type="file" accept=".json" onchange="window.FloripaVelo.Views.More.importBackup(this)">
          </label>
        </div>

        <div class="f" style="margin-top:14px;border-top:1px solid var(--ln);padding-top:10px">
          <button class="btn" style="color:#b91c1c;border-color:#b91c1c"
                  onclick="if(confirm('Tem certeza? Isso apagará TODOS os dados do app neste aparelho.')){window.FloripaVelo.State.resetAll()}">
            Apagar Tudo e Reiniciar App
          </button>
        </div>
      </div>
    `;
  }
};
