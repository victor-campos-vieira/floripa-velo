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
  // Planos de Ação e Rotas Detalhadas em Floripa
  PLANOS_ROTAS_FLORIPA: [
    {
      id: 'plano_iniciante_beiramar',
      titulo: 'Plano 1: O Batismo Seguro na Beira-Mar',
      destLat: -27.5850,
      destLng: -48.5300,
      baseKmIda: 5.5,
      altimetria: 'Plano total (0 m de subida)',
      infra: '100% Ciclovia segregada',
      nivel: 'Iniciante absoluto',
      movimento: 'Vazia das 06h às 08h30 · Movimentada aos domingos (caminhantes e crianças)',
      trajeto: 'Ciclovia da Beira-Mar Norte: Trapiche ➔ Koxixo\'s / Titri ➔ Retorno',
      dica: 'Asfalto liso e plano. Reduza o ritmo nos cruzamentos com acessos de estacionamento e postos.'
    },
    {
      id: 'plano_travessia_pontes',
      titulo: 'Plano 2: Cruzando a Ponte Hercílio Luz',
      destLat: -27.5880,
      destLng: -48.5830,
      baseKmIda: 7.5,
      altimetria: 'Rampa suave de acesso à ponte (~40 m)',
      infra: 'Ciclovia + Passarela da Ponte',
      nivel: 'Iniciante / Confiança',
      movimento: 'Tranquila nos dias úteis · Bastante movimento de pedestres e fotos nos fins de semana',
      trajeto: 'Beira-Mar Norte ➔ Parque da Luz ➔ Ponte Hercílio Luz ➔ Beira-Mar Continental ➔ Retorno',
      dica: 'Atenção ao vento no vão central da ponte. Cruze as juntas metálicas de dilatação sempre reto (perpendicular), nunca na diagonal para o pneu não escorregar.'
    },
    {
      id: 'plano_expressa_sul',
      titulo: 'Plano 3: O Desafio do Aeroporto (Via Expressa Sul ➔ Boulevard 14/32)',
      destLat: -27.6680,
      destLng: -48.5440,
      baseKmIda: 16.5,
      altimetria: 'Predominantemente plano (~35 m)',
      infra: 'Ciclovia segregada + Ciclofaixa',
      nivel: 'Evolução / Ritmo',
      movimento: 'Livre e rápida na Via Expressa Sul · Atenção nos cruzamentos do Trevo da Seta',
      trajeto: 'Centro / Beira-Mar ➔ Via Expressa Sul ➔ Trevo da Seta / Carianos ➔ Boulevard 14/32',
      segmentos: [
        {
          nome: 'Trecho 1: Via Expressa Sul (~5,5 km)',
          infra: '100% ciclovia segregada',
          desc: 'Asfalto contínuo no canteiro da rodovia, totalmente separado dos carros. Retão livre para manter cadência.'
        },
        {
          nome: 'Trecho 2: Transição Trevo da Seta / Carianos (~2,5 km)',
          infra: 'Ciclofaixa pintada & calçada compartilhada',
          desc: 'Atenção redobrada: não é pista segregada! Cruzamento com semáforos, entradas de postos e trânsito do Trevo da Seta.'
        },
        {
          nome: 'Trecho 3: Acesso ao Novo Aeroporto (~8,5 km)',
          infra: 'Ciclovia segregada nova',
          desc: 'Pista nova asfaltada e segregada ao lado da nova rodovia até o Boulevard 14/32 do Floripa Airport.'
        }
      ],
      dicaIniciante: 'Opção curta: se 33 km for muito para o seu momento, pedale apenas o Trecho 1 (Via Expressa Sul até o Trevo da Seta) e retorne (~11 km total), aproveitando 100% de ciclovia protegida sem entrar no trânsito compartilhado.',
      dicaVento: 'Pista totalmente descampada. Se o vento sul estiver acima de 20 km/h, o retorno do aeroporto para o Centro será duríssimo. Verifique o vento antes de sair!'
    }
  ],

  // Pontos de Apoio Gratuitos em Floripa (Água Potável & Banheiro)
  PONTOS_APOIO_FLORIPA: [
    {
      id: 'apoio_trapiche',
      nome: 'Trapiche da Beira-Mar Norte',
      lat: -27.5852,
      lng: -48.5520,
      servicos: 'Água gelada & Banheiro limpo gratuito',
      desc: 'Base da Guarda Municipal e área de quadras. Bebedouros públicos acessíveis e banheiros mantidos pela Prefeitura.'
    },
    {
      id: 'apoio_koxixos',
      nome: 'Koxixo\'s (Beira-Mar Norte)',
      lat: -27.5850,
      lng: -48.5300,
      servicos: 'Bebedouro público & Quiosques',
      desc: 'Bebedouro no bolsão central e suporte nos quiosques da orla. Ponto de encontro tradicional de ciclistas.'
    },
    {
      id: 'apoio_parque_luz',
      nome: 'Parque da Luz (Cabeceira da Ponte)',
      lat: -27.5939,
      lng: -48.5659,
      servicos: 'Banheiros públicos & Bebedouro',
      desc: 'Parque arborizado na cabeceira insular da Ponte Hercílio Luz. Ótima parada antes ou depois de cruzar a ponte.'
    },
    {
      id: 'apoio_continental',
      nome: 'Beira-Mar Continental (Estreito)',
      lat: -27.5880,
      lng: -48.5830,
      servicos: 'Sanitários públicos & Ponto de apoio',
      desc: 'Sanitários municipais ao lado das quadras de areia e playground da Beira-Mar Continental.'
    },
    {
      id: 'apoio_boulevard',
      nome: 'Boulevard 14/32 (Aeroporto Floripa)',
      lat: -27.6680,
      lng: -48.5440,
      servicos: 'Oásis do ciclista: água, banheiros climatizados e mesas',
      desc: 'Espaço aberto ao público 24h, banheiros impecáveis, bebedouros, segurança patrimonial e praça com sombra.'
    }
  ],

  // Guia de Emergência: O que fazer na Virada Repentina de Vento Sul
  DICAS_VENTO_SUL: [
    {
      titulo: '1. Alivie a marcha imediatamente',
      texto: 'Não lute contra o vento empurrando marcha pesada. Coloque na marcha mais leve da bike e gire as pernas soltas (80-90 RPM). Isso protege os joelhos e poupa o músculo da fadiga prematura.'
    },
    {
      titulo: '2. Baixe o tronco sobre o guidão',
      texto: 'Flexione os cotovelos e aproxime o peito do guidão. Seu tronco ereto funciona como uma vela contra o vento. Baixar a postura corta a resistência aerodinâmica em mais de 30%.'
    },
    {
      titulo: '3. Feche o casaco ou coloque o corta-vento',
      texto: 'A frente fria de Vento Sul traz queda brusca de temperatura em Floripa. Suor nas costas associado a vento polar causa choque térmico e perda rápida de rendimento.'
    },
    {
      titulo: '4. Se estiver na Via Expressa Sul, mantenha duas mãos firmes',
      texto: 'A ciclovia da Expressa Sul é totalmente descampada. Rajadas de travessia podem empurrar a roda dianteira: segure o guidão com firmeza pelas duas manoplas.'
    }
  ],

  // Alertas de segurança em Floripa (onde o iniciante NÃO deve ir)
  ROTAS_PERIGOSAS_FLORIPA: [
    {
      local: 'Morro da Lagoa da Conceição (SC-404)',
      motivo: 'Subida íngreme com curvas cegas, sem ciclovia e sem acostamento utilizável. Tráfego rápido e constante de carros e ônibus.'
    },
    {
      local: 'SC-401 (Norte) e SC-405 (Sul)',
      motivo: 'Rodovias estaduais de 80 a 100 km/h. O acostamento acumula cacos de vidro, arames e cruzamentos de pista em alta velocidade.'
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
