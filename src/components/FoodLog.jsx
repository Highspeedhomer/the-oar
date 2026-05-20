import { useState } from "react";
import { S } from "./styles";
import { todayStr } from "./utils";
import ProgressBar from "./ui/ProgressBar";
import MacroPill from "./ui/MacroPill";

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

  const submit = async () => {
    const c = parseInt(cals, 10);
    if (!name || !c) return;
    setSaving(true);
    const entry = {
      id: Date.now(),
      date: todayStr(),
      name,
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
    if (!editFood.name) return;
    setModalSaving(true);
    await updateFood(editFood);
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
      {editFood && (
        <div style={S.modalOverlay} onClick={() => setEditFood(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>EDIT ENTRY</div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>FOOD NAME</label>
              <input
                style={S.input}
                type="text"
                value={editFood.name}
                onChange={(e) => setEditFood((p) => ({ ...p, name: e.target.value }))}
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
            {todayItems.map((f) => (
              <div
                key={f.id}
                style={{ ...S.listItem, cursor: "pointer" }}
                onClick={() => setEditFood({ ...f })}
                className="card-tap"
              >
                <div style={S.listMain}>
                  {f.name} <span style={{ marginLeft: "auto", color: "#475569", fontSize: "0.85rem" }}>✏</span>
                </div>
                <div style={S.listSub}>
                  {f.calories} kcal · P:{f.protein}g F:{f.fat}g C:{f.carbs}g
                </div>
              </div>
            ))}
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
