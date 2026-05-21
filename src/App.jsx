import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Dashboard from "./components/Dashboard";
import RowLog from "./components/RowLog";
import FastTracker from "./components/FastTracker";
import FoodLog from "./components/FoodLog";
import Trends from "./components/Trends";
import SettingsScreen from "./components/SettingsScreen";
import WorkoutsScreen from "./Workouts";
import Spinner from "./components/ui/Spinner";
import { S, css } from "./components/styles";
import { todayStr, getFastGoal } from "./components/utils";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  "https://ukkdefiltqimuhovicnh.supabase.co",
  "sb_publishable_M95B72z6nKinC_d--mviQg_avW34t1T",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const NAV = ["Dashboard", "Row", "Fast", "Food", "Workouts", "Trends", "Settings"];
const NAV_ICONS = {
  Dashboard: "🏠",
  Row: "🚣",
  Fast: "🔥",
  Food: "🥩",
  Workouts: "💪",
  Trends: "📈",
  Settings: "⚙️",
};

export default function TheOar() {
  const [authState, setAuthState] = useState("idle"); // idle | signing_in | loading | ready | error
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Dashboard");
  // eslint-disable-next-line no-unused-vars
  const [tick, setTick] = useState(0);
  const [error, setError] = useState(null);

  // App data
  const [rows, setRows] = useState([]);
  const [fasts, setFasts] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [settings, setSettings] = useState({
    calorieGoal: 2000,
    macroGoals: { protein: 150, fat: 80, carbs: 50 },
    weekdayHours: 20,
    weekendHours: 16,
    waterGoal: 100,
  });
  const [waterLogs, setWaterLogs] = useState([]);
  const [activeFast, setActiveFast] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [workoutsSyncLocal, setWorkoutsSyncLocal] = useState(false);

  // Live timer
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auth: check existing session on mount, subscribe to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadAllData(session.user.id);
      } else {
        setAuthState("idle");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadAllData(session.user.id);
      } else {
        setUser(null);
        setAuthState("idle");
        setRows([]);
        setFasts([]);
        setFoodLogs([]);
        setWaterLogs([]);
        setActiveFast(null);
        setWorkoutLogs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = () => {
    setAuthState("signing_in");
    setError(null);
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/the-oar/" },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const loadAllData = async (userId) => {
    console.log("[TheOar] loadAllData start, userId:", userId);
    setAuthState("loading");
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      console.log("[TheOar] session in loadAllData:", currentSession?.user?.id);

      console.log("[TheOar] fetching rows...");
      const { data: rowData, error: rowError } = await supabase
        .from("rows")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      console.log("[TheOar] rows result:", rowData, rowError);
      const rowsRes = { data: rowData, error: rowError };

      console.log("[TheOar] fetching fasts...");
      const { data: fastsData, error: fastsError } = await supabase
        .from("fasts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      console.log("[TheOar] fasts result:", fastsData, fastsError);
      const fastsRes = { data: fastsData, error: fastsError };

      console.log("[TheOar] fetching food_logs...");
      const { data: foodData, error: foodError } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      console.log("[TheOar] food_logs result:", foodData, foodError);
      const foodRes = { data: foodData, error: foodError };

      console.log("[TheOar] fetching water...");
      const { data: waterData, error: waterError } = await supabase
        .from("water")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      console.log("[TheOar] water result:", waterData, waterError);
      const waterRes = { data: waterData, error: waterError };

      console.log("[TheOar] fetching settings...");
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      console.log("[TheOar] settings result:", settingsData, settingsError);
      const settingsRes = { data: settingsData, error: settingsError };

      console.log("[TheOar] fetching workouts...");
      try {
        const { data: workoutData, error: workoutError } = await supabase
          .from("workout_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false });
        if (workoutError) throw workoutError;
        setWorkoutLogs(workoutData || []);
        setWorkoutsSyncLocal(false);
      } catch (e) {
        console.warn("[TheOar] Supabase workouts fetch failed in loadAllData, falling back to localStorage:", e);
        setWorkoutsSyncLocal(true);
        const local = localStorage.getItem(`workouts_${userId}`);
        setWorkoutLogs(local ? JSON.parse(local) : []);
      }

      setRows((rowsRes.data || []).map((r) => ({ ...r, meters: parseInt(r.meters, 10) || 0 })));

      const allFasts = (fastsRes.data || []).map((f) => ({
        ...f,
        startTime: f.start_time,
        endTime: f.end_time,
        goalHours: parseInt(f.goal_hours, 10) || 16,
      }));
      setFasts(allFasts.filter((f) => f.end_time != null));
      const activeFastRow = allFasts.find((f) => f.end_time == null);
      if (activeFastRow) {
        setActiveFast({ startTime: activeFastRow.start_time, goalHours: activeFastRow.goal_hours, id: activeFastRow.id });
      } else {
        setActiveFast(null);
      }

      setFoodLogs(
        (foodRes.data || []).map((f) => ({
          ...f,
          calories: parseInt(f.calories, 10) || 0,
          protein: parseInt(f.protein, 10) || 0,
          fat: parseInt(f.fat, 10) || 0,
          carbs: parseInt(f.carbs, 10) || 0,
        }))
      );

      setWaterLogs((waterRes.data || []).map((w) => ({ ...w, oz: parseFloat(w.oz) || 0 })));

      const s = settingsRes.data;
      if (s) {
        setSettings({
          calorieGoal: s.calorie_goal || 2000,
          macroGoals: {
            protein: s.protein_goal || 150,
            fat: s.fat_goal || 80,
            carbs: s.carbs_goal || 50,
          },
          weekdayHours: s.weekday_fast_hours || 20,
          weekendHours: s.weekend_fast_hours || 16,
          waterGoal: s.water_goal || 100,
        });
      } else {
        console.log("[TheOar] no settings row, inserting defaults");
        const insRes = await supabase.from("settings").insert({
          user_id: userId,
          calorie_goal: 2000,
          protein_goal: 150,
          fat_goal: 80,
          carbs_goal: 50,
          water_goal: 100,
          weekday_fast_hours: 20,
          weekend_fast_hours: 16,
        });
        console.log("[TheOar] settings insert:", insRes.error || "ok");
      }

      console.log("[TheOar] loadAllData complete");
      setAuthState("ready");
    } catch (e) {
      console.error("[TheOar] loadAllData threw:", e);
      setAuthState("ready");
    }
  };

  // Auto-schedule Fast Goal completion notification in Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (activeFast) {
        const goalHours = parseFloat(activeFast.goalHours) || getFastGoal(activeFast.startTime, settings.weekdayHours, settings.weekendHours);
        const targetTime = activeFast.startTime + (goalHours * 3600000);
        const delayMs = targetTime - Date.now();

        if (delayMs > 0 && "Notification" in window && Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((reg) => {
            if (reg.active) {
              reg.active.postMessage({
                type: "SCHEDULE_ALERT",
                id: "fast-complete",
                title: "Fast Complete! 🌊",
                body: `Congratulations! You hit your fasting goal of ${goalHours} hours!`,
                delayMs
              });
            }
          });
        }
      } else {
        // Cancel notification if no active fast
        navigator.serviceWorker.ready.then((reg) => {
          if (reg.active) {
            reg.active.postMessage({
              type: "CANCEL_ALERT",
              id: "fast-complete"
            });
          }
        });
      }
    }
  }, [activeFast, settings.weekdayHours, settings.weekendHours]);

  // ── Computed ──
  const fastGoal = activeFast
    ? parseFloat(activeFast.goalHours) || getFastGoal(activeFast.startTime, settings.weekdayHours, settings.weekendHours)
    : getFastGoal(null, settings.weekdayHours, settings.weekendHours);
  const fastElapsed = activeFast ? Date.now() - activeFast.startTime : 0;
  const fastPct = activeFast ? Math.min((fastElapsed / (fastGoal * 3600000)) * 100, 100) : 0;
  const fastDone = fastPct >= 100;
  const todayFood = foodLogs.filter((f) => f.date === todayStr());
  const todayCals = todayFood.reduce((s, f) => s + f.calories, 0);
  const todayProtein = todayFood.reduce((s, f) => s + f.protein, 0);
  const todayFat = todayFood.reduce((s, f) => s + f.fat, 0);
  const todayCarbs = todayFood.reduce((s, f) => s + f.carbs, 0);
  const weekMeters = rows
    .filter((r) => {
      const diff = (new Date() - new Date(r.date)) / 86400000;
      return diff <= 7;
    })
    .reduce((s, r) => s + r.meters, 0);
  const todayWater = waterLogs.filter((w) => w.date === todayStr()).reduce((s, w) => s + w.oz, 0);

  // ── Actions ──
  const addWater = async (oz) => {
    const payload = { id: Date.now(), user_id: user.id, date: todayStr(), oz: parseInt(oz, 10) };
    console.log("[TheOar] water insert payload:", JSON.stringify(payload));
    const { data, error } = await supabase.from("water").insert(payload).select().single();
    if (error) console.error("[TheOar] water insert error:", JSON.stringify(error));
    if (data) setWaterLogs((prev) => [{ ...data, oz: parseInt(data.oz, 10) || 0 }, ...prev]);
  };

  const addRow = async (meters, notes, date) => {
    const { data, error } = await supabase
      .from("rows")
      .insert({
        id: Date.now(),
        user_id: user.id,
        date: date || todayStr(),
        meters: parseInt(meters, 10),
        notes,
      })
      .select()
      .single();
    if (error) console.error("[TheOar] rows insert error:", JSON.stringify(error));
    if (data)
      setRows((prev) =>
        [{ ...data, meters: parseInt(data.meters, 10) || 0 }, ...prev].sort((a, b) => b.date.localeCompare(a.date))
      );
  };

  const startFast = async (customStartTime) => {
    const startTime = customStartTime || Date.now();
    const goal = getFastGoal(startTime, settings.weekdayHours, settings.weekendHours);
    const payload = {
      id: Date.now(),
      user_id: user.id,
      date: todayStr(),
      start_time: startTime,
      goal_hours: parseInt(goal, 10),
    };
    console.log("[TheOar] fasts insert payload:", JSON.stringify(payload));
    const { data, error } = await supabase.from("fasts").insert(payload).select().single();
    if (error) console.error("[TheOar] fasts insert error:", JSON.stringify(error));
    if (data) setActiveFast({ startTime: data.start_time, goalHours: parseInt(data.goal_hours, 10), id: data.id });
  };

  const endFast = async () => {
    if (!activeFast) return;
    const endTime = Date.now();
    await supabase.from("fasts").update({ end_time: endTime }).eq("id", activeFast.id);
    const completed = {
      id: activeFast.id,
      date: todayStr(),
      startTime: activeFast.startTime,
      endTime,
      goalHours: activeFast.goalHours,
      start_time: activeFast.startTime,
      end_time: endTime,
      goal_hours: activeFast.goalHours,
    };
    setFasts((prev) => [completed, ...prev]);
    setActiveFast(null);
  };

  const addFood = async (entry) => {
    const { data, error } = await supabase
      .from("food_logs")
      .insert({
        id: Date.now(),
        user_id: user.id,
        date: entry.date,
        name: entry.name,
        calories: parseInt(entry.calories, 10),
        protein: parseInt(entry.protein, 10),
        fat: parseInt(entry.fat, 10),
        carbs: parseInt(entry.carbs, 10),
      })
      .select()
      .single();
    if (error) console.error("[TheOar] food_logs insert error:", JSON.stringify(error));
    if (data)
      setFoodLogs((prev) => [
        {
          ...data,
          calories: parseInt(data.calories, 10) || 0,
          protein: parseInt(data.protein, 10) || 0,
          fat: parseInt(data.fat, 10) || 0,
          carbs: parseInt(data.carbs, 10) || 0,
        },
        ...prev,
      ]);
  };

  const updateRow = async (entry) => {
    await supabase
      .from("rows")
      .update({ meters: parseInt(entry.meters, 10), date: entry.date, notes: entry.notes })
      .eq("id", entry.id);
    setRows((prev) =>
      prev
        .map((r) => (String(r.id) === String(entry.id) ? { ...r, ...entry, meters: parseInt(entry.meters, 10) } : r))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  };

  const deleteRow = async (id) => {
    await supabase.from("rows").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => String(r.id) !== String(id)));
  };

  const updateFast = async (entry) => {
    await supabase
      .from("fasts")
      .update({
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        goal_hours: parseInt(entry.goal_hours, 10),
      })
      .eq("id", entry.id);
    setFasts((prev) =>
      prev.map((f) =>
        String(f.id) === String(entry.id)
          ? {
              ...f,
              date: entry.date,
              start_time: entry.start_time,
              end_time: entry.end_time,
              goal_hours: parseInt(entry.goal_hours, 10),
              startTime: entry.start_time,
              endTime: entry.end_time,
              goalHours: parseInt(entry.goal_hours, 10),
            }
          : f
      )
    );
  };

  const deleteFast = async (id) => {
    await supabase.from("fasts").delete().eq("id", id);
    setFasts((prev) => prev.filter((f) => String(f.id) !== String(id)));
  };

  const updateFastStartTime = async (newTimestamp) => {
    await supabase.from("fasts").update({ start_time: newTimestamp }).eq("id", activeFast.id);
    setActiveFast((prev) => ({ ...prev, startTime: newTimestamp }));
  };

  const updateFastGoalHours = async (goalHours) => {
    await supabase.from("fasts").update({ goal_hours: goalHours }).eq("id", activeFast.id);
    setActiveFast((prev) => ({ ...prev, goalHours }));
  };

  const updateSettings = async (key, value) => {
    const keyMap = {
      calorieGoal: "calorie_goal",
      proteinGoal: "protein_goal",
      fatGoal: "fat_goal",
      carbsGoal: "carbs_goal",
      weekdayFastHours: "weekday_fast_hours",
      weekendFastHours: "weekend_fast_hours",
      waterGoal: "water_goal",
    };
    const col = keyMap[key];
    if (col) {
      await supabase.from("settings").upsert({ user_id: user.id, [col]: parseInt(value, 10) }, { onConflict: "user_id" });
    }
    setSettings((prev) => {
      const next = { ...prev };
      if (key === "calorieGoal") next.calorieGoal = parseInt(value, 10);
      if (key === "proteinGoal") next.macroGoals = { ...next.macroGoals, protein: parseInt(value, 10) };
      if (key === "fatGoal") next.macroGoals = { ...next.macroGoals, fat: parseInt(value, 10) };
      if (key === "carbsGoal") next.macroGoals = { ...next.macroGoals, carbs: parseInt(value, 10) };
      if (key === "weekdayFastHours") next.weekdayHours = parseInt(value, 10);
      if (key === "weekendFastHours") next.weekendHours = parseInt(value, 10);
      if (key === "waterGoal") next.waterGoal = parseInt(value, 10);
      return next;
    });
  };

  const updateFood = async (entry) => {
    await supabase
      .from("food_logs")
      .update({
        name: entry.name,
        calories: parseInt(entry.calories, 10),
        protein: parseInt(entry.protein, 10),
        fat: parseInt(entry.fat, 10),
        carbs: parseInt(entry.carbs, 10),
      })
      .eq("id", entry.id);
    setFoodLogs((prev) => prev.map((f) => (String(f.id) === String(entry.id) ? entry : f)));
  };

  const deleteFood = async (id) => {
    await supabase.from("food_logs").delete().eq("id", id);
    setFoodLogs((prev) => prev.filter((f) => String(f.id) !== String(id)));
  };

  const updateWater = async (entry) => {
    await supabase.from("water").update({ oz: parseFloat(entry.oz) }).eq("id", entry.id);
    setWaterLogs((prev) => prev.map((w) => (String(w.id) === String(entry.id) ? entry : w)));
  };

  const deleteWater = async (id) => {
    await supabase.from("water").delete().eq("id", id);
    setWaterLogs((prev) => prev.filter((w) => String(w.id) !== String(id)));
  };

  // ── RENDER ──

  if (authState !== "ready") {
    return (
      <div style={S.shell}>
        <style>{css}</style>
        <div style={S.authScreen}>
          <div style={S.authLogo}>THE OAR</div>
          <div style={S.authTagline}>row · fast · fuel</div>
          {authState === "loading" && (
            <div style={S.authLoading}>
              <Spinner /> loading your data...
            </div>
          )}
          {authState === "signing_in" && (
            <div style={S.authLoading}>
              <Spinner /> redirecting to Google...
            </div>
          )}
          {authState === "idle" && (
            <button style={S.authBtn} onClick={signIn}>
              <span style={{ fontSize: "1.1rem" }}>G</span> Sign in with Google
            </button>
          )}
          {error && <div style={S.authError}>{error}</div>}
          <div style={S.authNote}>Your data is stored securely in the cloud. Sign in to continue.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.shell}>
      <style>{css}</style>
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <span style={S.logo}>THE OAR</span>
            <span style={S.tagline}>Row. Fast. Fuel.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={S.headerSub}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            {user?.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} style={S.avatar} alt="avatar" />
            )}
          </div>
        </div>

        <div style={S.content}>
          {tab === "Dashboard" && (
            <Dashboard
              settings={settings}
              todayCals={todayCals}
              todayProtein={todayProtein}
              todayFat={todayFat}
              todayCarbs={todayCarbs}
              weekMeters={weekMeters}
              fastElapsed={fastElapsed}
              fastGoal={fastGoal}
              fastPct={fastPct}
              fastDone={fastDone}
              activeFast={activeFast}
              rows={rows}
              setTab={setTab}
              todayWater={todayWater}
              addWater={addWater}
              workoutLogs={workoutLogs}
            />
          )}
          {tab === "Row" && (
            <RowLog rows={rows} addRow={addRow} updateRow={updateRow} deleteRow={deleteRow} />
          )}
          {tab === "Fast" && (
            <FastTracker
              activeFast={activeFast}
              fasts={fasts}
              fastElapsed={fastElapsed}
              fastGoal={fastGoal}
              fastPct={fastPct}
              fastDone={fastDone}
              startFast={startFast}
              endFast={endFast}
              updateFastStartTime={updateFastStartTime}
              updateFastGoalHours={updateFastGoalHours}
              updateFast={updateFast}
              deleteFast={deleteFast}
            />
          )}
          {tab === "Food" && (
            <FoodLog
              foodLogs={foodLogs}
              settings={settings}
              todayCals={todayCals}
              todayProtein={todayProtein}
              todayFat={todayFat}
              todayCarbs={todayCarbs}
              addFood={addFood}
              todayWater={todayWater}
              addWater={addWater}
              updateFood={updateFood}
              deleteFood={deleteFood}
              waterLogs={waterLogs}
              updateWater={updateWater}
              deleteWater={deleteWater}
            />
          )}
          {tab === "Workouts" && (
            <WorkoutsScreen
              user={user}
              supabase={supabase}
              setSyncLocal={setWorkoutsSyncLocal}
              workoutLogs={workoutLogs}
              setWorkoutLogs={setWorkoutLogs}
            />
          )}
          {tab === "Trends" && (
            <Trends
              rows={rows}
              fasts={fasts}
              foodLogs={foodLogs}
              settings={settings}
              activeFast={activeFast}
              waterLogs={waterLogs}
              workoutLogs={workoutLogs}
            />
          )}
          {tab === "Settings" && (
            <SettingsScreen
              settings={settings}
              updateSettings={updateSettings}
              signOut={signOut}
              workoutsSyncLocal={workoutsSyncLocal}
            />
          )}
        </div>

        <div style={S.nav}>
          {NAV.map((n) => (
            <button
              key={n}
              style={{ ...S.navBtn, ...(tab === n ? S.navBtnActive : {}) }}
              onClick={() => setTab(n)}
            >
              <span style={S.navIcon}>{NAV_ICONS[n]}</span>
              <span style={S.navLabel}>{n}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
