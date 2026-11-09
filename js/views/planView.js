/**
 * ============================================================================
 * FLORIPA VELO - VIEW: ROTAS & GUIA DE FLORIPA
 * Foco em rotas seguras, ciclovias segregadas, infraestrutura real,
 * cálculo dinâmico a partir do bairro do ciclista e pontos de apoio gratuitos.
 * Zero formulários burocráticos de km manual.
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Plan = {
  render() {
    const el = window.FloripaVelo.Utils.$('#v-plano');
    const Config = window.FloripaVelo.Config;
    const config = window.FloripaVelo.State.config || Config.DEFAULT_USER_CONFIG;
    const { esc, distanceKm } = window.FloripaVelo.Utils;

    if (!el) return;

    el.innerHTML = `
      <h1>Rotas <b>& Guia</b></h1>
      <div class="sub">
        Rotas seguras em Floripa, infraestrutura real de ciclovias, pontos gratuitos de água e banheiro.
      </div>

      <!-- 1. PLANOS DE ROTAS SEGURAS (DINÂMICOS A PARTIR DO BAIRRO DO USUÁRIO) -->
      <div class="card" style="margin-top:14px">
        <div class="lbl">Rotas Clássicas & Seguras em Floripa</div>
        <div class="sub" style="margin-bottom:14px">
          Distâncias calculadas saindo de <b>${esc(config.nome)}</b>:
        </div>

        ${Config.PLANOS_ROTAS_FLORIPA.map(plano => {
          const directKm = distanceKm([config.lat, config.lng], [plano.destLat, plano.destLng]);
          const idaKm = plano.id === 'plano_expressa_sul'
            ? Math.round((plano.baseKmIda + Math.max(0, directKm - 9.1)) * 10) / 10
            : Math.max(3, Math.round(directKm * 1.35 * 10) / 10);
          const totalKm = Math.round(idaKm * 2 * 10) / 10;

          return `
            <div class="pt" style="padding:14px 0;border-bottom:1px solid var(--ln)">
              <div class="f" style="margin:0;justify-content:space-between;align-items:flex-start">
                <b style="font-size:15px;color:var(--ink)">${esc(plano.titulo)}</b>
                <span class="tag" style="margin-top:2px">${esc(plano.infra)}</span>
              </div>

              <div class="sub" style="margin-top:5px;color:var(--ink);font-weight:700">
                Saindo de ${esc(config.nome)}: ~${idaKm} km ida (~${totalKm} km ida e volta) · ${esc(plano.altimetria)}
              </div>

              <div class="sub" style="margin-top:5px">
                <b>Trajeto:</b> ${esc(plano.trajeto)}
              </div>

              <div class="sub" style="margin-top:3px;font-size:12px;color:var(--mut)">
                <b>Movimento:</b> ${esc(plano.movimento)}
              </div>

              ${plano.segmentos ? `
                <div style="margin-top:10px">
                  <div class="lbl" style="font-size:10px">Divisão Real dos 3 Trechos do Aeroporto:</div>
                  ${plano.segmentos.map(seg => `
                    <div class="segment-box">
                      <div class="segment-title">
                        <span>${esc(seg.nome)}</span>
                        <span class="support-badge">${esc(seg.infra)}</span>
                      </div>
                      <div class="sub" style="margin-top:3px;font-size:12px">${esc(seg.desc)}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${plano.dicaIniciante ? `
                <div class="tip-box" style="margin-top:10px;background:#FFF;border-left:4px solid var(--ink)">
                  <b>Opção Curta para Iniciantes:</b>
                  ${esc(plano.dicaIniciante)}
                </div>
              ` : ''}

              ${plano.dicaVento ? `
                <div class="tip-box" style="margin-top:8px;background:#FFF;border-left:4px solid var(--ac)">
                  <b>Atenção ao Vento:</b>
                  ${esc(plano.dicaVento)}
                </div>
              ` : ''}

              ${plano.dica ? `
                <div class="tip-box" style="margin-top:8px">
                  <b>Dica de Segurança:</b>
                  ${esc(plano.dica)}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- 2. PONTOS DE APOIO GRATUITOS (ÁGUA & BANHEIRO) -->
      <div class="card">
        <div class="lbl">Pontos Gratuitos de Apoio (Água & Banheiro)</div>
        <div class="sub" style="margin-bottom:12px">
          Lugares seguros e limpos para reabastecer a caramanhola e usar sanitários em Floripa:
        </div>

        ${Config.PONTOS_APOIO_FLORIPA.map(pto => {
          const distPto = Math.round(distanceKm([config.lat, config.lng], [pto.lat, pto.lng]) * 1.35 * 10) / 10;
          return `
            <div class="support-item">
              <div class="support-hdr">
                <span class="support-name">${esc(pto.nome)}</span>
                <span class="support-dist">~${distPto} km</span>
              </div>
              <div class="support-desc">${esc(pto.desc)}</div>
              <span class="support-badge">${esc(pto.servicos)}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 3. GUIA: VIRADA REPENTINA DE VENTO SUL -->
      <div class="card" style="border-left:6px solid var(--ac)">
        <div class="lbl" style="color:var(--ac)">O que fazer se o Vento Sul virar de repente?</div>
        <div class="sub" style="margin-bottom:10px">
          Em Florianópolis o Vento Sul entra com força e derruba a sensação térmica em minutos. Siga estas 4 regras se for pego na orla:
        </div>

        ${Config.DICAS_VENTO_SUL.map(dica => `
          <div class="tip-box" style="margin-bottom:8px">
            <b>${esc(dica.titulo)}</b>
            ${esc(dica.texto)}
          </div>
        `).join('')}
      </div>

      <!-- 4. ONDE NÃO IR SE VOCÊ É INICIANTE -->
      <div class="card" style="border-left:6px solid var(--ink)">
        <div class="lbl" style="color:var(--ink)">Onde NÃO Ir se Você é Iniciante</div>
        <div class="sub" style="margin-bottom:10px">
          Trechos com trânsito pesado, curvas cegas ou acostamento perigoso em Floripa:
        </div>

        ${Config.ROTAS_PERIGOSAS_FLORIPA.map(perigo => `
          <div class="pt" style="border-bottom:1px solid #FF4D0033;padding:8px 0">
            <b style="color:var(--ink)">${esc(perigo.local)}</b>
            <div class="sub" style="margin-top:3px">
              ${esc(perigo.motivo)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 5. GUIA PRÁTICO DE FÔLEGO E RITMO (SEM APPLE WATCH) -->
      <div class="card">
        <div class="lbl">Fôlego & Esforço (Sem Precisar de Relógio)</div>
        
        <div class="tip-box">
          <b>O Teste da Fala (Zona 2 Natural)</b>
          Enquanto estiver pedalando, tente falar uma frase completa em voz alta. Se você conseguir falar sem engasgar ou faltar ar, você está na zona aeróbica ideal (queima gordura e constrói fôlego sem estresse cardíaco). Se só conseguir soltar palavras ofegantes, você está forçando demais: alivie uma marcha e reduza a força.
        </div>

        <div class="tip-box">
          <b>Giro Rápido x Força Bruta (Proteja seus Joelhos)</b>
          Não pedale em marchas pesadas afundando o pedal com força. Coloque numa marcha mais leve e gire os pés rápido (cerca de 80 a 90 rotações por minuto, como se estivesse rodando solto). Isso transfere o esforço da articulação do joelho para o sistema cardiovascular, que se recupera muito mais rápido.
        </div>

        <div class="tip-box">
          <b>A Regra de Ouro do Vento em Floripa</b>
          Consulte sempre o vento antes de sair. A ida deve ser feita CONTRA o vento (quando suas pernas estão descansadas) para que a volta seja com o vento a favor empurrando você para casa. Voltar cansado contra o vento é o que mais desanima iniciantes!
        </div>
      </div>
    `;
  }
};
