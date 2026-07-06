/**
 * Community Garden planning for the vacant lot next door.
 *
 * Lot facts come from real Utah County parcel boundaries (Utah SGID
 * statewide parcel service), measured 2026-07-06. The parcel polygon is a
 * clean rectangle, so the planner treats it as 83 ft (E–W) x 105 ft (N–S).
 */

export const LOT = {
  parcelId: "55:878:0002",
  address: "138 W 1880 S, Orem",
  widthFt: 83, // east-west
  depthFt: 105, // north-south, street on the south edge
  areaSqFt: 8704,
  acres: 0.2,
  ownership: "Privately owned",
  source: "Utah County parcel boundaries (Utah SGID)",
  parcelUrl: "https://maps.utahcounty.gov/ParcelMap/ParcelMap.html",
} as const;

export type PlotOption = { key: string; label: string; w: number; h: number };

export const PLOT_OPTIONS: PlotOption[] = [
  { key: "4x8", label: "4 × 8 ft beds", w: 8, h: 4 },
  { key: "4x10", label: "4 × 10 ft beds", w: 10, h: 4 },
  { key: "10x10", label: "10 × 10 ft plots", w: 10, h: 10 },
  { key: "12x12", label: "12 × 12 ft plots", w: 12, h: 12 },
];

export type CommunityPlot = { id: string; x: number; y: number; w: number; h: number };

export type CommonArea = { id: string; label: string; x: number; y: number; w: number; h: number };

export type CommunityLayout = {
  plots: CommunityPlot[];
  common: CommonArea[];
  plotW: number;
  plotH: number;
  pathFt: number;
  growingSqFt: number;
};

const MARGIN = 4; // perimeter path inside the fence, ft
const COMMON_DEPTH = 16; // shared strip along the street (south) edge, ft

/**
 * Lays out plots on the real lot: a shared strip by the street for the
 * gathering area / shed / compost / water, then rows of beds separated by
 * paths. Tries both bed orientations and keeps whichever fits more plots.
 */
export function layoutLot(option: PlotOption, pathFt: number): CommunityLayout {
  const usableW = LOT.widthFt - MARGIN * 2;
  const usableH = LOT.depthFt - MARGIN * 2 - COMMON_DEPTH;

  const build = (plotW: number, plotH: number): CommunityPlot[] => {
    const cols = Math.floor((usableW + pathFt) / (plotW + pathFt));
    const rows = Math.floor((usableH + pathFt) / (plotH + pathFt));
    if (cols < 1 || rows < 1) return [];
    const startX = MARGIN + (usableW - (cols * plotW + (cols - 1) * pathFt)) / 2;
    const startY = MARGIN + (usableH - (rows * plotH + (rows - 1) * pathFt)) / 2;
    const plots: CommunityPlot[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        plots.push({
          id: `p${r}-${c}`,
          x: startX + c * (plotW + pathFt),
          y: startY + r * (plotH + pathFt),
          w: plotW,
          h: plotH,
        });
      }
    }
    return plots;
  };

  const a = build(option.w, option.h);
  const b = option.w === option.h ? [] : build(option.h, option.w);
  const plots = b.length > a.length ? b : a;
  const plotW = plots[0]?.w ?? option.w;
  const plotH = plots[0]?.h ?? option.h;

  const commonY = LOT.depthFt - MARGIN - COMMON_DEPTH;
  const common: CommonArea[] = [
    { id: "gathering", label: "Gathering area", x: MARGIN, y: commonY, w: 34, h: COMMON_DEPTH },
    { id: "shed", label: "Tool shed", x: MARGIN + 36, y: commonY, w: 12, h: 10 },
    { id: "water", label: "Water station", x: MARGIN + 36, y: commonY + 11, w: 12, h: 5 },
    { id: "compost", label: "Compost bays", x: MARGIN + 50, y: commonY, w: LOT.widthFt - MARGIN * 2 - 50, h: COMMON_DEPTH },
  ];

  return {
    plots,
    common,
    plotW,
    plotH,
    pathFt,
    growingSqFt: plots.length * plotW * plotH,
  };
}

export type ChecklistItem = {
  key: string;
  title: string;
  detail: string;
  link?: { label: string; href: string };
};

export const COMMUNITY_CHECKLIST: ChecklistItem[] = [
  {
    key: "owner",
    title: "Find the owner and start the conversation",
    detail:
      "The lot is privately owned (parcel 55:878:0002). Look up the owner on the Utah County parcel map or ask the neighbors on either side. Many owners like the idea of an idle lot being mowed, watered, insured, and loved.",
    link: { label: "Utah County parcel map", href: LOT.parcelUrl },
  },
  {
    key: "agreement",
    title: "Put it in writing",
    detail:
      "A one-page garden-use agreement: term (year-to-year is normal), who carries liability insurance, who pays water, and what happens if the lot sells. Keep it renewable each spring.",
  },
  {
    key: "city",
    title: "Check with Orem City",
    detail:
      "Ask Orem Development Services whether a neighborhood community garden on a residential lot needs any permit, and what the rules are for sheds, fences, and water hookups.",
    link: { label: "orem.gov", href: "https://orem.gov" },
  },
  {
    key: "water",
    title: "Solve water before anything else",
    detail:
      "A garden this size needs roughly an inch of water a week in Utah's dry summers. Options: a dedicated irrigation meter from the city, or a metered line from a neighboring house with costs shared by plot fees. Drip lines stretch every gallon.",
  },
  {
    key: "soil",
    title: "Test the soil",
    detail:
      "Send a sample to the USU Analytical Lab before planting — old lots can hide poor or salty soil. If results are bad, go raised beds with imported garden soil instead of tilling.",
    link: { label: "USU soil testing", href: "https://usual.usu.edu" },
  },
  {
    key: "insurance",
    title: "Line up liability coverage",
    detail:
      "A small garden-club liability policy (or a rider on the owner's policy) plus a simple waiver for every plot holder keeps the owner comfortable and the garden durable.",
  },
  {
    key: "neighbors",
    title: "Recruit the neighbors",
    detail:
      "Fill the plot map below with real names. Seasonal plot fees of $25–40 cover water and seeds. A short season kickoff meeting sets expectations: keep your plot weeded, share the paths, harvest what you grow.",
  },
  {
    key: "build",
    title: "Hold a build weekend",
    detail:
      "One or two Saturdays: stake the plots, lay wood-chip paths, build beds, set the shed and compost bays, and hang a hand-painted sign. End it with a potluck in the gathering area.",
  },
];
