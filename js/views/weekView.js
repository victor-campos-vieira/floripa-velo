/**
 * ============================================================================
 * FLORIPA VELO - VIEW: SEMANA (PREVISÃO DE 7 DIAS & PLANEJAMENTO)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Week = {
  // Ações de edição de sessão agendada
  editSession(id, field, value) {
    const session = window.FloripaVelo.State.schedule.find(x => x.id === id);
    if (!session) return;

    if (field === 'km') {
      session.km = Math.max(1, parseFloat(value) || session.km);
    } else if (field === 'hora') {
      session.hora = +value;
    } else if (field === 'tipo') {
      session.tipo = value;
      const isRecovery = window.FloripaVelo.Training.isRecoveryWeek(window.FloripaVelo.State.completedRides);
      session.km = window.FloripaVelo.Training.calculateKmForType(value, window.FloripaVelo.State.config, isRecovery);
    } else {
      session[field] = value;
    }

    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  deleteSession(id) {
    window.FloripaVelo.State.schedule = window.FloripaVelo.State.schedule.filter(x => x.id !== id);
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  addSession() {
    const nextType = window.FloripaVelo.Training.getNextSessionType(
      window.FloripaVelo.State.completedRides,
      window.FloripaVelo.State.config.dias
    );
    const isRecovery = window.FloripaVelo.Training.isRecoveryWeek(window.FloripaVelo.State.completedRides);
    const km = window.FloripaVelo.Training.calculateKmForType(nextType, window.FloripaVelo.State.config, isRecovery);

    window.FloripaVelo.State.schedule.push({
      id: window.FloripaVelo.Utils.uid(),
      data: window.FloripaVelo.Utils.todayDateString(),
      hora: 7,
      tipo: nextType,
      km
    });

    window.FloripaVelo.State.save();
    this.render();
  },

  suggestAgain() {
    const suggested = window.FloripaVelo.Training.suggestWeeklyPlan(
      window.FloripaVelo.State.weather,
      window.FloripaVelo.State.config,
      window.FloripaVelo.State.completedRides
    );
    window.FloripaVelo.State.schedule = suggested;
    window.FloripaVelo.State.save();
    this.render();
    window.FloripaVelo.Views.Today.render();
  },

  exportSingleSessionIcs(id) {
    const session = window.FloripaVelo.State.schedule.find(x => x.id === id);
    if (session) {
      window.FloripaVelo.Calendar.downloadSingle(
        session,
        window.FloripaVelo.State.config,
        window.FloripaVelo.State.weather
      );
    }
  },

  exportAllSessionsIcs() {
    window.FloripaVelo.Calendar.downloadAll(
      window.FloripaVelo.State.schedule,
      window.FloripaVelo.State.config,
      window.FloripaVelo.State.weather
    );
  },

  render() {
    const el = window.FloripaVelo.Utils.$('#v-semana');
    const { config, weather, schedule, destinations } = window.FloripaVelo.State;
    const { esc, pad2, formatMinutes, formatDateShort, getSevenDaysList } = window.FloripaVelo.Utils;
    const Config = window.FloripaVelo.Config;
    const Weather = window.FloripaVelo.Weather;
    const Training = window.FloripaVelo.Training;
    const Routing = window.FloripaVelo.Routing;

    if (!config) return;

    let html = `
      <h1>Sua <b>Semana</b></h1>
      <div class="sub">
        Previsão dos próximos 7 dias em Florianópolis. Cada quadradinho representa 1 hora entre 05h e 18h.
        (Verde: bom, Laranja: atenção, Preto: evite).
      </div>
      <div style="height:12px"></div>
    `;

    if (!weather || !weather.hs) {
      html += `<div class="card">Carregando previsão da semana…</div>`;
      el.innerHTML = html;
      return;
    }

    const days7 = getSevenDaysList();
    const daysData = days7.map(d => ({
      date: d,
      summary: Weather.getDaySummary(d, weather)
    }));

    const validDays = daysData.filter(x => x.summary != null);
    const bestDayDate = validDays.length
      ? validDays.reduce((min, d) => (d.summary.sc <= min.summary.sc ? d : min)).date
      : null;

    const longKm = Training.calculateKmForType('longao', config);

    // Lista de cards diários da previsão
    html += daysData.map(({ date, summary }) => {
      const dailyDetails = weather.dd[date] || {};
      const dayHours = weather.hs.filter(x => x.dia === date && x.h >= 5 && x.h <= 18);
      const stripHtml = dayHours.map(x => `<i class="${Weather.classifyHour(x)}"></i>`).join('');

      let topDest = null;
      if (summary && destinations.length > 0) {
        const ranked = Routing.rankDestinations(destinations, { v: summary.v, d: summary.d }, longKm, config);
        if (ranked.length > 0) topDest = ranked[0];
      }

      const windName = summary ? window.FloripaVelo.Utils.getWindDirectionName(summary.d) : '';

      return `
        <div class="card dia">
          <div class="dh">
            <b>${formatDateShort(date)}</b>
            ${date === bestDayDate ? '<span class="tag">Melhor dia da semana</span>' : ''}
            ${summary ? `<span class="pill ${summary.nt}">${Config.VEREDITO[summary.nt]}</span>` : ''}
          </div>

          <div class="strip">${stripHtml}</div>

          ${summary ? `
            <div class="sub" style="margin-top:6px">
              Melhor janela: <b>${pad2(summary.h0)}h às ${pad2(summary.h0 + summary.n)}h</b>
              · Vento ${summary.v} km/h de ${windName}
              · Chuva até ${summary.p}%
              · Sensação térmica ${summary.maxSens}°
              · UV ${Math.round(summary.maxUv)} (${Weather.getUvLabel(summary.maxUv)})
            </div>
          ` : `
            <div class="sub" style="margin-top:6px">Sem horas de luz solar restantes para hoje.</div>
          `}

          <div class="sub" style="margin-top:4px">
            Dia: min ${dailyDetails.tmin || '--'}° / máx ${dailyDetails.tmax || '--'}°
            · Chuva ${dailyDetails.mm || 0} mm
            · Rajadas até ${dailyDetails.rj || '--'} km/h
            · Sol: ${weather.sr[date] || '--'} às ${weather.ps[date] || '--'}
          </div>

          ${summary && summary.v >= 8 ? `
            <div class="sub" style="margin-top:4px">
              💡 Estratégia de vento: ida rumo ao <b>${windName}</b>, volta a favor.
              ${topDest ? `Melhor lugar hoje: <b>${esc(topDest.destination.nome)}</b>.` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Seção dos pedais agendados
    const isRecovery = Training.isRecoveryWeek(window.FloripaVelo.State.completedRides);
    html += `
      <h1 style="margin-top:24px">Meus <b>Pedais</b></h1>
      <div class="sub">
        Dias distribuídos automaticamente para suas <b>${config.dias} sessões semanais</b>,
        com o longão no dia de melhor clima e descanso entre eles.
        ${isRecovery ? '<b>Esta é uma semana de recuperação</b> com volume menor.' : ''}
      </div>
    `;

    html += schedule.map(session => {
      const slot = Weather.getSlot(session.data, session.hora, weather);
      const hydration = Training.calculateHydrationAndFuel(session.km, config.vel, slot ? slot.sens : 25);
      const slotWindName = slot ? window.FloripaVelo.Utils.getWindDirectionName(slot.d) : '';

      return `
        <div class="card">
          <div class="f" style="margin:0">
            <select onchange="window.FloripaVelo.Views.Week.editSession('${session.id}', 'data', this.value)">
              ${days7.map(d => `<option value="${d}" ${d === session.data ? 'selected' : ''}>${formatDateShort(d)}</option>`).join('')}
            </select>

            <select onchange="window.FloripaVelo.Views.Week.editSession('${session.id}', 'hora', this.value)">
              ${[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(h => `
                <option value="${h}" ${h === +session.hora ? 'selected' : ''}>${pad2(h)}h</option>
              `).join('')}
            </select>

            <select onchange="window.FloripaVelo.Views.Week.editSession('${session.id}', 'tipo', this.value)">
              ${Object.keys(Config.TIPOS_TREINO).map(k => `
                <option value="${k}" ${session.tipo === k ? 'selected' : ''}>${Config.TIPOS_TREINO[k].nome}</option>
              `).join('')}
            </select>

            <input class="sm" type="number" step="1" min="1" value="${session.km}"
                   onchange="window.FloripaVelo.Views.Week.editSession('${session.id}', 'km', this.value)">
            <span class="sub">km</span>
          </div>

          <div class="sub" style="margin-top:8px">
            ${slot ? `
              <span class="tag ${slot.nt === 'bom' ? '' : 'o'}" style="margin:0">${Config.VEREDITO[slot.nt]}</span>
              Vento ${slot.v} km/h de ${slotWindName} · Chuva ${slot.p}%
            ` : 'Sem dados de previsão detalhada para este horário.'}
          </div>

          <div class="sub" style="margin-top:6px">${Config.TIPOS_TREINO[session.tipo]?.descricao || ''}</div>
          <div class="sub" style="margin-top:4px">
            ≈ ${formatMinutes(hydration.hours * 60)} · Leve ~${hydration.waterMl} ml de água
            ${hydration.gelCount ? `· ${hydration.gelCount} gel(s) ou fruta` : ''}
          </div>

          <div class="f" style="margin-top:10px">
            <button class="btn" onclick="window.FloripaVelo.Views.Week.exportSingleSessionIcs('${session.id}')">
              Salvar no Calendário
            </button>
            <button class="btn" onclick="window.FloripaVelo.Views.Week.deleteSession('${session.id}')">
              Remover
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Botões de ação da semana
    html += `
      <div class="f" style="margin-top:12px">
        <button class="btn p" onclick="window.FloripaVelo.Views.Week.suggestAgain()">Sugerir de Novo</button>
        <button class="btn" onclick="window.FloripaVelo.Views.Week.addSession()">+ Nova Sessão</button>
        <button class="btn k" onclick="window.FloripaVelo.Views.Week.exportAllSessionsIcs()">Todas no Calendário (.ics)</button>
      </div>
      <div class="sub" style="margin-top:10px">
        Exporta arquivo <code>.ics</code> para iPhone ou Google Agenda com lembrete 1h antes.
      </div>
    `;

    el.innerHTML = html;
  }
};
