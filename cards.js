export const allCards = [
  {
    name: 'Martin',
    atk: 2,
    def: 3,
    img: 'cartas/Martin.png',
    description: 'Um professor com muita energia.',
    specialEffect: 'Se fortalece em +2 de Defesa.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.fase === 'combate') {
        context.log(`${self.name} se fortalece! Ganha +2 DEF!`);
        self.def += 2;
      }
    }
  },
  {
    name: 'Franscisco',
    atk: 4,
    def: 2,
    img: 'cartas/Francisco.png',
    description: 'Um ex-militar com muita vontade de lutar.',
    specialEffect: 'Se fortalece em +1 de Ataque.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.fase === 'combate') {
        context.log(`${self.name} se fortalece! Ganha +1 ATK!`);
        self.atk += 1;
      }
    }
  },
  {
    name: 'Hilda',
    atk: 5,
    def: 1,
    img: 'cartas/Hilda(2).png',
    description: 'Uma jovem com poderes insanos.',
    specialEffect: 'Cura o jogador em +1 de HP.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        context.log(`Jogador se cura em +1 de HP`);
        context.modifyPlayerHP(1);
      }
    }
  },
  {
    name: 'Petrichor',
    atk: 2,
    def: 2,
    img: 'cartas/Petrichor.png',
    description: 'Um xamã com poderes ancestrais.',
    specialEffect: 'Compra mais uma carta.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        context.log(`Jogador pode comprar mais uma carta`);
        context.permitirCompra();
      }
    }
  },
  {
    name: 'Diego',
    atk: 2,
    def: 2,
    img: 'cartas/Diego.png',
    description: 'Um jovem com poderes equilibrados.',
    specialEffect: 'Em turnos pares, ganha +2 de ATK.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.turn % 2 === 0) {
        self.atk += 2;
        context.log(`${self.name} ataca nas sombras! +2 ATK`);
      }
    }
  },
  {
    name: 'Helios',
    atk: 4,
    def: 1,
    img: 'cartas/Helios(2).png',
    description: 'Um Citurin com poderes de velocidade.',
    specialEffect: 'Num campo vazio, recebe +1 de DEF.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.enemiesOnField === 0 && context.fase === 'preparacao') {
        self.def += 1;
        context.log(`${self.name} se fortalece! +1 DEF`);
      }
    }
  },
  {
    name: 'Heimdall',
    atk: 4,
    def: 1,
    img: 'cartas/Heimdall.png',
    description: 'Um ex-mercenário com poderes de tempo.',
    specialEffect: 'Num campo cheio, recebe +2 de DEF.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.playerCardsOnField >= 2 && context.fase === 'preparacao') {
        self.def += 2;
        context.log(`${self.name} brilha com aliados! +2 DEF`);
      }
    }
  },
  {
    name: 'Sasuke',
    atk: 4,
    def: 1,
    img: 'cartas/Sasuke.png',
    description: 'Um ninja com poderes de teleporte.',
    specialEffect: 'Enquanto o deck tiver mais de 10 cartas, recebe +2 de ATK.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.deckSize > 10 && context.fase === 'preparacao') {
        self.atk += 2;
        context.log(`${self.name} dispara com vantagem numérica! +2 ATK`);
      }
    }
  },
  {
    name: 'Stolas',
    atk: 3,
    def: 2,
    img: 'cartas/Stolas.png',
    description: 'Um aristocrático carismático com poderes ocultos.',
    specialEffect: 'Durante a fase de preparação, se houver 2 ou mais inimigos no campo, ele ganha +1 ATK e +1 DEF.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao' && context.enemiesOnField >= 2) {
        self.atk += 1;
        self.def += 1;
        context.log(`${self.name} manipula o caos ao seu favor! +1 ATK / +1 DEF`);
      }
    }
  },
  {
    name: 'Santinho',
    atk: 5,
    def: 3,
    img: 'cartas/Santinho.png',
    description: 'Um caçador sorridente que nunca erra o alvo.',
    specialEffect: 'Na fase de preparação, se o oponente tiver mais cartas em campo, causa 1 de dano direto.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao' && context.enemiesOnField > context.playerCardsOnField) {
        context.modifyOpponentHP(-1);
        context.log(`${self.name} atira com precisão letal! Causa 1 de dano direto.`);
      }
    }
  },
  {
    name: 'Free',
    atk: 2,
    def: 2,
    img: 'cartas/Free.png',
    description: 'Um espírito livre que se fortalece com doçura.',
    specialEffect: 'Ao ser invocado, permite ao jogador comprar 1 carta se ainda não comprou neste turno.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (!context.compra) {
        context.permitirCompra();
        context.log(`${self.name} oferece um doce impulso! Você pode comprar uma carta.`);
      }
    }
  },
  {
    name: 'Dominique',
    atk: 4,
    def: 4,
    img: 'cartas/Dominique.png',
    description: 'Uma guerreira intensa que protege seus aliados com fúria.',
    specialEffect: 'Quando invocada, todas as outras cartas aliadas ganham +1 DEF por este turno.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        playerField.forEach(carta => {
          if (carta && carta !== self) {
            carta.def += 1;
          }
        });
        context.log(`${self.name} entra em campo com ira! Todos aliados ganham +1 DEF.`);
      }
    }
  },
  {
    name: 'Zym',
    atk: 7,
    def: 3,
    img: 'cartas/Zym.png',
    description: 'Um dragão celestial que aparece ao lado de Hilda. Pode ser invocado se houver uma Hilda em campo',
    tipoInvocacao: 'especial',
    expansao: 'Hajimeru (Avançado)', // Novo atributo
    podeSerInvocada: (playerField) => {
      return playerField.some(carta => carta && carta.name === 'Hilda');
    }
  }
];
