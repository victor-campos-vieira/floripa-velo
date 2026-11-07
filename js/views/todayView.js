/**
 * ============================================================================
 * FLORIPA VELO - VIEW: HOJE (TELA PRINCIPAL)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Today = {
  // Alterna item do checklist diário
  toggleChecklist(itemId) {
    const today = window.FloripaVelo.Utils.todayDateString();
    const checklist = window.FloripaVelo.State.checklist;
    if (!checklist[today]) checklist[today] = {};
    checklist[today][itemId] = !checklist[today][itemId];
    window.FloripaVelo.State.save();
    this.render();
  },

  render() {
    const el = window.FloripaVelo.Utils.$('#v-hoje');
    const { config, weather, schedule, completedRides, destinations, bike } = window.FloripaVelo.State;
    const { esc, pad2, formatMinutes, todayDateString } = window.FloripaVelo.Utils;
    const Config = window.FloripaVelo.Config;
    const Weather = window.FloripaVelo.Weather;
    const Training = window.FloripaVelo.Training;
    const Routing = window.FloripaVelo.Routing;

    if (!config) {
      el.innerHTML = '';
      return;
    }

    let html = `<div class="brand">FLORIPA<b>VELO</b></div>`;
    html += `<div class="loc">${esc(config.nome)}</div>`;

    if (!weather || !weather.hs) {
      html += `<div class="hero">Carregando previsão do tempo e vento para Floripa…</div>`;
      el.innerHTML = html;
      return;
    }

    const todayStr = todayDateString();
    const currentHour = new Date().getHours();
    let currentIdx = weather.hs.findIndex(x => x.dia === todayStr && x.h === currentHour);
    if (currentIdx < 0) currentIdx = 0;

    const currentHourData = weather.hs[currentIdx];
    const factors = Weather.evaluateFactors(currentIdx, weather);

    // Veredito geral com base nos fatores (ignora UV para o veredito de segurança)
    const rankMap = { bom: 0, ok: 1, ruim: 2 };
    const overallVerdict = factors
      .filter((_, idx) => idx !== 4) // exclui UV do bloqueio
      .reduce((max, f) => (rankMap[f[0]] > rankMap[max] ? f[0] : max), 'bom');

    const verdictTitles = {
      bom: 'Sim, bora pedalar!',
      ok: 'Dá para ir, com atenção',
      ruim: 'Melhor evitar agora'
    };

    if (weather.velha) {
      html += `<div class="warn">Sem conexão com a internet: exibindo a última previsão salva.</div>`;
    }

    // Alerta contextual de Vento Sul em Floripa
    const isVentoSul = currentHourData.d >= 135 && currentHourData.d <= 225;
    if (isVentoSul && currentHourData.v >= 18) {
      html += `
        <div class="warn">
          <b>⚠️ Alerta Vento Sul em Floripa (${currentHourData.v} km/h):</b>
          O vento sul entra de frente em pontes, na Beira-Mar e no Sul da Ilha. Tende a derrubar a temperatura e trazer rajadas fortes. Se for sair, proteja o peito com corta-vento e redobre a atenção na travessia das pontes!
        </div>
      `;
    }

    // Hero com Veredito, Vento e Bússola
    const windDirName = window.FloripaVelo.Utils.getWindDirectionName(currentHourData.d);
    html += `
      <div class="hero">
        <div class="lbl">Dá para pedalar agora?</div>
        <div class="ver ${overallVerdict}">${verdictTitles[overallVerdict]}</div>
        <div class="sub" style="color:#A8A8A0;margin:6px 0 14px">
          ${Weather.getNextGoodWindow(currentIdx, weather)}
        </div>
        
        <div class="hrow">
          <div>
            <span class="num">${currentHourData.v}</span>
            <span class="un">km/h</span>
            <div class="from">vindo do ${windDirName}</div>
          </div>
          <svg class="comp" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#3A3A3A" stroke-width="2"/>
            <text x="60" y="15">N</text>
            <text x="108" y="64">L</text>
            <text x="60" y="114">S</text>
            <text x="12" y="64">O</text>
            <g transform="rotate(${currentHourData.d + 180} 60 60)">
              <path d="M60 22 L76 60 L60 52 L44 60 Z" fill="#D4FF3A"/>
              <line x1="60" y1="54" x2="60" y2="96" stroke="#D4FF3A" stroke-width="5" stroke-linecap="round"/>
            </g>
          </svg>
        </div>

        <div class="rs" style="margin-top:14px">
          ${factors.map(f => `<div><i class="dot ${f[0]}"></i>${f[1]}</div>`).join('')}
        </div>
      </div>
    `;

    // Gráfico de vento das próximas 24h
    const next24 = weather.hs.slice(currentIdx, currentIdx + 24);
    const maxWind24 = Math.max(20, ...next24.map(x => x.v));
    html += `
      <div class="card">
        <div class="lbl">Vento nas próximas 24 horas (km/h)</div>
        <div class="chart">
          ${next24.map(h => `
            <div class="bar1 ${Weather.classifyHour(h)}">
              ${h.v}
              <i style="height:${Math.max(6, (h.v / maxWind24) * 80)}px"></i>
              <span>${pad2(h.h)}h</span>
            </div>
          `).join('')}
        </div>
        <div class="sub" style="margin-top:8px">
          <span style="color:#B8E600">■</span> Bom &nbsp;
          <span style="color:var(--ac)">■</span> Atenção &nbsp;
          <span style="color:#111">■</span> Evite (considera vento, rajada, chuva e calor)
        </div>
      </div>
    `;

    // NOVO: Checklist Pré-Pedal interativo para o iniciante não esquecer nada!
    const todayChecklist = window.FloripaVelo.State.checklist[todayStr] || {};
    const totalChecks = Config.CHECKLIST_PRE_PEDAL.length;
    const completedChecks = Config.CHECKLIST_PRE_PEDAL.filter(item => todayChecklist[item.id]).length;
    const isAllChecked = completedChecks === totalChecks;

    html += `
      <div class="card checklist-card">
        <div class="lbl">Checklist Rápido do Iniciante (${completedChecks}/${totalChecks})</div>
        <div class="sub" style="margin-bottom:8px">10 segundos antes de subir na bike para não ficar na mão:</div>
        ${Config.CHECKLIST_PRE_PEDAL.map(item => {
          const isDone = !!todayChecklist[item.id];
          return `
            <label class="chk ${isDone ? 'done' : ''}">
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="window.FloripaVelo.Views.Today.toggleChecklist('${item.id}')">
              <span>${item.texto}</span>
            </label>
          `;
        }).join('')}
        ${isAllChecked ? `<div class="sub" style="margin-top:8px;color:var(--success);font-weight:700">✓ Tudo pronto! Bom pedal, divirta-se!</div>` : ''}
      </div>
    `;

    // Sessão sugerida para hoje
    const scheduledToday = schedule.find(x => x.data === todayStr);
    const sessionType = scheduledToday ? scheduledToday.tipo : Training.getNextSessionType(completedRides, config.dias);
    const isRecovery = Training.isRecoveryWeek(completedRides);
    const sessionKm = scheduledToday ? scheduledToday.km : Training.calculateKmForType(sessionType, config, isRecovery);
    const hydration = Training.calculateHydrationAndFuel(sessionKm, config.vel, currentHourData.sens);

    html += `
      <div class="card">
        <div class="lbl">
          ${scheduledToday ? 'Sua sessão agendada para hoje' : 'Sessão sugerida para hoje'}
          ${isRecovery ? ' · semana de recuperação' : ''}
        </div>
        <div class="big">${sessionKm} km</div>
        <div class="sub" style="margin:2px 0 6px">
          <span class="tag" style="margin:0">${Config.TIPOS_TREINO[sessionType].nome}</span>
          ≈ ${formatMinutes(hydration.hours * 60)} pedalando a ${config.vel} km/h
        </div>
        <div class="sub">${Config.TIPOS_TREINO[sessionType].descricao}</div>
        <button class="btn p full" style="margin-top:12px" onclick="window.FloripaVelo.App.switchTab('plano')">
          Registrar este pedal
        </button>
      </div>
    `;

    // Para onde ir hoje (Recomendação baseada no vento)
    const isLightWind = currentHourData.v < 8;
    html += `
      <div class="card">
        <div class="lbl">Estratégia de Vento em Floripa</div>
        ${isLightWind ? `
          <div class="go">Vento fraco.<br>Vá para <b>qualquer lado</b>!</div>
          <div class="sub" style="margin-top:8px">O ar está calmo hoje na ilha, excelente para pedalar sem resistência.</div>
        ` : `
          <div class="go">Ida rumo ao <b>${windDirName}</b>.<br>Volta com vento a favor.</div>
          <div class="sub" style="margin-top:8px">
            Assim você enfrenta o vento contra descansado e volta cansado com ele te empurrando.
            ${currentHourData.v >= 25 ? ' <b>Atenção: vento forte! Considere um trajeto mais curto.</b>' : ''}
          </div>
        `}

        <div class="lbl" style="margin-top:16px">Seus destinos, do melhor ao pior com este vento:</div>
        ${destinations.length === 0 ? `
          <div class="sub" style="margin-top:6px">Você ainda não adicionou nenhum destino.</div>
          <div class="f" style="margin-top:10px">
            <button class="btn p" onclick="window.FloripaVelo.App.switchTab('mais')">+ Adicionar lugares em Floripa</button>
          </div>
        ` : `
          ${Routing.rankDestinations(destinations, currentHourData, sessionKm, config).slice(0, 5).map(item => {
            const tagText = ['Ida contra o vento (Ideal)', 'Vento de lado', 'Ida a favor (volta mais dura)'][item.grade];
            const fitText = Math.abs(item.totalKm - sessionKm) <= sessionKm * 0.25
              ? 'cabe certinho na sessão'
              : item.totalKm < sessionKm
                ? `menor que a sessão de ${sessionKm} km`
                : `maior que a sessão: vá só até a metade e volte`;

            return `
              <div class="pt">
                <div style="font-weight:700">${esc(item.destination.nome)}</div>
                ${!isLightWind ? `<span class="tag ${item.grade > 1 ? 'o' : ''}">${tagText}</span>` : ''}
                <div class="sub" style="margin-top:4px">
                  ${item.idaKm} km de ida ${item.destination.rota && item.destination.rota.up ? `· subida ~${item.destination.rota.up}m` : ''}
                  · Ida e volta ≈ ${Math.round(item.totalKm)} km (${fitText})
                  ${item.align.isRealRoute && !isLightWind ? `· vento de frente em ${Math.round(item.align.fraction * 100)}% da ida` : ''}
                </div>
              </div>
            `;
          }).join('')}
        `}
      </div>
    `;

    // Hidratação & Reposição Energética
    html += `
      <div class="card">
        <div class="lbl">Hidratação & Alimentação para esta sessão</div>
        <div class="mini" style="border:0;padding:0;margin-bottom:8px">
          <div><b style="color:var(--ink)">~${hydration.waterMl}</b>ml de água</div>
          <div><b style="color:var(--ink)">${hydration.gelCount}</b>gel(s) ou fruta</div>
        </div>
        <div class="sub">${hydration.text}</div>
        <div class="sub" style="margin-top:8px;font-size:11.5px">
          💡 <i>Dica de ouro:</i> Beba um gole de água a cada 15 a 20 minutos, mesmo sem sede. Quando a sede aparece, você já perdeu cerca de 2% do rendimento.
        </div>
      </div>
    `;

    // Alerta de manutenção da bike
    const totalBikeKm = window.FloripaVelo.State.getTotalBikeKm();
    const expiredMaintenance = bike.itens.filter(item => item.ult != null && totalBikeKm - item.ult >= item.cada);
    if (expiredMaintenance.length > 0) {
      html += `
        <div class="warn">
          <b>Manutenção da Bike:</b> ${expiredMaintenance.map(x => esc(x.nome)).join(', ')} (passou da quilometragem recomendada).
          Confira os detalhes na aba <b>Mais</b>.
        </div>
      `;
    }

    // SOS & Emergência rápida
    html += `
      <div class="card" style="border-left:6px solid #b91c1c">
        <div class="lbl" style="color:#b91c1c">Central de Segurança & SOS</div>
        <div class="sub">Se furar o pneu, quebrar a corrente ou precisar de socorro:</div>
        <div class="sos-row">
          <a class="sos-btn" href="tel:192">📞 SAMU: 192</a>
          <a class="sos-btn" href="tel:193">🚒 Bombeiros: 193</a>
          <a class="sos-btn" href="tel:153">🛡️ Guarda Floripa: 153</a>
          <a class="sos-btn" href="tel:190">🚓 PM: 190</a>
        </div>
      </div>
    `;

    el.innerHTML = html;
  }
};
