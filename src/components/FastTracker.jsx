import { useState } from "react";
import { S } from "./styles";
import { todayStr, dateStrFromTs, formatDuration } from "./utils";
import ProgressBar from "./ui/ProgressBar";

function calcStreak(fasts) {
  if (!fasts.length) return 0;
  const sorted = [...fasts].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0,
    cur = todayStr();
  for (const f of sorted) {
    const dur = (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000;
    if (f.date === cur && dur >= parseInt(f.goalHours, 10)) {
      streak++;
      const d = new Date(cur + "T12:00:00"); // Avoid timezone shift
      d.setDate(d.getDate() - 1);
      cur = d.toISOString().split("T")[0];
    } else break;
  }
  return streak;
}

export default function FastTracker({
  activeFast,
  fasts,
  fastElapsed,
  fastGoal,
  fastPct,
  fastDone,
  startFast,
  endFast,
  updateFastStartTime,
  updateFastGoalHours,
  updateFast,
  deleteFast,
  isWeekend, // Pass this or import it
}) {
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [editFast, setEditFast] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const streak = calcStreak(fasts);

  const nowTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const [customStartInput, setCustomStartInput] = useState(nowTimeStr);
  const [customStartDate, setCustomStartDate] = useState(todayStr);
  const [endFastInput, setEndFastInput] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const tsToTimeStr = (ts) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const dateTimeToTs = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [h, m] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, h, m, 0, 0).getTime();
  };

  const toDateTimeLocal = (ts) => {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleStart = async () => {
    setStarting(true);
    await startFast(dateTimeToTs(customStartDate, customStartInput));
    setEndFastInput(toDateTimeLocal(Date.now()));
    setStarting(false);
  };

  const handleEnd = async () => {
    const endTs = endFastInput ? new Date(endFastInput).getTime() : Date.now();
    if (!Number.isFinite(endTs) || endTs <= activeFast.startTime) return;
    setEnding(true);
    await endFast(endTs);
    setEnding(false);
  };

  const startTimeValue = activeFast ? toDateTimeLocal(activeFast.startTime) : "";
  const handleStartTimeChange = (e) => {
    updateFastStartTime(new Date(e.target.value).getTime());
  };

  const handleEndTimeChange = (e) => {
    const newEndTs = new Date(e.target.value).getTime();
    const newGoalHours = (newEndTs - activeFast.startTime) / 3600000;
    if (newGoalHours > 0) updateFastGoalHours(Math.round(newGoalHours));
  };

  const openEditFast = (f) =>
    setEditFast({
      ...f,
      startDateTime: toDateTimeLocal(f.startTime),
      endDateTime: toDateTimeLocal(f.endTime),
      goalHoursStr: String(f.goalHours),
    });

  const handleSaveFast = async () => {
    const newStartTime = new Date(editFast.startDateTime).getTime();
    const newEndTime = new Date(editFast.endDateTime).getTime();

    setModalSaving(true);
    await updateFast({
      ...editFast,
      date: dateStrFromTs(newEndTime),
      start_time: newStartTime,
      end_time: newEndTime,
      goal_hours: parseInt(editFast.goalHoursStr, 10) || editFast.goalHours,
    });
    setModalSaving(false);
    setEditFast(null);
  };

  const handleDeleteFast = async () => {
    setModalSaving(true);
    await deleteFast(editFast.id);
    setModalSaving(false);
    setEditFast(null);
  };

  // Determine weekend status
  const currentIsWeekend = isWeekend ? isWeekend() : new Date().getDay() === 0 || new Date().getDay() === 6;
  const endFastTs = endFastInput ? new Date(endFastInput).getTime() : NaN;
  const canEndFast = activeFast ? Number.isFinite(endFastTs) && endFastTs > activeFast.startTime : true;

  return (
    <>
      {editFast && (
        <div style={S.modalOverlay} onClick={() => setEditFast(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>EDIT FAST</div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>START DATE & TIME</label>
              <input
                style={{ ...S.input, colorScheme: "dark" }}
                type="datetime-local"
                value={editFast.startDateTime}
                onChange={(e) => setEditFast((p) => ({ ...p, startDateTime: e.target.value }))}
              />
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>END DATE & TIME</label>
              <input
                style={{ ...S.input, colorScheme: "dark" }}
                type="datetime-local"
                value={editFast.endDateTime}
                onChange={(e) => setEditFast((p) => ({ ...p, endDateTime: e.target.value }))}
              />
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>GOAL HOURS</label>
              <input
                style={S.input}
                type="number"
                inputMode="numeric"
                value={editFast.goalHoursStr}
                onChange={(e) => setEditFast((p) => ({ ...p, goalHoursStr: e.target.value }))}
              />
            </div>
            <button style={S.btn} onClick={handleSaveFast} disabled={modalSaving}>
              {modalSaving ? "SAVING..." : "SAVE"}
            </button>
            <button
              style={{ ...S.btn, ...S.btnDanger, marginTop: 8 }}
              onClick={handleDeleteFast}
              disabled={modalSaving}
            >
              DELETE
            </button>
            <button
              style={{ ...S.btn, background: "#1e293b", marginTop: 8 }}
              onClick={() => setEditFast(null)}
              disabled={modalSaving}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      <div style={S.screen}>
        <div style={S.sectionTitle}>🔥 FASTING</div>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardLabel}>TARGET TODAY</span>
            <span style={S.cardLabelRight}>
              {Number.isInteger(fastGoal) ? `${fastGoal}:00` : `${fastGoal.toFixed(1)}h`} ·{" "}
              {currentIsWeekend ? "Weekend" : "Weekday"}
            </span>
          </div>
          {activeFast ? (
            <>
              <div
                style={{
                  ...S.bigNum,
                  fontSize: "2.8rem",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                }}
              >
                {formatDuration(fastElapsed)}
              </div>
              <div style={S.fastTimeRow}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  🕐 Started
                  <input
                    type="datetime-local"
                    value={startTimeValue}
                    onChange={handleStartTimeChange}
                    style={{ ...S.fastTimeInput, ...S.fastDateTimeInput, colorScheme: "dark" }}
                  />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  🏁 Ends
                  <input
                    type="datetime-local"
                    value={toDateTimeLocal(activeFast.startTime + fastGoal * 3600000)}
                    onChange={handleEndTimeChange}
                    style={{ ...S.fastTimeInput, ...S.fastDateTimeInput, colorScheme: "dark" }}
                  />
                </span>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>END FAST AT</label>
                <input
                  style={{ ...S.input, colorScheme: "dark" }}
                  type="datetime-local"
                  value={endFastInput}
                  onChange={(e) => setEndFastInput(e.target.value)}
                />
              </div>
              <div style={{ ...S.cardSub, textAlign: "center", marginBottom: 12 }}>
                {fastDone ? "🎯 Goal reached!" : `${((fastGoal * 3600000 - fastElapsed) / 3600000).toFixed(1)}h remaining`}
              </div>
              <ProgressBar pct={fastPct} color={fastDone ? "#4ade80" : "#f59e0b"} thick />
              <button style={{ ...S.btn, ...S.btnDanger, marginTop: 16 }} onClick={handleEnd} disabled={ending || !canEndFast}>
                {ending ? "SAVING..." : "END FAST"}
              </button>
            </>
          ) : (
            <>
              <div style={{ ...S.bigNumDim, textAlign: "center" }}>NOT STARTED</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>START DATE</label>
                  <input
                    style={{ ...S.input, colorScheme: "dark" }}
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>START TIME</label>
                  <input
                    style={{ ...S.input, colorScheme: "dark" }}
                    type="time"
                    value={customStartInput}
                    onChange={(e) => setCustomStartInput(e.target.value)}
                  />
                </div>
              </div>
              <button style={S.btn} onClick={handleStart} disabled={starting}>
                {starting ? "STARTING..." : "START FAST"}
              </button>
            </>
          )}
        </div>

        <div style={S.card}>
          <div style={S.cardLabel}>STREAK</div>
          <div style={S.bigNum}>
            {streak} <span style={{ fontSize: "1rem", color: "#64748b" }}>days</span>
          </div>
        </div>

        {fasts.slice(0, 7).length > 0 && (
          <>
            <div style={S.sectionTitle}>RECENT</div>
            {fasts.slice(0, 7).map((f) => {
              const dur = (parseInt(f.endTime, 10) - parseInt(f.startTime, 10)) / 3600000;
              const met = dur >= parseInt(f.goalHours, 10);
              return (
                <div
                  key={f.id}
                  style={{ ...S.listItem, cursor: "pointer" }}
                  onClick={() => openEditFast(f)}
                  className="card-tap"
                >
                  <div style={S.listMain}>
                    {dur.toFixed(1)}h{" "}
                    <span
                      style={{
                        ...S.pill,
                        ...(met ? S.pillGreen : S.pillDim),
                        marginLeft: 8,
                      }}
                    >
                      {met ? "✓" : "—"}
                    </span>{" "}
                    <span style={{ marginLeft: "auto", color: "#475569", fontSize: "0.85rem" }}>✏</span>
                  </div>
                  <div style={S.listSub}>
                    {f.date} · goal {f.goalHours}h
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
