/**
 * Quick-reference care facts per plant, matched by name keywords. Powers the
 * fact grid on plant detail cards and the category grouping in the Plant
 * Library. Written for Orem, Utah (zone 6b, high desert).
 */

export type PlantCategory =
  | "Vegetables"
  | "Herbs"
  | "Flowers"
  | "Shrubs & Trees"
  | "Houseplants"
  | "Groundcovers & Vines"
  | "Fruit"
  | "Succulents"
  | "Other";

export type PlantCare = {
  category: PlantCategory;
  type: string; // Annual / Perennial / Shrub / Houseplant...
  water: string;
  sun: string; // includes indoor/outdoor placement
  propagate: string;
};

const HOUSEPLANT_WATER = "Water when the top inch of soil is dry; less in winter.";

const CARE: { match: RegExp; care: PlantCare }[] = [
  // ——— Houseplants ———
  { match: /aglaonema|chinese evergreen/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Bright indirect light, indoors; no direct sun", propagate: "Yes — stem cuttings in water or division" } },
  { match: /calathea|goeppertia|prayer plant|maranta/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Keep evenly moist with filtered/distilled water; hates drying out", sun: "Medium indirect light, indoors; direct sun scorches", propagate: "Yes — division when repotting" } },
  { match: /fittonia|nerve plant/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Keep moist; dramatic wilt when thirsty but recovers fast", sun: "Low–medium indirect light, indoors; great terrarium plant", propagate: "Yes — stem cuttings root easily in water" } },
  { match: /dracaena|corn plant/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER + " Sensitive to fluoride — filtered water helps", sun: "Bright indirect light, indoors", propagate: "Yes — cane/stem cuttings" } },
  { match: /parlor palm|chamaedorea/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Low–bright indirect light, indoors; tolerates shade", propagate: "Not practical — grown from seed" } },
  { match: /ponytail palm|beaucarnea/i, care: { category: "Succulents", type: "Succulent (houseplant)", water: "Water deeply, then let dry completely — the bulb stores water", sun: "Bright light to some direct sun, indoors", propagate: "Difficult — offsets (pups) occasionally" } },
  { match: /pothos|epipremnum/i, care: { category: "Houseplants", type: "Tender perennial vine (houseplant)", water: HOUSEPLANT_WATER, sun: "Low–bright indirect light, indoors", propagate: "Yes — node cuttings in water, very easy" } },
  { match: /philodendron/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Medium–bright indirect light, indoors", propagate: "Yes — node cuttings in water" } },
  { match: /monstera/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Bright indirect light, indoors", propagate: "Yes — node cuttings with aerial root" } },
  { match: /snake plant|sansevieria|dracaena trifasciata/i, care: { category: "Succulents", type: "Succulent (houseplant)", water: "Every 2–4 weeks; let dry fully — overwatering is the only real killer", sun: "Any light, indoors; tolerates low light", propagate: "Yes — leaf cuttings or division" } },
  { match: /spider plant|chlorophytum/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Bright indirect light, indoors", propagate: "Yes — pot up the plantlets (babies)" } },
  { match: /peace lily|spathiphyllum/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Keep lightly moist; droops to tell you it's thirsty", sun: "Low–medium indirect light, indoors", propagate: "Yes — division" } },
  { match: /african violet|saintpaulia/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Bottom-water when surface dries; keep water off leaves", sun: "Bright indirect light, indoors (east window ideal)", propagate: "Yes — leaf cuttings" } },
  { match: /ficus|rubber plant|fiddle/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Bright indirect light, indoors; hates being moved", propagate: "Yes — stem cuttings" } },
  { match: /orchid|phalaenopsis/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Soak bark weekly, drain fully; never leave standing water", sun: "Bright indirect light, indoors", propagate: "Occasionally — keikis (baby plants on spikes)" } },
  { match: /tradescantia|wandering|inch plant/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: HOUSEPLANT_WATER, sun: "Bright indirect light, indoors", propagate: "Yes — stem cuttings root in days" } },
  { match: /peperomia/i, care: { category: "Houseplants", type: "Tender perennial (houseplant)", water: "Let top half of soil dry; semi-succulent", sun: "Medium–bright indirect light, indoors", propagate: "Yes — leaf or stem cuttings" } },
  { match: /begonia/i, care: { category: "Flowers", type: "Tender perennial (annual outdoors, houseplant in winter)", water: "Evenly moist, never soggy; water at the base", sun: "Part shade outdoors / bright indirect indoors", propagate: "Yes — stem or leaf cuttings" } },

  // ——— Succulents ———
  { match: /succulent|echeveria|sedum(?!.*groundcover)|jade|crassula|aloe|haworthia|sempervivum|hens.?and.?chicks/i, care: { category: "Succulents", type: "Succulent (tender — indoors in Utah winters unless hardy sedum/sempervivum)", water: "Soak, then let dry completely — every 2–3 weeks", sun: "Bright light / several hours of sun; indoors or out in summer", propagate: "Yes — leaf cuttings or offsets, very easy" } },
  { match: /moss rose|portulaca/i, care: { category: "Flowers", type: "Annual (heat-loving succulent)", water: "Low — drought-proof; let soil dry between waterings", sun: "Full sun, outdoors; loves Utah heat", propagate: "Yes — stem cuttings or self-sown seed" } },

  // ——— Herbs ———
  { match: /basil|tulsi/i, care: { category: "Herbs", type: "Annual (frost-sensitive)", water: "Even moisture; wilts fast in heat — check daily in summer", sun: "Full sun outdoors / bright greenhouse; dies below 40°F", propagate: "Yes — stem cuttings in water, 1 week" } },
  { match: /thyme/i, care: { category: "Herbs", type: "Perennial (evergreen, zone 5+)", water: "Low — let dry between waterings; hates wet feet", sun: "Full sun, outdoors; thrives in poor soil", propagate: "Yes — cuttings, layering, or division" } },
  { match: /rosemary/i, care: { category: "Herbs", type: "Tender perennial (bring in or protect below ~15°F)", water: "Low — water deeply, infrequently", sun: "Full sun; pot works well so it can winter indoors", propagate: "Yes — semi-hardwood cuttings" } },
  { match: /oregano|marjoram/i, care: { category: "Herbs", type: "Perennial (zone 4+)", water: "Low–moderate; drought-tolerant once established", sun: "Full sun, outdoors", propagate: "Yes — division or cuttings" } },
  { match: /sage|salvia officinalis|purpurascens/i, care: { category: "Herbs", type: "Perennial (woody, zone 4+)", water: "Low — drought-tolerant; overwatering kills it", sun: "Full sun, outdoors", propagate: "Yes — cuttings or layering" } },
  { match: /mint|peppermint|spearmint/i, care: { category: "Herbs", type: "Perennial (vigorous, zone 3+)", water: "Moderate–high; likes moisture", sun: "Sun–part shade, outdoors; contain the roots!", propagate: "Yes — runners, cuttings, division — almost too easy" } },
  { match: /parsley/i, care: { category: "Herbs", type: "Biennial (grown as annual)", water: "Even moisture", sun: "Sun–part shade; afternoon shade helps in Utah heat", propagate: "From seed only (taproot resents transplanting)" } },
  { match: /cilantro|coriander/i, care: { category: "Herbs", type: "Cool-season annual (bolts in heat)", water: "Even moisture", sun: "Sun in spring/fall; part shade in summer", propagate: "From seed — sow every 3 weeks for a steady supply" } },
  { match: /chive/i, care: { category: "Herbs", type: "Perennial (zone 3+)", water: "Moderate", sun: "Full sun–part shade, outdoors", propagate: "Yes — division every few years" } },
  { match: /dill|fennel/i, care: { category: "Herbs", type: "Annual (self-sows)", water: "Moderate", sun: "Full sun, outdoors", propagate: "From seed — direct sow; taproot hates moving" } },
  { match: /lavender/i, care: { category: "Herbs", type: "Perennial (woody, zone 5+)", water: "Low — drought-loving once established; never soggy", sun: "Full sun, outdoors; great in Utah's dry air", propagate: "Yes — semi-hardwood cuttings in late summer" } },
  { match: /chamomile/i, care: { category: "Herbs", type: "Annual (German) — self-sows freely", water: "Moderate", sun: "Full sun–light shade, outdoors", propagate: "From seed — let heads dry and crumble them over soil" } },
  { match: /curry plant|helichrysum/i, care: { category: "Herbs", type: "Tender perennial (protect below ~20°F — pot it)", water: "Low — silver foliage means drought-adapted; never soggy", sun: "Full sun; loves Utah's dry air like lavender does", propagate: "Yes — semi-hardwood cuttings in summer" } },
  { match: /bay laurel|sweet bay|laurus/i, care: { category: "Herbs", type: "Tender evergreen tree (pot it; winter indoors below ~20°F)", water: "Low–moderate; let the top inch dry", sun: "Full sun–part shade; summer outside, bright window in winter", propagate: "Slowly — semi-hardwood cuttings (patience required)" } },
  { match: /lemon balm|melissa/i, care: { category: "Herbs", type: "Perennial (zone 4+, spreads like mint)", water: "Moderate", sun: "Sun–part shade, outdoors", propagate: "Yes — cuttings or division" } },

  // ——— Vegetables ———
  { match: /tomato/i, care: { category: "Vegetables", type: "Annual (frost-sensitive)", water: "Deep and consistent — irregular watering causes blossom-end rot and splitting", sun: "Full sun (6–8 hrs), outdoors or greenhouse", propagate: "Yes — sucker cuttings root in a week" } },
  { match: /pepper/i, care: { category: "Vegetables", type: "Annual (frost-sensitive)", water: "Even moisture; slight dry-down between", sun: "Full sun, outdoors or greenhouse", propagate: "From seed; cuttings possible but slow" } },
  { match: /cucumber|squash|zucchini|pumpkin|melon|watermelon/i, care: { category: "Vegetables", type: "Annual (frost-sensitive vine)", water: "Deep and regular — big leaves = big thirst; water at the base", sun: "Full sun, outdoors", propagate: "From seed — direct sow after May 15" } },
  { match: /lettuce|spinach|arugula|chard|kale|collard|cabbage|broccoli|brussels|kohlrabi|mustard/i, care: { category: "Vegetables", type: "Cool-season annual/biennial", water: "Even moisture; bolt-prone when hot and dry", sun: "Full sun spring/fall; part shade in summer heat", propagate: "From seed — succession sow; fall window opens Aug 1" } },
  { match: /bean|pea\b|lentil/i, care: { category: "Vegetables", type: "Annual", water: "Moderate; extra during flowering and pod set", sun: "Full sun, outdoors", propagate: "From seed — direct sow; fixes its own nitrogen" } },
  { match: /carrot|beet|radish|turnip|parsnip|onion|garlic|leek/i, care: { category: "Vegetables", type: "Annual/biennial root crop", water: "Even moisture for straight, sweet roots", sun: "Full sun, outdoors; loose soil matters more than feeding", propagate: "From seed (garlic: from cloves in fall)" } },
  { match: /corn/i, care: { category: "Vegetables", type: "Annual (frost-sensitive)", water: "Deep weekly soak; critical at tasseling", sun: "Full sun, outdoors; plant in blocks for pollination", propagate: "From seed — direct sow" } },
  { match: /celery|asparagus|okra|amaranth/i, care: { category: "Vegetables", type: "Annual (asparagus: perennial, zone 3+)", water: "Even moisture (celery: high)", sun: "Full sun, outdoors", propagate: "From seed (asparagus: crowns or division)" } },

  // ——— Flowers ———
  { match: /phlox paniculata|garden phlox|summer phlox/i, care: { category: "Flowers", type: "Perennial (zone 4+)", water: "Moderate; water at the base to prevent powdery mildew", sun: "Full sun–light shade, outdoors", propagate: "Yes — division in spring or stem cuttings" } },
  { match: /creeping phlox|phlox subulata/i, care: { category: "Groundcovers & Vines", type: "Perennial groundcover (zone 3+)", water: "Low once established", sun: "Full sun, outdoors", propagate: "Yes — division or layering" } },
  { match: /shasta daisy|leucanthemum/i, care: { category: "Flowers", type: "Perennial (zone 5+)", water: "Moderate; drought-tolerant once established", sun: "Full sun, outdoors", propagate: "Yes — division every 2–3 years keeps it vigorous" } },
  { match: /penstemon|beardtongue/i, care: { category: "Flowers", type: "Perennial (many Utah natives, zone 4+)", water: "Low — excellent drought plant; hates winter wet", sun: "Full sun, outdoors", propagate: "Yes — cuttings or seed; division for clumps" } },
  { match: /veronica|speedwell/i, care: { category: "Groundcovers & Vines", type: "Perennial (zone 4+)", water: "Moderate", sun: "Full sun–part shade, outdoors", propagate: "Yes — division or cuttings" } },
  { match: /hosta/i, care: { category: "Flowers", type: "Perennial (zone 3+)", water: "Moderate–high; big leaves wilt in dry heat", sun: "Shade–part shade, outdoors; morning sun only in Utah", propagate: "Yes — division in spring" } },
  { match: /echinacea|coneflower/i, care: { category: "Flowers", type: "Perennial (zone 3+)", water: "Low once established", sun: "Full sun, outdoors", propagate: "Yes — seed or division; roots harvested year 3" } },
  { match: /yarrow|achillea/i, care: { category: "Flowers", type: "Perennial (zone 3+, tough as nails)", water: "Low — thrives on neglect", sun: "Full sun, outdoors", propagate: "Yes — division or seed" } },
  { match: /rudbeckia|black.?eyed susan/i, care: { category: "Flowers", type: "Perennial/biennial (zone 3+)", water: "Low–moderate", sun: "Full sun, outdoors", propagate: "Yes — seed or division; self-sows" } },
  { match: /columbine|aquilegia/i, care: { category: "Flowers", type: "Perennial (zone 3+, short-lived but self-sows)", water: "Moderate", sun: "Part shade, outdoors", propagate: "From seed — self-sows generously" } },
  { match: /daylily|hemerocallis/i, care: { category: "Flowers", type: "Perennial (zone 3+)", water: "Low–moderate", sun: "Full sun–part shade, outdoors", propagate: "Yes — division of fans" } },
  { match: /iris/i, care: { category: "Flowers", type: "Perennial (zone 3+)", water: "Low; rhizomes rot if soggy", sun: "Full sun, outdoors; plant rhizomes shallow", propagate: "Yes — divide rhizomes after bloom" } },
  { match: /peony/i, care: { category: "Flowers", type: "Perennial (zone 3+, decades-long)", water: "Moderate", sun: "Full sun, outdoors; don't plant eyes deeper than 2\"", propagate: "Yes — root division in fall (slow to re-establish)" } },
  { match: /tulip|daffodil|narcissus|crocus|hyacinth/i, care: { category: "Flowers", type: "Perennial bulb (plant in fall)", water: "Moist in spring; dry summer dormancy is fine", sun: "Full sun, outdoors", propagate: "Yes — dig and separate offsets when dormant" } },
  { match: /marigold|tagetes/i, care: { category: "Flowers", type: "Annual", water: "Moderate; let dry slightly between", sun: "Full sun, outdoors; great pest-deterrent companion", propagate: "From seed — very easy; save heads" } },
  { match: /zinnia/i, care: { category: "Flowers", type: "Annual", water: "Moderate; water at the base (mildew-prone)", sun: "Full sun, outdoors", propagate: "From seed — direct sow after frost" } },
  { match: /petunia|calibrachoa/i, care: { category: "Flowers", type: "Annual", water: "Even moisture; daily for hanging baskets in heat", sun: "Full sun, outdoors", propagate: "Yes — stem cuttings" } },
  { match: /geranium|pelargonium/i, care: { category: "Flowers", type: "Tender perennial (winter indoors, annual outside)", water: "Let dry slightly between; rots if soggy", sun: "Full sun outdoors / bright window in winter", propagate: "Yes — stem cuttings (skip the dome — they rot)" } },
  { match: /impatiens/i, care: { category: "Flowers", type: "Annual (shade)", water: "Even moisture; first to wilt when dry", sun: "Shade–part shade, outdoors", propagate: "Yes — stem cuttings in water" } },
  { match: /pansy|viola/i, care: { category: "Flowers", type: "Cool-season annual/biennial", water: "Even moisture", sun: "Sun–part shade; fades in summer heat", propagate: "From seed" } },
  { match: /snapdragon|antirrhinum/i, care: { category: "Flowers", type: "Cool-season annual", water: "Moderate", sun: "Full sun, outdoors", propagate: "From seed; cuttings possible" } },
  { match: /celosia|cockscomb/i, care: { category: "Flowers", type: "Annual (heat-loving)", water: "Moderate; drought-tolerant once going", sun: "Full sun, outdoors", propagate: "From seed — self-sows; heads hold thousands" } },
  { match: /coleus/i, care: { category: "Flowers", type: "Tender perennial (grown as annual)", water: "Even moisture", sun: "Part shade outdoors / bright indirect indoors", propagate: "Yes — cuttings root in water in days" } },
  { match: /fuchsia/i, care: { category: "Flowers", type: "Tender perennial (winter indoors)", water: "Even moisture; baskets dry fast", sun: "Shade–part shade, outdoors; hates hot afternoons", propagate: "Yes — softwood cuttings" } },
  { match: /dianthus|carnation|pink\b/i, care: { category: "Flowers", type: "Perennial/biennial (zone 3+)", water: "Low–moderate", sun: "Full sun, outdoors", propagate: "Yes — cuttings or layering" } },
  { match: /delphinium|larkspur/i, care: { category: "Flowers", type: "Perennial (zone 3+, short-lived)", water: "Moderate; steady moisture", sun: "Full sun with afternoon-shade relief, outdoors", propagate: "From seed or basal cuttings" } },
  { match: /calendula/i, care: { category: "Flowers", type: "Annual (self-sows)", water: "Moderate", sun: "Full sun, outdoors", propagate: "From seed — deadhead into a jar and you're done" } },
  { match: /sunflower|helianthus/i, care: { category: "Flowers", type: "Annual", water: "Deep weekly; drought-tough once rooted", sun: "Full sun, outdoors", propagate: "From seed — direct sow" } },
  { match: /poppy|papaver/i, care: { category: "Flowers", type: "Annual/perennial (self-sows)", water: "Low", sun: "Full sun, outdoors", propagate: "From seed — shake dry pods where you want them" } },
  { match: /alyssum|lobularia/i, care: { category: "Flowers", type: "Annual", water: "Moderate", sun: "Sun–part shade, outdoors", propagate: "From seed — self-sows" } },
  { match: /bee balm|monarda/i, care: { category: "Flowers", type: "Perennial (zone 4+)", water: "Moderate–high", sun: "Full sun–part shade, outdoors", propagate: "Yes — division; spreads on its own" } },
  { match: /feverfew|tanacetum/i, care: { category: "Herbs", type: "Perennial (short-lived, self-sows)", water: "Moderate", sun: "Full sun–part shade, outdoors", propagate: "From seed — self-sows readily" } },
  { match: /borage/i, care: { category: "Herbs", type: "Annual (self-sows)", water: "Moderate", sun: "Full sun, outdoors", propagate: "From seed — direct sow; hates transplanting" } },
  { match: /valerian/i, care: { category: "Herbs", type: "Perennial (zone 4+)", water: "Moderate–high; likes a moist corner", sun: "Sun–part shade, outdoors", propagate: "Yes — division or seed" } },
  { match: /comfrey/i, care: { category: "Herbs", type: "Perennial (permanent — plan the spot)", water: "Moderate", sun: "Sun–part shade, outdoors", propagate: "Yes — root cuttings (any piece regrows)" } },

  // ——— Shrubs & Trees ———
  { match: /lilac|syringa/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 3+, loves Utah)", water: "Low–moderate once established; deep monthly soak in summer", sun: "Full sun, outdoors (6+ hrs for best bloom)", propagate: "Yes — dig rooted suckers in spring, or softwood cuttings" } },
  { match: /sand cherry|prunus.*cistena|purpleleaf/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 3+, ~10–15 yr lifespan)", water: "Moderate; deep soak in heat — stress invites borers", sun: "Full sun for best purple color, outdoors", propagate: "Yes — softwood cuttings in early summer" } },
  { match: /hydrangea/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 4+; bigleaf types need winter protection here)", water: "High — the name means water; wilts dramatically in Utah afternoons", sun: "Morning sun, afternoon shade, outdoors", propagate: "Yes — softwood cuttings or ground layering" } },
  { match: /rose\b|rosa\b/i, care: { category: "Shrubs & Trees", type: "Perennial shrub (zone 4+ with hardy types)", water: "Deep 2×/week in summer; at the base, never overhead", sun: "Full sun (6+ hrs), outdoors", propagate: "Yes — softwood cuttings after a bloom fades" } },
  { match: /boxwood|buxus/i, care: { category: "Shrubs & Trees", type: "Evergreen shrub (zone 5+)", water: "Moderate; shallow roots — mulch well", sun: "Sun–part shade, outdoors; winter-burn prone in Utah wind", propagate: "Yes — semi-hardwood cuttings" } },
  { match: /euonymus|burning bush/i, care: { category: "Shrubs & Trees", type: "Deciduous/evergreen shrub (zone 4+)", water: "Low–moderate", sun: "Full sun for red fall color, outdoors", propagate: "Yes — cuttings" } },
  { match: /spirea/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 3+)", water: "Low–moderate", sun: "Full sun, outdoors", propagate: "Yes — softwood cuttings" } },
  { match: /forsythia/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 4+)", water: "Low–moderate", sun: "Full sun, outdoors", propagate: "Yes — tip layering (touch a branch to soil)" } },
  { match: /barberry|berberis/i, care: { category: "Shrubs & Trees", type: "Deciduous shrub (zone 4+)", water: "Low", sun: "Full sun, outdoors", propagate: "Yes — cuttings" } },
  { match: /juniper|spruce|pine\b|arborvitae|cedar/i, care: { category: "Shrubs & Trees", type: "Evergreen conifer (very hardy)", water: "Low once established; deep-water first two summers", sun: "Full sun, outdoors", propagate: "Difficult — hardwood cuttings, slow" } },
  { match: /maple|acer/i, care: { category: "Shrubs & Trees", type: "Deciduous tree (zone 3–5+ by species)", water: "Deep monthly soak in summer; mulch the root zone", sun: "Full sun–part shade, outdoors", propagate: "From seed; cultivars are grafted" } },

  // ——— Groundcovers & Vines ———
  { match: /english ivy|hedera/i, care: { category: "Groundcovers & Vines", type: "Evergreen perennial vine (zone 5+)", water: "Moderate; established beds are drought-tolerant", sun: "Shade–part shade, outdoors (scorches in full Utah sun)", propagate: "Yes — cuttings root in water; also self-layers" } },
  { match: /vinca|periwinkle/i, care: { category: "Groundcovers & Vines", type: "Evergreen perennial groundcover (zone 4+)", water: "Low–moderate", sun: "Shade–part shade, outdoors", propagate: "Yes — division or cuttings" } },
  { match: /creeping thyme/i, care: { category: "Groundcovers & Vines", type: "Perennial groundcover (zone 4+)", water: "Low", sun: "Full sun, outdoors; walkable", propagate: "Yes — division or layering" } },
  { match: /creeping jenny|lysimachia/i, care: { category: "Groundcovers & Vines", type: "Perennial groundcover (zone 4+)", water: "Moderate–high", sun: "Sun–part shade, outdoors", propagate: "Yes — rooted stems, division" } },
  { match: /clematis/i, care: { category: "Groundcovers & Vines", type: "Perennial vine (zone 4+)", water: "Moderate; 'head in the sun, feet in the shade'", sun: "Full sun with shaded roots, outdoors", propagate: "Yes — layering or cuttings" } },
  { match: /honeysuckle|lonicera/i, care: { category: "Groundcovers & Vines", type: "Perennial vine/shrub (zone 4+)", water: "Moderate", sun: "Full sun–part shade, outdoors", propagate: "Yes — cuttings or layering" } },
  { match: /virginia creeper|parthenocissus/i, care: { category: "Groundcovers & Vines", type: "Perennial vine (zone 3+, vigorous)", water: "Low", sun: "Sun–shade, outdoors", propagate: "Yes — cuttings; roots where it touches soil" } },
  { match: /ajuga|bugleweed/i, care: { category: "Groundcovers & Vines", type: "Perennial groundcover (zone 3+)", water: "Moderate", sun: "Part shade–shade, outdoors", propagate: "Yes — runners/division" } },

  // ——— Fruit ———
  { match: /strawberr/i, care: { category: "Fruit", type: "Perennial (zone 4+)", water: "Even moisture; critical while fruiting", sun: "Full sun, outdoors", propagate: "Yes — peg down runners" } },
  { match: /raspberr|blackberr/i, care: { category: "Fruit", type: "Perennial cane fruit (zone 4+)", water: "Deep weekly in summer", sun: "Full sun, outdoors", propagate: "Yes — suckers or tip layering" } },
  { match: /grape|vitis/i, care: { category: "Fruit", type: "Perennial vine (zone 5+)", water: "Deep, infrequent; less water = sweeter fruit", sun: "Full sun, outdoors", propagate: "Yes — dormant hardwood cuttings" } },
  { match: /blueberr/i, care: { category: "Fruit", type: "Perennial shrub (needs acid soil — tough in alkaline Utah; use pots)", water: "Even moisture with acidified water", sun: "Full sun, outdoors (container recommended here)", propagate: "Yes — softwood cuttings" } },
  { match: /apple|peach|pear|cherry tree|apricot|plum/i, care: { category: "Fruit", type: "Deciduous fruit tree (zone 4–5+)", water: "Deep soak every 1–2 weeks in summer", sun: "Full sun, outdoors", propagate: "Grafting (seedlings won't match the parent)" } },
];

const DEFAULT_CARE: PlantCare = {
  category: "Other",
  type: "—",
  water: "Check soil an inch down: water when dry, skip when damp.",
  sun: "Match light to the leaf: thin/large leaves = gentler light, thick/silver leaves = more sun.",
  propagate: "Most plants root from a 3–4\" cutting of healthy growth — worth a try.",
};

export function plantCare(name: string): PlantCare {
  return CARE.find((entry) => entry.match.test(name))?.care ?? DEFAULT_CARE;
}

export const CATEGORY_ORDER: PlantCategory[] = [
  "Vegetables",
  "Herbs",
  "Flowers",
  "Fruit",
  "Shrubs & Trees",
  "Groundcovers & Vines",
  "Houseplants",
  "Succulents",
  "Other",
];
