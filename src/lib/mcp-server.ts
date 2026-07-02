import { tasks, zones, microgreenTrays, plants } from "./mock-data";

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  type: "text" | "error";
  text?: string;
}

export const MCPTools: Tool[] = [
  {
    name: "get_plants",
    description:
      "List all plants in the greenhouse and gardens with ID, name, zone, health status, and last watered date",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_plant_details",
    description:
      "Get full details for a specific plant including care history, observations, and health notes",
    inputSchema: {
      type: "object",
      properties: {
        plant_id: {
          type: "string",
          description: "The ID of the plant",
        },
      },
      required: ["plant_id"],
    },
  },
  {
    name: "get_recent_photos",
    description:
      "Fetch recent greenhouse and garden photos with metadata (count, timestamps, zones)",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of recent photos to fetch (default 5)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_zones",
    description:
      "Get all garden zones with plant counts, current status, and mood/vibe",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_tasks_for_today",
    description:
      "Get today's greenhouse and garden tasks, priorities, and timing",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "log_observation",
    description:
      "Log an observation, diagnosis, or care note for a specific plant",
    inputSchema: {
      type: "object",
      properties: {
        plant_id: {
          type: "string",
          description: "The ID of the plant",
        },
        note: {
          type: "string",
          description: "The observation or diagnosis note",
        },
        photo_url: {
          type: "string",
          description: "Optional URL to an associated photo",
        },
        action_type: {
          type: "string",
          enum: ["observation", "diagnosis", "watering", "pruning", "feeding"],
          description: "Type of action being logged",
        },
      },
      required: ["plant_id", "note", "action_type"],
    },
  },
];

export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case "get_plants":
      return {
        type: "text",
        text: JSON.stringify(getPlants()),
      };

    case "get_plant_details":
      return {
        type: "text",
        text: JSON.stringify(getPlantDetails(args.plant_id as string)),
      };

    case "get_recent_photos":
      return {
        type: "text",
        text: JSON.stringify(getRecentPhotos((args.count as number) || 5)),
      };

    case "get_zones":
      return {
        type: "text",
        text: JSON.stringify(getZones()),
      };

    case "get_tasks_for_today":
      return {
        type: "text",
        text: JSON.stringify(getTasksForToday()),
      };

    case "log_observation":
      return {
        type: "text",
        text: JSON.stringify(
          logObservation(
            args.plant_id as string,
            args.note as string,
            args.photo_url as string | undefined,
            args.action_type as string
          )
        ),
      };

    default:
      return {
        type: "error",
        text: `Unknown tool: ${toolName}`,
      };
  }
}

function getPlants() {
  // Mock plants from the app's zones
  const mockPlants = [
    {
      id: "plant-001",
      name: "Lavender SuperBlue",
      zone: "Herb Garden",
      health_status: "Thriving",
      last_watered: "2026-07-02T14:30:00Z",
      type: "herb",
    },
    {
      id: "plant-002",
      name: "Basil (African Blue)",
      zone: "Greenhouse",
      health_status: "Thriving",
      last_watered: "2026-07-02T09:00:00Z",
      type: "herb",
    },
    {
      id: "plant-003",
      name: "Mint (variegated)",
      zone: "Propagation Shelf",
      health_status: "Good",
      last_watered: "2026-07-02T10:00:00Z",
      type: "herb",
    },
    {
      id: "plant-004",
      name: "Hosta (variegated)",
      zone: "Shade Garden",
      health_status: "Watch",
      last_watered: "2026-07-02T15:00:00Z",
      type: "perennial",
    },
    {
      id: "plant-005",
      name: "Lemon Lime Dracaena",
      zone: "Greenhouse Shelf",
      health_status: "Good",
      last_watered: "2026-07-02T12:00:00Z",
      type: "houseplant",
    },
  ];

  return {
    count: mockPlants.length,
    plants: mockPlants,
    last_updated: new Date().toISOString(),
  };
}

function getPlantDetails(plant_id: string) {
  const plants: Record<string, unknown> = {
    "plant-001": {
      id: "plant-001",
      name: "Lavender SuperBlue",
      botanical_name: "Lavandula angustifolia 'SuperBlue'",
      zone: "Herb Garden",
      health_status: "Thriving",
      last_watered: "2026-07-02T14:30:00Z",
      care_requirements: {
        light: "Full sun (6+ hours)",
        water: "Low, let soil dry between waterings",
        soil: "Well-draining, sandy soil",
        temperature: "Prefers cool, dry conditions",
      },
      observations: [
        {
          date: "2026-07-02T14:30:00Z",
          note: "Blooming well, fragrant flowers visible",
          type: "observation",
        },
        {
          date: "2026-07-01T10:00:00Z",
          note: "Watered lightly, soil is very dry",
          type: "watering",
        },
      ],
      known_issues: [],
      last_pruned: "2026-06-15T10:00:00Z",
    },
    "plant-002": {
      id: "plant-002",
      name: "Basil (African Blue)",
      botanical_name: "Ocimum kilimandscharicum x basilicum",
      zone: "Greenhouse",
      health_status: "Thriving",
      last_watered: "2026-07-02T09:00:00Z",
      care_requirements: {
        light: "Bright indirect light",
        water: "Keep evenly moist",
        soil: "Rich, well-draining",
        temperature: "Warm (70-85°F)",
      },
      observations: [
        {
          date: "2026-07-02T09:00:00Z",
          note: "Looks vigorous, no pests visible",
          type: "observation",
        },
      ],
      known_issues: [],
      last_harvested: "2026-07-01T16:00:00Z",
    },
    "plant-004": {
      id: "plant-004",
      name: "Hosta (variegated)",
      botanical_name: "Hosta sp. (variegated cultivar)",
      zone: "Shade Garden",
      health_status: "Watch",
      last_watered: "2026-07-02T15:00:00Z",
      care_requirements: {
        light: "Partial to full shade",
        water: "Consistent moisture, never dry",
        soil: "Rich, humusy soil",
        temperature: "Cool shade preferred",
      },
      observations: [
        {
          date: "2026-07-02T15:00:00Z",
          note: "Significant chewing damage visible on leaves, likely slugs/snails",
          type: "diagnosis",
        },
      ],
      known_issues: [
        "Slug/snail damage on foliage",
        "Monitor for further damage",
      ],
      last_treated: null,
    },
  };

  return plants[plant_id] || { error: `Plant ${plant_id} not found` };
}

function getRecentPhotos(count: number) {
  const mockPhotos = [
    {
      id: "photo-001",
      timestamp: "2026-07-02T16:30:00Z",
      zone: "Greenhouse",
      description: "Morning overview of herb shelves",
      url: "/photos/greenhouse-001.jpg",
    },
    {
      id: "photo-002",
      timestamp: "2026-07-02T14:15:00Z",
      zone: "Propagation Shelf",
      description: "Basil cuttings in propagation tray",
      url: "/photos/propagation-002.jpg",
    },
    {
      id: "photo-003",
      timestamp: "2026-07-01T18:00:00Z",
      zone: "Shade Garden",
      description: "Hosta with pest damage",
      url: "/photos/shade-garden-003.jpg",
    },
    {
      id: "photo-004",
      timestamp: "2026-07-01T10:30:00Z",
      zone: "Herb Garden",
      description: "Lavender in full bloom",
      url: "/photos/herb-garden-004.jpg",
    },
    {
      id: "photo-005",
      timestamp: "2026-06-30T15:00:00Z",
      zone: "Microgreens Shelf",
      description: "Radish microgreens ready to harvest",
      url: "/photos/microgreens-005.jpg",
    },
  ];

  return {
    count: Math.min(count, mockPhotos.length),
    photos: mockPhotos.slice(0, count),
    total_available: mockPhotos.length,
  };
}

function getZones() {
  return {
    zones: zones.map((zone) => ({
      name: zone.name,
      plant_count: zone.plants,
      status: zone.status,
      mood: zone.mood,
    })),
    total_plants: zones.reduce((sum, z) => sum + z.plants, 0),
    total_zones: zones.length,
  };
}

function getTasksForToday() {
  return {
    tasks: tasks,
    total_count: tasks.length,
    high_priority_count: tasks.filter((t) => t.priority === "High").length,
    generated_at: new Date().toISOString(),
  };
}

function logObservation(
  plant_id: string,
  note: string,
  photo_url?: string,
  action_type?: string
) {
  // In a real app, this would save to a database
  return {
    success: true,
    plant_id,
    observation: {
      timestamp: new Date().toISOString(),
      note,
      photo_url: photo_url || null,
      action_type: action_type || "observation",
    },
    message: `Observation logged for plant ${plant_id}`,
  };
}
