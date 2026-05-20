import { S } from "./styles";
import { formatMeters, getLast7Days } from "./utils";
import MiniChart from "./ui/MiniChart";

// Helper function locally or imported
function calcStreak(fasts) {
  if (!fasts.length) return 0;
  const sorted = [...fasts].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0,
    cur = new Date().toISOString().split("T")[0];
  for (const f of sorted) {
    const dur = (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000;
    if (f.date === cur && dur >= parseInt(f.goalHours, 10)) {
      streak++;
      const d = new Date(cur + "T12:00:00");
      d.setDate(d.getDate() - 1);
      cur = d.toISOString().split("T")[0];
    } else break;
  }
  return streak;
}

export default function Trends({ rows, fasts, foodLogs, settings, waterLogs, workoutLogs = [] }) {
  const last7 = getLast7Days();
  const metersByDay = last7.map((d) => ({
    date: d,
    val: rows.filter((r) => r.date === d).reduce((s, r) => s + r.meters, 0),
  }));
  const calsByDay = last7.map((d) => ({
    date: d,
    val: foodLogs.filter((f) => f.date === d).reduce((s, f) => s + f.calories, 0),
  }));
  const fastsByDay = last7.map((d) => ({
    date: d,
    val: fasts
      .filter((f) => {
        const end = new Date(parseInt(f.endTime, 10));
        const y = end.getFullYear();
        const mo = String(end.getMonth() + 1).padStart(2, "0");
        const dy = String(end.getDate()).padStart(2, "0");
        return `${y}-${mo}-${dy}` === d;
      })
      .reduce((best, f) => {
        const h = (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000;
        return Math.max(best, h);
      }, 0),
  }));

  // Workouts by day (count of completed sessions)
  const workoutsByDay = last7.map((d) => ({
    date: d,
    val: workoutLogs.filter((w) => w.date === d).length,
  }));

  const totalMeters = rows.reduce((s, r) => s + r.meters, 0);
  const streak = calcStreak(fasts);

  // ── This Month ──
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const monthPrefix = `${thisYear}-${String(thisMonth + 1).padStart(2, "0")}-`;

  const monthRows = rows.filter((r) => r.date.startsWith(monthPrefix));
  const monthTotalMeters = monthRows.reduce((s, r) => s + r.meters, 0);
  const monthDaysRowed = new Set(monthRows.map((r) => r.date)).size;
  const monthAvgMeters = monthDaysRowed > 0 ? Math.round(monthTotalMeters / monthDaysRowed) : 0;

  const monthFasts = fasts.filter((f) => {
    const end = new Date(parseInt(f.endTime, 10));
    return end.getFullYear() === thisYear && end.getMonth() === thisMonth;
  });
  const monthFastsCompleted = monthFasts.filter((f) => {
    const h = (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000;
    return h >= parseInt(f.goalHours, 10);
  }).length;
  const monthAvgFastH =
    monthFasts.length > 0
      ? monthFasts.reduce((s, f) => s + (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000, 0) /
        monthFasts.length
      : 0;

  const monthFoodDays = [...new Set(foodLogs.filter((f) => f.date.startsWith(monthPrefix)).map((f) => f.date))];
  const monthAvgCals =
    monthFoodDays.length > 0
      ? Math.round(
          monthFoodDays.reduce((s, d) => s + foodLogs.filter((f) => f.date === d).reduce((a, f) => a + f.calories, 0), 0) /
            monthFoodDays.length
        )
      : 0;

  const monthWaterDays = [...new Set((waterLogs || []).filter((w) => w.date.startsWith(monthPrefix)).map((w) => w.date))];
  const monthAvgWater =
    monthWaterDays.length > 0
      ? Math.round(
          monthWaterDays.reduce((s, d) => s + (waterLogs || []).filter((w) => w.date === d).reduce((a, w) => a + w.oz, 0), 0) /
            monthWaterDays.length
        )
      : 0;

  // Monthly workouts analytics
  const monthWorkouts = workoutLogs.filter((w) => w.date.startsWith(monthPrefix));
  const monthWorkoutsCount = monthWorkouts.length;
  const monthTotalVolume = monthWorkouts.reduce((s, w) => s + w.total_volume, 0);

  const monthName = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();

  return (
    <div style={S.screen}>
      <div style={S.sectionTitle}>THIS MONTH · {monthName}</div>
      <div style={S.statGrid}>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthTotalMeters > 0 ? formatMeters(monthTotalMeters) + "m" : "——"}</div>
          <div style={S.statLabel}>METERS ROWED</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthDaysRowed > 0 ? monthDaysRowed : "——"}</div>
          <div style={S.statLabel}>DAYS ROWED</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthAvgMeters > 0 ? formatMeters(monthAvgMeters) + "m" : "——"}</div>
          <div style={S.statLabel}>AVG / ROW DAY</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthFastsCompleted > 0 ? monthFastsCompleted : "——"}</div>
          <div style={S.statLabel}>FASTS DONE</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthAvgFastH > 0 ? monthAvgFastH.toFixed(1) + "h" : "——"}</div>
          <div style={S.statLabel}>AVG FAST</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthAvgCals > 0 ? monthAvgCals : "——"}</div>
          <div style={S.statLabel}>AVG KCAL / DAY</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthAvgWater > 0 ? monthAvgWater + "oz" : "——"}</div>
          <div style={S.statLabel}>AVG WATER / DAY</div>
        </div>
        {/* New premium workout monthly cards */}
        <div style={S.statCard}>
          <div style={S.statVal}>{monthWorkoutsCount > 0 ? monthWorkoutsCount : "——"}</div>
          <div style={S.statLabel}>WORKOUTS DONE</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{monthTotalVolume > 0 ? monthTotalVolume.toLocaleString() + " lbs" : "——"}</div>
          <div style={S.statLabel}>TOTAL LIFTED</div>
        </div>
      </div>

      <div style={S.sectionTitle}>TRENDS · 7 DAYS</div>
      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statVal}>{formatMeters(totalMeters)}m</div>
          <div style={S.statLabel}>ALL TIME ROWED</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{streak}</div>
          <div style={S.statLabel}>FAST STREAK</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statVal}>{workoutLogs.length}</div>
          <div style={S.statLabel}>WORKOUTS</div>
        </div>
      </div>
      <MiniChart label="METERS / DAY" items={metersByDay} color="#38bdf8" />
      <MiniChart label="CALORIES / DAY" items={calsByDay} color="#fb923c" goal={settings.calorieGoal} />
      <MiniChart label="FAST HOURS / DAY" items={fastsByDay} color="#4ade80" decimals={1} />
      {/* New Workouts MiniChart */}
      <MiniChart label="WORKOUTS / DAY" items={workoutsByDay} color="#10b981" decimals={0} />
    </div>
  );
}
