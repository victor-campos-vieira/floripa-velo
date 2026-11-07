/**
 * ============================================================================
 * FLORIPA VELO - GERENCIADOR DE ESTADO & ARMAZENAMENTO LOCAL (LOCALSTORAGE)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.State = (() => {
  const STORAGE_KEYS = {
    CONFIG: 'fv2_cfg',
    COMPLETED: 'fv2_feitos',
    DESTINATIONS: 'fv2_destinos',
    SCHEDULE: 'fv2_agenda',
    BIKE: 'fv2_bike',
    WEATHER: 'fv3_wx',
    CHECKLIST: 'fv_checklist'
  };

  // Funções de leitura segura do LocalStorage
  const loadItem = (key, fallback) => {
    try {
      const data = localStorage.getItem(key);
      return data != null ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Erro ao carregar chave ${key}:`, e);
      return fallback;
    }
  };

  const saveItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao salvar chave ${key}:`, e);
    }
  };

  // Carrega estado inicial
  const config = loadItem(STORAGE_KEYS.CONFIG, null);
  const completedRides = loadItem(STORAGE_KEYS.COMPLETED, []);
  let destinations = loadItem(STORAGE_KEYS.DESTINATIONS, []);
  let schedule = loadItem(STORAGE_KEYS.SCHEDULE, []);
  const bike = loadItem(STORAGE_KEYS.BIKE, {
    extra: 0,
    itens: window.FloripaVelo.Config.DEFAULT_BIKE_ITEMS
  });
  const checklist = loadItem(STORAGE_KEYS.CHECKLIST, {});

  // Filtra itens agendados no passado
  const today = window.FloripaVelo.Utils.todayDateString();
  schedule = schedule.filter(item => item.data >= today).map(item => ({
    tipo: 'leve',
    ...item
  }));

  // Se destinos estiver vazio e já houver configuração, pré-carrega os 2 primeiros presets de Floripa
  if (destinations.length === 0 && config) {
    const presets = window.FloripaVelo.Config.PRESET_DESTINATIONS;
    destinations = [
      {
        id: window.FloripaVelo.Utils.uid(),
        nome: presets[0].nome,
        lat: presets[0].lat,
        lng: presets[0].lng,
        ref: presets[0].ref
      },
      {
        id: window.FloripaVelo.Utils.uid(),
        nome: presets[1].nome,
        lat: presets[1].lat,
        lng: presets[1].lng,
        ref: presets[1].ref
      }
    ];
  }

  // Objeto de estado reativo
  const state = {
    config,
    completedRides,
    destinations,
    schedule,
    bike,
    weather: null,
    checklist,

    // Salvar todo o estado no localStorage
    save() {
      saveItem(STORAGE_KEYS.CONFIG, this.config);
      saveItem(STORAGE_KEYS.COMPLETED, this.completedRides);
      saveItem(STORAGE_KEYS.DESTINATIONS, this.destinations);
      saveItem(STORAGE_KEYS.SCHEDULE, this.schedule);
      saveItem(STORAGE_KEYS.BIKE, this.bike);
      saveItem(STORAGE_KEYS.CHECKLIST, this.checklist);
    },

    // Total de quilometragem da bicicleta
    getTotalBikeKm() {
      const ridesTotal = this.completedRides.reduce((acc, ride) => acc + (+ride.km || 0), 0);
      return ridesTotal + (+this.bike.extra || 0);
    },

    // Apagar todos os dados e reiniciar
    resetAll() {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      // Limpeza de chaves legadas também
      localStorage.removeItem('fv2_wx');
      localStorage.removeItem('fv2_ck');
      location.reload();
    }
  };

  return state;
})();
