import { allCards, linkFusions, xyzFusions,synchroFusions } from './cards.js';

// Variáveis globais
let playerField = [null, null, null, null]; // Slots do jogador
const magicField = [null, null, null];
let fusionField = null;
let opponentField = [null, null, null, null]; // Slots do oponente
const opponentMagicField = [null, null, null];
let opponentFusionField = null;
let DEBUG_MODE = true;
let selectedCard = null; // Carta selecionada para combate
let playerHP = 20;
let opponentHP = 20;
let canDrawThisTurn = true;
let invocacaoNormalFeita = false; // controla a invocação normal no turno
let invocacaoSacrificioFeita = false;
let turn = 0;
let playerHand = []; // cartas na mão
let selectedHandCard = null
let deck = [];
const specialDeck = [];
const opponentSpecialDeck = [];
let opponentDeck = [];
let opponentHand = [];
let grave = [];
let opponentGrave = [];
let lastDrawnCard = null;
let selectedDeck = {};
let sacrificiosSelecionadosCallback = null;
let animacaoEntradaCampo = false;
const MAX_DECK_SIZE = 20;
const keywordColorMap = {
  'ROBUSTO': 'gold',
  'ENFRAQUECER': 'lightgreen',
  'ESCUDO': 'gray',
  'VAMPIRICO': 'red',
  'FEROZ': 'orange',
  'IMUNE': 'blue',
};

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}


function createOpponentDeck() {
  for (let i = 0; i < 20; i++) { // 20 cartas
    const randomCard = { ...allCards[Math.floor(Math.random() * allCards.length)] };
    opponentDeck.push(randomCard);
  }
  for (let i = 0; i < 5; i++) { 
    const randomCard = { ...opponentDeck[Math.floor(Math.random() * opponentDeck.length)] };
    opponentDeck.pop(randomCard);
    opponentHand.push(randomCard);
  }
  const extras = [...linkFusions, ...xyzFusions, ...synchroFusions]
      .map(f => f.resultado);

    shuffleArray(extras);
    for (let i = 0; i < Math.min(5, extras.length); i++) {
      opponentSpecialDeck.push(extras[i]);
  }

}


  
function addToSpecialDeck(card) {
  if (specialDeck.length >= 5) {
    return log('Deck Especial já está cheio (5 cartas).');
  }
  specialDeck.push({ name: card.name, card });
  renderSpecialDeckUI();
  log(`’${card.name}’ adicionada ao Deck Especial.`);
}

function removeFromSpecialDeck(index) {
  const removed = specialDeck.splice(index, 1)[0];
  renderSpecialDeckUI();
  log(`’${removed.name}’ removida do Deck Especial.`);
}

function renderSpecialDeckUI() {
  const container = document.getElementById('special-deck');
  container.innerHTML = ''; 
  specialDeck.forEach((entry, idx) => {
    const el = createCardElement(entry.card);
    el.classList.add('in-special-deck');
    // botão para remover
    const btn = document.createElement('button');
    btn.textContent = '✕';
    btn.classList.add('remove-special-btn');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeFromSpecialDeck(idx);
    });
    el.appendChild(btn);
    container.appendChild(el);
  });
  document.getElementById('special-count').textContent =
    `Deck Especial: ${specialDeck.length}/5`;
}

function initDeckManager() {
  createOpponentDeck();

  const available = document.getElementById('available-cards');
  available.innerHTML = '';

  // Renderiza painel do Deck Especial acima
  const manager = document.getElementById('deck-manager');
  const specialPanel = document.createElement('div');
  specialPanel.id = 'special-deck-panel';
  specialPanel.innerHTML = `
    <h2>Deck Especial (max 5)</h2>
    <p id="special-count">Deck Especial: 0/5</p>
    <div id="special-deck" class="cards-row"></div>
    
    <h3>Link Monsters</h3>
    <div id="link-deck" class="cards-row"></div>
    
    <h3>XYZ Monsters</h3>
    <div id="xyz-deck" class="cards-row"></div>
    
    <h3>Synchro Monsters</h3>
    <div id="synchro-deck" class="cards-row"></div>
    
    <hr/>
  `;
  manager.appendChild(specialPanel);

  // Link Monsters
  const linkContainer = document.getElementById('link-deck');
  linkFusions.forEach(lf => {
    const card = lf.resultado;
    const cardEl = createCardElement(card);
    cardEl.classList.add('card', 'link-card');

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.title = 'Adicionar Link Monster ao Deck Especial';
    addBtn.classList.add('add-special-btn');
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      addToSpecialDeck(card);
    });

    cardEl.appendChild(addBtn);
    linkContainer.appendChild(cardEl);
  });

  // XYZ Monsters
  const xyzContainer = document.getElementById('xyz-deck');
  xyzFusions.forEach(xf => {
    const card = xf.resultado;
    const cardEl = createCardElement(card);
    cardEl.classList.add('card', 'xyz-card');

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.title = 'Adicionar XYZ Monster ao Deck Especial';
    addBtn.classList.add('add-special-btn');
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      addToSpecialDeck(card);
    });

    cardEl.appendChild(addBtn);
    xyzContainer.appendChild(cardEl);
  });

  // Synchro Monsters
  const synchroContainer = document.getElementById('synchro-deck');
  synchroFusions.forEach(sf => {
    const card = sf.resultado;
    const cardEl = createCardElement(card);
    cardEl.classList.add('card', 'synchro-card');

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.title = 'Adicionar Synchro Monster ao Deck Especial';
    addBtn.classList.add('add-special-btn');
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      addToSpecialDeck(card);
    });

    cardEl.appendChild(addBtn);
    synchroContainer.appendChild(cardEl);
  });



  // Organiza por expansão
  const expansions = {};
  allCards.forEach(c => {
    const exp = c.expansao || 'Sem Expansão';
    if (!expansions[exp]) expansions[exp] = [];
    expansions[exp].push(c);
  });

  // Para cada expansão, renderiza as cartas
  Object.entries(expansions).forEach(([exp, cards]) => {
    const block = document.createElement('div');
    block.classList.add('expansion-container');
    block.innerHTML = `<h3>${exp}</h3>`;

    let row = null;
    cards.forEach((card, i) => {
      if (i % 8 === 0) {
        row = document.createElement('div');
        row.classList.add('cards-row');
        block.appendChild(row);
      }

      const cardEl = 
        card.tipo === 'magia'       ? createMagicCardElement(card) :
        card.tipo === 'equipamento'? createEquipamentCardElement(card) :
                                      createCardElement(card);
      cardEl.classList.add('card');
      cardEl.addEventListener('click', () => selectCard(card));
      row.appendChild(cardEl);
      if (card.tipo === 'criatura' && card.fusoesPossiveis?.length) {
        // ícone de fusão
        const icon = document.createElement('div');
        icon.classList.add('fusion-icon');
        icon.textContent = '⚙️';

        // tooltip que aparecerá no hover
        const tooltip = document.createElement('div');
        tooltip.classList.add('fusion-tooltip');
        tooltip.innerHTML = card.fusoesPossiveis
          .map(f => `<div class="fusion-entry">
                      <strong>${f.com}</strong> → ${f.resultado.name}
                    </div>`)
          .join('');

        // para cada entrada do tooltip, clique adiciona ao deck especial
        tooltip.querySelectorAll('.fusion-entry').forEach((entryEl, i) => {
          entryEl.style.cursor = 'pointer';
          entryEl.addEventListener('click', e => {
            e.stopPropagation();
            addToSpecialDeck(card.fusoesPossiveis[i].resultado);
          });
        });

        cardEl.appendChild(icon);
        cardEl.appendChild(tooltip);
      }

    });

    available.appendChild(block);
  });

  // Botão de iniciar
  document.getElementById('start-game-btn').addEventListener('click', startGame);

  // Renderiza inicial do painel especial
  renderSpecialDeckUI();
}

function obterFusaoDisponivelEntre(cartas) {
  for (let i = 0; i < cartas.length; i++) {
    const carta1 = cartas[i];
    if (!carta1.fusoesPossiveis) continue;

    for (let j = 0; j < cartas.length; j++) {
      if (i === j) continue;
      const carta2 = cartas[j];

      const fusao = carta1.fusoesPossiveis.find(f => f.com === carta2.name);
      if (fusao) {
        return {
          base: carta1,
          com: carta2,
          resultado: fusao.resultado
        };
      }
    }
  }
  return null;
}

function aplicarPalavrasChaveDuranteCombate(carta, tipo, valorDano, contextoBase) {
  if (!carta.palavrasChave) return valorDano;
  contextoBase = {
    deck: deck,
    opponentField: opponentField,
    playerField: playerField,
    playerHP: playerHP,
    opponentHP: opponentHP,
    opponentGrave: opponentGrave,
    playerGrave: grave,
    enemiesOnField: opponentField.filter(c => c !== null).length,
    playerCardsOnField: playerField.filter(c => c !== null).length,
    deckSize: deck.length,
    turn: turn,
    playerHand: playerHand,
    compra: canDrawThisTurn,
    log: (message) => log(message),
    permitirCompra: () => { canDrawThisTurn = true; },
    modifyPlayerHP: (delta) => { playerHP += delta; },
    modifyOpponentHP: (delta) => { opponentHP += delta; },
    
  };

  for (const palavra of carta.palavrasChave) {
    switch (palavra) {
      case 'ROBUSTO':
        if (tipo === 'defesa') {
          contextoBase.log(`${carta.name} é ROBUSTO e reduz 1 de dano!`);
          valorDano = Math.max(0, valorDano - 1);
        }
        break;

      case 'FEROZ':
        if (tipo === 'ataque') {
          contextoBase.log(`${carta.name} é FEROZ e causa 2 de dano extra!`);
          valorDano += 2;
        }
        break;

      case 'IMUNE':
        if (tipo === 'defesa') {
          contextoBase.log(`${carta.name} é IMUNE e não recebe dano!`);
          valorDano = 0;
        }
        break;

      case 'VAMPIRICO':
        if (tipo === 'ataque') {
          const vidaRecuperada = Math.floor(valorDano / 2);
          contextoBase.log(`${carta.name} recuperou ${vidaRecuperada} de vida!`);
          contextoBase.modifyPlayerHP(vidaRecuperada);
        }
        break;

      case 'ENFRAQUECER':
        if (tipo === 'defesa' && contextoBase?.opponentField?.length > 0) {
          for (const inimigo of contextoBase.opponentField) {
            if (inimigo && typeof inimigo.atk === 'number') {
              inimigo.atk = Math.max(0, inimigo.atk - 2); // Reduz o ataque, mas não abaixo de 0
              contextoBase.log(`${carta.name} enfraqueceu ${inimigo.name}, reduzindo seu ATK em 2!`);
              break; // Aplica apenas na primeira carta encontrada. Remova se quiser aplicar em todas.
            }
          }
        }
        break;


      case 'ESCUDO':
        if (tipo === 'defesa' && !carta._escudoUsado) {
          valorDano = 0;
          carta._escudoUsado = true;
          contextoBase.log(`${carta.name} bloqueou completamente o ataque com ESCUDO!`);
        }
        break;

      // Adicione mais palavras-chave aqui
    }
  }

  return valorDano;
}




 
  function getSelectedCardsArray() {
    const cardsArray = [];
    for (const [cardName, quantity] of Object.entries(selectedDeck)) {
      const card = allCards.find(c => c.name === cardName);
      for (let i = 0; i < quantity; i++) {
        cardsArray.push({...card}); // Clonar o objeto carta
      }
    }
    return cardsArray;
  }

  function updateSelectedDeckDisplay() {
    const selectedCards = getSelectedCardsArray();
    const deckContainer = document.getElementById('selected-deck');
    deckContainer.innerHTML = '';
  
    Object.entries(selectedDeck).forEach(([cardName, quantity]) => {
      const cardDisplay = document.createElement('div');
      cardDisplay.className = 'selected-card';
      cardDisplay.textContent = `${cardName} x${quantity}`;
      deckContainer.appendChild(cardDisplay);
    });
  
    const totalCount = Object.values(selectedDeck).reduce((a, b) => a + b, 0);
    document.getElementById('deck-count').textContent = `Cartas no deck: ${totalCount}/20`;
    const startGameBtn = document.getElementById('start-game-btn');
    startGameBtn.disabled = selectedCards.length !== MAX_DECK_SIZE;
  }
  
  
  // Função para selecionar a carta
  function selectCard(card) {
    const currentCount = selectedDeck[card.name] || 0;
    const totalCards = Object.values(selectedDeck).reduce((sum, count) => sum + count, 0);

    if (currentCount >= 4 && DEBUG_MODE) {
      alert(`Você já adicionou 4 cópias da carta "${card.name}" ao deck.`);
      return;
    }

    if (totalCards >= MAX_DECK_SIZE) {
      alert('Seu deck já possui 20 cartas!');
      return;
    }
  
    selectedDeck[card.name] = currentCount + 1;
    updateSelectedDeckDisplay();
  }
  
  
  // Função para iniciar o jogo
  function startGame() {
  console.log('Iniciando o jogo...');
  const selectedCards = getSelectedCardsArray();

  if (selectedCards.length === MAX_DECK_SIZE) {
    // Oculta todos os elementos do gerenciador
    document.getElementById('deck-manager').style.display = 'none';
    document.getElementById('available-cards').style.display = 'none';
    document.getElementById('selected-deck').style.display = 'none';
    document.getElementById('deck-count').style.display = 'none';
    document.getElementById('start-game-btn').style.display = 'none';

    deck = [...selectedCards];
    shuffleDeck(deck);
    log('Deck de 20 cartas selecionado. Iniciando o jogo...');
    
    for (let i = 0; i < 5; i++) {
      const card = deck.pop();
      playerHand.push(card);
      lastDrawnCard = card;
      log(`Você comprou a carta: ${card.name}!`);
    }
    render();
  } else {
    alert(`Você precisa selecionar exatamente ${MAX_DECK_SIZE} cartas!`);
  }
}


  function createEquipamentCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card', 'equipamento');
  
    // Imagem do equipamento
    const img = document.createElement('img');
    img.src = card.img;
    img.alt = card.name;
    img.classList.add('card-image');
    cardElement.appendChild(img);
  
    // Texto com nome e efeito
    const text = document.createElement('div');
    text.classList.add('card-text');
    text.innerHTML = `<strong>${card.name}</strong><br><small>${card.description || 'Equipamento'}</small>`;
    cardElement.appendChild(text);
  
    cardElement.draggable = true;
  
    // Detalhes no botão direito
    cardElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showCardDetailsModal(card);
    });
  
    return cardElement;
  }

  function renderEquipamento(equipamento, eqIndex, parentSlot) {
    const equipamentoEl = document.createElement('div');
    equipamentoEl.classList.add('card', 'equipamento-render');
  
    const img = document.createElement('img');
    img.src = equipamento.img;
    img.alt = equipamento.name;
    img.classList.add('card-image');
    equipamentoEl.appendChild(img);
  
    // Nome pequeno ou icônico se quiser
    const text = document.createElement('div');
    text.classList.add('card-text');
    text.innerHTML = `<small>${equipamento.name}</small>`;
    equipamentoEl.appendChild(text);
  
    const deslocamentoHorizontal = 10; // Mover para a direita
    const deslocamentoVertical = 15; // Mover para baixo
  
    equipamentoEl.style.position = 'absolute';
    equipamentoEl.style.left = `${10 + eqIndex * 5 + deslocamentoHorizontal}px`; // Desloca para a direita
    equipamentoEl.style.top = `${10 + eqIndex * 5 + deslocamentoVertical}px`; // Desloca para baixo
    equipamentoEl.style.zIndex = '-1';  // Garantir que o equipamento fique atrás da criatura
    equipamentoEl.style.opacity = '1';  // 100% de opacidade
    equipamentoEl.style.pointerEvents = 'none';
    equipamentoEl.style.transform = 'scale(0.85)';
  
    parentSlot.appendChild(equipamentoEl);
}

function createEnemyCardElement(card, debug = false) {
  const el = document.createElement('div');
  el.classList.add('card', 'enemy-card');

  if (debug) {
    el.textContent = `${card.name} (${card.tipo})`;
    el.style.backgroundColor = '#d33';
    el.style.color = '#fff';
    el.style.fontSize = '0.8em';
    el.style.padding = '4px';
    el.style.border = '2px solid #000';
    el.title = JSON.stringify(card, null, 2);
  } else {
    el.classList.add('card-back');
    el.title = 'Carta do oponente';
  }

  return el;
}
  
  
  
  
  


document.addEventListener('keydown', e => {
  if (e.key === 'd') {
    DEBUG_MODE = !DEBUG_MODE;
    log(`Debug Mode: ${DEBUG_MODE ? 'Ativado' : 'Desativado'}`);
    render();
  }
});

// Função para renderizar o campo e a mão
function render() {
  document.getElementById('player-hp').textContent = playerHP;
  document.getElementById('opponent-hp').textContent = opponentHP;

  const playerSlots = document.querySelectorAll('#player-field .slot');
  const opponentSlots = document.querySelectorAll('#opponent-field .slot');
  const magicSlots = document.querySelectorAll('#magic-field .magic-slot');
  const opponentMagicSlots = document.querySelectorAll('#opponent-magic-field .magic-slot');
  const handContainer = document.getElementById('player-hand');

  // Monstros - jogador
  playerSlots.forEach((slot, index) => {
    slot.innerHTML = '';
    const card = playerField[index];
  
    if (card) {
      const el = card.tipo === 'magia'
        ? createMagicCardElement(card)
        : createCardElement(card);
  
      slot.appendChild(el);

      if (card.equipamentos && card.equipamentos.length > 0) {
        card.equipamentos.forEach((equipamento, eqIndex) => {
          renderEquipamento(equipamento, eqIndex, slot);
        });
      }
    }
  });
  

  // Monstros - oponente
  opponentSlots.forEach((slot, index) => {
    slot.innerHTML = '';
    const card = opponentField[index];
    if (card) {
      const el = card.tipo === 'magia' ? createMagicCardElement(card) : createCardElement(card);
      slot.appendChild(el);
    }
  });

  // Magias - jogador
  if (magicSlots && magicField) {
    magicSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (magicField[index]) {
        const el = createMagicCardElement(magicField[index]);
        slot.appendChild(el);
      }
    });
  }

  // Magias - oponente (se aplicável)
  if (opponentMagicSlots && opponentMagicField) {
    opponentMagicSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (opponentMagicField[index]) {
        const el = createMagicCardElement(opponentMagicField[index]);
        slot.appendChild(el);
      }
    });
  }

  // Mão
  handContainer.innerHTML = '';
  playerHand.forEach((card, i) => {
    const el =
        card.tipo === 'magia'
          ? createMagicCardElement(card)
          : card.tipo === 'equipamento'
          ? createEquipamentCardElement(card)
          : createCardElement(card);

    if (card === lastDrawnCard) {
      el.classList.add('ultima-carta-comprada');
    }

    el.addEventListener('click', () => {
      selectedHandCard = card;
      log(`Carta "${card.name}" selecionada. Escolha um slot no campo.`);
    });
    

    handContainer.appendChild(el);
  });

  const opponentHandContainer = document.getElementById('opponent-hand');
  opponentHandContainer.innerHTML = '';
  opponentHand.forEach(card => {
    const el = createEnemyCardElement(card, DEBUG_MODE); // DEBUG_MODE é uma flag que você controla
    opponentHandContainer.appendChild(el);
  });

  // Render - Slot de Fusão
  const fusionSlotEl = document.querySelector('#fusion-slot .slot');
  fusionSlotEl.innerHTML = '';

  if (fusionField) {
    const el = fusionField.tipo === 'magia'
      ? createMagicCardElement(fusionField)
      : createCardElement(fusionField);

    fusionSlotEl.appendChild(el);

    if (fusionField.equipamentos && fusionField.equipamentos.length > 0) {
      fusionField.equipamentos.forEach((equipamento, eqIndex) => {
        renderEquipamento(equipamento, eqIndex, fusionSlotEl);
      });
    }
  }


  if (opponentHP <= 0) {
    opponentHP = 0;
    setTimeout(() => {
      alert('Você venceu!');
      restartGame();
    }, 100);
    return;
  }
  else if (playerHP <= 0) {
    playerHP = 0;
    setTimeout(() => {
      alert('Você perdeu!');
      restartGame();
    }, 100);
    return;
  }
}

  
  function createMagicCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card', 'magic-card');

  // Imagem
  const img = document.createElement('img');
  img.src = card.img;
  img.alt = card.name;
  img.classList.add('card-image');
  cardElement.appendChild(img);

  // Texto
  const text = document.createElement('div');
  text.classList.add('card-text');

  // Detecta subtipo Pêndulo e se está no campo de magia
  const isPendulo = Array.isArray(card.subtipo) && card.subtipo.includes('pendulo');
  let escalaLabel = '';

  if (isPendulo) {
    // Encontra índice do slot onde a carta está no magicField
    const slotIndex = magicField.findIndex(c => c === card);
    if (slotIndex === 0) {
      escalaLabel = `Pêndulo: Escala ${card.escalaMin}`;
    } else if (slotIndex === 1) {
      escalaLabel = `Pêndulo: Escala ${card.escalaMax}`;
    }
  }

  if (escalaLabel) {
    text.innerHTML = `<strong>${card.name}</strong><br><em>${escalaLabel}</em>`;
  } else {
    // Magia normal
    const tipoMagia = card.subtipo === 'continua' ? 'Magia Contínua' : 'Magia Imediata';
    text.innerHTML = `<strong>${card.name}</strong><br><em>${tipoMagia}</em>`;
  }
  cardElement.appendChild(text);

  // Animação de entrada
  if (animacaoEntradaCampo) {
    cardElement.classList.add('entrada-carta');
    setTimeout(() => {
      cardElement.classList.remove('entrada-carta');
    }, 800);
  }

  // Clique com botão direito mostra detalhes
  cardElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showCardDetailsModal(card);
  });

  return cardElement;
}
  

// Função para criar um elemento de carta
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  if (card.subtipo === 'Link') {
    cardElement.classList.add('card--link');
  }

  // 1) Faixa de nível (estrelas)
  if (card.nivel) {
  const lvlBar = document.createElement('div');
  lvlBar.classList.add('card-levels');

  if (card.nivel <= 8) {
    for (let i = 0; i < card.nivel; i++) {
      const star = document.createElement('span');
      star.classList.add('card-star');
      star.textContent = '★';
      lvlBar.appendChild(star);
    }
  } else {
    const starText = document.createElement('span');
    starText.classList.add('card-star-number');
    starText.textContent = `${card.nivel}★`;
    lvlBar.appendChild(starText);
  }

  cardElement.appendChild(lvlBar);
  }


  // 2) Imagem
  const img = document.createElement('img');
  img.src = card.img;
  img.alt = card.name;
  img.classList.add('card-image');
  cardElement.appendChild(img);

  // 3) Texto principal
  const text = document.createElement('div');
  text.classList.add('card-text');
  text.innerHTML = `<strong>${card.name}</strong><br>ATK: ${card.atk} | DEF: ${card.def}`;
  cardElement.appendChild(text);

  // 4) Palavras-chave
  if (card.palavrasChave?.length) {
    const keywords = document.createElement('div');
    keywords.classList.add('card-keywords');
    card.palavrasChave.forEach((palavra, idx) => {
      const span = document.createElement('span');
      span.textContent = palavra + (idx < card.palavrasChave.length - 1 ? ', ' : '');
      const cor = keywordColorMap[palavra] || '#fff';
      span.style.color = cor;
      keywords.appendChild(span);
    });
    cardElement.appendChild(keywords);
  }

  cardElement.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // impede o menu padrão
    showCardDetailsModal(card);
  });

  cardElement.draggable = true;
  if (animacaoEntradaCampo) {
      cardElement.classList.add('entrada-carta');
      setTimeout(() => {
        cardElement.classList.remove('entrada-carta');
      }, 800);
  }
      
  return cardElement;
}

  

// Função para adicionar uma carta ao campo
function addCardToField(field, index, card) {
  if (!field[index]) {
    field[index] = card;
    render();
  } else {
    log('Slot já ocupado!');
  }
}

// Função para realizar o combate
function combat(attacker, defender, attackerIndex, defenderIndex) {
  log(`${attacker.name} ataca ${defender.name}`);
  let dano = attacker.atk;
  dano = aplicarPalavrasChaveDuranteCombate(defender, 'defesa', dano);
  dano = aplicarPalavrasChaveDuranteCombate(attacker, 'ataque', dano);
  defender.def -= dano;


  if (defender.def <= 0) {
    log(`${defender.name} destruído`);
    opponentGrave.push(defender);
    opponentField[defenderIndex] = null;
  }

  render();
  log('--- Fim do Combate ---');
  turn++;
}

// Função para registrar logs
function log(message) {
  const logElement = document.getElementById('log');
  const logEntry = document.createElement('div');
  logEntry.textContent = message;
  logElement.appendChild(logEntry);
}

// Eventos de arrastar e soltar
document.querySelectorAll('.player-slot').forEach((slot, index) => {
  slot.addEventListener('dragover', (e) => e.preventDefault());

  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    const cardData = JSON.parse(e.dataTransfer.getData('text/plain'));
    addCardToField(playerField, index, cardData);
  });
});

function getSacrificiosDisponiveis() {
  const sacrificaveisCampo = playerField.filter(c => c !== null);
  const sacrificaveisMao = playerHand.filter(c => c.tipo === 'criatura');
  return [...sacrificaveisCampo, ...sacrificaveisMao];
}

function realizarInvocacaoCreature(index, carta, isEspecial) {
  playerField[index] = carta;
  const i = playerHand.indexOf(carta);
  if (i !== -1) playerHand.splice(i, 1);
  selectedHandCard = null;

  if (!isEspecial && (carta.nivel || 1) <= 4) {
    invocacaoNormalFeita = true;
    log('Você realizou uma invocação normal!');
  } else if (!isEspecial) {
    log(`Você invocou ${carta.nivel}-★ com sacrifício(s)!`);
  } else {
    log('Você realizou uma invocação especial!');
  }

  if (!carta.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', carta);
    carta.efeitoAtivadoPreparacao = true;
  }

  animacaoEntradaCampo = true;
  render();
  animacaoEntradaCampo = false;
}


document.querySelectorAll('#player-field .slot').forEach((slot, index) => {
  slot.addEventListener('click', () => {
    if (!selectedHandCard) {
      log('Nenhuma carta selecionada!');
      return;
    }

    const carta = selectedHandCard;
    const isPenduloCarta = Array.isArray(carta.subtipo) && carta.subtipo.includes('pendulo');

    // --- 0) INVOCAR POR PÊNDULO (se for carta Pêndulo e houver 2 Pêndulos nos slots de magia) ---
    const pendulosNoCampo = magicField.filter(c =>
      c && c.tipo === 'criatura' && c.colocadaComoPendulo && Array.isArray(c.subtipo) && c.subtipo.includes('pendulo')
    );
    if (isPenduloCarta && pendulosNoCampo.length >= 2) {
      // calcula intervalo de níveis
      const escalaMin = Math.min(...pendulosNoCampo.map(p => p.escalaMin));
      const escalaMax = Math.max(...pendulosNoCampo.map(p => p.escalaMax));
      if (carta.nivel > escalaMin && carta.nivel < escalaMax) {
        // invoca diretamente ignorando tributos
        if (playerField[index]) {
          log('Este slot já está ocupado!');
        } else {
          // remove da mão
          const iHand = playerHand.indexOf(carta);
          if (iHand !== -1) playerHand.splice(iHand, 1);

          // coloca no campo
          playerField[index] = carta;
          log(`${carta.name} foi invocada por Fusão Pêndulo no slot ${index + 1}!`);
          selectedHandCard = null;
          render();
        }
        return; // saiu após pendulo
      } else {
        log(`${carta.name} não está entre as escalas (${escalaMin}~${escalaMax}).`);
        return;
      }
    }

    // --- 1) INVOCAR CRIATURA NORMAL / ESPECIAL / TRIBUTO ---
    if (carta.tipo === 'criatura') {
      if (playerField[index]) {
        log('Este slot já está ocupado!');
        return;
      }

      const isEspecial = carta.tipoInvocacao === 'especial';
      const nivel = carta.nivel || 1;
      let sacrificiosNecessarios = 0;
      if (nivel >= 5 && nivel <= 6) sacrificiosNecessarios = 1;
      else if (nivel >= 7) sacrificiosNecessarios = 2;

      // Invocação especial com condição personalizada
      if (isEspecial && carta.podeSerInvocada && !carta.podeSerInvocada(playerField)) {
        log('Condição para invocação especial não foi satisfeita!');
        return;
      }

      // Impede múltiplas invocações normais de nível 4 ou menos
      if (!isEspecial && nivel <= 4 && invocacaoNormalFeita) {
        log('Você já fez uma invocação normal neste turno!');
        return;
      }

      // Verifica necessidade de tributos
      if (sacrificiosNecessarios > 0) {
        if (invocacaoSacrificioFeita) {
          log('Você já fez uma invocação por sacrifício neste turno!');
          return;
        }

        const disponiveis = getSacrificiosDisponiveis()
          .filter(c => c !== carta)
          .map(c => ({ referencia: c, origem: playerField.includes(c) ? 'campo' : 'mão', name: c.name }));

        if (disponiveis.length < sacrificiosNecessarios) {
          log(`Você precisa de ${sacrificiosNecessarios} sacrifício(s), mas só tem ${disponiveis.length}.`);
          return;
        }

        mostrarModalSacrificios(disponiveis, sacrificiosNecessarios, (sacSelecionados) => {
          // executa sacrifícios
          sacSelecionados.forEach(s => {
            const cRef = s.referencia;
            if (s.origem === 'campo') {
              const idxField = playerField.indexOf(cRef);
              if (idxField !== -1) playerField[idxField] = null;
            } else {
              const idxHand = playerHand.indexOf(cRef);
              if (idxHand !== -1) playerHand.splice(idxHand, 1);
            }
            grave.push(cRef);
            log(`${cRef.name} foi sacrificado!`);
          });

          // após tributo, invoca
          realizarInvocacaoCreature(index, carta, isEspecial);
          invocacaoSacrificioFeita = true;
        });

        return; // espera seleção de tributos
      }

      // sem tributos
      realizarInvocacaoCreature(index, carta, isEspecial);
      return;
    }

    // --- 2) EQUIPAMENTO ---
    if (carta.tipo === 'equipamento') {
      const criaturaAlvo = playerField[index];
      if (!criaturaAlvo || criaturaAlvo.tipo !== 'criatura') {
        log('Você deve escolher uma criatura aliada para equipar!');
        return;
      }

      // aplica equipamento
      const contexto = {
        deck, fase: 'preparacao', opponentField, playerField,
        playerHP, opponentHP, opponentGrave, playerGrave: grave,
        enemiesOnField: opponentField.filter(c => c).length,
        playerCardsOnField: playerField.filter(c => c).length,
        deckSize: deck.length, turn, playerHand, compra: canDrawThisTurn,
        log, permitirCompra: () => { canDrawThisTurn = true; },
        modifyPlayerHP: d => { playerHP += d; }, modifyOpponentHP: d => { opponentHP += d; },
        alvoCampo: criaturaAlvo
      };

      if (!criaturaAlvo.equipamentos) criaturaAlvo.equipamentos = [];
      criaturaAlvo.equipamentos.push(carta);
      if (criaturaAlvo.transformar?.condicao(criaturaAlvo, contexto)) {
        transformarCarta(criaturaAlvo, contexto);
      }

      carta.effect(carta, contexto);
      playerHand.splice(playerHand.indexOf(carta), 1);
      log(`${criaturaAlvo.name} foi equipada com ${carta.name}!`);
      selectedHandCard = null;
      render();
      return;
    }
  });
});

// Seleciona o Slot de Fusão
const fusionSlot = document.querySelector('#fusion-slot .slot');

function mostrarOpcoesDeFusao(candidatos) {
  const modal = document.getElementById('fusao-opcoes');
  modal.innerHTML = ''; // limpa conteúdo anterior

  const overlay = document.createElement('div');
  overlay.id = 'fusion-overlay';
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';

  const titulo = document.createElement('h3');
  titulo.innerText = 'Escolha uma carta para fusão:';
  modalBox.appendChild(titulo);

  candidatos.forEach(carta => {
    const cartaOption = document.createElement('button');
    cartaOption.className = 'fusion-option';
    cartaOption.innerText = carta.name;
    cartaOption.addEventListener('click', () => {
      executarFusao(carta);
      modal.style.display = 'none';
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(cartaOption);
  });

  const botaoFechar = document.createElement('button');
  botaoFechar.innerText = 'Cancelar';
  botaoFechar.className = 'fusion-cancel';
  botaoFechar.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.removeChild(overlay);
  });

  modalBox.appendChild(botaoFechar);
  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
  modal.style.display = 'block';
}


// Função para executar a fusão
function executarFusao(cartaFusionavel) {
  const fusao = selectedHandCard.fusoesPossiveis.find(f => f.com === cartaFusionavel.name);
  if (!fusao) {
    return log('Essa fusão não existe.');
  }
  // procura no specialDeck uma entrada de resultado igual
  const idx = specialDeck.findIndex(e => e.name === fusao.resultado.name);
  if (idx === -1) {
    return log(`Você não tem '${fusao.resultado.name}' no Deck Especial.`);
  }

  // consome 1 cópia do deck especial
  specialDeck.splice(idx, 1);
  renderSpecialDeckUI();
  log(`’${fusao.resultado.name}’ consumida do Deck Especial para fusão.`);

  // remove cartas de origem e invoca como antes...
  [selectedHandCard, cartaFusionavel].forEach(c => {
    const iH = playerHand.indexOf(c);
    if (iH > -1) playerHand.splice(iH, 1);
    const iF = playerField.indexOf(c);
    if (iF > -1) playerField[iF] = null;
  });

  fusionField = fusao.resultado;
  if (!fusionField.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', fusionField);
    fusionField.efeitoAtivadoPreparacao = true;
  }
  log(`${fusionField.name} foi invocado(a)!`);
  selectedHandCard = null;
  render();
}

function getCombinacoesNivelExato(cartas, alvo, inicio = 0, atual = [], resultado = []) {
  const soma = atual.reduce((acc, c) => acc + (c.nivel || 0), 0);
  if (soma === alvo) {
    resultado.push([...atual]);
    return resultado;
  }
  if (soma > alvo || inicio >= cartas.length) return resultado;

  for (let i = inicio; i < cartas.length; i++) {
    atual.push(cartas[i]);
    getCombinacoesNivelExato(cartas, alvo, i + 1, atual, resultado);
    atual.pop();
  }

  return resultado;
}

function mostrarTodasOpcoesDeXYZFusion(possiveis) {
  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';
  modalBox.innerHTML = `<h3>Escolha uma XYZ Fusion:</h3>`;

  possiveis.forEach(xyz => {
    const btn = document.createElement('button');
    btn.className = 'fusion-option';
    btn.innerHTML = `
      <img src="${xyz.resultado.img}" style="height: 80px;" />
      <div>${xyz.resultado.name}</div>
      <div>Nível necessário: ${xyz.nivelAlvo}</div>
    `;
    btn.addEventListener('click', () => {
      mostrarOpcoesDeXYZFusion(xyz);  // exibe combinações válidas
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'fusion-cancel';
  cancel.textContent = 'Cancelar';
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  modalBox.appendChild(cancel);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}

function mostrarOpcoesDeXYZFusion(xyzObj) {
  const todasCartas = [...playerHand, ...playerField].filter(c => c);
  const combinacoes = getCombinacoesNivelExato(todasCartas, xyzObj.nivelAlvo);
  
  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';
  modalBox.innerHTML = `<h3>Escolha as cartas para invocar ${xyzObj.resultado.name}:</h3>`;

  combinacoes.forEach(comb => {
    const btn = document.createElement('button');
    btn.className = 'fusion-option';
    btn.textContent = comb.map(c => c.name).join(' + ');
    btn.addEventListener('click', () => {
      executarXYZFusion(xyzObj, comb);
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'fusion-cancel';
  cancel.textContent = 'Cancelar';
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  modalBox.appendChild(cancel);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}
function executarXYZFusion(xyzObj, materiaisUsados) {
  const { resultado } = xyzObj;

  // Remove do deck especial
  const idx = specialDeck.findIndex(e => e.name === resultado.name);
  specialDeck.splice(idx, 1);
  renderSpecialDeckUI();
  log(`’${resultado.name}’ foi invocado do Deck Especial por XYZ Fusion.`);

  // Sacrifica materiais
  materiaisUsados.forEach(carta => {
    const iHand = playerHand.indexOf(carta);
    const iField = playerField.indexOf(carta);
    if (iHand !== -1) {
      playerHand.splice(iHand, 1);
      grave.push(carta);
      log(`${carta.name} sacrificado da mão.`);
    } else if (iField !== -1) {
      playerField[iField] = null;
      grave.push(carta);
      log(`${carta.name} sacrificado do campo.`);
    }
  });

  fusionField = { ...resultado };
  if (!fusionField.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', fusionField);
    fusionField.efeitoAtivadoPreparacao = true;
  }
  log(`${fusionField.name} foi invocado(a) por XYZ Fusion!`);
  selectedHandCard = null;
  render();
}
function getTodasCombinacoes(array) {
  const resultado = [];

  const n = array.length;

  // Usamos bitmask para gerar todas as combinações possíveis
  for (let mask = 1; mask < (1 << n); mask++) {
    const comb = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        comb.push(array[i]);
      }
    }
    resultado.push(comb);
  }

  return resultado;
}

function getCombinacoesSynchroValidas(cartas, nivelAlvo) {
  // Transformar subtipo em minúsculas para comparação consistente
  const tuners = cartas.filter(c => c.subtipo.includes('tuner'));
  const naoTuners = cartas.filter(c => !c.subtipo.includes('tuner'));

  const combinacoes = [];

  tuners.forEach(tuner => {
    // Já que tuner não está em naoTuners, não precisa filtrar
    const combinacoesNT = getTodasCombinacoes(naoTuners);

    combinacoesNT.forEach(comb => {
      const soma = comb.reduce((acc, c) => acc + c.nivel, 0) + tuner.nivel;
      if (soma === nivelAlvo) {
        combinacoes.push([tuner, ...comb]);
      }
    });
  });

  return combinacoes;
}


function mostrarTodasOpcoesDeSynchroFusion(possiveis) {
  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';
  modalBox.innerHTML = `<h3>Escolha uma Synchro Fusion:</h3>`;

  possiveis.forEach(sf => {
    const btn = document.createElement('button');
    btn.className = 'fusion-option';
    btn.innerHTML = `
      <img src="${sf.resultado.img}" style="height: 80px;" />
      <div>${sf.resultado.name}</div>
      <div>Nível necessário: ${sf.nivelAlvo}</div>
    `;
    btn.addEventListener('click', () => {
      mostrarOpcoesDeSynchroFusion(sf);
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'fusion-cancel';
  cancel.textContent = 'Cancelar';
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  modalBox.appendChild(cancel);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}

function mostrarOpcoesDeSynchroFusion(synchroObj) {
  const todasCartas = [...playerHand, ...playerField].filter(c => c);
  const combinacoes = getCombinacoesSynchroValidas(todasCartas, synchroObj.nivelAlvo);

  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';
  modalBox.innerHTML = `<h3>Escolha as cartas para invocar ${synchroObj.resultado.name}:</h3>`;

  combinacoes.forEach(comb => {
    const btn = document.createElement('button');
    btn.className = 'fusion-option';
    btn.textContent = comb.map(c => c.name).join(' + ');
    btn.addEventListener('click', () => {
      executarSynchroFusion(synchroObj, comb);
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'fusion-cancel';
  cancel.textContent = 'Cancelar';
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  modalBox.appendChild(cancel);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}

function executarSynchroFusion(synchroObj, materiaisUsados) {
  const { resultado } = synchroObj;

  const idx = specialDeck.findIndex(e => e.name === resultado.name);
  specialDeck.splice(idx, 1);
  renderSpecialDeckUI();
  log(`’${resultado.name}’ foi invocado do Deck Especial por Synchro Fusion.`);

  materiaisUsados.forEach(carta => {
    const iHand = playerHand.indexOf(carta);
    const iField = playerField.indexOf(carta);
    if (iHand !== -1) {
      playerHand.splice(iHand, 1);
      grave.push(carta);
      log(`${carta.name} sacrificado da mão.`);
    } else if (iField !== -1) {
      playerField[iField] = null;
      grave.push(carta);
      log(`${carta.name} sacrificado do campo.`);
    }
  });

  fusionField = { ...resultado };
  if (!fusionField.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', fusionField);
    fusionField.efeitoAtivadoPreparacao = true;
  }
  log(`${fusionField.name} foi invocado(a) por Synchro Fusion!`);
  selectedHandCard = null;
  render();
}


// Lógica de clique no Slot de Fusão

fusionSlot.addEventListener('click', () => {
  if (!selectedHandCard) {
    return log('Nenhuma carta selecionada!');
  }

  // 1) Primeiro, tentamos Link Fusion:
  //    verificamos todas as linkFusions possíveis
  const disponiveisNomes = [...playerHand, ...playerField]
    .filter(c => c)  // tira null
    .map(c => c.name);

  const possiveisLink = linkFusions.filter(lf => {
    // todos os materiais disponíveis?
    const okMaterials = lf.materiais.every(mat => disponiveisNomes.includes(mat));
    // resultado presente no specialDeck?
    const okDeck = specialDeck.some(e => e.name === lf.resultado.name);
    return okMaterials && okDeck;
  });

  if (possiveisLink.length > 0) {
    // se só uma opção, executa direto; senão abre modal de escolha
    if (possiveisLink.length === 1) {
      executarLinkFusion(possiveisLink[0]);
    } else {
      mostrarOpcoesDeLinkFusion(possiveisLink);
    }
    return; // sai aqui, não cai na fusão normal
  }

  // 1.5) Se não houver Link Fusion, tenta XYZ Fusion
  const todasCartas = [...playerHand, ...playerField].filter(c => c);
  const possiveisXYZ = xyzFusions.filter(xyz => {
    // todas combinações possíveis de cartas que somam nivel igual ao alvo
    const combinacoesValidas = getCombinacoesNivelExato(todasCartas, xyz.nivelAlvo);
    return combinacoesValidas.length > 0 &&
          specialDeck.some(e => e.name === xyz.resultado.name);
  });

  if (possiveisXYZ.length > 0) {
    if (possiveisXYZ.length === 1) {
      mostrarOpcoesDeXYZFusion(possiveisXYZ[0]);
    } else {
      mostrarTodasOpcoesDeXYZFusion(possiveisXYZ);
    }
    return; // não faz fusão normal
  }
  // 1.75) Se não houver XYZ Fusion, tenta Synchro Fusion
  const possiveisSynchro = synchroFusions.filter(sf => {
    const combinacoesValidas = getCombinacoesSynchroValidas(todasCartas, sf.nivelAlvo);
    return combinacoesValidas.length > 0 &&
          specialDeck.some(e => e.name === sf.resultado.name);
  });

  if (possiveisSynchro.length > 0) {
    if (possiveisSynchro.length === 1) {
      mostrarOpcoesDeSynchroFusion(possiveisSynchro[0]);
    } else {
      mostrarTodasOpcoesDeSynchroFusion(possiveisSynchro);
    }
    return;
  }


  // 2) Se não havia Link Fusion, segue para fusão “normal”:
  const isEspecial = selectedHandCard.tipoInvocacao === 'especial';
  const isCriatura = selectedHandCard.tipo === 'criatura' || selectedHandCard.tipo === 'fusão';

  if (fusionField) {
    return log('O slot especial já está ocupado!');
  }

  if (selectedHandCard.fusoesPossiveis) {
    const candidatos = [...playerHand, ...playerField].filter(carta =>
      carta &&
      carta !== selectedHandCard &&
      selectedHandCard.fusoesPossiveis.some(f => f.com === carta.name)
    );

    if (candidatos.length === 0) {
      return log('Não há cartas compatíveis para fusão.');
    }

    mostrarOpcoesDeFusao(candidatos);
    return;
  }

  if (!isEspecial || !isCriatura) {
    return log('Apenas criaturas com invocação especial ou fusão podem ser colocadas neste slot!');
  }

  if (selectedHandCard.podeSerInvocada && !selectedHandCard.podeSerInvocada(playerField)) {
    return log('Condição para invocação especial não foi satisfeita!');
  }

  fusionField = selectedHandCard;
  const i = playerHand.indexOf(selectedHandCard);
  if (i !== -1) playerHand.splice(i, 1);
  selectedHandCard = null;

  if (!fusionField.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', fusionField);
    fusionField.efeitoAtivadoPreparacao = true;
  }

  log(`${fusionField.name} foi invocada no Slot Especial!`);
  render();
});


// Modal de escolha caso haja >1 opção
function mostrarOpcoesDeLinkFusion(fusoes) {
  const overlay = document.createElement('div');
  overlay.className = 'fusion-overlay';

  const modalBox = document.createElement('div');
  modalBox.className = 'fusion-modal';
  modalBox.innerHTML = `<h3>Escolha sua Link Fusion:</h3>`;

  fusoes.forEach(lf => {
    const btn = document.createElement('button');
    btn.className = 'fusion-option';
    btn.textContent = lf.resultado.name;
    btn.addEventListener('click', () => {
      executarLinkFusion(lf);
      document.body.removeChild(overlay);
    });
    modalBox.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'fusion-cancel';
  cancel.textContent = 'Cancelar';
  cancel.addEventListener('click', () => document.body.removeChild(overlay));
  modalBox.appendChild(cancel);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}

// Função que consome materiais e invoca o Link Monster
function executarLinkFusion(linkObj) {
  const { materiais, resultado } = linkObj;

  // consome do Deck Especial
  const idxDeck = specialDeck.findIndex(e => e.name === resultado.name);
  specialDeck.splice(idxDeck, 1);
  renderSpecialDeckUI();
  log(`’${resultado.name}’ consumida do Deck Especial para Link Fusion.`);

  // sacrifica cada material da mão ou campo
  materiais.forEach(matName => {
    let idx = playerHand.findIndex(c => c.name === matName);
    if (idx !== -1) {
      const [c] = playerHand.splice(idx, 1);
      grave.push(c);
      log(`${c.name} foi sacrificado da mão.`);
    } else {
      idx = playerField.findIndex(c => c && c.name === matName);
      if (idx !== -1) {
        const c = playerField[idx];
        playerField[idx] = null;
        grave.push(c);
        log(`${c.name} foi sacrificado do campo.`);
      }
    }
  });

  // invoca o Link Monster no slot especial
  fusionField = { ...resultado };
  if (!fusionField.efeitoAtivadoPreparacao) {
    ativarEfeitosDasCartas('preparacao', fusionField);
    fusionField.efeitoAtivadoPreparacao = true;
  }
  log(`${fusionField.name} foi invocado(a) por Link Fusion!`);
  selectedHandCard = null;
  render();
}


document.querySelectorAll('#magic-field .magic-slot').forEach((slot, index) => {
  slot.addEventListener('click', () => {
    if (!selectedHandCard) {
      log('Nenhuma carta selecionada!');
      return;
    }

    const carta = selectedHandCard;
    const i = playerHand.indexOf(carta);

    const isPendulo = Array.isArray(carta.subtipo) && carta.subtipo.includes('pendulo');

    // Apenas magias ou criaturas pendulo podem ir para o campo de magia
    if (carta.tipo !== 'magia' && !(carta.tipo === 'criatura' && isPendulo)) {
      log('Apenas magias ou criaturas do tipo PÊNDULO podem ser colocadas aqui!');
      return;
    }

    // Verifica se o slot está ocupado
    if (magicField[index]) {
      log('Este slot de magia já está ocupado!');
      return;
    }

    if (i !== -1) playerHand.splice(i, 1); // Remove da mão

    // Ativa efeito (se existir) na preparação
    ativarEfeitosDasCartas('preparacao', carta);

    if (carta.tipo === 'magia') {
      // Magias normais
      if (carta.subtipo === 'imediata') {
        grave.push(carta);
        log(`${carta.name} foi ativada e enviada ao cemitério.`);
      } else if (carta.subtipo === 'continua') {
        magicField[index] = {
          ...carta,
          turnosRestantes: carta.duracao || Infinity
        };
        log(`${carta.name} foi ativada e permanece no campo por ${carta.duracao || '∞'} turno(s).`);
      }
    } else if (carta.tipo === 'criatura' && isPendulo) {
      // Criaturas Pendulo — são tratadas como magia no campo
      carta.colocadaComoPendulo = true;
      magicField[index] = carta;

      log(`${carta.name} foi colocada na zona de magia como carta PÊNDULO (Escala: ${carta.escalaMin} / ${carta.escalaMax}).`);
    }

    selectedHandCard = null;
    render();
  });
});



  
  // Comprar carta aleatória
  document.getElementById('draw-btn').addEventListener('click', () => {
    if (!canDrawThisTurn) {
      log('Você já comprou uma carta neste turno!');
      return;
    }
    if (deck.length > 0) {
      const card = deck.pop();
      playerHand.push(card);
      lastDrawnCard = card;
      log(`Você comprou a carta: ${card.name}!`);
    } else {
      log('O deck está vazio!');
    }
    render();
  
    canDrawThisTurn = false; // Bloqueia nova compra até o próximo turno
  });
  

document.querySelectorAll('.opponent-slot').forEach((slot, index) => {
  slot.addEventListener('click', () => {
    if (selectedCard) {
      const attacker = selectedCard;
      const defender = opponentField[index];
      if (defender) {
        combat(attacker, defender, playerField.indexOf(attacker), index);
        selectedCard = null;
      } else {
        log('Nenhuma carta para atacar neste slot!');
      }
    } else {
      log('Selecione uma carta para atacar!');
    }
  });
});


async function startCombatPhase() {
  ativarEfeitosDasCartas('combate');

  for (let i = 0; i < 4; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const attacker = playerField[i];
    const defender = opponentField[i];

    if (attacker && defender) {
      log(`${attacker.name} ataca ${defender.name}`);

      await animateAttack('player-field', i, 'opponent-field', i);

      let dano = attacker.atk;
      dano = aplicarPalavrasChaveDuranteCombate(defender, 'defesa', dano);
      dano = aplicarPalavrasChaveDuranteCombate(attacker, 'ataque', dano);
      defender.def -= dano;


      if (defender.def <= 0) {
        const defenderSlot = document.querySelectorAll(`#opponent-field .slot`)[i];
        const defenderCard = defenderSlot.querySelector('.card');
        if (defenderCard) {
          defenderCard.classList.add('destroyed');

          // Espera a animação terminar antes de remover a carta
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        grave.push(defender);
        log(`${defender.name} foi destruído!`);
        opponentField[i] = null;
      } else {
        log(`${defender.name} sobreviveu com DEF ${defender.def}`);
      }

    } else if (attacker && !defender) {
      log(`${attacker.name} ataca diretamente!`);

      await animateAttack('player-field', i);

      let danoDireto = attacker.atk;
      danoDireto = aplicarPalavrasChaveDuranteCombate(attacker, 'ataque', danoDireto);
      opponentHP -= danoDireto;
      if (opponentHP <= 0) {
        opponentHP = 0;
        render();
        setTimeout(() => {
          alert('Você venceu!');
          restartGame();
        }, 100);
        return;
      }

    }
    // Combate com a carta do Fusion Field

  }
  if (fusionField) {
    const attacker = fusionField;
    const defender = opponentFusionField || null;
  
    log(`${attacker.name} do Slot Especial ataca${defender ? ` ${defender.name}` : ' diretamente'}!`);
    
    await animateAttack('fusion-slot', 0, defender ? 'opponent-fusion-slot' : null, 0);
  
    if (defender) {
      let dano = attacker.atk;
      dano = aplicarPalavrasChaveDuranteCombate(defender, 'defesa', dano);
      dano = aplicarPalavrasChaveDuranteCombate(attacker, 'ataque', dano);
      defender.def -= dano;

  
      if (defender.def <= 0) {
        const defenderSlot = document.querySelector('#opponent-fusion-slot .slot');
        const defenderCard = defenderSlot.querySelector('.card');
        if (defenderCard) {
          defenderCard.classList.add('destroyed');
          await new Promise(resolve => setTimeout(resolve, 600));
        }
  
        grave.push(defender);
        opponentFusionField = null;
        log(`${defender.name} foi destruído no Slot Especial!`);
      } else {
        log(`${defender.name} sobreviveu com DEF ${defender.def}`);
      }
  
    } else {
      opponentHP -= attacker.atk;
      if (opponentHP <= 0) {
        opponentHP = 0;
        render();
        setTimeout(() => {
          alert('Você venceu!');
          restartGame();
        }, 100);
        return;
      }
    }
  }
  render();
  canDrawThisTurn = true;
  opponentMagicField.forEach((carta, index) => {
    if (carta && carta.tipo === 'magia' && carta.subtipo === 'continua') {
      if (carta.turnosRestantes <= 0) {
        log(`${carta.name} se esgotou e foi enviada ao cemitério.`);
        opponentGrave.push(carta);
        opponentMagicField[index] = null; 
        return;
      }
      ativarEfeitosDasCartas('preparacao', carta);
      carta.turnosRestantes--;
      render();
    }
  });
}

function realizarFusao(carta1, carta2, resultado, isOpponent = false) {
  const campo = isOpponent ? opponentField : playerField;
  const mao = isOpponent ? opponentHand : playerHand;
  const fusaoSlot = isOpponent ? opponentFusionField : fusionField;

  // Remove cartas do campo ou mão
  const removerCarta = (carta) => {
    const indexCampo = campo.findIndex(c => c === carta);
    if (indexCampo !== -1) {
      campo[indexCampo] = null;
      grave.push(carta);
      return;
    }

    const indexMao = mao.findIndex(c => c === carta);
    if (indexMao !== -1) {
      mao.splice(indexMao, 1);
      grave.push(carta);
    }
  };

  removerCarta(carta1);
  removerCarta(carta2);

  fusaoSlot[0] = { ...resultado };
}


let invocacaoNormalFeitaOponente = false;

function escolherMelhorCriatura(hand) {
  // Exemplo de heurística: escolhe a criatura de maior ATK
  const criaturas = hand.filter(c => c.tipo === 'criatura');
  if (criaturas.length === 0) return null;
  return criaturas.reduce((best, c) => c.atk > best.atk ? c : best, criaturas[0]);
}
async function opponentTurn() {
  await new Promise(r => setTimeout(r, 800));

  // 1) Compra
  if (opponentDeck.length > 0) {
    const cartaComprada = opponentDeck.pop();
    opponentHand.push(cartaComprada);
    log(`Oponente comprou uma carta.`);
  }

  // 2) Contexto
  const context = {
    fase: 'preparacao',
    modifyPlayerHP: v => { playerHP = Math.max(0, playerHP + v); },
    modifyOpponentHP: v => { opponentHP = Math.max(0, opponentHP + v); },
    log, playerField, opponentField, deck: opponentDeck,
    magicField, // para pêndulo
  };

  const flipped = {
    ...context,
    modifyPlayerHP: context.modifyOpponentHP,
    modifyOpponentHP: context.modifyPlayerHP,
    opponentField: context.playerField,
    playerField: context.opponentField,
    opponentGrave: context.playerGrave,
    playerGrave: context.opponentGrave,
    deck: context.opponentDeck,
    magicField: opponentMagicField,
  };

  // --- 3) TENTAR TODAS AS FUSÕES (Link, XYZ, Synchro, Pêndulo) ---

  // Helper: retorna o melhor objeto de fusão com base em ATK do resultado
  function escolherMelhorFusao(possiveis) {
    return possiveis.reduce((best, cur) => {
      if (!best) return cur;
      return (cur.resultado.atk > best.resultado.atk) ? cur : best;
    }, null);
  }

  // 3.1) Pêndulo Fusion
  const penduloSlots = magicField.filter(c =>
    c && c.tipo === 'criatura' && c.colocadaComoPendulo && c.subtipo.includes('pendulo')
  );
  if (penduloSlots.length >= 2) {
    // soma todas as fusões Pêndulo possíveis
    const pendulos = pendulumFusions.filter(pf => true); // assumindo lista global
    const melhoresPF = escolherMelhorFusao(pendulos);
    if (melhoresPF) {
      if (invocarPorPenduloGenerica(opponentHand, opponentField)) {
        log(`Oponente usou Pêndulo Fusion para invocar ${melhoresPF.resultado.name}!`);
        render(); await new Promise(r => setTimeout(r, 800));
        // após fusão pêndulo, segue direto para magias/equip
        gotoMagiasEquip();
        return;
      }
    }
  }

  // 3.2) Fusões a partir do Deck Especial do Oponente
  const possFusoes = [];

  opponentSpecialDeck.forEach(resultCard => {
    // busca no Link
    linkFusions.forEach(f => {
      if (f.resultado.name === resultCard.name &&
          f.materiais.every(mat => opponentField.some(c => c && c.name === mat))) {
        possFusoes.push({ tipo: 'link', base: f.materiais[0], com: f.materiais[1], resultado: f.resultado });
      }
    });

    // busca no XYZ
    xyzFusions.forEach(f => {
      if (f.resultado.name === resultCard.name) {
        const combos = getCombinacoesNivelExato(opponentField.filter(Boolean), f.nivelAlvo);
        if (combos.length > 0) {
          // pega apenas a primeira combinação válida
          const [a, b] = combos[0];
          possFusoes.push({ tipo: 'xyz', base: a, com: b, resultado: f.resultado });
        }
      }
    });

    // busca no Synchro
    synchroFusions.forEach(f => {
      if (f.resultado.name === resultCard.name) {
        const combos = getCombinacoesSynchroValidas(opponentField.filter(Boolean), f.nivelAlvo);
        if (combos.length > 0) {
          const [tuner, ...others] = combos[0];
          // para simplicidade, pegamos apenas o primeiro non-tuner
          possFusoes.push({ tipo: 'synchro', base: tuner, com: others[0], resultado: f.resultado });
        }
      }
    });

    // (pendulum já tratado antes)
  });

  if (possFusoes.length > 0 && !opponentFusionField[0]) {
    // escolhe pela maior ATK
    const melhor = possFusoes.reduce((best, cur) => {
      if (!best) return cur;
      return (cur.resultado.atk > best.resultado.atk) ? cur : best;
    }, null);

    // consome do deck especial do oponente
    const idxO = opponentSpecialDeck.findIndex(c => c.name === melhor.resultado.name);
    if (idxO !== -1) {
      opponentSpecialDeck.splice(idxO, 1);
    }

    // realiza a fusão
    log(`’${melhor.resultado.name}’ consumida do Deck Especial (Oponente) para fusão (${melhor.tipo}).`);
    realizarFusao(melhor.base, melhor.com, melhor.resultado, /*isOpponent=*/true);
    log(`Oponente fundiu ${melhor.base.name} + ${melhor.com.name} → ${melhor.resultado.name}!`);
    render(); await new Promise(r => setTimeout(r, 800));
    gotoMagiasEquip();
    return;
  }

  // 4) Invocação normal
  if (!invocacaoNormalFeitaOponente) {
    const criatura = escolherMelhorCriatura(opponentHand);
    if (criatura) {
      const index = opponentHand.indexOf(criatura);
      if (index !== -1) opponentHand.splice(index, 1);

      const livres = opponentField
        .map((c, i) => c === null ? i : -1)
        .filter(i => i !== -1);

      if (livres.length > 0) {
        let slot = livres[0];
        for (const i of livres) {
          const pc = playerField[i];
          if (pc && criatura.atk >= pc.def) {
            slot = i;
            break;
          }
        }
        opponentField[slot] = criatura;
        invocacaoNormalFeitaOponente = true;
        log(`Oponente invocou ${criatura.name} no slot ${slot + 1}`);
        render(); await new Promise(r => setTimeout(r, 800));
      } else {
        opponentHand.push(criatura);
        log(`Sem espaço no campo, ${criatura.name} retornou à mão do oponente.`);
      }
    }
  }

  // 5) Magias e equipamentos
  for (let i = opponentHand.length - 1; i >= 0; i--) {
    const card = opponentHand[i];
    if (!card || typeof card !== 'object') continue;

    if (card.tipo === 'magia') {
      opponentHand.splice(i, 1);
      if (card.subtipo === 'continua') {
        const slot = opponentMagicField.findIndex(s => s === null);
        if (slot !== -1) {
          opponentMagicField[slot] = card;
          log(`Oponente ativou magia contínua ${card.name}`);
        } else {
          grave.push(card);
          log(`Sem espaço para ${card.name}, enviada ao cemitério`);
        }
      } else {
        card.effect?.(card, flipped);
        log(`Oponente usou magia ${card.name}`);
        grave.push(card);
      }
      render(); await new Promise(r => setTimeout(r, 600));
    } else if (card.tipo === 'equipamento') {
      opponentHand.splice(i, 1);
      const tgt = opponentField.find(c => c && c.tipo === 'criatura');
      if (tgt) {
        tgt.equipamentos = tgt.equipamentos || [];
        tgt.equipamentos.push(card);
        card.effect?.(card, { ...flipped, alvoCampo: tgt });
        log(`Oponente equipou ${card.name} em ${tgt.name}`);
        if (tgt.transformar?.condicao(tgt, flipped)) transformarCarta(tgt, flipped);
      } else {
        grave.push(card);
        log(`Sem alvo para ${card.name}, enviada ao cemitério`);
      }
      render(); await new Promise(r => setTimeout(r, 600));
    }
  }

  // 6) Ataques
  for (let i = 0; i < 4; i++) {
    const atk = opponentField[i];
    const def = playerField[i];
    if (!atk) continue;

    if (def) {
      log(`Oponente (${atk.name}) ataca seu ${def.name}`);
      await animateAttack('opponent-field', i, 'player-field', i);

      let dano = aplicarPalavrasChaveDuranteCombate(def, 'defesa', atk.atk);
      dano = aplicarPalavrasChaveDuranteCombate(atk, 'ataque', dano);

      def.def -= dano;
      if (def.def <= 0) {
        grave.push(def);
        playerField[i] = null;
        log(`${def.name} foi destruído!`);
      } else {
        log(`${def.name} sobreviveu com DEF ${def.def}`);
      }
    } else {
      log(`${atk.name} ataca diretamente!`);
      await animateAttack('opponent-field', i);

      let danoDireto = atk.atk;
      danoDireto = aplicarPalavrasChaveDuranteCombate(atk, 'ataque', danoDireto);

      playerHP = Math.max(0, playerHP - danoDireto);
      if (playerHP <= 0) {
        render();
        alert('Você perdeu!');
        return restartGame();
      }
    }
    render(); await new Promise(r => setTimeout(r, 600));
  }

  // 7) Verifica expiração de mágicas contínuas
  opponentMagicField.forEach((c, i) => {
    if (c?.subtipo === 'continua') {
      c.turnosRestantes--;
      if (c.turnosRestantes < 0) {
        grave.push(c);
        opponentMagicField[i] = null;
        log(`${c.name} expirou e foi ao cemitério`);
      } else {
        ativarEfeitosDasCartas('preparacao', c);
      }
      render();
    }
  });

  // 8) Reset
  invocacaoNormalFeitaOponente = false;
  render();
  log('--- Turno do Oponente Encerrado ---');
  invocacaoNormalFeita = false;
  invocacaoSacrificioFeita = false;
}



  
  
document.getElementById('end-prep-btn').addEventListener('click', async () => {
  log('--- Fase de Combate Iniciada ---');
  await startCombatPhase();      // espera sua fase de ataques cliente
  log('--- Turno do Oponente ---');
  await opponentTurn();          // só então executa o oponente
});

  function restartGame() {
    location.reload();
  }
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]; // Troca os elementos
    }
  }

  async function animateAttack(attackerFieldId, attackerIndex, defenderFieldId = null, defenderIndex = null) {
    render(); // Atualiza a tela para garantir que os elementos existem
  
    const attackerSlot = document.querySelectorAll(`#${attackerFieldId} .slot`)[attackerIndex];
    const attackerCard = attackerSlot.querySelector('.card');
  
    if (attackerCard) {
      attackerCard.classList.add('attack');
    }
  
    if (defenderFieldId && defenderIndex !== null) {
      const defenderSlot = document.querySelectorAll(`#${defenderFieldId} .slot`)[defenderIndex];
      const defenderCard = defenderSlot.querySelector('.card');
      if (defenderCard) {
        defenderCard.classList.add('hit');
      }
    }
  
    await new Promise(resolve => setTimeout(resolve, 700));
  
    if (attackerCard ) attackerCard.classList.remove('attack');
    if (defenderFieldId && defenderIndex !== null) {
      const defenderSlot = document.querySelectorAll(`#${defenderFieldId} .slot`)[defenderIndex];
      const defenderCard = defenderSlot.querySelector('.card');
      if (defenderCard) defenderCard.classList.remove('hit');
    }
  }
  
  function ativarEfeitosDasCartas(faseAtual, cartaUnica = null) {
    const contextoBase = {
      deck: deck,
      fase: faseAtual,
      opponentField: opponentField,
      playerField: playerField,
      playerHP: playerHP,
      opponentHP: opponentHP,
      opponentGrave: opponentGrave,
      playerGrave: grave,
      enemiesOnField: opponentField.filter(c => c !== null).length,
      playerCardsOnField: playerField.filter(c => c !== null).length,
      deckSize: deck.length,
      turn: turn,
      playerHand: playerHand,
      compra: canDrawThisTurn,
      log: (message) => log(message),
      permitirCompra: () => { canDrawThisTurn = true; },
      modifyPlayerHP: (delta) => { playerHP += delta; },
      modifyOpponentHP: (delta) => { opponentHP += delta; },
      
    };
    contextoBase.invocarCriatura = (criatura) => {

    
      // Procura a primeira posição livre (null)
      const posicaoLivre = contextoBase.playerField.findIndex(slot => slot === null);
    
      if (posicaoLivre !== -1) {
        contextoBase.playerField[posicaoLivre] = criatura;
        render();
        contextoBase.log(`${criatura.name} foi invocada ao campo na posição ${posicaoLivre + 1}!`);
      } else {
        contextoBase.log(`Não há espaço disponível no campo para invocar ${criatura.name}.`);
      }
    };
    
    

    if (cartaUnica && cartaUnica.tipo === 'equipamento') {
      log(`Selecione uma criatura aliada para equipar ${cartaUnica.name}.`);
    
      const slots = document.querySelectorAll('#player-field .slot');
    
      const handleClick = (event) => {
        const index = Array.from(slots).indexOf(event.currentTarget);
        const criatura = playerField[index];
    
        if (!criatura || criatura.tipo !== 'criatura') {
          log('Você deve escolher uma criatura aliada.');
          return;
        }
    
        slots.forEach(slot => slot.removeEventListener('click', handleClick));
    
        const contexto = {
          ...contextoBase,
          alvoCampo: criatura
        };
    
        cartaUnica.effect(cartaUnica, contexto);
        grave.push(cartaUnica); // ou grave apenas quando a criatura for destruída?
        render();
      };
    
      slots.forEach(slot => slot.addEventListener('click', handleClick));
      return;
    }
    
  
    // Se a carta precisar de alvo
    if (cartaUnica && cartaUnica.alvo && (cartaUnica.alvo === 'campoInimigo' || cartaUnica.alvo === 'campoAliado')) {
      log(`Selecione um alvo no ${cartaUnica.alvo === 'campoInimigo' ? 'campo inimigo' : 'seu campo'} para ${cartaUnica.name}.`);
  
      const slots = cartaUnica.alvo === 'campoInimigo'
        ? document.querySelectorAll('#opponent-field .slot')
        : document.querySelectorAll('#player-field .slot');
  
      const campoReferente = cartaUnica.alvo === 'campoInimigo' ? opponentField : playerField;
  
      const handleClick = (event) => {
        const index = Array.from(slots).indexOf(event.currentTarget);
        const alvo = campoReferente[index];
  
        if (!alvo) {
          log('Esse slot está vazio. Selecione um alvo válido.');
          return;
        }
  
        // Remove listeners para evitar múltiplos cliques futuros
        slots.forEach(slot => slot.removeEventListener('click', handleClick));
  
        // Continua com o efeito passando o alvo
        const contexto = {
          ...contextoBase,
          alvoCampo: alvo
        };
  
        if (typeof cartaUnica.effect === 'function') {
          cartaUnica.effect(cartaUnica, contexto);
          grave.push(cartaUnica); // descarta a carta depois de uso
        }
  
        render();
      };
  
      // Aguarda o clique do jogador
      slots.forEach(slot => slot.addEventListener('click', handleClick));
      return; // aguarda o clique para continuar
    }
  
    // Efeitos normais sem alvo
    if (cartaUnica) {
      if (typeof cartaUnica.effect === 'function') {
        cartaUnica.effect(cartaUnica, contextoBase);
        return;
      }
    
      if (Array.isArray(cartaUnica.effectOptions)) {
        // Abre o modal para escolha
        abrirModalEscolhaDeEfeito(cartaUnica, contextoBase);
        return;
      }
    }
    
  
    // Executa efeitos de todas as cartas no campo (sem alvo)
    [...playerField, ...magicField, ...opponentField].forEach(carta => {
      if (carta && typeof carta.effect === 'function') {
        carta.effect(carta, contextoBase);
      }
    });

    for (const carta of playerField) {
      if (carta != null) {
        if (carta.def <= 0) {
        const slotIndex = playerField.indexOf(carta);
        const slotElement = document.querySelectorAll('#player-field .slot')[slotIndex];
        slotElement.classList.add('destroyed');
  
        // Espera a animação terminar antes de remover a carta
        setTimeout(() => {
          grave.push(carta);
          playerField[slotIndex] = null;
          render();
        }, 600); // Duração da animação
        }
      }
      
    }
    for (const carta of opponentField) {
      if (carta != null) {
        if (carta.def <= 0) {
          const slotIndex = opponentField.indexOf(carta);
          const slotElement = document.querySelectorAll('#opponent-field .slot')[slotIndex];
          slotElement.classList.add('destroyed');
    
          // Espera a animação terminar antes de remover a carta
          setTimeout(() => {
            grave.push(carta);
            opponentField[slotIndex] = null;
            render();
          }, 600); // Duração da animação

        }
    }    
  }
  }

  export function transformarCarta(carta, context) {
    const novaForma = carta.transformar?.novaForma;
    if (!novaForma) return;
  
    // Animação simples (pode ser melhor com CSS)
    const slotIndex = playerField.indexOf(carta);
    const slotElement = document.querySelectorAll('#player-field .slot')[slotIndex];
    slotElement.classList.add('transformando');
  
    setTimeout(() => {
      // Atualiza propriedades da carta
      Object.assign(carta, novaForma);
      slotElement.classList.remove('transformando');
      context.log(`${carta.name} se transformou!`);
      render();
    }, 1000); // Duração da animação
  }
  

  function abrirModalEscolhaDeEfeito(carta, contexto) {
  const modal = document.getElementById('effect-choice-modal');
  const buttonsContainer = document.getElementById('effect-buttons');

  buttonsContainer.innerHTML = ''; // limpa botões anteriores
  carta.effectOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.innerText = opt.label;
    btn.onclick = () => {
      opt.execute(carta, contexto);
      modal.style.display = 'none';
      grave.push(carta);
      render();
    };
    buttonsContainer.appendChild(btn);
  });

  modal.style.display = 'flex';
}

function getTextoInvocacaoPorNivel(nivel) {
  if (nivel <= 4) return 'Normal';
  if (nivel <= 6) return 'Requer 1 Sacrifício';
  return 'Requer 2 Sacrifícios';
}
function formatarSubtipos(subtipo) {
  if (!subtipo) return '';
  if (Array.isArray(subtipo)) {
    return `(${subtipo.map(capitalize).join(', ')})`;
  }
  return `(${capitalize(subtipo)})`;
}

  
function showCardDetailsModal(card) {
  const modal = document.getElementById('card-details-modal');
  const modalContent = document.getElementById('card-details-content');

  // tipo de invocação
  let tipoInvocacao = '';
  let invocacaoClass = '';
  if (card.tipoInvocacao === 'ambos') {
    tipoInvocacao = 'Normal e Especial';
    invocacaoClass = 'invocacao-especial';
  } else if (card.tipoInvocacao === 'especial') {
    tipoInvocacao = 'Especial';
    invocacaoClass = 'invocacao-especial';
  } else {
    tipoInvocacao = 'Normal';
  }

  function formatarAlvo(alvo) {
    switch (alvo) {
      case 'oponente': return 'Oponente';
      case 'campoInimigo': return 'Campo do Oponente';
      case 'campoAliado': return 'Seu Campo';
      case 'jogador': return 'Você';
      case 'todos': return 'Todos os Jogadores';
      default: return 'Não especificado';
    }
  }

  function formatarSubtipos(subtipo) {
    if (!subtipo) return '';
    if (Array.isArray(subtipo)) return subtipo.map(s => capitalize(s)).join(', ');
    return capitalize(subtipo);
  }

  // Cabeçalho
  let html = `
    <h2>${card.name}</h2>
    <img src="${card.img}" alt="${card.name}" class="modal-card-img">
  `;

  if (card.tipo === 'magia') {
    // Se for pendulo (magia), mostra escala
    const isPendulo = Array.isArray(card.subtipo) && card.subtipo.includes('pendulo');
    html += `
      <p><strong>Tipo:</strong> Magia ${card.subtipo ? `(${formatarSubtipos(card.subtipo)})` : ''}</p>
      <p><strong>Tipo de Invocação:</strong> <span class="${invocacaoClass}">${tipoInvocacao}</span></p>
    `;
    if (isPendulo) {
      html += `
        <p><strong>Escala Mínima:</strong> ${card.escalaMin}</p>
        <p><strong>Escala Máxima:</strong> ${card.escalaMax}</p>
      `;
    } else {
      html += `
        <p><strong>Alvo:</strong> ${formatarAlvo(card.alvo)}</p>
      `;
    }
    html += `
      <p><strong>Descrição:</strong> ${card.description || 'Sem descrição.'}</p>
      <p><strong>Expansão:</strong> <span class="${getExpansaoClass(card.expansao)}">${card.expansao || 'Sem Expansão.'}</span></p>
    `;
  } else if (card.tipo === 'equipamento') {
    html += `
      <p><strong>Tipo:</strong> Equipamento</p>
      <p><strong>Efeito:</strong> ${card.specialEffect || 'Nenhum efeito'}</p>
      <p><strong>Descrição:</strong> ${card.description || 'Sem descrição.'}</p>
      <p><strong>Expansão:</strong> <span class="${getExpansaoClass(card.expansao)}">${card.expansao || 'Sem Expansão.'}</span></p>
    `;
  } else {
    // Criatura (inclui pendulo criatura)
    const isPendulo = Array.isArray(card.subtipo) && card.subtipo.includes('pendulo');
    html += `
      <p><strong>Tipo:</strong> Criatura (${formatarSubtipos(card.subtipo)})</p>
      <p><strong>Tipo de Invocação:</strong> <span class="${invocacaoClass}">${tipoInvocacao}</span></p>
      <p><strong>Nível:</strong> ${'★'.repeat(card.nivel || 1)} (${card.nivel || 1})</p>
    `;
    if (isPendulo) {
      html += `
        <p><strong>Escala Mínima:</strong> ${card.escalaMin}</p>
        <p><strong>Escala Máxima:</strong> ${card.escalaMax}</p>
      `;
    } else {
      html += `
        <p><strong>Requisitos de Invocação:</strong> ${getTextoInvocacaoPorNivel(card.nivel || 1)}</p>
      `;
    }
    html += `
      <p><strong>ATK:</strong> ${card.atk}</p>
      <p><strong>DEF:</strong> ${card.def}</p>
      <p><strong>Efeito Especial:</strong> ${card.specialEffect || 'Nenhum'}</p>
      <p><strong>Descrição:</strong> ${card.description || 'Sem descrição.'}</p>
      <p><strong>Expansão:</strong> <span class="${getExpansaoClass(card.expansao)}">${card.expansao || 'Sem Expansão.'}</span></p>
      <p><strong>Palavras-chave:</strong> ${card.palavrasChave ? card.palavrasChave.join(', ') : 'Nenhuma'}</p>
    `;
    // Equipamentos anexados
    if (card.equipamentos && card.equipamentos.length) {
      html += `<hr><h3>Equipamentos Anexados:</h3>`;
      card.equipamentos.forEach(equip => {
        html += `
          <div class="equipamento-anexado">
            <img src="${equip.img}" alt="${equip.name}" class="mini-card-img">
            <p><strong>${equip.name}</strong><br>${equip.specialEffect || 'Sem efeito'}</p>
          </div>
        `;
      });
    }
  }

  modalContent.innerHTML = html;
  modal.style.display = 'block';
}


function mostrarModalSacrificios(cartasDisponiveis, quantidadeNecessaria, callback) {
  const form = document.getElementById('sacrificioForm');
  form.innerHTML = ''; // Limpa

  cartasDisponiveis.forEach((carta, idx) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `sacrificio-${idx}`;
    checkbox.value = idx;
    checkbox.name = 'sacrificio';

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = `${carta.name} (${carta.origem})`; // você pode definir `origem = 'campo'` ou `origem = 'mão'`

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    form.appendChild(div);
  });

  sacrificiosSelecionadosCallback = () => {
    const selecionados = [];
    const checkboxes = form.querySelectorAll('input[name="sacrificio"]:checked');
    checkboxes.forEach(cb => {
      const carta = cartasDisponiveis[cb.value];
      selecionados.push(carta);
    });

    if (selecionados.length !== quantidadeNecessaria) {
      log(`Você precisa escolher exatamente ${quantidadeNecessaria} carta(s).`);
      return;
    }

    fecharModal();
    callback(selecionados);
  };

  document.getElementById('sacrificioModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
}

function confirmarSacrificios() {
  if (sacrificiosSelecionadosCallback) {
    sacrificiosSelecionadosCallback();
  }
}

function fecharModal() {
  document.getElementById('sacrificioModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
}

window.fecharModal = fecharModal;
window.confirmarSacrificios = confirmarSacrificios;

  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  
  function getExpansaoClass(expansao) {
    switch (expansao) {
      case 'Hajimeru (Básico)':
        return 'expansao-hajimeru-basic';
      case 'Hajimeru (Avançado)':
        return 'expansao-hajimeru-advanced';
      case 'Artefactia (Básico)':
        return 'expansao-artefactia-basic';
    }
  }
  
  
  
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.classList.add('modal');
  document.body.appendChild(modal);
  function showCards(title, cards) {
    modal.innerHTML = `
      <button onclick="document.getElementById('modal').style.display='none'">Fechar</button>
        <h3>${title}</h3>
        <ul>
          ${cards.length ? cards.map(card => `<li>${card.name}</li>`).join('') : '<li>Vazio</li>'}
        </ul>
      </div>
    `;
    modal.style.display = 'block';
  }

document.addEventListener('click', function (event) {
  // Seleciona todos os modais visíveis
  const modals = document.querySelectorAll('.modal, #modal');

  modals.forEach(modal => {
    const content = modal.querySelector('.modal-content');

    if (modal.style.display !== 'none' && content && !content.contains(event.target)) {
      modal.style.display = 'none';
    }
  });
});

// Eventos de clique
document.getElementById('player-deck').addEventListener('click', () => showCards('Deck (Você)', deck));
document.getElementById('player-grave').addEventListener('click', () => showCards('Cemitério (Você)', grave));
document.getElementById('opponent-deck').addEventListener('click', () => showCards('Deck (Oponente)', opponentDeck));
document.getElementById('opponent-grave').addEventListener('click', () => showCards('Cemitério (Oponente)', opponentGrave));
document.getElementById('special-deck-panel')
        .addEventListener('click', () => showCards('Deck Especial', specialDeck.map(e=>e.card)));  
document.getElementById('special-deck-opponent')
        .addEventListener('click', () => showCards(
          'Deck Especial (Oponente)',
          opponentSpecialDeck
        ));
document.getElementById('btn-regras').addEventListener('click', () => {
  document.getElementById('modal-regras').style.display = 'block';
});

document.getElementById('fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-regras').style.display = 'none';
});

window.addEventListener('click', (event) => {
  const modal = document.getElementById('modal-regras');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

function checkOrientation() {
  const warning = document.getElementById('rotate-warning');
  if (window.innerHeight > window.innerWidth) {
    warning.style.display = 'flex'; // está em modo retrato
  } else {
    warning.style.display = 'none'; // está em modo paisagem
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('load', checkOrientation);


// Inicializa o jogo
window.onload = () => initDeckManager();