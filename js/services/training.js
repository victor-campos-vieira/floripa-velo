/**
 * ============================================================================
 * FLORIPA VELO - SERVIÇO DE TREINAMENTO, EVOLUÇÃO & NUTRIÇÃO
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Training = {
  // Quantidade de treinos longos já realizados
  countLongRides(completedRides) {
    return completedRides.filter(r => r.tipo === 'longao').length;
  },

  // Semana de recuperação / regenerativa (a cada 4º ciclo)
  isRecoveryWeek(completedRides) {
    const count = this.countLongRides(completedRides);
    return count > 0 && (count + 1) % 4 === 0;
  },

  // Tipos de treinos previstos para a semana baseado na quantidade de dias
  getWeeklyTypes(daysPerWeek) {
    if (daysPerWeek <= 2) {
      return ['longao', 'leve'].slice(0, daysPerWeek);
    }
    const base = ['longao', 'ritmo', 'leve'];
    while (base.length < daysPerWeek) {
      base.push('leve');
    }
    return base.slice(0, daysPerWeek);
  },

  // Próximo tipo de treino na sequência
  getNextSessionType(completedRides, daysPerWeek) {
    const types = this.getWeeklyTypes(daysPerWeek);
    return types[completedRides.length % types.length];
  },

  // Distância sugerida em km para determinado tipo de treino
  calculateKmForType(type, config, isRecovery = false) {
    let baseKm = config.L;
    if (type === 'ritmo') {
      baseKm = config.L * 0.6;
    } else if (type === 'leve') {
      baseKm = config.L * 0.4;
    }

    const recoveryFactor = isRecovery ? 0.7 : 1.0;
    const adjusted = Math.round(baseKm * recoveryFactor);
    return Math.min(config.meta, Math.max(3, adjusted));
  },

  // Ajusta a evolução do iniciante após registrar um pedal
  // Regra fisiológica: apenas o Longão ajusta o teto de resistência
  adjustProgression(kmDone, feel, type, config) {
    if (type !== 'longao') return;

    if (kmDone < config.L * 0.8) {
      // Fez bem menos do que o planejado e achou pesado
      if (feel === 'pesado') {
        config.L = Math.max(3, Math.round(config.L * 0.95 * 10) / 10);
      }
    } else {
      // Concluiu o longão planejado
      const multiplier = {
        facil: 1.12,   // Sentiu muito fácil: sobe 12%
        medio: 1.05,   // Sentiu confortável/médio: sobe 5% (progressão segura)
        pesado: 0.95   // Sentiu no limite: recua 5% para consolidar
      }[feel] || 1.0;

      const bonus = feel === 'facil' ? 0.5 : 0;
      const newL = Math.min(config.meta, Math.max(3, (kmDone * multiplier) + bonus));
      config.L = Math.round(newL * 10) / 10;
    }
  },

  // Cálculo de hidratação e reposição energética (água + géis / carboidratos)
  calculateHydrationAndFuel(km, avgSpeed, apparentTemp = 25) {
    const hours = km / Math.max(10, avgSpeed);
    const tempMultiplier = apparentTemp >= 30 ? 1.4 : 1.0;
    // Base de 500ml de água por hora
    const waterMl = Math.max(400, Math.round((hours * 500 * tempMultiplier) / 50) * 50);

    let text = '';
    let gelCount = 0;

    if (hours < 1) {
      text = 'Para até 1 hora de pedal, apenas água é suficiente.';
    } else if (hours < 1.5) {
      text = 'Água em pequenos goles. Se sentir fome, leve 1 banana ou um lanche leve.';
    } else {
      // A partir de 1h de pedal, cerca de 30-60g de carboidrato por hora
      gelCount = Math.ceil((hours - 1) * 45 / 25);
      text = `A partir da 1ª hora, consuma de 30 a 60g de carboidrato por hora (1 gel de ~25g ou 1 banana). Sugestão: leve ${gelCount} gel(s) ou equivalente.`;
    }

    if (apparentTemp >= 30 || hours >= 2) {
      text += ' Com calor ou pedal acima de 2 horas, use bebida isotônica ou adicione eletrólitos na água para repor sais minerais.';
    }

    return {
      hours,
      waterMl,
      gelCount,
      text
    };
  },

  // Sugere os melhores dias da semana para pedalar com base no clima
  suggestWeeklyPlan(weatherData, config, completedRides) {
    if (!weatherData) return [];

    const days7 = window.FloripaVelo.Utils.getSevenDaysList();
    const Weather = window.FloripaVelo.Weather;

    // Analisa cada um dos 7 dias
    const dayCandidates = days7.map((d, index) => ({
      d,
      index,
      summary: Weather.getDaySummary(d, weatherData)
    })).filter(x => x.summary != null)
      .sort((a, b) => a.summary.sc - b.summary.sc); // menor score = melhor clima

    const targetDaysCount = Math.min(dayCandidates.length, config.dias);
    const chosen = [];

    // Prioriza dias com intervalo de descanso entre eles
    for (const item of dayCandidates) {
      if (chosen.length >= targetDaysCount) break;
      if (chosen.every(c => Math.abs(c.index - item.index) > 1)) {
        chosen.push(item);
      }
    }

    // Se faltarem dias, preenche com os melhores restantes
    for (const item of dayCandidates) {
      if (chosen.length >= targetDaysCount) break;
      if (!chosen.includes(item)) {
        chosen.push(item);
      }
    }

    // Distribui os treinos: o dia com MELHOR clima recebe o Longão!
    const weeklyTypes = this.getWeeklyTypes(config.dias);
    const sortedByWeather = [...chosen].sort((a, b) => a.summary.sc - b.summary.sc);
    const typeMapping = new Map(sortedByWeather.map((item, idx) => [item, weeklyTypes[idx]]));

    const isRecovery = this.isRecoveryWeek(completedRides);

    // Retorna ordenado cronologicamente
    return chosen.sort((a, b) => a.index - b.index).map(item => {
      const type = typeMapping.get(item) || 'leve';
      return {
        id: window.FloripaVelo.Utils.uid(),
        data: item.d,
        hora: item.summary.h0,
        tipo: type,
        km: this.calculateKmForType(type, config, isRecovery)
      };
    });
  }
};
