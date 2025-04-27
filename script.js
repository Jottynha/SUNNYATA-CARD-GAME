import { allCards } from './cards.js';

// Variáveis globais
let playerField = [null, null, null]; // Slots do jogador
let opponentField = [null, null, null]; // Slots do oponente
let selectedCard = null; // Carta selecionada para combate
let playerHP = 10;
let opponentHP = 10;
let canDrawThisTurn = true;
let turn = 0;
let playerHand = []; // cartas na mão
let selectedHandCard = null
let deck = [];
let opponentDeck = [];
let grave = [];
let opponentGrave = [];
let selectedCards = []; // Cartas selecionadas pelo jogador para o deck
let lastDrawnCard = null;


function createOpponentDeck() {
  for (let i = 0; i < 20; i++) { // 20 cartas
    const randomCard = { ...allCards[Math.floor(Math.random() * allCards.length)] };
    opponentDeck.push(randomCard);
  }
}

function aplicarEfeitoCarta(card) {
    const context = {
      playerHP: playerHP,
      enemiesOnField: opponentField.length,
      turn: turn,
      playerCardsOnField: playerField.length,
      deckSize: deck.length,
      log: (msg) => log(msg)
    };
  
    if (card.effect) {
      card.effect(card, context);
    }
  }
  
function initDeckManager() {
    createOpponentDeck();
    const availableCardsContainer = document.getElementById('available-cards');
    availableCardsContainer.innerHTML = ''; // Limpar a área de cartas
  
    allCards.forEach(card => {
      const cardElement = createCardElement(card);
      cardElement.addEventListener('click', () => selectCard(card));
      availableCardsContainer.appendChild(cardElement);
    });
  
    document.getElementById('start-game-btn').addEventListener('click', startGame);
  }
 
  
  // Função para selecionar a carta
  function selectCard(card) {
    if (selectedCards.includes(card)) {
      // Deselect if already selected
      selectedCards = selectedCards.filter(selectedCard => selectedCard !== card);
    } else if (selectedCards.length < 5) {
      // Select if there is room for more cards
      selectedCards.push(card);
    }
  
    updateSelectedCardsUI();
  }
  
  // Função para atualizar a interface com as cartas selecionadas
  function updateSelectedCardsUI() {
    const availableCardsContainer = document.getElementById('available-cards');
    const cardElements = availableCardsContainer.querySelectorAll('.card');
  
    cardElements.forEach(cardElement => {
      const cardName = cardElement.querySelector('.card-text strong').textContent;
      const card = allCards.find(card => card.name === cardName);
  
      if (selectedCards.includes(card)) {
        cardElement.classList.add('selected');
      } else {
        cardElement.classList.remove('selected');
      }
    });
  
    // Atualizar o botão de "Iniciar Jogo"
    const startGameBtn = document.getElementById('start-game-btn');
    startGameBtn.disabled = selectedCards.length !== 5;
  }
  
  // Função para iniciar o jogo
  function startGame() {
    if (selectedCards.length === 5) {
      // Colocar as cartas selecionadas no deck do jogador
      deck = [...selectedCards];  // As cartas selecionadas são o deck inicial
      shuffleDeck(deck); // Embaralha o deck
      log('Deck selecionado, iniciando o jogo...');
      document.getElementById('deck-manager').style.display = 'none'; // Ocultar o gerenciador de deck
      render(); // Renderiza o campo e a mão
    } else {
      alert('Você precisa selecionar exatamente 5 cartas!');
    }
  }



// Função para renderizar o campo e a mão
function render() {
    document.getElementById('player-hp').textContent = playerHP;
    document.getElementById('opponent-hp').textContent = opponentHP;
    const playerSlots = document.querySelectorAll('#player-field .slot');
    const opponentSlots = document.querySelectorAll('#opponent-field .slot');
    const handContainer = document.getElementById('player-hand');
  
    // Renderiza campo do jogador
    playerSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (playerField[index]) {
        const card = createCardElement(playerField[index]);
        card.classList.add('animar-entrada');
        slot.appendChild(card);
      }
    });
  
    // Renderiza campo do oponente
    opponentSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (opponentField[index]) {
        const card = createCardElement(opponentField[index]);
        card.classList.add('animar-entrada');
        slot.appendChild(card);
      }
    });
  
    // Renderiza mão
    handContainer.innerHTML = '';
    playerHand.forEach((card, i) => {
      const cardEl = createCardElement(card);
      if (card === lastDrawnCard) {
        cardEl.classList.add('ultima-carta-comprada');
      }
      cardEl.addEventListener('click', () => {
        selectedHandCard = card;
        log(`Carta "${card.name}" selecionada. Escolha um slot no campo.`);
      });
      
      handContainer.appendChild(cardEl);
    });
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
  
    cardElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(card));
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
      if (selectedHandCard && !playerField[index]) {
        playerField[index] = selectedHandCard;
        const i = playerHand.indexOf(selectedHandCard);
        if (i !== -1) playerHand.splice(i, 1); // remove da mão
        selectedHandCard = null;
        render();
      } else if (playerField[index]) {
        log('Este slot já está ocupado!');
      } else {
        log('Nenhuma carta selecionada!');
      }
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
  for (let i = 0; i < playerField.length; i++) {
    const card = playerField[i];
    if (card) {
      aplicarEfeitoCarta(card);
    }
  }

  for (let i = 0; i < 3; i++) {
    const attacker = playerField[i];
    const defender = opponentField[i];

    if (attacker && defender) {
      log(`${attacker.name} ataca ${defender.name}`);

      await animateAttack('player-field', i, 'opponent-field', i);

      defender.def -= attacker.atk;

      if (defender.def <= 0) {
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

  render();
  log('--- Fase de Combate Encerrada ---');
  canDrawThisTurn = true;
}


  async function opponentTurn() {
    const emptyIndices = opponentField
      .map((c, i) => (c === null ? i : -1))
      .filter(i => i !== -1);
  
      if (emptyIndices.length > 0 && opponentDeck.length > 0) {
        const drawnCard = opponentDeck.pop();
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
      }
    
      for (let i = 0; i < 3; i++) {
        const attacker = opponentField[i];
        const defender = playerField[i];
    
        if (attacker && defender) {
          log(`Oponente (${attacker.name}) ataca seu ${defender.name}`);
    
          await animateAttack('opponent-field', i, 'player-field', i);
    
          defender.def -= attacker.atk;
    
          if (defender.def <= 0) {
            grave.push(defender);
            log(`${defender.name} foi destruído!`);
            playerField[i] = null;
          } else {
            log(`${defender.name} sobreviveu com DEF ${defender.def}`);
          }
    
        } else if (attacker && !defender) {
          log(`${attacker.name} ataca você diretamente!`);
    
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
      }
    
      render();
      log('--- Turno do Oponente Encerrado ---');
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
  
    // Espera 400ms (tempo da animação)
    await new Promise(resolve => setTimeout(resolve, 400));
  
    if (attackerCard) attackerCard.classList.remove('attack');
    if (defenderFieldId && defenderIndex !== null) {
      const defenderSlot = document.querySelectorAll(`#${defenderFieldId} .slot`)[defenderIndex];
      const defenderCard = defenderSlot.querySelector('.card');
      if (defenderCard) defenderCard.classList.remove('hit');
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