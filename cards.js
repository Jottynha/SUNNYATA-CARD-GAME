// cards.js

export const allCards = [
    { name: 'Martin', atk: 5, def: 3, img: 'cartas/Martin.png' },
    { name: 'Dragão', atk: 3, def: 4, img: 'cartas/Dragao.jpeg' },
    { name: 'Elfa', atk: 4, def: 2, img: 'cartas/Elfa.jpeg' },
    { name: 'Golem', atk: 2, def: 5, img: 'cartas/Golem.jpeg' },
    { name: 'Fada', atk: 3, def: 3, img: 'cartas/Fada.jpeg' },
    {
        
      name: 'Guerreiro Furioso',
      atk: 3,
      def: 2,
      img: 'cartas/Guerreiro.png',
      effect: (card, context) => {
        if (context.playerHP < 10) {
          card.atk += 2;
          context.log(`${card.name} entra em fúria! +2 ATK`);
        }
      }
    },
    {
      name: 'Defensor Sagrado',
      atk: 2,
      def: 5,
      img: 'cartas/Defensor.png',
      effect: (card, context) => {
        if (context.enemiesOnField === 0) {
          card.def += 1;
          context.log(`${card.name} se fortalece! +1 DEF`);
        }
      }
    },
    {
      name: 'Assassino Sombrio',
      atk: 4,
      def: 1,
      img: 'cartas/Assassino.png',
      effect: (card, context) => {
        if (context.turn % 2 === 0) {
          card.atk += 1;
          context.log(`${card.name} ataca nas sombras! +1 ATK`);
        }
      }
    },
    {
      name: 'Cavaleiro da Luz',
      atk: 2,
      def: 3,
      img: 'cartas/Cavaleiro.png',
      effect: (card, context) => {
        if (context.playerCardsOnField >= 2) {
          card.def += 2;
          context.log(`${card.name} brilha com aliados! +2 DEF`);
        }
      }
    },
    {
      name: 'Arqueiro Veloz',
      atk: 3,
      def: 2,
      img: 'cartas/Arqueiro.png',
      effect: (card, context) => {
        if (context.deckSize > 10) {
          card.atk += 1;
          context.log(`${card.name} dispara com vantagem numérica! +1 ATK`);
        }
      }
    }
  ];
  