/**
 * ============================================================================
 * FLORIPA VELO - EXPORTAÇÃO PARA O CALENDÁRIO (ICALENDAR / .ICS)
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Calendar = {
  // Gera texto no padrão iCalendar (.ics)
  buildIcsContent(events) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const escapeIcs = text => String(text || '').replace(/([,;])/g, '\\$1');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Floripa Velo//PT-BR//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(ev => {
      const pad = window.FloripaVelo.Utils.pad2;
      const startDate = new Date(`${ev.data}T${pad(ev.hora)}:00:00`);
      const durationMinutes = Math.max(30, Math.round((ev.km / (ev.vel || 20)) * 60));
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

      const formatIcsDate = d => {
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
      };

      lines.push(
        'BEGIN:VEVENT',
        `UID:${ev.id}@floripavelo`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${formatIcsDate(startDate)}`,
        `DTEND:${formatIcsDate(endDate)}`,
        `SUMMARY:${ev.tipo ? window.FloripaVelo.Config.TIPOS_TREINO[ev.tipo]?.nome + ' · ' : ''}Pedal ${ev.km} km`,
        `DESCRIPTION:${escapeIcs(ev.desc)}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT60M', // Alerta 1 hora antes
        'ACTION:DISPLAY',
        'DESCRIPTION:Lembrete Floripa Velo: seu pedal começa em 1 hora!',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  },

  // Monta objeto do evento com dicas de vento
  formatEvent(session, config, weatherData) {
    const slot = window.FloripaVelo.Weather.getSlot(session.data, session.hora, weatherData);
    let desc = `Pedal planejado pelo Floripa Velo (${session.km} km). `;

    if (slot) {
      const dir = window.FloripaVelo.Utils.getWindDirectionName(slot.d);
      desc += `Previsão: vento ${slot.v} km/h de ${dir}. Dica: comece pedalando rumo ao ${dir} e volte a favor. Beba água!`;
    } else {
      desc += 'Hidrate-se bem antes de sair e confira a pressão dos pneus.';
    }

    return {
      id: session.id,
      data: session.data,
      hora: session.hora,
      km: session.km,
      vel: config.vel,
      tipo: session.tipo,
      desc
    };
  },

  // Baixa o .ics de uma única sessão
  downloadSingle(session, config, weatherData) {
    const event = this.formatEvent(session, config, weatherData);
    const icsString = this.buildIcsContent([event]);
    window.FloripaVelo.Utils.downloadFile('pedal-floripa-velo.ics', icsString, 'text/calendar');
  },

  // Baixa o .ics de todas as sessões agendadas da semana
  downloadAll(sessions, config, weatherData) {
    if (!sessions.length) return;
    const events = sessions.map(s => this.formatEvent(s, config, weatherData));
    const icsString = this.buildIcsContent(events);
    window.FloripaVelo.Utils.downloadFile('semana-floripa-velo.ics', icsString, 'text/calendar');
  }
};
