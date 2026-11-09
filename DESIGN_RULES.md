# FLORIPA VELO · DIRETRIZES DE DESIGN & IDENTIDADE VISUAL

Este documento estabelece as regras inegociáveis de design, tipografia e ergonomia mobile do **Floripa Velo**. Toda e qualquer alteração no código deve respeitar rigorosamente este guia para preservar a identidade original.

---

## 1. Filosofia do Produto

* **O que o Floripa Velo É:** O app do **"Pré-Pedal Inteligente"**. Uma ferramenta de cockpit minimalista aberta em 30 segundos antes de subir na bike para responder: *"Dá para ir agora? Para onde vou contra o vento para voltar a favor? O que vestir? Quanta água levar?"*.
* **O que o Floripa Velo NÃO É:** Não é um concorrente do Strava. Não tem feed social, telemetria em tempo real, GPS tracking poluído ou elementos supérfluos.
* **Estilo Visual:** *Modern Minimalist Endurance* / *Swiss Brutalism*. Inspirado em instrumentação esportiva de alta precisão (Wahoo, Garmin, Rapha, Pas Normal Studios) e cartazes esportivos suíços de alto contraste.

---

## 2. Paleta de Cores Estrita

Não inventar novas cores ou degradês aleatórios. A paleta é fechada:

| Cor | Hex | Função |
| :--- | :--- | :--- |
| **Sand / Paper** | `#ECE8DF` | Fundo principal da aplicação (papel cru / asfalto claro) |
| **Ink** | `#0B0B0B` | Preto asfalto de alto contraste para bordas (2px), textos e cards escuros |
| **Volt Neon** | `#D4FF3A` | Verde-limão elétrico de alta visibilidade (segurança de ciclismo e destaque) |
| **Safety Orange** | `#FF4D00` | Laranja solar para alertas, vento e ênfase no logo |
| **Muted** | `#6D6A62` | Cinza neutro para metadados secundários e unidades |
| **Line** | `#0B0B0B26`| Linhas divisórias sutis |

---

## 3. Tipografia & Escala Original

O app utiliza exclusivamente duas famílias do Google Fonts:
1. **Archivo** (Width: 62..125, Weight: 500..900): para títulos e números gigantes.
2. **JetBrains Mono** (Weight: 500, 700): para rótulos (`.lbl`), botões (`.btn`), tags e dados tabulares.

### Escala de Fontes Inegociável:
* `.brand`: `font: 900 expanded 19px var(--fam); letter-spacing: -0.03em; text-transform: uppercase;`
* `h1`: `font: 900 ultra-condensed 54px var(--fam); line-height: 0.9; text-transform: uppercase;`
* `.ver` (Veredito): `font: 900 ultra-condensed 78px var(--fam); line-height: 0.85; text-transform: uppercase;`
* `.num` (Velocidade): `font: 900 ultra-condensed 150px var(--fam); line-height: 0.8; letter-spacing: -0.02em;`
* `.hero .num`: `font-size: 96px;`
* `.big` (Quilometragem): `font: 900 ultra-condensed 110px var(--fam); line-height: 0.85;`
* `.go`: `font: 900 ultra-condensed 38px var(--fam); text-transform: uppercase; line-height: 0.95;`
* `.lbl` (Rótulos de seção): `font: 700 10px var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--mut);`
* `.btn` (Botões): `font: 700 11px var(--mono); letter-spacing: 0.08em; text-transform: uppercase;`

---

## 4. Política Anti-Poluição Visual (Regra de Ouro)

> 🚫 **PROIBIDO O USO DE EMOJIS EM BOTÕES, RÓTULOS E TÍTULOS.**

* **ERRADO (Estilo IA genérica):** `📞 SAMU 192`, `💬 Avisar no WhatsApp`, `🍌 Lanche`, `👕 Roupa`, `⚙️ Calibrar`, `✓ Feito`.
* **CORRETO (Estilo Floripa Velo):** `SAMU 192`, `AVISAR NO WHATSAPP`, `LANCHE PRÉ-PEDAL`, `VESTUÁRIO SUGERIDO`, `CALIBRAGEM RECOMENDADA (PSI)`.
* A força visual vem do **contraste tipográfico em caixa alta (`uppercase`) e bordas sólidas**, nunca de ícones de emoji coloridos.
* O topo do app é **tipografia pura**:
  ```html
  <div class="brand">FLORIPA<b>VELO</b></div>
  <div class="loc">BEIRA-MAR NORTE</div>
  ```
  Nunca colocar imagem de ícone ou logo colado ao lado do texto da marca no topo.

---

## 5. Ergonomia Mobile & Safari iOS

Para evitar bugs clássicos no iPhone:
1. **Prevenção de Zoom Involuntário no Safari:**
   * Todos os campos `<input>`, `<select>` e `<textarea>` devem ter **`font-size: 16px !important;`** e `touch-action: manipulation;`. No iOS Safari, qualquer input com menos de 16px dá zoom automático na tela e quebra o layout.
2. **Corte no Topo (Notch / Dynamic Island):**
   * O container `.view` deve usar `padding-top: max(20px, calc(16px + env(safe-area-inset-top)));`.
   * **NUNCA** usar `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, pois isso força o Safari a renderizar a página por baixo do relógio e da barra de status do iOS.
3. **Ícone de Tela de Início (HomeScreen):**
   * A Apple **não aceita SVG** para `apple-touch-icon`. Deve sempre apontar para um arquivo **PNG** (180x180 px com fundo 100% preenchido).

---

## 6. Transparência na Geolocalização (GPS)

* Quando o ciclista clica em *"Meu GPS"*, o app **nunca** deve apenas dizer *"Minha posição"*.
* O app deve obrigatoriamente fazer geocodificação reversa e **mostrar com clareza o bairro detectado** (ex: *"Agronômica, Florianópolis"*), garantindo que o ciclista veja onde o sinal foi fixado e possa corrigir caso haja drift de sinal.

---

## 7. Densidade de Texto & Ergonomia de Botões

* **Cockpit em 15 Segundos:** O app foi desenhado para ser consultado antes de sair. Textos longos, parágrafos explicativos de teoria de treino ou checklists pesados na home são terminantemente proibidos. Use métricas diretas, números grandes e resumos de uma linha.
* **Ergonomia e Display de Botões:**
  * Qualquer elemento com classe `.btn` (seja `<button>` ou `<a>`) **deve obrigatoriamente** ter `display: inline-flex` ou `display: flex`, `box-sizing: border-box`, `align-items: center`, `justify-content: center` e `touch-action: manipulation`. Elementos inline puros com padding vertical vazam sobre outros textos em navegadores móveis (Safari iOS) e quebram o layout.
  * O modificador `.full` deve ter `display: flex; width: 100%; box-sizing: border-box;`.
* **Zero Cores Alheias:** Cores de marcas terceiras (como verde de WhatsApp `#25D366`) são proibidas. Todos os botões e links devem respeitar as cores institucionais (Ink `#0B0B0B`, Volt `#D4FF3A`, Laranja `#FF4D00` ou Branco com borda Ink).

---

## 8. Foco em Decisão Pré-Pedal vs Registro Manual de Km

* **Zero Burocracia Manual:** O app não tenta ser um diário manual de treino. Dispositivos como Apple Watch e Garmin já gravam batimentos e quilometragem automaticamente.
* **O Valor Único do Floripa Velo:** Focar exclusivamente no que o Strava e relógios não entregam antes de sair de casa:
  1. **Janela Ideal de Saída:** Quando o vento e a temperatura estão favoráveis hoje.
  2. **Estratégia do Vento:** Qual rumo tomar na ida para voltar com vento a favor.
  3. **Segurança de Ciclovias:** Destacar se a rota tem pista 100% segregada ou tráfego compartilhado perigoso em Floripa.
  4. **Movimento da Ciclovia:** Alertar quando a pista está vazia para pedalar ou cheia de pedestres/crianças.
