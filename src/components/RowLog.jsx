import { useState } from "react";
import { S } from "./styles";
import { todayStr, formatMeters } from "./utils";

export default function RowLog({ rows, addRow, updateRow, deleteRow }) {
  const [meters, setMeters] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const submit = async () => {
    const m = parseInt(meters, 10);
    if (!m || m < 1) return;
    setSaving(true);
    await addRow(m, notes, date);
    setMeters("");
    setNotes("");
    setDate(todayStr());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveRow = async () => {
    if (!editRow.meters || parseInt(editRow.meters, 10) < 1) return;
    setModalSaving(true);
    await updateRow(editRow);
    setModalSaving(false);
    setEditRow(null);
  };

  const handleDeleteRow = async () => {
    setModalSaving(true);
    await deleteRow(editRow.id);
    setModalSaving(false);
    setEditRow(null);
  };

  return (
    <>
      {editRow && (
        <div style={S.modalOverlay} onClick={() => setEditRow(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>EDIT SESSION</div>
            <div style={S.twoCol}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>METERS</label>
                <input
                  style={S.input}
                  type="number"
                  inputMode="numeric"
                  value={editRow.meters}
                  onChange={(e) =>
                    setEditRow((p) => ({ ...p, meters: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>DATE</label>
                <input
                  style={{ ...S.input, colorScheme: "dark" }}
                  type="date"
                  value={editRow.date}
                  onChange={(e) => setEditRow((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>NOTES (optional)</label>
              <input
                style={S.input}
                type="text"
                value={editRow.notes || ""}
                onChange={(e) => setEditRow((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <button style={S.btn} onClick={handleSaveRow} disabled={modalSaving}>
              {modalSaving ? "SAVING..." : "SAVE"}
            </button>
            <button
              style={{ ...S.btn, ...S.btnDanger, marginTop: 8 }}
              onClick={handleDeleteRow}
              disabled={modalSaving}
            >
              DELETE
            </button>
            <button
              style={{ ...S.btn, background: "#1e293b", marginTop: 8 }}
              onClick={() => setEditRow(null)}
              disabled={modalSaving}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      <div style={S.screen}>
        <div style={S.sectionTitle}>🚣 LOG A ROW</div>
        <div style={S.card}>
          <div style={S.twoCol}>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>METERS</label>
              <input
                style={S.input}
                type="number"
                placeholder="e.g. 5000"
                value={meters}
                onChange={(e) => setMeters(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>DATE</label>
              <input
                style={{ ...S.input, colorScheme: "dark" }}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div style={S.inputGroup}>
            <label style={S.inputLabel}>NOTES (optional)</label>
            <input
              style={S.input}
              type="text"
              placeholder="Steady state, intervals..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button style={{ ...S.btn, ...(saved ? S.btnSuccess : {}) }} onClick={submit} disabled={saving}>
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "LOG SESSION"}
          </button>
        </div>

        {rows.length > 0 && (
          <>
            <div style={S.sectionTitle}>HISTORY</div>
            {rows.slice(0, 15).map((r) => (
              <div
                key={r.id}
                style={{ ...S.listItem, cursor: "pointer" }}
                onClick={() => setEditRow({ ...r })}
                className="card-tap"
              >
                <div style={S.listMain}>
                  {parseInt(r.meters, 10).toLocaleString()}m{" "}
                  <span style={{ marginLeft: "auto", color: "#475569", fontSize: "0.85rem" }}>✏</span>
                </div>
                <div style={S.listSub}>
                  {r.date}
                  {r.notes ? ` · ${r.notes}` : ""}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
