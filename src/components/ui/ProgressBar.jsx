import { S } from "../styles";

export default function ProgressBar({ pct, color, thick }) {
  const h = thick ? 12 : 6;
  return (
    <div style={{ ...S.progressTrack, height: h, marginTop: 8 }}>
      <div style={{ ...S.progressFill, width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}
