import { tasks, zones } from "./mock-data";

type LogObservationInput = {
  plant_id?: string;
  note?: string;
  photo_url?: string;
  action_type?: string;
};

const mockPhotos = [
  {
    id: "photo-001",
    timestamp: "2026-07-02T16:45:00Z",
    zone: "Greenhouse",
    description: "Tomato starts after afternoon watering",
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

export function getRecentPhotos(count = 5) {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 5;

  return {
    count: Math.min(safeCount, mockPhotos.length),
    photos: mockPhotos.slice(0, safeCount),
    total_available: mockPhotos.length,
  };
}

export function getZones() {
  return {
    zones: zones.map((zone) => ({
      name: zone.name,
      plant_count: zone.plants,
      status: zone.status,
      mood: zone.mood,
    })),
    total_plants: zones.reduce((sum, zone) => sum + zone.plants, 0),
    total_zones: zones.length,
  };
}

export function getTasksForToday() {
  return {
    tasks,
    total_count: tasks.length,
    high_priority_count: tasks.filter((task) => task.priority === "High").length,
    generated_at: new Date().toISOString(),
  };
}

export function logObservation({ plant_id, note, photo_url, action_type }: LogObservationInput) {
  if (!plant_id || !note) {
    return {
      success: false,
      error: "plant_id and note are required.",
    };
  }

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
