import {
  BookOpen,
  Bot,
  CalendarDays,
  Camera,
  Flower2,
  GalleryHorizontalEnd,
  Heart,
  Home,
  Images,
  Leaf,
  LibraryBig,
  Map,
  MessageCircle,
  PackagePlus,
  PanelTop,
  Sprout,
  SunMedium,
  TestTube2,
  Trees,
  WandSparkles,
} from "lucide-react";

export type SectionKey =
  | "today"
  | "eve"
  | "plants"
  | "zones"
  | "operations"
  | "propagation"
  | "microgreens"
  | "apothecary"
  | "seeds"
  | "seed-vault"
  | "saving"
  | "photos"
  | "wishlist"
  | "landscape"
  | "map"
  | "quotes"
  | "learning"
  | "reminders";

export const navItems = [
  { key: "today", label: "Today", icon: Home },
  { key: "eve", label: "Eve Assistant", icon: Bot },
  { key: "plants", label: "Plant Library", icon: Leaf },
  { key: "zones", label: "Garden Zones", icon: Trees },
  { key: "operations", label: "Operations", icon: PanelTop },
  { key: "propagation", label: "Propagation", icon: Sprout },
  { key: "microgreens", label: "Microgreens", icon: TestTube2 },
  { key: "apothecary", label: "Apothecary", icon: Flower2 },
  { key: "seeds", label: "Seed Library", icon: PackagePlus },
  { key: "seed-vault", label: "Seed Vault", icon: GalleryHorizontalEnd },
  { key: "saving", label: "Seed Saving", icon: Images },
  { key: "photos", label: "Photo Journal", icon: Camera },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "landscape", label: "Edible Landscape", icon: SunMedium },
  { key: "map", label: "Aerial Map", icon: Map },
  { key: "quotes", label: "Scriptures", icon: BookOpen },
  { key: "learning", label: "Learning", icon: LibraryBig },
  { key: "reminders", label: "Text Reminders", icon: MessageCircle },
] satisfies { key: SectionKey; label: string; icon: typeof Home }[];

export const tasks = [
  { title: "Water greenhouse herbs", time: "7:00 AM", kind: "Water", priority: "High" },
  { title: "Mist microgreens trays", time: "10:00 AM", kind: "Mist", priority: "High" },
  { title: "Check basil cuttings", time: "12:00 PM", kind: "Propagation", priority: "Medium" },
  { title: "Harvest radish microgreens", time: "3:00 PM", kind: "Harvest", priority: "Medium" },
  { title: "Take progress photos", time: "4:00 PM", kind: "Journal", priority: "Low" },
  { title: "Plant lavender seeds", time: "5:00 PM", kind: "Seeds", priority: "Medium" },
  { title: "Evening greenhouse check", time: "7:00 PM", kind: "Health", priority: "High" },
];

export const zones = [
  "Greenhouse",
  "Greenhouse Sections",
  "Propagation Shelf",
  "Microgreens Shelf",
  "Herb Garden",
  "Tea Garden",
  "Gratitude Garden",
  "Terraced Square Foot Vegetable Garden",
  "Meditation Garden",
  "Friendship Garden",
  "Apothecary Garden",
  "Fairy Garden",
  "Edible Landscape",
  "Flower Beds",
  "Yard Plants",
  "Greenhouse Patio",
  "Shade Garden",
  "Sun Garden",
  "Vineyard/Garden Area",
].map((name, index) => ({
  name,
  plants: [12, 7, 18, 10, 21, 9][index % 6],
  mood: ["Cozy", "Tender", "Sacred", "Productive", "Wild", "Restful"][index % 6],
  status: ["Thriving", "Good", "Needs water", "Plan next"][index % 4],
}));

export const microgreenTrays = [
  { name: "Broccoli", started: "Apr 28", stage: "Light", days: 4, harvest: "2 days", progress: 80 },
  { name: "Sunflower", started: "Apr 30", stage: "Growth", days: 12, harvest: "4 days", progress: 60 },
  { name: "Pea Shoots", started: "May 1", stage: "Growth", days: 11, harvest: "3 days", progress: 66 },
  { name: "Radish", started: "May 2", stage: "Seedling", days: 10, harvest: "Today", progress: 92 },
  { name: "Kale", started: "May 3", stage: "Growth", days: 9, harvest: "6 days", progress: 30 },
  { name: "Mizuna", started: "May 5", stage: "Germination", days: 7, harvest: "7 days", progress: 20 },
];

export const seeds = [
  { name: "Tomato", variety: "Brandywine", category: "Vegetable", count: 45 },
  { name: "Lettuce", variety: "Buttercrunch", category: "Vegetable", count: 120 },
  { name: "Basil", variety: "Genovese", category: "Herb", count: 80 },
  { name: "Zinnia", variety: "California Mix", category: "Flower", count: 75 },
  { name: "Sunflower", variety: "Mammoth", category: "Flower", count: 30 },
  { name: "Pea", variety: "Sugar Snap", category: "Vegetable", count: 60 },
  { name: "Carrot", variety: "Nantes", category: "Vegetable", count: 200 },
  { name: "Lavender", variety: "English", category: "Herb", count: 40 },
  { name: "Radish", variety: "Cherry Belle", category: "Microgreen", count: 500 },
];

export const plants = [
  { name: "Lavender", variety: "English", location: "Apothecary Garden", status: "Seedling" },
  { name: "Basil", variety: "Genovese", location: "Propagation Shelf", status: "Rooting" },
  { name: "Chamomile", variety: "German", location: "Tea Garden", status: "Growing" },
  { name: "Tomato", variety: "Brandywine", location: "Greenhouse", status: "Thriving" },
  { name: "Peppermint", variety: "Common", location: "Herb Garden", status: "Transplanted" },
];

export const evePrompts = [
  "What should I do in the greenhouse today?",
  "What needs watering?",
  "What should I plant next?",
  "What microgreens tray should I start?",
  "What cuttings are ready to pot up?",
  "What seeds do I already have?",
  "Teach me how to save seeds from this plant.",
  "Help me diagnose this plant from a photo.",
  "What scripture or quote fits today's garden lesson?",
];

export const apiPlaceholders = [
  "/api/eve/chat",
  "/api/eve/daily-plan",
  "/api/eve/plant-advice",
  "/api/eve/seed-advice",
  "/api/eve/diagnose",
  "/api/eve/shopping-list",
  "/api/eve/weekly-review",
];

export const learningModules = [
  "Greenhouse basics",
  "Watering basics",
  "Seed starting",
  "Propagation",
  "Microgreens",
  "Herbs",
  "Flowers",
  "Vegetables",
  "Edible landscaping",
  "Soil basics",
  "Compost basics",
  "Fertilizer basics",
  "Pruning",
  "Pest prevention",
  "Seasonal planning",
  "Garden design",
  "Seed packet reading",
  "Seed inventory",
  "Seed saving",
  "Sacred garden symbolism",
];

export const reminderTypes = [
  "Watering",
  "Misting",
  "Harvesting",
  "Seed starting",
  "Transplanting",
  "Potting up cuttings",
  "Checking microgreens",
  "Taking progress photos",
  "Drying seeds",
  "Cleaning seeds",
  "Germination testing",
  "Ordering supplies",
  "Moving plants due to weather",
];

export const wishlistItems = [
  { name: "Garden arch", category: "Tea Garden", price: "$128.99", priority: "High" },
  { name: "Solar fountain", category: "Gratitude Garden", price: "$89.00", priority: "High" },
  { name: "Greenhouse shelf", category: "Greenhouse", price: "$64.09", priority: "Medium" },
  { name: "Hanging basket hooks", category: "Outdoor Decor", price: "$12.99", priority: "Low" },
  { name: "Compost tumbler", category: "Compost Area", price: "$126.09", priority: "Medium" },
];

export const quoteTopics = [
  "Light",
  "Growth",
  "Seeds",
  "Pruning",
  "Harvest",
  "Roots",
  "Living water",
  "Fruit",
  "Faith",
  "Patience",
  "Creation",
  "Beauty",
  "Stewardship",
  "Renewal",
  "Gardens",
  "Vineyards",
];

export const uploadReadyFields = [
  "Seed packet fronts and backs",
  "Plant diagnosis photos",
  "Progress journal images",
  "Aerial property maps",
  "Wishlist inspiration photos",
  "Seed-saving record photos",
];

export const styleModes = [
  { name: "Hygge Greenhouse Journal", token: "Cream, sage, terracotta, soft gold" },
  { name: "Botanical Command Center", token: "Forest green, amber alerts, luminous panels" },
  { name: "Modern Microgreen Lab", token: "Clean white, fresh green, blue lab signals" },
  { name: "Vintage Herb Apothecary", token: "Aged paper, ink labels, pressed botanicals" },
];

export const magicActions = [
  { label: "Add task", icon: CalendarDays },
  { label: "Add plant", icon: Leaf },
  { label: "Upload photo", icon: Images },
  { label: "Ask Eve", icon: WandSparkles },
];
