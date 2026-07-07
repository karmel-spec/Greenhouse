"use client";

/**
 * Per-zone vision blocks — guidance, plant categories, and inspiration for
 * Karmel's special garden zones. Rendered by ZonesSection above the zone's
 * plant grid. Imagery lives in public/zones/ (missing files just hide).
 */

import { Bot } from "lucide-react";
import { plantPhoto } from "@/lib/crop-photos";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

function ZoneFigure({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="zone-figure">
      <img src={src} alt={caption} loading="lazy" onError={(e) => { e.currentTarget.parentElement!.style.display = "none"; }} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/* ------------------------------- Tea Garden ------------------------------ */

const TEA_RE = /\bmint\b|peppermint|spearmint|lemon balm|melissa|chamomile|lemon verbena|bee balm|monarda|anise hyssop|agastache|tulsi|holy basil|lavender|rose\b|raspberry leaf|scented geranium/i;

export function teaPlantSplit<T extends { name: string }>(plants: T[]) {
  const tea = plants.filter((plant) => TEA_RE.test(plant.name) && !/pilea/i.test(plant.name));
  const decorative = plants.filter((plant) => !tea.includes(plant));
  return { tea, decorative };
}

const TEA_PLANTS = [
  { name: "Peppermint & spearmint", note: "The backbone cup — sink them in pots so they don't annex the garden." },
  { name: "Chamomile", note: "Your vault has the seeds; every picked flower is a bedtime cup." },
  { name: "Lemon balm", note: "Bright citrus base note, shade-tolerant, nearly unkillable." },
  { name: "Lemon verbena", note: "The finest lemon tea leaf there is — pot it and winter it indoors." },
  { name: "Bee balm (Monarda)", note: "Earl-Grey bergamot notes and hummingbirds while it steeps." },
  { name: "Anise hyssop", note: "Sweet licorice leaves; gorgeous purple spikes for the back row." },
  { name: "Rose", note: "Petals in the cup, hips for winter vitamin-C tea, romance for the garden." },
  { name: "Lavender", note: "A few buds deepen any blend — and it loves Orem's dry air." },
];

const TEA_DECOR = [
  { name: "Sweet peas", note: "The cottage scent, climbing a willow obelisk by the table." },
  { name: "Hollyhocks", note: "The English-cottage exclamation marks along the greenhouse wall." },
  { name: "Foxglove & delphinium", note: "Cottage drama for the back border (admire, don't steep!)." },
  { name: "English daisies & forget-me-nots", note: "The tablecloth layer — low, soft, sentimental." },
  { name: "Violas & pansies", note: "Edible faces to float on top of a guest's cup." },
  { name: "Cosmos", note: "Endless airy cut flowers for the tea-table vase." },
];

const TEA_PARTY_TIPS = [
  "Keep a basket with a teapot, strainer, and four cups in the greenhouse — spontaneity is the whole secret.",
  "Harvest the tea together: guests pick their own mint and chamomile, then watch it steep. Nobody forgets that cup.",
  "One good question beats ten: try \"What's growing in your life right now?\" — the garden does the icebreaking.",
  "Sun tea for summer: a jar of leaves and water set out at breakfast is ready by afternoon company.",
  "Dry summer surplus in bundles; winter tea from a garden you grew is hospitality out of season.",
  "Keep gatherings small — two or three chairs among the plants beats twelve at a table.",
];

export function TeaGardenVision() {
  return (
    <div className="zone-vision">
      <p className="zone-vision-lead">
        The vision: an <strong>English cottage tea garden</strong> — one bed that fills the teapot, one that fills the
        vase, and a little table where friendships steep as long as the leaves.
      </p>
      <div className="zone-figures">
        <ZoneFigure src="/zones/tea-party.jpg" caption="The destination: afternoon tea, greenhouse edition" />
        <ZoneFigure src="/zones/tea-cottage.jpg" caption="The look: cottage-garden abundance" />
      </div>

      <h4 className="zone-vision-subhead">☕ The tea bed — plants that fill the pot</h4>
      <div className="zone-idea-grid">
        {TEA_PLANTS.map((plant) => {
          const photo = plantPhoto(plant.name);
          return (
            <article key={plant.name} className="zone-idea-card">
              {photo && <img src={photo} alt={plant.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div><strong>{plant.name}</strong><p>{plant.note}</p></div>
            </article>
          );
        })}
      </div>

      <h4 className="zone-vision-subhead">🌸 The cottage bed — beauty for the table</h4>
      <div className="zone-idea-grid">
        {TEA_DECOR.map((plant) => {
          const photo = plantPhoto(plant.name);
          return (
            <article key={plant.name} className="zone-idea-card">
              {photo && <img src={photo} alt={plant.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div><strong>{plant.name}</strong><p>{plant.note}</p></div>
            </article>
          );
        })}
      </div>

      <h4 className="zone-vision-subhead">🫖 Tea parties, connection & conversation</h4>
      <ul className="zone-vision-list">
        {TEA_PARTY_TIPS.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>
      <button
        className="secondary-button"
        onClick={() => askEve("Help me plan a small greenhouse tea party for 3 friends in Orem: a simple menu from my garden, which of my plants to harvest for the tea, a table setting idea, and two conversation questions that help people really connect.")}
      >
        <Bot size={15} /> Ask Eve to plan a tea party
      </button>
    </div>
  );
}

/* ---------------------------- Meditation Garden -------------------------- */

const MEDITATION_TIPS = [
  { title: "The 3-breath doorway", tip: "Before entering, pause at the threshold for three slow breaths. The garden starts when the hurry stops." },
  { title: "Why succulents belong here", tip: "They are patience made visible — slow, unhurried, storing up in good seasons for the dry ones. Sit with that." },
  { title: "One-plant attention", tip: "Choose a single succulent and study it for two minutes — the geometry of an echeveria rosette is a mandala that waters itself." },
  { title: "Hands-in-soil grounding", tip: "5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you're grateful for. The garden supplies all of them." },
  { title: "Water as meditation", tip: "Water the succulents slowly, once — sparingly, like they prefer. Doing one thing completely is the whole practice." },
  { title: "Leave a stone", tip: "Keep a small bowl of pebbles; place one each visit for something you're releasing. Empty the bowl at each season's end." },
];

export function MeditationVision() {
  return (
    <div className="zone-vision">
      <p className="zone-vision-lead">
        The vision: the quietest corner you own — your succulent collection gathered into a living stillness practice.
        Nothing here needs daily anything; that&apos;s the lesson.
      </p>
      <div className="zone-figures">
        <ZoneFigure src="/zones/meditation.jpg" caption="Stillness by design — let the arrangement invite the pause" />
      </div>
      <div className="zone-tip-grid">
        {MEDITATION_TIPS.map((entry) => (
          <article key={entry.title} className="zone-tip-card">
            <strong>{entry.title}</strong>
            <p>{entry.tip}</p>
          </article>
        ))}
      </div>
      <button
        className="secondary-button"
        onClick={() => askEve("Guide me through a 5-minute meditation in my succulent meditation garden right now — slow, garden-anchored, ending with one intention for the day.")}
      >
        <Bot size={15} /> Ask Eve for a 5-minute garden meditation
      </button>
    </div>
  );
}

/* ---------------------------- Apothecary Garden -------------------------- */

const APOTHECARY_VAULT_SEEDS = [
  { name: "Chamomile", note: "Bedtime tea and skin-soothing rinses — sow a wide patch." },
  { name: "Calendula", note: "The salve flower — petals infused in oil heal almost anything topical." },
  { name: "Borage", note: "Cheerful cucumber-flavored flowers; traditional courage herb." },
  { name: "Feverfew", note: "The old headache herb; self-sows politely once established." },
  { name: "Valerian", note: "Sleep-tea root — patient plant, two seasons to harvest." },
];

const APOTHECARY_BUY = [
  "Echinacea purpurea — the immune backbone, gorgeous and Utah-proof (wishlisted)",
  "Calendula 'Resina' — the high-resin salve variety (wishlisted)",
  "Medicinal white yarrow — first-aid poultices, thrives on drought (wishlisted)",
  "Holy basil / tulsi — calming adaptogen tea for the greenhouse (wishlisted)",
  "Valerian plant — skip the two-season wait (wishlisted)",
  "Marshmallow — the soothing-root classic (wishlisted)",
  "St. John's wort 'Topas' — sunshine oil flower, keep it contained (wishlisted)",
];

export function ApothecaryVision() {
  return (
    <div className="zone-vision">
      <p className="zone-vision-lead">
        The vision: a working <strong>physic garden</strong> — aloe on the shelf for burns, calendula in the oil jar,
        chamomile in the tea tin. Your aloe vera now lives here, and your seed vault already holds real medicine:
      </p>
      <div className="zone-figures">
        <ZoneFigure src="/zones/apothecary.jpg" caption="A physic garden — medicine in rows" />
      </div>
      <h4 className="zone-vision-subhead">🌼 Already in your seed vault — sow these here</h4>
      <div className="zone-idea-grid">
        {APOTHECARY_VAULT_SEEDS.map((seed) => {
          const photo = plantPhoto(seed.name);
          return (
            <article key={seed.name} className="zone-idea-card">
              {photo && <img src={photo} alt={seed.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div><strong>{seed.name}</strong><p>{seed.note}</p></div>
            </article>
          );
        })}
      </div>
      <h4 className="zone-vision-subhead">🛒 To complete the apothecary (all on your wishlist)</h4>
      <ul className="zone-vision-list">
        {APOTHECARY_BUY.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="zone-vision-note">
        Everything above is proven in zone 6b high desert. Gentle reminder from your careful gardener: homegrown
        remedies are for comfort-level care — teas, salves, soothing — not a substitute for a doctor when it matters.
      </p>
      <button
        className="secondary-button"
        onClick={() => askEve("Plan my apothecary garden bed in Orem: layout for aloe (potted), echinacea, calendula, yarrow, chamomile, tulsi, valerian and marshmallow, plus a first-year harvest plan — what to dry, what to infuse in oil, and what to tincture.")}
      >
        <Bot size={15} /> Ask Eve to plan the apothecary bed
      </button>
    </div>
  );
}

/* ------------------------------ Fairy Garden ----------------------------- */

const FAIRY_PLANTS = [
  { name: "Snapdragons", note: "Squeeze the blossom and the dragon talks — the original kid magnet." },
  { name: "Lamb's ear", note: "The plant children pet like a kitten. Softest leaf in any garden." },
  { name: "Strawberry", note: "Alpine strawberries: tiny, sweet, and legally fairy food." },
  { name: "Cherry tomatoes", note: "'Sungold' — garden candy kids graze straight off the vine." },
  { name: "Sunflower", note: "Plant a circle of mammoths = a sunflower house by August." },
  { name: "Creeping thyme", note: "The fairy lawn — walkable, fragrant, blooms purple." },
  { name: "Hens & chicks", note: "A succulent 'family' children can name and count." },
  { name: "Johnny jump-ups", note: "Tiny smiling faces, edible on cupcakes." },
  { name: "Nasturtium", note: "Peppery flowers kids dare each other to eat — and do." },
  { name: "Forget-me-nots", note: "Fairy-sized blue, self-sows into every crack like magic." },
];

const FAIRY_IDEAS = [
  "A fairy door on the greenhouse wall or a tree base — doors first, fairies follow.",
  "Pebble paths and a mirror 'pond' with a twig bridge for crossings.",
  "Teacup planters and a thimble birdbath — raid the thrift store together.",
  "Twig furniture afternoons: chairs from sticks, tables from bark, beds from moss.",
  "Glow-in-the-dark pebbles for 'fairy lights' that charge in the day.",
  "A tiny mailbox — children leave notes; fairies (grandmas) answer in very small handwriting.",
  "A bug hotel nearby: fairies employ ladybugs, everyone knows this.",
  "Let them name every hen-and-chick; the naming is the owning.",
];

export function FairyGardenVision() {
  return (
    <div className="zone-vision">
      <p className="zone-vision-lead">
        The vision: the garden where the grandkids head first — plants chosen for small hands, big eyes, and the firm
        belief that something magical lives behind a tiny door.
      </p>
      <div className="zone-figures">
        <ZoneFigure src="/zones/fairy.jpg" caption="Doors first — fairies follow" />
      </div>
      <h4 className="zone-vision-subhead">🌷 Plants children fall in love with</h4>
      <div className="zone-idea-grid">
        {FAIRY_PLANTS.map((plant) => {
          const photo = plantPhoto(plant.name);
          return (
            <article key={plant.name} className="zone-idea-card">
              {photo && <img src={photo} alt={plant.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <div><strong>{plant.name}</strong><p>{plant.note}</p></div>
            </article>
          );
        })}
      </div>
      <h4 className="zone-vision-subhead">🧚 Make it magical</h4>
      <ul className="zone-vision-list">
        {FAIRY_IDEAS.map((idea) => <li key={idea}>{idea}</li>)}
      </ul>
      <button
        className="secondary-button"
        onClick={() => askEve("Design a fairy garden corner in Orem for young grandchildren: layout for snapdragons, lamb's ear, alpine strawberries, creeping thyme and a sunflower house, plus 3 weekend crafts (fairy door, twig furniture, fairy mailbox) with simple steps.")}
      >
        <Bot size={15} /> Ask Eve to design the fairy corner
      </button>
    </div>
  );
}
