import { transformarCarta } from './main.js';
export const allCards = [
  {
    name: 'Martin',
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 2,
    def: 3,
    img: 'cartas/Martin.png',
    description: 'Um professor com muita energia.',
    specialEffect: 'Se fortalece em +2 de Defesa e compra uma carta mágica aleatória do deck.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)', // Novo atributo
    effect: (self, context) => {
      if (context.fase === 'combate') {
        context.log(`${self.name} ativa seu efeito! Ganha +2 DEF e compra uma magia aleatória do deck!`);
        self.def += 2;
        const magias = context.deck.filter(carta => carta.tipo === 'magia');
        if (magias.length > 0) {
          const sorteada = magias[Math.floor(Math.random() * magias.length)];
          const index = context.deck.indexOf(sorteada);
          if (index !== -1) {
            context.deck.splice(index, 1);
            context.playerHand.push(sorteada);
            context.log(`Você comprou a carta mágica: ${sorteada.name}`);
          }
        } else {
          context.log('Não há cartas mágicas restantes no deck.');
        }
      }
    }
  },
  {
    name: 'Franscisco',
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 5,
    def: 1,
    img: 'cartas/Hilda(2).png',
    description: 'Uma jovem com poderes insanos. Pode se transformar ao ser equipada com um Fio de Tecelã.',
    specialEffect: 'Cura o jogador em +1 de HP.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        context.log(`Jogador se cura em +1 de HP`);
        context.modifyPlayerHP(1);
        if (self?.transformar?.condicao?.(self, context)) {
          transformarCarta(self, context);
        }
      }
    },
    transformar: {
      condicao: (self, context) => {
        return self.equipamentos?.some(eq => eq.name === 'Fio de Tecelã');
      },
      novaForma: {
        name: 'Hilda, Despertada',
        atk: 9,
        def: 4,
        equipamentos: [],
        img: 'cartas/Hilda_Despertada.png',
        description: 'Hilda revelou seu verdadeiro poder.',
        specialEffect: 'Causa 2 de dano ao oponente.',
        effect: (self, context) => {
          context.log(`Hilda Despertada causa 2 de dano ao oponente!`);
          context.modifyOpponentHP(-2);
        }
      }
    }    
  }
  ,
  {
    name: 'Petrichor',
    tipo:'criatura',
    subtipo: 'personagem',
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
    },
    fusoesPossiveis: [
      {
        com: 'Helios',
        resultado: {
          name: 'Heliorichor',
          tipo: 'criatura',
          subtipo: 'fusão',
          atk: 6,
          def: 4,
          img: 'cartas/Heliorichor.png',
          description: 'A fusão da velocidade e sabedoria.',
          specialEffect: 'Recebe +2 de DEF se não houver oponentes no campo.',
          tipoInvocacao: 'especial',
          effect: (self, context) => {
            if (context.enemiesOnField === 0) {
              self.def += 2;
              context.log(`${self.name} recebeu +2 de DEF pela fusão em campo vazio!`);
            }
          }
        }
      }
    ]
  },
  {
    name: 'Diego',
    tipo:'criatura',
    subtipo: 'NPC',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    },
    fusoesPossiveis: [
      {
        com: 'Petrichor',
        resultado: {
          name: 'Heliorichor',
          tipo: 'criatura',
          subtipo: 'fusão',
          atk: 6,
          def: 4,
          img: 'cartas/Heliorichor.png',
          description: 'A fusão da velocidade e sabedoria.',
          specialEffect: 'Recebe +2 de DEF se não houver oponentes no campo.',
          tipoInvocacao: 'especial',
          effect: (self, context) => {
            if (context.enemiesOnField === 0) {
              self.def += 2;
              context.log(`${self.name} recebeu +2 de DEF pela fusão em campo vazio!`);
            }
          }
        }
      }
    ]
  },
  {
    name: 'Heimdall',
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'personagem',
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
    tipo:'criatura',
    subtipo: 'NPC',
    atk: 7,
    def: 3,
    img: 'cartas/Zym.png',
    description: 'Um dragão celestial que aparece ao lado de Hilda. Pode ser invocado se houver uma Hilda em campo',
    tipoInvocacao: 'especial',
    expansao: 'Hajimeru (Avançado)', // Novo atributo
    podeSerInvocada: (playerField) => {
      return playerField.some(carta => carta && carta.name === 'Hilda');
    }
  },
  {
    name: 'Ruína',
    tipo: 'magia',
    subtipo: 'continua',
    img: 'cartas/Ruína.png',
    description: 'Causa 2 de dano direto ao oponente.',
    tipoInvocacao: 'especial',
    alvo: 'oponente',
    duracao: 1,
    expansao: 'Hajimeru (Avançado)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        context.modifyOpponentHP(-2);
        context.log(`${self.name} foi ativada e causou 2 de dano direto ao oponente.`);
      }
    }
  },
  {
    name: 'Destruição Inerte',
    tipo: 'magia',
    subtipo: 'imediata',
    img: 'cartas/Destruicao.png',
    description: 'Destrói uma criatura no campo inimigo.',
    tipoInvocacao: 'especial',
    alvo: 'campoInimigo', // ou 'campoAliado', dependendo do efeito
    expansao: 'Hajimeru (Avançado)',
    effect: (self, context) => {
      const { alvoCampo } = context;
  
      if (!alvoCampo) {
        context.log(`Nenhum alvo foi selecionado para ${self.name}.`);
        return;
      }
  
      context.log(`${self.name} destruiu ${alvoCampo.name} no campo inimigo!`);
  
      // Remove a carta do campo inimigo
      const index = context.opponentField.indexOf(alvoCampo);
      if (index !== -1) {
        context.opponentField[index] = null;
        context.opponentGrave.push(alvoCampo);
      }
    }
  },
  {
    name: 'Crânio',
    tipo: 'criatura',
    subtipo: 'NPC',
    atk: 4,
    def: 2,
    img: 'cartas/Cranio.png',
    description: 'Crânio pode curar ou atacar com magia.',
    specialEffect: 'Escolha entre curar 2 de HP ou causar 2 de dano ao oponente.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effectOptions: [
      {
        label: 'Curar 2 de HP',
        execute: (self, context) => {
          context.modifyPlayerHP(2);
          context.log(`${self.name} cura o jogador em +2 de HP.`);
        }
      },
      {
        label: 'Causar 2 de dano',
        execute: (self, context) => {
          context.modifyOpponentHP(-2);
          context.log(`${self.name} causa 2 de dano ao oponente.`);
        }
      }
    ]
  },
  {
    name: 'Pyke (Despertada)',
    tipo: 'equipamento',
    description: 'Arma de Hemolinfa',
    specialEffect: 'Aumenta o ATK da criatura equipada em +2.',
    img: 'cartas/Pyke.png',
    expansao: 'Hajimeru (Avançado)',
    effect: (self, context) => {
      // Aplicado ao ser equipado
      const criatura = context.alvoCampo;
      if (criatura) {
        criatura.atk += 2;
        context.log(`${criatura.name} recebeu ${self.name} (+2 ATK).`);
      }
    }
  },
  {
    name: 'Fio de Tecelã',
    tipo: 'equipamento',
    description: 'Item gerado pelas Tecelãs',
    specialEffect: 'Aumenta a DEF da criatura equipada em +2.',
    img: 'cartas/Fio.png',
    expansao: 'Hajimeru (Avançado)',
    effect: (self, context) => {
      // Aplicado ao ser equipado
      const criatura = context.alvoCampo;
      if (criatura) {
        criatura.def += 2;
        context.log(`${criatura.name} recebeu ${self.name} (+2 ATK).`);
      }
    }
  }
  
  
  
  
];
