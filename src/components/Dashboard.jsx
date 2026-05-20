import { useState } from "react";
import { S } from "./styles";
import { todayStr, formatDuration, formatMeters } from "./utils";
import ProgressBar from "./ui/ProgressBar";
import MacroPill from "./ui/MacroPill";

export default function Dashboard({
  settings,
  todayCals,
  todayProtein,
  todayFat,
  todayCarbs,
  weekMeters,
  fastElapsed,
  fastGoal,
  fastPct,
  fastDone,
  activeFast,
  rows,
  setTab,
  todayWater,
  addWater,
  workoutLogs = [], // New
}) {
  const [customOz, setCustomOz] = useState("");
  const calPct = Math.min((todayCals / settings.calorieGoal) * 100, 100);
  const todayMeters = rows.filter((r) => r.date === todayStr()).reduce((s, r) => s + r.meters, 0);
  const waterPct = Math.min((todayWater / (settings.waterGoal || 100)) * 100, 100);

  const handleCustomWater = async () => {
    const oz = parseFloat(customOz);
    if (!oz || oz <= 0) return;
    await addWater(oz);
    setCustomOz("");
  };

  // Workout metrics
  const weekWorkouts = workoutLogs.filter((w) => {
    const diff = (new Date() - new Date(w.date)) / 86400000;
    return diff <= 7;
  });
  const lastWorkout = workoutLogs.length > 0 ? workoutLogs[0] : null;

  return (
    <div style={S.screen}>
      <div style={S.sectionTitle}>TODAY</div>

      {/* New Workout summary header card if any workouts are completed */}
      {workoutLogs.length > 0 && (
        <div style={{ ...S.card, cursor: "pointer" }} onClick={() => setTab("Workouts")} className="card-tap">
          <div style={S.cardHeader}>
            <span style={S.cardLabel}>💪 WORKOUTS</span>
            <span style={S.cardLabelRight}>
              {weekWorkouts.length} completed this week
            </span>
          </div>
          <div style={S.workoutSumCard}>
            <span>
              🏋️ Last: {lastWorkout.workout_name} ({lastWorkout.date === todayStr() ? "Today" : lastWorkout.date})
            </span>
            <span>{lastWorkout.total_volume.toLocaleString()} lbs total</span>
          </div>
        </div>
      )}

      <div style={{ ...S.card, cursor: "pointer" }} onClick={() => setTab("Fast")} className="card-tap">
        <div style={S.cardHeader}>
          <span style={S.cardLabel}>🔥 FAST</span>
          <span style={{ ...S.pill, ...(fastDone ? S.pillGreen : activeFast ? S.pillAmber : S.pillDim) }}>
            {fastDone ? "COMPLETE" : activeFast ? "ACTIVE" : "NOT STARTED"}
          </span>
        </div>
        {activeFast ? (
          <>
            <div style={S.bigNum}>{formatDuration(fastElapsed)}</div>
            <div style={S.fastTimeRow}>
              <span>
                🕐 Started{" "}
                {new Date(activeFast.startTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span>
                🏁 Ends{" "}
                {(() => {
                  const e = new Date(activeFast.startTime + fastGoal * 3600000);
                  const isToday = e.toDateString() === new Date().toDateString();
                  const t = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  return isToday
                    ? t
                    : e.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " " + t;
                })()}
              </span>
            </div>
            <div style={S.cardSub}>
              {fastDone ? "🎯 Goal reached!" : `${(fastGoal - fastElapsed / 3600000).toFixed(1)}h remaining`}
            </div>
            <ProgressBar pct={fastPct} color={fastDone ? "#4ade80" : "#f59e0b"} />
          </>
        ) : (
          <div style={S.bigNumDim}>——</div>
        )}
      </div>

      <div style={{ ...S.card, cursor: "pointer" }} onClick={() => setTab("Row")} className="card-tap">
        <div style={S.cardHeader}>
          <span style={S.cardLabel}>🚣 ROW</span>
          <span style={S.cardLabelRight}>THIS WEEK</span>
        </div>
        <div style={S.splitRow}>
          <div>
            <div style={S.bigNum}>{todayMeters > 0 ? formatMeters(todayMeters) + "m" : "——"}</div>
            <div style={S.cardSub}>Today</div>
          </div>
          <div style={S.dividerV} />
          <div style={{ textAlign: "right" }}>
            <div style={S.bigNum}>{weekMeters > 0 ? formatMeters(weekMeters) + "m" : "——"}</div>
            <div style={S.cardSub}>7 days</div>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, cursor: "pointer" }} onClick={() => setTab("Food")} className="card-tap">
        <div style={S.cardHeader}>
          <span style={S.cardLabel}>🥩 CALORIES</span>
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
        <ProgressBar pct={waterPct} color={waterPct >= 100 ? "#4ade80" : "#38bdf8"} />
        <div style={S.waterBtns}>
          {[8, 16, 24, 32].map((oz) => (
            <button
              key={oz}
              style={S.waterBtn}
              onClick={(e) => {
                e.stopPropagation();
                addWater(oz);
              }}
            >
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
            onClick={(e) => {
              e.stopPropagation();
              handleCustomWater();
            }}
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
