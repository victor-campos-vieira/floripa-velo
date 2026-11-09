/**
 * ============================================================================
 * FLORIPA VELO - APP BOOTSTRAPPER, NAVEGAÇÃO & ATUALIZAÇÃO CONTÍNUA
 * Inclui: Auto-refresh silencioso ao retomar o app (iOS Safari / PWA)
 * e gesto nativo de Pull-to-Refresh (arrastar para baixo para atualizar).
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.App = {
  activeTab: 'hoje',
  lastFetchTime: Date.now(),
  lastFetchHour: new Date().getHours(),
  isRefreshing: false,

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

  // Atualização forçada de previsão e condições climáticas
  async refreshData(force = true) {
    const config = window.FloripaVelo.State.config;
    if (!config) return;

    try {
      await window.FloripaVelo.Weather.fetchForecast(config, force);
      this.lastFetchTime = Date.now();
      this.lastFetchHour = new Date().getHours();
      this.renderAll();
    } catch (err) {
      console.warn('Erro ao atualizar dados climáticos:', err);
    }
  },

  // Auto-Refresh Inteligente ao Retomar o App (sem precisar matar ou reiniciar no iOS)
  initAutoRefresh() {
    this.lastFetchTime = Date.now();
    this.lastFetchHour = new Date().getHours();

    const checkAndRefresh = () => {
      const now = Date.now();
      const currentHour = new Date().getHours();
      const elapsedMinutes = (now - this.lastFetchTime) / 60000;

      // Se passou mais de 15 minutos ou mudou a hora cheia do dia
      if (elapsedMinutes >= 15 || currentHour !== this.lastFetchHour) {
        this.refreshData(true);
      }
    };

    // 1. Ao desbloquear o iPhone ou voltar de outro app (Instagram, WhatsApp, Safari)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndRefresh();
      }
    });

    // 2. Eventos adicionais do ciclo de vida móvel
    window.addEventListener('focus', checkAndRefresh);
    window.addEventListener('pageshow', checkAndRefresh);

    // 3. Verificação periódica a cada 5 minutos caso o app fique aberto fixado no guidão
    setInterval(checkAndRefresh, 5 * 60 * 1000);
  },

  // Gesto Nativo de Pull-to-Refresh (Arrastar para baixo no topo da tela)
  initPullToRefresh() {
    const indicator = window.FloripaVelo.Utils.$('#ptr-indicator');
    const ptrText = window.FloripaVelo.Utils.$('#ptr-text');
    if (!indicator || !ptrText) return;

    let startY = 0;
    let currentY = 0;
    let pulling = false;
    const threshold = 55;

    const getActiveView = () => window.FloripaVelo.Utils.$(`#v-${this.activeTab}`);

    document.addEventListener('touchstart', e => {
      const view = getActiveView();
      if (!view || this.isRefreshing) return;

      // Só inicia o gesto se o scroll estiver colado no topo absoluto
      if (view.scrollTop <= 2) {
        startY = e.touches[0].clientY;
        currentY = startY;
        pulling = true;
      } else {
        pulling = false;
      }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!pulling || this.isRefreshing) return;
      const view = getActiveView();
      if (!view || view.scrollTop > 2) {
        pulling = false;
        indicator.style.transform = '';
        indicator.classList.remove('pulling');
        return;
      }

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        // Aplica resistência física progressiva ao arrasto
        const pullDist = Math.min(80, deltaY * 0.42);
        indicator.classList.add('pulling');
        indicator.style.transform = `translateY(${Math.min(0, -48 + pullDist)}px)`;

        if (pullDist >= threshold) {
          ptrText.textContent = 'Solte para atualizar';
          if (navigator.vibrate && !indicator.dataset.vibrated) {
            navigator.vibrate(12);
            indicator.dataset.vibrated = 'true';
          }
        } else {
          ptrText.textContent = 'Puxe para atualizar';
          delete indicator.dataset.vibrated;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', async () => {
      if (!pulling || this.isRefreshing) return;
      pulling = false;
      delete indicator.dataset.vibrated;
      indicator.classList.remove('pulling');

      const deltaY = currentY - startY;
      const pullDist = deltaY * 0.42;

      if (deltaY > 0 && pullDist >= threshold) {
        this.isRefreshing = true;
        indicator.classList.add('active', 'loading');
        indicator.style.transform = 'translateY(0)';
        ptrText.textContent = 'Atualizando vento e condições...';

        try {
          await this.refreshData(true);
        } finally {
          setTimeout(() => {
            indicator.style.transform = 'translateY(-100%)';
            setTimeout(() => {
              indicator.classList.remove('active', 'loading');
              ptrText.textContent = 'Puxe para atualizar';
              this.isRefreshing = false;
            }, 260);
          }, 350);
        }
      } else {
        indicator.style.transform = '';
      }
    }, { passive: true });
  },

  // Inicialização do aplicativo
  async init() {
    // 1. Configura eventos da navegação
    window.FloripaVelo.Utils.$$('nav button').forEach(btn => {
      btn.onclick = () => this.switchTab(btn.dataset.a);
    });

    // 2. Inicializa recursos móveis nativos
    this.initAutoRefresh();
    this.initPullToRefresh();

    // 3. Renderiza primeiro esqueleto das views com dados locais
    this.renderAll();

    const config = window.FloripaVelo.State.config;
    if (!config) return;

    // 4. Busca previsão do tempo em background
    try {
      await this.refreshData(false);

      // 5. Se não houver pedais agendados na semana, sugere automaticamente
      if (!window.FloripaVelo.State.schedule.length && window.FloripaVelo.State.weather) {
        window.FloripaVelo.Views.Week.suggestAgain();
      }

      // 6. Se houver algum destino sem cálculo de rota, calcula
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
