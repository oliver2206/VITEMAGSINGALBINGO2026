import React, { useState, useEffect, useCallback, useMemo } from "react";

function Pattern({ goBack }) {
  // ==================== CONSTANTS ====================
  const CONSTANTS = {
    MAX_CARDS: 5000,
    MAX_BALLS: 48,
    TOTAL_BALLS: 75,
    COLUMNS: ['B', 'I', 'N', 'G', 'O'],
    COLUMN_RANGES: {
      B: [1, 15],
      I: [16, 30],
      N: [31, 45],
      G: [46, 60],
      O: [61, 75]
    }
  };

  const PATTERNS = [
    { id: "blackout", label: "Blackout", icon: "⬛", numbersNeeded: 24 },
    { id: "t", label: "T Pattern", icon: "📐", numbersNeeded: 9 },
    { id: "x", label: "X Pattern", icon: "❌", numbersNeeded: 9 },
    { id: "twoLines", label: "2 Lines", icon: "📏", numbersNeeded: 10 },
    { id: "threeLines", label: "3 Lines", icon: "📊", numbersNeeded: 15 },
    { id: "fourLines", label: "4 Lines", icon: "📈", numbersNeeded: 20 },
    { id: "fourCorners", label: "4 Corners", icon: "🔲", numbersNeeded: 4 },
    { id: "sideToSide", label: "Side to Side", icon: "⬆️⬇️", numbersNeeded: 20 },
    { id: "emptyCross", label: "Empty Cross", icon: "✖️", numbersNeeded: 16 }
  ];

  const AVAILABLE_EMOJIS = ["🍀", "🎫", "⭐", "🎯", "💎", "🔥", "🌈", "🎲", "♠️", "♥️", "♦️", "♣️"];

  // ==================== DEFAULT CARDS ====================
  const DEFAULT_CARDS = [
    // Card #001 (Harry's Card)
    [
      
    [4, 10, 11, 6, 2],      // B
    [30, 19, 23, 27, 28],   // I
    [34, 32, "★", 31, 33],  // N
    [49, 50, 57, 54, 56],   // G
    [73, 69, 66, 74, 64]    // O
  ],

  // Card 2
  [
    [11, 5, 8, 6, 12],      // B
    [18, 27, 30, 29, 19],   // I
    [35, 38, "★", 42, 43],  // N
    [59, 54, 49, 51, 52],   // G
    [66, 71, 63, 69, 68]    // O
  ],

  // Card 3
  [
    [7, 13, 5, 6, 8],       // B
    [26, 17, 21, 29, 22],   // I
    [42, 36, "★", 34, 44],  // N
    [54, 60, 46, 47, 59],   // G
    [69, 64, 71, 66, 68]    // O
  ],

  // Card 4
  [
    [3, 13, 9, 11, 12],     // B
    [17, 29, 24, 27, 30],   // I
    [44, 45, "★", 36, 41],  // N
    [46, 51, 49, 48, 55],   // G
    [61, 73, 66, 70, 62]    // O
  ],

  // Card 5
  [
    [11, 8, 9, 10, 12],     // B
    [29, 20, 26, 17, 25],   // I
    [44, 45, "★", 34, 36],  // N
    [48, 50, 55, 57, 51],   // G
    [69, 62, 61, 66, 64]    // O
  ],

    [
    [3, 7, 12, 13, 15],     // B
    [17, 20, 24, 25, 27],   // I
    [36, 37, "🟩", 39, 42], // N
    [50, 51, 55, 59, 60],   // G
    [75, 63, 72, 62, 61]    // O
  ],

  // Card 2 (from first new image)
  [
    [11, 9, 10, 4, 2],      // B
    [26, 23, 21, 17, 20],   // I
    [33, 35, "🟩", 39, 40], // N
    [47, 50, 54, 59, 52],   // G
    [63, 67, 70, 65, 72]    // O
  ],

  // Card 3 (from first new image)
  [
    [1, 2, 6, 10, 15],      // B
    [16, 18, 30, 19, 25],   // I
    [31, 36, "🟩", 42, 43], // N
    [58, 49, 52, 50, 51],   // G
    [62, 64, 67, 68, 72]    // O
  ],

  // Card 4 (from first new image)
  [
    [12, 5, 6, 13, 11],     // B
    [19, 18, 30, 17, 22],   // I
    [44, 35, "🟩", 34, 33], // N
    [53, 57, 56, 58, 59],   // G
    [65, 62, 64, 67, 74]    // O
  ],

  // Card 5 (from first new image)
  [
    [10, 3, 7, 11, 12],     // B
    [23, 18, 26, 22, 30],   // I
    [33, 37, "🟩", 32, 42], // N
    [49, 47, 57, 58, 55],   // G
    [63, 66, 72, 73, 62]    // O
  ],

  // Card 6 (from first new image)
  [
    [12, 13, 14, 11, 9],    // B
    [28, 29, 16, 25, 24],   // I
    [41, 32, "🟩", 43, 35], // N
    [57, 54, 46, 49, 51],   // G
    [62, 67, 64, 69, 74]    // O
  ],

  // Card 7 (from second new image)
  [
    [11, 2, 15, 8, 12],     // B
    [27, 29, 16, 30, 21],   // I
    [42, 45, "🟩", 31, 40], // N
    [59, 55, 47, 56, 52],   // G
    [62, 67, 66, 74, 61]    // O
  ],

  // Card 8 (from second new image)
  [
    [9, 12, 7, 14, 13],     // B
    [18, 22, 25, 28, 29],   // I
    [34, 40, "🟩", 33, 45], // N
    [46, 50, 53, 55, 57],   // G
    [61, 65, 68, 70, 73]    // O
  ],

  // Card 9 (from second new image)
  [
    [13, 9, 11, 2, 15],     // B
    [27, 16, 17, 29, 30],   // I
    [32, 33, "🟩", 36, 35], // N
    [47, 50, 60, 51, 53],   // G
    [62, 63, 71, 75, 72]    // O
  ],

  [
    [11, 8, 12, 5, 15],     // B
    [16, 20, 24, 21, 30],   // I
    [31, 37, "🟩", 43, 44], // N
    [49, 55, 58, 46, 51],   // G
    [71, 69, 75, 67, 61]    // O
  ],

  [
    [5, 10, 14, 1, 3],        // B (1-15)
    [23, 28, 29, 20, 24],     // I (16-30)
    [37, 44, "🟩", 38, 47],   // N (31-45)
    [52, 54, 55, 57, 60],     // G (46-60)
    [69, 71, 72, 73, 75]      // O (61-75)
  ],
  [
    [4, 7, 11, 2, 8],         
    [18, 25, 29, 30, 26],     
    [33, 41, "🟩", 39, 45],   
    [53, 54, 58, 59, 51],     
    [68, 70, 72, 74, 75]      
  ],
  [
    [6, 9, 12, 3, 5],         
    [19, 23, 27, 28, 24],     
    [35, 42, "🟩", 44, 49],   
    [52, 54, 56, 60, 57],     
    [67, 69, 71, 73, 75]      
  ],
  [
    [2, 8, 13, 4, 7],         
    [17, 22, 26, 29, 20],     
    [36, 43, "🟩", 38, 47],   
    [53, 54, 58, 59, 55],     
    [66, 68, 70, 72, 74]      
  ],
  [
    [1, 5, 10, 3, 9],         
    [16, 21, 25, 28, 30],     
    [34, 40, "🟩", 44, 48],   
    [51, 54, 57, 60, 55],     
    [65, 67, 69, 71, 73]      
  ],
  [
    [4, 7, 11, 2, 6],         
    [18, 23, 27, 29, 24],     
    [37, 41, "🟩", 39, 45],   
    [52, 54, 58, 59, 56],     
    [64, 68, 70, 72, 74]      
  ],
  [
    [3, 8, 12, 5, 1],         
    [19, 22, 26, 28, 20],     
    [35, 42, "🟩", 38, 47],   
    [53, 54, 57, 60, 55],     
    [66, 69, 71, 73, 75]      
  ],
  [
    [2, 6, 9, 4, 7],          
    [17, 21, 25, 29, 30],     
    [33, 44, "🟩", 40, 48],   
    [51, 54, 58, 59, 56],     
    [67, 68, 70, 72, 74]      
  ],
  [
    [5, 8, 11, 3, 2],         
    [16, 20, 24, 27, 28],     
    [36, 43, "🟩", 39, 45],   
    [52, 54, 57, 60, 55],     
    [65, 69, 71, 73, 75]      
  ],
  [
    [1, 4, 7, 9, 6],          
    [18, 22, 26, 29, 23],     
    [34, 41, "🟩", 37, 47],   
    [53, 54, 58, 59, 51],     
    [66, 68, 70, 72, 74]      
  ],
  [
    [3, 5, 8, 2, 7],          
    [19, 24, 28, 30, 21],     
    [35, 42, "🟩", 38, 44],   
    [52, 54, 56, 60, 57],     
    [67, 69, 71, 73, 75]      
  ],
  [
    [4, 6, 9, 1, 8],          
    [17, 20, 25, 27, 29],     
    [33, 40, "🟩", 43, 48],   
    [51, 54, 58, 59, 55],     
    [65, 68, 70, 72, 74]      
  ],
  [
    [2, 5, 7, 3, 4],          
    [16, 21, 26, 28, 23],     
    [36, 41, "🟩", 39, 45],   
    [53, 54, 57, 60, 56],     
    [66, 67, 69, 71, 73]      
  ],
  [
    [1, 6, 8, 4, 3],          
    [18, 22, 27, 29, 24],     
    [34, 42, "🟩", 37, 47],   
    [52, 54, 58, 59, 55],     
    [64, 68, 70, 72, 74]      
  ],

  [
    [5, 7, 9, 2, 1],          
    [19, 23, 26, 28, 20],     
    [35, 40, "🟩", 43, 48],   
    [51, 54, 57, 60, 56],     
    [67, 69, 71, 73, 75]      
  ],

  [
    [3, 6, 8, 4, 2],          
    [17, 21, 25, 29, 30],     
    [33, 41, "🟩", 38, 44],   
    [53, 54, 58, 59, 55],     
    [65, 68, 70, 72, 74]      
  ],

  [
    [1, 4, 7, 3, 5],          
    [16, 20, 24, 27, 28],     
    [36, 42, "🟩", 39, 45],   
    [52, 54, 57, 60, 56],     
    [66, 67, 69, 71, 73]      
  ],

  [
    [2, 5, 8, 6, 3],          
    [18, 22, 26, 29, 23],     
    [34, 43, "🟩", 37, 47],   
    [51, 54, 58, 59, 55],     
    [64, 68, 70, 72, 74]      
  ],
  
  [
    [4, 7, 9, 1, 2],          
    [19, 21, 25, 28, 30],     
    [35, 40, "🟩", 44, 48],   
    [53, 54, 57, 60, 56],     
    [65, 67, 69, 71, 73]      
  ],

  [
    [3, 5, 6, 4, 7],          
    [17, 20, 24, 27, 29],     
    [33, 41, "🟩", 38, 45],   
    [52, 54, 58, 59, 55],     
    [66, 68, 70, 72, 74]      
  ]
];


  // ==================== INITIAL STATE ====================
  const DEFAULT_PROFILE = {
    name: "Harry",
    avatar: "🎯",
    level: 5,
    experience: 1250,
    gamesPlayed: 47,
    winRate: 68,
    favoritePattern: "X Pattern",
    joinDate: "March 2026"
  };

  // ==================== STATE ====================
  // Card generation
  const [numCardsInput, setNumCardsInput] = useState(10);
  const [ballsCalledInput, setBallsCalledInput] = useState(25);
  const [targetWinPercentage, setTargetWinPercentage] = useState(98);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cards data
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [cardWinPercentages, setCardWinPercentages] = useState([]);
  const [cardLabels, setCardLabels] = useState({
    0: { name: "Harry's Card", emoji: "🎯", notes: "BALL PICKER" }
  });

  // Game state
  const [highlightNumbers, setHighlightNumbers] = useState([]);
  const [currentPattern, setCurrentPattern] = useState("blackout");
  const [winners, setWinners] = useState({});

  // UI state
  const [viewMode, setViewMode] = useState("grid");
  const [flippedCards, setFlippedCards] = useState({});
  const [pinnedCards, setPinnedCards] = useState({});

  // Card editing
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelCardIndex, setLabelCardIndex] = useState(null);
  const [labelInput, setLabelInput] = useState("");

  // Manual number input
  const [manualNumberInput, setManualNumberInput] = useState("");

  // Favorite numbers
  const [favoriteNumbers, setFavoriteNumbers] = useState("");
  const [favoriteNumbersList, setFavoriteNumbersList] = useState([]);
  const [favoriteBias, setFavoriteBias] = useState(70);
  const [showFavoriteStats, setShowFavoriteStats] = useState(false);
  const [showNumberSelector, setShowNumberSelector] = useState(false);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [showFavoriteLists, setShowFavoriteLists] = useState(false);
  const [currentListName, setCurrentListName] = useState("");
  const [editingListName, setEditingListName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Game results
  const [gameResults, setGameResults] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentGameResult, setCurrentGameResult] = useState(null);

  // Saved cards
  const [savedCards, setSavedCards] = useState([]);
  const [showSavedCards, setShowSavedCards] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData] = useState(DEFAULT_PROFILE);

  // ==================== EFFECTS ====================
  // Initialize win percentages
  useEffect(() => {
    const percentages = DEFAULT_CARDS.map(card => calculateWinPercentage(card, currentPattern));
    setCardWinPercentages(percentages);
  }, []);

  // Update winners when numbers or cards change
  useEffect(() => {
    if (!cards.length) return;
    
    const newWinners = {};
    PATTERNS.forEach(pattern => {
      newWinners[pattern.id] = [];
    });
    
    cards.forEach((card, i) => {
      PATTERNS.forEach(pattern => {
        if (checkPattern(card, pattern.id)) {
          newWinners[pattern.id].push(i);
        }
      });
    });
    
    setWinners(newWinners);
  }, [highlightNumbers, cards]);

  // ==================== UTILITY FUNCTIONS ====================
  const formatSerial = useCallback((i) => `#${String(i + 1).padStart(3, "0")}`, []);

  const getColumnForNumber = useCallback((num) => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  }, []);

  const isPrime = useCallback((num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }, []);

  // ==================== PATTERN CHECKING FUNCTIONS ====================
  const checkBlackout = useCallback((card) => {
    return card.flat().filter(n => n !== "FREE").every(n => highlightNumbers.includes(n));
  }, [highlightNumbers]);

  const checkTPattern = useCallback((card) => {
    const topRow = card.map(col => col[0]);
    const middleCol = card[2].filter(n => n !== "FREE");
    return [...topRow, ...middleCol].every(n => highlightNumbers.includes(n));
  }, [highlightNumbers]);

  const checkXPattern = useCallback((card) => {
    let diag1 = true, diag2 = true;
    for (let i = 0; i < 5; i++) {
      const a = card[i][i];
      const b = card[i][4 - i];
      if (a !== "FREE" && !highlightNumbers.includes(a)) diag1 = false;
      if (b !== "FREE" && !highlightNumbers.includes(b)) diag2 = false;
    }
    return diag1 && diag2;
  }, [highlightNumbers]);

  const checkLines = useCallback((card, requiredLines) => {
    let rows = 0;
    for (let r = 0; r < 5; r++) {
      let complete = true;
      for (let c = 0; c < 5; c++) {
        const num = card[c][r];
        if (num !== "FREE" && !highlightNumbers.includes(num)) {
          complete = false;
          break;
        }
      }
      if (complete) rows++;
    }
    return rows >= requiredLines;
  }, [highlightNumbers]);

  const checkFourCorners = useCallback((card) => {
    const corners = [card[0][0], card[4][0], card[0][4], card[4][4]];
    return corners.every(num => num !== "FREE" && highlightNumbers.includes(num));
  }, [highlightNumbers]);

  const checkSideToSide = useCallback((card) => {
    let columns = 0;
    for (let c = 0; c < 5; c++) {
      if (c === 2) continue;
      let complete = true;
      for (let r = 0; r < 5; r++) {
        const num = card[c][r];
        if (num !== "FREE" && !highlightNumbers.includes(num)) {
          complete = false;
          break;
        }
      }
      if (complete) columns++;
    }
    return columns >= 4;
  }, [highlightNumbers]);

  const checkEmptyCross = useCallback((card) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const num = card[c][r];
        if (num === "FREE") continue;
        if (r === 2 || c === 2) continue;
        if (!highlightNumbers.includes(num)) return false;
      }
    }
    return true;
  }, [highlightNumbers]);

  const checkPattern = useCallback((card, patternId) => {
    switch(patternId) {
      case "blackout": return checkBlackout(card);
      case "t": return checkTPattern(card);
      case "x": return checkXPattern(card);
      case "twoLines": return checkLines(card, 2);
      case "threeLines": return checkLines(card, 3);
      case "fourLines": return checkLines(card, 4);
      case "fourCorners": return checkFourCorners(card);
      case "sideToSide": return checkSideToSide(card);
      case "emptyCross": return checkEmptyCross(card);
      default: return false;
    }
  }, [checkBlackout, checkTPattern, checkXPattern, checkLines, checkFourCorners, checkSideToSide, checkEmptyCross]);

  const checkAllPatterns = useCallback((card) => {
    return PATTERNS.filter(pattern => checkPattern(card, pattern.id))
      .map(pattern => ({
        id: pattern.id,
        name: pattern.label,
        icon: pattern.icon
      }));
  }, [checkPattern]);

  // ==================== WIN PERCENTAGE CALCULATION ====================
  const calculateWinPercentage = useCallback((card, patternId) => {
    const pattern = PATTERNS.find(p => p.id === patternId);
    const numbersNeeded = pattern?.numbersNeeded || 24;
    
    const cardNumbers = card.flat().filter(n => n !== "FREE");
    const matchedNumbers = cardNumbers.filter(n => highlightNumbers.includes(n)).length;
    
    return Math.min(100, Math.max(0, (matchedNumbers / numbersNeeded) * 100));
  }, [highlightNumbers]);

  const getCardScore = useCallback((card) => {
    return card.flat().filter(n => n !== "FREE" && !highlightNumbers.includes(n)).length;
  }, [highlightNumbers]);

  // ==================== CARD LABEL FUNCTIONS ====================
  const getCardLabel = useCallback((cardIndex) => {
    return cardLabels[cardIndex] || {
      name: `Card ${formatSerial(cardIndex)}`,
      emoji: "🎴",
      notes: ""
    };
  }, [cardLabels, formatSerial]);

  const updateCardLabel = useCallback((cardIndex, labelData) => {
    setCardLabels(prev => ({
      ...prev,
      [cardIndex]: { ...prev[cardIndex], ...labelData }
    }));
    setShowLabelModal(false);
    setLabelCardIndex(null);
  }, []);

  const startEditLabel = useCallback((cardIndex, e) => {
    e.stopPropagation();
    setLabelCardIndex(cardIndex);
    setLabelInput(cardLabels[cardIndex]?.name || `Card ${formatSerial(cardIndex)}`);
    setShowLabelModal(true);
  }, [cardLabels, formatSerial]);

  // ==================== FAVORITE NUMBERS FUNCTIONS ====================
  const parseFavoriteNumbers = useCallback(() => {
    const numbers = favoriteNumbers
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 75);
    
    const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
    
    setFavoriteNumbersList(uniqueNumbers);
    setShowFavoriteStats(true);
    setFavoriteNumbers(uniqueNumbers.join(", "));
    
    return uniqueNumbers;
  }, [favoriteNumbers]);

  const toggleFavoriteNumber = useCallback((num) => {
    setFavoriteNumbersList(prev => {
      const newList = prev.includes(num)
        ? prev.filter(n => n !== num)
        : [...prev, num].sort((a, b) => a - b);
      
      setFavoriteNumbers(newList.join(", "));
      if (newList.length > 0) setShowFavoriteStats(true);
      return newList;
    });
  }, []);

  const addRangeFavorite = useCallback((start, end) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setFavoriteNumbersList(prev => {
      const newList = [...new Set([...prev, ...range])].sort((a, b) => a - b);
      setFavoriteNumbers(newList.join(", "));
      setShowFavoriteStats(true);
      return newList;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    if (window.confirm("Clear all favorite numbers?")) {
      setFavoriteNumbersList([]);
      setFavoriteNumbers("");
      setShowFavoriteStats(false);
    }
  }, []);

  const selectAllInColumn = useCallback((column) => {
    const [start, end] = CONSTANTS.COLUMN_RANGES[column];
    addRangeFavorite(start, end);
  }, [addRangeFavorite]);

  const getFavoriteStats = useCallback(() => {
    const stats = {
      total: favoriteNumbersList.length,
      byColumn: { B: 0, I: 0, N: 0, G: 0, O: 0 },
      even: 0,
      odd: 0,
      prime: 0
    };
    
    favoriteNumbersList.forEach(num => {
      const col = getColumnForNumber(num);
      stats.byColumn[col]++;
      if (num % 2 === 0) stats.even++;
      else stats.odd++;
      if (isPrime(num)) stats.prime++;
    });
    
    return stats;
  }, [favoriteNumbersList, getColumnForNumber, isPrime]);

  const getFilteredNumbers = useCallback(() => {
    if (!searchTerm) return Array.from({ length: 75 }, (_, i) => i + 1);
    
    const term = searchTerm.toLowerCase();
    return Array.from({ length: 75 }, (_, i) => i + 1).filter(num => {
      return num.toString().includes(term) || 
             getColumnForNumber(num).toLowerCase().includes(term) ||
             (term === 'even' && num % 2 === 0) ||
             (term === 'odd' && num % 2 === 1) ||
             (term === 'prime' && isPrime(num));
    });
  }, [searchTerm, getColumnForNumber, isPrime]);

  // ==================== FAVORITE LISTS MANAGEMENT ====================
  const saveCurrentList = useCallback(() => {
    if (favoriteNumbersList.length === 0) {
      alert("No favorite numbers to save!");
      return;
    }
    
    if (!currentListName.trim()) {
      alert("Please enter a name for this list");
      return;
    }
    
    const newList = {
      id: Date.now(),
      name: currentListName,
      numbers: [...favoriteNumbersList],
      count: favoriteNumbersList.length,
      date: new Date().toLocaleString()
    };
    
    setFavoriteLists(prev => [...prev, newList]);
    setCurrentListName("");
    alert(`List "${currentListName}" saved successfully!`);
  }, [favoriteNumbersList, currentListName]);

  const loadFavoriteList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  const deleteFavoriteList = useCallback((listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setFavoriteLists(prev => prev.filter(list => list.id !== listId));
    }
  }, []);

  const updateListName = useCallback((listId, newName) => {
    setFavoriteLists(prev => prev.map(list => 
      list.id === listId ? { ...list, name: newName } : list
    ));
    setEditingListName(null);
  }, []);

  const exportFavoriteLists = useCallback(() => {
    const dataStr = JSON.stringify(favoriteLists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `favorite-lists-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [favoriteLists]);

  const importFavoriteLists = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setFavoriteLists(prev => [...prev, ...imported]);
          alert(`Imported ${imported.length} lists successfully!`);
        } else {
          alert("Invalid file format");
        }
      } catch (error) {
        alert("Error importing file");
      }
    };
    reader.readAsText(file);
  }, []);

  const getPredefinedLists = useCallback(() => {
    return [
      {
        id: 'popular',
        name: '🎲 Most Popular Numbers',
        numbers: [7, 11, 21, 34, 42, 50, 67, 69, 75],
        description: 'Commonly chosen numbers'
      },
      {
        id: 'corners',
        name: '⬛ Corner Numbers',
        numbers: [1, 15, 16, 30, 31, 45, 46, 60, 61, 75],
        description: 'Numbers at the edges of each column'
      },
      {
        id: 'center',
        name: '🎯 Center Column',
        numbers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        description: 'All N column numbers (31-45)'
      },
      {
        id: 'lucky',
        name: '🍀 Lucky Sevens',
        numbers: [7, 17, 27, 37, 47, 57, 67],
        description: 'Numbers ending with 7'
      },
      {
        id: 'decades',
        name: '📊 Decade Numbers',
        numbers: [10, 20, 30, 40, 50, 60, 70],
        description: 'Round numbers by decade'
      },
      {
        id: 'bingo',
        name: '🔤 B-I-N-G-O',
        numbers: [2, 9, 16, 23, 30, 37, 44, 51, 58, 65, 72],
        description: 'Numbers that spell BINGO'
      }
    ];
  }, []);

  const loadPredefinedList = useCallback((list) => {
    setFavoriteNumbersList(list.numbers);
    setFavoriteNumbers(list.numbers.join(", "));
    setShowFavoriteStats(true);
    setShowFavoriteLists(false);
  }, []);

  // ==================== CARD GENERATION ====================
  const generateCardWithFavoriteNumbers = useCallback((useFavorites = true) => {
    const card = [];
    const usedNumbers = new Set();
    const favorites = useFavorites && favoriteNumbersList.length > 0 ? favoriteNumbersList : [];
    
    for (let col = 0; col < 5; col++) {
      const colNumbers = [];
      const start = col * 15 + 1;
      
      let colPool = Array.from({ length: 15 }, (_, i) => start + i);
      colPool = colPool.filter(n => !usedNumbers.has(n));
      
      const favoritesInCol = colPool.filter(n => favorites.includes(n));
      const nonFavoritesInCol = colPool.filter(n => !favorites.includes(n));
      
      while (colNumbers.length < 5 && (favoritesInCol.length > 0 || nonFavoritesInCol.length > 0)) {
        let num;
        
        if (favoritesInCol.length > 0 && Math.random() * 100 < favoriteBias) {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
          favoritesInCol.splice(randomIndex, 1);
        } else if (nonFavoritesInCol.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonFavoritesInCol.length);
          num = nonFavoritesInCol[randomIndex];
          nonFavoritesInCol.splice(randomIndex, 1);
        } else if (favoritesInCol.length > 0) {
          const randomIndex = Math.floor(Math.random() * favoritesInCol.length);
          num = favoritesInCol[randomIndex];
          favoritesInCol.splice(randomIndex, 1);
        } else {
          break;
        }
        
        colNumbers.push(num);
        usedNumbers.add(num);
      }
      
      colNumbers.sort((a, b) => a - b);
      card.push(colNumbers);
    }
    
    card[2][2] = "FREE";
    return card;
  }, [favoriteNumbersList, favoriteBias]);

  const generateCardWithTargetPercentage = useCallback((targetPercentage, useFavorites = true) => {
    let bestCard = null;
    let bestPercentage = 0;
    const attempts = 100;
    
    for (let attempt = 0; attempt < attempts; attempt++) {
      const card = generateCardWithFavoriteNumbers(useFavorites);
      const percentage = calculateWinPercentage(card, currentPattern);
      
      if (Math.abs(percentage - targetPercentage) < Math.abs(bestPercentage - targetPercentage)) {
        bestCard = card;
        bestPercentage = percentage;
      }
      
      if (Math.abs(percentage - targetPercentage) <= 5) {
        break;
      }
    }
    
    return bestCard || generateCardWithFavoriteNumbers(useFavorites);
  }, [generateCardWithFavoriteNumbers, calculateWinPercentage, currentPattern]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    const count = Math.min(Math.max(numCardsInput, 1), CONSTANTS.MAX_CARDS);

    if (favoriteNumbers.trim() !== "") {
      parseFavoriteNumbers();
    }

    setTimeout(() => {
      const newCards = [];
      const percentages = [];
      const favoriteStats = {
        totalFavoriteNumbers: 0,
        cardsWithFavorites: 0
      };
      
      for (let i = 0; i < count; i++) {
        const useFavorites = favoriteNumbersList.length > 0 && (i % 3 !== 0);
        const card = generateCardWithTargetPercentage(targetWinPercentage, useFavorites);
        newCards.push(card);
        
        if (favoriteNumbersList.length > 0) {
          const cardNumbers = card.flat().filter(n => n !== "FREE");
          const favoriteCount = cardNumbers.filter(n => favoriteNumbersList.includes(n)).length;
          favoriteStats.totalFavoriteNumbers += favoriteCount;
          if (favoriteCount > 0) favoriteStats.cardsWithFavorites++;
        }
        
        percentages.push(calculateWinPercentage(card, currentPattern));
      }
      
      setCards(prev => [...prev, ...newCards]);
      setCardWinPercentages(prev => [...prev, ...percentages]);
      setFlippedCards({});
      setPinnedCards({});
      
      if (favoriteNumbersList.length > 0) {
        alert(`✅ Generated ${count} cards with favorite numbers!\n` +
          `📊 Stats:\n` +
          `- Favorite numbers: ${favoriteNumbersList.join(", ")}\n` +
          `- Average favorites per card: ${(favoriteStats.totalFavoriteNumbers / count).toFixed(1)}\n` +
          `- Cards with at least one favorite: ${favoriteStats.cardsWithFavorites}/${count}`);
      }
      
      setIsGenerating(false);
    }, 500);
  }, [numCardsInput, favoriteNumbers, parseFavoriteNumbers, favoriteNumbersList, generateCardWithTargetPercentage, targetWinPercentage, currentPattern, calculateWinPercentage]);

  // ==================== BALL FUNCTIONS ====================
  const toggleNumber = useCallback((num) => {
    setHighlightNumbers(prev => {
      if (prev.includes(num)) return prev.filter(n => n !== num);
      if (prev.length >= CONSTANTS.MAX_BALLS) {
        alert(`Maximum ${CONSTANTS.MAX_BALLS} balls reached`);
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  }, []);

  const selectRandomBall = useCallback(() => {
    const available = Array.from({ length: 75 }, (_, i) => i + 1)
      .filter(n => !highlightNumbers.includes(n));
    
    if (available.length === 0) {
      alert("All balls have been drawn!");
      return;
    }

    const randomBall = available[Math.floor(Math.random() * available.length)];
    toggleNumber(randomBall);
  }, [highlightNumbers, toggleNumber]);

  const handleManualNumberSubmit = useCallback((e) => {
    e.preventDefault();
    
    const num = parseInt(manualNumberInput);
    
    if (isNaN(num)) {
      alert("Please enter a valid number");
      return;
    }
    
    if (num < 1 || num > 75) {
      alert("Please enter a number between 1 and 75");
      return;
    }
    
    toggleNumber(num);
    setManualNumberInput("");
  }, [manualNumberInput, toggleNumber]);

  const handleNewRound = useCallback(() => {
    setHighlightNumbers([]);
    setFlippedCards({});
    alert("🎯 New round started! All called numbers have been cleared.");
  }, []);

  const handleReset = useCallback(() => {
    setHighlightNumbers([]);
    setFlippedCards({});
  }, []);

  // ==================== CARD ACTIONS ====================
  const togglePin = useCallback((cardIndex, e) => {
    e.stopPropagation();
    setPinnedCards(prev => ({ ...prev, [cardIndex]: !prev[cardIndex] }));
  }, []);

  const toggleCardFlip = useCallback((cardIndex) => {
    if (editingCard !== cardIndex) {
      setFlippedCards(prev => ({ ...prev, [cardIndex]: !prev[cardIndex] }));
    }
  }, [editingCard]);

  const deleteCard = useCallback((cardIndex, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete card ${formatSerial(cardIndex)}?`)) {
      setCards(prev => prev.filter((_, idx) => idx !== cardIndex));
      setCardWinPercentages(prev => prev.filter((_, idx) => idx !== cardIndex));
      
      // Update pinned cards
      setPinnedCards(prev => {
        const newPinned = {};
        Object.keys(prev).forEach(key => {
          const numKey = parseInt(key);
          if (numKey < cardIndex) newPinned[numKey] = prev[numKey];
          else if (numKey > cardIndex) newPinned[numKey - 1] = prev[numKey];
        });
        return newPinned;
      });
      
      // Update flipped cards
      setFlippedCards(prev => {
        const newFlipped = {};
        Object.keys(prev).forEach(key => {
          const numKey = parseInt(key);
          if (numKey < cardIndex) newFlipped[numKey] = prev[numKey];
          else if (numKey > cardIndex) newFlipped[numKey - 1] = prev[numKey];
        });
        return newFlipped;
      });
    }
  }, [formatSerial]);

  const startEdit = useCallback((card, idx, e) => {
    e.stopPropagation();
    setEditingCard(idx);
    setEditFormData(JSON.parse(JSON.stringify(card)));
  }, []);

  const cancelEdit = useCallback((e) => {
    e.stopPropagation();
    setEditingCard(null);
    setEditFormData(null);
  }, []);

  const saveEdit = useCallback((idx, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    
    setCards(prev => {
      const newCards = [...prev];
      newCards[idx] = editFormData;
      return newCards;
    });
    
    setCardWinPercentages(prev => {
      const newPercentages = [...prev];
      newPercentages[idx] = calculateWinPercentage(editFormData, currentPattern);
      return newPercentages;
    });
    
    setEditingCard(null);
    setEditFormData(null);
    alert(`Card ${formatSerial(idx)} saved successfully!`);
  }, [editFormData, calculateWinPercentage, currentPattern, formatSerial]);

  const updateCell = useCallback((col, row, value, e) => {
    e.stopPropagation();
    if (!editFormData) return;
    
    setEditFormData(prev => {
      const newCard = [...prev];
      newCard[col] = [...newCard[col]];
      newCard[col][row] = value === "FREE" ? "FREE" : parseInt(value) || newCard[col][row];
      return newCard;
    });
  }, [editFormData]);

  const saveCard = useCallback((card, idx, e) => {
    e.stopPropagation();
    const savedCard = {
      id: Date.now() + idx,
      card: JSON.parse(JSON.stringify(card)),
      serial: formatSerial(idx),
      label: getCardLabel(idx),
      date: new Date().toLocaleString(),
      patterns: checkAllPatterns(card)
    };
    
    setSavedCards(prev => [...prev, savedCard]);
    alert(`Card ${formatSerial(idx)} saved to collection!`);
  }, [formatSerial, getCardLabel, checkAllPatterns]);

  const loadSavedCard = useCallback((savedCard) => {
    setCards(prev => [...prev, savedCard.card]);
    setCardWinPercentages(prev => [...prev, calculateWinPercentage(savedCard.card, currentPattern)]);
    setShowSavedCards(false);
  }, [calculateWinPercentage, currentPattern]);

  const deleteSavedCard = useCallback((savedCardId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved card?")) {
      setSavedCards(prev => prev.filter(card => card.id !== savedCardId));
    }
  }, []);

  // ==================== BINGO RESULTS ====================
  const recordBingoResult = useCallback(() => {
    if (cards.length === 0) {
      alert("Please generate cards first!");
      return;
    }

    const patternWinners = winners[currentPattern] || [];
    
    if (patternWinners.length === 0) {
      alert(`No winners yet for the ${currentPattern} pattern!`);
      return;
    }

    const pattern = PATTERNS.find(p => p.id === currentPattern);
    
    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      pattern: currentPattern,
      patternIcon: pattern.icon,
      patternName: pattern.label,
      ballsDrawn: [...highlightNumbers].sort((a, b) => a - b),
      ballsDrawnCount: highlightNumbers.length,
      totalCards: cards.length,
      winners: patternWinners.map(idx => ({
        cardIndex: idx,
        serial: formatSerial(idx),
        label: getCardLabel(idx),
        card: cards[idx],
        winPercentage: cardWinPercentages[idx],
        winningPatterns: checkAllPatterns(cards[idx])
      })),
      winnerCount: patternWinners.length,
      notes: ""
    };

    setGameResults(prev => [...prev, result]);
    
    setGameHistory(prev => [{
      id: result.id,
      timestamp: result.timestamp,
      pattern: result.pattern,
      patternIcon: result.patternIcon,
      winnerCount: result.winnerCount,
      ballsDrawn: result.ballsDrawnCount
    }, ...prev]);

    setCurrentGameResult(result);
    setShowResults(true);
  }, [cards, winners, currentPattern, highlightNumbers, formatSerial, getCardLabel, cardWinPercentages, checkAllPatterns]);

  const saveGameResult = useCallback((resultId, notes) => {
    setGameResults(prev => prev.map(result => 
      result.id === resultId ? { ...result, notes, saved: true } : result
    ));
    alert("Game result saved successfully!");
  }, []);

  const deleteGameResult = useCallback((resultId) => {
    if (window.confirm("Are you sure you want to delete this game result?")) {
      setGameResults(prev => prev.filter(r => r.id !== resultId));
      setGameHistory(prev => prev.filter(h => h.id !== resultId));
      if (currentGameResult?.id === resultId) {
        setCurrentGameResult(null);
        setShowResults(false);
      }
    }
  }, [currentGameResult]);

  const exportResults = useCallback(() => {
    const dataStr = JSON.stringify(gameResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `bingo-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [gameResults]);

  const calculateStatistics = useCallback(() => {
    if (gameResults.length === 0) return null;

    const stats = {
      totalGames: gameResults.length,
      averageBallsToWin: Math.round(gameResults.reduce((acc, r) => acc + r.ballsDrawnCount, 0) / gameResults.length),
      mostWinningPattern: "",
      patternStats: {},
      averageWinnersPerGame: (gameResults.reduce((acc, r) => acc + r.winnerCount, 0) / gameResults.length).toFixed(1)
    };

    const patternCounts = {};

    gameResults.forEach(result => {
      if (!stats.patternStats[result.pattern]) {
        stats.patternStats[result.pattern] = {
          count: 0,
          totalWinners: 0,
          icon: result.patternIcon,
          name: result.patternName
        };
      }
      stats.patternStats[result.pattern].count++;
      stats.patternStats[result.pattern].totalWinners += result.winnerCount;
      patternCounts[result.pattern] = (patternCounts[result.pattern] || 0) + 1;
    });

    // Find most frequent pattern
    let maxCount = 0;
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      if (count > maxCount) {
        maxCount = count;
        stats.mostWinningPattern = stats.patternStats[pattern]?.name || pattern;
      }
    });

    return stats;
  }, [gameResults]);

  // ==================== MEMOIZED VALUES ====================
  const favoriteStats = useMemo(() => getFavoriteStats(), [getFavoriteStats]);
  const filteredNumbers = useMemo(() => getFilteredNumbers(), [getFilteredNumbers]);
  const stats = useMemo(() => calculateStatistics(), [calculateStatistics]);

  const rankedCards = useMemo(() => {
    return cards
      .map((card, idx) => ({
        card,
        idx,
        label: getCardLabel(idx),
        isWinner: winners[currentPattern]?.includes(idx) || false,
        score: getCardScore(card),
        progress: ((25 - getCardScore(card)) / 24) * 100,
        winPercentage: cardWinPercentages[idx] || 0,
        winningPatterns: checkAllPatterns(card),
        isPinned: pinnedCards[idx] || false,
        favoriteCount: favoriteNumbersList.length > 0 
          ? card.flat().filter(n => n !== "FREE" && favoriteNumbersList.includes(n)).length 
          : 0
      }))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isWinner && !b.isWinner) return -1;
        if (!a.isWinner && b.isWinner) return 1;
        return a.score - b.score;
      });
  }, [cards, getCardLabel, winners, currentPattern, getCardScore, cardWinPercentages, checkAllPatterns, pinnedCards, favoriteNumbersList]);

  const topWinner = rankedCards[0];

  // ==================== STYLES ====================
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      background: "rgba(255, 255, 255, 0.95)",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100
    },
    headerContent: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem"
    },
    title: {
      margin: 0,
      fontSize: "1.8rem",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    headerButtons: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap"
    },
    profileButton: {
      padding: "0.5rem 1rem",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    backButton: {
      padding: "0.5rem 1rem",
      background: "#f0f0f0",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease"
    },
    savedButton: {
      padding: "0.5rem 1rem",
      background: "#ffd700",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease"
    },
    resultsButton: {
      padding: "0.5rem 1rem",
      background: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease"
    },
    historyButton: {
      padding: "0.5rem 1rem",
      background: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease"
    },
    main: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem"
    },
    patternSelector: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap",
      justifyContent: "center"
    },
    patternButton: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "1rem 2rem",
      border: "none",
      borderRadius: "12px",
      background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
      color: isActive ? "white" : "black",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      position: "relative"
    }),
    controlsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem"
    },
    controlCard: {
      background: "white",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    inputGroup: {
      marginBottom: "1rem"
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#666",
      fontSize: "0.9rem",
      fontWeight: "500"
    },
    input: {
      width: "100%",
      padding: "0.5rem",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
      boxSizing: "border-box"
    },
    textarea: {
      width: "100%",
      padding: "0.5rem",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
      minHeight: "80px",
      boxSizing: "border-box",
      fontFamily: "inherit"
    },
    favoriteNumbersContainer: {
      marginTop: "1rem",
      padding: "1rem",
      background: "#f8f9fa",
      borderRadius: "12px",
      border: "2px solid #ffd700"
    },
    favoriteHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem",
      cursor: "pointer"
    },
    favoriteTitle: {
      margin: 0,
      fontSize: "1rem",
      color: "#333"
    },
    toggleButton: {
      padding: "0.25rem 0.5rem",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.8rem"
    },
    columnSelector: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1rem",
      flexWrap: "wrap"
    },
    columnButton: {
      flex: 1,
      padding: "0.5rem",
      background: "#e0e0e0",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      minWidth: "40px"
    },
    searchInput: {
      width: "100%",
      padding: "0.5rem",
      marginBottom: "0.5rem",
      border: "2px solid #e0e0e0",
      borderRadius: "4px",
      fontSize: "0.9rem"
    },
    numberSelectorGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(15, 1fr)",
      gap: "0.25rem",
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      maxHeight: "200px",
      overflowY: "auto",
      padding: "0.5rem",
      background: "white",
      borderRadius: "8px",
      border: "1px solid #e0e0e0"
    },
    numberButton: (isSelected) => ({
      aspectRatio: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isSelected ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f0f0f0",
      color: isSelected ? "white" : "#333",
      border: isSelected ? "none" : "1px solid #ccc",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.8rem",
      fontWeight: isSelected ? "bold" : "normal",
      transition: "all 0.2s ease"
    }),
    favoriteStats: {
      marginTop: "0.5rem",
      padding: "0.5rem",
      background: "#e8f4fd",
      borderRadius: "8px",
      fontSize: "0.9rem"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "0.5rem",
      marginTop: "0.5rem"
    },
    statItem: {
      background: "white",
      padding: "0.5rem",
      borderRadius: "4px",
      textAlign: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    favoriteListsSection: {
      marginTop: "1rem",
      padding: "0.5rem",
      background: "#fff3e0",
      borderRadius: "8px"
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.75rem",
      background: "white",
      borderRadius: "4px",
      marginBottom: "0.5rem",
      cursor: "pointer",
      border: "1px solid #e0e0e0"
    },
    listName: {
      fontWeight: "bold",
      fontSize: "0.95rem"
    },
    listDetails: {
      fontSize: "0.8rem",
      color: "#666"
    },
    listActions: {
      display: "flex",
      gap: "0.25rem"
    },
    smallButton: {
      padding: "0.25rem 0.5rem",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.8rem"
    },
    generateButton: {
      width: "100%",
      padding: "0.75rem",
      border: "none",
      borderRadius: "8px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "0.5rem"
    },
    randomBallButton: {
      width: "100%",
      padding: "0.75rem",
      border: "none",
      borderRadius: "8px",
      background: "#4CAF50",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer",
      marginBottom: "0.5rem"
    },
    newRoundButton: {
      width: "100%",
      padding: "0.75rem",
      border: "none",
      borderRadius: "8px",
      background: "#ff9800",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer",
      marginBottom: "0.5rem",
      transition: "all 0.3s ease",
      fontWeight: "bold"
    },
    recordResultButton: {
      width: "100%",
      padding: "0.75rem",
      border: "none",
      borderRadius: "8px",
      background: "#9C27B0",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer",
      marginBottom: "0.5rem",
      transition: "all 0.3s ease",
      fontWeight: "bold"
    },
    resetButton: {
      width: "100%",
      padding: "0.75rem",
      border: "none",
      borderRadius: "8px",
      background: "#ff4757",
      color: "white",
      fontSize: "1rem",
      cursor: "pointer"
    },
    ballsSection: {
      background: "white",
      borderRadius: "16px",
      padding: "1.5rem",
      marginBottom: "2rem"
    },
    ballsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(15, 1fr)",
      gap: "0.5rem"
    },
    ball: (active) => ({
      aspectRatio: "1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: active ? "#ffeb3b" : "white",
      border: active ? "2px solid #fbc02d" : "2px solid #e0e0e0",
      borderRadius: "50%",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "0.8rem"
    }),
    favoriteBall: {
      border: "2px solid #ffd700",
      boxShadow: "0 0 10px rgba(255,215,0,0.5)"
    },
    cardsContainer: {
      display: "grid",
      gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(350px, 1fr))" : "1fr",
      gap: "1.5rem"
    },
    cardContainer: {
      perspective: "1000px",
      height: "auto",
      cursor: "pointer",
      position: "relative"
    },
    cardInner: (isFlipped) => ({
      position: "relative",
      width: "100%",
      height: "100%",
      transition: "transform 0.6s",
      transformStyle: "preserve-3d",
      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
    }),
    cardFront: {
      position: "relative",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden"
    },
    cardBack: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      padding: "1rem",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      border: "2px solid #ffd700",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
    },
    bingoCard: (isWinner, isPinned, hasFavorites) => ({
      background: "white",
      border: isWinner ? "4px solid #ff4757" : isPinned ? "4px solid #ffd700" : "2px solid #333",
      borderRadius: "12px",
      padding: "1.5rem 1rem",
      transition: "all 0.3s ease",
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    }),
    cardLabel: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "0.75rem",
      padding: "0.5rem",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      borderRadius: "8px",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    labelEmoji: {
      fontSize: "1.2rem"
    },
    labelName: {
      fontWeight: "bold",
      flex: 1
    },
    labelEditIcon: {
      opacity: 0.5,
      fontSize: "0.8rem"
    },
    bingoHeader: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "0.5rem",
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#333",
      borderBottom: "2px solid #333",
      paddingBottom: "0.5rem"
    },
    bingoLetter: {
      width: "40px",
      textAlign: "center"
    },
    bingoGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
      marginBottom: "0.5rem"
    },
    bingoRow: {
      display: "flex",
      justifyContent: "space-around"
    },
    bingoCell: (isHighlighted, isFree, isFavorite) => ({
      width: "45px",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: isFavorite ? "2px solid #ffd700" : "1px solid #333",
      borderRadius: "4px",
      background: isHighlighted ? "#ffeb3b" : isFree ? "#f0f0f0" : "white",
      fontWeight: "bold",
      fontSize: isFree ? "1.2rem" : "1rem",
      cursor: "default",
      position: "relative",
      color: "#333"
    }),
    favoriteStar: {
      position: "absolute",
      top: "-5px",
      right: "-5px",
      fontSize: "0.6rem",
      color: "#ffd700"
    },
    editInput: {
      width: "40px",
      height: "40px",
      textAlign: "center",
      border: "2px solid #667eea",
      borderRadius: "4px",
      fontSize: "1rem",
      outline: "none"
    },
    cardActions: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      gap: "0.5rem",
      zIndex: 20,
      background: "rgba(255, 255, 255, 0.95)",
      padding: "0.75rem 1rem",
      borderRadius: "40px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      border: "2px solid #667eea",
      opacity: 0,
      transition: "opacity 0.3s ease",
      pointerEvents: "none"
    },
    actionButton: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "none",
      background: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.1rem",
      transition: "all 0.2s ease",
      pointerEvents: "auto"
    },
    pinButton: (isPinned) => ({
      background: isPinned ? "#ffd700" : "white",
      color: isPinned ? "white" : "#333",
      border: isPinned ? "2px solid #ffd700" : "2px solid #e0e0e0"
    }),
    editButton: {
      background: "#667eea",
      color: "white",
      border: "2px solid #667eea"
    },
    deleteButton: {
      background: "#ff4757",
      color: "white",
      border: "2px solid #ff4757"
    },
    saveButton: {
      background: "#4CAF50",
      color: "white",
      border: "2px solid #4CAF50"
    },
    cancelButton: {
      background: "#999",
      color: "white",
      border: "2px solid #999"
    },
    labelButton: {
      background: "#ffd700",
      color: "#333",
      border: "2px solid #ffd700"
    },
    flipHint: {
      position: "absolute",
      bottom: "5px",
      right: "5px",
      fontSize: "0.7rem",
      color: "#999",
      background: "rgba(255,255,255,0.8)",
      padding: "2px 5px",
      borderRadius: "10px",
      zIndex: 10
    },
    patternsList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      marginTop: "0.5rem",
      overflowY: "auto",
      maxHeight: "250px",
      padding: "0.5rem"
    },
    patternItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem",
      background: "white",
      borderRadius: "8px",
      fontSize: "0.9rem",
      borderLeft: "4px solid #ffd700",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      transition: "transform 0.2s ease",
      cursor: "pointer"
    },
    backHeader: {
      textAlign: "center",
      marginBottom: "1rem",
      fontWeight: "bold",
      color: "white",
      fontSize: "1.1rem",
      borderBottom: "2px solid #ffd700",
      paddingBottom: "0.5rem"
    },
    noPatterns: {
      textAlign: "center",
      color: "rgba(255,255,255,0.7)",
      fontStyle: "italic",
      padding: "2rem",
      background: "rgba(0,0,0,0.2)",
      borderRadius: "8px"
    },
    cardNumber: {
      position: "absolute",
      top: "5px",
      left: "5px",
      fontSize: "0.8rem",
      color: "white",
      background: "rgba(0,0,0,0.3)",
      padding: "2px 8px",
      borderRadius: "10px",
      zIndex: 20
    },
    patternCount: {
      background: "#ffd700",
      color: "#333",
      borderRadius: "12px",
      padding: "0.2rem 0.5rem",
      fontSize: "0.8rem",
      fontWeight: "bold",
      marginLeft: "auto"
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    },
    modalContent: {
      background: "white",
      borderRadius: "16px",
      padding: "2rem",
      maxWidth: "800px",
      width: "90%",
      maxHeight: "80vh",
      overflowY: "auto"
    },
    profileModal: {
      background: "white",
      borderRadius: "24px",
      padding: "2rem",
      maxWidth: "500px",
      width: "90%",
      position: "relative",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
    },
    profileHeader: {
      textAlign: "center",
      marginBottom: "2rem"
    },
    profileAvatar: {
      fontSize: "4rem",
      marginBottom: "1rem"
    },
    profileName: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      marginBottom: "0.5rem"
    },
    profileLevel: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      display: "inline-block",
      padding: "0.3rem 1rem",
      borderRadius: "20px",
      fontSize: "0.9rem",
      marginBottom: "1rem"
    },
    profileStats: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1rem",
      marginBottom: "2rem"
    },
    profileStat: {
      background: "#f5f5f5",
      padding: "1rem",
      borderRadius: "12px",
      textAlign: "center"
    },
    profileStatValue: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#667eea"
    },
    profileStatLabel: {
      fontSize: "0.9rem",
      color: "#666"
    },
    profileFooter: {
      borderTop: "1px solid #e0e0e0",
      paddingTop: "1rem",
      textAlign: "center",
      color: "#999"
    },
    labelModal: {
      background: "white",
      borderRadius: "24px",
      padding: "2rem",
      maxWidth: "400px",
      width: "90%"
    },
    emojiPicker: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: "0.5rem",
      marginBottom: "1rem",
      padding: "1rem",
      background: "#f5f5f5",
      borderRadius: "12px"
    },
    emojiOption: {
      fontSize: "1.5rem",
      padding: "0.5rem",
      textAlign: "center",
      cursor: "pointer",
      borderRadius: "8px",
      transition: "all 0.2s ease"
    },
    savedCardsModal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    },
    savedCardsContent: {
      background: "white",
      borderRadius: "16px",
      padding: "2rem",
      maxWidth: "800px",
      width: "90%",
      maxHeight: "80vh",
      overflowY: "auto"
    },
    savedCardItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer",
      transition: "background 0.2s ease"
    },
    savedCardInfo: {
      flex: 1
    },
    savedCardDate: {
      fontSize: "0.8rem",
      color: "#999"
    },
    savedCardPatterns: {
      display: "flex",
      gap: "0.3rem",
      flexWrap: "wrap",
      marginTop: "0.3rem"
    },
    savedCardPatternTag: {
      background: "#667eea",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "12px",
      fontSize: "0.7rem"
    },
    closeButton: {
      padding: "0.5rem 1rem",
      background: "#ff4757",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginTop: "1rem"
    },
    exportButton: {
      padding: "0.5rem 1rem",
      background: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginLeft: "0.5rem"
    },
    resultItem: {
      padding: "1rem",
      borderBottom: "1px solid #e0e0e0",
      cursor: "pointer"
    },
    resultHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem"
    },
    winnerBadge: {
      background: "#ff4757",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "12px",
      fontSize: "0.8rem"
    },
    noteInput: {
      width: "100%",
      padding: "0.5rem",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      marginTop: "0.5rem",
      marginBottom: "0.5rem"
    },
    statsContainer: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1.5rem",
      borderRadius: "16px",
      marginBottom: "1rem",
      color: "white"
    },
    statsGridMain: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      marginTop: "1rem"
    },
    statBox: {
      background: "rgba(255,255,255,0.2)",
      padding: "1rem",
      borderRadius: "12px",
      textAlign: "center"
    },
    historyItem: {
      padding: "1rem",
      borderBottom: "1px solid #e0e0e0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer"
    },
    historyPattern: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }
  };

  // Add CSS animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes winnerGlow {
        0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
        50% { box-shadow: 0 0 20px 0 rgba(255, 71, 87, 0.4); }
        100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
      }
      
      .card-container:hover .card-actions {
        opacity: 1 !important;
      }
      
      .action-button:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
      }
      
      .new-round-button:hover {
        background: #f57c00 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      
      .record-result-button:hover {
        background: #7B1FA2 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      
      .number-button:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      
      .column-button:hover {
        background: #667eea;
        color: white;
      }
      
      .list-item:hover {
        background: #f5f5f5;
      }
      
      .card-label:hover {
        background: linear-gradient(135deg, #e0e7ff 0%, #d1d5ff 100%) !important;
      }
      
      .emoji-option:hover {
        background: #667eea;
        color: white;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // ==================== RENDER ====================
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎯 Bingo Pattern Analyzer</h1>
          <div style={styles.headerButtons}>
            <button 
              onClick={() => setShowProfileModal(true)} 
              style={styles.profileButton}
            >
              <span>{profileData.avatar}</span>
              <span>{profileData.name}</span>
            </button>
            <button 
              onClick={() => setShowHistory(true)} 
              style={styles.historyButton}
            >
              📜 History ({gameHistory.length})
            </button>
            <button 
              onClick={() => setShowResults(true)} 
              style={styles.resultsButton}
            >
              🏆 Results ({gameResults.length})
            </button>
            <button 
              onClick={() => setShowSavedCards(true)} 
              style={styles.savedButton}
            >
              💾 Saved Cards ({savedCards.length})
            </button>
            <button onClick={goBack} style={styles.backButton}>
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Pattern Selector */}
        <div style={styles.patternSelector}>
          {PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setCurrentPattern(pattern.id)}
              style={styles.patternButton(currentPattern === pattern.id)}
            >
              <span>{pattern.icon}</span>
              <span>{pattern.label}</span>
              {winners[pattern.id]?.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#ff4757",
                  color: "white",
                  borderRadius: "20px",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  {winners[pattern.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={styles.controlsGrid}>
          {/* Generation Controls */}
          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>📋 Card Generation</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Number of Cards</label>
              <input
                type="number"
                value={numCardsInput}
                onChange={(e) => setNumCardsInput(Number(e.target.value))}
                min="1"
                max={CONSTANTS.MAX_CARDS}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Favored Balls Range</label>
              <input
                type="number"
                value={ballsCalledInput}
                onChange={(e) => setBallsCalledInput(Number(e.target.value))}
                min="1"
                max="75"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Win %</label>
              <input
                type="number"
                value={targetWinPercentage}
                onChange={(e) => setTargetWinPercentage(Number(e.target.value))}
                min="0"
                max="100"
                style={styles.input}
              />
            </div>
            
            {/* Favorite Numbers Section */}
            <div style={styles.favoriteNumbersContainer}>
              <div style={styles.favoriteHeader} onClick={() => setShowNumberSelector(!showNumberSelector)}>
                <h4 style={styles.favoriteTitle}>⭐ Favorite Numbers (1-75)</h4>
                <button style={styles.toggleButton}>
                  {showNumberSelector ? "▼" : "▶"} Select
                </button>
              </div>
              
              {/* Column quick select */}
              <div style={styles.columnSelector}>
                <button onClick={() => selectAllInColumn('B')} style={styles.columnButton}>B (1-15)</button>
                <button onClick={() => selectAllInColumn('I')} style={styles.columnButton}>I (16-30)</button>
                <button onClick={() => selectAllInColumn('N')} style={styles.columnButton}>N (31-45)</button>
                <button onClick={() => selectAllInColumn('G')} style={styles.columnButton}>G (46-60)</button>
                <button onClick={() => selectAllInColumn('O')} style={styles.columnButton}>O (61-75)</button>
              </div>
              
              {/* Search input */}
              <input
                type="text"
                placeholder="🔍 Search numbers (e.g., 7, even, odd, prime)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              
              {/* Number selector grid */}
              {showNumberSelector && (
                <div style={styles.numberSelectorGrid}>
                  {filteredNumbers.map((num) => {
                    const isSelected = favoriteNumbersList.includes(num);
                    return (
                      <div
                        key={num}
                        onClick={() => toggleFavoriteNumber(num)}
                        style={styles.numberButton(isSelected)}
                        className="number-button"
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Favorite numbers stats */}
              {favoriteNumbersList.length > 0 && (
                <div style={styles.favoriteStats}>
                  <div><strong>Selected favorites:</strong> {favoriteNumbersList.join(", ")}</div>
                  <div><strong>Count:</strong> {favoriteNumbersList.length} numbers</div>
                  
                  <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                      <div>B: {favoriteStats.byColumn.B}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>I: {favoriteStats.byColumn.I}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>N: {favoriteStats.byColumn.N}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>G: {favoriteStats.byColumn.G}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>O: {favoriteStats.byColumn.O}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>Even: {favoriteStats.even}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>Odd: {favoriteStats.odd}</div>
                    </div>
                    <div style={styles.statItem}>
                      <div>Prime: {favoriteStats.prime}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: "0.5rem" }}>
                    <label style={{ marginRight: "0.5rem" }}>Bias: {favoriteBias}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={favoriteBias}
                      onChange={(e) => setFavoriteBias(parseInt(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  
                  <button 
                    onClick={clearFavorites}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.2rem 0.5rem",
                      background: "#ff4757",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}
              
              {favoriteNumbersList.length === 0 && (
                <p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center" }}>
                  Click on numbers above to select favorites
                </p>
              )}

              {/* Favorite Lists Section */}
              <div style={styles.favoriteListsSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h5 style={{ margin: 0 }}>📋 Favorite Lists</h5>
                  <div>
                    <button 
                      onClick={() => setShowFavoriteLists(!showFavoriteLists)}
                      style={styles.smallButton}
                    >
                      {showFavoriteLists ? "▼" : "▶"} Manage
                    </button>
                  </div>
                </div>

                {showFavoriteLists && (
                  <>
                    {/* Save current list */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      <input
                        type="text"
                        placeholder="List name"
                        value={currentListName}
                        onChange={(e) => setCurrentListName(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                      />
                      <button 
                        onClick={saveCurrentList}
                        style={styles.smallButton}
                      >
                        Save
                      </button>
                    </div>

                    {/* Predefined lists */}
                    <h6 style={{ margin: "0.5rem 0", color: "#666" }}>Predefined Lists</h6>
                    {getPredefinedLists().map(list => (
                      <div key={list.id} className="list-item" style={styles.listItem}>
                        <div onClick={() => loadPredefinedList(list)}>
                          <div style={styles.listName}>{list.name}</div>
                          <div style={styles.listDetails}>
                            {list.numbers.length} numbers • {list.description}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Saved lists */}
                    {favoriteLists.length > 0 && (
                      <>
                        <h6 style={{ margin: "0.5rem 0", color: "#666" }}>My Saved Lists</h6>
                        {favoriteLists.map(list => (
                          <div key={list.id} className="list-item" style={styles.listItem}>
                            <div onClick={() => loadFavoriteList(list)} style={{ flex: 1 }}>
                              {editingListName === list.id ? (
                                <input
                                  type="text"
                                  defaultValue={list.name}
                                  onBlur={(e) => updateListName(list.id, e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && updateListName(list.id, e.target.value)}
                                  style={styles.input}
                                  autoFocus
                                />
                              ) : (
                                <div style={styles.listName}>{list.name}</div>
                              )}
                              <div style={styles.listDetails}>
                                {list.numbers.length} numbers • {list.date}
                              </div>
                            </div>
                            <div style={styles.listActions}>
                              <button 
                                onClick={() => setEditingListName(list.id)}
                                style={{...styles.smallButton, background: "#667eea"}}
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => deleteFavoriteList(list.id)}
                                style={{...styles.smallButton, background: "#ff4757"}}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Import/Export */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <button 
                        onClick={exportFavoriteLists}
                        style={{...styles.smallButton, background: "#4CAF50"}}
                      >
                        📤 Export
                      </button>
                      <label style={{...styles.smallButton, background: "#2196F3", cursor: "pointer" }}>
                        📥 Import
                        <input
                          type="file"
                          accept=".json"
                          onChange={importFavoriteLists}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                ...styles.generateButton,
                opacity: isGenerating ? 0.6 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer"
              }}
            >
              {isGenerating ? "Generating..." : "🎲 Generate Cards with Favorites"}
            </button>
          </div>

          {/* Ball Controls */}
          <div style={styles.controlCard}>
            <h3 style={{ margin: "0 0 1rem 0" }}>🎱 Ball Draw</h3>
            <div style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "1rem"
            }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Drawn</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{highlightNumbers.length}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Remaining</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{75 - highlightNumbers.length}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", color: "#666", fontSize: "0.8rem" }}>Max</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{CONSTANTS.MAX_BALLS}</span>
              </div>
            </div>

            <div style={{
              height: "8px",
              background: "#e0e0e0",
              borderRadius: "4px",
              marginBottom: "1rem",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: `${(highlightNumbers.length / CONSTANTS.MAX_BALLS) * 100}%`,
                background: "linear-gradient(90deg, #667eea, #764ba2)",
                transition: "width 0.3s ease"
              }} />
            </div>
            <button onClick={selectRandomBall} style={styles.randomBallButton}>
              🎲 Draw Random Ball
            </button>
            <button 
              onClick={handleNewRound} 
              style={styles.newRoundButton}
              className="new-round-button"
            >
              🆕 New Round (Clear All Numbers)
            </button>
            <button 
              onClick={recordBingoResult} 
              style={styles.recordResultButton}
              className="record-result-button"
              disabled={!cards.length || winners[currentPattern]?.length === 0}
            >
              🏆 Record BINGO Result
            </button>
            <button onClick={handleReset} style={styles.resetButton}>
              🔄 Reset Highlights
            </button>
          </div>
        </div>

        {/* Balls Grid */}
        {cards.length > 0 && (
          <div style={styles.ballsSection}>
            <h3 style={{ margin: "0 0 1rem 0" }}>
              🎯 Called Numbers 
              {favoriteNumbersList.length > 0 && (
                <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#ffd700" }}>
                  ⭐ Favorites: {favoriteNumbersList.join(", ")}
                </span>
              )}
            </h3>
            
            {/* Manual Number Input */}
            <form onSubmit={handleManualNumberSubmit} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", maxWidth: "400px", margin: "0 auto" }}>
                <input
                  type="number"
                  value={manualNumberInput}
                  onChange={(e) => setManualNumberInput(e.target.value)}
                  placeholder="Enter number (1-75) and press Enter"
                  min="1"
                  max="75"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "2px solid #667eea",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "bold"
                  }}
                >
                  Highlight
                </button>
              </div>
              <small style={{ color: "#666", display: "block", marginTop: "0.25rem", textAlign: "center" }}>
                Type a number and press Enter to toggle highlight
              </small>
            </form>

            <div style={styles.ballsGrid}>
              {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                const active = highlightNumbers.includes(num);
                const isFavorite = favoriteNumbersList.includes(num);
                return (
                  <div
                    key={num}
                    onClick={() => toggleNumber(num)}
                    style={{
                      ...styles.ball(active),
                      ...(isFavorite && !active ? styles.favoriteBall : {}),
                      position: "relative"
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{num}</span>
                    {isFavorite && !active && (
                      <span style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        fontSize: "0.6rem"
                      }}>⭐</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Winner */}
        {topWinner && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "2px solid #ffd700"
          }}>
            <h3 style={{ margin: "0 0 1rem 0" }}>🏆 Top Performing Card</h3>
            <div style={{
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              borderRadius: "12px",
              padding: "1rem"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>{topWinner.label.emoji}</span>
                  <span style={{ fontWeight: "bold" }}>{topWinner.label.name}</span>
                  <span style={{ color: "#666" }}>{formatSerial(topWinner.idx)}</span>
                </div>
                <span>Progress: {Math.round(topWinner.progress)}%</span>
                <span>Win %: {Math.round(topWinner.winPercentage)}%</span>
                {topWinner.favoriteCount > 0 && (
                  <span style={{
                    background: "#ffd700",
                    color: "#333",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontWeight: "bold"
                  }}>
                    ⭐ {topWinner.favoriteCount} favorites
                  </span>
                )}
                {topWinner.isWinner && (
                  <span style={{
                    background: "#ff4757",
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontWeight: "bold"
                  }}>
                    WINNER!
                  </span>
                )}
              </div>
              <div style={{
                height: "8px",
                background: "#e0e0e0",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${topWinner.progress}%`,
                  background: "linear-gradient(90deg, #ffd700, #ffb347)",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        {cards.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <h3 style={{ margin: 0 }}>
                📇 Bingo Cards ({cards.length}) 
                {Object.values(pinnedCards).some(v => v) && " 📌 Pinned cards shown first"}
                {favoriteNumbersList.length > 0 && (
                  <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#4CAF50" }}>
                    ⭐ Cards with favorites highlighted
                  </span>
                )}
              </h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    background: viewMode === "grid" ? "#667eea" : "white",
                    color: viewMode === "grid" ? "white" : "black",
                    cursor: "pointer"
                  }}
                >
                  📱 Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    background: viewMode === "list" ? "#667eea" : "white",
                    color: viewMode === "list" ? "white" : "black",
                    cursor: "pointer"
                  }}
                >
                  📋 List
                </button>
              </div>
            </div>

            <div style={styles.cardsContainer}>
              {rankedCards.map(({ card, idx, isWinner, progress, winPercentage, winningPatterns, isPinned, favoriteCount, label }, rank) => (
                <div
                  key={idx}
                  className="card-container"
                  style={styles.cardContainer}
                  onClick={() => toggleCardFlip(idx)}
                >
                  {/* Centered Card Actions */}
                  <div className="card-actions" style={styles.cardActions}>
                    {editingCard !== idx ? (
                      <>
                        <button 
                          onClick={(e) => togglePin(idx, e)}
                          style={{...styles.actionButton, ...styles.pinButton(isPinned)}}
                          className="action-button"
                          title={isPinned ? "Unpin card" : "Pin card"}
                        >
                          📌
                        </button>
                        <button 
                          onClick={(e) => startEdit(card, idx, e)}
                          style={{...styles.actionButton, ...styles.editButton}}
                          className="action-button"
                          title="Edit card"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={(e) => startEditLabel(idx, e)}
                          style={{...styles.actionButton, ...styles.labelButton}}
                          className="action-button"
                          title="Edit label"
                        >
                          🏷️
                        </button>
                        <button 
                          onClick={(e) => saveCard(card, idx, e)}
                          style={{...styles.actionButton, ...styles.saveButton}}
                          className="action-button"
                          title="Save to collection"
                        >
                          💾
                        </button>
                        <button 
                          onClick={(e) => deleteCard(idx, e)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          className="action-button"
                          title="Delete card"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => saveEdit(idx, e)}
                          style={{...styles.actionButton, ...styles.saveButton}}
                          className="action-button"
                          title="Save changes"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={(e) => cancelEdit(e)}
                          style={{...styles.actionButton, ...styles.cancelButton}}
                          className="action-button"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>

                  <div style={styles.cardInner(flippedCards[idx])}>
                    {/* Front of card */}
                    <div style={styles.cardFront}>
                      <div style={styles.bingoCard(isWinner, isPinned, favoriteCount > 0)}>
                        {/* Card Label */}
                        <div 
                          style={styles.cardLabel}
                          className="card-label"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditLabel(idx, e);
                          }}
                        >
                          <span style={styles.labelEmoji}>{label.emoji}</span>
                          <span style={styles.labelName}>{label.name}</span>
                          <span style={styles.labelEditIcon}>✏️</span>
                        </div>

                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                          flexWrap: "wrap",
                          gap: "0.25rem"
                        }}>
                          <span style={{ fontWeight: "bold", color: "#666" }}>{formatSerial(idx)}</span>
                          <span>Rank #{rank + 1}</span>
                          {favoriteCount > 0 && (
                            <span style={{
                              background: "#ffd700",
                              color: "#333",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "12px",
                              fontSize: "0.8rem"
                            }}>
                              ⭐ {favoriteCount}
                            </span>
                          )}
                          {isWinner && (
                            <span style={{
                              background: "#ff4757",
                              color: "white",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "12px",
                              fontSize: "0.8rem"
                            }}>
                              WINNER
                            </span>
                          )}
                        </div>

                        <div style={{
                          height: "4px",
                          background: "#e0e0e0",
                          borderRadius: "2px",
                          marginBottom: "0.5rem",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
                            transition: "width 0.3s ease"
                          }} />
                        </div>

                        <div style={{
                          textAlign: "center",
                          marginBottom: "0.5rem",
                          fontSize: "0.9rem",
                          color: "#666"
                        }}>
                          Win Chance: {Math.round(winPercentage)}%
                        </div>

                        {/* BINGO Header */}
                        <div style={styles.bingoHeader}>
                          {CONSTANTS.COLUMNS.map(letter => (
                            <span key={letter} style={styles.bingoLetter}>{letter}</span>
                          ))}
                        </div>

                        {/* BINGO Grid */}
                        <div style={styles.bingoGrid}>
                          {[0, 1, 2, 3, 4].map((row) => (
                            <div key={row} style={styles.bingoRow}>
                              {[0, 1, 2, 3, 4].map((col) => {
                                const cell = card[col][row];
                                const isHighlighted = highlightNumbers.includes(cell);
                                const isFree = cell === "FREE";
                                const isFavorite = !isFree && favoriteNumbersList.includes(cell);
                                
                                if (editingCard === idx) {
                                  return (
                                    <input
                                      key={col}
                                      type="text"
                                      value={cell}
                                      onChange={(e) => updateCell(col, row, e.target.value, e)}
                                      onClick={(e) => e.stopPropagation()}
                                      style={styles.editInput}
                                      disabled={cell === "FREE"}
                                    />
                                  );
                                }
                                
                                return (
                                  <div
                                    key={col}
                                    style={styles.bingoCell(isHighlighted, isFree, isFavorite)}
                                  >
                                    {isFree ? "⭐" : cell}
                                    {isFavorite && !isHighlighted && (
                                      <span style={styles.favoriteStar}>⭐</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "0.5rem",
                          fontSize: "0.9rem",
                          color: "#666"
                        }}>
                          <span>{getCardScore(card)} left</span>
                          <span>Target: {targetWinPercentage}%</span>
                        </div>
                        
                        <div style={styles.flipHint}>
                          👆 Click to see winning patterns
                        </div>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div style={styles.cardBack}>
                      <div style={styles.cardNumber}>
                        {label.emoji} {label.name}
                      </div>
                      <div style={styles.backHeader}>
                        🏆 Winning Patterns
                      </div>
                      
                      {winningPatterns.length > 0 ? (
                        <div style={styles.patternsList}>
                          {winningPatterns.map((pattern, index) => (
                            <div 
                              key={index} 
                              style={styles.patternItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPattern(pattern.id);
                                toggleCardFlip(idx);
                              }}
                            >
                              <span>{pattern.icon}</span>
                              <span>{pattern.name}</span>
                              <span style={styles.patternCount}>WINNER</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={styles.noPatterns}>
                          No winning patterns yet<br />
                          <span style={{ fontSize: "0.8rem" }}>Keep drawing numbers!</span>
                        </div>
                      )}
                      
                      <div style={{
                        textAlign: "center",
                        marginTop: "auto",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.7)",
                        paddingTop: "0.5rem"
                      }}>
                        👆 Click pattern to view
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
          <div style={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>{profileData.avatar}</div>
              <div style={styles.profileName}>{profileData.name}</div>
              <div style={styles.profileLevel}>Level {profileData.level}</div>
            </div>

            <div style={styles.profileStats}>
              <div style={styles.profileStat}>
                <div style={styles.profileStatValue}>{profileData.experience}</div>
                <div style={styles.profileStatLabel}>Experience</div>
              </div>
              <div style={styles.profileStat}>
                <div style={styles.profileStatValue}>{profileData.gamesPlayed}</div>
                <div style={styles.profileStatLabel}>Games Played</div>
              </div>
              <div style={styles.profileStat}>
                <div style={styles.profileStatValue}>{profileData.winRate}%</div>
                <div style={styles.profileStatLabel}>Win Rate</div>
              </div>
              <div style={styles.profileStat}>
                <div style={styles.profileStatValue}>{profileData.favoritePattern}</div>
                <div style={styles.profileStatLabel}>Favorite Pattern</div>
              </div>
            </div>

            <div style={styles.profileFooter}>
              Member since {profileData.joinDate}
            </div>

            <button 
              onClick={() => setShowProfileModal(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Label Edit Modal */}
      {showLabelModal && labelCardIndex !== null && (
        <div style={styles.modal} onClick={() => setShowLabelModal(false)}>
          <div style={styles.labelModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Edit Card Label</h3>
            
            <div style={styles.emojiPicker}>
              {AVAILABLE_EMOJIS.map(emoji => (
                <div
                  key={emoji}
                  style={{
                    ...styles.emojiOption,
                    background: cardLabels[labelCardIndex]?.emoji === emoji ? "#667eea" : "transparent",
                    color: cardLabels[labelCardIndex]?.emoji === emoji ? "white" : "black"
                  }}
                  className="emoji-option"
                  onClick={() => {
                    setCardLabels(prev => ({
                      ...prev,
                      [labelCardIndex]: {
                        ...prev[labelCardIndex],
                        emoji: emoji
                      }
                    }));
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Label Name</label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Enter label name"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Notes (optional)</label>
              <textarea
                value={cardLabels[labelCardIndex]?.notes || ""}
                onChange={(e) => {
                  setCardLabels(prev => ({
                    ...prev,
                    [labelCardIndex]: {
                      ...prev[labelCardIndex],
                      notes: e.target.value
                    }
                  }));
                }}
                placeholder="Add notes about this card..."
                style={styles.textarea}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  updateCardLabel(labelCardIndex, {
                    name: labelInput,
                    emoji: cardLabels[labelCardIndex]?.emoji || "🎴",
                    notes: cardLabels[labelCardIndex]?.notes || ""
                  });
                }}
                style={styles.generateButton}
              >
                Save
              </button>
              <button
                onClick={() => setShowLabelModal(false)}
                style={{...styles.resetButton, width: "auto", padding: "0.75rem 1.5rem"}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <div style={styles.modal} onClick={() => setShowResults(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>🏆 Bingo Results</h2>
              <div>
                {gameResults.length > 0 && (
                  <button onClick={exportResults} style={styles.exportButton}>
                    📥 Export
                  </button>
                )}
              </div>
            </div>

            {gameResults.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                No results yet. Click "Record BINGO Result" when you have winners!
              </p>
            ) : (
              <>
                {/* Statistics */}
                {stats && (
                  <div style={styles.statsContainer}>
                    <h3 style={{ margin: 0 }}>📊 Statistics</h3>
                    <div style={styles.statsGridMain}>
                      <div style={styles.statBox}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalGames}</div>
                        <div>Total Games</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageBallsToWin}</div>
                        <div>Avg Balls to Win</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.averageWinnersPerGame}</div>
                        <div>Avg Winners/Game</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.mostWinningPattern}</div>
                        <div>Most Winning Pattern</div>
                      </div>
                    </div>

                    {/* Pattern Stats */}
                    <div style={{ marginTop: "1rem" }}>
                      <h4>Pattern Statistics</h4>
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        {Object.entries(stats.patternStats).map(([pattern, data]) => (
                          <div key={pattern} style={{
                            background: "rgba(255,255,255,0.2)",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between"
                          }}>
                            <span>{data.icon} {data.name}</span>
                            <span>{data.count} games, {data.totalWinners} winners</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Results List */}
                <h3>Game Results</h3>
                {gameResults.map(result => (
                  <div key={result.id} style={styles.resultItem}>
                    <div style={styles.resultHeader}>
                      <div>
                        <strong>{result.patternIcon} {result.patternName}</strong>
                        <span style={{ color: "#999", marginLeft: "0.5rem" }}>{result.timestamp}</span>
                      </div>
                      <span style={styles.winnerBadge}>{result.winnerCount} winner{result.winnerCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div>🎱 {result.ballsDrawnCount} balls drawn</div>
                    <div>📇 {result.totalCards} cards in play</div>
                    {result.winners.map(winner => (
                      <div key={winner.cardIndex} style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>{winner.label.emoji}</span>
                          <span style={{ fontWeight: "bold" }}>{winner.label.name}</span>
                          <span style={{ color: "#666" }}>{winner.serial}</span>
                        </div>
                      </div>
                    ))}
                    {result.notes && (
                      <div style={{ color: "#666", fontStyle: "italic", marginTop: "0.5rem" }}>
                        📝 {result.notes}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder="Add notes..."
                        value={result.notes || ''}
                        onChange={(e) => saveGameResult(result.id, e.target.value)}
                        style={styles.noteInput}
                      />
                      <button 
                        onClick={() => deleteGameResult(result.id)}
                        style={{...styles.deleteButton, padding: "0.5rem"}}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <button 
              onClick={() => setShowResults(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={styles.modal} onClick={() => setShowHistory(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>📜 Game History</h2>

            {gameHistory.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                No game history yet.
              </p>
            ) : (
              gameHistory.map(history => (
                <div 
                  key={history.id} 
                  style={styles.historyItem}
                  onClick={() => {
                    const result = gameResults.find(r => r.id === history.id);
                    if (result) {
                      setCurrentGameResult(result);
                      setShowResults(true);
                      setShowHistory(false);
                    }
                  }}
                >
                  <div style={styles.historyPattern}>
                    <span>{history.patternIcon}</span>
                    <span>{history.pattern}</span>
                  </div>
                  <div>
                    <span style={{ marginRight: "1rem" }}>{history.winnerCount} winner{history.winnerCount !== 1 ? 's' : ''}</span>
                    <span style={{ marginRight: "1rem" }}>🎱 {history.ballsDrawn}</span>
                    <span style={{ color: "#999", fontSize: "0.9rem" }}>{history.timestamp}</span>
                  </div>
                </div>
              ))
            )}

            <button 
              onClick={() => setShowHistory(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Saved Cards Modal */}
      {showSavedCards && (
        <div style={styles.savedCardsModal} onClick={() => setShowSavedCards(false)}>
          <div style={styles.savedCardsContent} onClick={(e) => e.stopPropagation()}>
            <h2>💾 Saved Cards Collection</h2>
            {savedCards.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: "2rem" }}>
                No saved cards yet. Click the 💾 button on any card to save it.
              </p>
            ) : (
              savedCards.map(savedCard => (
                <div key={savedCard.id} style={styles.savedCardItem}>
                  <div style={styles.savedCardInfo} onClick={() => loadSavedCard(savedCard)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{savedCard.label?.emoji || "🎴"}</span>
                      <strong>{savedCard.label?.name || savedCard.serial}</strong>
                      <span style={{ color: "#666" }}>{savedCard.serial}</span>
                    </div>
                    <div style={styles.savedCardDate}>Saved: {savedCard.date}</div>
                    <div style={styles.savedCardPatterns}>
                      {savedCard.patterns.map(p => (
                        <span key={p.id} style={styles.savedCardPatternTag}>
                          {p.icon} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteSavedCard(savedCard.id, e)}
                    style={{...styles.actionButton, ...styles.deleteButton}}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
            <button 
              onClick={() => setShowSavedCards(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pattern;