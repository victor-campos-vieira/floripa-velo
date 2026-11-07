/**
 * ============================================================================
 * FLORIPA VELO - SERVIÇO DE ROTAS, GEOCODIFICAÇÃO & ANÁLISE DE VENTO
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Routing = {
  // Decodificador de Polyline (usado por Valhalla e OSRM)
  decodePolyline(encoded) {
    let index = 0, lat = 0, lng = 0;
    const coordinates = [];
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);

      coordinates.push([lat / 1e6, lng / 1e6]);
    }
    return coordinates;
  },

  // Limpa ruídos e pontas de rotas duplicadas
  cleanCoordinates(coords) {
    const dist = window.FloripaVelo.Utils.distanceKm;
    while (coords.length > 2 && dist(coords[0], coords[1]) > 0.35) {
      coords = coords.slice(1);
    }
    while (coords.length > 2 && dist(coords[coords.length - 1], coords[coords.length - 2]) > 0.35) {
      coords = coords.slice(0, -1);
    }
    return coords;
  },

  // Calcula soma total em km de uma lista de coordenadas
  calculateTotalKm(coords) {
    let km = 0;
    for (let i = 1; i < coords.length; i++) {
      km += window.FloripaVelo.Utils.distanceKm(coords[i - 1], coords[i]);
    }
    return km;
  },

  // Rota via BRouter (perfil trekking / bike)
  async routeViaBRouter(pts) {
    const param = pts.map(p => `${p[1].toFixed(6)},${p[0].toFixed(6)}`).join('|');
    const url = `https://brouter.de/brouter?lonlats=${param}&profile=trekking&alternativeidx=0&format=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('BRouter indisponível');
    const json = await res.json();
    const rawCoords = json.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
    const clean = this.cleanCoordinates(rawCoords);
    return { coordinates: clean, km: this.calculateTotalKm(clean) };
  },

  // Rota via Valhalla OSM (perfil ciclista híbrido)
  async routeViaValhalla(pts) {
    const payload = {
      locations: pts.map(p => ({ lat: p[0], lon: p[1] })),
      costing: 'bicycle',
      costing_options: { bicycle: { bicycle_type: 'Hybrid', use_roads: 0.4 } },
      directions_options: { units: 'km' }
    };
    const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(JSON.stringify(payload))}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Valhalla indisponível');
    const json = await res.json();
    const rawCoords = json.trip.legs.flatMap(leg => this.decodePolyline(leg.shape));
    const clean = this.cleanCoordinates(rawCoords);
    return { coordinates: clean, km: this.calculateTotalKm(clean) };
  },

  // Altimetria acumulada da rota via Open-Meteo Elevation
  async calculateElevationGain(coords) {
    if (!coords || coords.length < 2) return 0;
    const sampleSize = Math.min(80, coords.length);
    const step = (coords.length - 1) / Math.max(1, sampleSize - 1);
    const sampled = [];
    for (let i = 0; i < sampleSize; i++) {
      sampled.push(coords[Math.round(i * step)]);
    }

    const lats = sampled.map(p => p[0].toFixed(5)).join(',');
    const lngs = sampled.map(p => p[1].toFixed(5)).join(',');
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;
    const res = await fetch(url);
    if (!res.ok) return 0;

    const elevations = (await res.json()).elevation;
    let gain = 0;
    for (let i = 1; i < elevations.length; i++) {
      if (elevations[i] > elevations[i - 1]) {
        gain += (elevations[i] - elevations[i - 1]);
      }
    }
    return Math.round(gain);
  },

  // Calcula a rota completa para um destino
  async calculateDestinationRoute(destination, originCoord) {
    const origin = [originCoord.lat, originCoord.lng];
    const target = [destination.lat, destination.lng];
    let routeResult = null;

    // Tenta primeiro BRouter, depois Valhalla
    for (const routerFn of [this.routeViaBRouter.bind(this), this.routeViaValhalla.bind(this)]) {
      try {
        routeResult = await routerFn([origin, target]);
        if (routeResult && routeResult.coordinates.length > 2) break;
      } catch (e) {
        routeResult = null;
      }
    }

    // Se as APIs falharem, usa estimativa geométrica
    if (!routeResult) {
      const directKm = window.FloripaVelo.Utils.distanceKm(origin, target) * 1.35;
      destination.rota = {
        km: Math.round(directKm * 10) / 10,
        pts: [origin, target],
        up: 0,
        estimada: true
      };
      return destination.rota;
    }

    // Reduz pontos para salvar com eficiência no LocalStorage
    const ptsCount = Math.min(80, routeResult.coordinates.length);
    const step = (routeResult.coordinates.length - 1) / (ptsCount - 1);
    const compressedPts = [];
    for (let i = 0; i < ptsCount; i++) {
      compressedPts.push(routeResult.coordinates[Math.round(i * step)].map(n => +n.toFixed(5)));
    }

    destination.rota = {
      km: Math.round(routeResult.km * 10) / 10,
      pts: compressedPts,
      estimada: false
    };

    // Altimetria
    try {
      destination.rota.up = await this.calculateElevationGain(routeResult.coordinates);
    } catch (e) {
      destination.rota.up = 0;
    }

    return destination.rota;
  },

  // Recalcular rotas de todos os destinos cadastrados
  async recalculateAllDestinations(destinations, originCoord) {
    for (const d of destinations) {
      await this.calculateDestinationRoute(d, originCoord);
    }
  },

  // Análise da incidência do vento na rota de ida
  calculateWindAlignment(destination, windData, originCoord) {
    const windSpeed = windData.v;
    const windDirection = windData.d;

    // Se temos pontos reais da rota
    if (destination.rota && destination.rota.pts && destination.rota.pts.length > 2) {
      const pts = destination.rota.pts;
      let totalLength = 0;
      let headwindSum = 0;
      let headwindFraction = 0;

      for (let i = 1; i < pts.length; i++) {
        const segLen = window.FloripaVelo.Utils.distanceKm(pts[i - 1], pts[i]);
        if (segLen < 0.02) continue;

        const segBearing = window.FloripaVelo.Utils.bearingDegrees(pts[i - 1], pts[i]);
        const cosAngle = Math.cos((segBearing - windDirection) * Math.PI / 180);

        totalLength += segLen;
        headwindSum += segLen * cosAngle;
        if (cosAngle > 0.3) headwindFraction += segLen;
      }

      if (totalLength > 0) {
        return {
          headwind: windSpeed * (headwindSum / totalLength),
          fraction: headwindFraction / totalLength,
          isRealRoute: true
        };
      }
    }

    // Fallback: ângulo direto entre origem e destino
    const directBearing = window.FloripaVelo.Utils.bearingDegrees(
      [originCoord.lat, originCoord.lng],
      [destination.lat, destination.lng]
    );
    const cosAngle = Math.cos((directBearing - windDirection) * Math.PI / 180);

    return {
      headwind: windSpeed * cosAngle,
      fraction: cosAngle > 0.3 ? 1 : 0,
      isRealRoute: false
    };
  },

  // Retorna os km de ida (priorizando ajuste manual do usuário, depois rota calculada)
  getDestinationOneWayKm(destination, originCoord) {
    if (destination.kmIda) return destination.kmIda;
    if (destination.rota && destination.rota.km) return destination.rota.km;
    const direct = window.FloripaVelo.Utils.distanceKm(
      [originCoord.lat, originCoord.lng],
      [destination.lat, destination.lng]
    );
    return Math.round(direct * 1.35 * 10) / 10;
  },

  // Classifica os destinos pelo melhor alinhamento com o vento
  // Regra: se o vento está forte, o ideal é ir contra o vento na ida (g = 0) para voltar a favor!
  rankDestinations(destinations, windData, targetSessionKm, originCoord) {
    return destinations.map(d => {
      const align = this.calculateWindAlignment(d, windData, originCoord);
      const ida = this.getDestinationOneWayKm(d, originCoord);
      const totalRoundTrip = ida * 2;

      let grade = 1; // neutro / de lado
      if (windData.v < 8) {
        grade = 0; // Vento fraco, qualquer direção é boa
      } else if (align.headwind >= 3) {
        grade = 0; // Vento contra na ida (PERFEITO: volta a favor descansado)
      } else if (align.headwind <= -3) {
        grade = 2; // Vento a favor na ida (CUIDADO: volta contra cansado)
      }

      return {
        destination: d,
        align,
        idaKm: ida,
        totalKm: totalRoundTrip,
        grade
      };
    }).sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return Math.abs(a.totalKm - targetSessionKm) - Math.abs(b.totalKm - targetSessionKm);
    });
  },

  // Busca de locais em Florianópolis e região metropolitana
  async searchPlaces(query) {
    const q = query.trim();
    if (!q) return [];

    // Tenta primeiro no Photon (Komoot API)
    try {
      const url = `https://photon.komoot.io/api/?lat=-27.6&lon=-48.5&limit=8&q=${encodeURIComponent(q.includes(',') ? q : q + ' Florianópolis')}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const results = json.features
          .filter(f => {
            const [lon, lat] = f.geometry.coordinates;
            // Bounding box ampla (Florianópolis, São José, Palhoça, Biguaçu)
            return lat < -27.2 && lat > -28.2 && lon < -48.2 && lon > -48.9;
          })
          .map(f => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            nome: q.split(',')[0].trim(),
            ref: [
              f.properties.name,
              f.properties.street,
              f.properties.district || f.properties.suburb,
              f.properties.city
            ].filter(Boolean).join(', ')
          }));

        if (results.length) return results;
      }
    } catch (e) {}

    // Fallback: Nominatim OpenStreetMap
    const queries = [
      `${q}, Florianópolis, SC, Brasil`,
      `${q.replace(/beira\s*-?\s*mar/i, 'Beira-Mar')}, Florianópolis, SC`
    ];

    for (const item of queries) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=br&q=${encodeURIComponent(item)}`;
        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          if (list.length) {
            return list.map(x => ({
              lat: +x.lat,
              lng: +x.lon,
              nome: q.split(',')[0].trim(),
              ref: x.display_name.split(',').slice(0, 3).join(',')
            }));
          }
        }
      } catch (e) {}
    }

    return [];
  }
};
