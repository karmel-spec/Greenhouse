"use client";

/**
 * Heating & Cooling — the climate playbook for Karmel's 7.8 × 6.7 ft cedar
 * greenhouse. Live inside-vs-outside readings from the Govee sensor, the
 * seasonal temperature targets for Orem's zone 6b swings, the cooling (and
 * heating) toolkit, and two emergency protocols for the days Utah goes to
 * extremes.
 */

import { useEffect, useState } from "react";
import { Bot, Fan, Flame, Snowflake, Thermometer } from "lucide-react";
import {
  COOLING_STRATEGIES,
  EMERGENCY_PLAYBOOKS,
  SEASONAL_TARGETS,
  SENSOR_NOTE,
} from "@/lib/climate";
import type { EmergencyPlaybook, SeasonalTarget } from "@/lib/climate";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

type SensorReading = {
  temperatureF?: number | null;
  humidity?: number | null;
};

type EnvironmentResponse = {
  outdoor?: SensorReading | null;
  greenhouse?: SensorReading | null;
};

function currentSeason(): SeasonalTarget | undefined {
  const month = new Date().getMonth() + 1;
  return SEASONAL_TARGETS.find((row) => row.monthNumbers.includes(month));
}

const PLAYBOOK_ICONS: Record<EmergencyPlaybook["key"], typeof Flame> = {
  heatwave: Flame,
  frost: Snowflake,
};

export function ClimateControl() {
  const [environment, setEnvironment] = useState<EnvironmentResponse | null>(null);

  useEffect(() => {
    fetch("/api/environment")
      .then((response) => response.json())
      .then((data: EnvironmentResponse) => setEnvironment(data))
      .catch(() => {});
  }, []);

  const season = currentSeason();
  const inside = environment?.greenhouse;
  const outdoor = environment?.outdoor;

  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Heating &amp; Cooling</h2>
        <p>
          Keeping a 7.8 × 6.7 cedar greenhouse alive through Utah&apos;s 20°F winters and 105°F summers. Your roof
          vent, floor louvers, and heat mat carry most days — this is the playbook for the rest of them.
        </p>
      </div>

      {typeof inside?.temperatureF === "number" && (
        <div className="gh-card">
          <h3>
            <Thermometer size={16} /> Right now
          </h3>
          <p>
            Inside your greenhouse it&apos;s <strong>{inside.temperatureF}°F</strong>
            {typeof inside.humidity === "number" ? ` at ${inside.humidity}% humidity` : ""}
            {typeof outdoor?.temperatureF === "number"
              ? `, against ${outdoor.temperatureF}°F outside in Orem`
              : ""}
            .
          </p>
          {season && (
            <>
              <p className="gh-hint">
                It&apos;s {season.season} ({season.months}) — you&apos;re aiming for {season.targetF}.
              </p>
              <div>
                {season.tactics.map((tactic) => (
                  <span key={tactic} className="ref-chip">
                    {tactic}
                  </span>
                ))}
              </div>
            </>
          )}
          <p className="gh-hint">{SENSOR_NOTE}</p>
        </div>
      )}

      <div className="gh-card">
        <h3>
          <Thermometer size={16} /> Seasonal targets
        </h3>
        <p className="gh-hint">
          What Orem throws at you month by month, and where you want the inside of the greenhouse to sit.
        </p>
        <div className="ref-table-wrap">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Outside °F</th>
                <th>Target inside</th>
                <th>Playbook</th>
              </tr>
            </thead>
            <tbody>
              {SEASONAL_TARGETS.map((row) => (
                <tr key={row.season}>
                  <td>
                    <strong>{row.season}</strong> ({row.months})
                  </td>
                  <td>{row.outsideF}</td>
                  <td>{row.targetF}</td>
                  <td>{row.tactics.join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-intro">
        <h2>
          <Fan size={20} /> Your toolkit
        </h2>
        <p>
          Five ways to fight the thermometer — three you own, two on the wishlist. In Utah&apos;s dry air the cheap
          tricks work surprisingly hard.
        </p>
      </div>

      <div className="ref-grid">
        {COOLING_STRATEGIES.map((strategy) => (
          <div key={strategy.name} className="gh-card">
            <h3>
              {strategy.emoji} {strategy.name}
            </h3>
            <p className="gh-hint">{strategy.effect}</p>
            <ul>
              {strategy.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="section-intro">
        <h2>Emergency playbooks</h2>
        <p>
          For the days the forecast turns mean. Run these top to bottom and your greenhouse rides it out.
        </p>
      </div>

      {EMERGENCY_PLAYBOOKS.map((playbook) => {
        const Icon = PLAYBOOK_ICONS[playbook.key];
        return (
          <article key={playbook.key} className={`alert-card ${playbook.key === "heatwave" ? "heat" : "frost"}`}>
            <h4>
              <Icon size={16} /> {playbook.title} — {playbook.trigger}
            </h4>
            <p className="gh-hint">RIGHT NOW</p>
            <ul>
              {playbook.immediate.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="gh-hint">NEXT</p>
            <ul>
              {playbook.next.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <p className="gh-hint">OVERNIGHT</p>
            <ul>
              {playbook.overnight.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>
        );
      })}

      <div className="toolbar">
        <button
          className="secondary-button"
          onClick={() =>
            askEve(
              "Given today's forecast and my greenhouse reading, what should I do about temperature today?",
            )
          }
        >
          <Bot size={14} /> Ask Eve
        </button>
      </div>
    </div>
  );
}
