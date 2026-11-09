/**
 * ============================================================================
 * FLORIPA VELO - VIEW: ROTAS & GUIA DE FLORIPA (ANTIGO PLANO)
 * Foco em rotas seguras, ciclovias segregadas, horários de movimento e dicas práticas.
 * Zero formulários burocráticos de km manual.
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Plan = {
  render() {
    const el = window.FloripaVelo.Utils.$('#v-plano');
    const Config = window.FloripaVelo.Config;
    const { esc } = window.FloripaVelo.Utils;

    if (!el) return;

    el.innerHTML = `
      <h1>Rotas <b>& Guia</b></h1>
      <div class="sub">
        Rotas seguras em Florianópolis, infraestrutura de ciclovias e horários de movimento para iniciantes.
      </div>

      <!-- 1. PLANOS DE AÇÃO: ROTAS CLÁSSICAS EM FLORIPA -->
      <div class="card" style="margin-top:14px">
        <div class="lbl">Planos de Rotas Seguras em Floripa</div>
        <div class="sub" style="margin-bottom:12px">
          Trajetos testados para quem está começando, priorizando pistas 100% protegidas de carros:
        </div>

        ${Config.PLANOS_ROTAS_FLORIPA.map(plano => `
          <div class="pt" style="padding:12px 0">
            <div class="f" style="margin:0;justify-content:space-between">
              <b>${esc(plano.titulo)}</b>
              <span class="tag">${esc(plano.infra)}</span>
            </div>

            <div class="sub" style="margin-top:4px;color:var(--ink);font-weight:700">
              ${esc(plano.distancia)} · ${esc(plano.altimetria)}
            </div>

            <div class="sub" style="margin-top:4px">
              <b>Trajeto:</b> ${esc(plano.trajeto)}
            </div>

            <div class="sub" style="margin-top:3px;font-size:12px;color:var(--mut)">
              <b>Movimento:</b> ${esc(plano.movimento)}
            </div>

            <div class="tip-box" style="margin-top:8px">
              <b>Dica de Segurança:</b>
              ${esc(plano.dica)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 2. ONDE NÃO IR SE VOCÊ É INICIANTE -->
      <div class="card" style="border-left:6px solid var(--ac)">
        <div class="lbl" style="color:var(--ac)">Onde NÃO Ir se Você é Iniciante</div>
        <div class="sub" style="margin-bottom:10px">
          Trechos com trânsito pesado, curvas cegas ou acostamento perigoso em Floripa:
        </div>

        ${Config.ROTAS_PERIGOSAS_FLORIPA.map(perigo => `
          <div class="pt" style="border-bottom:1px solid #FF4D0033">
            <b style="color:var(--ink)">${esc(perigo.local)}</b>
            <div class="sub" style="margin-top:3px">
              ${esc(perigo.motivo)}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 3. GUIA PRÁTICO DE FÔLEGO E RITMO (SEM APPLE WATCH) -->
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
