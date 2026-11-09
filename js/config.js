/**
 * ============================================================================
 * FLORIPA VELO - CONFIGURAÇÕES & DADOS GERAIS
 * ============================================================================
 */

window.FloripaVelo = window.FloripaVelo || {};

window.FloripaVelo.Config = {
  // Configuração padrão do perfil do iniciante
  DEFAULT_USER_CONFIG: {
    nome: 'Beira-Mar Norte',
    lat: -27.5865,
    lng: -48.5440,
    dias: 3,         // Dias na semana
    meta: 30,        // Meta inicial amigável (30 km)
    L: 10,           // Distância base do longão (iniciante)
    vel: 18          // Velocidade média em km/h (realista para iniciante)
  },

  // Itens padrão de manutenção da bicicleta
  DEFAULT_BIKE_ITEMS: [
    {
      id: 'bk_lube',
      nome: 'Lubrificar a corrente (óleo específico para bike)',
      cada: 150, // a cada 150 km em Floripa (maresia exige cuidado!)
      ult: null
    },
    {
      id: 'bk_freios',
      nome: 'Checar freios, pressão e desgaste dos pneus',
      cada: 300,
      ult: null
    },
    {
      id: 'bk_revisao',
      nome: 'Revisão completa e lubrificação na oficina',
      cada: 1200,
      ult: null
    }
  ],

  // Destinos populares e icônicos de Floripa pré-catalogados
  PRESET_DESTINATIONS: [
    {
      id: 'preset_bm_norte',
      nome: 'Beira-Mar Norte (Trapiche / Koxixo\'s)',
      lat: -27.5852,
      lng: -48.5480,
      ref: 'Avenida Beira-Mar Norte, Centro',
      desc: '100% plano, ciclovia contínua, ampla e segura. O melhor lugar para começar.',
      dificuldade: 'Iniciante (Plano)',
      infra: '100% Ciclovia segregada',
      movimento: 'Vazia das 06h às 08h · Muito movimentada após as 09h aos domingos'
    },
    {
      id: 'preset_ponte_hercilio',
      nome: 'Ponte Hercílio Luz (Mirante / Parque da Luz)',
      lat: -27.5939,
      lng: -48.5659,
      ref: 'Parque da Luz / Ponte Hercílio Luz',
      desc: 'Visual incrível, ciclovia na ponte. Atenção ao vento na travessia e pedestres.',
      dificuldade: 'Iniciante (Leve)',
      infra: 'Ciclovia + Passarela',
      movimento: 'Movimentada com pedestres nos fins de semana'
    },
    {
      id: 'preset_bm_continental',
      nome: 'Beira-Mar Continental (Estreito / Balneário)',
      lat: -27.5880,
      lng: -48.5830,
      ref: 'Beira-Mar Continental, Estreito',
      desc: 'Ciclovia larga, asfalto liso, plano e menos muvuca nos dias de semana.',
      dificuldade: 'Iniciante (Plano)',
      infra: '100% Ciclovia segregada',
      movimento: 'Tranquila quase sempre · Movimentada fins de tarde'
    },
    {
      id: 'preset_via_expressa_sul',
      nome: 'Ciclovia do Aeroporto (Via Expressa Sul / Carianos)',
      lat: -27.6680,
      lng: -48.5440,
      ref: 'Rodovia Gov. Aderbal Ramos da Silva / Aeroporto Floripa',
      desc: 'Ciclovia retilínea de longa extensão. Excelente para rodagem, mas venta bastante.',
      dificuldade: 'Moderado (Exposto ao vento)',
      infra: '100% Ciclovia contínua',
      movimento: 'Livre e rápida · Pouquíssimos pedestres'
    },
    {
      id: 'preset_santo_antonio',
      nome: 'Santo Antônio de Lisboa (Freguesia)',
      lat: -27.5050,
      lng: -48.5190,
      ref: 'Santo Antônio de Lisboa, Norte da Ilha',
      desc: 'Trecho gastronômico e pôr do sol clássico. Asfalto compartilhado com carros em partes.',
      dificuldade: 'Moderado (Tráfego)',
      infra: 'Ciclofaixa + Tráfego misto',
      movimento: 'Evite fins de semana à tarde (fila de carros)'
    },
    {
      id: 'preset_campeche',
      nome: 'Praia do Campeche (Avenida Pequeno Príncipe)',
      lat: -27.6890,
      lng: -48.4820,
      ref: 'Campeche, Sul da Ilha',
      desc: 'Acesso pelo Sul. Cuidado com o retorno se bater o Vento Sul!',
      dificuldade: 'Moderado / Longo',
      infra: 'Trecho rodoviário parcial',
      movimento: 'Tráfego intenso de carros em horário de pico'
    },
    {
      id: 'preset_lagoa',
      nome: 'Centrinho da Lagoa da Conceição',
      lat: -27.6040,
      lng: -48.4680,
      ref: 'Lagoa da Conceição',
      desc: 'Alerta de morro! Subir o Morro da Lagoa exige marcha muito leve ou empurrar a bike.',
      dificuldade: 'Difícil (Subida forte)',
      infra: 'Atenção: Rodovia sem ciclovia',
      movimento: 'Trânsito pesado de veículos e curvas cegas'
    }
  ],

  // Planos de Ação Prontos para Iniciantes em Floripa
  PLANOS_ROTAS_FLORIPA: [
    {
      id: 'plano_iniciante_beiramar',
      titulo: 'Plano 1: O Batismo Seguro na Beira-Mar',
      distancia: '8 a 12 km ida e volta',
      altimetria: 'Plano total (0 m de subida)',
      infra: '100% Ciclovia segregada',
      nivel: 'Iniciante absoluto',
      movimento: 'Vazia das 06h às 08h · Muito cheia nos domingos (09h às 11h30)',
      trajeto: 'Saia do Trapiche da Beira-Mar Norte rumo ao Koxixo\'s / Titri e retorne.',
      dica: 'Piso de asfalto liso e largo. Atenção aos cruzamentos com saídas de carros e reduza a velocidade perto de crianças e cães nos fins de semana.'
    },
    {
      id: 'plano_travessia_pontes',
      titulo: 'Plano 2: Cruzando a Ponte Hercílio Luz',
      distancia: '14 a 18 km ida e volta',
      altimetria: 'Rampa de acesso suave (~40 m)',
      infra: 'Ciclovia + Passarela da Ponte',
      nivel: 'Iniciante / Confiança',
      movimento: 'Movimentada no vão central aos sábados e domingos',
      trajeto: 'Beira-Mar Norte ➔ Parque da Luz ➔ Ponte Hercílio Luz ➔ Beira-Mar Continental e volta.',
      dica: 'No vão central da ponte o vento é encanado e sopra mais forte. Segure o guidão com firmeza e reduza a velocidade perto de pedestres.'
    },
    {
      id: 'plano_expressa_sul',
      titulo: 'Plano 3: O Retão do Aeroporto (Via Expressa Sul)',
      distancia: '20 a 26 km ida e volta',
      altimetria: 'Retão plano (~30 m)',
      infra: '100% Ciclovia contínua',
      nivel: 'Evolução / Ritmo',
      movimento: 'Livre e rápida · Quase zero pedestres o dia todo',
      trajeto: 'Início da Via Expressa Sul (Saco dos Limões) até o novo Aeroporto e volta.',
      dica: 'Pista excelente para pedalar sem parar e construir fôlego. Atenção crítica: pista totalmente descampada. Se o Vento Sul estiver forte (>20 km/h), a volta será dura!'
    }
  ],

  // Alertas de segurança em Floripa (onde o iniciante NÃO deve ir)
  ROTAS_PERIGOSAS_FLORIPA: [
    {
      local: 'Morro da Lagoa da Conceição (SC-404)',
      motivo: 'Subida muito íngreme, curvas cegas sem acostamento e tráfego rápido de ônibus e carros. Risco alto para quem ainda não tem marcha e fôlego.'
    },
    {
      local: 'SC-401 (Norte) e SC-405 (Sul)',
      motivo: 'Rodovias estaduais de 80 km/h. O acostamento acumula cacos de vidro, arames de pneu e saídas de pistas de alta velocidade.'
    }
  ],

  // Rosa dos ventos (8 direções principais)
  DIRECOES_VENTO: ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'],

  // Vereditos visuais
  VEREDITO: {
    bom: 'Sim, bora pedalar!',
    ok: 'Dá para ir, com atenção',
    ruim: 'Melhor evitar agora'
  },

  // Tipos de treino
  TIPOS_TREINO: {
    longao: {
      nome: 'Longão',
      descricao: 'O pedal mais longo da semana em "ritmo de conversa" (dá para falar frases inteiras sem ficar sem ar). O foco é acostumar o corpo e passar tempo no selim, sem pressa.'
    },
    ritmo: {
      nome: 'Ritmo',
      descricao: 'Aqueça 10 min bem leve. Depois alterne 5 min um pouco mais firme (esforço 6 de 10) com 5 min bem leve. Feche com 10 min tranquilos.'
    },
    leve: {
      nome: 'Leve (Recuperação)',
      descricao: 'Giro solto em marchas leves, esforço 3 a 4 de 10. Serve para soltar as pernas, bombear sangue e criar o hábito sem cansar.'
    }
  },

  // Termômetro de Roupas & Equipamentos pré-pedal
  getOutfitTip(apparentTemp, windSpeed, uvIndex) {
    let roupa = '';
    let acessorios = [];

    if (apparentTemp < 17) {
      roupa = 'Manga longa ou manguito + corta-vento leve (o vento contra esfria o peito rápido).';
    } else if (apparentTemp <= 23) {
      roupa = 'Camiseta respirável; se estiver ventando na orla, leve um corta-vento compacto no bolso.';
    } else if (apparentTemp <= 28) {
      roupa = 'Bermuda leve e camiseta de tecido seco (dry-fit). Evite algodão pesado.';
    } else {
      roupa = 'Roupa super leve e ventilada. Pedale em ritmo suave para não superaquecer.';
    }

    if (uvIndex >= 3) {
      acessorios.push('protetor solar no rosto/braços');
    }
    if (uvIndex >= 5 || apparentTemp >= 22) {
      acessorios.push('óculos escuros (protege do sol e de insetos no olho)');
    }
    if (windSpeed >= 20) {
      acessorios.push('atenção ao peito no vento contra');
    }

    return {
      roupa,
      acessorios: acessorios.length ? acessorios.join(', ') : 'nenhum acessório extra necessário'
    };
  },

  // Lanches rápidos pré-pedal (20 a 30 min antes de sair)
  LANCHES_PRE_PEDAL: [
    { nome: '1 banana com um fio de mel e aveia (energia de absorção rápida)' },
    { nome: '1 ou 2 fatias de pão com geleia ou requeijão leve' },
    { nome: 'Meio copo de suco de uva integral ou água de coco' }
  ],

  // Guia de Calibragem Rápida no Posto de Gasolina
  CALIBRADOR_PNEUS: {
    mtb: {
      nome: 'Mountain Bike (Pneu largo aro 29 / 2.0 a 2.3")',
      psiFrente: '28 a 32 PSI',
      psiTras: '32 a 36 PSI',
      dica: 'Pneu de MTB não precisa de muita pressão. Pressão alta faz a bike pular e escorregar no asfalto.'
    },
    urbana: {
      nome: 'Urbana / Híbrida (Aro 700x32 a 38c ou aro 26)',
      psiFrente: '45 a 50 PSI',
      psiTras: '50 a 55 PSI',
      dica: 'Excelente equilíbrio entre conforto e rolagem suave na ciclovia.'
    },
    speed: {
      nome: 'Speed / Estrada (Pneu fino 700x25 a 28c)',
      psiFrente: '80 a 85 PSI',
      psiTras: '85 a 95 PSI',
      dica: 'Atenção: precisa de adaptador de bico fino (válvula Presta) para o calibrador do posto.'
    }
  },

  // Checklist rápido pré-pedal para iniciantes (10 segundos)
  CHECKLIST_PRE_PEDAL: [
    { id: 'pneus', texto: 'Pneus calibrados (aperte com o polegar: não deve afundar fácil)' },
    { id: 'capacete', texto: 'Capacete afivelado e firme na cabeça (dois dedos acima da sobrancelha)' },
    { id: 'agua', texto: 'Garrafinha de água cheia no suporte' },
    { id: 'celular', texto: 'Celular carregado + documento / Pix para emergência' },
    { id: 'luzes', texto: 'Luz traseira vermelha e farol (se for pedalar fim de tarde ou noite)' }
  ],

  // Dicas práticas do pedal para iniciantes
  DICAS_INICIANTE: [
    {
      titulo: 'A Regra de Ouro do Vento em Floripa',
      texto: 'Sempre comece o pedal indo CONTRA o vento. No início você está descansado e com energia. Na volta, quando você já estiver cansado, o vento vai soprar nas suas costas e te empurrar para casa. Voltar com vento na cara é o erro número 1 que assusta iniciantes!'
    },
    {
      titulo: 'Marchas: Gire mais, empurre menos',
      texto: 'Não pedale "pesado" afundando os pedais devagar: isso força os joelhos e queima o músculo rápido. Coloque numa marcha mais leve e pedale girando os pés mais rápido (cerca de 80 giros por minuto). Parece leve demais no começo, mas poupa muito as pernas.'
    },
    {
      titulo: 'Como frear sem susto',
      texto: 'O freio de trás (geralmente mão direita) reduz a velocidade suavemente. O freio da frente (mão esquerda) segura a bike de verdade, mas se for apertado com violência numa descida ou curva pode travar a roda. Use os dois juntos suavemente, transferindo o peso do corpo levemente para trás.'
    },
    {
      titulo: 'A Dor no Selim (Banco)',
      texto: 'Nos primeiros 3 a 5 pedais, o bumbum vai reclamar um pouco. É normal e passa conforme você acostuma! Uma bermuda com forro (pad de ciclismo) ajuda 90%. Não use capas de gel muito grossas, pois elas costumam amassar e prender a circulação.'
    },
    {
      titulo: 'Subidas: Antecipe as marchas',
      texto: 'Não espere a bike parar na subida para tentar trocar de marcha: a corrente sob pressão pode estalar ou travar. Antes da subida começar, reduza para a coroa menor e catracas maiores.'
    }
  ],

  // Telefones de emergência
  EMERGENCIAS: [
    { nome: 'SAMU (Resgate)', tel: '192' },
    { nome: 'Bombeiros', tel: '193' },
    { nome: 'Guarda Municipal Floripa', tel: '153' },
    { nome: 'Polícia Militar', tel: '190' }
  ]
};
