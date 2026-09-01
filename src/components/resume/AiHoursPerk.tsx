import { useMemo } from "react";
import { computeAiHours } from "../../lib/aiHours";

export function AiHoursPerk() {
  const { workingDays, vacationDays, effectiveDays, hours } = useMemo(
    () => computeAiHours(),
    []
  );

  return (
    <div className="perk-card">
      <span className="perk-badge">Perk acquired</span>
      <div className="perk-body">
        <svg
          className="perk-icon"
          width="40"
          height="40"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--panel-edge)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
          <line x1="20" y1="2" x2="20" y2="9" stroke="var(--panel-edge)" strokeWidth="1.5" />
          <line x1="20" y1="31" x2="20" y2="38" stroke="var(--panel-edge)" strokeWidth="1.5" />
          <line x1="2" y1="20" x2="9" y2="20" stroke="var(--panel-edge)" strokeWidth="1.5" />
          <line x1="31" y1="20" x2="38" y2="20" stroke="var(--panel-edge)" strokeWidth="1.5" />
          <line x1="20" y1="16" x2="20" y2="9" stroke="var(--amber)" strokeWidth="1.5" />
          <line x1="23.5" y1="20" x2="31" y2="20" stroke="var(--amber)" strokeWidth="1.5" />
        </svg>
        <div>
          <p className="perk-name">Synthetic Symbiosis</p>
          <p className="perk-effect">
            Effect: <span className="perk-value">{hours.toLocaleString("en-US")} h</span> of
            logged co-processing with artificial intelligence since first contact (01.03.2026).
            <br />
            Passive resistance: boilerplate code. Immune to writer's block.
          </p>
          <p className="perk-footer">
            {workingDays} working days − {vacationDays} PTO-adjusted days = {effectiveDays} days ×
            6h/day · live-calculated on load
          </p>
        </div>
      </div>
    </div>
  );
}
