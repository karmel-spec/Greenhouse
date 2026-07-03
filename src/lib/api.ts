export type EveEndpoint =
  | "chat"
  | "daily-plan"
  | "plant-advice"
  | "seed-advice"
  | "diagnose"
  | "shopping-list"
  | "weekly-review"
  | "recent-photos"
  | "zones"
  | "today-tasks"
  | "log-observation";

export async function callEve(endpoint: EveEndpoint, payload: Record<string, unknown>) {
  const response = await fetch(`/api/eve/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Eve request failed: ${response.status}`);
  }

  return response.json();
}

export async function createReminder(payload: Record<string, unknown>) {
  const response = await fetch("/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Reminder request failed: ${response.status}`);
  }

  return response.json();
}
