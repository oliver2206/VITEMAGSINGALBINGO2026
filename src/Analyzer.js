import React, { useState, useCallback, useMemo } from "react";

const MAX_BALL_OPTIONS = [25, 30, 35, 40, 44, 48];
const COLS = ["B", "I", "N", "G", "O"];
const COL_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#BA7517", "#D85A30"];
const COL_LIGHT  = ["#E1F5EE", "#E6F1FB", "#EEEDFE", "#FAEEDA", "#FAECE7"];

function colOf(n) { return Math.floor((n - 1) / 15); }

export default function CalledNumbers() {
  const [maxBalls, setMaxBalls]     = useState(48);
  const [called, setCalled]         = useState([]);
  const [history, setHistory]       = useState([]);
  const [round, setRound]           = useState(1);
  const [numInput, setNumInput]     = useState("");

  // ── label state ───────────────────────────────────────────────────────────
  const [label, setLabel]           = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [editingLabel, setEditingLabel] = useState(false);

  const saveLabel = useCallback((e) => {
    e && e.preventDefault();
    setLabel(labelInput.trim());
    setEditingLabel(false);
  }, [labelInput]);

  const startEdit = useCallback(() => {
    setLabelInput(label);
    setEditingLabel(true);
  }, [label]);

  // ── frequency across all rounds + current ──────────────────────────────
  const freq = useMemo(() => {
    const f = {};
    for (let i = 1; i <= 75; i++) f[i] = 0;
    history.forEach(r => r.forEach(n => (f[n] = (f[n] || 0) + 1)));
    called.forEach(n => (f[n] = (f[n] || 0) + 1));
    return f;
  }, [called, history]);

  // ── actions ──────────────────────────────────────────────────────────────
  const toggle = useCallback((n) => {
    setCalled(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n);
      if (prev.length >= maxBalls) {
        alert(`Max ${maxBalls} balls reached. Start a new round.`);
        return prev;
      }
      return [...prev, n].sort((a, b) => a - b);
    });
  }, [maxBalls]);

  const highlight = useCallback((e) => {
    e && e.preventDefault();
    const v = parseInt(numInput);
    if (isNaN(v) || v < 1 || v > 75) { alert("Enter a number between 1 and 75"); return; }
    toggle(v);
    setNumInput("");
  }, [numInput, toggle]);

  const drawRandom = useCallback(() => {
    const avail = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !called.includes(n));
    if (!avail.length) { alert("All 75 balls drawn!"); return; }
    if (called.length >= maxBalls) { alert(`Max ${maxBalls} balls reached. Start a new round.`); return; }
    const pick = avail[Math.floor(Math.random() * avail.length)];
    setCalled(prev => [...prev, pick].sort((a, b) => a - b));
  }, [called, maxBalls]);

  const newRound = useCallback(() => {
    if (!called.length) { alert("No balls drawn in current round."); return; }
    setHistory(prev => [...prev, [...called]]);
    setCalled([]);
    setRound(r => r + 1);
  }, [called]);

  const reset = useCallback(() => setCalled([]), []);

  // ── derived stats ─────────────────────────────────────────────────────────
  const pct    = maxBalls > 0 ? Math.min(100, Math.round((called.length / maxBalls) * 100)) : 0;
  const hasAny = Object.values(freq).some(v => v > 0);
  const multi  = Object.entries(freq).filter(([, c]) => c > 1).map(([n, c]) => `${n}(${c}x)`).join(", ") || "—";
  const top5   = Object.entries(freq).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, c]) => `${n}(${c}x)`).join(", ") || "—";

  // ── styles ────────────────────────────────────────────────────────────────
  const s = {
    wrap: { padding: "1.25rem 1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 960, margin: "0 auto" },
    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.25rem" },
    title: { fontSize: 18, fontWeight: 500, color: "#111" },
    roundPill: { background: "#f3f4f6", border: "0.5px solid #d1d5db", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#6b7280" },

    // ── label box ────────────────────────────────────────────────────────────
    labelBox: {
      display: "flex", alignItems: "center", gap: 10,
      background: "#EEEDFE", border: "0.5px solid #AFA9EC",
      borderRadius: 12, padding: "12px 16px", marginBottom: "1.25rem",
      minHeight: 52,
    },
    labelIcon: { fontSize: 18, lineHeight: 1, flexShrink: 0 },
    labelText: { flex: 1, fontSize: 15, fontWeight: 500, color: "#3C3489", wordBreak: "break-word" },
    labelPlaceholder: { flex: 1, fontSize: 14, color: "#7F77DD", fontStyle: "italic" },
    labelEditBtn: {
      padding: "5px 14px", borderRadius: 8,
      border: "0.5px solid #7F77DD", background: "white",
      color: "#534AB7", fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0,
    },
    labelForm: { display: "flex", gap: 8, flex: 1 },
    labelInput: {
      flex: 1, padding: "6px 10px", borderRadius: 8,
      border: "0.5px solid #AFA9EC", fontSize: 14, outline: "none",
      color: "#26215C", background: "white",
    },
    labelSaveBtn: {
      padding: "6px 14px", borderRadius: 8,
      border: "0.5px solid #534AB7", background: "#534AB7",
      color: "#EEEDFE", fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0,
    },
    labelCancelBtn: {
      padding: "6px 10px", borderRadius: 8,
      border: "0.5px solid #d1d5db", background: "white",
      color: "#6b7280", fontSize: 13, cursor: "pointer", flexShrink: 0,
    },

    maxBar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "12px 16px", marginBottom: "1.25rem" },
    maxLabel: { fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" },
    maxOpts: { display: "flex", gap: 6, flexWrap: "wrap" },
    maxBtn: (active) => ({
      padding: "5px 16px", borderRadius: 20,
      border: active ? "0.5px solid #534AB7" : "0.5px solid #d1d5db",
      background: active ? "#534AB7" : "white",
      color: active ? "#EEEDFE" : "#374151",
      fontSize: 13, fontWeight: active ? 500 : 400, cursor: "pointer", transition: "all 0.15s"
    }),

    progressRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" },
    track: { flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
    fill: { height: "100%", background: "#534AB7", borderRadius: 3, transition: "width 0.2s" },
    progTxt: { fontSize: 13, color: "#6b7280", whiteSpace: "nowrap", minWidth: 70, textAlign: "right" },

    legend: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: "1.25rem" },
    legItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" },
    legDot: (bg, border) => ({ width: 14, height: 14, borderRadius: 3, background: bg, border: `0.5px solid ${border}` }),

    inputRow: { display: "flex", gap: 8, marginBottom: "1.25rem" },
    input: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "0.5px solid #d1d5db", fontSize: 14, outline: "none", color: "#111", background: "white" },
    highlightBtn: { padding: "8px 18px", borderRadius: 8, border: "0.5px solid #534AB7", background: "#534AB7", color: "#EEEDFE", fontSize: 14, fontWeight: 500, cursor: "pointer" },

    colHdrs: { display: "flex", gap: 2, marginBottom: 6 },
    colHdr: (i) => ({ flex: "0 0 calc(20% - 2px)", textAlign: "center", fontSize: 11, fontWeight: 500, padding: "4px 0", borderRadius: 4, background: COL_LIGHT[i], color: COL_COLORS[i], lineHeight: 1.4 }),

    grid: { display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4, marginBottom: "1.25rem" },
    ball: (active, prev) => ({
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      aspectRatio: "1", borderRadius: "50%", cursor: "pointer", userSelect: "none", position: "relative",
      transition: "all 0.12s",
      border: active ? "0.5px solid #3C3489" : prev ? "0.5px solid #AFA9EC" : "0.5px solid #e5e7eb",
      background: active ? "#534AB7" : prev ? "#EEEDFE" : "white",
    }),
    ballNum: (active, prev) => ({ fontSize: 11, fontWeight: 500, lineHeight: 1, color: active ? "#EEEDFE" : prev ? "#3C3489" : "#9ca3af" }),
    badge: (active, multi) => ({
      fontSize: 9, padding: "1px 4px", borderRadius: 8, marginTop: 1, fontWeight: 500, lineHeight: 1.2,
      background: multi ? "#E24B4A" : active ? "#3C3489" : "#AFA9EC",
      color: multi ? "#FCEBEB" : active ? "#EEEDFE" : "#26215C",
    }),

    actions: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "1.25rem" },
    actBtn: (c) => ({
      padding: "9px 8px", borderRadius: 8, border: `0.5px solid ${c}`, background: "white",
      color: c, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "center", transition: "all 0.15s"
    }),

    statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: "1.25rem" },
    statBox: { background: "#f9fafb", borderRadius: 8, padding: "10px 12px", textAlign: "center" },
    statVal: { fontSize: 20, fontWeight: 500, color: "#111" },
    statLbl: { fontSize: 11, color: "#6b7280", marginTop: 2 },

    summary: { background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#6b7280" },
    sumRow: { marginTop: 6 },
  };

  return (
    <div style={s.wrap}>
      {/* title + round pill */}
      <div style={s.topBar}>
        <span style={s.title}>Called numbers</span>
        <span style={s.roundPill}>Round {round}</span>
      </div>

      {/* ── label box ──────────────────────────────────────────────────────── */}
      <div style={s.labelBox}>
        <span style={s.labelIcon}>🏷️</span>
        {editingLabel ? (
          <form onSubmit={saveLabel} style={s.labelForm}>
            <input
              autoFocus
              type="text"
              maxLength={80}
              placeholder="e.g. Friday Night Game · Hall B · June 2025"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              style={s.labelInput}
            />
            <button type="submit" style={s.labelSaveBtn}>Save</button>
            <button type="button" style={s.labelCancelBtn} onClick={() => setEditingLabel(false)}>✕</button>
          </form>
        ) : (
          <>
            {label
              ? <span style={s.labelText}>{label}</span>
              : <span style={s.labelPlaceholder}>No label set — add a game name, event, or date</span>
            }
            <button style={s.labelEditBtn} onClick={startEdit}>
              {label ? "Edit" : "+ Add label"}
            </button>
          </>
        )}
      </div>

      {/* max balls selector */}
      <div style={s.maxBar}>
        <span style={s.maxLabel}>Max balls / round</span>
        <div style={s.maxOpts}>
          {MAX_BALL_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setMaxBalls(opt)} style={s.maxBtn(maxBalls === opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* progress bar */}
      <div style={s.progressRow}>
        <div style={s.track}><div style={{ ...s.fill, width: pct + "%" }} /></div>
        <span style={s.progTxt}>{called.length} / {maxBalls}</span>
      </div>

      {/* legend */}
      <div style={s.legend}>
        <div style={s.legItem}><div style={s.legDot("#534AB7", "#3C3489")} />Called this round</div>
        <div style={s.legItem}><div style={s.legDot("#EEEDFE", "#AFA9EC")} />Previous rounds</div>
        <div style={s.legItem}><div style={s.legDot("white", "#e5e7eb")} />Not called</div>
      </div>

      {/* manual input */}
      <form onSubmit={highlight} style={s.inputRow}>
        <input
          type="number" min="1" max="75"
          placeholder="Enter 1–75 and press Enter"
          value={numInput}
          onChange={e => setNumInput(e.target.value)}
          style={s.input}
        />
        <button type="submit" style={s.highlightBtn}>Highlight</button>
      </form>

      {/* column headers */}
      <div style={s.colHdrs}>
        {COLS.map((l, i) => (
          <div key={l} style={s.colHdr(i)}>
            {l}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>{i * 15 + 1}–{i * 15 + 15}</span>
          </div>
        ))}
      </div>

      {/* ball grid */}
      <div style={s.grid}>
        {Array.from({ length: 75 }, (_, i) => i + 1).map(n => {
          const active = called.includes(n);
          const inPrev = !active && freq[n] > 0;
          const total  = freq[n] || 0;
          return (
            <div key={n} onClick={() => toggle(n)} style={s.ball(active, inPrev)}>
              <span style={s.ballNum(active, inPrev)}>{n}</span>
              {total > 0 && (
                <span style={s.badge(active, total > 1)}>{total}x</span>
              )}
            </div>
          );
        })}
      </div>

      {/* action buttons */}
      <div style={s.actions}>
        <button style={s.actBtn("#0F6E56")} onClick={drawRandom}>Draw random</button>
        <button style={s.actBtn("#854F0B")} onClick={newRound}>New round</button>
        <button style={s.actBtn("#A32D2D")} onClick={reset}>Reset</button>
      </div>

      {/* stats row */}
      <div style={s.statsRow}>
        {[
          { val: called.length,     lbl: "Drawn" },
          { val: 75 - called.length, lbl: "Remaining" },
          { val: history.length,    lbl: "Rounds done" },
          { val: maxBalls,          lbl: "Max / round" },
        ].map(({ val, lbl }) => (
          <div key={lbl} style={s.statBox}>
            <div style={s.statVal}>{val}</div>
            <div style={s.statLbl}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* frequency summary */}
      {hasAny && (
        <div style={s.summary}>
          <strong style={{ color: "#111", fontWeight: 500 }}>Frequency summary</strong>
          <div style={s.sumRow}><strong style={{ color: "#111", fontWeight: 500 }}>Multiple hits:</strong> {multi}</div>
          <div style={s.sumRow}><strong style={{ color: "#111", fontWeight: 500 }}>Top 5 most frequent:</strong> {top5}</div>
        </div>
      )}
    </div>
  );
}