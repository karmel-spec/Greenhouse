"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  PackagePlus,
  Plus,
  Search,
  Send,
  Sparkles,
  Sprout,
  SunMedium,
  Upload,
  Wind,
  X,
} from "lucide-react";
import {
  apiPlaceholders,
  apothecaryHave,
  apothecaryWishlist,
  evePrompts,
  learningModules,
  magicActions,
  microgreenTrays,
  navItems,
  plants,
  quoteTopics,
  reminderTypes,
  SectionKey,
  styleModes,
  tasks,
  uploadReadyFields,
  wishlistItems,
  zones,
} from "@/lib/mock-data";
import { SeedVaultBrowser } from "@/components/SeedVaultBrowser";

type OutdoorWeather = {
  ok: boolean;
  temperatureF?: number;
  feelsLikeF?: number;
  humidity?: number;
  windMph?: number;
  condition?: string;
};

type GreenhouseReading = {
  ok: boolean;
  configured?: boolean;
  online?: boolean;
  temperatureF?: number | null;
  humidity?: number | null;
  deviceName?: string;
  message?: string;
};

type Environment = {
  outdoor: OutdoorWeather | null;
  greenhouse: GreenhouseReading | null;
};

function useEnvironment(): Environment {
  const [env, setEnv] = useState<Environment>({ outdoor: null, greenhouse: null });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/environment");
        const data = await response.json();
        if (!cancelled) {
          setEnv({ outdoor: data.outdoor ?? null, greenhouse: data.greenhouse ?? null });
        }
      } catch {
        // keep placeholders; next poll may succeed
      }
    };

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return env;
}

// Client-only clock so the server render never disagrees with the browser.
function useNow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

type GardenTask = {
  id: string;
  title: string;
  time: string;
  kind: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
};

function useTasks() {
  const [tasks, setTasks] = useState<GardenTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/tasks")
      .then((response) => response.json())
      .then((data) => setTasks(Array.isArray(data.tasks) ? data.tasks : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const toggle = async (task: GardenTask) => {
    setTasks((current) =>
      current.map((entry) => (entry.id === task.id ? { ...entry, done: !entry.done } : entry)),
    );
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, done: !task.done }),
      });
    } catch {
      setTasks((current) =>
        current.map((entry) => (entry.id === task.id ? { ...entry, done: task.done } : entry)),
      );
    }
  };

  const add = async (title: string) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    if (Array.isArray(data.tasks)) setTasks(data.tasks);
  };

  const remove = async (id: string) => {
    setTasks((current) => current.filter((entry) => entry.id !== id));
    await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  return { tasks, loaded, toggle, add, remove };
}

type PlantPhotoRecord = {
  id: string;
  plant: string;
  zone: string;
  fileName: string;
  photo?: string;
  health: "Thriving" | "Watch" | "Needs attention";
  identificationStatus: "Needs ID" | "User labeled" | "Vision draft";
  confidence?: number;
  candidates?: string[];
  source?: string;
  signal: string;
  water: string;
  sun: string;
  pruning: string;
  recommendation: string;
  recordedAt: string;
  savedToLibrary?: boolean;
};

export default function Home() {
  const [active, setActive] = useState<SectionKey>("today");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlistFocus, setWishlistFocus] = useState<string | null>(null);
  const env = useEnvironment();
  const current = useMemo(() => navItems.find((item) => item.key === active), [active]);

  const chooseSection = (key: SectionKey) => {
    setActive(key);
    setDrawerOpen(false);
    if (key !== "wishlist") setWishlistFocus(null);
  };

  const openWishlist = (itemName: string) => {
    setWishlistFocus(itemName);
    setActive("wishlist");
    setDrawerOpen(false);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <NavList active={active} onSelect={chooseSection} />
        <EveMini />
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Karmel's Greenhouse Growth Operating System</p>
            <h1>{active === "today" ? "Today in the Garden" : current?.label}</h1>
          </div>
          <div className="weather-pill" title={env.outdoor?.condition ?? "Loading weather..."}>
            <CloudSun size={18} />
            <span>Orem, Utah</span>
            <strong>{env.outdoor?.ok ? `${env.outdoor.temperatureF}°F` : "—"}</strong>
          </div>
        </header>

        <div className="content-grid">
          <section className="main-content">{renderSection(active, env, { openWishlist, wishlistFocus })}</section>
          <EvePanel />
        </div>
      </section>

      <nav className="bottom-tabs">
        {navItems.slice(0, 5).map((item) => (
          <button className={active === item.key ? "active" : ""} key={item.key} onClick={() => chooseSection(item.key)}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
            <Brand />
            <NavList active={active} onSelect={chooseSection} />
          </div>
        </div>
      )}
    </main>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="botanical-mark">☼</div>
      <h2>Karmel's<br />Greenhouse Growth<br />Operating System</h2>
    </div>
  );
}

function NavList({ active, onSelect }: { active: SectionKey; onSelect: (key: SectionKey) => void }) {
  return (
    <div className="nav-list">
      {navItems.map((item) => (
        <button className={active === item.key ? "active" : ""} key={item.key} onClick={() => onSelect(item.key)}>
          <item.icon size={17} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function EveMini() {
  return (
    <div className="eve-mini">
      <div className="eve-avatar">E</div>
      <div>
        <strong>Eve is online</strong>
        <span>Ready to tend the day.</span>
      </div>
    </div>
  );
}

function EvePanel() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/eve/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      const reply =
        typeof data.reply === "string" && data.reply
          ? data.reply
          : data.error ?? "Hmm, I lost my train of thought. Try that again?";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I couldn't reach the garden brain just now — try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="eve-panel">
      <div className="eve-card">
        <div className="eve-header">
          <div className="eve-avatar large">E</div>
          <div>
            <p className="eyebrow">Eve Assistant</p>
            <h3>Karmel's greenhouse companion</h3>
          </div>
        </div>
        {!messages.length && (
          <p className="eve-note">
            Ask me what to do in the garden today, what to plant next, or anything growing-related.
          </p>
        )}
        {messages.length > 0 && (
          <div className="chat-thread">
            {messages.map((message, index) => (
              <div className={`chat-bubble ${message.role}`} key={index}>
                {message.content}
              </div>
            ))}
            {busy && <div className="chat-bubble assistant typing">Eve is thinking...</div>}
            <div ref={threadEndRef} />
          </div>
        )}
        <div className="prompt-list">
          {evePrompts.slice(0, messages.length ? 2 : 5).map((prompt) => (
            <button key={prompt} onClick={() => send(prompt)} disabled={busy}>
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="chat-box"
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Eve anything..."
            disabled={busy}
          />
          <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}

type SectionNav = {
  openWishlist: (itemName: string) => void;
  wishlistFocus: string | null;
};

function renderSection(active: SectionKey, env: Environment, nav: SectionNav) {
  switch (active) {
    case "today":
      return <TodaySection env={env} />;
    case "operations":
      return <OperationsSection />;
    case "microgreens":
      return <MicrogreensSection env={env} />;
    case "apothecary":
      return <ApothecarySection onOpenWishlist={nav.openWishlist} />;
    case "plants":
      return <PlantLibrary />;
    case "zones":
      return <ZonesSection />;
    case "seeds":
      return <SeedLibrary />;
    case "seed-vault":
      return <SeedVaultRedirect />;
    case "saving":
      return <SeedSaving />;
    case "wishlist":
      return <Wishlist focus={nav.wishlistFocus} />;
    case "propagation":
      return <Propagation />;
    case "map":
      return <GardenMap />;
    case "quotes":
      return <Quotes />;
    case "learning":
      return <Learning />;
    case "reminders":
      return <Reminders />;
    case "photos":
      return <Photos />;
    case "landscape":
      return <Landscape />;
    case "eve":
      return <EveHome />;
    default:
      return <TodaySection env={env} />;
  }
}

function TodaySection({ env }: { env: Environment }) {
  const now = useNow();
  const { tasks, loaded, toggle, add, remove } = useTasks();
  const [newTask, setNewTask] = useState("");

  const hour = now?.getHours() ?? 9;
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  const greenhouse = env.greenhouse;
  const insideTemp =
    greenhouse?.ok && greenhouse.temperatureF != null ? `${greenhouse.temperatureF}°F` : "—";
  const insideHumidity =
    greenhouse?.ok && greenhouse.humidity != null ? `${greenhouse.humidity}%` : "—";
  const outsideTemp = env.outdoor?.ok ? `${env.outdoor.temperatureF}°F` : "—";

  const sensorNote = !greenhouse
    ? "Checking the greenhouse sensor..."
    : greenhouse.ok
      ? `Live from ${greenhouse.deviceName ?? "your Govee sensor"}${greenhouse.online === false ? " (last known reading — sensor offline)" : ""}`
      : greenhouse.configured
        ? greenhouse.message ?? "Couldn't reach the Govee sensor."
        : "Connect your Govee thermometer: add GOVEE_API_KEY to .env.local for live inside readings.";

  const submitTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setNewTask("");
    await add(title);
  };

  return (
    <div className="section-stack">
      <div className="hero-journal">
        <div>
          <p className="script">{greeting}, Karmel</p>
          <div className="day-meta">
            <span>{dateLabel}</span>
            <span>Orem, Utah</span>
            <span>{env.outdoor?.ok ? env.outdoor.condition : "Checking the sky..."}</span>
          </div>
        </div>
        <SunMedium className="sun-icon" size={34} />
      </div>

      <div className="dashboard-grid">
        <JournalCard title="Today's Garden Plan" className="task-card">
          {tasks.map((task) => (
            <div className={`task-row ${task.done ? "done" : ""}`} key={task.id}>
              <button
                className={`task-check ${task.done ? "checked" : ""}`}
                onClick={() => toggle(task)}
                aria-label={task.done ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
              >
                {task.done ? <CheckCircle2 size={15} /> : <span className="task-dot" />}
              </button>
              <span>{task.title}</span>
              <span className="task-meta">
                <time>{task.time}</time>
                <button className="task-delete" onClick={() => remove(task.id)} aria-label={`Delete ${task.title}`}>
                  <X size={13} />
                </button>
              </span>
            </div>
          ))}
          {loaded && !tasks.length && <p className="empty-note">Nothing planned yet — add your first task below.</p>}
          <form className="task-add" onSubmit={submitTask}>
            <input
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Add a task..."
            />
            <button type="submit" aria-label="Add task"><Plus size={15} /></button>
          </form>
        </JournalCard>

        <JournalCard title="Greenhouse Snapshot" className="wide-card">
          <div className="greenhouse-scene">
            <div className="scene-window" />
            <div className="scene-benches" />
            <div className="scene-plants" />
            <div className="metric-strip">
              <Metric value={insideTemp} label="Inside Temp" />
              <Metric value={insideHumidity} label="Inside Humidity" />
              <Metric value={outsideTemp} label="Outside" />
            </div>
          </div>
          <p className="sensor-note">{sensorNote}</p>
        </JournalCard>

        <JournalCard title="Eve's Daily Guidance">
          <Guidance item="The microgreens are ready for their first harvest in 2 days." />
          <Guidance item="Your basil cuttings are rooting well." />
          <Guidance item="Consider adding more herbs to your tea garden this month." />
          <Guidance item="Rotate trays after lunch for even light." />
        </JournalCard>

        <JournalCard title="Beginner Lesson">
          <div className="lesson-card">
            <Sprout size={42} />
            <div>
              <h3>How to transplant seedlings</h3>
              <p>Gentle steps for roots, timing, and aftercare.</p>
              <button className="soft-button">Start Lesson</button>
            </div>
          </div>
        </JournalCard>

        <JournalCard title="Plant of the Day">
          <div className="plant-feature">
            <div>
              <h3>Lavender</h3>
              <em>Lavandula angustifolia</em>
              <p>Calming, fragrant, pollinator-friendly, and perfect for the apothecary border.</p>
            </div>
            <div className="pressed-plant" />
          </div>
        </JournalCard>

        <JournalCard title="Garden Zones at a Glance">
          {[
            "Greenhouse",
            "Apothecary Garden",
            "Edible Landscape",
            "Flower Beds",
            "House Plants",
            "Herb Garden",
          ]
            .map((name) => zones.find((zone) => zone.name === name))
            .filter((zone): zone is (typeof zones)[number] => !!zone)
            .map((zone) => (
              <div className="zone-line" key={zone.name}>
                <span>{zone.name}</span>
                <strong>{zone.plants}</strong>
              </div>
            ))}
        </JournalCard>

        <JournalCard title="Today's Inspiration" className="quote-card">
          <p>"He that watereth shall be watered also himself."</p>
          <span>Proverbs 11:25</span>
        </JournalCard>

        <JournalCard title="Quick Add">
          <div className="quick-actions">
            {magicActions.map((action) => (
              <button key={action.label}>
                <action.icon size={17} />
                {action.label}
              </button>
            ))}
          </div>
        </JournalCard>
      </div>
    </div>
  );
}

function OperationsSection() {
  return (
    <div className="command-mode">
      <SectionIntro title="Garden Operations Center" subtitle="Real-time overview of tasks, reminders, zone health, and Eve's project-management recommendations." />
      <div className="stat-grid">
        {[
          ["28", "Tasks today"],
          ["12", "Needs water"],
          ["7", "Trays active"],
          ["15", "Propagations"],
          ["82", "Plants total"],
        ].map(([value, label]) => <MetricCard key={label} value={value} label={label} />)}
      </div>
      <div className="two-col">
        <DarkPanel title="Task Priorities">
          {tasks.slice(0, 5).map((task) => <PriorityRow key={task.title} task={task.title} priority={task.priority} />)}
        </DarkPanel>
        <DarkPanel title="Zone Health Overview">
          <div className="map-grid">{zones.slice(0, 9).map((zone) => <span key={zone.name}>{zone.name.split(" ")[0]}</span>)}</div>
        </DarkPanel>
      </div>
      <DarkPanel title="Eve's Recommendation">
        <p>Great job staying consistent. Start heat-loving herbs this week: basil, oregano, thyme, and rosemary.</p>
      </DarkPanel>
    </div>
  );
}

type Tray = {
  id: string;
  name: string;
  startedAt: string;
  harvestDays: number;
  status: "active" | "harvested";
  harvestedAt?: string;
};

const TRAY_PRESETS: { name: string; days: number }[] = [
  { name: "Radish", days: 8 },
  { name: "Arugula", days: 9 },
  { name: "Broccoli", days: 10 },
  { name: "Kale", days: 10 },
  { name: "Mizuna", days: 10 },
  { name: "Pea Shoots", days: 12 },
  { name: "Sunflower", days: 12 },
  { name: "Basil", days: 18 },
];

function trayStage(progress: number) {
  if (progress < 0.1) return "Soak";
  if (progress < 0.28) return "Germinate";
  if (progress < 0.45) return "Blackout";
  if (progress < 0.65) return "Light";
  if (progress < 1) return "Grow";
  return "Harvest";
}

function MicrogreensSection({ env }: { env: Environment }) {
  const [trays, setTrays] = useState<Tray[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState(TRAY_PRESETS[0].name);
  const [newDays, setNewDays] = useState(String(TRAY_PRESETS[0].days));

  useEffect(() => {
    fetch("/api/trays")
      .then((response) => response.json())
      .then((data) => setTrays(Array.isArray(data.trays) ? data.trays : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const active = trays.filter((tray) => tray.status === "active");
  const harvested = trays.filter((tray) => tray.status === "harvested");

  const trayMath = (tray: Tray) => {
    const days = Math.max(0, (Date.now() - Date.parse(tray.startedAt)) / 86_400_000);
    const progress = Math.min(1, days / tray.harvestDays);
    const remaining = Math.ceil(tray.harvestDays - days);
    return { days: Math.floor(days), progress, remaining, stage: trayStage(progress) };
  };

  const harvestingSoon = active.filter((tray) => trayMath(tray).remaining <= 2).length;

  const addTray = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/trays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() || "Mystery greens", harvestDays: Number(newDays) || 10 }),
    }).catch(() => null);
    const data = await response?.json();
    if (data && Array.isArray(data.trays)) setTrays(data.trays);
    setShowForm(false);
  };

  const markHarvested = async (id: string) => {
    setTrays((current) =>
      current.map((tray) =>
        tray.id === id ? { ...tray, status: "harvested" as const, harvestedAt: new Date().toISOString() } : tray,
      ),
    );
    await fetch("/api/trays", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "harvested" }),
    }).catch(() => {});
  };

  const removeTray = async (id: string) => {
    setTrays((current) => current.filter((tray) => tray.id !== id));
    await fetch(`/api/trays?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const pickPreset = (name: string) => {
    setNewName(name);
    const preset = TRAY_PRESETS.find((entry) => entry.name === name);
    if (preset) setNewDays(String(preset.days));
  };

  const greenhouse = env.greenhouse;

  return (
    <div className="lab-mode">
      <SectionIntro title="Microgreens Studio" subtitle="Live tray tracking: start a tray, watch its countdown, harvest, repeat." />
      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={16} /> New Tray
        </button>
      </div>

      {showForm && (
        <form className="tray-form" onSubmit={addTray}>
          <label>
            What's growing?
            <select value={TRAY_PRESETS.some((preset) => preset.name === newName) ? newName : "Custom"} onChange={(event) => pickPreset(event.target.value)}>
              {TRAY_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>{preset.name} (~{preset.days} days)</option>
              ))}
              <option value="Custom">Custom...</option>
            </select>
          </label>
          <label>
            Tray name
            <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Broccoli #2" />
          </label>
          <label>
            Days to harvest
            <input value={newDays} onChange={(event) => setNewDays(event.target.value.replace(/\D/g, ""))} inputMode="numeric" />
          </label>
          <button className="primary-button" type="submit">Start tray</button>
        </form>
      )}

      <div className="stat-grid">
        <MetricCard value={String(active.length)} label="Active trays" />
        <MetricCard value={String(harvestingSoon)} label="Harvesting soon" />
        <MetricCard value={String(harvested.length)} label="Harvested" />
        <MetricCard value={active.length ? trayStage(Math.min(...active.map((tray) => trayMath(tray).progress))) : "—"} label="Youngest stage" />
      </div>

      {loaded && !active.length && (
        <p className="empty-note lab-note">No live trays yet — tap "New Tray" to start your first one. It'll count down to harvest day automatically.</p>
      )}

      <div className="tray-table">
        {active.map((tray) => {
          const math = trayMath(tray);
          return (
            <div className="tray-row" key={tray.id}>
              <div className="tray-thumb" />
              <strong>{tray.name}</strong>
              <span>{math.stage}</span>
              <span>Day {math.days} of {tray.harvestDays}</span>
              <span>{math.remaining <= 0 ? "Ready! 🎉" : `${math.remaining}d to go`}</span>
              <div className="progress"><i style={{ width: `${Math.round(math.progress * 100)}%` }} /></div>
              <span className="tray-actions">
                <button className="tray-btn harvest" onClick={() => markHarvested(tray.id)} title="Mark harvested">
                  <CheckCircle2 size={15} />
                </button>
                <button className="tray-btn" onClick={() => removeTray(tray.id)} title="Delete tray">
                  <X size={15} />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <div className="timeline">
        {["Soak", "Germinate", "Blackout", "Light", "Grow", "Harvest"].map((step) => <span key={step}>{step}</span>)}
      </div>

      <div className="three-col">
        <LabCondition
          icon={<Droplets />}
          value={greenhouse?.ok && greenhouse.temperatureF != null ? `${greenhouse.temperatureF}°F` : "—"}
          label="Greenhouse Temp"
        />
        <LabCondition
          icon={<Wind />}
          value={greenhouse?.ok && greenhouse.humidity != null ? `${greenhouse.humidity}%` : "—"}
          label="Humidity"
        />
        <LabCondition
          icon={<CheckCircle2 />}
          value={greenhouse?.ok ? "Live" : "Add Govee key"}
          label="Sensor"
        />
      </div>

      {harvested.length > 0 && (
        <div className="harvest-log">
          <h3 className="apothecary-subhead">Harvest log</h3>
          {harvested.slice(-5).reverse().map((tray) => (
            <p key={tray.id}>
              ✅ {tray.name} — harvested {tray.harvestedAt ? new Date(tray.harvestedAt).toLocaleDateString() : ""}
              <button className="tray-btn" onClick={() => removeTray(tray.id)} title="Remove from log"><X size={13} /></button>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ApothecarySection({ onOpenWishlist }: { onOpenWishlist: (itemName: string) => void }) {
  return (
    <div className="apothecary-mode">
      <SectionIntro title="Apothecary Garden" subtitle="Grow medicine. Grow wellness. Grow light." />

      <h3 className="apothecary-subhead">In your garden & seed vault now</h3>
      <div className="herb-grid">
        {apothecaryHave.map((herb) => (
          <div className="herb-card" key={herb.name}>
            <div className="pressed-plant small" />
            <h3>{herb.name}</h3>
            <p className="herb-source">{herb.source}</p>
            <p>Uses: {herb.uses}</p>
          </div>
        ))}
      </div>

      <h3 className="apothecary-subhead">Not yet growing — on the wishlist</h3>
      <div className="wishlist-chips">
        {apothecaryWishlist.map((herb) => (
          <button className="wishlist-chip" key={herb} onClick={() => onOpenWishlist(herb)}>
            {herb} <ChevronRight size={13} />
          </button>
        ))}
      </div>
      <p className="apothecary-note">
        Tap any herb to open its wishlist card — what it's for, price, and priority.
      </p>

      <JournalCard title="Herb Spotlight">
        <h3>Lavender</h3>
        <p>Best harvested in the morning after dew dries. Dry bundles in shade with good airflow.</p>
      </JournalCard>
    </div>
  );
}

type LibraryPlant = {
  id: string;
  name: string;
  variety?: string;
  zone: string;
  health: string;
  photo?: string;
  notes?: string;
  addedAt: string;
};

function PlantLibrary() {
  const [libraryPlants, setLibraryPlants] = useState<LibraryPlant[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/plants")
      .then((response) => response.json())
      .then((data) => setLibraryPlants(Array.isArray(data.plants) ? data.plants : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const removePlant = async (id: string) => {
    setLibraryPlants((current) => current.filter((plant) => plant.id !== id));
    await fetch(`/api/plants?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="section-stack">
      <SectionIntro
        title="Plant Library"
        subtitle="Your real plants — populated from Photo Journal uploads, with photo, zone, and health for each one."
      />
      {loaded && !libraryPlants.length && (
        <div className="empty-library">
          <Camera size={30} />
          <h3>No plants in the library yet</h3>
          <p>
            Open <strong>Photo Journal</strong>, upload photos of each plant (greenhouse, garden, house, and
            yard), give each one a name and zone, then tap <strong>Add to Plant Library</strong>. Every plant
            you save shows up here with its photo and health status — real data, not the sample list.
          </p>
        </div>
      )}
      <div className="plant-grid">
        {libraryPlants.map((plant) => (
          <article className="plant-card" key={plant.id}>
            {plant.photo ? (
              <img src={plant.photo} alt={plant.name} />
            ) : (
              <div className="plant-photo-placeholder"><Leaf size={26} /></div>
            )}
            <div className="plant-card-body">
              <h3>{plant.name}{plant.variety ? ` — ${plant.variety}` : ""}</h3>
              <p><MapPin size={13} /> {plant.zone}</p>
              <span className={`health-pill ${plant.health.toLowerCase().replace(" ", "-")}`}>{plant.health}</span>
            </div>
            <button className="plant-remove" onClick={() => removePlant(plant.id)} aria-label={`Remove ${plant.name}`}>
              <X size={14} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ZonesSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [zonePlants, setZonePlants] = useState<{ id: string; name: string; health: string; photo?: string; fromJournal?: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoaded(false);
    const load = async () => {
      try {
        const [plantsData, journalData] = await Promise.all([
          (await fetch("/api/plants")).json(),
          (await fetch("/api/journal")).json(),
        ]);
        const library = (Array.isArray(plantsData.plants) ? plantsData.plants : []).filter(
          (plant: LibraryPlant) => plant.zone === selected,
        );
        const seen = new Set(library.map((plant: LibraryPlant) => plant.name.toLowerCase()));
        const fromJournal = (Array.isArray(journalData.entries) ? journalData.entries : [])
          .filter(
            (entry: PlantPhotoRecord) =>
              entry.zone === selected &&
              entry.plant !== "Unidentified plant" &&
              !seen.has(entry.plant.toLowerCase()),
          )
          .map((entry: PlantPhotoRecord) => ({
            id: entry.id,
            name: entry.plant,
            health: entry.health,
            photo: entry.photo,
            fromJournal: true,
          }));
        setZonePlants([...library, ...fromJournal]);
      } catch {
        setZonePlants([]);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [selected]);

  const zone = zones.find((entry) => entry.name === selected);

  if (selected && zone) {
    const zoneWishlist = wishlistItems.filter((item) => item.category === selected);
    return (
      <div className="section-stack">
        <button className="text-link" onClick={() => setSelected(null)}>← All garden zones</button>
        <SectionIntro title={zone.name} subtitle={`Mood: ${zone.mood} • Status: ${zone.status}`} />

        <h3 className="apothecary-subhead">Plants in this zone</h3>
        {!loaded && <p className="empty-note">Checking your plant records...</p>}
        {loaded && !zonePlants.length && (
          <p className="empty-note">
            No plants recorded here yet. Upload photos in the Photo Journal and set their zone to
            "{zone.name}" — they'll show up here automatically.
          </p>
        )}
        <div className="plant-grid">
          {zonePlants.map((plant) => (
            <article className="plant-card" key={plant.id}>
              {plant.photo ? (
                <img src={plant.photo} alt={plant.name} />
              ) : (
                <div className="plant-photo-placeholder"><Leaf size={26} /></div>
              )}
              <div className="plant-card-body">
                <h3>{plant.name}</h3>
                <p>{plant.fromJournal ? "From Photo Journal" : "Plant Library"}</p>
                <span className={`health-pill ${plant.health.toLowerCase().replace(" ", "-")}`}>{plant.health}</span>
              </div>
            </article>
          ))}
        </div>

        <h3 className="apothecary-subhead">Wishlist for this zone</h3>
        {zoneWishlist.length ? (
          <div className="wishlist-grid">
            {zoneWishlist.map((item) => (
              <article className="wish-card" key={item.name}>
                <header>
                  <h4>{item.name}</h4>
                  <span className={`prop-badge ${item.priority === "High" ? "ready" : item.priority === "Medium" ? "soon" : "wait"}`}>
                    {item.priority}
                  </span>
                </header>
                {item.note && <p>{item.note}</p>}
                <footer>{item.price}</footer>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-note">Nothing on the wishlist for this zone yet — add ideas from the Wishlist section.</p>
        )}
      </div>
    );
  }

  return (
    <div className="section-stack">
      <SectionIntro title="Garden Zones" subtitle="Tap a zone to see the plants recorded in it and its wishlist." />
      <div className="collection-grid">
        {zones.map((entry) => (
          <button className="collection-card zone-card" key={entry.name} onClick={() => setSelected(entry.name)}>
            <Leaf size={18} />
            <span>{entry.name} • {entry.mood} • {entry.status}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SeedLibrary() {
  return (
    <div className="section-stack">
      <SectionIntro
        title="Seed Packet Library"
        subtitle="The complete seed vault — every packet with search, filters, Utah planting windows, and growing guides."
      />
      <SeedVaultBrowser />
    </div>
  );
}

function SeedSaving() {
  return (
    <div className="section-stack">
      <SectionIntro title="Seed Saving & Preserving" subtitle="Beginner-friendly guides for harvesting, drying, cleaning, labeling, testing, and storing seeds." />
      <div className="guide-steps">
        {["Select plants", "Let mature", "Harvest seeds", "Dry safely", "Clean seeds", "Store seeds"].map((step, index) => (
          <div key={step}><strong>{index + 1}</strong><span>{step}</span></div>
        ))}
      </div>
      <div className="table-card">
        {["Tomato Brandywine • 92% germination • Excellent producer", "Lettuce Buttercrunch • 95% germination • Great heat tolerance", "Zinnia California Mix • 85% germination • Beautiful mix"].map((row) => <p key={row}>{row}</p>)}
      </div>
    </div>
  );
}

function Wishlist({ focus }: { focus: string | null }) {
  const highlightRef = useRef<HTMLElement | null>(null);

  const isFocused = (name: string) =>
    !!focus && name.toLowerCase().includes(focus.toLowerCase());

  useEffect(() => {
    if (focus && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focus]);

  const categories = Array.from(new Set(wishlistItems.map((item) => item.category)));

  return (
    <div className="section-stack">
      <SectionIntro
        title="Wishlist & Garden Dreams Board"
        subtitle="Everything on the someday list — what it's for, what it costs, and how much you want it."
      />
      {categories.map((category) => (
        <div key={category}>
          <h3 className="apothecary-subhead">{category}</h3>
          <div className="wishlist-grid">
            {wishlistItems
              .filter((item) => item.category === category)
              .map((item) => {
                const focused = isFocused(item.name);
                return (
                  <article
                    className={`wish-card ${focused ? "focused" : ""}`}
                    key={item.name}
                    ref={focused ? (node) => { highlightRef.current = node; } : undefined}
                  >
                    <header>
                      <h4>{item.name}</h4>
                      <span className={`prop-badge ${item.priority === "High" ? "ready" : item.priority === "Medium" ? "soon" : "wait"}`}>
                        {item.priority}
                      </span>
                    </header>
                    {item.note && <p>{item.note}</p>}
                    <footer>{item.price}</footer>
                  </article>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

type PropagationItem = {
  plant: string;
  zone: string;
  readiness: "ready" | "soon" | "wait";
  readinessReason: string;
  method: string;
  steps: string[];
};

const READINESS_LABELS: Record<PropagationItem["readiness"], string> = {
  ready: "Ready now",
  soon: "Almost ready",
  wait: "Wait",
};

function Propagation() {
  const [items, setItems] = useState<PropagationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [usingStarters, setUsingStarters] = useState(false);
  const [generatedBy, setGeneratedBy] = useState("");
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/propagation")
      .then((response) => response.json())
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setUsingStarters(data.usingStarters === true);
        setGeneratedBy(data.generatedBy ?? "");
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const addToPlan = async (item: PropagationItem) => {
    setAddedTasks((current) => new Set(current).add(item.plant));
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Propagate ${item.plant} — ${item.method}`,
        kind: "Propagation",
        priority: item.readiness === "ready" ? "High" : "Medium",
      }),
    }).catch(() => {});
  };

  return (
    <div className="section-stack">
      <SectionIntro
        title="Propagation Lab"
        subtitle="A to-do list built from your actual plants: what's ready to propagate now, what needs time, and exactly how to do each one."
      />
      {usingStarters && loaded && (
        <p className="apothecary-note">
          Showing your starter plants for now — as you add plants through the Photo Journal, this plan
          rebuilds itself around what you actually grow.
          {generatedBy === "knowledge-base" ? " (Add ANTHROPIC_API_KEY for Eve to tailor readiness to each photo.)" : ""}
        </p>
      )}
      {!loaded && <p className="empty-note">Building your propagation plan...</p>}
      <div className="propagation-list">
        {items.map((item) => (
          <article className={`prop-card ${item.readiness}`} key={item.plant}>
            <header>
              <div>
                <h3>{item.plant}</h3>
                <p><MapPin size={13} /> {item.zone} • {item.method}</p>
              </div>
              <span className={`prop-badge ${item.readiness}`}>{READINESS_LABELS[item.readiness]}</span>
            </header>
            <p className="prop-reason">{item.readinessReason}</p>
            <ol>
              {item.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {item.readiness !== "wait" && (
              <button
                className="soft-button"
                disabled={addedTasks.has(item.plant)}
                onClick={() => addToPlan(item)}
              >
                {addedTasks.has(item.plant) ? (
                  <>Added to Today's plan <CheckCircle2 size={14} /></>
                ) : (
                  <>Add to Today's plan <Plus size={14} /></>
                )}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

// 128 Westview Circle, Orem, UT 84058 (US Census geocoder)
const PROPERTY = { lat: 40.262944, lon: -111.698321, zoom: 19 };

function propertyTiles() {
  const n = 2 ** PROPERTY.zoom;
  const centerX = Math.floor(((PROPERTY.lon + 180) / 360) * n);
  const latRad = (PROPERTY.lat * Math.PI) / 180;
  const centerY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  const rows: { x: number; y: number }[][] = [];
  for (let dy = -1; dy <= 1; dy++) {
    const row: { x: number; y: number }[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      row.push({ x: centerX + dx, y: centerY + dy });
    }
    rows.push(row);
  }
  return rows;
}

function GardenMap() {
  const tiles = propertyTiles();

  return (
    <div className="section-stack">
      <SectionIntro
        title="Aerial Garden Map"
        subtitle="Satellite view of 128 Westview Circle, Orem — with quick links to the live Google Earth and Google Maps views."
      />
      <figure className="aerial-figure">
        <div className="aerial-grid">
          {tiles.flat().map((tile) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`/api/aerial?z=${PROPERTY.zoom}&x=${tile.x}&y=${tile.y}`}
              alt=""
              loading="lazy"
            />
          ))}
        </div>
        <figcaption>
          <span>128 Westview Circle, Orem, Utah — roughly a 175 m view. Imagery: Esri World Imagery.</span>
          <span className="aerial-links">
            <a
              href={`https://earth.google.com/web/search/128+Westview+Circle,+Orem,+UT`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Earth →
            </a>
            <a
              href={`https://www.google.com/maps/@${PROPERTY.lat},${PROPERTY.lon},150m/data=!3m1!1e3`}
              target="_blank"
              rel="noreferrer"
            >
              Google Maps satellite →
            </a>
          </span>
        </figcaption>
      </figure>
      <div className="map-canvas">{zones.slice(0, 12).map((zone) => <span key={zone.name}>{zone.name}</span>)}</div>
    </div>
  );
}

function Quotes() {
  return <CardCollection title="Scripture & Quote Library" subtitle="Attach light, growth, roots, harvest, stewardship, and renewal quotes to plants, zones, journal entries, lessons, and daily plans." items={quoteTopics} />;
}

function Learning() {
  return <CardCollection title="Beginner Learning Center" subtitle="Short, encouraging, task-connected garden lessons for Karmel's real work." items={learningModules} />;
}

function Reminders() {
  return (
    <div className="section-stack">
      <SectionIntro title="Text Reminder Architecture" subtitle="Placeholder reminder service designed for Twilio or another SMS provider later." />
      <CardCollection title="Reminder Types" subtitle="Future SMS-ready scheduling triggers." items={reminderTypes} compact />
      <CardCollection title="Placeholder APIs" subtitle="Eve endpoint architecture currently returns mock responses." items={[...apiPlaceholders, "/api/reminders"]} compact />
    </div>
  );
}

function Photos() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<PlantPhotoRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchNote, setBatchNote] = useState("Upload photos of every plant — greenhouse, garden, house, and yard. Photos now save permanently to your garden data.");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/journal");
        const data = await response.json();
        let entries: PlantPhotoRecord[] = Array.isArray(data.entries) ? data.entries : [];

        // One-time rescue of the old browser-only history (its photos were
        // never saved to disk, so those entries migrate without images).
        const legacy = window.localStorage.getItem("karmels-garden-photo-history");
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed) && parsed.length && !entries.length) {
              const migration = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entries: parsed }),
              });
              const migrated = await migration.json();
              if (Array.isArray(migrated.entries)) entries = migrated.entries;
            }
          } catch {
            // corrupt legacy data — drop it
          }
          window.localStorage.removeItem("karmels-garden-photo-history");
        }

        setRecords(entries);
        if (entries.length) {
          setBatchNote("Your saved plant history is loaded. Add today's batch whenever you're ready.");
        }
      } catch {
        setBatchNote("Couldn't load your saved history — check that the app is running, then reopen this tab.");
      }
    };
    load();
  }, []);

  const analyzePhotos = async (files: FileList | null) => {
    if (!files?.length) return;

    const uploadedFiles = Array.from(files);
    setIsAnalyzing(true);

    // 1. Save every photo + draft record to the server first, so nothing is
    //    lost even if analysis fails or the page closes mid-batch.
    const saved: { entry: PlantPhotoRecord; dataUrl: string }[] = [];
    for (let index = 0; index < uploadedFiles.length; index++) {
      const file = uploadedFiles[index];
      setBatchNote(`Saving photo ${index + 1} of ${uploadedFiles.length} (${file.name})...`);
      try {
        const dataUrl = await fileToResizedDataUrl(file);
        const response = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entry: buildDraftEntry(file.name), photoDataUrl: dataUrl }),
        });
        const data = await response.json();
        if (response.ok && data.entry) {
          saved.push({ entry: data.entry, dataUrl });
          setRecords((current) => [data.entry, ...current]);
        }
      } catch {
        // keep going with the remaining photos
      }
    }

    if (!saved.length) {
      setBatchNote("Those photos couldn't be saved — try again in a moment.");
      setIsAnalyzing(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 2. Run vision diagnosis in small batches so large uploads don't overload
    //    a single request.
    const CHUNK_SIZE = 6;
    let analyzedForReal = false;

    for (let start = 0; start < saved.length; start += CHUNK_SIZE) {
      const chunk = saved.slice(start, start + CHUNK_SIZE);
      setBatchNote(
        `Analyzing photos ${start + 1}–${Math.min(start + CHUNK_SIZE, saved.length)} of ${saved.length}...`,
      );

      try {
        const response = await fetch("/api/eve/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: chunk.map(({ entry, dataUrl }) => ({ fileName: entry.fileName, dataUrl })),
            context: {
              location: "Orem, Utah",
              date: new Date().toISOString(),
              zones: zones.map((zone) => zone.name),
              priorCorrections: records
                .filter((record) => record.identificationStatus === "User labeled")
                .slice(0, 25)
                .map((record) => ({ plant: record.plant, zone: record.zone, fileName: record.fileName })),
            },
          }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Diagnosis failed");
        if (result.mode === "configured") analyzedForReal = true;

        const diagnoses = Array.isArray(result.diagnoses) ? result.diagnoses : [];
        chunk.forEach(({ entry }, index) => {
          const updates = diagnosisToUpdates(diagnoses[index], entry, result.provider);
          if (!updates) return;
          setRecords((current) =>
            current.map((record) => (record.id === entry.id ? { ...record, ...updates } : record)),
          );
          fetch("/api/journal", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: entry.id, updates }),
          }).catch(() => {});
        });
      } catch {
        // drafts for this chunk stay as-is
      }
    }

    setBatchNote(
      analyzedForReal
        ? `${saved.length} photos saved and analyzed. Review the candidate names, then add each plant to the Plant Library.`
        : `${saved.length} photos saved permanently with draft notes. Add OPENAI_API_KEY to .env.local to enable real vision analysis.`,
    );
    setIsAnalyzing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const deleteRecord = async (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
    await fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const saveToLibrary = async (record: PlantPhotoRecord) => {
    if (record.plant === "Unidentified plant") {
      setBatchNote(`Name the plant in "${record.fileName}" first (use the Plant name field), then add it to the library.`);
      return;
    }

    try {
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: record.plant,
          zone: record.zone,
          health: record.health,
          notes: record.recommendation,
          photoSource: record.photo,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setBatchNote(data.error ?? "Couldn't save that plant — try again.");
        return;
      }

      setRecords((current) =>
        current.map((entry) => (entry.id === record.id ? { ...entry, savedToLibrary: true } : entry)),
      );
      fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, updates: { savedToLibrary: true } }),
      }).catch(() => {});
      setBatchNote(`${record.plant} is now in the Plant Library.`);
    } catch {
      setBatchNote("Couldn't reach the plant library just now — try again in a moment.");
    }
  };

  const updateRecord = (id: string, updates: Partial<PlantPhotoRecord>) => {
    const labeled = !!(updates.plant || updates.zone);
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              ...updates,
              identificationStatus: labeled ? "User labeled" : record.identificationStatus,
            }
          : record,
      ),
    );
    fetch("/api/journal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        updates: labeled ? { ...updates, identificationStatus: "User labeled" } : updates,
      }),
    }).catch(() => {});
  };

  const counts = {
    thriving: records.filter((record) => record.health === "Thriving").length,
    watch: records.filter((record) => record.health === "Watch").length,
    attention: records.filter((record) => record.health === "Needs attention").length,
  };

  return (
    <div className="section-stack">
      <SectionIntro
        title="Daily Photo Health Check"
        subtitle="Upload a batch of garden photos, label what each photo shows, save the observation to plant history, and prepare the same flow for real Eve vision analysis."
      />

      <div className="photo-health-layout">
        <article className="batch-upload-card">
          <div>
            <p className="eyebrow">Batch Diagnosis</p>
            <h3>Today's garden photo review</h3>
            <p>{batchNote}</p>
          </div>
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => analyzePhotos(event.target.files)}
          />
          <button className="primary-button" disabled={isAnalyzing} onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> {isAnalyzing ? "Analyzing..." : "Upload photo batch"}
          </button>
          <div className="diagnosis-tags">
            <span><AlertCircle size={15} /> Plant ID required</span>
            <span><CheckCircle2 size={15} /> Draft health notes</span>
            <span><Camera size={15} /> Saved to history</span>
          </div>
        </article>

        <div className="health-summary-grid">
          <MetricCard value={String(records.length)} label="Photos logged" />
          <MetricCard value={String(counts.thriving)} label="Looking healthy" />
          <MetricCard value={String(counts.watch)} label="Watch closely" />
          <MetricCard value={String(counts.attention)} label="Needs attention" />
        </div>
      </div>

      <div className="diagnosis-board">
        {records.length ? (
          records.map((record) => (
            <article className={`diagnosis-card ${record.health.toLowerCase().replace(" ", "-")}`} key={record.id}>
              <div className="diagnosis-photo">
                {record.photo ? <img src={record.photo} alt={`${record.plant} upload`} /> : <Camera size={28} />}
              </div>
              <button className="plant-remove" onClick={() => deleteRecord(record.id)} aria-label={`Delete ${record.fileName}`}>
                <X size={14} />
              </button>
              <div className="diagnosis-body">
                <div className="diagnosis-title">
                  <div>
                    <h3>{record.plant}</h3>
                    <p><MapPin size={14} /> {record.zone}</p>
                  </div>
                  <span>{record.identificationStatus}</span>
                </div>
                <div className="candidate-row">
                  <span>{record.source ?? "local mock"}</span>
                  {typeof record.confidence === "number" && record.confidence > 0 ? <span>{Math.round(record.confidence * 100)}% confidence</span> : null}
                  {record.candidates?.length ? <span>Candidates: {record.candidates.slice(0, 3).join(", ")}</span> : null}
                </div>
                <div className="label-editor">
                  <label>
                    Plant name
                    <input
                      value={record.plant}
                      onChange={(event) => updateRecord(record.id, { plant: event.target.value || "Unidentified plant" })}
                    />
                  </label>
                  <label>
                    Zone
                    <select value={record.zone} onChange={(event) => updateRecord(record.id, { zone: event.target.value })}>
                      {["Unassigned zone", ...zones.map((zone) => zone.name)].map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Health
                    <select value={record.health} onChange={(event) => updateRecord(record.id, { health: event.target.value as PlantPhotoRecord["health"] })}>
                      {["Thriving", "Watch", "Needs attention"].map((health) => (
                        <option key={health} value={health}>{health}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="health-pill">{record.health}</p>
                <p>{record.signal}</p>
                <div className="care-grid">
                  <CareNote label="Water" value={record.water} />
                  <CareNote label="Sun" value={record.sun} />
                  <CareNote label="Pruning" value={record.pruning} />
                </div>
                <div className="history-note">
                  <strong>Saved history note</strong>
                  <span>{record.recordedAt} • {record.fileName}</span>
                  <p>{record.recommendation}</p>
                </div>
                <button
                  className="soft-button library-save"
                  disabled={record.savedToLibrary}
                  onClick={() => saveToLibrary(record)}
                >
                  {record.savedToLibrary ? (
                    <>Saved to Plant Library <CheckCircle2 size={14} /></>
                  ) : (
                    <>Add to Plant Library <PackagePlus size={14} /></>
                  )}
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="empty-history">
            <Camera size={34} />
            <h3>No daily batch yet</h3>
            <p>Use the upload button above to save photos, label the plants, and begin the plant history timeline.</p>
          </article>
        )}
      </div>

      <CardCollection
        title="Photo Library Tags"
        subtitle="These tags connect photos to plants, zones, tasks, diagnosis, and lessons learned."
        items={uploadReadyFields}
        compact
      />
    </div>
  );
}

function buildDraftEntry(fileName: string) {
  return {
    fileName,
    plant: "Unidentified plant",
    zone: "Unassigned zone",
    health: "Watch",
    identificationStatus: "Needs ID",
    confidence: 0,
    candidates: [],
    source: "local mock",
    signal: "Draft note: label the plant so Eve can compare it to the right care pattern.",
    water: "Check soil before watering; avoid guessing.",
    sun: "Confirm recent sun exposure and watch for curling, bleaching, or stretching.",
    pruning: "Remove only clearly spent leaves.",
    recommendation: "Name the plant, set its zone, then add it to the Plant Library.",
    recordedAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
  };
}

function diagnosisToUpdates(
  diagnosis: Record<string, unknown> | undefined,
  entry: PlantPhotoRecord,
  provider: string,
): Partial<PlantPhotoRecord> | null {
  if (!diagnosis) return null;

  const rawCandidates = Array.isArray(diagnosis.plant_candidates) ? diagnosis.plant_candidates : [];
  const candidates = rawCandidates
    .map((candidate: { name?: string } | string) =>
      typeof candidate === "string" ? candidate : candidate?.name,
    )
    .filter((name): name is string => !!name);
  const bestCandidate = candidates[0];
  const confidence = typeof diagnosis.confidence === "number" ? diagnosis.confidence : 0;
  const identified = !!bestCandidate && confidence >= 0.55;
  const zoneGuess = typeof diagnosis.zone_guess === "string" ? diagnosis.zone_guess : "";
  const actions = Array.isArray(diagnosis.recommended_actions) ? diagnosis.recommended_actions : null;

  return {
    plant: identified ? bestCandidate : "Unidentified plant",
    zone: zoneGuess && zones.some((zone) => zone.name === zoneGuess) ? zoneGuess : entry.zone,
    health: normalizeHealth(diagnosis.health_status, entry.health),
    identificationStatus: identified ? "Vision draft" : "Needs ID",
    confidence,
    candidates,
    source: provider === "openai" ? "openai vision" : "hermes eve",
    signal: typeof diagnosis.visual_signals === "string" ? diagnosis.visual_signals : entry.signal,
    water: typeof diagnosis.water_recommendation === "string" ? diagnosis.water_recommendation : entry.water,
    sun: typeof diagnosis.sun_recommendation === "string" ? diagnosis.sun_recommendation : entry.sun,
    pruning: typeof diagnosis.pruning_recommendation === "string" ? diagnosis.pruning_recommendation : entry.pruning,
    recommendation: actions?.length
      ? actions.join(" ")
      : typeof diagnosis.recommendation === "string"
        ? diagnosis.recommendation
        : entry.recommendation,
  };
}

// Downscale before upload: keeps storage lean and vision analysis fast.
async function fileToResizedDataUrl(file: File, maxEdge = 1600): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no canvas");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    // formats the browser can't decode (e.g. HEIC in some browsers) upload as-is
    return readFileAsDataUrl(file);
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function normalizeHealth(value: unknown, fallback: PlantPhotoRecord["health"]): PlantPhotoRecord["health"] {
  if (typeof value !== "string") return fallback;
  const normalized = value.toLowerCase();
  if (normalized.includes("thriv") || normalized.includes("healthy")) return "Thriving";
  if (normalized.includes("attention") || normalized.includes("stress") || normalized.includes("poor")) return "Needs attention";
  if (normalized.includes("watch") || normalized.includes("monitor")) return "Watch";
  return fallback;
}

function CareNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function Landscape() {
  return <CardCollection title="Edible Landscape Planner" subtitle="Plan fruit, herbs, flowers, living water moments, vines, pollinator edges, paths, and harvest rhythms." items={["Sun Garden berries", "Vineyard pathway", "Tea garden border", "Pollinator flower bands", "Herb spiral", "Shade garden greens"]} />;
}

function EveHome() {
  return (
    <div className="section-stack">
      <SectionIntro title="Eve Assistant" subtitle="Garden teacher, daily coach, project manager, sacred garden companion, diagnostician, planner, and weekly reviewer." />
      <div className="prompt-grid">{evePrompts.map((prompt) => <button key={prompt}>{prompt}</button>)}</div>
      <CardCollection title="Eve Can Help With" subtitle="Placeholder-ready assistant roles." items={["Daily plans", "Plant advice", "Seed advice", "Diagnosis from photos", "Shopping lists", "Weekly reviews", "Sacred garden reflections"]} compact />
    </div>
  );
}

function SectionIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="section-intro">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function JournalCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`journal-card ${className}`}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function Guidance({ item }: { item: string }) {
  return <p className="guidance"><Sparkles size={14} /> {item}</p>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>;
}

function DarkPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="dark-panel"><h3>{title}</h3>{children}</article>;
}

function PriorityRow({ task, priority }: { task: string; priority: string }) {
  return <p className="priority-row"><CheckCircle2 size={15} /><span>{task}</span><strong>{priority}</strong></p>;
}

function LabCondition({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="lab-condition">{icon}<strong>{value}</strong><span>{label}</span></div>;
}

function CardCollection({ title, subtitle, items, compact = false }: { title: string; subtitle: string; items: string[]; compact?: boolean }) {
  return (
    <div className="section-stack">
      <SectionIntro title={title} subtitle={subtitle} />
      <div className={compact ? "mini-card-grid" : "collection-grid"}>
        {items.map((item) => (
          <article className="collection-card" key={item}>
            <Leaf size={18} />
            <span>{item}</span>
            <ChevronRight size={16} />
          </article>
        ))}
      </div>
    </div>
  );
}

function SeedVaultRedirect() {
  return (
    <div className="section-stack">
      <SectionIntro 
        title="Seed Vault" 
        subtitle="Complete seed inventory with detailed growing guides, Utah climate recommendations, and heirloom tracking." 
      />
      <div style={{padding: "2rem", textAlign: "center", background: "#f0fdf4", borderRadius: "8px"}}>
        <p style={{marginBottom: "1rem", fontSize: "16px"}}>
          Viewing the Seed Vault in a dedicated page with advanced search and filtering...
        </p>
        <a 
          href="/seed-vault" 
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold"
          }}
        >
          Open Seed Vault →
        </a>
      </div>
    </div>
  );
}
