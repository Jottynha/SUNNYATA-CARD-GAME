import { transformarCarta } from './main.js';
export const allCards = [
  {
    name: 'Martin',
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 2,
    def: 3,
    nivel: 3,
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
    },
    fusoesPossiveis: [
      {
        com: 'Sasuke',
        resultado: {
          name: 'Martinke',
          tipo: 'criatura',
          subtipo: 'fusão',
          atk: 10,
          def: 2,
          img: 'cartas/Martinke.png',
          description: 'A fusão do teleporte e cegueira.',
          specialEffect: 'Recebe +4 de ATK se não houver oponentes no campo.',
          tipoInvocacao: 'especial',
          effect: (self, context) => {
            if (context.enemiesOnField === 0) {
              self.atk += 4;
              context.log(`${self.name} recebeu +4 de ATK pela fusão em campo vazio!`);
            }
          }
        }
      }
    ]
  },
  {
    name: 'Francisco',
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 4,
    def: 2,
    nivel: 3,
    img: 'cartas/Francisco.png',
    description: 'Um ex-militar com muita vontade de lutar.',
    specialEffect: 'Se fortalece em +1 de Ataque.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    palavrasChave: ['ROBUSTO'],
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
    nivel: 4,
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
    nivel: 5,
    img: 'cartas/Petrichor.png',
    description: 'Um xamã com poderes ancestrais.',
    specialEffect: 'Invoca uma criatura auxiliar ao entrar.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        const tipos = ['defensiva', 'ofensiva', 'utilitaria'];
        const escolha = tipos[Math.floor(Math.random() * tipos.length)];
        const criatura = clonarCartaComEfeito(summonedCreatures[escolha]);


        context.log(`Petrichor invoca ${criatura.name} (${escolha}).`);
        context.invocarCriatura(criatura);

        // Se a criatura invocada tiver efeito, aplicá-lo
        if (typeof criatura.effect === 'function') {
          criatura.effect(criatura, context);
        }
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
    nivel: 2,
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
    nivel: 3,
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
    nivel: 3,
    img: 'cartas/Heimdall.png',
    description: 'Um ex-mercenário com poderes de tempo.',
    specialEffect: 'Num campo cheio, recebe +2 de DEF.',
    tipoInvocacao: 'normal',
    palavrasChave: ['ENFRAQUECER','ESCUDO'],
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
    nivel: 3,
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
    },
    fusoesPossiveis: [
      {
        com: 'Martin',
        resultado: {
          name: 'Martinke',
          tipo: 'criatura',
          subtipo: 'fusão',
          atk: 10,
          def: 2,
          img: 'cartas/Martinke.png',
          description: 'A fusão do teleporte e cegueira.',
          specialEffect: 'Recebe +4 de ATK se não houver oponentes no campo.',
          tipoInvocacao: 'especial',
          effect: (self, context) => {
            if (context.enemiesOnField === 0) {
              self.atk += 4;
              context.log(`${self.name} recebeu +4 de ATK pela fusão em campo vazio!`);
            }
          }
        }
      }
    ]
  },
  {
    name: 'Stolas',
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 3,
    def: 2,
    nivel: 3,
    img: 'cartas/Stolas.png',
    description: 'Um aristocrático carismático com poderes ocultos.',
    specialEffect: 'Durante a fase de preparação, se houver 2 ou mais inimigos no campo, ele ganha +1 ATK e +1 DEF. Ou pode criar uma "A Chama".',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Básico)',
    effectOptions: [
      {
        label: 'Efeito Passivo de Buff',
        execute: (self, context) => {
          if (context.fase === 'preparacao' && context.enemiesOnField >= 2) {
            self.atk += 1;
            self.def += 1;
            context.log(`${self.name} manipula o caos ao seu favor! +1 ATK / +1 DEF`);
          }
        }
      },
      {
        label: 'Conjurar A Chama',
        execute: (self, context) => {
          try {
            const copia = allCards.find(c => c.name === "A Chama");
            if (!copia) return null;
            context.playerHand.push(copia);
            context.log(`${self.name} conjurou uma cópia de A Chama!`);
          } catch (e) {
            context.log('Erro ao copiar "A Chama".');
          }
        }
      }
    ]
  },
  {
    name: 'Santinho',
    tipo:'criatura',
    subtipo: 'personagem',
    atk: 5,
    def: 7,
    nivel: 5,
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
    nivel: 3,
    img: 'cartas/Free.png',
    palavrasChave: ['FEROZ'],
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
    nivel: 4,
    img: 'cartas/Dominique.png',
    description: 'Uma guerreira intensa que protege seus aliados com fúria.',
    specialEffect: 'Quando invocada, todas as outras cartas aliadas ganham +1 DEF por este turno.',
    tipoInvocacao: 'normal',
    palavrasChave: ['VAMPIRICO'],
    expansao: 'Hajimeru (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        context.playerField.forEach(carta => {
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
    nivel: 5,
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
    nivel: 3,
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
  },
  {
    name: 'Vassago',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 1,
    def: 2,
    nivel: 2,
    img: 'cartas/Vassago.png',
    description: 'Um homem bizarro que busca a Chama.',
    specialEffect: 'Ao entrar em campo, busca "A Chama" no deck e a adiciona à mão.',
    tipoInvocacao: 'normal',
    expansao: 'Artefactia (Básico)',
    palavrasChave: ['IMUNE'],
    _FoiAtacada: false,
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        const index = context.deck.findIndex(carta => carta.name === 'A Chama');
        if (index !== -1) {
          const chama = context.deck.splice(index, 1)[0]; 
          context.playerHand.push(chama); // Adiciona à mão
          context.log(`${self.name} encontrou "A Chama" e a adicionou à mão.`);
        } else {
          context.log(`${self.name} procurou por "A Chama", mas ela não estava no deck.`);
        }
      }
    }
  },
  {
    name: 'A Chama',
    tipo: 'equipamento',
    subtipo: 'chama',
    img: 'cartas/A_Chama.png',
    description: 'Um grimório vivo que se vincula à alma da criatura. Cria uma magia aleatória na mão do jogador.',
    tipoInvocacao: 'normal',
    expansao: 'Hajimeru (Avançado)',
    palavrasChave: [],
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        // Considera todas as cartas mágicas existentes no jogo
        const magias = allCards.filter(carta => carta.tipo === 'magia');
  
        if (magias.length > 0) {
          const sorteada = magias[Math.floor(Math.random() * magias.length)];
  
          // Clonar a carta para não modificar a original
          const copia = JSON.parse(JSON.stringify(sorteada));
          context.playerHand.push(copia);
  
          context.log(`"A Chama" gerou uma carta mágica aleatória: ${copia.name}`);
        } else {
          context.log('Não há cartas mágicas registradas no jogo.');
        }
      }
    }
  },
  {
    name: 'Tonhão',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 7,
    def: 2,
    nivel: 4,
    img: 'cartas/Tonhão.png',
    description: 'Um guerreiro imponente cuja força pura intimida os adversários.',
    specialEffect: 'Se Tonhão atacar, causa 1 de dano a todas as criaturas inimigas.',
    tipoInvocacao: 'normal',
    expansao: 'Artefactia (Básico)',
    effect: (self, context) => {
      if (context.fase === 'combate') {
        context.opponentField.forEach((carta, idx) => {
          if (carta) {
            context.opponentField[idx].def -= 1;
          }
        });
        context.log(`${self.name} pisa tão forte que atinge todas as criaturas inimigas (-1 DEF)!`);
      }
    }
  },
  {
    name: 'Matilde',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 3,
    def: 4,
    nivel: 3,
    img: 'cartas/Matilde.png',
    description: 'Uma engenheira ciborgue que atira lasers analíticos.',
    specialEffect: 'Pode disparar um laser para causar dano ao oponente diretamente ou bufar-se em ATK.',
    tipoInvocacao: 'normal',
    expansao: 'Artefactia (Básico)',
    effectOptions: [
      {
        label: 'Tiro Preciso',
        execute: (self, context) => {
            const dano = Math.floor(self.atk * 2);
            context.modifyOpponentHP(-dano);
            context.log(`${self.name} dispara seu laser preciso e causa ${dano} de dano!`);
        }
      },
      {
        label: 'Braço Cibernético',
        execute: (self, context) => {
            self.atk *= 2;
            context.log(`${self.name} se fortalece e recebe mais ${self.atk} de dano!`);
        }
      }
    ]
  },
  {
    name: 'Kaya',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 4,
    def: 2,
    nivel: 3,
    img: 'cartas/Kaya.png',
    description: 'Uma guardiã implacável, mestre em táticas defensivas.',
    specialEffect: 'Quando Kaya entra em campo, bloqueia o próximo ataque dirigido a outra criatura aliada.',
    tipoInvocacao: 'especial',
    expansao: 'Artefactia (Básico)',
    effect: (self, context) => {
      if (context.fase === 'preparacao') {
        const protegido = context.playerField.find(carta => carta && carta !== self && carta.tipo === 'criatura');

        if (protegido) {
          if (!Array.isArray(protegido.palavrasChave)) {
            protegido.palavrasChave = [];
          }

          if (!protegido.palavrasChave.includes('ESCUDO')) {
            protegido.palavrasChave.push('ESCUDO');
            context.log(`${self.name} ergue seu escudo e protege ${protegido.name} do próximo ataque!`);
          } else {
            context.log(`${protegido.name} já está protegido por um escudo.`);
          }
        } else {
          context.log(`${self.name} queria proteger alguém, mas não há aliados no campo.`);
        }
      }
    }

  },
  {
    name: 'Jotum',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 1,
    def: 1,
    nivel: 1,
    img: 'cartas/Jotum.png',
    description: 'Um ser "colossal" cujos passos talvez tremam a terra.',
    specialEffect: 'A cada turno, Jotum cresce exponencialmente.',
    tipoInvocacao: 'normal',
    expansao: 'Artefactia (Básico)',
    effect: (self, context) => {
      if (context.fase === 'combate') {
        self.atk *= 2;
        self.def *= 2;
        context.log(`${self.name} tremeu de raiva e cresceu!`);
      }
    }
  },
  {
    name: 'Lin Lie',
    tipo: 'criatura',
    subtipo: 'personagem',
    atk: 2,
    def: 2,
    nivel: 2,
    img: 'cartas/Lin_Lie.png',
    description: 'Um guerreiro disciplinado marcado pelo fogo espiritual. Sua fúria desperta quando cercado.',
    tipoInvocacao: 'normal',
    expansao: 'Artefactia (Básico)',
    palavrasChave: ['FEROZ'],
    specialEffect: 'Combustão Espiritual: Se Lin Lie estiver cercado por 2 ou mais inimigos, ele entra em estado de Combustão, ganhando +2 ATK por 1 turno. Golpe Flamejante: Lin Lie desfere um ataque fulminante contra um inimigo com DEF igual ou inferior ao seu ATK, eliminando-o instantaneamente do campo.',
    effectOptions: [
      {
        label: 'Combustão Espiritual',
        execute: (self, context) => {
          const inimigosPerto = context.opponentField.filter(c => c !== null).length;
          if (context.fase === 'preparacao' && inimigosPerto >= 2 && !self._combustaoAtivada) {
            self.atk += 2;
            self._combustaoAtivada = true;
            context.log(`${self.name} entra em Combustão Espiritual! +2 ATK temporário.`);
          }
        }
      },
      {
        label: 'Golpe Flamejante',
        execute: (self, context) => {
          const alvos = context.opponentField.filter(c => c && c.def <= self.atk);
          if (alvos.length > 0) {
            const alvo = alvos[0];
            const index = context.opponentField.indexOf(alvo);
            if (index !== -1) {
              context.opponentField[index] = null;
              context.opponentGrave.push(alvo);
              context.log(`${self.name} desfere um Golpe Flamejante em ${alvo.name}, destruindo-o!`);
            }
          } else {
            context.log(`${self.name} tentou o Golpe Flamejante, mas nenhum alvo era vulnerável.`);
          }
        }
      }
      
    ]
  }
  
  
  
  
  
  
  
];

function clonarCartaComEfeito(cartaOriginal) {
  const { effect, transformar, ...dados } = cartaOriginal;
  const clone = JSON.parse(JSON.stringify(dados));

  if (effect) clone.effect = effect;
  if (transformar) {
    clone.transformar = {
      ...transformar,
      condicao: transformar.condicao,
      novaForma: {
        ...transformar.novaForma,
        effect: transformar.novaForma.effect
      }
    };
  }

  return clone;
}


const summonedCreatures = {
  defensiva: {
    name: 'Nala',
    tipo: 'criatura',
    subtipo: 'espírito',
    atk: 1,
    def: 5,
    img: 'cartas/Nala.png',
    description: 'Uma pequena tecelã tímida que protege.',
    tipoInvocacao: 'invocada',
    expansao: 'Hajimeru (Básico)',
    effect: () => {} // Sem efeito especial
  },
  ofensiva: {
    name: 'Cerberus',
    tipo: 'criatura',
    subtipo: 'besta',
    atk: 5,
    def: 1,
    img: 'cartas/Cerberus.png',
    description: 'Uma criatura feroz que ataca com relâmpagos.',
    tipoInvocacao: 'invocada',
    expansao: 'Hajimeru (Básico)',
    effect: () => {}
  },
  utilitaria: {
    name: 'Toupeira Estelar',
    tipo: 'criatura',
    subtipo: 'xamã',
    atk: 1,
    def: 2,
    img: 'cartas/Toupeira.png',
    description: 'Concede visão e sabedoria ao seu invocador.',
    tipoInvocacao: 'invocada',
    expansao: 'Hajimeru (Básico)',
    specialEffect: 'Compra uma carta ao entrar.',
    effect: (self, context) => {
      context.log(`${self.name} permite que você compre uma carta.`);
      context.permitirCompra();
    }
  }
};
