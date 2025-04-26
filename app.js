// app.js
window.addEventListener('DOMContentLoaded', () => {
    const deckEl       = document.getElementById('deck');
    const deckCountEl  = document.getElementById('deck-count');
    const handEl       = document.getElementById('hand');
    const fieldEl      = document.getElementById('field');
    const botFieldEl   = document.getElementById('bot-field');
    const yourGY       = document.getElementById('your-graveyard');
    const botGY        = document.getElementById('bot-graveyard');
    const battleLogEl  = document.getElementById('battle-log');
    const modal        = document.getElementById('card-modal');
    const cardNameEl   = document.getElementById('card-name');
    const cardDescEl   = document.getElementById('card-desc');
    const modalClose   = document.getElementById('modal-close');
  
    const cards = [
      { id:1, name:'Martin Spectend', desc:'Criatura 1500 ATK / 1200 DEF', img:'cartas/Martin.png', atk:1500, def:1200, type:'creature' },
      { id:2, name:'Espada Arcana',  desc:'Magia: +300 ATK ao aliado',       img:'cartas/Espada.jpeg',  type:'spell',    effect:c=>c.atk+=300 },
      { id:3, name:'Golem de Pedra', desc:'Criatura 1000 ATK / 2000 DEF',    img:'cartas/Golem.jpeg',  atk:1000,def:2000,type:'creature' },
      { id:4, name:'Cura Rápida',    desc:'Magia: recupera 500 HP',           img:'cartas/Cura.jpeg',   type:'spell' },
      { id:5, name:'Elfa Veloz',     desc:'Criatura 1300 ATK / 800 DEF',      img:'cartas/Elfa.jpeg',   atk:1300,def:800, type:'creature' },
      { id:6, name:'Escudo Protetor',desc:'Magia: +400 DEF ao aliado',        img:'cartas/Escudo.jpeg', type:'spell',    effect:c=>c.def+=400 },
      { id:7, name:'Dragão Rubro',   desc:'Criatura 2000 ATK / 1000 DEF',     img:'cartas/Dragao.jpeg', atk:2000,def:1000,type:'creature' },
      { id:8, name:'Fada das Sombras',desc:'Criatura 1100 ATK / 1400 DEF',     img:'cartas/Fada.jpeg',   atk:1100,def:1400,type:'creature' },
      { id:9, name:'Magia de Fogo',  desc:'Magia: causa 300 de dano',          img:'cartas/Fogo.jpeg',   type:'spell' },
      { id:10,name:'Fogo Crepitante',desc:'Magia: dano 100 a todos',           img:'cartas/Fogo2.jpeg',  type:'spell' }
    ];
  
    let deck = [], hand = [], field = null, botField = null;
    let hasSummoned = false, isPlayerTurn = false;
  
    // Fisher–Yates shuffle
    function shuffle(a){
      for(let i=a.length-1;i>0;i--){
        let j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
      }
    }
  
    function init(){
      deck=[...cards];
      shuffle(deck);
      updateDeckCount();
      handEl.innerHTML = '';
      yourGY.innerHTML = '<h4>Seu Cemitério</h4>';
      botGY.innerHTML  = '<h4>Cemitério do Bot</h4>';
      fieldEl.innerHTML = '<h3>Seu Campo</h3>';
      botFieldEl.innerHTML = '<h3>Campo do Bot</h3>';
      battleLogEl.textContent = 'Clique no deck para iniciar o turno.';
      hasSummoned = false;
      isPlayerTurn = false;
    }
  
    function updateDeckCount(){
      deckCountEl.textContent = deck.length;
    }
  
    function startTurn(){
      battleLogEl.textContent = 'Turno iniciado: Bot invoca primeiro.';
      // 1) Bot invoca
      botSummon();
      // 2) Você compra
      drawCard();
      // 3) Habilita sua invocação
      hasSummoned = false;
      isPlayerTurn = true;
      battleLogEl.textContent = 'É seu turno! Clique numa criatura para invocar.';
    }
  
    function drawCard(){
      if(!deck.length) {
        battleLogEl.textContent = 'Deck vazio!';
        return;
      }
      const c = deck.shift();
      hand.push(c);
      updateDeckCount();
      const el = createCardEl(c);
      handEl.appendChild(el);
      requestAnimationFrame(()=> el.classList.add('show'));
    }
  
    function createCardEl(card){
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<img src="${card.img}" alt="${card.name}"><div class="info">${card.name}</div>`;
      div.onclick = () => onCardClick(card, div);
      return div;
    }
  
    function onCardClick(card, el){
      if(card.type==='creature' && isPlayerTurn && !hasSummoned){
        // sua invocação
        summon(card, el);
        // combate
        doCombat();
        // encerra seu turno
        isPlayerTurn = false;
        battleLogEl.textContent += ' Clique no deck para próximo turno.';
      }
      else if(card.type==='spell' && field){
        card.effect?.(field);
        updateField(fieldEl, field);
        handEl.removeChild(el);
      }
      else if(!isPlayerTurn){
        battleLogEl.textContent = 'Aguarde seu turno!';
      }
      else {
        showModal(card);
      }
    }
  
    function summon(card, el){
      field = card;
      hasSummoned = true;
      fieldEl.innerHTML = '<h3>Seu Campo</h3>';
      const clone = el.cloneNode(true);
      fieldEl.appendChild(clone);
      hand = hand.filter(c=>c!==card);
      handEl.removeChild(el);
    }
  
    function botSummon(){
      const creatures = cards.filter(c=>c.type==='creature');
      botField = { ...creatures[Math.floor(Math.random()*creatures.length)] };
      botFieldEl.innerHTML = '<h3>Campo do Bot</h3>';
      const cardEl = createCardEl(botField);
      botFieldEl.appendChild(cardEl);
      requestAnimationFrame(()=> cardEl.classList.add('show'));
    }
  
    function doCombat(){
      if(!field || !botField) return;
  
      let msg = '';
      if(field.atk > botField.atk){
        msg = 'Você venceu o combate!';
        moveToGraveyard(botField, botGY);
        botFieldEl.innerHTML = '<h3>Campo do Bot</h3>';
        botField = null;
      }
      else if(field.atk < botField.atk){
        msg = 'Você perdeu o combate!';
        moveToGraveyard(field, yourGY);
        fieldEl.innerHTML = '<h3>Seu Campo</h3>';
        field = null;
        hasSummoned = false;
      }
      else {
        msg = 'Empate!';
        moveToGraveyard(field, yourGY);
        moveToGraveyard(botField, botGY);
        fieldEl.innerHTML = '<h3>Seu Campo</h3>';
        botFieldEl.innerHTML = '<h3>Campo do Bot</h3>';
        field = botField = null;
        hasSummoned = false;
      }
  
      battleLogEl.textContent = msg;
    }
  
    function moveToGraveyard(card, graveEl){
      const c = createCardEl(card);
      c.style.width = '60px';
      c.style.height= '84px';
      graveEl.appendChild(c);
    }
  
    function updateField(container, card){
      container.querySelector('.info').textContent = `${card.name} (${card.atk}/${card.def})`;
    }
  
    function showModal(card){
      cardNameEl.textContent = card.name;
      cardDescEl.textContent = card.desc;
      modal.classList.add('active');
    }
  
    modalClose.onclick = ()=> modal.classList.remove('active');
    modal.onclick = e=> { if(e.target===modal) modal.classList.remove('active'); };
  
    deckEl.onclick = () => { if(!isPlayerTurn) startTurn(); };
    init();
  });

  function addCardToField(slotId, cardText) {
    const slot = document.getElementById(slotId);
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = cardText;
  
    // Adiciona a carta ao slot
    slot.appendChild(card);
  }
  
  // Exemplo: Adiciona uma carta ao campo do jogador
  addCardToField('player-slot-1', 'Carta Jogador');

  function removeCardFromField(slotId) {
    const slot = document.getElementById(slotId);
    const card = slot.querySelector('.card');
    if (card) {
      card.classList.add('destroy');
      card.addEventListener('animationend', () => card.remove());
    }
  }
  
  // Exemplo: Remove a carta do campo do jogador
  removeCardFromField('player-slot-1');