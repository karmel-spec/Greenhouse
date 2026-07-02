export type EveEndpoint =
  | "chat"
  | "daily-plan"
  | "plant-advice"
  | "seed-advice"
  | "diagnose"
  | "shopping-list"
  | "weekly-review";

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

// MCP (Model Context Protocol) integration for Eve
export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown> = {}
) {
  const response = await fetch("/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: toolName, args }),
  });

  if (!response.ok) {
    throw new Error(`MCP tool call failed: ${response.status}`);
  }

  return response.json();
}

export async function getMCPTools() {
  const response = await fetch("/api/mcp", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch MCP tools: ${response.status}`);
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
