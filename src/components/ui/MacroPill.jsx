import { S } from "../styles";
import ProgressBar from "./ProgressBar";

export default function MacroPill({ label, val, goal, color }) {
  const pct = Math.min((val / goal) * 100, 100);
  return (
    <div style={{ ...S.macroPill, borderColor: `${color}44` }}>
      <span style={{ ...S.macroLabel, color }}>{label}</span>
      <span style={S.macroVal}>
        {val}
        <span style={S.macroGoal}>/{goal}g</span>
      </span>
      <ProgressBar pct={pct} color={color} />
    </div>
  );
}
