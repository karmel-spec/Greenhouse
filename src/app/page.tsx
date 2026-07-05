"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Droplets,
  Filter,
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
  evePrompts,
  learningModules,
  magicActions,
  microgreenTrays,
  navItems,
  plants,
  quoteTopics,
  reminderTypes,
  seeds,
  SectionKey,
  styleModes,
  tasks,
  uploadReadyFields,
  wishlistItems,
  zones,
} from "@/lib/mock-data";

const today = "May 12, 2025";

type PlantPhotoRecord = {
  id: string;
  plant: string;
  zone: string;
  fileName: string;
  imageUrl?: string;
  health: "Thriving" | "Watch" | "Needs attention";
  identificationStatus: "Needs ID" | "User labeled" | "Vision draft";
  confidence?: number;
  candidates?: string[];
  source?: "local mock" | "openai vision" | "hermes eve";
  signal: string;
  water: string;
  sun: string;
  pruning: string;
  recommendation: string;
  recordedAt: string;
};

export default function Home() {
  const [active, setActive] = useState<SectionKey>("today");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = useMemo(() => navItems.find((item) => item.key === active), [active]);

  const chooseSection = (key: SectionKey) => {
    setActive(key);
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
            <p className="eyebrow">Karmel's Garden OS</p>
            <h1>{active === "today" ? "Today in the Garden" : current?.label}</h1>
          </div>
          <div className="weather-pill">
            <CloudSun size={18} />
            <span>Orem, Utah</span>
            <strong>58°F</strong>
          </div>
        </header>

        <div className="content-grid">
          <section className="main-content">{renderSection(active)}</section>
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
      <h2>Karmel's<br />Garden OS</h2>
      <p>Roots, Light & Growth</p>
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
        <p className="eve-note">
          Your basil cuttings are rooting well. Consider starting a fresh tray of sunflower microgreens, then take one
          progress photo before evening.
        </p>
        <div className="prompt-list">
          {evePrompts.slice(0, 6).map((prompt) => (
            <button key={prompt}>{prompt}</button>
          ))}
        </div>
        <div className="chat-box">
          <span>Ask Eve anything...</span>
          <Send size={16} />
        </div>
      </div>
    </aside>
  );
}

function renderSection(active: SectionKey) {
  switch (active) {
    case "today":
      return <TodaySection />;
    case "operations":
      return <OperationsSection />;
    case "microgreens":
      return <MicrogreensSection />;
    case "apothecary":
      return <ApothecarySection />;
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
      return <Wishlist />;
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
      return <TodaySection />;
  }
}

function TodaySection() {
  return (
    <div className="section-stack">
      <div className="hero-journal">
        <div>
          <p className="script">Good morning, Garden Leader</p>
          <div className="day-meta">
            <span>{today}</span>
            <span>Orem, Utah</span>
            <span>Mostly sunny</span>
          </div>
        </div>
        <SunMedium className="sun-icon" size={34} />
      </div>

      <div className="dashboard-grid">
        <JournalCard title="Today's Garden Plan" className="task-card">
          {tasks.map((task) => (
            <div className="task-row" key={task.title}>
              <span className="task-dot" />
              <span>{task.title}</span>
              <time>{task.time}</time>
            </div>
          ))}
          <button className="text-link">View full task list <ArrowRight size={14} /></button>
        </JournalCard>

        <JournalCard title="Greenhouse Snapshot" className="wide-card">
          <div className="greenhouse-scene">
            <div className="scene-window" />
            <div className="scene-benches" />
            <div className="scene-plants" />
            <div className="metric-strip">
              <Metric value="74°F" label="Inside Temp" />
              <Metric value="62%" label="Humidity" />
              <Metric value="Good" label="Air Quality" />
            </div>
          </div>
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
          {zones.slice(0, 6).map((zone) => (
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

function MicrogreensSection() {
  return (
    <div className="lab-mode">
      <SectionIntro title="Microgreens Studio" subtitle="Track, manage, and harvest every tray with clear lab-style signals." />
      <div className="toolbar">
        <div className="search-field"><Search size={16} /> Search trays...</div>
        <button className="primary-button"><Plus size={16} /> New Tray</button>
      </div>
      <div className="stat-grid">
        {[
          ["7", "Active trays"],
          ["2", "Harvesting soon"],
          ["65", "Completed"],
          ["3", "Favorites"],
        ].map(([value, label]) => <MetricCard key={label} value={value} label={label} />)}
      </div>
      <div className="tray-table">
        {microgreenTrays.map((tray) => (
          <div className="tray-row" key={tray.name}>
            <div className="tray-thumb" />
            <strong>{tray.name}</strong>
            <span>{tray.stage}</span>
            <span>{tray.days} days</span>
            <span>{tray.harvest}</span>
            <div className="progress"><i style={{ width: `${tray.progress}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="timeline">
        {["Soak", "Germinate", "Blackout", "Light", "Grow", "Harvest"].map((step) => <span key={step}>{step}</span>)}
      </div>
      <div className="three-col">
        <LabCondition icon={<Droplets />} value="71°F" label="Temperature" />
        <LabCondition icon={<Wind />} value="60%" label="Humidity" />
        <LabCondition icon={<CheckCircle2 />} value="Good" label="Air Flow" />
      </div>
    </div>
  );
}

function ApothecarySection() {
  return (
    <div className="apothecary-mode">
      <SectionIntro title="Apothecary Garden" subtitle="Grow medicine. Grow wellness. Grow light." />
      <div className="herb-grid">
        {["Chamomile", "Lavender", "Peppermint", "Lemon Balm", "Rosemary", "Calendula"].map((herb) => (
          <div className="herb-card" key={herb}>
            <div className="pressed-plant small" />
            <h3>{herb}</h3>
            <p>Uses: calming, tea, skin care, and gentle home preparations.</p>
          </div>
        ))}
      </div>
      <JournalCard title="Herb Spotlight">
        <h3>Lavender</h3>
        <p>Best harvested in the morning after dew dries. Dry bundles in shade with good airflow.</p>
      </JournalCard>
    </div>
  );
}

function PlantLibrary() {
  return <CardCollection title="Plant Library" subtitle="Track each plant, tray, container, garden bed, and Eve's guidance." items={plants.map((plant) => `${plant.name} • ${plant.variety} • ${plant.location} • ${plant.status}`)} />;
}

function ZonesSection() {
  return <CardCollection title="Garden Zones" subtitle="Each zone stores purpose, mood, design notes, plants, tasks, photos, quotes, goals, and Eve recommendations." items={zones.map((zone) => `${zone.name} • ${zone.mood} • ${zone.status} • ${zone.plants} plants`)} />;
}

function SeedLibrary() {
  return (
    <div className="section-stack">
      <SectionIntro title="Seed Packet Library" subtitle="Photo-ready seed inventory with filters, planting suggestions, low inventory, and wishlist links." />
      <div className="toolbar">
        <div className="search-field"><Search size={16} /> Search seeds...</div>
        <button className="secondary-button"><Filter size={16} /> Filter</button>
        <button className="primary-button"><Plus size={16} /> Add Seed Packet</button>
      </div>
      <div className="seed-grid">
        {seeds.map((seed) => (
          <div className="seed-card" key={seed.name}>
            <div className="seed-art" />
            <h3>{seed.name}</h3>
            <p>{seed.variety}</p>
            <span>{seed.count} seeds</span>
          </div>
        ))}
      </div>
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

function Wishlist() {
  return <CardCollection title="Wishlist & Garden Dreams Board" subtitle="Collect inspiration, links, prices, priorities, zones, and Eve recommendation notes." items={wishlistItems.map((item) => `${item.name} • ${item.category} • ${item.price} • ${item.priority}`)} />;
}

function Propagation() {
  return <CardCollection title="Propagation Lab" subtitle="Track cuttings, rooting stage, pot-up dates, misting notes, photos, and Eve's next actions." items={["Basil cuttings • Rooting • Pot up in 3 days", "Rosemary cuttings • Callusing • Mist today", "Pothos starts • Roots visible • Move to soil soon", "Mint divisions • Transplanted • Watch moisture"]} />;
}

function GardenMap() {
  return (
    <div className="section-stack">
      <SectionIntro title="Aerial Garden Map" subtitle="Upload a property image, draw zones, mark sun and shade, place plants, and compare current yard with the dream garden." />
      <div className="upload-zone"><Upload size={28} /><strong>Upload Google Maps or Google Earth screenshot</strong><span>Placeholder map tools are ready for drawing, labeling, exporting, and version history.</span></div>
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
  const [batchNote, setBatchNote] = useState("Upload today's garden photos. The app will save them for review, but plant names need to be labeled until real Eve vision is connected.");

  useEffect(() => {
    const saved = window.localStorage.getItem("karmels-garden-photo-history");
    if (saved) {
      setRecords((JSON.parse(saved) as PlantPhotoRecord[]).map((record) => ({
        ...record,
        plant: record.identificationStatus ? record.plant : "Unidentified plant",
        identificationStatus: record.identificationStatus ?? "Needs ID",
      })));
      setBatchNote("Your saved plant history is loaded. Add today's batch whenever you're ready.");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("karmels-garden-photo-history", JSON.stringify(records.map(({ imageUrl, ...record }) => record)));
  }, [records]);

  const analyzePhotos = async (files: FileList | null) => {
    if (!files?.length) return;

    const zoneNames = ["Unassigned zone", "Greenhouse", "Propagation Shelf", "Tea Garden", "Herb Garden", "Microgreens Shelf"];
    const healthPatterns: PlantPhotoRecord["health"][] = ["Thriving", "Watch", "Needs attention"];
    const uploadedFiles = Array.from(files);
    setIsAnalyzing(true);
    setBatchNote(`Reviewing ${uploadedFiles.length} photos with Eve's diagnosis route...`);

    const localDraftRecords = await Promise.all(uploadedFiles.map(async (file, index) => {
      const health = healthPatterns[(records.length + index) % healthPatterns.length];

      const guidance = {
        Thriving: {
          signal: "Draft visual note: the visible leaves appear evenly colored with decent posture. Confirm after labeling the plant.",
          water: "Keep current watering rhythm.",
          sun: "Light looks balanced.",
          pruning: "No pruning needed today.",
          recommendation: "Record as healthy growth and compare again in 3 days.",
        },
        Watch: {
          signal: "Draft visual note: possible droop or uneven color. Label the plant so Eve can compare it to the right care pattern.",
          water: "Check soil before watering; avoid guessing.",
          sun: "Give bright indirect light for the next day.",
          pruning: "Remove only clearly spent leaves.",
          recommendation: "Add one follow-up photo tomorrow from the same angle.",
        },
        "Needs attention": {
          signal: "Draft visual note: possible stress signs such as yellowing, dry edges, crowding, or harsh light exposure.",
          water: "Do a finger-depth moisture check and adjust today.",
          sun: "Move out of harsh afternoon sun if leaves are curling.",
          pruning: "Prune damaged foliage after watering needs are corrected.",
          recommendation: "Create a task for Eve to re-check this plant within 24 hours.",
        },
      }[health];

      return {
        id: `${Date.now()}-${file.name}-${index}`,
        plant: "Unidentified plant",
        zone: zoneNames[(records.length + index) % zoneNames.length],
        fileName: file.name,
        imageUrl: URL.createObjectURL(file),
        health,
        identificationStatus: "Needs ID" as const,
        confidence: 0,
        candidates: [],
        source: "local mock" as const,
        recordedAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
        ...guidance,
      };
    }));

    try {
      const images = await Promise.all(uploadedFiles.map(async (file) => ({
        fileName: file.name,
        dataUrl: await readFileAsDataUrl(file),
      })));

      const response = await fetch("/api/eve/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          context: {
            location: "Orem, Utah",
            date: new Date().toISOString(),
            knownPlants: plants.map((plant) => ({
              name: plant.name,
              variety: plant.variety,
              location: plant.location,
              status: plant.status,
            })),
            zones: zones.map((zone) => zone.name),
            priorCorrections: records
              .filter((record) => record.identificationStatus === "User labeled")
              .slice(0, 25)
              .map((record) => ({ plant: record.plant, zone: record.zone, fileName: record.fileName })),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Diagnosis failed");
      }

      const diagnoses = Array.isArray(result.diagnoses) ? result.diagnoses : [];
      const aiRecords = localDraftRecords.map((record, index) => {
        const diagnosis = diagnoses[index];
        if (!diagnosis) return record;

        const candidates = Array.isArray(diagnosis.plant_candidates)
          ? diagnosis.plant_candidates.map((candidate: { name?: string } | string) =>
              typeof candidate === "string" ? candidate : candidate.name,
            ).filter(Boolean)
          : [];
        const bestCandidate = candidates[0];
        const confidence = typeof diagnosis.confidence === "number" ? diagnosis.confidence : 0;
        const health = normalizeHealth(diagnosis.health_status, record.health);

        return {
          ...record,
          plant: bestCandidate && confidence >= 0.55 ? bestCandidate : "Unidentified plant",
          zone: diagnosis.zone_guess && zones.some((zone) => zone.name === diagnosis.zone_guess)
            ? diagnosis.zone_guess
            : record.zone,
          health,
          identificationStatus: bestCandidate && confidence >= 0.55 ? "Vision draft" as const : "Needs ID" as const,
          confidence,
          candidates,
          source: result.provider === "openai" ? "openai vision" as const : "hermes eve" as const,
          signal: diagnosis.visual_signals ?? record.signal,
          water: diagnosis.water_recommendation ?? record.water,
          sun: diagnosis.sun_recommendation ?? record.sun,
          pruning: diagnosis.pruning_recommendation ?? record.pruning,
          recommendation: diagnosis.recommended_actions?.join(" ") ?? diagnosis.recommendation ?? record.recommendation,
        };
      });

      setRecords((current) => [...aiRecords, ...current]);
      setBatchNote(
        result.mode === "configured"
          ? `${aiRecords.length} photos were analyzed. Review candidate plant names before treating them as confirmed.`
          : `${aiRecords.length} photos were saved with local draft notes. Add OPENAI_API_KEY to enable real vision analysis.`,
      );
    } catch (error) {
      setRecords((current) => [...localDraftRecords, ...current]);
      setBatchNote(`${localDraftRecords.length} photos were saved, but AI analysis did not complete. ${error instanceof Error ? error.message : "Try again after configuration."}`);
    } finally {
      setIsAnalyzing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updateRecord = (id: string, updates: Partial<PlantPhotoRecord>) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              ...updates,
              identificationStatus:
                updates.plant || updates.zone ? "User labeled" : record.identificationStatus,
            }
          : record,
      ),
    );
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
                {record.imageUrl ? <img src={record.imageUrl} alt={`${record.plant} upload`} /> : <Camera size={28} />}
              </div>
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
      <p className="eyebrow">Roots, Light & Growth</p>
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
