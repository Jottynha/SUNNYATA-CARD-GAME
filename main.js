import { allCards } from './cards.js';

// Variáveis globais
let playerField = [null, null, null]; // Slots do jogador
const magicField = [null, null];
let opponentField = [null, null, null]; // Slots do oponente
const opponentMagicField = [null, null];
let selectedCard = null; // Carta selecionada para combate
let playerHP = 20;
let opponentHP = 20;
let canDrawThisTurn = true;
let invocacaoNormalFeita = false; // controla a invocação normal no turno
let turn = 0;
let playerHand = []; // cartas na mão
let selectedHandCard = null
let deck = [];
let opponentDeck = [];
let grave = [];
let opponentGrave = [];
let lastDrawnCard = null;
let selectedDeck = {};
let animacaoEntradaCampo = false;
const MAX_DECK_SIZE = 20;


function createOpponentDeck() {
  for (let i = 0; i < 20; i++) { // 20 cartas
    const randomCard = { ...allCards[Math.floor(Math.random() * allCards.length)] };
    opponentDeck.push(randomCard);
  }
}


  
function initDeckManager() {
  createOpponentDeck();
  const availableCardsContainer = document.getElementById('available-cards');
  availableCardsContainer.innerHTML = ''; // Limpar a área de cartas

  // Organizar as cartas por expansão
  const expansions = {};

  allCards.forEach(card => {
    const expansion = card.expansao || 'Sem Expansão';

    if (!expansions[expansion]) {
      expansions[expansion] = [];
    }

    expansions[expansion].push(card);
  });

  // Criar um contêiner para cada expansão
  Object.keys(expansions).forEach(expansion => {
    const expansionContainer = document.createElement('div');
    expansionContainer.classList.add('expansion-container');
    const expansionTitle = document.createElement('h3');
    expansionTitle.textContent = expansion;
    expansionContainer.appendChild(expansionTitle);

    // Criar os elementos das cartas dentro da expansão
    let cardsContainer = null;
    expansions[expansion].forEach((card, index) => {
      if (index % 8 === 0) {
        cardsContainer = document.createElement('div');
        cardsContainer.classList.add('cards-row');
        expansionContainer.appendChild(cardsContainer);
      }

      // Escolhe a função de criação com base no tipo da carta
      const cardElement =
        card.tipo === 'magia'
          ? createMagicCardElement(card)
          : card.tipo === 'equipamento'
          ? createEquipamentCardElement(card)
          : createCardElement(card);

      cardElement.classList.add('card');
      cardElement.addEventListener('click', () => selectCard(card));
      cardsContainer.appendChild(cardElement);
    });

    availableCardsContainer.appendChild(expansionContainer);
  });

  document.getElementById('start-game-btn').addEventListener('click', startGame);
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
  
    if (totalCards >= MAX_DECK_SIZE) {
      alert('Seu deck já possui 20 cartas!');
      return;
    }
  
    selectedDeck[card.name] = currentCount + 1;
    updateSelectedDeckDisplay();
  }
  
  
  // Função para iniciar o jogo
  function startGame() {
    const selectedCards = getSelectedCardsArray();

    if (selectedCards.length === MAX_DECK_SIZE) {
      deck = [...selectedCards];
      shuffleDeck(deck);
      log('Deck de 20 cartas selecionado. Iniciando o jogo...');
      document.getElementById('deck-manager').style.display = 'none';
      document.getElementById('selected-deck').style.display = 'none';
      document.getElementById('deck-count').style.display = 'none';
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
  
    equipamentoEl.style.position = 'absolute';
    equipamentoEl.style.left = `${10 + eqIndex * 5}px`; // desloca em relação ao número de equipamentos
    equipamentoEl.style.top = `${10 + eqIndex * 5}px`;
    equipamentoEl.style.zIndex = 0;
    equipamentoEl.style.opacity = '0.6';
    equipamentoEl.style.pointerEvents = 'none';
    equipamentoEl.style.transform = 'scale(0.85)';
  
    parentSlot.appendChild(equipamentoEl);
  }
  
  
  
  
  



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
        console.log(card.equipamentos);
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
    text.innerHTML = `<strong>${card.name}</strong><br><em>${card.subtipo === 'continua' ? 'Magia Contínua' : 'Magia Imediata'}</em>`;
    cardElement.appendChild(text);
  
    if (animacaoEntradaCampo) {
      cardElement.classList.add('entrada-carta');
      setTimeout(() => {
        cardElement.classList.remove('entrada-carta');
      }, 800);
    }
  
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
  
    // Adiciona imagem
    const img = document.createElement('img');
    img.src = card.img;
    img.alt = card.name;
    img.classList.add('card-image');
    cardElement.appendChild(img);
  
    // Adiciona texto
    const text = document.createElement('div');
    text.classList.add('card-text');
    text.innerHTML = `<strong>${card.name}</strong><br>ATK: ${card.atk} | DEF: ${card.def}`;
    cardElement.appendChild(text);
  
    cardElement.draggable = true;

    if (animacaoEntradaCampo) {
      cardElement.classList.add('entrada-carta');
      setTimeout(() => {
        cardElement.classList.remove('entrada-carta');
      }, 800);
    }
  
    cardElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(card));
    });

    cardElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showCardDetailsModal(card); // Abre o modal com os detalhes da carta
    });
  
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
  defender.def -= attacker.atk;

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


document.querySelectorAll('#player-field .slot').forEach((slot, index) => {
  slot.addEventListener('click', () => {
    
    if (!selectedHandCard) {
      log('Nenhuma carta selecionada!');
      return;
    }

    if (selectedHandCard.tipo === 'criatura') {
      // Invocação de criatura
      if (playerField[index]) {
        log('Este slot já está ocupado!');
        return;
      }
    
      const isEspecial = selectedHandCard.tipoInvocacao === 'especial';
    
      if (!isEspecial && invocacaoNormalFeita) {
        log('Você já fez uma invocação normal neste turno!');
        return;
      }
    
      if (isEspecial && selectedHandCard.podeSerInvocada && !selectedHandCard.podeSerInvocada(playerField)) {
        log('Condição para invocação especial não foi satisfeita!');
        return;
      }
    
      if (isEspecial) {
        log('Você realizou uma invocação especial!');
      }
    
      // Executa a invocação
      playerField[index] = selectedHandCard;
      const i = playerHand.indexOf(selectedHandCard);
      if (i !== -1) playerHand.splice(i, 1);
      selectedHandCard = null;
    
      if (!isEspecial) invocacaoNormalFeita = true;
    
      if (!playerField[index].efeitoAtivadoPreparacao) {
        ativarEfeitosDasCartas('preparacao', playerField[index]);
        playerField[index].efeitoAtivadoPreparacao = true;
      }
    
      animacaoEntradaCampo = true;
      render();
      animacaoEntradaCampo = false;
      return;
    }
    if (selectedHandCard.tipo === 'equipamento') {
      const criatura = playerField[index];
    
      if (!criatura || criatura.tipo !== 'criatura') {
        log('Você deve escolher uma criatura aliada para equipar!');
        return;
      }
    
      // Equipar
      const contexto = {
        deck,
        fase: 'preparacao',
        opponentField,
        playerField,
        playerHP,
        opponentHP,
        opponentGrave,
        playerGrave: grave,
        enemiesOnField: opponentField.filter(c => c !== null).length,
        playerCardsOnField: playerField.filter(c => c !== null).length,
        deckSize: deck.length,
        turn,
        playerHand,
        compra: canDrawThisTurn,
        log,
        permitirCompra: () => { canDrawThisTurn = true; },
        modifyPlayerHP: (delta) => { playerHP += delta; },
        modifyOpponentHP: (delta) => { opponentHP += delta; },
        alvoCampo: criatura,
      };
    
      if (!criatura.equipamentos) criatura.equipamentos = [];
      criatura.equipamentos.push(selectedHandCard);
    
      selectedHandCard.effect(selectedHandCard, contexto);
    
      const i = playerHand.indexOf(selectedHandCard);
      if (i !== -1) playerHand.splice(i, 1);
    
      log(`${criatura.name} foi equipada com ${selectedHandCard.name}!`);

      selectedHandCard = null;
      render();
      return;
    }
        
  });
});

document.querySelectorAll('#magic-field .magic-slot').forEach((slot, index) => {
  slot.addEventListener('click', () => {
    if (!selectedHandCard) {
      log('Nenhuma carta selecionada!');
      return;
    }

    if (selectedHandCard.tipo !== 'magia') {
      log('Apenas cartas mágicas podem ser colocadas neste slot!');
      return;
    }

    if (magicField[index]) {
      log('Este slot de magia já está ocupado!');
      return;
    }

    const cartaMagia = selectedHandCard;
    const i = playerHand.indexOf(cartaMagia);
    if (i !== -1) playerHand.splice(i, 1);

    // Ativa o efeito
    ativarEfeitosDasCartas('preparacao', cartaMagia);

    if (cartaMagia.subtipo === 'imediata') {
      // Vai direto pro cemitério
      grave.push(cartaMagia);
      log(`${cartaMagia.name} foi ativada e enviada ao cemitério.`);
    } else if (cartaMagia.subtipo === 'continua') {
        magicField[index] = {
          ...cartaMagia,
          turnosRestantes: cartaMagia.duracao || Infinity
        };
        log(`${cartaMagia.name} foi ativada e permanece no campo por ${cartaMagia.duracao} turno(s).`);
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

  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const attacker = playerField[i];
    const defender = opponentField[i];

    if (attacker && defender) {
      log(`${attacker.name} ataca ${defender.name}`);

      await animateAttack('player-field', i, 'opponent-field', i);

      defender.def -= attacker.atk;

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
  log('--- Fase de Combate Encerrada ---');
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


async function opponentTurn() {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Comprar carta se houver espaço no campo de magia ou criatura
  if (opponentDeck.length > 0) {
    const drawnCard = opponentDeck.pop();

    if (drawnCard.tipo === 'magia') {
      // Verifica se há espaço no campo de magia
      const magicSlotIndex = opponentMagicField.findIndex(slot => slot === null);
      if (magicSlotIndex !== -1 && typeof drawnCard.effect === 'function') {
        // Verifica se a magia pode ser ativada nesta fase
        const context = {
          fase: 'preparacao',
          modifyPlayerHP: value => {
            playerHP += value;
            if (playerHP < 0) playerHP = 0;
          },
          modifyOpponentHP: value => {
            opponentHP += value;
            if (opponentHP < 0) opponentHP = 0;
          },
          log: msg => log(msg),
        };

        // Inverter o contexto: como o bot é quem joga, ele é o "jogador"
        const flippedContext = {
          ...context,
          modifyPlayerHP: context.modifyOpponentHP,
          modifyOpponentHP: context.modifyPlayerHP
        };

        drawnCard.effect(drawnCard, flippedContext);
        opponentMagicField[magicSlotIndex] = drawnCard;
        log(`Oponente ativou a magia ${drawnCard.name}`);
        render();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay após uso da magia
      }
    } else {
      // Se for criatura, invocação normal segue como antes:
      const emptyIndices = opponentField
        .map((c, i) => (c === null ? i : -1))
        .filter(i => i !== -1);

      if (emptyIndices.length > 0) {
        let bestSlot = -1;
        let canDestroy = false;

        for (let slot of emptyIndices) {
          const playerCard = playerField[slot];
          if (playerCard && drawnCard.atk >= playerCard.def) {
            bestSlot = slot;
            canDestroy = true;
            break;
          }
        }

        if (bestSlot === -1) {
          bestSlot = emptyIndices[0];
        }

        opponentField[bestSlot] = drawnCard;
        log(`Oponente invocou ${drawnCard.name} no slot ${bestSlot + 1}`);
        render();
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    const attacker = opponentField[i];
    const defender = playerField[i];

    if (attacker && defender) {
      log(`Oponente (${attacker.name}) ataca seu ${defender.name}`);
      await new Promise(resolve => setTimeout(resolve, 600)); // Delay antes do ataque

      await animateAttack('opponent-field', i, 'player-field', i);

      defender.def -= attacker.atk;

      if (defender.def <= 0) {
        const defenderSlot = document.querySelectorAll(`#player-field .slot`)[i];
        const defenderCard = defenderSlot.querySelector('.card');
        if (defenderCard) {
          defenderCard.classList.add('destroyed');
          await new Promise(resolve => setTimeout(resolve, 1200)); // Delay da animação de destruição
        }
        grave.push(defender);
        log(`${defender.name} foi destruído!`);
        playerField[i] = null;
      } else {
        log(`${defender.name} sobreviveu com DEF ${defender.def}`);
      }

    } else if (attacker && !defender) {
      log(`${attacker.name} ataca você diretamente!`);
      await new Promise(resolve => setTimeout(resolve, 600)); // Delay antes do ataque direto

      await animateAttack('opponent-field', i);

      playerHP -= attacker.atk;
      if (playerHP <= 0) {
        playerHP = 0;
        render();
        setTimeout(() => {
          alert('Você perdeu!');
          restartGame();
        }, 100);
        return;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 600)); // Delay entre ataques
  }

  render();
  log('--- Turno do Oponente Encerrado ---');
  invocacaoNormalFeita = false;
  magicField.forEach((carta, index) => {
    if (carta && carta.tipo === 'magia' && carta.subtipo === 'continua') {
      if (carta.turnosRestantes <= 0) {
        log(`${carta.name} se esgotou e foi enviada ao cemitério.`);
        grave.push(carta);
        magicField[index] = null;
        render(); 
        return;
      }
      ativarEfeitosDasCartas('preparacao', carta);
      carta.turnosRestantes--;
      render();
    }
  });  
}

  
  
document.getElementById('end-prep-btn').addEventListener('click', () => {
    log('--- Fase de Combate Iniciada ---');
    startCombatPhase();
  
    setTimeout(() => {
      log('--- Turno do Oponente ---');
      opponentTurn();
    }, 1000); // Pequeno delay para separar fases
  });
  function restartGame() {
    playerField = [null, null, null];
    opponentField = [null, null, null];
    playerHand = [];
    selectedCard = null;
    selectedHandCard = null;
    playerHP = 10;
    opponentHP = 10;
    log('Jogo reiniciado!');
    render();
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

  
  
function showCardDetailsModal(card) {
  const modal = document.getElementById('card-details-modal');
  const modalContent = document.getElementById('card-details-content');

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
    invocacaoClass = '';
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

  let html = `
    <h2>${card.name}</h2>
    <img src="${card.img}" alt="${card.name}" class="modal-card-img">
  `;

  if (card.tipo === 'magia') {
    html += `
      <p><strong>Tipo:</strong> Magia ${card.subtipo ? `(${capitalize(card.subtipo)})` : ''}</p>
      <p><strong>Tipo de Invocação:</strong> <span class="${invocacaoClass}">${tipoInvocacao}</span></p>
      <p><strong>Alvo:</strong> ${formatarAlvo(card.alvo)}</p>
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
    // Criatura ou outro tipo padrão
    html += `
      <p><strong>Tipo:</strong> Criatura ${card.subtipo ? `(${capitalize(card.subtipo)})` : ''}</p>
      <p><strong>Tipo de Invocação:</strong> <span class="${invocacaoClass}">${tipoInvocacao}</span></p>
      <p><strong>ATK:</strong> ${card.atk}</p>
      <p><strong>DEF:</strong> ${card.def}</p>
      <p><strong>Efeito Especial:</strong> ${card.specialEffect || 'Nenhum'}</p>
      <p><strong>Descrição:</strong> ${card.description || 'Sem descrição.'}</p>
      <p><strong>Expansão:</strong> <span class="${getExpansaoClass(card.expansao)}">${card.expansao || 'Sem Expansão.'}</span></p>
    `;

    // Se tiver equipamentos anexados, exibe-os
    if (card.equipamentos && card.equipamentos.length > 0) {
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

  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  
  function getExpansaoClass(expansao) {
    switch (expansao) {
      case 'Hajimeru (Básico)':
        return 'expansao-hajimeru-basic';
      case 'Hajimeru (Avançado)':
        return 'expansao-hajimeru-advanced';
    }
  }
  
  
  
const modal = document.createElement('div');
modal.id = 'modal';
document.body.appendChild(modal);

function showCards(title, cards) {
  modal.innerHTML = `
    <h3>${title}</h3>
    <ul>
      ${cards.length ? cards.map(card => `<li>${card.name}</li>`).join('') : '<li>Vazio</li>'}
    </ul>
    <button onclick="document.getElementById('modal').style.display='none'">Fechar</button>
  `;
  modal.style.display = 'block';
}

// Eventos de clique
document.getElementById('player-deck').addEventListener('click', () => showCards('Deck (Você)', deck));
document.getElementById('player-grave').addEventListener('click', () => showCards('Cemitério (Você)', grave));
document.getElementById('opponent-deck').addEventListener('click', () => showCards('Deck (Oponente)', opponentDeck));
document.getElementById('opponent-grave').addEventListener('click', () => showCards('Cemitério (Oponente)', opponentGrave));
  
// Inicializa o jogo
window.onload = () => initDeckManager();