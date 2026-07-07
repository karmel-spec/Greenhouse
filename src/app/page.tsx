"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CloudSun,
  Droplets,
  ExternalLink,
  LayoutGrid,
  Leaf,
  LibraryBig,
  MapPin,
  Menu,
  MessageCircle,
  PackagePlus,
  Pencil,
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
  pestDatabase,
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
import { CommunityGarden } from "@/components/CommunityGarden";
import { CompostSection } from "@/components/CompostSection";
import { SunMap } from "@/components/SunMap";
import { SeedTraysSection } from "@/components/SeedTrays";
import { TodaysBouquet } from "@/components/TodaysBouquet";
import { InspirationBanner } from "@/components/InspirationBanner";
import { MICROGREENS, type Microgreen, microPhoto } from "@/lib/microgreens";
import { LANDSCAPE_PROJECTS } from "@/lib/landscape";
import { ALL_ACTIONS as ALL_BOUQUET_ACTIONS, todayKey as bouquetTodayKey, yesterdayKey as bouquetYesterdayKey } from "@/lib/bouquet";
import { BouquetArrangement } from "@/components/BouquetArrangement";
import { SeedTesting } from "@/components/SeedTesting";
import { STUDY_PLAN_BY_TOPIC } from "@/lib/study-plans";
import { PruningSection } from "@/components/PruningSection";
import { TeaGardenVision, MeditationVision, ApothecaryVision, FairyGardenVision, teaPlantSplit } from "@/components/ZoneVisions";
import { plantPhoto } from "@/lib/crop-photos";
import { plantCare, CATEGORY_ORDER, PlantCategory } from "@/lib/plant-care";
import { propagationGuide } from "@/lib/propagation";
import { Lesson, lessons, lessonOfTheDay, squareFootLesson } from "@/lib/lessons";
import { SFG_PLANTS, SFG_BY_KEY, SfgCategory, analyzeBed } from "@/lib/sfg";

function LessonReader({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  return (
    <div className="lesson-backdrop" onClick={onClose}>
      <article className="lesson-reader" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button lesson-close" onClick={onClose} aria-label="Close lesson">
          <X size={18} />
        </button>
        <p className="eyebrow">Beginner lesson • about {lesson.minutes} min</p>
        <h2>{lesson.title}</h2>
        <p className="lesson-tagline">{lesson.tagline}</p>
        <ol className="lesson-steps">
          {lesson.steps.map((step) => (
            <li key={step.heading}>
              <strong>{step.heading}</strong>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="lesson-tip"><Sparkles size={14} /> {lesson.tip}</p>
      </article>
    </div>
  );
}

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
  const [zoneFocus, setZoneFocus] = useState<string | null>(null);
  const [photosFocus, setPhotosFocus] = useState<string | null>(null);
  const env = useEnvironment();
  const current = useMemo(() => navItems.find((item) => item.key === active), [active]);

  const chooseSection = (key: SectionKey) => {
    setActive(key);
    setDrawerOpen(false);
    if (key !== "wishlist") setWishlistFocus(null);
    if (key !== "zones") setZoneFocus(null);
    if (key !== "photos") setPhotosFocus(null);
  };

  const openPhotos = (healthFilter: string | null) => {
    setPhotosFocus(healthFilter);
    setActive("photos");
    setDrawerOpen(false);
  };

  const openWishlist = (itemName: string) => {
    setWishlistFocus(itemName);
    setActive("wishlist");
    setDrawerOpen(false);
  };

  const openZone = (zoneName: string) => {
    setZoneFocus(zoneName);
    setActive("zones");
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
          <section className="main-content">
            <InspirationBanner section={active} slot="top" />
            {renderSection(active, env, { openWishlist, wishlistFocus, openSection: chooseSection, openZone, zoneFocus, openPhotos, photosFocus })}
            <InspirationBanner section={active} slot="bottom" />
          </section>
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
  const [flowers, setFlowers] = useState<string[]>([]);
  const [isYesterdays, setIsYesterdays] = useState(false);

  useEffect(() => {
    const load = () =>
      fetch("/api/bouquet")
        .then((response) => response.json())
        .then((data) => {
          const custom: { key: string; emoji: string }[] = Array.isArray(data.custom) ? data.custom : [];
          const emojiByKey = new Map<string, string>([
            ...ALL_BOUQUET_ACTIONS.map((action) => [action.key, action.emoji] as [string, string]),
            ...custom.map((action) => [action.key, action.emoji] as [string, string]),
          ]);
          // Show yesterday's finished bouquet (it doesn't rebuild hour by hour);
          // fall back to today's while the collection is brand new.
          const yesterdays: string[] = data.history?.[bouquetYesterdayKey()] ?? [];
          const todays: string[] = data.history?.[bouquetTodayKey()] ?? [];
          const chosen = yesterdays.length ? yesterdays : todays;
          setIsYesterdays(yesterdays.length > 0);
          setFlowers(chosen.map((entry) => emojiByKey.get(entry) ?? "🌸"));
        })
        .catch(() => {});
    load();
    window.addEventListener("bouquet-changed", load);
    return () => window.removeEventListener("bouquet-changed", load);
  }, []);

  return (
    <div className="brand">
      <div
        className="brand-bouquet"
        title={
          flowers.length
            ? `${isYesterdays ? "Yesterday's" : "Today's"} bouquet — ${flowers.length} flower${flowers.length === 1 ? "" : "s"}`
            : "Check off nurturing actions in Today's Bouquet and a bouquet blooms here"
        }
      >
        <BouquetArrangement flowers={flowers} width={120} showTag={false} />
      </div>
      <h2>Karmel&apos;s Greenhouse</h2>
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
  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  // Other sections (e.g. "Eve Can Help With" cards) can hand Eve a prompt.
  useEffect(() => {
    const listener = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;
      if (typeof prompt === "string" && prompt) {
        document.querySelector(".eve-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        sendRef.current(prompt);
      }
    };
    window.addEventListener("eve-ask", listener);
    return () => window.removeEventListener("eve-ask", listener);
  }, []);

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
  sendRef.current = send;

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
  openSection: (key: SectionKey) => void;
  openZone: (zoneName: string) => void;
  zoneFocus: string | null;
  openPhotos: (healthFilter: string | null) => void;
  photosFocus: string | null;
};

function renderSection(active: SectionKey, env: Environment, nav: SectionNav) {
  switch (active) {
    case "today":
      return <TodaySection env={env} nav={nav} />;
    case "bouquet":
      return <TodaysBouquet />;
    case "operations":
      return <OperationsSection nav={nav} />;
    case "seedtrays":
      return <SeedTraysSection />;
    case "seedtesting":
      return <SeedTesting />;
    case "microgreens":
      return <MicrogreensSection env={env} />;
    case "apothecary":
      return <ApothecarySection onOpenWishlist={nav.openWishlist} />;
    case "pest-management":
      return <PestManagementSection />;
    case "sfg":
      return <SquareFootPlanner />;
    case "community":
      return <CommunityGarden />;
    case "plants":
      return <PlantLibrary />;
    case "zones":
      return <ZonesSection focus={nav.zoneFocus} />;
    case "seeds":
      return <SeedLibrary />;
    case "seed-vault":
      return <SeedVaultRedirect />;
    case "saving":
      return <SeedSaving />;
    case "soil-prep":
      return <SoilPrepSection />;
    case "compost":
      return <CompostSection />;
    case "wishlist":
      return <Wishlist focus={nav.wishlistFocus} />;
    case "propagation":
      return <Propagation />;
    case "pruning":
      return <PruningSection />;
    case "map":
      return <GardenMap />;
    case "quotes":
      return <Quotes />;
    case "learning":
      return <Learning />;
    case "reminders":
      return <Reminders />;
    case "photos":
      return <Photos focus={nav.photosFocus} />;
    case "landscape":
      return <Landscape />;
    case "eve":
      return <EveHome onOpenPhotos={() => nav.openSection("photos")} />;
    default:
      return <TodaySection env={env} nav={nav} />;
  }
}

const DAILY_PLAN_PROMPT =
  "Build me a garden plan for today. Base it on my open tasks, the plants my photo diagnosis flagged as needing attention, " +
  "today's Orem weather, which seeds' planting windows are open right now, and any propagation, transplanting, or microgreens " +
  "tray-starting I could do today. Return a single prioritized list (most important first), each item one line with a short reason. " +
  "Keep it to the things I can actually do today.";

// Renders a simple subset of markdown (headings, bold, bullets) as plain React.
function PlanText({ text }: { text: string }) {
  return (
    <div className="plan-text">
      {text.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const heading = /^#{1,6}\s+/.test(trimmed);
        const bullet = /^[-*•]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed);
        const clean = trimmed
          .replace(/^#{1,6}\s+/, "")
          .replace(/^[-*•]\s+/, "")
          .replace(/^\d+[.)]\s+/, "");
        const parts = clean.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
        );
        if (heading) return <h4 key={index}>{parts}</h4>;
        if (bullet) return <p className="plan-bullet" key={index}>{parts}</p>;
        return <p key={index}>{parts}</p>;
      })}
    </div>
  );
}

function EveDailyPlan() {
  const [plan, setPlan] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const build = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/eve/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: DAILY_PLAN_PROMPT }] }),
      });
      const data = await response.json();
      if (data.reply) setPlan(data.reply);
      else setError(data.error ?? "Eve couldn't build a plan right now.");
    } catch {
      setError("Couldn't reach Eve just now — try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="eve-plan-card">
      <div className="eve-plan-head">
        <div className="eve-avatar">E</div>
        <div>
          <p className="eyebrow">Eve's Plan for Today</p>
          <h3>What should I focus on today?</h3>
        </div>
        <button className="primary-button" onClick={build} disabled={busy}>
          <Sparkles size={16} /> {busy ? "Thinking..." : plan ? "Rebuild plan" : "Build my plan"}
        </button>
      </div>
      {!plan && !busy && !error && (
        <p className="eve-plan-hint">
          Eve reads your tasks, your plants' diagnosed needs, today's Orem weather, which seeds are in their planting
          window, and your trays — then gives you a prioritized to-do list for today.
        </p>
      )}
      {busy && <p className="eve-plan-hint">Eve is reading your garden and building a prioritized plan...</p>}
      {error && <p className="eve-plan-hint error">{error}</p>}
      {plan && <PlanText text={plan} />}
    </article>
  );
}

function TodaySection({ env, nav }: { env: Environment; nav: SectionNav }) {
  const now = useNow();
  const { tasks, loaded, toggle, add, remove } = useTasks();
  const [newTask, setNewTask] = useState("");
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const todaysLesson = lessonOfTheDay(now ?? new Date(2026, 6, 1));

  const quickAction = (label: string) => {
    if (label === "Add task") {
      taskInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      taskInputRef.current?.focus();
    } else if (label === "Add plant" || label === "Upload photo") {
      nav.openSection("photos");
    } else if (label === "Ask Eve") {
      nav.openSection("eve");
    }
  };

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

      <EveDailyPlan />

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
              ref={taskInputRef}
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
              <h3>{todaysLesson.title}</h3>
              <p>{todaysLesson.tagline}</p>
              <button className="soft-button" onClick={() => setOpenLesson(todaysLesson)}>Start Lesson</button>
            </div>
          </div>
        </JournalCard>

        <JournalCard title="Plant of the Day">
          {(() => {
            const featured = [
              { name: "Lavender", botanical: "Lavandula angustifolia", blurb: "Calming, fragrant, pollinator-friendly, and perfect for the apothecary border." },
              { name: "Chamomile", botanical: "Matricaria chamomilla", blurb: "Gentle sleep-tea flowers; harvest heads in the morning as petals flatten." },
              { name: "Tomato", botanical: "Solanum lycopersicum", blurb: "Feed weekly once fruit sets; midsummer suckers make free fall plants." },
              { name: "Peppermint", botanical: "Mentha × piperita", blurb: "Cooling digestion tea; contain the roots or it will wander everywhere." },
              { name: "Basil", botanical: "Ocimum basilicum", blurb: "Pinch flower spikes to keep leaves sweet; cuttings root in a week of water." },
              { name: "Echinacea", botanical: "Echinacea purpurea", blurb: "Immune-support blooms the bees adore; leave seed heads for winter finches." },
              { name: "Calendula", botanical: "Calendula officinalis", blurb: "The skin-salve flower — the more you pick, the more it blooms." },
            ];
            const dayIndex = now
              ? Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000) % featured.length
              : 0;
            const plant = featured[dayIndex];
            const photo = plantPhoto(plant.name);
            return (
              <div className="plant-feature">
                <div>
                  <h3>{plant.name}</h3>
                  <em>{plant.botanical}</em>
                  <p>{plant.blurb}</p>
                </div>
                {photo ? <img className="plant-feature-photo" src={photo} alt={plant.name} /> : <div className="pressed-plant" />}
              </div>
            );
          })()}
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
              <button className="zone-line zone-line-button" key={zone.name} onClick={() => nav.openZone(zone.name)}>
                <span>{zone.name}</span>
                <span className="zone-line-end"><strong>{zone.plants}</strong><ChevronRight size={14} /></span>
              </button>
            ))}
          <button className="text-link" onClick={() => nav.openSection("zones")}>
            View all zones <ArrowRight size={14} />
          </button>
        </JournalCard>

        <JournalCard title="Today's Inspiration" className="quote-card">
          <p>"He that watereth shall be watered also himself."</p>
          <span>Proverbs 11:25</span>
        </JournalCard>

        <JournalCard title="Quick Add">
          <div className="quick-actions">
            {magicActions.map((action) => (
              <button key={action.label} onClick={() => quickAction(action.label)}>
                <action.icon size={17} />
                {action.label}
              </button>
            ))}
          </div>
        </JournalCard>
      </div>
      {openLesson && <LessonReader lesson={openLesson} onClose={() => setOpenLesson(null)} />}
    </div>
  );
}

function OperationsSection({ nav }: { nav: SectionNav }) {
  const [counts, setCounts] = useState({ tasks: 0, attention: 0, trays: 0, propagations: 0, plants: 0 });
  const [openTasks, setOpenTasks] = useState<{ title: string; priority: string }[]>([]);
  const checklistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksRes, journalRes, traysRes, seedTraysRes, propRes, plantsRes] = await Promise.all([
          fetch("/api/tasks").then((r) => r.json()).catch(() => ({})),
          fetch("/api/journal").then((r) => r.json()).catch(() => ({})),
          fetch("/api/trays").then((r) => r.json()).catch(() => ({})),
          fetch("/api/seedtrays").then((r) => r.json()).catch(() => ({})),
          fetch("/api/propagation").then((r) => r.json()).catch(() => ({})),
          fetch("/api/plants").then((r) => r.json()).catch(() => ({})),
        ]);
        const allTasks: { title: string; priority: string; done?: boolean }[] = Array.isArray(tasksRes.tasks) ? tasksRes.tasks : [];
        const open = allTasks.filter((task) => !task.done);
        const journal: { health?: string }[] = Array.isArray(journalRes.entries) ? journalRes.entries : [];
        const microActive = (Array.isArray(traysRes.trays) ? traysRes.trays : []).filter((tray: { status?: string }) => tray.status === "active").length;
        const seedTrayCount = Array.isArray(seedTraysRes.trays) ? seedTraysRes.trays.length : 0;
        setCounts({
          tasks: open.length,
          attention: journal.filter((entry) => entry.health === "Needs attention").length,
          trays: microActive + seedTrayCount,
          propagations: Array.isArray(propRes.items) ? propRes.items.length : 0,
          plants: Array.isArray(plantsRes.plants) ? plantsRes.plants.length : 0,
        });
        setOpenTasks(open.slice(0, 5));
      } catch {
        // leave zeros
      }
    };
    load();
  }, []);

  return (
    <div className="command-mode">
      <SectionIntro title="Garden Operations Center" subtitle="Real-time overview of tasks, reminders, zone health, and Eve's project-management recommendations." />
      <div className="stat-grid">
        <MetricCard
          value={String(counts.tasks)}
          label="Tasks today"
          onClick={() => checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        />
        <MetricCard value={String(counts.attention)} label="Needs attention" onClick={() => nav.openPhotos("Needs attention")} />
        <MetricCard value={String(counts.trays)} label="Trays active" onClick={() => nav.openSection("seedtrays")} />
        <MetricCard value={String(counts.propagations)} label="Propagations" onClick={() => nav.openSection("propagation")} />
        <MetricCard value={String(counts.plants)} label="Plants total" onClick={() => nav.openSection("plants")} />
      </div>
      <div className="two-col" ref={checklistRef}>
        <DarkPanel title="Today's operations checklist">
          {openTasks.length ? (
            openTasks.map((task) => <PriorityRow key={task.title} task={task.title} priority={task.priority} />)
          ) : (
            <p>All caught up — nothing open on today&apos;s list. 🌿</p>
          )}
          <button className="text-link ops-alltasks" onClick={() => nav.openSection("today")}>Open the full list on Today →</button>
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

const TRAY_PRESETS: { name: string; days: number }[] = MICROGREENS.map((green) => ({
  name: green.name,
  days: green.days,
}));

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
  const [openGuide, setOpenGuide] = useState<string | null>(null);

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

  const startFromGuide = async (green: Microgreen) => {
    const response = await fetch("/api/trays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: green.name, harvestDays: green.days }),
    }).catch(() => null);
    const data = await response?.json();
    if (data && Array.isArray(data.trays)) setTrays(data.trays);
    setOpenGuide(null);
    document.querySelector(".tray-table")?.scrollIntoView({ behavior: "smooth", block: "center" });
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

      <div className="micro-library">
        <h3 className="apothecary-subhead">Microgreens library — know each tray before you sow it</h3>
        <p className="micro-library-note">
          Tap a card for soak, blackout, and harvest timing, flavor and nutrition notes, and growing tips — then start a tray right from the guide.
        </p>
        <div className="micro-grid">
          {MICROGREENS.map((green) => (
            <button
              key={green.key}
              className={`micro-card ${openGuide === green.key ? "active" : ""}`}
              onClick={() => setOpenGuide((current) => (current === green.key ? null : green.key))}
            >
              <span className="micro-card-photo">
                <img src={microPhoto(green.key)} alt={`${green.name} microgreens`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              </span>
              <span className="micro-card-body">
                <strong>{green.name}</strong>
                <span className="micro-card-meta">{green.days} days · {green.difficulty}</span>
                <span className="micro-card-flavor">{green.flavor}</span>
              </span>
            </button>
          ))}
        </div>
        {openGuide && (
          <MicrogreenGuide
            green={MICROGREENS.find((green) => green.key === openGuide)!}
            onClose={() => setOpenGuide(null)}
            onStart={startFromGuide}
          />
        )}
      </div>
    </div>
  );
}

function MicrogreenGuide({ green, onClose, onStart }: { green: Microgreen; onClose: () => void; onStart: (green: Microgreen) => void }) {
  return (
    <article className="micro-guide">
      <button className="plant-remove" onClick={onClose} aria-label="Close guide"><X size={14} /></button>
      <div className="micro-guide-photo">
        <img src={microPhoto(green.key)} alt={`${green.name} microgreens`} onError={(event) => { event.currentTarget.style.display = "none"; }} />
      </div>
      <div className="micro-guide-body">
        <h3>{green.name}</h3>
        <div className="micro-timing">
          <span><strong>{green.soakHours ? `${green.soakHours} hr` : "No"}</strong> soak</span>
          <span><strong>{green.blackoutDays} days</strong> blackout</span>
          <span><strong>{green.days} days</strong> to harvest</span>
          <span><strong>{green.seedPerTray}</strong> per 10×20 tray</span>
          <span><strong>{green.regrows ? "Yes" : "No"}</strong> regrows</span>
          <span><strong>{green.difficulty}</strong> difficulty</span>
        </div>
        <p><em>Flavor:</em> {green.flavor}</p>
        <p><em>Nutrition:</em> {green.nutrition}</p>
        <ul className="micro-tips">
          {green.tips.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
        <button className="primary-button" onClick={() => onStart(green)}>
          <Plus size={15} /> Start a {green.name.toLowerCase()} tray
        </button>
      </div>
    </article>
  );
}

function ApothecarySection({ onOpenWishlist }: { onOpenWishlist: (itemName: string) => void }) {
  return (
    <div className="apothecary-mode">
      <SectionIntro title="Apothecary Garden" subtitle="Grow medicine. Grow wellness. Grow light." />

      <h3 className="apothecary-subhead">In your garden & seed vault now</h3>
      <div className="herb-grid">
        {apothecaryHave.map((herb) => {
          const photo = plantPhoto(herb.name);
          return (
            <div className="herb-card" key={herb.name}>
              {photo ? <img className="herb-photo" src={photo} alt={herb.name} /> : <div className="pressed-plant small" />}
              <h3>{herb.name}</h3>
              <p className="herb-source">{herb.source}</p>
              <p>Uses: {herb.uses}</p>
            </div>
          );
        })}
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
  sourceJournalId?: string;
};

type PlantDetail = {
  id: string;
  name: string;
  variety?: string;
  zone: string;
  health: string;
  photo?: string;
  notes?: string;
  source?: string;
  signal?: string;
  water?: string;
  sun?: string;
  pruning?: string;
  recommendation?: string;
  origin: string;
};

function PlantDetailModal({ plant, onClose }: { plant: PlantDetail; onClose: () => void }) {
  const facts = plantCare(plant.name);
  const diagnosed = [
    { label: "Water — right now", value: plant.water },
    { label: "Sun — right now", value: plant.sun },
    { label: "Pruning — right now", value: plant.pruning },
  ].filter((c) => c.value);

  return (
    <div className="lesson-backdrop" onClick={onClose}>
      <article className="plant-detail" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button lesson-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {plant.photo ? (
          <img className="plant-detail-photo" src={plant.photo} alt={plant.name} />
        ) : (
          <div className="plant-detail-photo placeholder"><Leaf size={40} /></div>
        )}
        <div className="plant-detail-body">
          <div className="plant-detail-pills">
            <span className={`health-pill ${plant.health.toLowerCase().replace(" ", "-")}`}>{plant.health}</span>
            <span className="category-pill">{facts.category}</span>
          </div>
          <h2>{plant.name}{plant.variety ? ` — ${plant.variety}` : ""}</h2>
          <p className="plant-detail-meta"><MapPin size={14} /> {plant.zone} · {plant.origin}</p>

          {/* Quick reference: evergreen facts about this kind of plant */}
          <div className="quick-facts">
            <div><strong>Type</strong><span>{facts.type}</span></div>
            <div><strong>Watering plan</strong><span>{facts.water}</span></div>
            <div><strong>Sun & placement</strong><span>{facts.sun}</span></div>
            <div><strong>Propagatable?</strong><span>{facts.propagate}</span></div>
          </div>

          {plant.signal && (
            <div className="plant-detail-section">
              <h4>What Eve sees{plant.health !== "Thriving" ? " — why it needs attention" : ""}</h4>
              <p>{plant.signal}</p>
            </div>
          )}
          {diagnosed.length > 0 && (
            <div className="plant-detail-care">
              {diagnosed.map((c) => (
                <div key={c.label}>
                  <strong>{c.label}</strong>
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
          )}
          {(plant.recommendation || plant.notes) && (
            <div className="plant-detail-section">
              <h4>Recommended next steps</h4>
              <p>{plant.recommendation || plant.notes}</p>
            </div>
          )}

          {/* How to propagate this plant */}
          {(() => {
            const prop = propagationGuide(plant.name);
            return (
              <div className="plant-detail-section prop-section">
                <h4><Sprout size={15} /> How to propagate — {prop.method}</h4>
                {prop.seasonNote && <p className="prop-season">{prop.seasonNote}</p>}
                <ol className="prop-steps">
                  {prop.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            );
          })()}

          {plant.source && <p className="plant-detail-source">Identified via {plant.source}</p>}
        </div>
      </article>
    </div>
  );
}

// Joins a library plant with its source journal entry's diagnosis (by id).
function enrichPlant(
  plant: LibraryPlant,
  journalById: Map<string, PlantPhotoRecord>,
): PlantDetail {
  const j = plant.sourceJournalId ? journalById.get(plant.sourceJournalId) : undefined;
  return {
    id: plant.id,
    name: plant.name,
    variety: plant.variety,
    zone: plant.zone,
    health: plant.health,
    photo: plant.photo,
    notes: plant.notes,
    source: j?.source,
    signal: j?.signal,
    water: j?.water,
    sun: j?.sun,
    pruning: j?.pruning,
    recommendation: j?.recommendation ?? plant.notes,
    origin: "Plant Library",
  };
}

function PlantLibrary() {
  const [libraryPlants, setLibraryPlants] = useState<LibraryPlant[]>([]);
  const [journalById, setJournalById] = useState<Map<string, PlantPhotoRecord>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [detail, setDetail] = useState<PlantDetail | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/plants").then((r) => r.json()).catch(() => ({ plants: [] })),
      fetch("/api/journal").then((r) => r.json()).catch(() => ({ entries: [] })),
    ])
      .then(([plantsData, journalData]) => {
        setLibraryPlants(Array.isArray(plantsData.plants) ? plantsData.plants : []);
        const entries: PlantPhotoRecord[] = Array.isArray(journalData.entries) ? journalData.entries : [];
        setJournalById(new Map(entries.map((e) => [e.id, e])));
      })
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
        subtitle="Your real plants — populated from Photo Journal uploads. Tap any plant for its full diagnosis and care notes."
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
      {(() => {
        // Group by care category, alphabetize within each group.
        const groups = new Map<PlantCategory, LibraryPlant[]>();
        for (const plant of libraryPlants) {
          const category = plantCare(plant.name).category;
          if (!groups.has(category)) groups.set(category, []);
          groups.get(category)!.push(plant);
        }
        return CATEGORY_ORDER.filter((category) => groups.has(category)).map((category) => {
          const members = groups
            .get(category)!
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
          return (
            <div key={category}>
              <h3 className="apothecary-subhead">
                {category} <em className="lesson-minutes">· {members.length} plant{members.length === 1 ? "" : "s"}</em>
              </h3>
              <div className="plant-grid">
                {members.map((plant) => (
                  <article className="plant-card" key={plant.id}>
                    <button className="plant-card-open" onClick={() => setDetail(enrichPlant(plant, journalById))}>
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
                    </button>
                    <button className="plant-remove" onClick={() => removePlant(plant.id)} aria-label={`Remove ${plant.name}`}>
                      <X size={14} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          );
        });
      })()}
      {detail && <PlantDetailModal plant={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ZonePlantGrid({ plants, onOpen }: { plants: PlantDetail[]; onOpen: (plant: PlantDetail) => void }) {
  return (
    <div className="plant-grid">
      {plants.map((plant) => (
        <article className="plant-card" key={plant.id}>
          <button className="plant-card-open" onClick={() => onOpen(plant)}>
            {plant.photo ? (
              <img src={plant.photo} alt={plant.name} />
            ) : (
              <div className="plant-photo-placeholder"><Leaf size={26} /></div>
            )}
            <div className="plant-card-body">
              <h3>{plant.name}</h3>
              <p>{plant.origin}</p>
              <span className={`health-pill ${plant.health.toLowerCase().replace(" ", "-")}`}>{plant.health}</span>
            </div>
          </button>
        </article>
      ))}
    </div>
  );
}

const BERRY_VISION: { name: string; have: boolean; note: string }[] = [
  { name: "Blueberry", have: true, note: "Your two bushes — they want acidic soil, so keep them in pots or amended beds with peat and sulfur; Utah soil fights them." },
  { name: "Strawberry", have: true, note: "Already gratefully here — edge the beds with them and let a few runners fill the gaps." },
  { name: "Raspberry", have: false, note: "Coming soon — plant 'Heritage' or 'Caroline' fall-bearers and simply mow the canes each February." },
  { name: "Blackberry", have: false, note: "'Triple Crown' thornless thrives in Orem and out-yields everything on a simple two-wire fence." },
  { name: "Honeyberry", have: false, note: "Haskap — blooms through late frosts, fruits before strawberries, laughs at zone 6 winters. Plant two for pollination." },
  { name: "Currant", have: false, note: "Black or red — happy in the part-shade corners other berries refuse, and they love our cool springs." },
  { name: "Gooseberry", have: false, note: "'Hinnomaki Red' — pie-perfect, thrives here, and nearly zero care once established." },
  { name: "Serviceberry", have: false, note: "Saskatoon — a Utah native that's both ornamental and delicious; blueberry-ish fruit without the acid-soil drama." },
  { name: "Elderberry", have: false, note: "For the apothecary shelf — syrup from your own gratitude garden. Give it the moist corner." },
];

function BerryGratefulVision() {
  return (
    <div className="berry-vision">
      <p className="berry-vision-lead">
        The vision: a garden where every plant is a thank-you — <strong>Berry Berry Grateful</strong>. Blueberries and
        strawberries are home; raspberries are on the way. Here&apos;s the full berry patch this corner of Orem can carry:
      </p>
      <div className="berry-vision-grid">
        {BERRY_VISION.map((berry) => {
          const photo = plantPhoto(berry.name);
          return (
            <article key={berry.name} className={`berry-card ${berry.have ? "have" : ""}`}>
              {photo && <img src={photo} alt={berry.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div className="berry-card-body">
                <strong>{berry.name} {berry.have ? "✓" : ""}</strong>
                <em>{berry.have ? "Berry berry here" : "Berry berry soon (on the wishlist)"}</em>
                <p>{berry.note}</p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="berry-vision-note">
        Orem-friendly picks above are on your wishlist under this zone. One honest note: blueberries are the only
        rebels here — Utah&apos;s alkaline soil means they live their best life in containers of acidified mix.
      </p>
    </div>
  );
}

function ZonesSection({ focus }: { focus: string | null }) {
  const [selected, setSelected] = useState<string | null>(focus);
  const [zonePlants, setZonePlants] = useState<PlantDetail[]>([]);
  const [storedWish, setStoredWish] = useState<WishItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [detail, setDetail] = useState<PlantDetail | null>(null);

  useEffect(() => {
    if (focus) setSelected(focus);
  }, [focus]);

  useEffect(() => {
    if (!selected) return;
    setLoaded(false);
    const load = async () => {
      try {
        const [plantsData, journalData, wishData] = await Promise.all([
          (await fetch("/api/plants")).json(),
          (await fetch("/api/journal")).json(),
          (await fetch("/api/wishlist")).json(),
        ]);
        setStoredWish(Array.isArray(wishData.items) ? wishData.items : []);
        const entries: PlantPhotoRecord[] = Array.isArray(journalData.entries) ? journalData.entries : [];
        const journalById = new Map(entries.map((e) => [e.id, e]));
        const library: PlantDetail[] = (Array.isArray(plantsData.plants) ? plantsData.plants : [])
          .filter((plant: LibraryPlant) => plant.zone === selected)
          .map((plant: LibraryPlant) => enrichPlant(plant, journalById));
        const seen = new Set(library.map((plant) => plant.name.toLowerCase()));
        const fromJournal: PlantDetail[] = entries
          .filter(
            (entry) =>
              entry.zone === selected &&
              entry.plant !== "Unidentified plant" &&
              !seen.has(entry.plant.toLowerCase()),
          )
          .map((entry) => ({
            id: entry.id,
            name: entry.plant,
            zone: entry.zone,
            health: entry.health,
            photo: entry.photo,
            source: entry.source,
            signal: entry.signal,
            water: entry.water,
            sun: entry.sun,
            pruning: entry.pruning,
            recommendation: entry.recommendation,
            origin: "From Photo Journal",
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
    const zoneWishlist = storedWish.length
      ? storedWish.filter((item) => item.category === selected)
      : wishlistItems.filter((item) => item.category === selected);
    return (
      <div className="section-stack">
        <button className="text-link" onClick={() => setSelected(null)}>← All garden zones</button>
        <SectionIntro
          title={zone.name === "Gratitude Garden" ? "Gratitude Garden — Berry Berry Grateful 🫐" : zone.name}
          subtitle={`Mood: ${zone.mood} • Status: ${zone.status}`}
        />

        {zone.name === "Gratitude Garden" && <BerryGratefulVision />}
        {zone.name === "Tea Garden" && <TeaGardenVision />}
        {zone.name === "Meditation Garden" && <MeditationVision />}
        {zone.name === "Apothecary Garden" && <ApothecaryVision />}
        {zone.name === "Fairy Garden" && <FairyGardenVision />}

        {!loaded && <p className="empty-note">Checking your plant records...</p>}
        {loaded && !zonePlants.length && (
          <>
            <h3 className="apothecary-subhead">Plants in this zone</h3>
            <p className="empty-note">
              No plants recorded here yet. Upload photos in the Photo Journal and set their zone to
              "{zone.name}" — they'll show up here automatically.
            </p>
          </>
        )}
        {loaded && zonePlants.length > 0 && zone.name === "Tea Garden" ? (
          (() => {
            const { tea, decorative } = teaPlantSplit(zonePlants);
            return (
              <>
                <h3 className="apothecary-subhead">Tea plants <em className="lesson-minutes">· fills the pot</em></h3>
                {tea.length ? <ZonePlantGrid plants={tea} onOpen={setDetail} /> : <p className="empty-note">No tea plants recorded yet — photograph your mint & friends and set their zone here.</p>}
                <h3 className="apothecary-subhead">Decorative cottage plants <em className="lesson-minutes">· fills the vase</em></h3>
                {decorative.length ? <ZonePlantGrid plants={decorative} onOpen={setDetail} /> : <p className="empty-note">The cottage-flower bed awaits — sweet peas, hollyhocks, cosmos.</p>}
              </>
            );
          })()
        ) : (
          loaded && zonePlants.length > 0 && (
            <>
              <h3 className="apothecary-subhead">Plants in this zone</h3>
              <ZonePlantGrid plants={zonePlants} onOpen={setDetail} />
            </>
          )
        )}

        {detail && <PlantDetailModal plant={detail} onClose={() => setDetail(null)} />}

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

type SfgBed = { id: string; name: string; squares: (string | null)[] };

const EMPTY_SQUARES = (): (string | null)[] => Array(16).fill(null);

/** Renders a plant's per-square count as the actual SFG planting pattern:
 *  1 big plant, 2×2 for four, 3×3 for nine, 4×4 for sixteen, etc. */
function PlantArrangement({ plant }: { plant: (typeof SFG_PLANTS)[number] }) {
  const count = plant.perSquare;
  const cols = count === 1 ? 1 : count === 2 ? 2 : count === 4 ? 2 : count === 8 ? 4 : count === 9 ? 3 : 4;
  return (
    <span
      className={`plant-arrangement n${count}`}
      style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>{plant.emoji}</span>
      ))}
    </span>
  );
}
const SFG_CATEGORIES: SfgCategory[] = ["Vegetable", "Herb", "Flower", "Fruit"];

function SquareFootPlanner() {
  const [beds, setBeds] = useState<SfgBed[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [brush, setBrush] = useState<string | null>(null); // selected palette plant (tap-to-place)
  const [category, setCategory] = useState<SfgCategory>("Vegetable");
  const [openLesson, setOpenLesson] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/sfg")
      .then((r) => r.json())
      .then((data) => {
        const list: SfgBed[] = Array.isArray(data.beds) ? data.beds : [];
        setBeds(list);
        if (list.length) setActiveId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const active = beds.find((bed) => bed.id === activeId) ?? null;

  const persist = (bed: SfgBed) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/sfg", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bed.id, squares: bed.squares, name: bed.name }),
      }).catch(() => {});
    }, 500);
  };

  const updateActive = (mutate: (bed: SfgBed) => SfgBed) => {
    if (!active) return;
    const next = mutate(active);
    setBeds((current) => current.map((bed) => (bed.id === next.id ? next : bed)));
    persist(next);
  };

  const newBed = async () => {
    const response = await fetch("/api/sfg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Bed ${beds.length + 1}`, squares: EMPTY_SQUARES() }),
    });
    const data = await response.json();
    if (data.bed) {
      setBeds((current) => [...current, data.bed]);
      setActiveId(data.bed.id);
    }
  };

  const deleteBed = async (id: string) => {
    setBeds((current) => current.filter((bed) => bed.id !== id));
    if (activeId === id) setActiveId((beds.find((b) => b.id !== id)?.id ?? null));
    await fetch(`/api/sfg?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const placeAt = (index: number, key: string | null) => {
    updateActive((bed) => {
      const squares = bed.squares.slice();
      squares[index] = key;
      return { ...bed, squares };
    });
  };

  const recs = active ? analyzeBed(active.squares) : [];
  const paletteFor = (cat: SfgCategory) => SFG_PLANTS.filter((p) => p.category === cat);

  return (
    <div className="section-stack">
      <SectionIntro
        title="Square Foot Garden Planner"
        subtitle="Design a 4×4 bed square by square. Pick a plant, drop it in, and get live spacing, height, and companion advice for Orem."
      />

      <div className="toolbar">
        <button className="primary-button" onClick={newBed}><Plus size={16} /> New 4×4 bed</button>
        <button className="secondary-button" onClick={() => setOpenLesson(true)}>
          <LibraryBig size={16} /> How to build one
        </button>
      </div>

      {loaded && !beds.length && (
        <div className="empty-library">
          <LayoutGrid size={30} />
          <h3>Start your first bed</h3>
          <p>Tap <strong>New 4×4 bed</strong> to open a planning grid. Then pick a plant from the palette and tap squares to fill them — the planner spaces them the square-foot way and flags companions, shading, and trellis needs as you go.</p>
        </div>
      )}

      {beds.length > 0 && (
        <div className="bed-tabs">
          {beds.map((bed) => (
            <button
              key={bed.id}
              className={`bed-tab ${bed.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(bed.id)}
              title="Click to open; rename it with the pencil field above the grid"
            >
              {bed.name}
            </button>
          ))}
          <button className="bed-tab ghost" onClick={newBed} title="Add another bed"><Plus size={14} /></button>
        </div>
      )}

      {active && (
        <div className="sfg-layout">
          <div className="sfg-left">
            <div className="bed-header">
              <label className="bed-name-field" title="Rename this bed">
                <Pencil size={15} />
                <input
                  className="bed-name-input"
                  value={active.name}
                  onChange={(event) => updateActive((bed) => ({ ...bed, name: event.target.value }))}
                  placeholder="Name this bed (e.g. Herb bed, Early-season #1)"
                  aria-label="Bed name"
                />
              </label>
              <div className="bed-header-actions">
                <button className="text-link" onClick={() => updateActive((bed) => ({ ...bed, squares: EMPTY_SQUARES() }))}>Clear</button>
                <button className="task-delete" onClick={() => deleteBed(active.id)} aria-label="Delete bed"><X size={15} /></button>
              </div>
            </div>

            <p className="bed-compass">↑ North (put tall plants here)</p>
            <div
              className="sfg-grid"
              onDragOver={(event) => event.preventDefault()}
            >
              {active.squares.map((key, index) => {
                const plant = key ? SFG_BY_KEY[key] : null;
                return (
                  <button
                    key={index}
                    className={`sfg-cell ${plant ? "filled" : ""}`}
                    onClick={() => placeAt(index, brush)}
                    onContextMenu={(event) => { event.preventDefault(); placeAt(index, null); }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const dropped = event.dataTransfer.getData("text/plain");
                      if (dropped) placeAt(index, dropped);
                    }}
                    title={plant ? `${plant.name} — ${plant.perSquare} per square. ${plant.note} (right-click to clear)` : brush ? `Place ${SFG_BY_KEY[brush]?.name}` : "Pick a plant from the palette first"}
                  >
                    {plant ? (
                      <>
                        <PlantArrangement plant={plant} />
                        <span className="sfg-name">{plant.name} <em className="sfg-count">×{plant.perSquare}</em></span>
                      </>
                    ) : (
                      <span className="sfg-empty">{index + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="bed-hint">Tap a plant in the palette, then tap squares to place it. Drag also works. Right-click a square to clear it.</p>
          </div>

          <div className="sfg-right">
            <div className="sfg-palette">
              <div className="palette-tabs">
                {SFG_CATEGORIES.map((cat) => (
                  <button key={cat} className={`palette-tab ${cat === category ? "active" : ""}`} onClick={() => setCategory(cat)}>
                    {cat}s
                  </button>
                ))}
              </div>
              <div className="palette-grid">
                <button
                  className={`palette-item eraser ${brush === null ? "active" : ""}`}
                  onClick={() => setBrush(null)}
                  title="Eraser — tap squares to clear"
                >
                  <span className="sfg-emoji">🚫</span>
                  <span className="sfg-name">Erase</span>
                </button>
                {paletteFor(category).map((plant) => (
                  <button
                    key={plant.key}
                    className={`palette-item ${brush === plant.key ? "active" : ""}`}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", plant.key)}
                    onClick={() => setBrush(plant.key)}
                    title={`${plant.perSquare} per square. ${plant.note}`}
                  >
                    <PlantArrangement plant={plant} />
                    <span className="sfg-name">{plant.name}</span>
                    <span className="sfg-per">×{plant.perSquare}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sfg-recs">
              <h3 className="apothecary-subhead">Recommendations</h3>
              {recs.map((rec, index) => (
                <p className={`sfg-rec ${rec.kind}`} key={index}>
                  {rec.kind === "good" ? <CheckCircle2 size={15} /> : rec.kind === "warn" ? <AlertCircle size={15} /> : <Sparkles size={15} />}
                  <span>{rec.text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {openLesson && <LessonReader lesson={squareFootLesson} onClose={() => setOpenLesson(false)} />}
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

type WishItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  priority: "High" | "Medium" | "Low";
  note?: string;
  link?: string;
  image?: string;
};

function Wishlist({ focus }: { focus: string | null }) {
  const highlightRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Greenhouse", price: "", priority: "Medium", note: "", link: "", image: "" });
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState("");

  const importFromLink = async () => {
    const url = importUrl.trim();
    if (!url || importing) return;
    setImporting(true);
    setImportNote("Reading the product page…");
    try {
      const response = await fetch("/api/wishlist/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.preview) {
        setForm({
          name: data.preview.name ?? "",
          category: data.preview.category ?? "General",
          price: data.preview.price || "",
          priority: "Medium",
          note: "",
          link: data.preview.link ?? url,
          image: data.preview.image ?? "",
        });
        setShowForm(true);
        setImportNote(data.preview.image ? "Details filled in below — adjust anything, then add it." : "Filled in what the page shared (no photo found) — adjust and add.");
        setImportUrl("");
      } else {
        setImportNote(data.error ?? "Couldn't read that link — fill the form in manually below.");
        setForm((current) => ({ ...current, link: url }));
        setShowForm(true);
      }
    } catch {
      setImportNote("Couldn't reach that page — fill the form in manually below.");
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => {});
  }, []);

  const isFocused = (name: string) => !!focus && name.toLowerCase().includes(focus.toLowerCase());

  useEffect(() => {
    if (focus && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focus, items]);

  const addItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (Array.isArray(data.items)) setItems(data.items);
    setForm({ name: "", category: form.category, price: "", priority: "Medium", note: "", link: "", image: "" });
    setImportNote("");
    setShowForm(false);
  };

  const removeItem = async (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    await fetch(`/api/wishlist?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  const categories = Array.from(new Set(items.map((item) => item.category)));
  const zoneNames = zones.map((z) => z.name);
  const categoryOptions = Array.from(new Set([...zoneNames, "Outdoor Decor", "Compost Area", "Tools", "General"]));

  return (
    <div className="section-stack">
      <SectionIntro
        title="Wishlist & Garden Dreams Board"
        subtitle="Everything on the someday list — what it's for, what it costs, and how much you want it."
      />
      <div className="toolbar">
        <button className="primary-button" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Add wishlist item
        </button>
      </div>

      <div className="wish-import">
        <input
          type="url"
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); importFromLink(); } }}
          placeholder="Paste a product link (Amazon, anywhere) — item, photo, and price fill in automatically"
        />
        <button className="secondary-button" onClick={importFromLink} disabled={importing}>
          {importing ? "Reading…" : "Fetch details"}
        </button>
      </div>
      {importNote && <p className="wish-import-note">{importNote}</p>}

      {showForm && (
        <form className="wish-form" onSubmit={addItem}>
          <label>
            Item
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Raised bed kit" autoFocus />
          </label>
          <label>
            Zone / category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Price
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$0.00" />
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="wish-form-note">
            Note (what it's for)
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional" />
          </label>
          <label className="wish-form-note">
            Link to purchase
            <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
          </label>
          <label className="wish-form-note">
            Photo (image URL)
            <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
          </label>
          {form.image && (
            <span className="wish-form-preview">
              <img src={form.image} alt="Item preview" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </span>
          )}
          <button className="primary-button" type="submit">Add to wishlist</button>
        </form>
      )}

      {categories.map((category) => (
        <div key={category}>
          <h3 className="apothecary-subhead">{category}</h3>
          <div className="wishlist-grid">
            {items
              .filter((item) => item.category === category)
              .map((item) => {
                const focused = isFocused(item.name);
                const deletable = !item.id.startsWith("default-");
                return (
                  <article
                    className={`wish-card ${focused ? "focused" : ""} ${item.image ? "has-photo" : ""}`}
                    key={item.id}
                    ref={focused ? (node) => { highlightRef.current = node; } : undefined}
                  >
                    {item.image && (
                      <span className="wish-photo">
                        <img src={item.image} alt={item.name} loading="lazy" onError={(e) => { e.currentTarget.parentElement!.style.display = "none"; }} />
                      </span>
                    )}
                    <header>
                      <h4>{item.name}</h4>
                      <span className={`prop-badge ${item.priority === "High" ? "ready" : item.priority === "Medium" ? "soon" : "wait"}`}>
                        {item.priority}
                      </span>
                    </header>
                    {item.note && <p>{item.note}</p>}
                    <footer>
                      <span>{item.price}</span>
                      {item.link && (
                        <a className="wish-buy" href={item.link} target="_blank" rel="noreferrer">
                          Purchase <ExternalLink size={12} />
                        </a>
                      )}
                      {deletable && (
                        <button className="wish-delete" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                          <X size={13} />
                        </button>
                      )}
                    </footer>
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
  photo?: string;
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
  // Look up the full plant record so a prop card can open the detail modal.
  const [libraryByName, setLibraryByName] = useState<Map<string, LibraryPlant>>(new Map());
  const [journalByName, setJournalByName] = useState<Map<string, PlantPhotoRecord>>(new Map());
  const [journalById, setJournalById] = useState<Map<string, PlantPhotoRecord>>(new Map());
  const [detail, setDetail] = useState<PlantDetail | null>(null);

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

    Promise.all([
      fetch("/api/plants").then((r) => r.json()).catch(() => ({ plants: [] })),
      fetch("/api/journal").then((r) => r.json()).catch(() => ({ entries: [] })),
    ]).then(([plantsData, journalData]) => {
      const plants: LibraryPlant[] = Array.isArray(plantsData.plants) ? plantsData.plants : [];
      const entries: PlantPhotoRecord[] = Array.isArray(journalData.entries) ? journalData.entries : [];
      setLibraryByName(new Map(plants.map((p) => [p.name.toLowerCase(), p])));
      setJournalByName(new Map(entries.filter((e) => e.plant !== "Unidentified plant").map((e) => [e.plant.toLowerCase(), e])));
      setJournalById(new Map(entries.map((e) => [e.id, e])));
    });
  }, []);

  const openDetail = (item: PropagationItem) => {
    const key = item.plant.toLowerCase();
    const libraryPlant = libraryByName.get(key);
    if (libraryPlant) {
      setDetail(enrichPlant(libraryPlant, journalById));
      return;
    }
    const entry = journalByName.get(key);
    if (entry) {
      setDetail({
        id: entry.id,
        name: entry.plant,
        zone: entry.zone,
        health: entry.health,
        photo: entry.photo,
        source: entry.source,
        signal: entry.signal,
        water: entry.water,
        sun: entry.sun,
        pruning: entry.pruning,
        recommendation: entry.recommendation,
        origin: "From Photo Journal",
      });
      return;
    }
    // Starter/sample plant with no photo record — show what we know.
    setDetail({
      id: item.plant,
      name: item.plant,
      zone: item.zone,
      health: "Watch",
      photo: item.photo,
      recommendation: item.readinessReason,
      origin: "Suggested plant",
    });
  };

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
              <button
                className="prop-open"
                onClick={() => openDetail(item)}
                title={`Open ${item.plant} in the Plant Library`}
              >
                {(item.photo ?? plantPhoto(item.plant)) && (
                  <img className="prop-photo" src={item.photo ?? plantPhoto(item.plant)} alt={item.plant} />
                )}
                <div>
                  <h3>{item.plant}</h3>
                  <p><MapPin size={13} /> {item.zone} • {item.method}</p>
                </div>
              </button>
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
      {detail && <PlantDetailModal plant={detail} onClose={() => setDetail(null)} />}
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

      <SunMap />

      <div className="map-canvas">{zones.slice(0, 12).map((zone) => <span key={zone.name}>{zone.name}</span>)}</div>
    </div>
  );
}

function Quotes() {
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const plan = openTopic ? STUDY_PLAN_BY_TOPIC.get(openTopic) ?? null : null;

  return (
    <div className="section-stack">
      <SectionIntro
        title="Garden Sanctuary Study"
        subtitle="A simple study plan for each theme — a few passages to read, a question to ponder, and a practice to carry into the garden. Tap a topic and take it outside."
      />
      <div className="collection-grid">
        {quoteTopics.map((topic) => (
          <button
            className={`collection-card zone-card ${openTopic === topic ? "active" : ""}`}
            key={topic}
            onClick={() => setOpenTopic((current) => (current === topic ? null : topic))}
          >
            <Leaf size={18} />
            <span>{topic}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      {plan && (
        <article className="study-plan">
          <button className="plant-remove" onClick={() => setOpenTopic(null)} aria-label="Close study plan"><X size={14} /></button>
          <h3>{plan.topic}</h3>
          <p className="study-invitation">{plan.invitation}</p>
          <h4>Read</h4>
          <ul className="study-read">
            {plan.read.map((entry) => (
              <li key={entry.ref}><strong>{entry.ref}</strong> — “{entry.line}”</li>
            ))}
          </ul>
          <h4>Ponder</h4>
          <p className="study-ponder">{plan.ponder}</p>
          <h4>Practice in the garden</h4>
          <p className="study-practice">{plan.practice}</p>
          <button
            className="secondary-button"
            onClick={() => askEve(`I'm studying the theme "${plan.topic}" in my garden sanctuary today. Share one more scripture or garden reflection on ${plan.topic.toLowerCase()}, and one gentle question to sit with while I tend the plants.`)}
          >
            <Bot size={15} /> Ask Eve to add to this study
          </button>
        </article>
      )}
      {openTopic && !plan && (
        <p className="empty-note">A study plan for {openTopic} is coming — ask Eve about it in the meantime.</p>
      )}
    </div>
  );
}

function Learning() {
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const written = new Set(lessons.map((lesson) => lesson.title.toLowerCase()));

  return (
    <div className="section-stack">
      <SectionIntro
        title="Beginner Learning Center"
        subtitle="Short, encouraging, task-connected garden lessons. Tap one to read it — more are being written."
      />
      <div className="collection-grid">
        {lessons.map((lesson) => (
          <button className="collection-card zone-card" key={lesson.id} onClick={() => setOpenLesson(lesson)}>
            <LibraryBig size={18} />
            <span>{lesson.title} <em className="lesson-minutes">· {lesson.minutes} min read</em></span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
      <h3 className="apothecary-subhead">Coming soon</h3>
      <div className="wishlist-chips">
        {learningModules
          .filter((module) => ![...written].some((title) => title.includes(module.toLowerCase().slice(0, 8))))
          .slice(0, 12)
          .map((module) => (
            <span className="wishlist-chip coming-soon" key={module}>{module}</span>
          ))}
      </div>
      {openLesson && <LessonReader lesson={openLesson} onClose={() => setOpenLesson(null)} />}
    </div>
  );
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

function Photos({ focus = null }: { focus?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<PlantPhotoRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthFilter, setHealthFilter] = useState<PlantPhotoRecord["health"] | null>(
    focus === "Thriving" || focus === "Watch" || focus === "Needs attention" ? focus : null,
  );
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focus === "Thriving" || focus === "Watch" || focus === "Needs attention") {
      setHealthFilter(focus);
      setTimeout(() => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    }
  }, [focus]);

  const toggleHealthFilter = (health: PlantPhotoRecord["health"]) => {
    setHealthFilter((current) => (current === health ? null : health));
    setTimeout(() => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
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
        // Without a real vision provider the route returns placeholder drafts —
        // don't overwrite our drafts (or mislabel the source) with those.
        if (result.mode !== "configured") continue;
        analyzedForReal = true;

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

  const processAll = async () => {
    setIsAnalyzing(true);
    setBatchNote("Identifying and diagnosing every photo, then adding identified plants to your library. This can take a minute for a big batch...");
    try {
      const response = await fetch("/api/journal/process-all", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setBatchNote(data.error ?? "Couldn't run the bulk analysis — try again.");
        return;
      }
      if (Array.isArray(data.entries)) setRecords(data.entries);
      setBatchNote(data.message ?? "Done.");
    } catch {
      setBatchNote("Couldn't reach the analyzer — check that the app is running and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const needsIdCount = records.filter((record) => record.identificationStatus === "Needs ID").length;

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

  const visibleRecords = healthFilter ? records.filter((record) => record.health === healthFilter) : records;

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
          <div className="batch-buttons">
            <button className="primary-button" disabled={isAnalyzing} onClick={() => inputRef.current?.click()}>
              <Upload size={16} /> {isAnalyzing ? "Working..." : "Upload photo batch"}
            </button>
            {records.length > 0 && (
              <button className="secondary-button" disabled={isAnalyzing} onClick={processAll}>
                <Sparkles size={16} /> Identify &amp; diagnose all
                {needsIdCount > 0 ? ` (${needsIdCount})` : ""}
              </button>
            )}
          </div>
          <div className="diagnosis-tags">
            <span><AlertCircle size={15} /> Plant ID required</span>
            <span><CheckCircle2 size={15} /> Draft health notes</span>
            <span><Camera size={15} /> Saved to history</span>
          </div>
        </article>

        <div className="health-summary-grid">
          <MetricCard value={String(records.length)} label="Photos logged" onClick={() => setHealthFilter(null)} active={healthFilter === null} />
          <MetricCard value={String(counts.thriving)} label="Looking healthy" onClick={() => toggleHealthFilter("Thriving")} active={healthFilter === "Thriving"} />
          <MetricCard value={String(counts.watch)} label="Watch closely" onClick={() => toggleHealthFilter("Watch")} active={healthFilter === "Watch"} />
          <MetricCard value={String(counts.attention)} label="Needs attention" onClick={() => toggleHealthFilter("Needs attention")} active={healthFilter === "Needs attention"} />
        </div>
      </div>

      {healthFilter && (
        <div className="health-filter-banner" ref={boardRef}>
          <span>
            Showing <strong>{visibleRecords.length}</strong> {healthFilter === "Needs attention" ? "plants that need attention" : healthFilter === "Watch" ? "plants to watch closely" : "healthy plants"}
            {healthFilter === "Needs attention" ? " — most urgent first" : ""}
          </span>
          <button onClick={() => setHealthFilter(null)}>Show all photos</button>
        </div>
      )}

      <div className="diagnosis-board">
        {visibleRecords.length ? (
          visibleRecords.map((record) => (
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
                {!record.savedToLibrary && record.plant === "Unidentified plant" && (
                  <p className="save-hint">Type the plant's name above first — then this button saves it (and its photo) to the Plant Library.</p>
                )}
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
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = LANDSCAPE_PROJECTS.find((project) => project.key === openKey) ?? null;

  return (
    <div className="section-stack">
      <SectionIntro
        title="Edible Landscape Planner"
        subtitle="Plan fruit, herbs, flowers, living water moments, vines, pollinator edges, paths, and harvest rhythms. Tap a project for plant picks, layout, and Orem timing."
      />
      <div className="collection-grid">
        {LANDSCAPE_PROJECTS.map((project) => (
          <button
            className={`collection-card zone-card ${openKey === project.key ? "active" : ""}`}
            key={project.key}
            onClick={() => setOpenKey((current) => (current === project.key ? null : project.key))}
          >
            <Leaf size={18} />
            <span>{project.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      {open && (
        <article className="landscape-guide">
          <button className="plant-remove" onClick={() => setOpenKey(null)} aria-label="Close guide"><X size={14} /></button>
          <div className="landscape-guide-photo">
            <img src={plantPhoto(open.heroPlant) ?? undefined} alt={open.name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div className="landscape-guide-body">
            <h3>{open.name}</h3>
            <p className="landscape-tagline">{open.tagline}</p>
            <p>{open.why}</p>
            <h4>What to plant</h4>
            <ul className="landscape-plants">
              {open.plants.map((plant) => (
                <li key={plant.name}><strong>{plant.name}</strong> — {plant.note}</li>
              ))}
            </ul>
            <h4>How to lay it out</h4>
            <ol className="landscape-layout">
              {open.layout.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <p className="landscape-timing"><strong>Orem timing:</strong> {open.oremTiming}</p>
            <button
              className="secondary-button"
              onClick={() => askEve(`Design the "${open.name}" project for my Orem yard: ${open.tagline.toLowerCase()}. Use my existing plants and seed library where possible, give me a shopping list for the rest, and a step-by-step plan for the next month.`)}
            >
              <Bot size={15} /> Ask Eve to plan this for my yard
            </button>
          </div>
        </article>
      )}
    </div>
  );
}

const EVE_HELP_CARDS: { label: string; prompt?: string; opensPhotos?: boolean }[] = [
  { label: "Daily plans", prompt: "Build me a garden plan for today based on my task list, my plants, and the weather in Orem." },
  { label: "Plant advice", prompt: "Look at my plant library and tell me which plants need attention this week, and exactly what to do for each." },
  { label: "Seed advice", prompt: "Which seeds should I be starting or direct sowing right now in Orem, and which should I get ready for the next window?" },
  { label: "Diagnosis from photos", opensPhotos: true },
  { label: "Shopping lists", prompt: "Make me a garden shopping list for the next month based on my wishlist, the season, and what I'm growing." },
  { label: "Weekly reviews", prompt: "Give me a weekly review of my garden: what's going well, what to watch, and my top 5 priorities for next week." },
  { label: "Sacred garden reflections", prompt: "Share a short scripture or reflection that fits today's work in my garden, and one thought to carry while I tend it." },
];

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

function EveHome({ onOpenPhotos }: { onOpenPhotos: () => void }) {
  return (
    <div className="section-stack">
      <SectionIntro
        title="Eve Assistant"
        subtitle="Garden teacher, daily coach, project manager, sacred garden companion, diagnostician, planner, and weekly reviewer. Tap anything below and Eve answers in the chat panel."
      />
      <div className="prompt-grid">
        {evePrompts.map((prompt) => (
          <button key={prompt} onClick={() => askEve(prompt)}>{prompt}</button>
        ))}
      </div>
      <div className="section-stack">
        <SectionIntro title="Eve Can Help With" subtitle="One tap sends the request straight to Eve." />
        <div className="mini-card-grid">
          {EVE_HELP_CARDS.map((card) => (
            <button
              className="collection-card zone-card"
              key={card.label}
              onClick={() => (card.opensPhotos ? onOpenPhotos() : card.prompt && askEve(card.prompt))}
            >
              <Leaf size={18} />
              <span>{card.label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
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

function MetricCard({ value, label, onClick, active }: { value: string; label: string; onClick?: () => void; active?: boolean }) {
  if (!onClick) return <div className="metric-card"><strong>{value}</strong><span>{label}</span></div>;
  return (
    <button className={`metric-card clickable ${active ? "active" : ""}`} onClick={onClick} title={active ? "Click to show all photos again" : `Click to see only "${label}" plants`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
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

function SoilPrepSection() {
  const [selectedBed, setSelectedBed] = useState(0);

  const beds = [
    {
      label: "4×4 SFG bed",
      size: "4×4 ft, 6 in deep",
      totalCuFt: 8,
      perPart: 2.7,
      shopping: [
        "3 bags compost (2.8 cu ft each)",
        "1–2 coco coir blocks (expands to ~5 cu ft) or 2 bags peat moss",
        "3 bags vermiculite (0.9 cu ft each)",
      ],
      cost: "$25–35",
    },
    {
      label: "4×8 raised bed",
      size: "4×8 ft, 6 in deep",
      totalCuFt: 16,
      perPart: 5.3,
      shopping: [
        "6 bags compost (2.8 cu ft each)",
        "2 coco coir blocks or 3 bags peat moss (2 cu ft each)",
        "6 bags vermiculite (0.9 cu ft each)",
      ],
      cost: "$60–80",
    },
    {
      label: "Microgreens tray",
      size: "10×20 flat",
      totalCuFt: 0.67,
      perPart: 0.22,
      shopping: [
        "1 small bag compost (shares across many trays)",
        "Leftover coco coir from the blocks",
        "Leftover vermiculite",
      ],
      cost: "$2–3 per tray",
    },
  ];
  const bed = beds[selectedBed];

  const steps = [
    { task: "Gather materials", details: "Have all compost, coco coir or peat moss, and vermiculite on hand before you open a bag." },
    { task: "Layer compost", details: "Spread it evenly across the bed, about 2 inches deep." },
    { task: "Add coco coir", details: "An even 2-inch layer on top of the compost." },
    { task: "Add vermiculite", details: "The final 2-inch layer." },
    { task: "Mix thoroughly", details: "Turn the whole bed 5–6 times with a fork — the mix should look uniform, no streaks." },
    { task: "Water lightly", details: "Settles the mix and wakes up the compost's microbes." },
    { task: "Rest a week if you can", details: "Optional, but the mix mellows and settles before seeds go in." },
  ];

  return (
    <div className="section-stack">
      <SectionIntro
        title="Soil Prep — Mel's Mix"
        subtitle="The square-foot-gardening soil recipe: equal parts compost, coco coir, and vermiculite — with Utah substitutions and per-bed shopping math."
      />

      {/* The recipe, told like the compost card */}
      <div className="compost-recipe">
        <div className="compost-recipe-col greens">
          <h3>Compost <span>· 1/3 · the food</span></h3>
          <p>Dark, crumbly, finished compost — mushroom, homemade, or premium bagged. Never fresh manure or garden soil.</p>
        </div>
        <div className="compost-recipe-plus">+</div>
        <div className="compost-recipe-col browns">
          <h3>Coco coir <span>· 1/3 · the sponge</span></h3>
          <p>Holds moisture between waterings. Choose coir over peat here — neutral pH balances Utah&apos;s alkaline water.</p>
        </div>
        <div className="compost-recipe-plus">+</div>
        <div className="compost-recipe-col extras">
          <h3>Vermiculite <span>· 1/3 · the lungs</span></h3>
          <p>Expanded mica that aerates and holds water. In Orem&apos;s dry air, don&apos;t substitute perlite — it dries out 3–4× faster.</p>
        </div>
      </div>

      <div className="soil-why">
        <h3>Why the mix works</h3>
        <ul>
          <li>Drains fast but never dries instantly — the balance beds need in a high desert.</li>
          <li>Light and fluffy: roots meet no resistance and the bed never compacts.</li>
          <li>Clean ingredients mean almost no soil disease or weed seed.</li>
          <li>Reusable for 3+ years — just refresh each spring with a few inches of compost (your new piles have a job).</li>
        </ul>
      </div>

      {/* Calculator */}
      <div className="soil-calc">
        <h3>How much do I need?</h3>
        <div className="pest-filters soil-bed-tabs">
          {beds.map((entry, index) => (
            <button key={entry.label} className={`pest-filter ${selectedBed === index ? "active" : ""}`} onClick={() => setSelectedBed(index)}>
              {entry.label}
            </button>
          ))}
        </div>
        <div className="soil-calc-grid">
          <div className="soil-calc-numbers">
            <p className="soil-calc-size">{bed.size} — <strong>{bed.totalCuFt} cu ft</strong> of mix</p>
            <div className="micro-timing">
              <span><strong>{bed.perPart} cu ft</strong> compost</span>
              <span><strong>{bed.perPart} cu ft</strong> coco coir</span>
              <span><strong>{bed.perPart} cu ft</strong> vermiculite</span>
            </div>
            <p className="soil-calc-cost">Estimated cost: <strong>{bed.cost}</strong></p>
          </div>
          <div className="soil-calc-list">
            <h4>Shopping list</h4>
            <ul>
              {bed.shopping.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="soil-shopping-note">
              Store tips: call ahead for vermiculite (often back-of-store), check bag sizes between brands (2 vs 2.8 cu ft),
              and coir blocks beat bagged peat on price every time.
            </p>
          </div>
        </div>
      </div>

      {/* Mixing day */}
      <div className="soil-steps">
        <h3>Mixing day, step by step</h3>
        <ol className="compost-method-steps soil-steps-list">
          {steps.map((step) => (
            <li key={step.task}><strong>{step.task}.</strong> {step.details}</li>
          ))}
        </ol>
      </div>

      <div className="compost-columns">
        <div className="compost-utah">
          <h3>Utah adjustments</h3>
          <ul>
            <li><strong>Coir over peat:</strong> Utah water is alkaline; coir&apos;s neutral pH keeps the bed in range.</li>
            <li><strong>Vermiculite is non-negotiable:</strong> in this dry air it holds water 3–4× longer than perlite.</li>
            <li><strong>Compost must be finished:</strong> fresh manure burns seedlings — age homemade compost 6+ months (the Composting section tracks that for you).</li>
          </ul>
        </div>
        <div className="compost-utah">
          <h3>Close the loop</h3>
          <p className="soil-loop-note">
            Once your piles finish, homemade compost replaces the bagged third — Mel&apos;s Mix refreshes drop to
            just coir and vermiculite. That&apos;s the whole system: greenhouse scraps → compost → beds → dinner.
          </p>
          <button
            className="secondary-button"
            onClick={() => askEve("Plan my Mel's Mix soil day: how much of each ingredient for my beds, what to buy versus what my compost piles can cover, and the mixing steps in order.")}
          >
            <Bot size={15} /> Ask Eve to plan my soil day
          </button>
        </div>
      </div>
    </div>
  );
}


function PestManagementSection() {
  const [openPestId, setOpenPestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minSeverity, setMinSeverity] = useState<number | null>(null);

  const query = searchTerm.trim().toLowerCase();
  const filteredPests = pestDatabase.filter((pest) => {
    const matchesSearch =
      !query ||
      pest.name.toLowerCase().includes(query) ||
      pest.identification.some((sign) => sign.toLowerCase().includes(query)) ||
      pest.damageSymptoms.some((symptom) => symptom.toLowerCase().includes(query));
    const matchesSeverity = minSeverity === null || pest.severity >= minSeverity;
    return matchesSearch && matchesSeverity;
  });

  const pressureLabel = (severity: number) => (severity <= 2 ? "Low pressure" : severity <= 3 ? "Moderate pressure" : "High pressure");
  // Eve's data mixes real plant names with internal ids like "eve-0032" — only show the names.
  const readablePlants = (plants: string[]) => plants.filter((plant) => !/^eve-\d+/.test(plant));

  return (
    <div className="section-stack">
      <SectionIntro
        title="Pest Management"
        subtitle="Field guide to the ten troublemakers most likely to find an Orem greenhouse — spot them early, treat them gently, escalate only when you must."
      />

      <div className="pest-toolbar">
        <input
          type="search"
          className="pest-search"
          placeholder="Search by pest, sign, or symptom — try webbing, sticky, or yellow leaves"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="pest-filters">
          {[
            { label: "All", value: null },
            { label: "High pressure", value: 4 },
            { label: "Moderate+", value: 3 },
          ].map((option) => (
            <button
              key={option.label}
              className={`pest-filter ${minSeverity === option.value ? "active" : ""}`}
              onClick={() => setMinSeverity(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pest-list">
        {filteredPests.map((pest) => {
          const open = openPestId === pest.id;
          return (
            <article key={pest.id} className={`pest-card ${open ? "open" : ""}`}>
              <button className="pest-head" onClick={() => setOpenPestId(open ? null : pest.id)}>
                <span className="pest-photo">
                  <img src={`/pests/${pest.id}.jpg`} alt={pest.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                </span>
                <span className="pest-head-body">
                  <strong>{pest.name}</strong>
                  <span className="pest-head-sign">{pest.identification[0]}</span>
                </span>
                <span className={`pest-pressure sev-${pest.severity}`}>{pressureLabel(pest.severity)}</span>
                {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              </button>

              {open && (
                <div className="pest-detail">
                  <div className="pest-columns">
                    <div>
                      <h4>How to spot it</h4>
                      <ul>{pest.identification.map((sign) => <li key={sign}>{sign}</li>)}</ul>
                    </div>
                    <div>
                      <h4>What the damage looks like</h4>
                      <ul>{pest.damageSymptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul>
                    </div>
                  </div>

                  <h4>Treat it naturally first</h4>
                  <div className="pest-treatments">
                    {pest.naturalTreatments.map((treatment) => (
                      <div key={treatment.name} className="pest-treatment">
                        <strong>{treatment.name}</strong>
                        <p>{treatment.description}</p>
                        <span>{treatment.frequency} · effectiveness {treatment.effectiveness}/5</span>
                      </div>
                    ))}
                  </div>

                  {pest.chemicalTreatments.length > 0 && (
                    <>
                      <h4>If it gets ahead of you</h4>
                      <div className="pest-treatments chemical">
                        {pest.chemicalTreatments.map((treatment) => (
                          <div key={treatment.name} className="pest-treatment">
                            <strong>{treatment.name}</strong>
                            <p>{treatment.description}</p>
                            <span>{treatment.frequency} · effectiveness {treatment.effectiveness}/5</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="pest-columns">
                    <div>
                      <h4>Keep it from coming back</h4>
                      <ul>{pest.prevention.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                    </div>
                    <div>
                      <h4>Here in Utah</h4>
                      <p className="pest-utah">{pest.utahNotes}</p>
                      <p className="pest-meta">
                        <strong>Timeline:</strong> {pest.treatmentTimeline}
                        <br />
                        <strong>Edibles:</strong> {pest.safeForEdibles ? "treatments above are food-crop safe" : "use caution on food crops — check labels"}
                      </p>
                    </div>
                  </div>

                  {readablePlants(pest.affectedPlants).length > 0 && (
                    <p className="pest-hosts">
                      <strong>Favorite targets:</strong> {readablePlants(pest.affectedPlants).join(", ")}
                    </p>
                  )}

                  <button
                    className="secondary-button"
                    onClick={() => askEve(`I think I have ${pest.name.toLowerCase()} in my Orem greenhouse. Walk me through confirming it and a treatment plan for this week using my plants and setup.`)}
                  >
                    <Bot size={15} /> Ask Eve about {pest.name.toLowerCase()}
                  </button>
                </div>
              )}
            </article>
          );
        })}
        {!filteredPests.length && <p className="empty-note">No pest matches that search — try a symptom like &quot;sticky&quot; or &quot;webbing&quot;.</p>}
      </div>

      <div className="pest-habits">
        <h3>The habits that prevent most of this</h3>
        <ul>
          <li>Inspect new plants before they come inside, and quarantine anything suspicious.</li>
          <li>Moving air is your cheapest pesticide — most greenhouse pests hate a fan.</li>
          <li>Remove dead leaves and debris; check under leaves weekly while you water.</li>
          <li>Utah heat above 100°F is spider-mite weather — shade cloth and airflow first.</li>
          <li>Start gentle, escalate slowly, and log what worked in the photo journal.</li>
        </ul>
        <p className="pest-resource">
          Deeper help: <a href="https://utahpests.usu.edu" target="_blank" rel="noreferrer">Utah Pests — USU Extension</a> offers free pest ID through your county office.
        </p>
      </div>
    </div>
  );
}
