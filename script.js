import { allCards } from './cards.js';

// Variáveis globais
let playerField = [null, null, null]; // Slots do jogador
let opponentField = [null, null, null]; // Slots do oponente
let selectedCard = null; // Carta selecionada para combate
let playerHP = 10;
let opponentHP = 10;
let canDrawThisTurn = true;
let turn = 0;
const exampleCards = [
  { name: 'Martin', atk: 5, def: 3, img: 'cartas/Martin.png' },
  { name: 'Dragão', atk: 3, def: 4, img: 'cartas/Dragao.jpeg' },
  { name: 'Elfa', atk: 4, def: 2, img: 'cartas/Elfa.jpeg' },
  { name: 'Golem', atk: 2, def: 5, img: 'cartas/Golem.jpeg' },
  { name: 'Fada', atk: 3, def: 3, img: 'cartas/Fada.jpeg' }
];
let playerHand = []; // cartas na mão
let selectedHandCard = null
let deck = [];
let selectedCards = []; // Cartas selecionadas pelo jogador para o deck

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

function getCardCopy(cardName) {
    const cardTemplate = allCards.find(c => c.name === cardName);
    return { ...cardTemplate }; // sempre retorna uma nova instância
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
        slot.appendChild(card);
      }
    });
  
    // Renderiza campo do oponente
    opponentSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      if (opponentField[index]) {
        const card = createCardElement(opponentField[index]);
        slot.appendChild(card);
      }
    });
  
    // Renderiza mão
    handContainer.innerHTML = '';
    playerHand.forEach((card, i) => {
      const cardEl = createCardElement(card);
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


function startCombatPhase() {
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
        defender.def -= attacker.atk;
  
        if (defender.def <= 0) {
          log(`${defender.name} foi destruído!`);
          opponentField[i] = null;
        } else {
          log(`${defender.name} sobreviveu com DEF ${defender.def}`);
        }
  
      } else if (attacker && !defender) {
        log(`${attacker.name} ataca diretamente!`);
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

  function opponentTurn() {
    // Oponente compra carta aleatória
    const emptyIndices = opponentField
      .map((c, i) => (c === null ? i : -1))
      .filter(i => i !== -1);
  
    if (emptyIndices.length > 0) {
      const slotIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const randomCard = { ...exampleCards[Math.floor(Math.random() * exampleCards.length)] };
      opponentField[slotIndex] = randomCard;
      log(`Oponente invocou ${randomCard.name} no slot ${slotIndex + 1}`);
    }
  
    // Fase de ataque do oponente
    for (let i = 0; i < 3; i++) {
      const attacker = opponentField[i];
      const defender = playerField[i];
  
      if (attacker && defender) {
        log(`Oponente (${attacker.name}) ataca seu ${defender.name}`);
        defender.def -= attacker.atk;
  
        if (defender.def <= 0) {
          log(`${defender.name} foi destruído!`);
          playerField[i] = null;
        } else {
          log(`${defender.name} sobreviveu com DEF ${defender.def}`);
        }
  
      } else if (attacker && !defender) {
        log(`${attacker.name} ataca você diretamente!`);
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
  
// Adiciona cartas iniciais ao campo
playerField[0] = exampleCards[0];
opponentField[0] = exampleCards[1];
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
  
  
  // Função para atualizar a interface da mão do jogador
  function updateHandUI() {
    const handContainer = document.getElementById('hand-container');
    handContainer.innerHTML = ''; // Limpar a área da mão
  
    playerHand.forEach(card => {
      const cardElement = createCardElement(card);
      handContainer.appendChild(cardElement);
    });
  }
  
// Inicializa o jogo
window.onload = () => initDeckManager();