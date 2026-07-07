/**
 * Garden-sanctuary study plans — one for each topic in the Scripture & Quote
 * Library. Each plan: passages to read, a question to ponder, and a hands-in-
 * the-dirt practice to carry into the garden.
 */

export type StudyPlan = {
  topic: string;
  invitation: string;
  read: { ref: string; line: string }[];
  ponder: string;
  practice: string;
};

export const STUDY_PLANS: StudyPlan[] = [
  {
    topic: "Light",
    invitation: "Sit where the morning sun reaches the greenhouse.",
    read: [
      { ref: "Genesis 1:3–4", line: "Let there be light — and God saw that it was good." },
      { ref: "Matthew 5:14–16", line: "Let your light so shine before men." },
      { ref: "Psalm 97:11", line: "Light is sown for the righteous." },
    ],
    ponder: "My plants literally turn toward light without being told. What am I turning toward each morning?",
    practice: "Watch one plant's leaves angle toward the sun. Move one struggling plant into better light — and name one 'better light' to move yourself toward this week.",
  },
  {
    topic: "Growth",
    invitation: "Stand by whatever is newest and greenest today.",
    read: [
      { ref: "Mark 4:26–28", line: "First the blade, then the ear, after that the full corn." },
      { ref: "Alma 32:30–33", line: "It beginneth to enlarge my soul… it beginneth to be delicious to me." },
      { ref: "1 Corinthians 3:6–7", line: "I have planted, Apollos watered; but God gave the increase." },
    ],
    ponder: "Growth in the greenhouse is invisible day to day but undeniable month to month. Where is that true of me?",
    practice: "Photograph one seedling today and set a reminder to look at the photo in three weeks. Let the comparison — not the day — tell the story.",
  },
  {
    topic: "Seeds",
    invitation: "Hold a few seeds from the vault in your palm first.",
    read: [
      { ref: "Alma 32:28", line: "Compare the word unto a seed… give place, that it may be planted in your heart." },
      { ref: "Matthew 13:31–32", line: "A grain of mustard seed… becometh a tree." },
      { ref: "Galatians 6:7–9", line: "Whatsoever a man soweth, that shall he also reap." },
    ],
    ponder: "Every seed in the vault is a promise smaller than a fingernail. What tiny thing am I being asked to plant and trust?",
    practice: "Sow one cell of anything today as a deliberate act of faith. Label it with a word — the thing you're choosing to believe will grow.",
  },
  {
    topic: "Pruning",
    invitation: "Bring the snips; read before you cut.",
    read: [
      { ref: "John 15:1–5", line: "Every branch that beareth fruit, he purgeth it, that it may bring forth more fruit." },
      { ref: "Hebrews 12:11", line: "No chastening for the present seemeth to be joyous… nevertheless afterward it yieldeth the peaceable fruit." },
      { ref: "Ecclesiastes 3:1–2", line: "A time to plant, and a time to pluck up." },
    ],
    ponder: "Pruning isn't punishment — it's the gardener believing in the branch. What is being cut back in my life that might be preparation, not loss?",
    practice: "Prune one plant from the Pruning Guide slowly and deliberately. With each cut, name something you're willing to let go of so something better can fill the space.",
  },
  {
    topic: "Harvest",
    invitation: "Best read with dirt on your hands and something picked beside you.",
    read: [
      { ref: "Psalm 126:5–6", line: "They that sow in tears shall reap in joy." },
      { ref: "Galatians 6:9", line: "In due season we shall reap, if we faint not." },
      { ref: "D&C 4:4", line: "The field is white already to harvest." },
    ],
    ponder: "What is ready for harvest in my life right now that I keep leaving on the vine?",
    practice: "Harvest something today — even one leaf of basil — and use it at dinner. Say out loud one long effort that is finally bearing fruit.",
  },
  {
    topic: "Roots",
    invitation: "Read this beside the oldest plant you own.",
    read: [
      { ref: "Psalm 1:3", line: "Like a tree planted by the rivers of water." },
      { ref: "Jeremiah 17:7–8", line: "Her roots by the river… shall not be careful in the year of drought." },
      { ref: "Colossians 2:6–7", line: "Rooted and built up in him, and stablished in the faith." },
    ],
    ponder: "Roots do their work unseen — no one applauds them. What unseen daily habits are actually holding me up?",
    practice: "Water something deeply and slowly instead of quickly. As it soaks, name your own deep-water sources — the people and practices your roots reach for.",
  },
  {
    topic: "Living water",
    invitation: "Bring your water bottle. Really.",
    read: [
      { ref: "John 4:13–14", line: "The water that I shall give him shall be in him a well of water springing up." },
      { ref: "Isaiah 58:11", line: "Like a watered garden… whose waters fail not." },
      { ref: "1 Nephi 11:25", line: "The fountain of living waters… the love of God." },
    ],
    ponder: "A wilted plant recovers within hours of watering. What would 'watering' look like for the wilted part of me?",
    practice: "Do the morning watering round unhurried, then drink a full glass yourself in the greenhouse. Notice which of your plants — and people — perk up fastest when tended.",
  },
  {
    topic: "Fruit",
    invitation: "Read near the tomatoes or berries.",
    read: [
      { ref: "Galatians 5:22–23", line: "The fruit of the Spirit is love, joy, peace…" },
      { ref: "John 15:8", line: "That ye bear much fruit; so shall ye be my disciples." },
      { ref: "Alma 32:42–43", line: "Ye shall pluck the fruit… which is sweet above all that is sweet." },
    ],
    ponder: "A plant never strains to fruit — fruit is what health looks like. Which fruit (patience? gentleness?) would grow naturally if I tended my own soil better?",
    practice: "Pick one fruit of the Spirit as this week's 'crop.' Tape its name inside the greenhouse door and let every visit be a reminder.",
  },
  {
    topic: "Faith",
    invitation: "Read by the seed trays, where nothing has sprouted yet.",
    read: [
      { ref: "Alma 32:21, 27", line: "Faith is not to have a perfect knowledge… awake and arouse your faculties, even to an experiment." },
      { ref: "Hebrews 11:1", line: "The evidence of things not seen." },
      { ref: "Matthew 17:20", line: "Faith as a grain of mustard seed… nothing shall be impossible." },
    ],
    ponder: "Every tray I sow is an experiment on the word. Where in my life am I waiting for certainty when the seed just needs planting?",
    practice: "Check the seed trays and mark the sprouted cells. Let each green tip be counted evidence: what was buried and invisible last week was alive the whole time.",
  },
  {
    topic: "Patience",
    invitation: "Read beside the slowest thing you're growing.",
    read: [
      { ref: "James 5:7", line: "The husbandman waiteth for the precious fruit… and hath long patience for it." },
      { ref: "Ecclesiastes 3:11", line: "He hath made every thing beautiful in his time." },
      { ref: "Mosiah 4:27", line: "It is not requisite that a man should run faster than he has strength." },
    ],
    ponder: "The basil takes 18 days to even show up, and I don't scold it once. Why do I give seedlings more patience than I give myself?",
    practice: "Find the slowest germinator in the studio and thank it for the lesson. Choose one thing in your life to officially put on 'seed time' — checked weekly, not hourly.",
  },
  {
    topic: "Creation",
    invitation: "Step outside the greenhouse and look at all of it at once.",
    read: [
      { ref: "Genesis 2:8–9, 15", line: "The Lord God planted a garden… and put the man into it to dress it and to keep it." },
      { ref: "Moses 3:9", line: "I, the Lord God, made… every tree, naturally, upon the face of the earth." },
      { ref: "Psalm 19:1", line: "The heavens declare the glory of God." },
    ],
    ponder: "The first assignment given to people was gardening. What does it mean that my hobby is humanity's oldest calling?",
    practice: "Walk the whole property slowly — sun map style, east to west. Name aloud five made things you had no hand in: the sun's angle, the seed's design, the rain.",
  },
  {
    topic: "Beauty",
    invitation: "Sit in front of whatever is blooming.",
    read: [
      { ref: "Matthew 6:28–29", line: "Consider the lilies… even Solomon in all his glory was not arrayed like one of these." },
      { ref: "Ecclesiastes 3:11", line: "He hath made every thing beautiful in his time." },
      { ref: "D&C 59:18–19", line: "Made for the benefit and the use of man, both to please the eye and to gladden the heart." },
    ],
    ponder: "The lilies neither toil nor spin — beauty was given, not earned. Can I let some things in my life simply be lovely without being useful?",
    practice: "Cut three stems and put them somewhere you'll pass ten times today. Beauty on purpose, no occasion required — you earned today's bouquet.",
  },
  {
    topic: "Stewardship",
    invitation: "Read with the task list open — then set it down.",
    read: [
      { ref: "Genesis 2:15", line: "To dress it and to keep it." },
      { ref: "Matthew 25:20–21", line: "Well done, thou good and faithful servant… ruler over many things." },
      { ref: "D&C 104:13–14", line: "It is expedient that I, the Lord, should make every man accountable, as a steward." },
    ],
    ponder: "None of this — lot, greenhouse, body, family — is ultimately mine; all of it is entrusted. Does 'steward' feel heavier or lighter than 'owner'?",
    practice: "Do today's least favorite garden chore first, as an act of keeping. Then stand back and take honest satisfaction in a well-kept trust.",
  },
  {
    topic: "Renewal",
    invitation: "Read by the compost pile — truly.",
    read: [
      { ref: "Isaiah 43:19", line: "Behold, I will do a new thing; now it shall spring forth." },
      { ref: "2 Corinthians 5:17", line: "Old things are passed away; behold, all things are become new." },
      { ref: "Revelation 21:5", line: "Behold, I make all things new." },
    ],
    ponder: "The compost pile is last season's failures becoming next season's richest soil. What 'waste' in my past is quietly turning into nourishment?",
    practice: "Add something spent to the compost and turn the pile. Say what it was — a plant, a plan, a season — and what you hope its breakdown will feed.",
  },
  {
    topic: "Gardens",
    invitation: "Read anywhere in the garden — this one is about the ground you're on.",
    read: [
      { ref: "Isaiah 58:11", line: "Thou shalt be like a watered garden." },
      { ref: "Genesis 2:8", line: "The Lord God planted a garden eastward in Eden." },
      { ref: "John 19:41 & 20:15", line: "In the garden a new sepulchre… she, supposing him to be the gardener." },
    ],
    ponder: "Scripture begins in a garden, turns in a garden, and ends in a garden city. Why does God keep choosing gardens for the important moments?",
    practice: "Choose one corner to be your sanctuary spot — a chair, a stump, a step. Sit there for five unhurried minutes today. That corner is now an appointment.",
  },
  {
    topic: "Vineyards",
    invitation: "Read by the grapes (or where the vineyard pathway will be).",
    read: [
      { ref: "John 15:1", line: "I am the true vine, and my Father is the husbandman." },
      { ref: "Jacob 5 (skim 5:70–75)", line: "The Lord of the vineyard labored with them… and the Lord of the vineyard saw that his fruit was good." },
      { ref: "Isaiah 5:1–2", line: "My wellbeloved hath a vineyard in a very fruitful hill." },
    ],
    ponder: "In Jacob 5 the Lord of the vineyard doesn't supervise — he digs, prunes, and weeps alongside the servants. Where have I felt worked-beside rather than watched-over?",
    practice: "Do one small task on the vines (or plan the arbor) and imagine working shoulder to shoulder with the Lord of the vineyard. Work slower than necessary, on purpose.",
  },
];

export const STUDY_PLAN_BY_TOPIC = new Map(STUDY_PLANS.map((plan) => [plan.topic, plan]));
