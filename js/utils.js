/**
 * ============================================================================
 * FLORIPA VELO - UTILITÁRIOS GERAIS
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Utils = {
  // Atalhos de seleção do DOM
  $: selector => document.querySelector(selector),
  $$: selector => Array.from(document.querySelectorAll(selector)),

  // Gerador de ID curto único
  uid: () => Math.random().toString(36).slice(2, 9),

  // Escape seguro de caracteres HTML
  esc: str => {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  },

  // Formatar número com 2 dígitos (01, 02, etc.)
  pad2: n => String(n).padStart(2, '0'),

  // Formatar minutos em string legível ('1h15' ou '45 min')
  formatMinutes: mins => {
    mins = Math.round(mins);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h${window.FloripaVelo.Utils.pad2(m)}`;
    }
    return `${mins} min`;
  },

  // Data atual em formato YYYY-MM-DD
  todayDateString: () => {
    const d = new Date();
    return window.FloripaVelo.Utils.dateToString(d);
  },

  // Converter objeto Date para YYYY-MM-DD
  dateToString: d => {
    const y = d.getFullYear();
    const m = window.FloripaVelo.Utils.pad2(d.getMonth() + 1);
    const day = window.FloripaVelo.Utils.pad2(d.getDate());
    return `${y}-${m}-${day}`;
  },

  // Formatar data abreviada: "Sáb, 07/11"
  formatDateShort: dateStr => {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    }).replace('.', '');
  },

  // Retorna array com os próximos 7 dias em formato string
  getSevenDaysList: () => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(window.FloripaVelo.Utils.dateToString(d));
    }
    return list;
  },

  // Distância esférica entre dois pontos (fórmula de Haversine em km)
  distanceKm: (coordA, coordB) => {
    const rad = deg => (deg * Math.PI) / 180;
    const dLat = rad(coordB[0] - coordA[0]);
    const dLng = rad(coordB[1] - coordA[1]);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(rad(coordA[0])) * Math.cos(rad(coordB[0])) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
  },

  // Azimute / Ângulo de bússola entre dois pontos (0 a 360°)
  bearingDegrees: (coordA, coordB) => {
    const rad = Math.PI / 180;
    const y = Math.sin((coordB[1] - coordA[1]) * rad) * Math.cos(coordB[0] * rad);
    const x = Math.cos(coordA[0] * rad) * Math.sin(coordB[0] * rad) -
              Math.sin(coordA[0] * rad) * Math.cos(coordB[0] * rad) * Math.cos((coordB[1] - coordA[1]) * rad);
    return (Math.atan2(y, x) / rad + 360) % 360;
  },

  // Nome da direção do vento (Norte, Nordeste, etc.)
  getWindDirectionName: deg => {
    const directions = window.FloripaVelo.Config.DIRECOES_VENTO;
    const index = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
    return directions[index];
  },

  // Helper para baixar arquivo (backup JSON ou calendário .ics)
  downloadFile: (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  // Copiar texto para a área de transferência com feedback
  copyToClipboard: async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  }
};
