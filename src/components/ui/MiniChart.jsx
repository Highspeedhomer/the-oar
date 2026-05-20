import { S } from "../styles";

function formatMeters(m) {
  return parseInt(m, 10).toLocaleString();
}

export default function MiniChart({ label, items, color, goal, decimals = 0 }) {
  const max = Math.max(...items.map(i => i.val), goal || 0, 1);
  return (
    <div style={S.card}>
      <div style={S.cardLabel}>{label}</div>
      <div style={S.chartWrap}>
        {items.map(item => {
          const pct = (item.val / max) * 100;
          const [yr, mo, dy] = item.date.split("-").map(Number);
          const day = new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { weekday: "narrow" });
          return (
            <div key={item.date} style={S.chartCol}>
              <div style={S.chartBarWrap}>
                {goal && <div style={{ ...S.chartGoalLine, bottom: `${(goal / max) * 100}%` }} />}
                <div style={{ ...S.chartBar, height: `${Math.max(pct, item.val > 0 ? 4 : 0)}%`, background: color }} />
              </div>
              <div style={S.chartDay}>{day}</div>
              {item.val > 0 && (
                <div style={{ ...S.chartVal, color }}>
                  {item.val >= 1000 ? formatMeters(item.val) : item.val.toFixed(decimals)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
