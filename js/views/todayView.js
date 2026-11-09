/**
 * ============================================================================
 * FLORIPA VELO - VIEW: HOJE (TELA PRINCIPAL / COCKPIT PRÉ-PEDAL EM 15 SEGUNDOS)
 * Minimalista, sem excesso de texto, sem emojis, foco em dados e decisão rápida.
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Today = {
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

    // Topo oficial da marca
    let html = `
      <div class="brand">FLORIPA<b>VELO</b></div>
      <div class="loc">${esc(config.nome)}</div>
    `;

    if (!weather || !weather.hs) {
      html += `<div class="hero">Carregando vento e previsão…</div>`;
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
      .filter((_, idx) => idx !== 4)
      .reduce((max, f) => (rankMap[f[0]] > rankMap[max] ? f[0] : max), 'bom');

    const verdictTitles = {
      bom: 'Sim, bora',
      ok: 'Dá, com atenção',
      ruim: 'Melhor não agora'
    };

    if (weather.velha) {
      html += `<div class="warn">Modo offline: última previsão salva.</div>`;
    }

    // Alerta contextual de Vento Sul em Floripa (somente se vento forte)
    const isVentoSul = currentHourData.d >= 135 && currentHourData.d <= 225;
    if (isVentoSul && currentHourData.v >= 20) {
      html += `
        <div class="warn">
          <b>Vento Sul forte (${currentHourData.v} km/h):</b> rajadas frias em pontes e orlas. Use corta-vento.
        </div>
      `;
    }

    // 1. HERO CARD: Veredito, Vento e Bússola
    const windDirName = window.FloripaVelo.Utils.getWindDirectionName(currentHourData.d);
    const goldenWindow = Weather.getGoldenWindow(weather, todayStr);

    // Variáveis auxiliares do Cockpit de Luz Solar
    const nowTime = new Date();
    const sunsetStr = weather.ps[todayStr] || '18:30';
    const sunriseStr = weather.sr[todayStr] || '06:00';
    const sunsetDate = new Date(`${todayStr}T${sunsetStr}:00`);
    const sunriseDate = new Date(`${todayStr}T${sunriseStr}:00`);
    const minsUntilSunset = Math.round((sunsetDate - nowTime) / 60000);
    const isDaylight = nowTime >= sunriseDate && nowTime <= sunsetDate;

    let lightVal = '';
    let lightSub = '';
    if (!isDaylight) {
      lightVal = 'Noite';
      lightSub = 'Farol obrigatório';
    } else if (minsUntilSunset <= 60) {
      lightVal = `${Math.max(0, minsUntilSunset)} min`;
      lightSub = `Pôr às ${sunsetStr}`;
    } else {
      const hLight = Math.floor(minsUntilSunset / 60);
      const mLight = minsUntilSunset % 60;
      lightVal = mLight > 0 ? `${hLight}h${pad2(mLight)}` : `${hLight}h`;
      lightSub = `Pôr do sol ${sunsetStr}`;
    }
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

        <!-- COCKPIT DE CONDIÇÕES CRÍTICAS (CHUVA, SOL/UV, LUZ SOLAR) -->
        <div class="cond-grid">
          <div class="cond-item ${currentHourData.p >= 40 ? 'warn' : ''}">
            <div class="cond-lbl">Chuva</div>
            <div class="cond-val">${currentHourData.p}%</div>
            <div class="cond-sub">${currentHourData.p >= 50 ? 'Risco pista molhada' : currentHourData.p >= 25 ? 'Possível garoa' : 'Pista seca'}</div>
          </div>
          <div class="cond-item ${currentHourData.sens >= 32 || currentHourData.sens <= 14 ? 'warn' : ''}">
            <div class="cond-lbl">Sensação & UV</div>
            <div class="cond-val">${currentHourData.sens}°</div>
            <div class="cond-sub">UV ${currentHourData.uv} · ${Weather.getUvLabel(currentHourData.uv)}</div>
          </div>
          <div class="cond-item ${minsUntilSunset < 60 || !isDaylight ? 'warn' : ''}">
            <div class="cond-lbl">Luz Solar</div>
            <div class="cond-val">${lightVal}</div>
            <div class="cond-sub">${lightSub}</div>
          </div>
        </div>

        <div class="rs" style="margin-top:14px">
          ${factors.map(f => `<div><i class="dot ${f[0]}"></i>${f[1]}</div>`).join('')}
        </div>
      </div>

      <!-- JANELA IDEAL DE SAÍDA HOJE -->
      ${goldenWindow ? `
        <div class="card" style="border-left:6px solid var(--volt)">
          <div class="lbl" style="color:var(--ink)">Janela Ideal de Saída · Hoje</div>
          <div style="font:900 ultra-condensed 38px var(--fam);line-height:0.95;text-transform:uppercase;color:var(--ink)">
            ${goldenWindow.horario}
          </div>
          <div class="sub" style="margin-top:6px;font-weight:700;color:var(--ink)">
            ${goldenWindow.statusText}
          </div>
          <div class="sub" style="margin-top:2px">
            ${goldenWindow.detailText}
          </div>
        </div>
      ` : ''}
    `;

    // 2. CARD: Vento nas próximas 24 horas (Gráfico horário compacto)
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
        <div class="sub" style="margin-top:8px;font-size:11px">
          <span style="color:var(--volt)">■</span> Bom &nbsp;
          <span style="color:var(--ac)">■</span> Atenção &nbsp;
          <span style="color:var(--ink)">■</span> Evite
        </div>
      </div>
    `;

    // 3. CARD: Sessão de Hoje (com retorno estimado conciso)
    const scheduledToday = schedule.find(x => x.data === todayStr);
    const sessionType = scheduledToday ? scheduledToday.tipo : Training.getNextSessionType(completedRides, config.dias);
    const isRecovery = Training.isRecoveryWeek(completedRides);
    const sessionKm = scheduledToday ? scheduledToday.km : Training.calculateKmForType(sessionType, config, isRecovery);
    const hydration = Training.calculateHydrationAndFuel(sessionKm, config.vel, currentHourData.sens);

    const now = new Date();
    const durationMinutes = Math.round((sessionKm / config.vel) * 60);
    const returnTime = new Date(now.getTime() + durationMinutes * 60000);
    const returnH = pad2(returnTime.getHours());
    const returnM = pad2(returnTime.getMinutes());
    // Reutiliza sunsetDate calculado para a sessão
    const diffSunsetMinutes = Math.round((sunsetDate - returnTime) / 60000);

    html += `
      <div class="card">
        <div class="lbl">
          ${scheduledToday ? 'Sua sessão agendada' : 'Sessão sugerida'}
          ${isRecovery ? ' · recuperação' : ''}
        </div>
        <div class="big">${sessionKm} km</div>
        <div class="sub" style="margin:2px 0 6px">
          <span class="tag" style="margin:0">${Config.TIPOS_TREINO[sessionType].nome}</span>
          ≈ ${formatMinutes(durationMinutes)} a ${config.vel} km/h · Volta às ${returnH}h${returnM}${diffSunsetMinutes > 0 ? '' : ' (noite)'}
        </div>
        <div class="sub" style="font-size:11.5px;color:var(--mut);margin-bottom:12px">
          Base do seu perfil: ${config.L} km (${Config.TIPOS_TREINO[sessionType].nome.toLowerCase()}) · Ajustável na aba Mais
        </div>

        <button class="btn p full" onclick="window.FloripaVelo.App.switchTab('plano')">
          Ver Rotas Seguras em Floripa
        </button>
      </div>
    `;

    // 4. CARD: Para onde ir (Estratégia do vento e destinos)
    const isLightWind = currentHourData.v < 8;
    html += `
      <div class="card">
        <div class="lbl">Para onde ir</div>
        ${isLightWind ? `
          <div class="go">Vento fraco.<br>Vá para <b>qualquer lado</b>.</div>
        ` : `
          <div class="go">Ida rumo ao <b>${windDirName}</b>.<br>Volta com vento a favor.</div>
          <div class="sub" style="margin-top:6px">
            Enfrente o vento no começo e volte com ele te empurrando.
            ${currentHourData.v >= 25 ? ' <b>Vento forte: reduza a distância.</b>' : ''}
          </div>
        `}

        ${destinations.length === 0 ? `
          <div class="sub" style="margin-top:10px">Adicione lugares na aba <b>Mais</b> para ver o melhor trajeto neste vento.</div>
        ` : `
          <div class="lbl" style="margin-top:14px">Lugares recomendados para este vento:</div>
          ${Routing.rankDestinations(destinations, currentHourData, sessionKm, config).slice(0, 4).map(item => {
            const tagText = ['Ida contra o vento', 'Vento de lado', 'Ida a favor (volta dura)'][item.grade];
            const fitText = Math.abs(item.totalKm - sessionKm) <= sessionKm * 0.25
              ? 'cabe na sessão'
              : item.totalKm < sessionKm
                ? `menor que a sessão`
                : `maior (retorne antes)`;

            const infraTag = item.destination.infra || null;
            const isSegregada = infraTag && infraTag.toLowerCase().includes('100%');

            return `
              <div class="pt">
                <div class="f" style="margin:0;justify-content:space-between">
                  <b>${esc(item.destination.nome)}</b>
                  ${infraTag ? `
                    <span class="tag ${isSegregada ? '' : 'o'}">
                      ${esc(infraTag.split('·')[0].trim())}
                    </span>
                  ` : ''}
                </div>
                <div class="sub" style="margin-top:3px">
                  ${item.idaKm} km ida ${item.destination.rota && item.destination.rota.up ? `· subida ~${item.destination.rota.up}m` : ''}
                  · Total ≈ ${Math.round(item.totalKm)} km (${fitText})
                  ${!isLightWind ? `· ${tagText}` : ''}
                </div>
                ${item.destination.movimento ? `
                  <div class="sub" style="margin-top:2px;font-size:11.5px;color:var(--mut)">
                    Movimento: ${esc(item.destination.movimento)}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        `}
      </div>
    `;

    // 5. CARD: Água e reposição (sucinto e prático)
    html += `
      <div class="card">
        <div class="lbl">Hidratação & Reposição</div>
        <div class="mini" style="margin:6px 0 10px">
          <div>
            <b>~${hydration.waterMl}</b>
            ml de água
          </div>
          <div>
            <b>${hydration.gelCount > 0 ? hydration.gelCount : '0'}</b>
            ${hydration.gelCount === 1 ? 'gel ou fruta' : 'géis ou fruta'}
          </div>
        </div>
        <div class="sub">${hydration.text}</div>
      </div>
    `;

    // 6. Alerta de manutenção da bike (apenas se vencido)
    const totalBikeKm = window.FloripaVelo.State.getTotalBikeKm();
    const expiredMaintenance = bike.itens.filter(item => item.ult != null && totalBikeKm - item.ult >= item.cada);
    if (expiredMaintenance.length > 0) {
      html += `
        <div class="warn">
          <b>Bike:</b> ${expiredMaintenance.map(x => esc(x.nome)).join(', ')} (passou da hora). Veja na aba Mais.
        </div>
      `;
    }

    el.innerHTML = html;
  }
};
