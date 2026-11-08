/**
 * ============================================================================
 * FLORIPA VELO - VIEW: PLANO (METAS, REGISTRO & HISTÓRICO DE PEDAIS)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Plan = {
  // Registrar novo pedal
  registerRide() {
    const kmInput = window.FloripaVelo.Utils.$('#rKm');
    const km = parseFloat(kmInput.value);
    const msgEl = window.FloripaVelo.Utils.$('#rMsg');

    if (!(km > 0)) {
      msgEl.textContent = 'Por favor, digite quantos km você pedalou.';
      msgEl.style.color = 'var(--ac)';
      return;
    }

    const feel = window.FloripaVelo.Utils.$('#rFeel').value;
    const type = window.FloripaVelo.Utils.$('#rTipo').value;
    const ciclovia = window.FloripaVelo.Utils.$('#rCic').value;
    const dateInput = window.FloripaVelo.Utils.$('#rQuando').value;
    const rideDate = dateInput ? new Date(dateInput) : new Date();

    const newRide = {
      id: window.FloripaVelo.Utils.uid(),
      t: rideDate.toISOString(),
      km,
      feel,
      cic: ciclovia,
      tipo: type
    };

    window.FloripaVelo.State.completedRides.push(newRide);

    // Ajusta progressão fisiológica do iniciante
    window.FloripaVelo.Training.adjustProgression(
      km,
      feel,
      type,
      window.FloripaVelo.State.config
    );

    window.FloripaVelo.State.save();
    window.FloripaVelo.App.renderAll();

    msgEl.style.color = 'var(--ink)';
    msgEl.textContent = type === 'longao'
      ? 'Pedal registrado com sucesso! Seu nível de resistência foi ajustado.'
      : 'Pedal registrado com sucesso! (Apenas os longões ajustam o nível base).';
  },

  // Editar pedal existente no histórico
  editRide(id, field, value) {
    const ride = window.FloripaVelo.State.completedRides.find(x => x.id === id);
    if (!ride) return;

    if (field === 'km') {
      ride.km = Math.max(0, parseFloat(value) || 0);
    } else if (field === 't') {
      ride.t = new Date(value).toISOString();
    } else {
      ride[field] = value;
    }

    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.More.render();
  },

  // Excluir pedal do histórico
  deleteRide(id) {
    if (!confirm('Deseja realmente apagar este pedal do seu histórico?')) return;
    window.FloripaVelo.State.completedRides = window.FloripaVelo.State.completedRides.filter(x => x.id !== id);
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.More.render();
  },

  render() {
    const el = window.FloripaVelo.Utils.$('#v-plano');
    const { config, completedRides, schedule } = window.FloripaVelo.State;
    const { pad2, todayDateString } = window.FloripaVelo.Utils;
    const Config = window.FloripaVelo.Config;
    const Training = window.FloripaVelo.Training;

    if (!config) return;

    const todayStr = todayDateString();
    const scheduledToday = schedule.find(x => x.data === todayStr);
    const nextType = scheduledToday ? scheduledToday.tipo : Training.getNextSessionType(completedRides, config.dias);
    const isRecovery = Training.isRecoveryWeek(completedRides);
    const progressPercent = Math.min(100, Math.round((config.L / config.meta) * 100));

    // Estimativa de semanas até a meta
    let goalEstimateText = 'Meta alcançada! Mantenha a consistência.';
    if (config.L < config.meta) {
      const neededWeeks = Math.ceil(Math.log(config.meta / config.L) / Math.log(1.08) * 1.2);
      const estWeeks = Math.max(1, Math.ceil(neededWeeks / Math.max(1, config.dias)));
      goalEstimateText = `Meta de ${config.meta} km em cerca de ${estWeeks} semanas (+5–8% por longão).`;
    }

    // Cálculo das últimas 6 semanas de quilometragem
    const getMonday = d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      const day = (date.getDay() + 6) % 7;
      date.setDate(date.getDate() - day);
      return date;
    };

    const weeklyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const start = getMonday(new Date());
      start.setDate(start.getDate() - 7 * i);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const weekKm = completedRides.filter(r => {
        const t = new Date(r.t);
        return t >= start && t < end;
      }).reduce((acc, r) => acc + (+r.km || 0), 0);

      weeklyHistory.push({ start, km: weekKm });
    }

    const maxWeeklyKm = Math.max(10, ...weeklyHistory.map(w => w.km));
    const nowLocalIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const feelLabels = { facil: 'Fácil (sobrou perna)', medio: 'Médio (confortável)', pesado: 'Pesado (no limite)' };

    el.innerHTML = `
      <h1>Meu <b>Plano</b></h1>
      <div class="sub">
        ${isRecovery ? '<b>Esta é uma semana de recuperação:</b> distâncias menores para seu corpo absorver o treino e evoluir. ' : ''}
        Sua semana ideal com <b>${config.dias} pedais</b>:
        ${Training.getWeeklyTypes(config.dias).map(t => `${Config.TIPOS_TREINO[t].nome} ${Training.calculateKmForType(t, config, isRecovery)} km`).join(' · ')}.
      </div>

      <!-- Estrutura do método -->
      <div class="card" style="margin-top:12px">
        <div class="lbl">Estrutura de Treino</div>
        <div class="sub">
          <b>Longão:</b> resistência aeróbica em ritmo leve · <b>Ritmo:</b> cadência contínua · <b>Leve:</b> recuperação ativa.
        </div>
      </div>

      <!-- Formulário para registrar pedal -->
      <div class="card">
        <div class="lbl">Registrar Pedal Realizado</div>
        <div class="f" style="margin:0">
          <label class="sub" style="flex:1">Tipo de pedal<br>
            <select id="rTipo" style="width:100%" onchange="window.FloripaVelo.Utils.$('#rKm').value = window.FloripaVelo.Training.calculateKmForType(this.value, window.FloripaVelo.State.config)">
              ${Object.keys(Config.TIPOS_TREINO).map(k => `
                <option value="${k}" ${nextType === k ? 'selected' : ''}>${Config.TIPOS_TREINO[k].nome}</option>
              `).join('')}
            </select>
          </label>

          <label class="sub">Distância<br>
            <input id="rKm" class="sm" type="number" step="0.5" min="0"
                   value="${scheduledToday ? scheduledToday.km : Training.calculateKmForType(nextType, config, isRecovery)}">
            <span class="sub">km</span>
          </label>
        </div>

        <div class="f" style="margin-top:8px">
          <label class="sub" style="flex:1">Sensação de esforço<br>
            <select id="rFeel" style="width:100%">
              <option value="facil">Fácil (sobrou perna)</option>
              <option value="medio" selected>Médio (confortável)</option>
              <option value="pesado">Pesado (bem cansativo)</option>
            </select>
          </label>

          <label class="sub" style="flex:1">Ciclovia / trânsito<br>
            <select id="rCic" style="width:100%">
              <option>Vazia / Tranquila</option>
              <option selected>Normal</option>
              <option>Cheia / Atenção</option>
            </select>
          </label>
        </div>

        <label class="sub" style="display:block;margin-top:8px">Data e hora do pedal<br>
          <input id="rQuando" type="datetime-local" value="${nowLocalIso}" style="width:100%">
        </label>

        <button class="btn p full" style="margin-top:12px" onclick="window.FloripaVelo.Views.Plan.registerRide()">
          Salvar Pedal no Histórico
        </button>
        <div class="sub" id="rMsg" style="margin-top:8px;font-weight:700"></div>
      </div>

      <!-- Barra de progresso rumo ao objetivo -->
      <div class="card">
        <div class="lbl">Rumo ao Seu Objetivo</div>
        <div class="f" style="justify-content:space-between;margin:0">
          <b>Longão atual: ${Math.round(config.L)} km</b>
          <b>Meta final: ${config.meta} km</b>
        </div>
        <div class="bar" style="margin:8px 0">
          <i style="width:${progressPercent}%"></i>
        </div>
        <div class="sub">${goalEstimateText}</div>
      </div>

      <!-- Gráfico das últimas 6 semanas -->
      <div class="card">
        <div class="lbl">Km por Semana (Últimas 6 semanas)</div>
        <div class="chart" style="height:110px">
          ${weeklyHistory.map(w => `
            <div class="bar1" style="width:48px">
              ${Math.round(w.km)}
              <i style="height:${Math.max(4, (w.km / maxWeeklyKm) * 70)}px;background:var(--ac)"></i>
              <span>${pad2(w.start.getDate())}/${pad2(w.start.getMonth() + 1)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Histórico e edição de pedais -->
      <div class="card">
        <div class="lbl">Histórico de Pedais (${completedRides.length})</div>
        ${completedRides.length ? completedRides.slice().sort((a, b) => b.t.localeCompare(a.t)).map(ride => {
          const rideLocalIso = new Date(new Date(ride.t).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          return `
            <div class="pt">
              <input type="datetime-local" value="${rideLocalIso}"
                     onchange="window.FloripaVelo.Views.Plan.editRide('${ride.id}', 't', this.value)">

              <div class="f" style="margin-top:6px">
                <select onchange="window.FloripaVelo.Views.Plan.editRide('${ride.id}', 'tipo', this.value)">
                  ${Object.keys(Config.TIPOS_TREINO).map(k => `
                    <option value="${k}" ${ride.tipo === k ? 'selected' : ''}>${Config.TIPOS_TREINO[k].nome}</option>
                  `).join('')}
                </select>

                <input class="sm" type="number" step="0.5" value="${ride.km}"
                       onchange="window.FloripaVelo.Views.Plan.editRide('${ride.id}', 'km', this.value)">
                <span class="sub">km</span>
              </div>

              <div class="f" style="margin-top:6px">
                <select onchange="window.FloripaVelo.Views.Plan.editRide('${ride.id}', 'feel', this.value)">
                  ${Object.keys(feelLabels).map(k => `
                    <option value="${k}" ${ride.feel === k ? 'selected' : ''}>${feelLabels[k]}</option>
                  `).join('')}
                </select>

                <select onchange="window.FloripaVelo.Views.Plan.editRide('${ride.id}', 'cic', this.value)">
                  ${['Vazia / Tranquila', 'Normal', 'Cheia / Atenção'].map(opt => `
                    <option ${ride.cic === opt ? 'selected' : ''}>${opt}</option>
                  `).join('')}
                </select>

                <button class="btn" onclick="window.FloripaVelo.Views.Plan.deleteRide('${ride.id}')">
                  Apagar
                </button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="sub">Nenhum pedal registrado ainda. Registre seu primeiro pedal acima para acompanhar sua evolução!</div>
        `}
      </div>
    `;
  }
};
