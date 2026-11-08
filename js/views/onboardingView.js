/**
 * ============================================================================
 * FLORIPA VELO - VIEW: ONBOARDING (BOAS-VINDAS & PRIMEIRO ACESSO)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};
window.FloripaVelo.Views = window.FloripaVelo.Views || {};

window.FloripaVelo.Views.Onboarding = {
  selectedOrigin: null,

  // Usar GPS
  useGps() {
    const localEl = window.FloripaVelo.Utils.$('#oLocal');
    if (!navigator.geolocation) {
      localEl.textContent = 'Geolocalização não suportada neste aparelho.';
      return;
    }

    localEl.textContent = 'Obtendo localização pelo GPS…';
    navigator.geolocation.getCurrentPosition(
      async pos => {
        localEl.textContent = 'Identificando bairro pelo GPS…';
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const detected = await window.FloripaVelo.Routing.reverseGeocode(lat, lng);

        this.selectedOrigin = {
          nome: detected,
          lat,
          lng
        };
        localEl.textContent = `Partida confirmada: ${detected}`;
      },
      () => {
        localEl.textContent = 'Permissão de GPS recusada. Digite seu bairro acima.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  },

  // Seleção rápida de ponto de partida
  selectPresetOrigin(nome, lat, lng) {
    this.selectedOrigin = { nome, lat, lng };
    window.FloripaVelo.Utils.$('#oBusca').value = nome;
    window.FloripaVelo.Utils.$('#oLocal').textContent = `Partida selecionada: ${nome}`;
  },

  // Busca textual
  async searchOrigin(query) {
    const q = query.trim();
    const localEl = window.FloripaVelo.Utils.$('#oLocal');
    if (!q) return;

    try {
      localEl.textContent = 'Buscando endereço…';
      const results = await window.FloripaVelo.Routing.searchPlaces(q);
      if (results && results.length) {
        this.selectedOrigin = results[0];
        localEl.textContent = `Partida definida: ${results[0].nome} (${results[0].ref || ''})`;
      } else {
        localEl.textContent = 'Local não encontrado. Tente o nome de um bairro ou use a Beira-Mar.';
      }
    } catch (e) {
      localEl.textContent = 'Busca indisponível no momento. Use um dos atalhos abaixo.';
    }
  },

  // Concluir onboarding e salvar configuração inicial
  async finish() {
    // Se o usuário digitou no campo mas não apertou Enter
    const inputVal = window.FloripaVelo.Utils.$('#oBusca').value.trim();
    if (!this.selectedOrigin && inputVal) {
      await this.searchOrigin(inputVal);
    }

    // Fallback padrão: Beira-Mar Norte
    if (!this.selectedOrigin) {
      this.selectedOrigin = {
        nome: 'Beira-Mar Norte',
        lat: -27.5865,
        lng: -48.5440
      };
    }

    const maxKmValue = +window.FloripaVelo.Utils.$('#oMax').value;
    const daysPerWeek = +window.FloripaVelo.Utils.$('#oDias').value;
    const goalKm = +window.FloripaVelo.Utils.$('#oMeta').value;

    // Se nunca pedalou, começa com 5 km base, senão usa a distância escolhida
    const baseLong = maxKmValue === 0 ? 5 : Math.max(5, maxKmValue);

    window.FloripaVelo.State.config = {
      nome: this.selectedOrigin.nome,
      lat: this.selectedOrigin.lat,
      lng: this.selectedOrigin.lng,
      dias: daysPerWeek,
      meta: goalKm,
      L: baseLong,
      vel: 18
    };

    window.FloripaVelo.State.save();
    window.FloripaVelo.Utils.$('#onb').hidden = true;
    await window.FloripaVelo.App.init();
  },

  render() {
    const el = window.FloripaVelo.Utils.$('#onb');
    if (!el) return;

    el.innerHTML = `
      <div class="brand">FLORIPA<b>VELO</b></div>
      <h1 style="margin-top:14px">Vamos <b>Começar</b></h1>
      <div class="sub">
        Quatro perguntas rápidas para calibrar o vento, as rotas e o plano de evolução para você.
        Tudo pode ser alterado depois a qualquer momento na aba <b>Mais</b>.
      </div>

      <label>De onde você costuma sair para pedalar?</label>
      <div class="f" style="margin:0">
        <input id="oBusca" placeholder="Digite seu bairro, rua ou praia" style="flex:1"
               onchange="window.FloripaVelo.Views.Onboarding.searchOrigin(this.value)">
        <button class="btn" onclick="window.FloripaVelo.Views.Onboarding.useGps()">Meu GPS</button>
      </div>

      <!-- Atalhos rápidos em Floripa -->
      <div class="preset-grid" style="margin-top:8px">
        <button class="preset-chip" onclick="window.FloripaVelo.Views.Onboarding.selectPresetOrigin('Beira-Mar Norte', -27.5865, -48.5440)">
          Beira-Mar Norte
        </button>
        <button class="preset-chip" onclick="window.FloripaVelo.Views.Onboarding.selectPresetOrigin('Trindade / UFSC', -27.6015, -48.5180)">
          Trindade / UFSC
        </button>
        <button class="preset-chip" onclick="window.FloripaVelo.Views.Onboarding.selectPresetOrigin('Estreito / Continental', -27.5880, -48.5830)">
          Estreito / Continental
        </button>
        <button class="preset-chip" onclick="window.FloripaVelo.Views.Onboarding.selectPresetOrigin('Campeche', -27.6890, -48.4820)">
          Campeche
        </button>
      </div>
      <div class="sub" id="oLocal" style="margin-top:4px;font-weight:700"></div>

      <label>Qual a maior distância que você já pedalou até hoje?</label>
      <select id="oMax">
        <option value="0">Ainda não pedalei / Comecei agora</option>
        <option value="5" selected>Até 5 km</option>
        <option value="10">Uns 10 km</option>
        <option value="20">Uns 20 km</option>
        <option value="30">30 km ou mais</option>
      </select>

      <label>Quantos dias por semana quer pedalar?</label>
      <select id="oDias">
        <option value="2">2 dias na semana</option>
        <option value="3" selected>3 dias na semana (Recomendado)</option>
        <option value="4">4 dias na semana</option>
      </select>

      <label>Qual o seu objetivo principal?</label>
      <select id="oMeta">
        <option value="20">Conseguir pedalar 20 km sem cansaço</option>
        <option value="30" selected>Pedalar 30 km (cruzar a cidade com fôlego)</option>
        <option value="50">Pedalar 50 km (pedal longo de final de semana)</option>
        <option value="80">Pedalar 80 km (volta à Ilha completa)</option>
      </select>

      <button class="btn p full" style="margin-top:24px" onclick="window.FloripaVelo.Views.Onboarding.finish()">
        Começar Agora
      </button>
    `;
  }
};
