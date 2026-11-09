/**
 * ============================================================================
 * FLORIPA VELO - SERVIÇO DE CLIMA & PREVISÃO DO TEMPO (OPEN-METEO)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Weather = {
  // Tradução do índice UV
  getUvLabel(uv) {
    if (uv < 3) return 'baixo';
    if (uv < 6) return 'moderado';
    if (uv < 8) return 'alto';
    if (uv < 11) return 'muito alto';
    return 'extremo';
  },

  // Classificação da condição horária: 'bom', 'ok', 'ruim'
  classifyHour(h) {
    const isRuim = h.p >= 50 || h.v >= 30 || h.sens >= 36 || (h.r || 0) >= 45;
    if (isRuim) return 'ruim';
    const isOk = h.p >= 25 || h.v >= 18 || h.sens >= 32 || (h.r || 0) >= 32;
    if (isOk) return 'ok';
    return 'bom';
  },

  // Cálculo de pontuação de desconforto/dificuldade (menor = melhor para pedalar)
  calculateDiscomfortScore(h) {
    const windPenalty = h.v;
    const rainPenalty = h.p / 3;
    const heatPenalty = Math.max(0, h.sens - 31) * 1.5;
    return windPenalty + rainPenalty + heatPenalty;
  },

  // Agrega uma janela de horas (média de vento, máxima de chuva, sensação, etc.)
  aggregateHours(hours) {
    const count = hours.length;
    if (!count) return null;

    const avgWind = Math.round(hours.reduce((sum, h) => sum + h.v, 0) / count);
    const maxRain = Math.max(...hours.map(h => h.p));
    const maxSens = Math.max(...hours.map(h => h.sens));
    const maxUv = Math.max(...hours.map(h => h.uv));
    const maxTemp = Math.max(...hours.map(h => h.temp));
    const maxGust = Math.max(...hours.map(h => h.r || 0));

    const result = {
      v: avgWind,
      d: hours[0].d,
      p: maxRain,
      sens: maxSens,
      uv: maxUv,
      temp: maxTemp,
      r: maxGust
    };

    result.sc = hours.reduce((sum, h) => sum + this.calculateDiscomfortScore(h), 0) / count;
    result.nt = this.classifyHour(result);
    return result;
  },

  // Informações resumidas do melhor horário do dia
  getDaySummary(dayString, weatherData) {
    if (!weatherData || !weatherData.hs) return null;
    const today = window.FloripaVelo.Utils.todayDateString();
    const currentHour = new Date().getHours();

    const availableHours = weatherData.hs.filter(x => {
      return x.dia === dayString && x.h >= 5 && x.h <= 18 && (dayString !== today || x.h >= currentHour);
    });

    if (!availableHours.length) return null;

    let bestWindow = null;
    for (let i = 0; i < availableHours.length; i++) {
      const windowHours = availableHours.slice(i, i + 2);
      const agg = this.aggregateHours(windowHours);
      if (!bestWindow || agg.sc < bestWindow.sc) {
        bestWindow = {
          ...agg,
          h0: availableHours[i].h,
          n: windowHours.length
        };
      }
    }

    return {
      ...bestWindow,
      maxUv: Math.max(...availableHours.map(x => x.uv)),
      maxSens: Math.max(...availableHours.map(x => x.sens))
    };
  },

  // Slot específico por dia e hora
  getSlot(dayString, hour, weatherData) {
    if (!weatherData || !weatherData.hs) return null;
    const match = weatherData.hs.filter(x => x.dia === dayString && x.h >= hour && x.h <= hour + 1);
    return match.length ? this.aggregateHours(match) : null;
  },

  // Análise dos fatores detalhados para o momento atual (ou hora informada)
  evaluateFactors(startIndex, weatherData) {
    const hours = weatherData.hs.slice(startIndex, startIndex + 3);
    const current = hours[0] || {};
    const maxRainProb = Math.max(...hours.map(x => x.p || 0));
    const sumRainMm = hours.reduce((sum, x) => sum + (x.mm || 0), 0);
    const maxGust = Math.max(...hours.map(x => x.r || 0));
    const maxSens = Math.max(...hours.map(x => x.sens || 0));
    const maxWind = Math.max(...hours.map(x => x.v || 0));
    const maxUv = Math.round(Math.max(...hours.map(x => x.uv || 0)));
    const rainPeak = hours.find(x => x.p >= 50);

    const now = new Date();
    const sunsetTime = weatherData.ps[current.dia] || '18:30';
    const sunriseTime = weatherData.sr[current.dia] || '06:00';
    
    // Minutos até o pôr do sol
    const sunsetDate = new Date(`${current.dia}T${sunsetTime}:00`);
    const sunriseDate = new Date(`${current.dia}T${sunriseTime}:00`);
    const minsUntilSunset = (sunsetDate - now) / 60000;
    const isDaylight = now >= sunriseDate && now <= sunsetDate;

    const windDirName = window.FloripaVelo.Utils.getWindDirectionName(current.d || 0);

    return [
      // 1. Vento
      [
        maxWind >= 30 ? 'ruim' : maxWind >= 18 ? 'ok' : 'bom',
        `Vento ${current.v} km/h de ${windDirName}${maxWind > current.v + 3 ? ` (sobe para ${maxWind} km/h)` : ''}`
      ],
      // 2. Rajadas
      [
        maxGust >= 45 ? 'ruim' : maxGust >= 32 ? 'ok' : 'bom',
        `Rajadas de até ${maxGust} km/h`
      ],
      // 3. Chuva
      [
        maxRainProb >= 50 || sumRainMm >= 1 ? 'ruim' : maxRainProb >= 25 ? 'ok' : 'bom',
        maxRainProb >= 25
          ? `Chuva: ${maxRainProb}% nas próximas 3h${rainPeak ? `, pico às ${window.FloripaVelo.Utils.pad2(rainPeak.h)}h` : ''}`
          : 'Sem chuva prevista nas próximas 3 horas'
      ],
      // 4. Temperatura / Sensação
      [
        maxSens >= 36 ? 'ruim' : (maxSens >= 32 || current.sens <= 12) ? 'ok' : 'bom',
        current.sens <= 12
          ? `Frio: sensação de ${current.sens}°, use corta-vento`
          : `Sensação térmica de ${maxSens}°`
      ],
      // 5. Índice UV
      [
        maxUv >= 8 ? 'ok' : 'bom',
        `Índice UV ${maxUv} (${this.getUvLabel(maxUv)})${maxUv >= 3 ? ': passe protetor solar' : ''}`
      ],
      // 6. Luz solar
      [
        !isDaylight || minsUntilSunset < 45 ? 'ruim' : minsUntilSunset < 120 ? 'ok' : 'bom',
        !isDaylight
          ? 'Sem luz solar agora (luzes obrigatórias)'
          : `Luz do dia por mais ${window.FloripaVelo.Utils.formatMinutes(minsUntilSunset)} (pôr do sol às ${sunsetTime})`
      ]
    ];
  },

  // Próxima janela boa para pedalar
  getNextGoodWindow(startIndex, weatherData) {
    const hours = weatherData.hs;
    const isGood = x => this.classifyHour(x) === 'bom' && x.h >= 5 && x.h <= 17;

    if (isGood(hours[startIndex])) {
      let j = startIndex;
      while (j + 1 < hours.length && isGood(hours[j + 1]) && hours[j + 1].dia === hours[startIndex].dia) {
        j++;
      }
      return `Condição excelente agora até as ${window.FloripaVelo.Utils.pad2(hours[j].h + 1)}h.`;
    }

    const nextIndex = hours.findIndex((x, i) => i > startIndex && isGood(x));
    if (nextIndex < 0) {
      return 'Sem janela ideal prevista nos próximos 7 dias.';
    }

    const nextHour = hours[nextIndex];
    const dayLabel = nextHour.dia === hours[startIndex].dia
      ? 'hoje'
      : window.FloripaVelo.Utils.formatDateShort(nextHour.dia);

    return `Próxima janela favorável: ${dayLabel} às ${window.FloripaVelo.Utils.pad2(nextHour.h)}h.`;
  },

  // Janela de Ouro do Vento (melhor horário para sair hoje)
  getGoldenWindow(weatherData, todayStr) {
    if (!weatherData || !weatherData.hs) return null;
    const daylightHours = weatherData.hs.filter(x => x.dia === todayStr && x.h >= 5 && x.h <= 18);
    if (!daylightHours.length) return null;

    let bestBlock = null;
    let bestAvgScore = Infinity;

    for (let i = 0; i <= daylightHours.length - 2; i++) {
      const block = daylightHours.slice(i, Math.min(daylightHours.length, i + 3));
      const avgWind = block.reduce((s, h) => s + h.v, 0) / block.length;
      const maxRain = Math.max(...block.map(h => h.p));
      const score = avgWind + (maxRain > 40 ? 30 : maxRain > 15 ? 12 : 0);

      if (score < bestAvgScore) {
        bestAvgScore = score;
        bestBlock = block;
      }
    }

    if (!bestBlock || !bestBlock.length) return null;

    const startH = bestBlock[0].h;
    const endH = bestBlock[bestBlock.length - 1].h + 1;
    const avgV = Math.round(bestBlock.reduce((s, h) => s + h.v, 0) / bestBlock.length);
    const maxDayWind = Math.max(...daylightHours.map(x => x.v));

    const currentH = new Date().getHours();
    const isNow = currentH >= startH && currentH < endH;

    let statusText = '';
    if (isNow) {
      statusText = `Janela aberta agora! Melhor horário até às ${window.FloripaVelo.Utils.pad2(endH)}h.`;
    } else if (currentH < startH) {
      statusText = `Melhor horário para sair hoje: ${window.FloripaVelo.Utils.pad2(startH)}h às ${window.FloripaVelo.Utils.pad2(endH)}h.`;
    } else {
      statusText = `A janela mais calma hoje foi das ${window.FloripaVelo.Utils.pad2(startH)}h às ${window.FloripaVelo.Utils.pad2(endH)}h (${avgV} km/h).`;
    }

    const windDir = window.FloripaVelo.Utils.getWindDirectionName(bestBlock[0].d);
    let detailText = `Vento mais calmo do dia: ~${avgV} km/h vindo do ${windDir}.`;
    if (maxDayWind >= avgV + 6) {
      detailText += ` Em outros horários, as rajadas sobem para até ${maxDayWind} km/h.`;
    }

    return {
      horario: `${window.FloripaVelo.Utils.pad2(startH)}h às ${window.FloripaVelo.Utils.pad2(endH)}h`,
      avgV,
      maxDayWind,
      statusText,
      detailText,
      isNow
    };
  },

  // Busca dados na API Open-Meteo
  async fetchForecast(config, force = false) {
    if (!config || !config.lat || !config.lng) return null;

    const cacheKey = config.lat.toFixed(2) + config.lng.toFixed(2);
    const cached = window.FloripaVelo.State.weatherCache || null;

    // Cache de 30 minutos (1800000 ms)
    if (!force && cached && cached.k === cacheKey && (Date.now() - cached.t < 1800000)) {
      window.FloripaVelo.State.weather = cached.d;
      return cached.d;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lng}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max&timezone=America%2FSao_Paulo&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha na resposta Open-Meteo');

      const json = await res.json();
      const H = json.hourly;
      const Q = json.daily;
      const mapDaily = fn => Object.fromEntries(Q.time.map((d, i) => [d, fn(i)]));

      const weather = {
        hs: H.time.map((t, i) => ({
          dia: t.slice(0, 10),
          h: +t.slice(11, 13),
          temp: Math.round(H.temperature_2m[i]),
          sens: Math.round(H.apparent_temperature[i]),
          p: H.precipitation_probability[i] || 0,
          mm: H.precipitation[i] || 0,
          v: Math.round(H.wind_speed_10m[i]),
          d: H.wind_direction_10m[i],
          r: Math.round(H.wind_gusts_10m[i]),
          uv: H.uv_index[i] || 0
        })),
        ps: mapDaily(i => Q.sunset[i].slice(11, 16)),
        sr: mapDaily(i => Q.sunrise[i].slice(11, 16)),
        dd: mapDaily(i => ({
          tmin: Math.round(Q.temperature_2m_min[i]),
          tmax: Math.round(Q.temperature_2m_max[i]),
          mm: Math.round(Q.precipitation_sum[i] * 10) / 10,
          rj: Math.round(Q.wind_gusts_10m_max[i])
        }))
      };

      const cacheObj = { t: Date.now(), k: cacheKey, d: weather };
      try {
        localStorage.setItem('fv3_wx', JSON.stringify(cacheObj));
      } catch (e) {}
      window.FloripaVelo.State.weather = weather;
      return weather;
    } catch (err) {
      console.warn('Erro ao carregar clima:', err);
      // Fallback para cache existente
      try {
        const raw = localStorage.getItem('fv3_wx');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.d) {
            window.FloripaVelo.State.weather = parsed.d;
            window.FloripaVelo.State.weather.velha = true;
            return parsed.d;
          }
        }
      } catch (e) {}
      return null;
    }
  }
};
