import { useState } from "react";
import { S } from "./styles";

export default function SettingsScreen({
  settings,
  updateSettings,
  signOut,
  workoutsSyncLocal = false, // Pass sync status
}) {
  const [saving, setSaving] = useState({});

  const handleChange = async (key, value) => {
    setSaving((p) => ({ ...p, [key]: true }));
    await updateSettings(key, value);
    setSaving((p) => ({ ...p, [key]: false }));
  };

  const Field = ({ label, settingsKey, value }) => (
    <div style={S.inputGroup}>
      <label style={S.inputLabel}>{label}</label>
      <input
        style={{ ...S.input, opacity: saving[settingsKey] ? 0.5 : 1 }}
        type="number"
        inputMode="numeric"
        defaultValue={value}
        onBlur={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v > 0) handleChange(settingsKey, v);
        }}
      />
    </div>
  );

  return (
    <div style={S.screen}>
      <div style={S.sectionTitle}>⚙️ SETTINGS</div>

      {/* Sync Status Banner */}
      <div style={S.card}>
        <div style={S.cardLabel}>DATABASE STATUS</div>
        <div style={{ marginTop: 10, fontSize: "0.85rem", color: workoutsSyncLocal ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
          {workoutsSyncLocal ? (
            <span>⚠️ Workouts synced locally (Supabase table not found)</span>
          ) : (
            <span>✓ Workouts synced to Supabase Cloud</span>
          )}
        </div>
        <div style={{ ...S.cardSub, fontSize: "0.75rem", marginTop: 4 }}>
          {workoutsSyncLocal
            ? "Create the public.workout_logs table in Supabase to enable cloud sync."
            : "All your workout sessions are backed up securely in the cloud."}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>CALORIES</div>
        <div style={{ marginTop: 12 }}>
          <Field label="DAILY CALORIE GOAL (kcal)" settingsKey="calorieGoal" value={settings.calorieGoal} />
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>MACROS</div>
        <div style={{ marginTop: 12 }}>
          <Field label="PROTEIN GOAL (g)" settingsKey="proteinGoal" value={settings.macroGoals.protein} />
          <Field label="FAT GOAL (g)" settingsKey="fatGoal" value={settings.macroGoals.fat} />
          <Field label="CARBS GOAL (g)" settingsKey="carbsGoal" value={settings.macroGoals.carbs} />
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>💧 WATER</div>
        <div style={{ marginTop: 12 }}>
          <Field label="DAILY WATER GOAL (oz)" settingsKey="waterGoal" value={settings.waterGoal || 100} />
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>🔥 FASTING</div>
        <div style={{ marginTop: 12 }}>
          <Field label="WEEKDAY FAST HOURS" settingsKey="weekdayFastHours" value={settings.weekdayHours} />
          <Field label="WEEKEND FAST HOURS" settingsKey="weekendFastHours" value={settings.weekendHours} />
        </div>
      </div>

      <div style={{ ...S.cardSub, textAlign: "center", marginTop: 4 }}>Changes save automatically on blur.</div>

      <div style={S.card}>
        <button
          style={{ ...S.btn, background: "#1e293b", border: "1px solid #334155" }}
          onClick={signOut}
        >
          SIGN OUT
        </button>
      </div>

      <div style={{ ...S.cardSub, textAlign: "center", marginTop: 8, opacity: 0.4 }}>
        v1.1.4
      </div>
    </div>
  );
}
