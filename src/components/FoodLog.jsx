import { useState, useEffect, useRef } from "react";
import { S } from "./styles";
import { todayStr } from "./utils";
import ProgressBar from "./ui/ProgressBar";
import MacroPill from "./ui/MacroPill";
import { Html5Qrcode } from "html5-qrcode";

const USDA_API_KEY = "Q5xkAB5PaG0SF5MfY815LWi3V3iYuvyKUDiURCxF";

export default function FoodLog({
  foodLogs,
  settings,
  todayCals,
  todayProtein,
  todayFat,
  todayCarbs,
  addFood,
  todayWater,
  addWater,
  updateFood,
  deleteFood,
  waterLogs,
  updateWater,
  deleteWater,
}) {
  const [name, setName] = useState("");
  const [cals, setCals] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [customPortionQty, setCustomPortionQty] = useState("");
  const [customPortionUnit, setCustomPortionUnit] = useState("g");
  const [customOz, setCustomOz] = useState("");
  const [showWaterLog, setShowWaterLog] = useState(false);
  const [editFood, setEditFood] = useState(null);
  const [editWater, setEditWater] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const [mealCategory, setMealCategory] = useState("Meal 1");
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  const startScanner = async () => {
    setIsScanning(true);
    setScanError("");
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("scanner-preview");
        scannerRef.current = html5QrCode;
        
        const qrCodeSuccessCallback = async (decodedText) => {
          await stopScanner();
          await lookupBarcode(decodedText);
        };
        
        const config = {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        };
        
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          () => {} // silent on frame errors
        );
      } catch (err) {
        console.error("Scanner start error:", err);
        setScanError("Failed to access camera. Please check permissions.");
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const lookupBarcode = async (barcode) => {
    setScanLoading(true);
    setScanError("");
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const brandStr = p.brands ? ` (${p.brands})` : "";
        const prodName = p.product_name || "Unknown Product";
        setName(`${prodName}${brandStr}`);
        
        const nut = p.nutriments || {};
        const kcal = Math.round(nut["energy-kcal_100g"] || nut["energy-kcal"] || nut["energy-kcal_value"] || 0);
        const prot = Math.round(nut["proteins_100g"] || nut["proteins"] || nut["proteins_value"] || 0);
        const fatVal = Math.round(nut["fat_100g"] || nut["fat"] || nut["fat_value"] || 0);
        const carbsVal = Math.round(nut["carbohydrates_100g"] || nut["carbohydrates"] || nut["carbohydrates_value"] || 0);
        
        setCals(String(kcal));
        setProtein(String(prot));
        setFat(String(fatVal));
        setCarbs(String(carbsVal));
      } else {
        setScanError("Product not found in Open Food Facts database.");
      }
    } catch (err) {
      console.error("Barcode lookup error:", err);
      setScanError("Failed to lookup barcode. Check network connection.");
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const parseEntry = (fullName) => {
    if (!fullName) return { category: "Snacks / Other", name: "" };
    const match = fullName.match(/^\[(Meal 1|Meal 2|Meal 3|Snacks \/ Other)\]\s*(.*)$/);
    if (match) {
      return { category: match[1], name: match[2] };
    }
    return { category: "Snacks / Other", name: fullName };
  };

  const submit = async () => {
    const c = parseInt(cals, 10);
    if (!name || !c) return;
    setSaving(true);
    const entry = {
      id: Date.now(),
      date: todayStr(),
      name: `[${mealCategory}] ${name}`,
      calories: c,
      protein: parseInt(protein, 10) || 0,
      fat: parseInt(fat, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
    };
    await addFood(entry);
    setName("");
    setCals("");
    setProtein("");
    setFat("");
    setCarbs("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCustomWater = async () => {
    const oz = parseFloat(customOz);
    if (!oz || oz <= 0) return;
    await addWater(oz);
    setCustomOz("");
  };

  const handleSaveFood = async () => {
    if (!editFood.cleanName) return;
    setModalSaving(true);
    const updatedEntry = {
      ...editFood,
      name: `[${editFood.category}] ${editFood.cleanName}`
    };
    await updateFood(updatedEntry);
    setModalSaving(false);
    setEditFood(null);
  };

  const handleDeleteFood = async () => {
    setModalSaving(true);
    await deleteFood(editFood.id);
    setModalSaving(false);
    setEditFood(null);
  };

  const handleSaveWater = async () => {
    if (!editWater.oz) return;
    setModalSaving(true);
    await updateWater(editWater);
    setModalSaving(false);
    setEditWater(null);
  };

  const handleDeleteWater = async () => {
    setModalSaving(true);
    await deleteWater(editWater.id);
    setModalSaving(false);
    setEditWater(null);
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      q
    )}&api_key=${USDA_API_KEY}&pageSize=5&dataType=SR%20Legacy,Survey%20(FNDDS)`;
    const proxies = [
      `https://corsproxy.io/?${usdaUrl}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(usdaUrl)}`,
    ];
    let lastError = null;
    for (const url of proxies) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.foods || data.foods.length === 0) {
          setSearchError("No results found.");
        } else {
          setSearchResults(data.foods.slice(0, 5));
        }
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (lastError) setSearchError("Search failed. Check your connection and try again.");
    setSearchLoading(false);
  };

  const UNIT_TO_GRAMS = { g: 1, oz: 28.35, tbsp: 15, tsp: 5, cup: 240 };

  const PRESET_PORTIONS = [
    { label: "1 tbsp", grams: 15 },
    { label: "2 tbsp", grams: 30 },
    { label: "1/4 cup", grams: 60 },
    { label: "1/2 cup", grams: 120 },
    { label: "1 cup", grams: 240 },
    { label: "1 oz", grams: 28.35 },
    { label: "2 oz", grams: 56.7 },
    { label: "4 oz", grams: 113.4 },
    { label: "6 oz", grams: 170.1 },
    { label: "8 oz", grams: 226.8 },
  ];

  const selectFood = (food) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery("");
    setSearchError("");
    setCustomPortionQty("");
    setCustomPortionUnit("g");
  };

  const applyPortion = (food, grams, portionLabel) => {
    const scale = grams / 100;
    const get = (id) => {
      const n = (food.foodNutrients || []).find((nu) => nu.nutrientId === id);
      return n ? Math.round(n.value * scale) : 0;
    };
    setName(`${food.description} (${portionLabel})`);
    setCals(String(get(1008)));
    setProtein(String(get(1003)));
    setFat(String(get(1004)));
    setCarbs(String(get(1005)));
    setSelectedFood(null);
  };

  const applyCustomPortion = () => {
    const qty = parseFloat(customPortionQty);
    if (!qty || qty <= 0 || !selectedFood) return;
    const grams = qty * (UNIT_TO_GRAMS[customPortionUnit] || 1);
    const label = `${customPortionQty} ${customPortionUnit}`;
    applyPortion(selectedFood, grams, label);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSelectedFood(null);
  };

  const calPct = Math.min((todayCals / settings.calorieGoal) * 100, 100);
  const todayItems = foodLogs.filter((f) => f.date === todayStr());
  const todayWaterItems = (waterLogs || []).filter((w) => w.date === todayStr());

  return (
    <>
      {isScanning && (
        <div style={S.modalOverlay}>
          <div style={{ ...S.modal, position: "relative" }}>
            <div style={S.modalTitle}>SCAN BARCODE</div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <div id="scanner-preview" style={{ width: "100%", height: "100%" }}></div>
              <div style={{
                position: "absolute",
                top: "15%",
                left: "15%",
                width: "70%",
                height: "70%",
                border: "2px dashed #38bdf8",
                borderRadius: 8,
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
                pointerEvents: "none"
              }}></div>
            </div>
            {scanError && <div style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 12, textAlign: "center" }}>{scanError}</div>}
            <button
              style={{ ...S.btn, background: "#1e293b" }}
              onClick={stopScanner}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      {scanLoading && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>LOOKING UP PRODUCT...</div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Fetching macro-nutrients from Open Food Facts...</div>
            </div>
          </div>
        </div>
      )}
      {editFood && (
        <div style={S.modalOverlay} onClick={() => setEditFood(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>EDIT ENTRY</div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>MEAL CATEGORY</label>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {["Meal 1", "Meal 2", "Meal 3", "Snacks / Other"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    style={{
                      flex: 1,
                      background: editFood.category === cat ? "#0c4a6e" : "#0f0f13",
                      border: `1px solid ${editFood.category === cat ? "#38bdf8" : "#252530"}`,
                      borderRadius: 6,
                      padding: "8px 0",
                      color: editFood.category === cat ? "#38bdf8" : "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                    onClick={() => setEditFood(prev => ({ ...prev, category: cat }))}
                  >
                    {cat.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>FOOD NAME</label>
              <input
                style={S.input}
                type="text"
                value={editFood.cleanName}
                onChange={(e) => setEditFood((p) => ({ ...p, cleanName: e.target.value }))}
              />
            </div>
            <div style={S.twoCol}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>CALORIES</label>
                <input
                  style={S.input}
                  type="number"
                  inputMode="numeric"
                  value={editFood.calories}
                  onChange={(e) =>
                    setEditFood((p) => ({ ...p, calories: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>PROTEIN (g)</label>
                <input
                  style={S.input}
                  type="number"
                  inputMode="numeric"
                  value={editFood.protein}
                  onChange={(e) =>
                    setEditFood((p) => ({ ...p, protein: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
            </div>
            <div style={S.twoCol}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>FAT (g)</label>
                <input
                  style={S.input}
                  type="number"
                  inputMode="numeric"
                  value={editFood.fat}
                  onChange={(e) =>
                    setEditFood((p) => ({ ...p, fat: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>CARBS (g)</label>
                <input
                  style={S.input}
                  type="number"
                  inputMode="numeric"
                  value={editFood.carbs}
                  onChange={(e) =>
                    setEditFood((p) => ({ ...p, carbs: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
            </div>
            <button style={S.btn} onClick={handleSaveFood} disabled={modalSaving}>
              {modalSaving ? "SAVING..." : "SAVE"}
            </button>
            <button
              style={{ ...S.btn, ...S.btnDanger, marginTop: 8 }}
              onClick={handleDeleteFood}
              disabled={modalSaving}
            >
              DELETE
            </button>
            <button
              style={{ ...S.btn, background: "#1e293b", marginTop: 8 }}
              onClick={() => setEditFood(null)}
              disabled={modalSaving}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      {editWater && (
        <div style={S.modalOverlay} onClick={() => setEditWater(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>EDIT WATER</div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>OZ</label>
              <input
                style={S.input}
                type="number"
                inputMode="decimal"
                value={editWater.oz}
                onChange={(e) =>
                  setEditWater((p) => ({ ...p, oz: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <button style={S.btn} onClick={handleSaveWater} disabled={modalSaving}>
              {modalSaving ? "SAVING..." : "SAVE"}
            </button>
            <button
              style={{ ...S.btn, ...S.btnDanger, marginTop: 8 }}
              onClick={handleDeleteWater}
              disabled={modalSaving}
            >
              DELETE
            </button>
            <button
              style={{ ...S.btn, background: "#1e293b", marginTop: 8 }}
              onClick={() => setEditWater(null)}
              disabled={modalSaving}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      <div style={S.screen}>
        <div style={S.sectionTitle}>🥩 FOOD LOG</div>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardLabel}>TODAY</span>
            <span style={S.cardLabelRight}>
              {todayCals} / {settings.calorieGoal} kcal
            </span>
          </div>
          <ProgressBar pct={calPct} color={calPct > 100 ? "#f87171" : "#38bdf8"} />
          <div style={S.macroRow}>
            <MacroPill label="P" val={todayProtein} goal={settings.macroGoals.protein} color="#a78bfa" />
            <MacroPill label="F" val={todayFat} goal={settings.macroGoals.fat} color="#fb923c" />
            <MacroPill label="C" val={todayCarbs} goal={settings.macroGoals.carbs} color="#34d399" />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardLabel}>💧 WATER</span>
            <span style={S.cardLabelRight}>
              {todayWater} / {settings.waterGoal || 100} oz
            </span>
          </div>
          <ProgressBar
            pct={Math.min((todayWater / (settings.waterGoal || 100)) * 100, 100)}
            color={todayWater >= (settings.waterGoal || 100) ? "#4ade80" : "#38bdf8"}
          />
          <div style={S.waterBtns}>
            {[8, 16, 24, 32].map((oz) => (
              <button key={oz} style={S.waterBtn} onClick={() => addWater(oz)}>
                +{oz}oz
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              style={{ ...S.input, flex: 1, padding: "10px 12px" }}
              type="number"
              inputMode="decimal"
              placeholder="custom oz"
              value={customOz}
              onChange={(e) => setCustomOz(e.target.value)}
            />
            <button
              style={{ ...S.waterBtn, flex: 0, padding: "10px 16px", whiteSpace: "nowrap" }}
              onClick={handleCustomWater}
            >
              ADD
            </button>
          </div>
        </div>

        <div style={S.sectionTitle}>🥩 ADD FOOD</div>
        <div style={S.card}>
          <button
            style={{
              ...S.btn,
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#0c4a6e",
              border: "1px solid #38bdf8",
              color: "#38bdf8"
            }}
            onClick={startScanner}
          >
            📷 SCAN BARCODE
          </button>

          <div style={S.inputGroup}>
            <label style={S.inputLabel}>SEARCH USDA DATABASE</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                style={{ ...S.waterBtn, flex: 0, padding: "10px 14px", whiteSpace: "nowrap" }}
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? "..." : "SEARCH"}
              </button>
              {(searchResults.length > 0 || searchError) && (
                <button
                  style={{ ...S.waterBtn, flex: 0, padding: "10px 14px", background: "#334155" }}
                  onClick={clearSearch}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {searchLoading && <div style={{ ...S.cardSub, textAlign: "center", marginBottom: 8 }}>Searching...</div>}
          {searchError && <div style={{ ...S.cardSub, color: "#f87171", marginBottom: 8 }}>{searchError}</div>}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {searchResults.map((food, i) => {
                const kcal = (food.foodNutrients || []).find((nu) => nu.nutrientId === 1008);
                return (
                  <div
                    key={i}
                    style={{ ...S.listItem, cursor: "pointer", marginBottom: 4 }}
                    onClick={() => selectFood(food)}
                    className="card-tap"
                  >
                    <div style={S.listMain}>{food.description}</div>
                    <div style={S.listSub}>
                      {kcal ? `${Math.round(kcal.value)} kcal per 100g` : "Nutrition data unavailable"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedFood && (
            <div style={{ marginBottom: 12, background: "#0f172a", borderRadius: 10, padding: 12 }}>
              <div style={{ ...S.cardLabel, marginBottom: 8 }}>PORTION SIZE FOR: {selectedFood.description}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {PRESET_PORTIONS.map(({ label, grams }) => (
                  <button
                    key={label}
                    style={{ ...S.waterBtn, padding: "8px 12px", fontSize: "0.8rem" }}
                    onClick={() => applyPortion(selectedFood, grams, label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  style={{ ...S.input, flex: 1, padding: "10px 12px" }}
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={customPortionQty}
                  onChange={(e) => setCustomPortionQty(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyCustomPortion()}
                />
                <select
                  style={{ ...S.input, width: "auto", padding: "10px 8px", colorScheme: "dark" }}
                  value={customPortionUnit}
                  onChange={(e) => setCustomPortionUnit(e.target.value)}
                >
                  {["g", "oz", "tbsp", "tsp", "cup"].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <button
                  style={{ ...S.waterBtn, flex: 0, padding: "10px 14px", whiteSpace: "nowrap" }}
                  onClick={applyCustomPortion}
                  disabled={!customPortionQty || parseFloat(customPortionQty) <= 0}
                >
                  USE
                </button>
              </div>
              <button
                style={{
                  ...S.cardSub,
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  marginTop: 8,
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => setSelectedFood(null)}
              >
                Cancel
              </button>
            </div>
          )}
          <div style={{ ...S.cardSub, marginBottom: 12, borderTop: "1px solid #1e293b", paddingTop: 12 }}>
            MANUAL ENTRY
          </div>
          
          <div style={S.inputGroup}>
            <label style={S.inputLabel}>MEAL CATEGORY</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["Meal 1", "Meal 2", "Meal 3", "Snacks / Other"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    flex: 1,
                    background: mealCategory === cat ? "#0c4a6e" : "#0f0f13",
                    border: `1px solid ${mealCategory === cat ? "#38bdf8" : "#252530"}`,
                    borderRadius: 8,
                    padding: "10px 0",
                    color: mealCategory === cat ? "#38bdf8" : "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => setMealCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={S.inputGroup}>
            <label style={S.inputLabel}>FOOD NAME</label>
            <input
              style={S.input}
              type="text"
              placeholder="Chicken breast, eggs..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={S.twoCol}>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>CALORIES</label>
              <input
                style={S.input}
                type="number"
                placeholder="kcal"
                value={cals}
                onChange={(e) => setCals(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>PROTEIN (g)</label>
              <input
                style={S.input}
                type="number"
                placeholder="g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>
          <div style={S.twoCol}>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>FAT (g)</label>
              <input
                style={S.input}
                type="number"
                placeholder="g"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>CARBS (g)</label>
              <input
                style={S.input}
                type="number"
                placeholder="g"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>
          <button style={{ ...S.btn, ...(saved ? S.btnSuccess : {}) }} onClick={submit} disabled={saving}>
            {saving ? "SAVING..." : saved ? "✓ LOGGED" : "ADD ENTRY"}
          </button>
        </div>

        {todayItems.length > 0 && (
          <>
            <div style={S.sectionTitle}>TODAY'S ENTRIES</div>
            {["Meal 1", "Meal 2", "Meal 3", "Snacks / Other"].map((cat) => {
              const items = todayItems.filter(f => {
                const { category } = parseEntry(f.name);
                return category === cat;
              });
              if (items.length === 0) return null;
              
              const subCals = items.reduce((acc, f) => acc + (f.calories || 0), 0);
              const subProt = items.reduce((acc, f) => acc + (f.protein || 0), 0);
              const subFat = items.reduce((acc, f) => acc + (f.fat || 0), 0);
              const subCarbs = items.reduce((acc, f) => acc + (f.carbs || 0), 0);
              
              const categoryAliases = {
                "Meal 1": "Meal 1 (The Fast Breaker)",
                "Meal 2": "Meal 2 (The Mid-Window Intake)",
                "Meal 3": "Meal 3 (The Final Window Closure)",
                "Snacks / Other": "Snacks / Other"
              };

              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderBottom: "1px solid #1e293b",
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.05em" }}>
                      {categoryAliases[cat]}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {subCals} kcal · P:{subProt}g F:{subFat}g C:{subCarbs}g
                    </span>
                  </div>
                  {items.map((f) => {
                    const { name: cleanName } = parseEntry(f.name);
                    return (
                      <div
                        key={f.id}
                        style={{ ...S.listItem, cursor: "pointer" }}
                        onClick={() => setEditFood({ ...f, category: cat, cleanName })}
                        className="card-tap"
                      >
                        <div style={S.listMain}>
                          {cleanName} <span style={{ marginLeft: "auto", color: "#475569", fontSize: "0.85rem" }}>✏</span>
                        </div>
                        <div style={S.listSub}>
                          {f.calories} kcal · P:{f.protein}g F:{f.fat}g C:{f.carbs}g
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}

        {todayWaterItems.length > 0 && (
          <>
            <div
              style={{
                ...S.sectionTitle,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>💧 WATER LOG</span>
              <button style={S.toggleBtn} onClick={() => setShowWaterLog((v) => !v)}>
                {showWaterLog ? "HIDE" : "EDIT"}
              </button>
            </div>
            {showWaterLog &&
              todayWaterItems.map((w) => (
                <div
                  key={w.id}
                  style={{ ...S.listItem, cursor: "pointer" }}
                  onClick={() => setEditWater({ ...w })}
                  className="card-tap"
                >
                  <div style={S.listMain}>
                    {w.oz}oz <span style={{ marginLeft: "auto", color: "#475569", fontSize: "0.85rem" }}>✏</span>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </>
  );
}
