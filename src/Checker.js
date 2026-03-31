import { useState, useRef, useCallback, useEffect } from "react";

// ─── BINGO Rules ──────────────────────────────────────────────────────────────
const COLUMNS    = ["B","I","N","G","O"];
const COL_RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };
const COL_COLORS = {
  B:{ bg:"linear-gradient(135deg,#e040fb,#9c27b0)", solid:"#9c27b0", shadow:"#e040fb55" },
  I:{ bg:"linear-gradient(135deg,#2979ff,#00bcd4)", solid:"#2979ff", shadow:"#2979ff55" },
  N:{ bg:"linear-gradient(135deg,#00c853,#64dd17)", solid:"#00c853", shadow:"#00c85355" },
  G:{ bg:"linear-gradient(135deg,#ff6d00,#ffab00)", solid:"#ff6d00", shadow:"#ff6d0055" },
  O:{ bg:"linear-gradient(135deg,#f50057,#ff4081)", solid:"#f50057", shadow:"#f5005755" },
};
const PRINT_COLORS = { B:"#7b1fa2", I:"#1565c0", N:"#2e7d32", G:"#e65100", O:"#c62828" };
const MAX_IMAGES  = 5;
const CARD_COUNTS = [1,2,3,4,5,6,7,8,9,10];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pickUnique(min, max, count) {
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function buildRandomCard() {
  return COLUMNS.map((col, ci) => {
    const [min, max] = COL_RANGES[col];
    const nums = pickUnique(min, max, 5);
    if (ci === 2) nums[2] = "FREE";
    return nums;
  });
}

function validateAndFixGrid(raw) {
  return COLUMNS.map((col, ci) => {
    const [min, max] = COL_RANGES[col];
    const colVals = raw[col];
    if (!Array.isArray(colVals) || colVals.length !== 5) {
      const nums = pickUnique(min, max, 5);
      if (ci === 2) nums[2] = "FREE";
      return nums;
    }
    const seen = new Set();
    return colVals.map((v, ri) => {
      if (ci === 2 && ri === 2) return "FREE";
      if (typeof v === "string" && v.toUpperCase() === "FREE") return "FREE";
      const n = parseInt(v, 10);
      if (!isNaN(n) && n >= min && n <= max && !seen.has(n)) { seen.add(n); return n; }
      for (let a = min; a <= max; a++) { if (!seen.has(a)) { seen.add(a); return a; } }
      return min;
    });
  });
}

function checkBingo(marked) {
  const at = (c, r) => marked.has(`${c}-${r}`);
  for (let r = 0; r < 5; r++) if ([0,1,2,3,4].every(c => at(c,r))) return true;
  for (let c = 0; c < 5; c++) if ([0,1,2,3,4].every(r => at(c,r))) return true;
  if ([0,1,2,3,4].every(i => at(i,i))) return true;
  if ([0,1,2,3,4].every(i => at(i,4-i))) return true;
  return false;
}

// ─── Print helpers ────────────────────────────────────────────────────────────
function buildPrintCardHTML(grid, cardNumber, totalCards) {
  const colHeaders = COLUMNS.map(col => {
    const color = PRINT_COLORS[col];
    return `<th style="background:${color};color:#fff;font-size:28px;font-weight:900;
      width:80px;height:70px;text-align:center;vertical-align:middle;
      letter-spacing:2px;border:3px solid #fff;">${col}</th>`;
  }).join("");
  const rows = Array.from({ length: 5 }, (_, rowIdx) => {
    const cells = COLUMNS.map((col, colIdx) => {
      const val = grid[colIdx][rowIdx];
      const isFree = val === "FREE";
      return `<td style="background:${isFree?"#ff9800":"#fff"};color:${isFree?"#fff":"#1a1a1a"};
        font-size:${isFree?16:24}px;font-weight:${isFree?900:700};
        width:80px;height:72px;text-align:center;vertical-align:middle;
        border:2px solid #ccc;">${isFree?"★ FREE ★":val}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<div class="print-card" style="font-family:'Arial Black',Arial,sans-serif;display:inline-block;
    border:4px solid #1a1a2e;border-radius:12px;overflow:hidden;
    box-shadow:0 4px 16px rgba(0,0,0,.18);page-break-inside:avoid;background:#fff;">
    <div style="background:#1a1a2e;color:#fff;text-align:center;padding:8px 0 4px;
      font-size:11px;font-weight:700;letter-spacing:3px;">
      BINGO CARD #${cardNumber}${totalCards>1?` OF ${totalCards}`:""}
    </div>
    <table style="border-collapse:collapse;">
      <thead><tr>${colHeaders}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="background:#f5f5f5;border-top:1px solid #ddd;text-align:center;
      padding:5px 0;font-size:9px;color:#888;font-family:Arial,sans-serif;letter-spacing:1px;">
      B:1-15 · I:16-30 · N:31-45 · G:46-60 · O:61-75
    </div></div>`;
}

function printViaIframe(cardsHTML, title) {
  // Remove any old print iframe
  const old = document.getElementById("__bingo_print_frame__");
  if (old) old.remove();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, sans-serif;
    background: #fff;
    padding: 16px;
  }
  h1 {
    text-align: center;
    font-size: 20px;
    color: #1a1a2e;
    margin-bottom: 18px;
    font-family: 'Arial Black', Arial, sans-serif;
    letter-spacing: 2px;
  }
  .cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  .print-card { page-break-inside: avoid; break-inside: avoid; }
  table { border-collapse: collapse; }
  td, th { border: 2px solid #ccc; }
  @page { size: A4; margin: 12mm; }
</style>
</head>
<body>
  <h1>🎱 BINGO CARDS</h1>
  <div class="cards-grid">${cardsHTML}</div>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.id = "__bingo_print_frame__";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Wait for iframe content to fully load before printing
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      // Fallback: open in new tab if iframe print fails
      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.target = "_blank"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    // Clean up after print dialog closes
    setTimeout(() => { iframe.remove(); }, 3000);
  };
}

// ─── Claude Vision API ────────────────────────────────────────────────────────
async function extractBingoFromImage(base64, mediaType) {
  const prompt = `You are a precise BINGO card reader. Analyze this image carefully.
TASK: Extract or generate a valid BINGO card from this image.
RULES:
- If this image IS a BINGO card: read the exact numbers shown in each column.
- If this image is NOT a BINGO card: generate numbers themed to the image content.
STRICT BINGO NUMBER RULES:
- Column B: exactly 5 unique integers from 1 to 15
- Column I: exactly 5 unique integers from 16 to 30
- Column N: exactly 4 unique integers from 31 to 45, plus "FREE" at index 2
- Column G: exactly 5 unique integers from 46 to 60
- Column O: exactly 5 unique integers from 61 to 75
- No duplicates within a column. N[2] MUST be "FREE".
Return ONLY valid JSON, no markdown:
{"source":"read or generated","description":"one sentence","B":[n,n,n,n,n],"I":[n,n,n,n,n],"N":[n,n,"FREE",n,n],"G":[n,n,n,n,n],"O":[n,n,n,n,n]}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
      messages:[{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:mediaType,data:base64}},
        {type:"text",text:prompt}
      ]}]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message||"API error");
  const text = (data.content||[]).map(c=>c.text||"").join("").trim();
  const parsed = JSON.parse(text.replace(/```json|```/gi,"").trim());
  return { grid:validateAndFixGrid(parsed), source:parsed.source||"generated", description:parsed.description||"" };
}

// ─── Edit Modal Component ─────────────────────────────────────────────────────
function EditModal({ cardIdx, colIdx, rowIdx, currentVal, grid, onSave, onClose }) {
  const col     = COLUMNS[colIdx];
  const [min, max] = COL_RANGES[col];
  const cc      = COL_COLORS[col];
  const [input, setInput]   = useState(String(currentVal));
  const [error, setError]   = useState("");
  const inputRef = useRef(null);

  // All numbers currently used in this column (excluding the cell being edited)
  const usedInCol = grid[colIdx]
    .filter((v, ri) => ri !== rowIdx && v !== "FREE")
    .map(v => Number(v));

  useEffect(() => {
    setTimeout(() => inputRef.current?.select(), 50);
  }, []);

  // Validate on every keystroke
  const validate = (val) => {
    const n = parseInt(val, 10);
    if (val.trim() === "") return "Please enter a number.";
    if (isNaN(n) || !Number.isInteger(n)) return "Must be a whole number.";
    if (n < min || n > max) return `Column ${col} must be ${min}–${max}.`;
    if (usedInCol.includes(n)) return `${n} already exists in column ${col}.`;
    return "";
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setInput(v);
    setError(validate(v));
  };

  const handleSave = () => {
    const err = validate(input);
    if (err) { setError(err); return; }
    onSave(cardIdx, colIdx, rowIdx, parseInt(input, 10));
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  // Quick-pick: all valid numbers for this column not yet used
  const available = [];
  for (let n = min; n <= max; n++) {
    if (!usedInCol.includes(n)) available.push(n);
  }

  const isValid = !error && input.trim() !== "";

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:"rgba(0,0,0,.72)",
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeIn .18s ease",
    }} onClick={onClose}>
      <div style={{
        background:"linear-gradient(145deg,#0d1830,#111e3a)",
        border:`2px solid ${cc.solid}55`,
        borderRadius:22,padding:"1.5rem 1.4rem",
        width:"min(94vw,380px)",
        boxShadow:`0 20px 60px rgba(0,0,0,.6), 0 0 0 1px ${cc.solid}22`,
        animation:"popIn .22s cubic-bezier(.4,0,.2,1)",
      }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              background:cc.bg,
              width:44,height:44,borderRadius:11,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,fontSize:"1.4rem",color:"#fff",
              boxShadow:`0 4px 14px ${cc.shadow}`,
              flexShrink:0,
            }}>{col}</div>
            <div>
              <p style={{color:"#fff",fontWeight:900,fontSize:"1rem",margin:0}}>
                Edit Cell
              </p>
              <p style={{color:"rgba(255,255,255,.38)",fontSize:".72rem",margin:0}}>
                Column {col} · Range {min}–{max} · Row {rowIdx+1}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,
            width:32,height:32,color:"rgba(255,255,255,.5)",
            cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",
          }}>✕</button>
        </div>

        {/* Current → New */}
        <div style={{
          display:"flex",alignItems:"center",gap:10,marginBottom:"1rem",
          background:"rgba(255,255,255,.04)",borderRadius:12,padding:".7rem .9rem",
        }}>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:".65rem",fontWeight:700,
              letterSpacing:".05em",marginBottom:3}}>CURRENT</div>
            <div style={{
              color:"rgba(255,255,255,.55)",fontWeight:900,fontSize:"1.6rem",lineHeight:1,
              textDecoration:"line-through",
            }}>{currentVal}</div>
          </div>
          <div style={{color:"rgba(255,255,255,.25)",fontSize:"1.4rem"}}>→</div>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:".65rem",fontWeight:700,
              letterSpacing:".05em",marginBottom:3}}>NEW</div>
            <div style={{
              color: isValid ? "#fff" : "rgba(255,255,255,.25)",
              fontWeight:900,fontSize:"1.6rem",lineHeight:1,
              transition:"color .15s",
            }}>
              {isValid ? parseInt(input,10) : "—"}
            </div>
          </div>
        </div>

        {/* Input */}
        <div style={{marginBottom:".75rem"}}>
          <input
            ref={inputRef}
            type="number"
            min={min} max={max}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKey}
            style={{
              width:"100%",padding:".75rem 1rem",
              background:"rgba(255,255,255,.07)",
              border:`2px solid ${error?"#f44336":isValid?cc.solid:"rgba(255,255,255,.15)"}`,
              borderRadius:12,color:"#fff",fontFamily:"inherit",
              fontWeight:900,fontSize:"1.4rem",textAlign:"center",outline:"none",
              transition:"border-color .15s",
              MozAppearance:"textfield",
            }}
            placeholder={`${min}–${max}`}
          />
          {error && (
            <p style={{color:"#f44336",fontSize:".75rem",margin:".35rem 0 0",textAlign:"center",fontWeight:700}}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Quick-pick grid */}
        <div style={{marginBottom:"1rem"}}>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:".67rem",fontWeight:700,
            letterSpacing:".05em",margin:"0 0 .45rem"}}>QUICK PICK — available numbers:</p>
          <div style={{
            display:"flex",flexWrap:"wrap",gap:5,
            maxHeight:110,overflowY:"auto",
            paddingRight:4,
          }}>
            {available.map(n=>(
              <button key={n}
                onClick={()=>{setInput(String(n));setError("");}}
                style={{
                  width:38,height:34,borderRadius:8,border:"none",
                  background: parseInt(input,10)===n ? cc.bg : "rgba(255,255,255,.08)",
                  color: parseInt(input,10)===n ? "#fff" : "rgba(255,255,255,.65)",
                  fontWeight:700,fontSize:".88rem",cursor:"pointer",
                  transition:"all .13s",
                  boxShadow: parseInt(input,10)===n ? `0 2px 10px ${cc.shadow}` : "none",
                  transform: parseInt(input,10)===n ? "scale(1.08)" : "scale(1)",
                  fontFamily:"inherit",
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{
            flex:1,padding:".65rem",borderRadius:12,border:"1px solid rgba(255,255,255,.13)",
            background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.65)",
            fontFamily:"inherit",fontWeight:700,fontSize:".9rem",cursor:"pointer",transition:"all .15s",
          }}>Cancel</button>
          <button onClick={handleSave}
            disabled={!isValid}
            style={{
              flex:2,padding:".65rem",borderRadius:12,border:"none",
              background: isValid ? cc.bg : "rgba(255,255,255,.08)",
              color: isValid ? "#fff" : "rgba(255,255,255,.3)",
              fontFamily:"inherit",fontWeight:900,fontSize:".95rem",
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: isValid ? `0 4px 16px ${cc.shadow}` : "none",
              transition:"all .18s",
            }}>
            ✓ Save Number
          </button>
        </div>

        <p style={{color:"rgba(255,255,255,.2)",fontSize:".68rem",
          textAlign:"center",margin:".6rem 0 0"}}>
          Press Enter to save · Esc to cancel
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BingoFromImage() {
  const [images,    setImages]    = useState([]);
  const [cards,     setCards]     = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [stage,     setStage]     = useState("upload");
  const [dragOver,  setDragOver]  = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const [totalCards,setTotalCards]= useState(5);
  // Edit modal state: null | { cardIdx, colIdx, rowIdx, currentVal }
  const [editTarget, setEditTarget] = useState(null);
  // Edit mode toggle (when ON, clicking a cell opens editor instead of daubing)
  const [editMode,   setEditMode]   = useState(false);

  const cardRefs    = useRef([]);
  const fileInputRef = useRef(null);

  // ── File reading ──────────────────────────────────────────────────────────
  const readFile = (file) => new Promise((res,rej) => {
    if (!file.type.startsWith("image/")) { rej(new Error("Not an image")); return; }
    const r = new FileReader();
    r.onload = e => { const u=e.target.result; res({preview:u,base64:u.split(",")[1],mediaType:file.type}); };
    r.onerror = ()=>rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const addFiles = async (files) => {
    setUploadErr(null);
    const slots = MAX_IMAGES - images.length;
    if (slots<=0) { setUploadErr(`Max ${MAX_IMAGES} images allowed.`); return; }
    const arr = Array.from(files).slice(0,slots);
    try { const read=await Promise.all(arr.map(readFile)); setImages(prev=>[...prev,...read]); }
    catch { setUploadErr("One or more files are not valid images."); }
  };

  const handleFileChange=(e)=>{addFiles(e.target.files);e.target.value="";};
  const handleDrop=(e)=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files);};
  const removeImage=(idx)=>{
    setImages(prev=>prev.filter((_,i)=>i!==idx));
    setActiveIdx(p=>Math.max(0,p>=idx?p-1:p));
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const generateAll = async () => {
    if (images.length===0) return;
    const aiCount = Math.min(images.length,totalCards);
    const init = Array.from({length:totalCards},(_,i)=>({
      grid:null,marked:new Set(["2-2"]),won:false,
      source:"",description:"",loading:i<aiCount,error:null,
      fromImageIdx:i<aiCount?i:null,
    }));
    setCards(init); setActiveIdx(0); setStage("playing"); setEditMode(false);

    const aiResults = await Promise.allSettled(
      images.slice(0,aiCount).map(img=>extractBingoFromImage(img.base64,img.mediaType))
    );

    setCards(Array.from({length:totalCards},(_,i)=>{
      if (i<aiCount) {
        const r=aiResults[i];
        if (r.status==="fulfilled") return {
          grid:r.value.grid,marked:new Set(["2-2"]),won:false,
          source:r.value.source,description:r.value.description,
          loading:false,error:null,fromImageIdx:i,
        };
        return {
          grid:buildRandomCard(),marked:new Set(["2-2"]),won:false,
          source:"generated",description:"Could not read image — random card.",
          loading:false,error:r.reason?.message||"Failed",fromImageIdx:i,
        };
      }
      return {
        grid:buildRandomCard(),marked:new Set(["2-2"]),won:false,
        source:"generated",description:`Random card #${i+1}`,
        loading:false,error:null,fromImageIdx:null,
      };
    }));
  };

  const retryCard = async (idx) => {
    const imgIdx=cards[idx]?.fromImageIdx;
    if (imgIdx==null||!images[imgIdx]) return;
    setCards(prev=>prev.map((c,i)=>i===idx?{...c,loading:true,error:null}:c));
    try {
      const r=await extractBingoFromImage(images[imgIdx].base64,images[imgIdx].mediaType);
      setCards(prev=>prev.map((c,i)=>i===idx
        ?{grid:r.grid,marked:new Set(["2-2"]),won:false,source:r.source,description:r.description,loading:false,error:null,fromImageIdx:imgIdx}:c));
    } catch(e) {
      setCards(prev=>prev.map((c,i)=>i===idx?{...c,loading:false,error:e.message||"Failed"}:c));
    }
  };

  const reshuffleCard=(idx)=>{
    setCards(prev=>prev.map((c,i)=>i===idx
      ?{...c,grid:buildRandomCard(),marked:new Set(["2-2"]),won:false,source:"generated",description:"Reshuffled card"}:c));
  };

  // ── Cell click: daub OR open editor depending on mode ────────────────────
  const handleCellClick = (cardIdx, colIdx, rowIdx) => {
    const card = cards[cardIdx];
    if (!card || card.loading) return;
    const val = card.grid[colIdx][rowIdx];
    if (val === "FREE") return; // FREE is never editable/daubed

    if (editMode) {
      // Open edit modal
      setEditTarget({ cardIdx, colIdx, rowIdx, currentVal: val });
    } else {
      // Normal daub toggle
      const key = `${colIdx}-${rowIdx}`;
      setCards(prev=>prev.map((c,i)=>{
        if (i!==cardIdx) return c;
        const next=new Set(c.marked);
        next.has(key)?next.delete(key):next.add(key);
        return {...c,marked:next,won:checkBingo(next)};
      }));
    }
  };

  // ── Save edited number ────────────────────────────────────────────────────
  const saveEditedCell = (cardIdx, colIdx, rowIdx, newVal) => {
    setCards(prev=>prev.map((c,i)=>{
      if (i!==cardIdx) return c;
      const newGrid = c.grid.map((col,ci)=>
        ci===colIdx ? col.map((v,ri)=> ri===rowIdx ? newVal : v) : col
      );
      // If this cell was marked, unmark it since the number changed
      const newMarked = new Set(c.marked);
      newMarked.delete(`${colIdx}-${rowIdx}`);
      return {...c, grid:newGrid, marked:newMarked, won:checkBingo(newMarked)};
    }));
  };

  // ── Screenshot ────────────────────────────────────────────────────────────
  const screenshot = useCallback(async (idx) => {
    const node=cardRefs.current[idx]; if(!node) return;
    if(!window.html2canvas){
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      document.head.appendChild(s);
      await new Promise(res=>(s.onload=res));
    }
    const canvas=await window.html2canvas(node,{scale:2,backgroundColor:"#080c18"});
    const link=document.createElement("a");
    link.download=`bingo-card-${idx+1}.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
  },[]);

  const screenshotAll=useCallback(async()=>{
    for(let i=0;i<cards.length;i++) await screenshot(i);
  },[cards.length,screenshot]);

  // ── Print ─────────────────────────────────────────────────────────────────
  const printCard = useCallback((idx) => {
    const card=cards[idx];
    if (!card||!card.grid||card.loading) return;
    printViaIframe(buildPrintCardHTML(card.grid,idx+1,cards.length),`Bingo Card #${idx+1}`);
  },[cards]);

  const printAllCards = useCallback(() => {
    const ready=cards.filter(c=>c.grid&&!c.loading);
    if (!ready.length) return;
    printViaIframe(
      ready.map((c,i)=>buildPrintCardHTML(c.grid,cards.indexOf(c)+1,cards.length)).join("\n"),
      `All ${ready.length} Bingo Cards`
    );
  },[cards]);

  const resetAll=()=>{
    setStage("upload");setImages([]);setCards([]);
    setActiveIdx(0);setUploadErr(null);setEditMode(false);setEditTarget(null);
  };

  const ac=cards[activeIdx];
  const bgImg=images[ac?.fromImageIdx??0]??images[0];
  const wonCount=cards.filter(c=>c.won).length;
  const loadingCount=cards.filter(c=>c.loading).length;
  const doneCount=cards.filter(c=>!c.loading).length;
  const readyCards=cards.filter(c=>c.grid&&!c.loading);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",fontFamily:"'Exo 2','Nunito',sans-serif",
      display:"flex",flexDirection:"column",alignItems:"center",
      padding:"1.5rem 1rem 3rem",boxSizing:"border-box",
      position:"relative",overflow:"hidden",
      background:"linear-gradient(145deg,#06080f 0%,#0d1525 100%)",
    }}>

      {bgImg&&stage==="playing"&&(
        <div style={{position:"fixed",inset:0,zIndex:0,
          backgroundImage:`url(${bgImg.preview})`,backgroundSize:"cover",backgroundPosition:"center",
          filter:"blur(32px) brightness(0.11) saturate(1.5)",transition:"all .4s"}}/>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          {...editTarget}
          grid={cards[editTarget.cardIdx]?.grid}
          onSave={saveEditedCell}
          onClose={()=>setEditTarget(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;900&family=Nunito:wght@400;700;900&display=swap');
        *{box-sizing:border-box} body{margin:0}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{from{transform:scale(.82);opacity:0}to{transform:scale(1);opacity:1}}

        .img-slot{position:relative;border-radius:12px;overflow:hidden;
          border:2px solid rgba(255,255,255,.1);transition:all .2s;cursor:pointer;flex-shrink:0}
        .img-slot:hover{border-color:rgba(99,202,255,.6);transform:scale(1.05)}
        .img-slot.active-slot{border-color:#63caff;box-shadow:0 0 0 3px rgba(99,202,255,.3)}
        .img-slot .rm{position:absolute;top:3px;right:3px;width:18px;height:18px;
          border-radius:50%;background:rgba(255,50,50,.9);border:none;color:#fff;
          font-size:.62rem;cursor:pointer;display:flex;align-items:center;justify-content:center;
          opacity:0;transition:opacity .15s;padding:0;line-height:1}
        .img-slot:hover .rm{opacity:1}
        .add-slot{width:68px;height:68px;border-radius:12px;flex-shrink:0;
          border:2px dashed rgba(99,202,255,.35);background:rgba(99,202,255,.04);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:pointer;transition:all .2s;color:rgba(99,202,255,.55);font-size:.6rem;font-weight:700;gap:2px}
        .add-slot:hover{border-color:#63caff;background:rgba(99,202,255,.1);color:#63caff;transform:scale(1.05)}
        .drop-zone{border:2.5px dashed rgba(99,202,255,.35);border-radius:20px;transition:all .2s;cursor:pointer}
        .drop-zone:hover,.drop-zone.dov{border-color:#63caff;background:rgba(99,202,255,.07)!important;transform:scale(1.01)}

        .cnt-btn{width:46px;height:46px;border-radius:11px;border:2px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-family:inherit;
          font-weight:900;font-size:1rem;cursor:pointer;transition:all .16s;
          display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .cnt-btn:hover{border-color:rgba(99,202,255,.55);background:rgba(99,202,255,.1);
          color:rgba(255,255,255,.9);transform:scale(1.07)}
        .cnt-btn.sel{background:linear-gradient(135deg,#63caff,#0072ff);
          border-color:transparent;color:#fff;box-shadow:0 3px 16px rgba(99,202,255,.5);transform:scale(1.1)}

        /* ── Bingo cells ── */
        .bcell{cursor:pointer;transition:transform .13s,box-shadow .13s,outline .1s;
          user-select:none;position:relative;overflow:hidden}
        .bcell:hover{transform:scale(1.08);z-index:2}
        .bcell.mk{transform:scale(1.04)}
        /* In edit mode cells get a pencil cursor + edit glow on hover */
        .edit-mode-on .bcell:not(.free-cell){cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E") 0 20, crosshair}
        .edit-mode-on .bcell:not(.free-cell):hover{outline:2px dashed rgba(255,210,0,.8);outline-offset:2px}
        .daub{position:absolute;inset:4px;border-radius:50%;
          background:radial-gradient(circle at 36% 34%,rgba(255,255,255,.45) 0%,transparent 65%);
          animation:daubIn .18s cubic-bezier(.4,0,.2,1);pointer-events:none}
        @keyframes daubIn{from{transform:scale(.25);opacity:0}to{transform:scale(1);opacity:1}}

        /* Edit mode toggle button */
        .btn-edit-off{background:rgba(255,210,0,.12);border:1.5px solid rgba(255,210,0,.3);
          border-radius:11px;padding:.4rem 1rem;color:rgba(255,210,0,.8);
          font-family:inherit;font-weight:700;font-size:.8rem;cursor:pointer;transition:all .15s}
        .btn-edit-off:hover{background:rgba(255,210,0,.22);color:#ffd200;border-color:rgba(255,210,0,.6)}
        .btn-edit-on{background:linear-gradient(135deg,#ffd200,#ff9800);border:none;
          border-radius:11px;padding:.4rem 1rem;color:#1a1000;
          font-family:inherit;font-weight:900;font-size:.8rem;cursor:pointer;transition:all .15s;
          box-shadow:0 3px 14px rgba(255,210,0,.5);animation:editPulse 2s ease-in-out infinite}
        @keyframes editPulse{0%,100%{box-shadow:0 3px 14px rgba(255,210,0,.5)}
          50%{box-shadow:0 3px 22px rgba(255,210,0,.8)}}

        .tab{padding:.4rem .85rem;border-radius:9px;cursor:pointer;font-family:inherit;
          font-weight:700;font-size:.8rem;border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.05);color:rgba(255,255,255,.45);
          transition:all .15s;white-space:nowrap;position:relative;flex-shrink:0}
        .tab:hover{background:rgba(255,255,255,.1);color:rgba(255,255,255,.85)}
        .tab.active{background:linear-gradient(135deg,#63caff,#0072ff);
          color:#fff;border-color:transparent;box-shadow:0 2px 12px rgba(99,202,255,.4)}
        .tab .wdot{position:absolute;top:3px;right:3px;width:7px;height:7px;
          border-radius:50%;background:#00e676;box-shadow:0 0 5px #00e676}

        .btn-p{background:linear-gradient(135deg,#63caff,#0072ff);border:none;
          border-radius:13px;padding:.68rem 1.6rem;color:#fff;font-family:inherit;
          font-weight:900;font-size:.97rem;cursor:pointer;
          box-shadow:0 4px 22px rgba(99,202,255,.35);transition:all .18s;letter-spacing:.03em}
        .btn-p:hover{transform:translateY(-2px);filter:brightness(1.12)}
        .btn-p:disabled{opacity:.28;cursor:not-allowed;transform:none}
        .btn-g{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
          border-radius:11px;padding:.4rem 1rem;color:rgba(255,255,255,.72);
          font-family:inherit;font-weight:700;font-size:.8rem;cursor:pointer;transition:all .15s}
        .btn-g:hover{background:rgba(255,255,255,.15);color:#fff}
        .btn-print{background:linear-gradient(135deg,#ff9800,#f57c00);border:none;
          border-radius:11px;padding:.4rem 1rem;color:#fff;font-family:inherit;
          font-weight:900;font-size:.8rem;cursor:pointer;transition:all .18s;
          box-shadow:0 3px 12px rgba(255,152,0,.35)}
        .btn-print:hover{transform:translateY(-1px);filter:brightness(1.12)}
        .btn-print-all{background:linear-gradient(135deg,#ff5722,#e64a19);border:none;
          border-radius:11px;padding:.4rem 1.1rem;color:#fff;font-family:inherit;
          font-weight:900;font-size:.8rem;cursor:pointer;transition:all .18s;
          box-shadow:0 3px 12px rgba(255,87,34,.35)}
        .btn-print-all:hover{transform:translateY(-1px);filter:brightness(1.12)}
        .btn-print-all:disabled,.btn-print:disabled{opacity:.3;cursor:not-allowed;transform:none}

        .win-banner{background:linear-gradient(90deg,#00c853,#64dd17);
          border-radius:13px;padding:.5rem 1.2rem;text-align:center;
          color:#051a00;font-weight:900;font-size:1rem;
          box-shadow:0 4px 20px rgba(0,200,80,.4);animation:bIn .3s cubic-bezier(.4,0,.2,1)}
        @keyframes bIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
        .spin{border-radius:50%;border:4px solid rgba(99,202,255,.2);
          border-top-color:#63caff;animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .src-badge{display:inline-flex;align-items:center;gap:4px;border-radius:7px;
          padding:.18rem .6rem;font-size:.65rem;font-weight:700;letter-spacing:.04em}
        .src-read{background:rgba(0,200,80,.15);border:1px solid rgba(0,200,80,.3);color:#00e676}
        .src-gen{background:rgba(99,202,255,.12);border:1px solid rgba(99,202,255,.25);color:#63caff}
        .src-err{background:rgba(255,80,80,.12);border:1px solid rgba(255,80,80,.3);color:#ff8080}
        .prog-track{background:rgba(255,255,255,.08);border-radius:99px;height:6px;overflow:hidden}
        .prog-fill{height:100%;border-radius:99px;
          background:linear-gradient(90deg,#63caff,#0072ff);transition:width .35s ease}
        .card-in{animation:cIn .4s ease}
        @keyframes cIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pulse{animation:pulse 1.4s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        ::-webkit-scrollbar{height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(99,202,255,.3);border-radius:2px}
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button{opacity:1}
      `}</style>

      {/* ── TITLE ─────────────────────────────────────────────────────────── */}
      <div style={{textAlign:"center",marginBottom:"1.2rem",position:"relative",zIndex:1}}>
        <h1 style={{color:"#fff",fontSize:"clamp(1.7rem,5vw,2.6rem)",
          margin:0,fontWeight:900,letterSpacing:".07em"}}>
          <span style={{color:"#63caff"}}>📸</span>{" "}
          <span style={{background:"linear-gradient(90deg,#63caff,#a78bfa,#f472b6)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            IMAGE BINGO
          </span>
        </h1>
        <p style={{color:"rgba(255,255,255,.38)",marginTop:".25rem",fontSize:".85rem"}}>
          Upload · Generate · Edit · Print
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           UPLOAD STAGE
      ══════════════════════════════════════════════════════════════════════ */}
      {stage==="upload"&&(
        <div style={{width:"100%",maxWidth:520,zIndex:1,display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div className={`drop-zone${dragOver?" dov":""}`}
            style={{background:"rgba(99,202,255,.04)",padding:"1.8rem 1.5rem",textAlign:"center"}}
            onClick={()=>images.length<MAX_IMAGES&&fileInputRef.current.click()}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              style={{display:"none"}} onChange={handleFileChange}/>
            <div style={{fontSize:"2.8rem",marginBottom:".4rem"}}>🖼️</div>
            <p style={{color:"rgba(255,255,255,.78)",margin:0,fontWeight:700,fontSize:"1rem"}}>
              {images.length===0?"Drop images / screenshots here or click to browse"
                :images.length<MAX_IMAGES?`Add more images (${images.length}/${MAX_IMAGES})`
                :`${MAX_IMAGES}/${MAX_IMAGES} images — maximum reached`}
            </p>
            <p style={{color:"rgba(255,255,255,.28)",margin:".3rem 0 0",fontSize:".76rem"}}>
              PNG · JPG · WEBP · GIF · Bingo card screenshots · Up to {MAX_IMAGES} images
            </p>
          </div>

          {images.length>0&&(
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",
              borderRadius:16,padding:"1rem"}}>
              <p style={{color:"rgba(255,255,255,.35)",fontSize:".68rem",fontWeight:700,
                letterSpacing:".06em",textAlign:"center",margin:"0 0 .65rem"}}>
                UPLOADED IMAGES ({images.length}/{MAX_IMAGES})
              </p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
                {images.map((img,i)=>(
                  <div key={i} className="img-slot" style={{width:72,height:72}}>
                    <img src={img.preview} alt=""
                      style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                    <button className="rm" onClick={e=>{e.stopPropagation();removeImage(i);}}>✕</button>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,
                      background:"rgba(0,0,0,.65)",color:"#fff",fontSize:".55rem",
                      fontWeight:900,textAlign:"center",padding:"2px 0",letterSpacing:".04em"}}>
                      IMG {i+1}
                    </div>
                  </div>
                ))}
                {images.length<MAX_IMAGES&&(
                  <div className="add-slot" onClick={()=>fileInputRef.current.click()}>
                    <span style={{fontSize:"1.5rem",lineHeight:1}}>+</span><span>Add</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card count */}
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
            borderRadius:18,padding:"1.1rem 1.1rem 1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".8rem"}}>
              <div>
                <p style={{color:"rgba(255,255,255,.82)",fontSize:".92rem",fontWeight:900,margin:0}}>
                  🎴 Total Bingo Cards
                </p>
                <p style={{color:"rgba(255,255,255,.3)",fontSize:".72rem",margin:".15rem 0 0"}}>
                  How many cards to generate in total
                </p>
              </div>
              <div style={{background:"linear-gradient(135deg,#63caff,#0072ff)",borderRadius:14,
                padding:".3rem 1rem",minWidth:58,textAlign:"center",
                boxShadow:"0 3px 16px rgba(99,202,255,.45)"}}>
                <div style={{color:"#fff",fontWeight:900,fontSize:"1.8rem",lineHeight:1}}>{totalCards}</div>
                <div style={{color:"rgba(255,255,255,.7)",fontSize:".58rem",fontWeight:700,letterSpacing:".04em"}}>CARDS</div>
              </div>
            </div>
            <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
              {CARD_COUNTS.map(n=>(
                <button key={n} className={`cnt-btn${totalCards===n?" sel":""}`}
                  onClick={()=>setTotalCards(n)}>{n}</button>
              ))}
            </div>
            {images.length>0&&(
              <div style={{marginTop:".85rem",background:"rgba(99,202,255,.06)",
                border:"1px solid rgba(99,202,255,.14)",borderRadius:12,padding:".65rem .85rem"}}>
                <p style={{color:"rgba(255,255,255,.5)",fontSize:".72rem",fontWeight:700,
                  margin:"0 0 .4rem",letterSpacing:".04em"}}>📋 GENERATION PLAN</p>
                <div style={{display:"flex",flexDirection:"column",gap:".28rem"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"rgba(0,230,118,.8)",fontSize:".76rem"}}>✅ AI-read from images</span>
                    <span style={{color:"rgba(0,230,118,.9)",fontWeight:900,fontSize:".82rem"}}>
                      {Math.min(images.length,totalCards)} card{Math.min(images.length,totalCards)!==1?"s":""}
                    </span>
                  </div>
                  {totalCards>images.length&&(
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:"rgba(99,202,255,.7)",fontSize:".76rem"}}>🎲 Random extra cards</span>
                      <span style={{color:"rgba(99,202,255,.9)",fontWeight:900,fontSize:".82rem"}}>
                        {totalCards-images.length} card{(totalCards-images.length)!==1?"s":""}
                      </span>
                    </div>
                  )}
                  {totalCards<images.length&&(
                    <div style={{color:"rgba(255,180,0,.7)",fontSize:".76rem"}}>
                      ⚠️ Only first {totalCards} image{totalCards!==1?"s":""} will be used
                    </div>
                  )}
                  <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:".28rem",marginTop:".08rem",
                    display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"rgba(255,255,255,.45)",fontSize:".76rem",fontWeight:700}}>TOTAL</span>
                    <span style={{color:"#fff",fontWeight:900,fontSize:".95rem"}}>
                      {totalCards} Bingo Card{totalCards!==1?"s":""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",
            borderRadius:14,padding:".75rem"}}>
            <p style={{color:"rgba(255,255,255,.3)",fontSize:".66rem",fontWeight:700,
              letterSpacing:".06em",textAlign:"center",margin:"0 0 .5rem"}}>BINGO NUMBER RANGES</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
              {COLUMNS.map(col=>{
                const [min,max]=COL_RANGES[col]; const cc=COL_COLORS[col];
                return (
                  <div key={col} style={{textAlign:"center"}}>
                    <div style={{background:cc.bg,borderRadius:7,padding:".26rem 0",
                      fontWeight:900,fontSize:"1rem",color:"#fff",
                      boxShadow:`0 2px 8px ${cc.shadow}`,marginBottom:3}}>{col}</div>
                    <div style={{color:"rgba(255,255,255,.4)",fontSize:".62rem",fontWeight:700}}>{min}–{max}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {uploadErr&&(
            <div style={{background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.3)",
              borderRadius:12,padding:".6rem 1rem",color:"#ff8080",fontSize:".84rem",textAlign:"center"}}>
              ⚠️ {uploadErr}
            </div>
          )}

          <button className="btn-p" onClick={generateAll} disabled={images.length===0}
            style={{width:"100%",fontSize:"1.05rem",padding:".88rem"}}>
            🎱 Generate {totalCards} Bingo Card{totalCards!==1?"s":""}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           PLAYING STAGE
      ══════════════════════════════════════════════════════════════════════ */}
      {stage==="playing"&&cards.length>0&&(
        <div className="card-in" style={{zIndex:1,width:"100%",maxWidth:580,
          display:"flex",flexDirection:"column",gap:".85rem"}}>

          {/* Stats + actions */}
          <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",
            borderRadius:14,padding:".6rem 1rem",
            display:"flex",gap:".7rem",alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:"1rem",flex:1,flexWrap:"wrap"}}>
              {[["🎴","Total",cards.length,"#63caff"],["✅","Won",wonCount,"#00e676"],
                ["⏳","Loading",loadingCount,"#ffab00"]].map(([icon,label,val,color])=>(
                (val>0||label==="Total")&&(
                  <div key={label} style={{textAlign:"center",minWidth:40}}>
                    <div style={{color,fontWeight:900,fontSize:"1.1rem",lineHeight:1}}>{val}</div>
                    <div style={{color:"rgba(255,255,255,.32)",fontSize:".6rem",fontWeight:700,
                      letterSpacing:".04em"}}>{icon}{label}</div>
                  </div>
                )
              ))}
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
              {ac&&!ac.loading&&(
                <>
                  {ac.fromImageIdx!=null&&(
                    <button className="btn-g" onClick={()=>retryCard(activeIdx)} title="Re-read image">🔄</button>
                  )}
                  <button className="btn-g" onClick={()=>reshuffleCard(activeIdx)}>🔀</button>
                  {/* ── EDIT MODE TOGGLE ── */}
                  <button
                    className={editMode?"btn-edit-on":"btn-edit-off"}
                    onClick={()=>setEditMode(p=>!p)}
                    title={editMode?"Exit edit mode — click cells to daub":"Enter edit mode — click cells to change numbers"}>
                    ✏️ {editMode?"Editing…":"Edit"}
                  </button>
                  <button className="btn-g" onClick={()=>screenshot(activeIdx)}>📷</button>
                  <button className="btn-print" onClick={()=>printCard(activeIdx)}>🖨️</button>
                </>
              )}
              <button className="btn-g" onClick={screenshotAll}>💾</button>
              <button className="btn-print-all" onClick={printAllCards}
                disabled={readyCards.length===0}>🖨️ All</button>
              <button className="btn-g" onClick={resetAll}>↩</button>
            </div>
          </div>

          {/* Edit mode banner */}
          {editMode&&(
            <div style={{
              background:"rgba(255,210,0,.1)",border:"1.5px solid rgba(255,210,0,.35)",
              borderRadius:12,padding:".5rem 1rem",
              display:"flex",alignItems:"center",gap:8,
            }}>
              <span style={{fontSize:"1.1rem"}}>✏️</span>
              <div style={{flex:1}}>
                <span style={{color:"#ffd200",fontWeight:900,fontSize:".85rem"}}>Edit Mode ON — </span>
                <span style={{color:"rgba(255,210,0,.7)",fontSize:".82rem"}}>
                  Click any number to change it. Click ✏️ Edit again to go back to daub mode.
                </span>
              </div>
              <button onClick={()=>setEditMode(false)} style={{
                background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,
                padding:".25rem .7rem",color:"rgba(255,255,255,.6)",
                fontFamily:"inherit",fontWeight:700,fontSize:".78rem",cursor:"pointer",
              }}>Done</button>
            </div>
          )}

          {/* Progress */}
          {loadingCount>0&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{color:"rgba(255,255,255,.38)",fontSize:".7rem"}}>Generating with AI…</span>
                <span style={{color:"#63caff",fontSize:".7rem",fontWeight:700}}>
                  {doneCount}/{cards.length} ready
                </span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{width:`${(doneCount/cards.length)*100}%`}}/>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,scrollbarWidth:"thin"}}>
            {cards.map((c,i)=>{
              const isAI=c.fromImageIdx!=null;
              return (
                <button key={i} className={`tab${activeIdx===i?" active":""}`}
                  onClick={()=>{setActiveIdx(i);}}
                  title={isAI?`Card ${i+1} — from Image ${c.fromImageIdx+1}`:`Card ${i+1} — random`}>
                  {c.won&&<span className="wdot"/>}
                  {isAI&&images[c.fromImageIdx]&&(
                    <img src={images[c.fromImageIdx].preview} alt=""
                      style={{width:14,height:14,borderRadius:3,objectFit:"cover",
                        marginRight:4,verticalAlign:"middle",opacity:.8}}/>
                  )}
                  {!isAI&&<span style={{marginRight:3,fontSize:".75rem"}}>🎲</span>}
                  #{i+1}
                  {c.loading&&<span style={{marginLeft:3,fontSize:".65rem"}}>⏳</span>}
                </button>
              );
            })}
          </div>

          {/* Win banner */}
          {ac?.won&&(
            <div className="win-banner">🎉 BINGO on Card #{activeIdx+1}! Five in a row!</div>
          )}

          {/* Loading */}
          {ac?.loading&&(
            <div style={{background:"linear-gradient(160deg,#080c18,#0d1830)",
              borderRadius:20,padding:"1rem",border:"1px solid rgba(99,202,255,.14)",
              minHeight:300,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:"1rem"}}>
              <div className="spin" style={{width:48,height:48}}/>
              <p style={{color:"#63caff",fontWeight:700,margin:0,fontSize:"1rem"}} className="pulse">
                🤖 AI is reading your image…
              </p>
            </div>
          )}

          {/* Active card */}
          {ac&&!ac.loading&&ac.grid&&(
            <div ref={el=>cardRefs.current[activeIdx]=el}
              style={{background:"linear-gradient(160deg,#080c18 0%,#0d1830 100%)",
                borderRadius:20,padding:".85rem",
                border:`1px solid ${ac.won?"rgba(0,230,118,.4)":"rgba(99,202,255,.18)"}`,
                boxShadow:ac.won?"0 12px 60px rgba(0,200,80,.25)":"0 12px 60px rgba(0,0,0,.55)",
                transition:"border-color .3s,box-shadow .3s"}}>

              {/* Badge row */}
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:".6rem",flexWrap:"wrap"}}>
                <span className={`src-badge ${ac.error?"src-err":ac.source==="read"?"src-read":"src-gen"}`}>
                  {ac.error?"⚠️ FALLBACK":ac.source==="read"?"✅ READ FROM IMAGE":"🎲 RANDOM"}
                </span>
                <span style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:7,padding:".16rem .55rem",
                  color:"rgba(255,255,255,.42)",fontSize:".63rem",fontWeight:700}}>
                  {activeIdx+1}/{cards.length}
                </span>
                {ac.fromImageIdx!=null&&(
                  <span style={{background:"rgba(99,202,255,.08)",border:"1px solid rgba(99,202,255,.18)",
                    borderRadius:7,padding:".16rem .55rem",
                    color:"rgba(99,202,255,.7)",fontSize:".63rem",fontWeight:700}}>
                    📸 Image {ac.fromImageIdx+1}
                  </span>
                )}
                {ac.description&&(
                  <span style={{color:"rgba(255,255,255,.28)",fontSize:".67rem",
                    flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {ac.description}
                  </span>
                )}
              </div>

              {/* Column headers */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:6}}>
                {COLUMNS.map(col=>{
                  const [min,max]=COL_RANGES[col]; const cc=COL_COLORS[col];
                  return (
                    <div key={col} style={{background:cc.bg,borderRadius:12,
                      padding:".38rem 0 .28rem",textAlign:"center",boxShadow:`0 3px 12px ${cc.shadow}`}}>
                      <div style={{color:"#fff",fontWeight:900,
                        fontSize:"clamp(1.05rem,3.5vw,1.6rem)",
                        lineHeight:1,letterSpacing:".05em",textShadow:"0 2px 6px rgba(0,0,0,.3)"}}>{col}</div>
                      <div style={{color:"rgba(255,255,255,.68)",fontSize:".52rem",fontWeight:700,marginTop:1}}>
                        {min}–{max}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Number grid */}
              <div className={editMode?"edit-mode-on":""} style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                {Array.from({length:5},(_,rowIdx)=>
                  ac.grid.map((colNums,colIdx)=>{
                    const val=colNums[rowIdx];
                    const key=`${colIdx}-${rowIdx}`;
                    const isFree=val==="FREE";
                    const isMarked=ac.marked.has(key);
                    const cc=COL_COLORS[COLUMNS[colIdx]];
                    return (
                      <div key={key}
                        className={`bcell${isMarked?" mk":""}${isFree?" free-cell":""}`}
                        onClick={()=>handleCellClick(activeIdx,colIdx,rowIdx)}
                        title={editMode&&!isFree?`Click to edit — Column ${COLUMNS[colIdx]}, currently ${val}`:""}
                        style={{
                          aspectRatio:"1",borderRadius:10,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          background:isFree?"linear-gradient(135deg,#ffd200,#f7971e)"
                            :isMarked?cc.bg:"rgba(255,255,255,.05)",
                          border: editMode&&!isFree
                            ? `2px dashed rgba(255,210,0,.45)`
                            : isMarked||isFree?"2px solid transparent":"2px solid rgba(255,255,255,.07)",
                          boxShadow:isMarked?`0 0 16px ${cc.shadow}`:isFree?"0 0 14px rgba(255,210,0,.4)":"none",
                          color:isFree?"#1a1000":"#fff",
                          fontWeight:isMarked||isFree?900:600,
                          fontSize:"clamp(.82rem,2.5vw,1.2rem)",
                        }}>
                        {isMarked&&!isFree&&<div className="daub"/>}
                        {/* Small pencil hint in edit mode */}
                        {editMode&&!isFree&&(
                          <div style={{position:"absolute",top:2,right:3,
                            fontSize:".55rem",opacity:.5,pointerEvents:"none"}}>✏️</div>
                        )}
                        <span style={{position:"relative",zIndex:1}}>{isFree?"⭐":val}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Card footer actions */}
              <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
                <button className="btn-print"
                  onClick={()=>printCard(activeIdx)}
                  style={{fontSize:".78rem",padding:".35rem .9rem"}}>
                  🖨️ Print This Card
                </button>
                {cards.length>1&&(
                  <button className="btn-print-all" onClick={printAllCards}
                    disabled={readyCards.length===0}
                    style={{fontSize:".78rem",padding:".35rem .9rem"}}>
                    🖨️ Print All {readyCards.length}
                  </button>
                )}
              </div>
            </div>
          )}

          {ac?.error&&!ac.loading&&(
            <div style={{background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.25)",
              borderRadius:12,padding:".55rem 1rem",color:"rgba(255,140,140,.9)",
              fontSize:".78rem",textAlign:"center"}}>
              ⚠️ {ac.error} — random card shown.{" "}
              {ac.fromImageIdx!=null&&(
                <span style={{cursor:"pointer",textDecoration:"underline",color:"#ff9090"}}
                  onClick={()=>retryCard(activeIdx)}>Retry?</span>
              )}
            </div>
          )}

          <p style={{color:"rgba(255,255,255,.2)",textAlign:"center",fontSize:".72rem",margin:0}}>
            {editMode
              ? "✏️ Edit mode — click any number to change it"
              : "Tap a number to daub · 5 in a row, column, or diagonal = BINGO!"}
          </p>
        </div>
      )}
    </div>
  );
}