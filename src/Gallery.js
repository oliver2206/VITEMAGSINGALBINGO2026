import { useState, useCallback } from "react";

const COLS = ["B", "I", "N", "G", "O"];
const RANGES = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
];

const styles = {
  root: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "#fafaf8",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "#1a1816",
  },
  header: {
    textAlign: "center",
    marginBottom: 36,
  },
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#1a1816",
    margin: 0,
  },
  subtitle: {
    color: "#9a9590",
    marginTop: 6,
    fontSize: "0.92rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 30,
  },
  btnPrimary: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontFamily: "Georgia, serif",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",
    letterSpacing: "0.3px",
  },
  btnSecondary: {
    background: "#fff",
    color: "#1a1816",
    border: "1.5px solid #e2ddd6",
    borderRadius: 8,
    padding: "9px 20px",
    fontFamily: "Georgia, serif",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
  countLabel: {
    fontSize: "0.85rem",
    color: "#9a9590",
    fontFamily: "Georgia, serif",
  },
  countInput: {
    width: 54,
    padding: "8px 10px",
    border: "1.5px solid #c8c0b5",
    borderRadius: 8,
    fontSize: "0.9rem",
    textAlign: "center",
    background: "#fff",
    color: "#1a1816",
    fontFamily: "Georgia, serif",
    outline: "none",
  },
  inputSection: {
    background: "#fff",
    border: "1px solid #e2ddd6",
    borderRadius: 16,
    padding: "24px 28px 20px",
    maxWidth: 500,
    margin: "0 auto 40px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "1rem",
    color: "#2d6a4f",
    marginBottom: 18,
    fontWeight: 700,
    letterSpacing: "0.3px",
  },
  bingoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 7,
  },
  colHeader: {
    textAlign: "center",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#2d6a4f",
    paddingBottom: 8,
  },
  cellInput: {
    width: "100%",
    aspectRatio: "1",
    border: "1.5px solid #c8c0b5",
    borderRadius: 9,
    background: "#fff",
    textAlign: "center",
    fontFamily: "Georgia, serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#1a1816",
    outline: "none",
    cursor: "text",
    display: "block",
    boxSizing: "border-box",
    padding: 0,
    transition: "border-color 0.15s, background 0.15s",
  },
  cellFree: {
    width: "100%",
    aspectRatio: "1",
    border: "1.5px solid #f4a261",
    borderRadius: 9,
    background: "#fef3e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f4a261",
    fontWeight: 700,
    fontSize: "0.78rem",
    letterSpacing: "0.5px",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
    marginTop: 14,
    fontSize: "0.78rem",
    color: "#9a9590",
    fontFamily: "Georgia, serif",
  },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  legendDotUser: {
    width: 13,
    height: 13,
    borderRadius: 4,
    background: "#e8f4ef",
    border: "2px solid #2d6a4f",
  },
  legendDotAuto: {
    width: 13,
    height: 13,
    borderRadius: 4,
    background: "#fff",
    border: "2px solid #c8c0b5",
  },
  legendDotFree: {
    width: 13,
    height: 13,
    borderRadius: 4,
    background: "#fef3e8",
    border: "2px solid #f4a261",
  },
  cardsArea: {
    maxWidth: 980,
    margin: "0 auto",
  },
  cardsTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 24,
    color: "#1a1816",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))",
    gap: 22,
  },
  cardWrapper: {
    background: "#fff",
    border: "1px solid #e2ddd6",
    borderRadius: 16,
    padding: "18px 18px 16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  },
  cardLabel: {
    fontSize: "0.85rem",
    color: "#9a9590",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 4,
  },
  cardColHeader: {
    textAlign: "center",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#2d6a4f",
    paddingBottom: 5,
  },
  cardCell: {
    aspectRatio: "1",
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.82rem",
    fontWeight: 600,
    border: "1.5px solid #e2ddd6",
    color: "#1a1816",
    background: "#fff",
  },
  cardCellUser: {
    border: "1.5px solid #2d6a4f",
    background: "#e8f4ef",
    color: "#2d6a4f",
  },
  cardCellFree: {
    border: "1.5px solid #f4a261",
    background: "#fef3e8",
    color: "#f4a261",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },
  printBtn: {
    display: "block",
    margin: "26px auto 0",
    background: "#fff",
    border: "1.5px solid #e2ddd6",
    color: "#1a1816",
    padding: "10px 28px",
    borderRadius: 8,
    fontFamily: "Georgia, serif",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateColumn(colIndex, fixedVals) {
  const [min, max] = RANGES[colIndex];
  const used = new Set(fixedVals.filter((v) => v !== null && v !== "FREE"));
  return fixedVals.map((v) => {
    if (v === "FREE") return "FREE";
    if (v !== null) return v;
    let num, attempts = 0;
    do { num = randInt(min, max); attempts++; } while (used.has(num) && attempts < 300);
    used.add(num);
    return num;
  });
}

function buildCardData(userVals) {
  // userVals[row][col], returns card[col][row]
  return COLS.map((_, ci) => generateColumn(ci, userVals.map((row) => row[ci])));
}

function BingoCard({ cardData, userVals, index }) {
  return (
    <div style={styles.cardWrapper}>
      <div style={styles.cardLabel}>Card #{index + 1}</div>
      <div style={styles.cardGrid}>
        {COLS.map((col) => (
          <div key={col} style={styles.cardColHeader}>{col}</div>
        ))}
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 5 }, (_, col) => {
            const val = cardData[col][row];
            const isUser = userVals[row][col] !== null;
            let cellStyle = { ...styles.cardCell };
            if (val === "FREE") cellStyle = { ...styles.cardCell, ...styles.cardCellFree };
            else if (isUser) cellStyle = { ...styles.cardCell, ...styles.cardCellUser };
            return (
              <div key={`${row}-${col}`} style={cellStyle}>
                {val === "FREE" ? "FREE" : val}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function BingoCardGenerator() {
  const initVals = () =>
    Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => (r === 2 && c === 2 ? "FREE" : null))
    );

  const [userVals, setUserVals] = useState(initVals);
  const [cardCount, setCardCount] = useState(3);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleInput = (row, col, value) => {
    const num = value === "" ? null : parseInt(value);
    setUserVals((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = isNaN(num) ? null : num;
      return next;
    });
  };

  const generate = useCallback(() => {
    const cards = Array.from({ length: Math.max(1, Math.min(20, cardCount)) }, () =>
      buildCardData(userVals)
    );
    setGeneratedCards(cards);
    setTimeout(() => document.getElementById("cards-area")?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [userVals, cardCount]);

  const reshuffle = () => {
    if (generatedCards.length > 0) generate();
  };

  const reset = () => {
    setUserVals(initVals());
    setGeneratedCards([]);
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Bingo Card Generator</h1>
        <p style={styles.subtitle}>Enter your fixed numbers — we'll fill the rest automatically.</p>
      </div>

      <div style={styles.controls}>
        <button
          style={{ ...styles.btnPrimary, ...(hoveredBtn === "gen" ? { background: "#235c42", transform: "translateY(-1px)" } : {}) }}
          onMouseEnter={() => setHoveredBtn("gen")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={generate}
        >
          Generate Cards
        </button>
        <button
          style={{ ...styles.btnSecondary, ...(hoveredBtn === "re" ? { background: "#e8f4ef", borderColor: "#2d6a4f" } : {}) }}
          onMouseEnter={() => setHoveredBtn("re")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={reshuffle}
        >
          Reshuffle
        </button>
        <button
          style={{ ...styles.btnSecondary, ...(hoveredBtn === "rst" ? { background: "#fef3e8", borderColor: "#f4a261" } : {}) }}
          onMouseEnter={() => setHoveredBtn("rst")}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={reset}
        >
          Reset
        </button>
        <span style={styles.countLabel}>Cards to generate:</span>
        <input
          style={styles.countInput}
          type="number"
          min={1}
          max={20}
          value={cardCount}
          onChange={(e) => setCardCount(parseInt(e.target.value) || 1)}
        />
      </div>

      <div style={styles.inputSection}>
        <div style={styles.sectionTitle}>Enter Your Numbers</div>
        <div style={styles.bingoGrid}>
          {COLS.map((col) => (
            <div key={col} style={styles.colHeader}>{col}</div>
          ))}
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => {
              if (row === 2 && col === 2) {
                return <div key="free" style={styles.cellFree}>FREE</div>;
              }
              const [min, max] = RANGES[col];
              return (
                <input
                  key={`${row}-${col}`}
                  style={styles.cellInput}
                  type="number"
                  min={min}
                  max={max}
                  placeholder={`${min}–${max}`}
                  value={userVals[row][col] === null ? "" : userVals[row][col]}
                  onChange={(e) => handleInput(row, col, e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = "#2d6a4f"; e.target.style.background = "#e8f4ef"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#c8c0b5"; e.target.style.background = "#fff"; }}
                />
              );
            })
          )}
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem}><div style={styles.legendDotUser} /> Your Numbers</div>
          <div style={styles.legendItem}><div style={styles.legendDotAuto} /> Auto-generated</div>
          <div style={styles.legendItem}><div style={styles.legendDotFree} /> FREE Space</div>
        </div>
      </div>

      {generatedCards.length > 0 && (
        <div id="cards-area" style={styles.cardsArea}>
          <div style={styles.cardsTitle}>Generated Cards</div>
          <div style={styles.cardsGrid}>
            {generatedCards.map((cardData, i) => (
              <BingoCard key={i} cardData={cardData} userVals={userVals} index={i} />
            ))}
          </div>
          <button
            style={{ ...styles.printBtn, ...(hoveredBtn === "print" ? { background: "#e8f4ef", borderColor: "#2d6a4f" } : {}) }}
            onMouseEnter={() => setHoveredBtn("print")}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => window.print()}
          >
            🖨️ Print Cards
          </button>
        </div>
      )}
    </div>
  );
}