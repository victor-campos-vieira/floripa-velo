/**
 * ============================================================================
 * FLORIPA VELO - APP BOOTSTRAPPER & NAVEGAÇÃO
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.App = {
  activeTab: 'hoje',

  // Alternar entre abas
  switchTab(tabName) {
    this.activeTab = tabName;
    const views = window.FloripaVelo.Utils.$$('.view');
    const navButtons = window.FloripaVelo.Utils.$$('nav button');

    views.forEach(v => {
      v.hidden = v.id !== `v-${tabName}`;
    });

    navButtons.forEach(btn => {
      btn.classList.toggle('on', btn.dataset.a === tabName);
    });

    window.scrollTo(0, 0);
    const currentView = window.FloripaVelo.Utils.$(`#v-${tabName}`);
    if (currentView) currentView.scrollTop = 0;
  },

  // Renderizar todas as telas ativas
  renderAll() {
    window.FloripaVelo.Views.Today.render();
    window.FloripaVelo.Views.Week.render();
    window.FloripaVelo.Views.Plan.render();
    window.FloripaVelo.Views.More.render();
  },

  // Inicialização do aplicativo
  async init() {
    // 1. Configura eventos da navegação
    window.FloripaVelo.Utils.$$('nav button').forEach(btn => {
      btn.onclick = () => this.switchTab(btn.dataset.a);
    });

    // 2. Renderiza primeiro esqueleto das views com dados locais
    this.renderAll();

    const config = window.FloripaVelo.State.config;
    if (!config) return;

    // 3. Busca previsão do tempo em background
    try {
      await window.FloripaVelo.Weather.fetchForecast(config);
      this.renderAll();

      // 4. Se não houver pedais agendados na semana, sugere automaticamente
      if (!window.FloripaVelo.State.schedule.length && window.FloripaVelo.State.weather) {
        window.FloripaVelo.Views.Week.suggestAgain();
      }

      // 5. Se houver algum destino sem cálculo de rota, calcula
      const uncalculated = window.FloripaVelo.State.destinations.some(d => d.rota === undefined);
      if (uncalculated) {
        await window.FloripaVelo.Routing.recalculateAllDestinations(
          window.FloripaVelo.State.destinations,
          config
        );
        window.FloripaVelo.State.save();
        this.renderAll();
      }
    } catch (e) {
      console.warn('Erro durante a inicialização do Floripa Velo:', e);
    }
  },

  // Ponto de entrada global
  start() {
    if (!window.FloripaVelo.State.config) {
      window.FloripaVelo.Views.Onboarding.render();
      window.FloripaVelo.Utils.$('#onb').hidden = false;
    } else {
      window.FloripaVelo.Utils.$('#onb').hidden = true;
      this.init();
    }
  }
};

// Dispara inicialização assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.FloripaVelo.App.start();
});
