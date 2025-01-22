/***********************************************
 * 1) Définition des données de base
 ***********************************************/
const activitiesData = {
  LOL: {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    isOmegaUnlocked: false,
    currentOmegaXP: 0
  },
  DEV: {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    isOmegaUnlocked: false,
    currentOmegaXP: 0
  },
  Musique: {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    isOmegaUnlocked: false,
    currentOmegaXP: 0
  },
  Fruitz: {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    isOmegaUnlocked: false,
    currentOmegaXP: 0
  },
  Couisine: {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    isOmegaUnlocked: false,
    currentOmegaXP: 0
  }
};

// Variable qui stocke l'activité en cours
let currentActivity = null;

// Ajout d'une variable pour suivre la progression
let progressBarInterval;


/***********************************************
 * 2) Inventaire et table de loot
 ***********************************************/

// Inventaire : objet qui mappe "Nom d'item" -> "Quantité"
const inventory = {};

/**
 * Ajoute un item à l'inventaire.
 */
function addItemToInventory(itemName, quantity = 1) {
  if (!inventory[itemName]) {
    inventory[itemName] = 0;
  }
  inventory[itemName] += quantity;
  // Met à jour l'affichage
  updateInventoryUI();
}

// Ajout des recettes de craft
const craftingRecipes = {
  "Pièce de 2 centimes": [
    {
      ingredients: { "Pièce de 1 centime": 2 },
      quantity: 1
    }
  ],
  "Pièce de 5 centimes": [
    {
      ingredients: { "Pièce de 2 centimes": 2, "Pièce de 1 centime": 1 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 1 centime": 5 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 2 centimes": 1, "Pièce de 1 centime": 3 },
      quantity: 1
    }
  ],
  "Pièce de 10 centimes": [
    {
      ingredients: { "Pièce de 5 centimes": 2 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 2 centimes": 5 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 1 centime": 10 },
      quantity: 1
    }
  ],
  "Pièce de 20 centimes": [
    {
      ingredients: { "Pièce de 10 centimes": 2 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 5 centimes": 4 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 10 centimes": 1, "Pièce de 5 centimes": 2 },
      quantity: 1
    }
  ],
  "Pièce de 50 centimes": [
    {
      ingredients: { "Pièce de 20 centimes": 2, "Pièce de 10 centimes": 1 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 10 centimes": 5 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 20 centimes": 1, "Pièce de 10 centimes": 3 },
      quantity: 1
    }
  ],
  "Pièce de 1 euro": [
    {
      ingredients: { "Pièce de 50 centimes": 2 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 20 centimes": 5 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 50 centimes": 1, "Pièce de 20 centimes": 2, "Pièce de 10 centimes": 1 },
      quantity: 1
    }
  ],
  "Pièce de 2 euros": [
    {
      ingredients: { "Pièce de 1 euro": 2 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 50 centimes": 4 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 1 euro": 1, "Pièce de 50 centimes": 2 },
      quantity: 1
    }
  ],
  "Billet de 5 euros": [
    {
      ingredients: { "Pièce de 2 euros": 2, "Pièce de 1 euro": 1 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 2 euros": 1, "Pièce de 1 euro": 3 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 1 euro": 5 },
      quantity: 1
    }
  ],
  "Billet de 10 euros": [
    {
      ingredients: { "Billet de 5 euros": 2 },
      quantity: 1
    },
    {
      ingredients: { "Pièce de 2 euros": 5 },
      quantity: 1
    },
    {
      ingredients: { "Billet de 5 euros": 1, "Pièce de 2 euros": 2, "Pièce de 1 euro": 1 },
      quantity: 1
    }
  ],
  "Billet de 20 euros": [
    {
      ingredients: { "Billet de 10 euros": 2 },
      quantity: 1
    },
    {
      ingredients: { "Billet de 5 euros": 4 },
      quantity: 1
    },
    {
      ingredients: { "Billet de 10 euros": 1, "Billet de 5 euros": 2 },
      quantity: 1
    }
  ]
};

// Ajout d'une variable globale pour stocker la quantité de craft sélectionnée
let selectedCraftQuantity = 1;

/**
 * Calcule le nombre maximum d'items qu'on peut crafter avec les ingrédients disponibles
 */
function getMaxCraftAmount(itemName, recipeIndex) {
  const recipe = craftingRecipes[itemName][recipeIndex];
  let maxPossible = Infinity;

  for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
    if (!inventory[ingredient]) return 0;
    const possibleWithThisIngredient = Math.floor(inventory[ingredient] / required);
    maxPossible = Math.min(maxPossible, possibleWithThisIngredient);
  }

  return maxPossible;
}

/**
 * Craft multiple fois le même item
 */
function craftMultipleItems(itemName, recipeIndex, amount) {
  const maxPossible = getMaxCraftAmount(itemName, recipeIndex);
  const craftAmount = amount === 'max' ? maxPossible : Math.min(amount, maxPossible);
  
  for (let i = 0; i < craftAmount; i++) {
    if (!craftItem(itemName, recipeIndex)) break;
  }
}

/**
 * Vérifie si on a assez d'ingrédients pour une recette
 */
function canCraft(itemName, recipeIndex) {
  const recipeList = craftingRecipes[itemName];
  if (!recipeList || !recipeList[recipeIndex]) return false;

  const recipe = recipeList[recipeIndex];
  for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
    if (!inventory[ingredient] || inventory[ingredient] < required) {
      return false;
    }
  }
  return true;
}

/**
 * Fabrique un item selon la recette donnée
 */
function craftItem(itemName, recipeIndex) {
  if (!canCraft(itemName, recipeIndex)) {
    console.log("Pas assez d'ingrédients pour fabriquer cet item !");
    return false;
  }

  const recipe = craftingRecipes[itemName][recipeIndex];
  
  // Retire les ingrédients de l'inventaire
  for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
    inventory[ingredient] -= required;
  }

  // Ajoute l'item crafté à l'inventaire
  addItemToInventory(itemName, recipe.quantity);
  console.log(`${itemName} fabriqué avec succès !`);
  return true;
}

/**
 * Met à jour la section "Inventaire" dans le HTML.
 */
function updateInventoryUI() {
  const inventoryDiv = document.getElementById('inventory');
  inventoryDiv.innerHTML = '';

  // Affichage de l'inventaire
  const inventoryList = document.createElement('div');
  inventoryList.innerHTML = '<h3>Inventaire</h3>';
  for (const itemName in inventory) {
    const qty = inventory[itemName];
    const p = document.createElement('p');
    p.textContent = `${itemName} : ${qty}`;
    inventoryList.appendChild(p);
  }
  inventoryDiv.appendChild(inventoryList);

  // Section de craft
  const craftingDiv = document.createElement('div');
  craftingDiv.innerHTML = '<h3>Artisanat</h3>';

  // Boutons de sélection de quantité
  const quantityDiv = document.createElement('div');
  quantityDiv.style.marginBottom = '10px';
  const quantities = [1, 5, 10, 50, 'max'];
  
  quantities.forEach(qty => {
    const qtyButton = document.createElement('button');
    qtyButton.textContent = qty;
    qtyButton.style.margin = '0 5px';
    qtyButton.style.padding = '5px 10px';
    if (qty === selectedCraftQuantity) {
      qtyButton.style.backgroundColor = '#4CAF50';
      qtyButton.style.color = 'white';
    }
    qtyButton.onclick = () => {
      selectedCraftQuantity = qty;
      updateInventoryUI();
    };
    quantityDiv.appendChild(qtyButton);
  });
  craftingDiv.appendChild(quantityDiv);

  // Création d'une grille pour les items craftables
  const craftGrid = document.createElement('div');
  craftGrid.style.display = 'grid';
  craftGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  craftGrid.style.gap = '10px';

  for (const itemName in craftingRecipes) {
    const itemCard = document.createElement('div');
    itemCard.style.border = '1px solid #ccc';
    itemCard.style.padding = '10px';
    itemCard.style.textAlign = 'center';

    const itemTitle = document.createElement('h4');
    itemTitle.textContent = itemName;
    itemCard.appendChild(itemTitle);

    craftingRecipes[itemName].forEach((recipe, index) => {
      const button = document.createElement('button');
      const maxAmount = getMaxCraftAmount(itemName, index);
      const craftAmount = selectedCraftQuantity === 'max' ? maxAmount : Math.min(selectedCraftQuantity, maxAmount);
      
      button.textContent = `Fabriquer ${itemName} (x${craftAmount})`;
      button.style.margin = '5px';
      button.disabled = craftAmount === 0;
      button.onclick = () => craftMultipleItems(itemName, index, selectedCraftQuantity);
      
      const ingredients = Object.entries(recipe.ingredients)
        .map(([name, qty]) => `${qty * (selectedCraftQuantity === 'max' ? maxAmount : selectedCraftQuantity)} ${name}`)
        .join(', ');
      button.title = `Nécessite : ${ingredients}`;
      
      itemCard.appendChild(button);
    });

    craftGrid.appendChild(itemCard);
  }

  craftingDiv.appendChild(craftGrid);
  inventoryDiv.appendChild(craftingDiv);
}

/**
 * Table de loot pour l'activité "DEV" selon le niveau atteint.
 * "level" indique le niveau minimum à partir duquel on peut avoir l'item.
 */
const DEVLootTable = [
  { level: 1,   name: "Pièce de 1 centime" },
  { level: 10,  name: "Pièce de 2 centimes" },
  { level: 20,  name: "Pièce de 5 centimes" },
  { level: 30,  name: "Pièce de 10 centimes" },
  { level: 40,  name: "Pièce de 20 centimes" },
  { level: 50,  name: "Pièce de 50 centimes" },
  { level: 60,  name: "Pièce de 1 euro" },
  { level: 70,  name: "Pièce de 2 euros" },
  { level: 80,  name: "Billet de 5 euros" },
  { level: 90,  name: "Billet de 10 euros" },
  { level: 100, name: "Billet de 20 euros" }
];

/**
 * Retourne la liste des items "débloqués" en fonction du niveau actuel de l'activité DEV.
 * Exemple : si on est niveau 25, on peut drop "Pièce de 1 centime", "Pièce de 2 centimes" et "Pièce de 5 centimes".
 */
function getUnlockedItemsForDEV(level) {
  return DEVLootTable
    .filter(entry => level >= entry.level)
    .map(entry => entry.name);
}

/**
 * Fonction qui gère la probabilité de loot (pour l'activité DEV).
 * Appelée à chaque tick (10 secondes).
 */
function tryToDropItemForDEV() {
  const devActivity = activitiesData.DEV;
  const possibleItems = getUnlockedItemsForDEV(devActivity.level);
  
  if (possibleItems.length === 0) return;

  const BASE_DROP_RATE = 0.8;
  
  possibleItems.forEach(itemName => {
    const itemIndex = DEVLootTable.findIndex(entry => entry.name === itemName);
    const itemRarity = itemIndex / DEVLootTable.length;
    const dropRate = BASE_DROP_RATE * (1 - itemRarity * 0.8);
    
    if (Math.random() < dropRate) {
      const baseQuantity = Math.floor(Math.random() * 3) + 1;
      const quantity = Math.max(1, Math.floor(baseQuantity * (1 - itemRarity)));
      
      addItemToInventory(itemName, quantity);
      
      // Ajoute la notification de drop
      showNotification('DEV', `Drop: ${quantity}x ${itemName}!`, 'drop');
      
      // Calcul et notification de l'XP bonus
      const baseXPBonus = 10;
      const rarityMultiplier = 1 + (itemIndex * 0.5);
      const xpBonus = Math.floor(baseXPBonus * rarityMultiplier * quantity);
      showNotification('DEV', `+${xpBonus} XP Bonus!`, 'xp');
      
      gainXP(activitiesData, 'DEV', xpBonus);
    }
  });
}


/***********************************************
 * 3) Fonctions utilitaires (XP, level, etc.)
 ***********************************************/

/**
 * Calcule la quantité d'XP nécessaire pour passer au niveau suivant.
 */
function calculateNextLevelXP(level) {
  // Formule exponentielle légère
  return Math.floor(100 * Math.pow(1.1, level - 1));
}

/**
 * Calcule le niveau global en additionnant les niveaux de toutes les activités.
 */
function getGlobalLevel(activities) {
  let totalLevel = 0;
  for (const activityName in activities) {
    totalLevel += activities[activityName].level;
  }
  return totalLevel;
}


/***********************************************
 * 4) Gestion de l'XP (gain et level-up)
 ***********************************************/

// Ajout des constantes pour les rangs LOL
const LOL_RANKS = {
  1: "Wood",
  10: "Iron",
  20: "Bronze",
  30: "Silver",
  40: "Gold",
  50: "Platinum",
  60: "Emerald",
  70: "Diamond",
  80: "Master",
  90: "Grandmaster",
  100: "Challenger"
};

/**
 * Obtient le rang actuel LOL basé sur le niveau
 */
function getLOLRank(level) {
  let rank = "Wood";
  let division = "IV";
  
  // Trouve le rang correspondant au niveau
  for (const [rankLevel, rankName] of Object.entries(LOL_RANKS)) {
    if (level >= parseInt(rankLevel)) {
      rank = rankName;
    }
  }
  
  // Calcule la division pour les rangs avant Master
  if (level < 80) {
    const levelInRank = level % 10;
    if (levelInRank >= 7) division = "I";
    else if (levelInRank >= 5) division = "II";
    else if (levelInRank >= 2) division = "III";
  } else {
    division = ""; // Pas de division pour Master+
  }
  
  return division ? `${rank} ${division}` : rank;
}

/**
 * Calcule la probabilité de victoire basée sur le niveau
 */
function calculateWinRate(level) {
  // La probabilité de base est de 45%, augmente avec le niveau
  return 0.45 + (level * 0.001);
}

// Ajout des variables pour suivre les streaks
const activitiesStreaks = {
  LOL: {
    currentStreak: 0,  // Positif pour winstreak, négatif pour losestreak
    maxStreak: 3       // Limite le bonus/malus de streak
  }
};

/**
 * Calcule le bonus/malus d'XP basé sur le streak
 */
function calculateStreakMultiplier(streak) {
  if (streak > 0) {
    // Bonus de 20% par victoire consécutive
    return 1 + (Math.min(streak, activitiesStreaks.LOL.maxStreak) * 0.2);
  } else if (streak < 0) {
    // Malus de 20% par défaite consécutive
    return 1 + (Math.max(streak, -activitiesStreaks.LOL.maxStreak) * 0.2);
  }
  return 1;
}

/**
 * Crée une notification temporaire dans une div d'activité
 */
function showNotification(activityName, message, type = 'gain') {
  const infoDiv = document.getElementById(`${activityName}-info`);
  if (!infoDiv) return;

  const notification = document.createElement('div');
  notification.textContent = message;
  
  // Définit la couleur selon le type de notification
  let backgroundColor;
  switch(type) {
    case 'loss':
      backgroundColor = 'rgba(255, 0, 0, 0.8)'; // Rouge pour les pertes
      break;
    case 'drop':
      backgroundColor = 'rgba(255, 215, 0, 0.8)'; // Doré pour les drops
      break;
    default:
      backgroundColor = 'rgba(0, 255, 0, 0.8)'; // Vert pour les gains
  }

  notification.style.cssText = `
    position: absolute;
    background-color: ${backgroundColor};
    color: ${type === 'loss' ? 'white' : 'black'};
    padding: 5px 10px;
    border-radius: 5px;
    animation: floatUp 6s ease-out forwards;
    font-weight: bold;
  `;

  // Ajoute un style pour l'animation plus longue (6 secondes)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(-50px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Positionne la notification
  const rect = infoDiv.getBoundingClientRect();
  notification.style.left = `${rect.left}px`;
  notification.style.top = `${rect.top}px`;

  document.body.appendChild(notification);

  // Supprime la notification après 6 secondes
  setTimeout(() => {
    notification.remove();
  }, 6000);
}

/**
 * Modifie la fonction gainXP pour LOL avec le système de streak
 */
function gainXP(activities, activityName, xpPerTick = 1) {
  const activity = activities[activityName];
  
  // Traitement spécial pour LOL
  if (activityName === 'LOL') {
    const winRate = calculateWinRate(activity.level);
    const isVictory = Math.random() < winRate;
    const streak = activitiesStreaks.LOL.currentStreak;
    
    if (isVictory) {
      // Mise à jour du streak (positif pour les victoires)
      activitiesStreaks.LOL.currentStreak = Math.min(
        streak < 0 ? 1 : streak + 1,
        activitiesStreaks.LOL.maxStreak
      );
      
      // Calcul du gain d'XP avec bonus de streak
      const baseXPGain = Math.floor(Math.random() * 5) + 8;
      const multiplier = calculateStreakMultiplier(activitiesStreaks.LOL.currentStreak);
      const xpGain = Math.floor(baseXPGain * multiplier);
      
      activity.currentXP += xpGain;
      console.log(
        `Victoire ! +${xpGain} LP ` +
        `(Winstreak: ${activitiesStreaks.LOL.currentStreak}, ` +
        `Bonus: ${Math.floor((multiplier - 1) * 100)}%)`
      );
      showNotification(activityName, `+${xpGain} LP!`, 'gain');
    } else {
      // Mise à jour du streak (négatif pour les défaites)
      activitiesStreaks.LOL.currentStreak = Math.max(
        streak > 0 ? -1 : streak - 1,
        -activitiesStreaks.LOL.maxStreak
      );
      
      // Calcul de la perte d'XP avec malus de streak
      const baseXPLoss = Math.floor(Math.random() * 6) + 5;
      const multiplier = calculateStreakMultiplier(activitiesStreaks.LOL.currentStreak);
      const xpLoss = Math.floor(baseXPLoss * multiplier);
      
      activity.currentXP = Math.max(0, activity.currentXP - xpLoss);
      console.log(
        `Défaite... -${xpLoss} LP ` +
        `(Losestreak: ${Math.abs(activitiesStreaks.LOL.currentStreak)}, ` +
        `Malus: ${Math.floor((multiplier - 1) * 100)}%)`
      );
      showNotification(activityName, `-${xpLoss} LP!`, 'loss');
    }
    
    // Vérification du level up ou down
    if (activity.currentXP >= activity.xpToNextLevel) {
      levelUp(activity);
    }
    
    // Mise à jour de l'interface
    updateUI();
    return;
  }
  
  // Traitement normal pour les autres activités
  if (activity.isOmegaUnlocked) {
    activity.currentOmegaXP += xpPerTick;
    showNotification(activityName, `+${xpPerTick} XP Oméga!`, 'gain');
  } else {
    activity.currentXP += xpPerTick;
    showNotification(activityName, `+${xpPerTick} XP!`, 'gain');
  }
  if (activity.currentXP >= activity.xpToNextLevel) {
    levelUp(activity);
  }
}

function levelUp(activity) {
  activity.level += 1;
  activity.currentXP -= activity.xpToNextLevel;
  activity.xpToNextLevel = calculateNextLevelXP(activity.level);

  console.log(`Félicitations, vous passez au niveau ${activity.level} !`);

  // Si on atteint le niveau 100
  if (activity.level >= 100) {
    activity.level = 100;
    activity.isOmegaUnlocked = true;
    activity.currentXP = 0;
    console.log("Mode Oméga débloqué !");
  }
}


/***********************************************
 * 5) Boucle de jeu (game loop)
 ***********************************************/

// Modification de l'intervalle de tick à 10 secondes (10000 ms)
const TICK_INTERVAL = 10000;


/***********************************************
 * 6) Gestion du démarrage / arrêt d'activité
 ***********************************************/

/**
 * Crée et met à jour la barre de progression
 */
function updateProgressBar(activityName) {
  const activityImg = document.querySelector(`img[alt="Commencer ${activityName}"]`);
  if (!activityImg) return;

  let progressBar = document.querySelector(`#progress-${activityName}`);
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = `progress-${activityName}`;
    progressBar.className = 'progress-bar';
    
    // Récupère la largeur de l'image
    const imgWidth = activityImg.offsetWidth;
    
    progressBar.style.cssText = `
      width: ${imgWidth}px;
      height: 5px;
      background-color: #ddd;
      margin-bottom: 5px;
      border-radius: 3px;
      overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background-color: #4CAF50;
      transition: width 0.1s linear;
    `;

    progressBar.appendChild(progressFill);
    
    // Insère la barre juste avant l'image
    activityImg.parentNode.insertBefore(progressBar, activityImg);
  }

  let progress = 0;
  const updateInterval = 100;
  const totalSteps = TICK_INTERVAL / updateInterval;
  
  clearInterval(progressBarInterval);
  progressBarInterval = setInterval(() => {
    progress += (100 / totalSteps);
    if (progress > 100) {
      progress = 0;
      // Déclenche immédiatement le gain d'XP à la fin de la barre
      if (currentActivity) {
        if (currentActivity === 'LOL') {
          const winRate = calculateWinRate(activitiesData[currentActivity].level);
          const isVictory = Math.random() < winRate;
          const streak = activitiesStreaks.LOL.currentStreak;
          
          if (isVictory) {
            const baseXPGain = Math.floor(Math.random() * 5) + 8;
            const multiplier = calculateStreakMultiplier(activitiesStreaks.LOL.currentStreak);
            const xpGain = Math.floor(baseXPGain * multiplier);
            activitiesData[currentActivity].currentXP += xpGain;
            showNotification(currentActivity, `+${xpGain} LP!`, 'gain');
            // ... reste du code pour la victoire ...
          } else {
            const baseXPLoss = Math.floor(Math.random() * 6) + 5;
            const multiplier = calculateStreakMultiplier(activitiesStreaks.LOL.currentStreak);
            const xpLoss = Math.floor(baseXPLoss * multiplier);
            activitiesData[currentActivity].currentXP = Math.max(0, activitiesData[currentActivity].currentXP - xpLoss);
            showNotification(currentActivity, `-${xpLoss} LP!`, 'loss');
            // ... reste du code pour la défaite ...
          }
        } else {
          // Gain d'XP normal pour les autres activités
          const xpGain = Math.floor(Math.random() * 5) + 8;
          gainXP(activitiesData, currentActivity, xpGain);
        }
        
        // Pour l'activité DEV, vérifie les drops après le gain d'XP
        if (currentActivity === 'DEV') {
          tryToDropItemForDEV();
        }
        
        updateUI();
      }
    }
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.width = `${progress}%`;
  }, updateInterval);
}

// Modifie startActivity pour ajouter la barre de progression
function startActivity(activityName) {
  if (currentActivity === activityName) {
    console.log(`Vous faites déjà : ${activityName}`);
    return;
  }
  
  // Arrête l'ancienne barre de progression si elle existe
  clearInterval(progressBarInterval);
  
  // Supprime l'ancienne barre de progression si elle existe
  if (currentActivity) {
    const oldInfoDiv = document.getElementById(`${currentActivity}-info`);
    const oldProgressBar = oldInfoDiv?.querySelector('.progress-bar');
    if (oldProgressBar) {
      oldProgressBar.remove();
    }
  }
  
  currentActivity = activityName;
  console.log(`Vous commencez l'activité : ${activityName}`);
  
  // Démarre la nouvelle barre de progression
  updateProgressBar(activityName);
}

// Modifie stopActivity pour supprimer la barre de progression
function stopActivity() {
  if (currentActivity) {
    clearInterval(progressBarInterval);
    const progressBar = document.querySelector(`#progress-${currentActivity}`);
    if (progressBar) {
      progressBar.remove();
    }
    console.log(`Vous arrêtez l'activité : ${currentActivity}`);
  }
  currentActivity = null;
}


/***********************************************
 * 7) Mise à jour de l'interface (UI)
 ***********************************************/

/**
 * Met à jour les infos de chaque activité et le niveau global.
 */
function updateUI() {
  for (const activityName in activitiesData) {
    const data = activitiesData[activityName];
    
    let infoText = '';
    if (activityName === 'LOL') {
      const rank = getLOLRank(data.level);
      const streak = activitiesStreaks.LOL.currentStreak;
      let streakText = '';
      
      if (streak > 0) {
        streakText = ` | Winstreak: ${streak}`;
      } else if (streak < 0) {
        streakText = ` | Losestreak: ${Math.abs(streak)}`;
      }
      
      infoText = `${rank} | LP: ${data.currentXP}/${data.xpToNextLevel}${streakText}`;
    } else {
      infoText = `Niveau: ${data.level} | XP: ${data.currentXP}/${data.xpToNextLevel}`;
      if (data.isOmegaUnlocked) {
        infoText += ` | Oméga XP: ${data.currentOmegaXP}`;
      }
    }
    
    const infoDiv = document.getElementById(`${activityName}-info`);
    if (infoDiv) {
      infoDiv.style.position = 'relative';  // Pour le positionnement des notifications
      infoDiv.textContent = `${activityName} => ${infoText}`;
    }
  }

  const globalLvl = getGlobalLevel(activitiesData);
  const globalLevelDiv = document.getElementById('global-level');
  if (globalLevelDiv) {
    globalLevelDiv.textContent = `Niveau global: ${globalLvl}`;
  }
}

// Initialisation de l'interface au chargement
updateUI();
updateInventoryUI();
