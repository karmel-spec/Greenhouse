/**
 * Rotating inspiration for the top and bottom of every page — scriptures and
 * garden wisdom about seeds, growth, pruning, light, and patience.
 */

export type Inspiration = {
  text: string;
  source: string;
  kind: "scripture" | "quote";
};

export const INSPIRATIONS: Inspiration[] = [
  { text: "And the Lord shall guide thee continually… and thou shalt be like a watered garden, and like a spring of water, whose waters fail not.", source: "Isaiah 58:11", kind: "scripture" },
  { text: "To every thing there is a season… a time to plant, and a time to pluck up that which is planted.", source: "Ecclesiastes 3:1–2", kind: "scripture" },
  { text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.", source: "Galatians 6:9", kind: "scripture" },
  { text: "He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully.", source: "2 Corinthians 9:6", kind: "scripture" },
  { text: "And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither.", source: "Psalm 1:3", kind: "scripture" },
  { text: "They that sow in tears shall reap in joy.", source: "Psalm 126:5", kind: "scripture" },
  { text: "The seed should spring and grow up, he knoweth not how. For the earth bringeth forth fruit of herself; first the blade, then the ear, after that the full corn.", source: "Mark 4:27–28", kind: "scripture" },
  { text: "I am the true vine, and my Father is the husbandman… every branch that beareth fruit, he purgeth it, that it may bring forth more fruit.", source: "John 15:1–2", kind: "scripture" },
  { text: "For as the earth bringeth forth her bud, and as the garden causeth the things that are sown in it to spring forth…", source: "Isaiah 61:11", kind: "scripture" },
  { text: "But if ye nourish the word… it shall take root; and behold it shall be a tree springing up unto everlasting life.", source: "Alma 32:41", kind: "scripture" },
  { text: "We will compare the word unto a seed. Now, if ye give place, that a seed may be planted in your heart… it will begin to swell within your breasts.", source: "Alma 32:28", kind: "scripture" },
  { text: "Consider the lilies of the field, how they grow; they toil not, neither do they spin: and yet… even Solomon in all his glory was not arrayed like one of these.", source: "Matthew 6:28–29", kind: "scripture" },
  { text: "Let both grow together until the harvest.", source: "Matthew 13:30", kind: "scripture" },
  { text: "Light is sown for the righteous, and gladness for the upright in heart.", source: "Psalm 97:11", kind: "scripture" },
  { text: "To plant a garden is to believe in tomorrow.", source: "Audrey Hepburn", kind: "quote" },
  { text: "The earth laughs in flowers.", source: "Ralph Waldo Emerson", kind: "quote" },
  { text: "Where flowers bloom, so does hope.", source: "Lady Bird Johnson", kind: "quote" },
  { text: "A garden is a grand teacher. It teaches patience and careful watchfulness; it teaches industry and thrift; above all it teaches entire trust.", source: "Gertrude Jekyll", kind: "quote" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", source: "Chinese proverb", kind: "quote" },
  { text: "Flowers always make people better, happier, and more helpful; they are sunshine, food and medicine for the soul.", source: "Luther Burbank", kind: "quote" },
  { text: "I must have flowers, always, and always.", source: "Claude Monet", kind: "quote" },
  { text: "In the spring, at the end of the day, you should smell like dirt.", source: "Margaret Atwood", kind: "quote" },
  { text: "A society grows great when old men plant trees whose shade they know they shall never sit in.", source: "Greek proverb", kind: "quote" },
  { text: "Gardens are not made by singing 'Oh, how beautiful,' and sitting in the shade.", source: "Rudyard Kipling", kind: "quote" },
  { text: "To nurture a garden is to feed not just the body, but the soul.", source: "Alfred Austin", kind: "quote" },
  { text: "Everything that slows us down and forces patience, everything that sets us back into the slow circles of nature, is a help.", source: "May Sarton", kind: "quote" },
  { text: "The glory of gardening: hands in the dirt, head in the sun, heart with nature.", source: "attributed to Alfred Austin", kind: "quote" },
  { text: "Even the tiniest seed carries the whole promise of the harvest.", source: "garden wisdom", kind: "quote" },
  { text: "Bloom where you are planted.", source: "garden wisdom", kind: "quote" },
  { text: "Plants grow toward the light. So do we.", source: "garden wisdom", kind: "quote" },
];

/** Deterministic-ish pick that differs by section and rotates over time. */
export function inspirationIndex(seedText: string, offset: number): number {
  let hash = 0;
  for (const char of seedText) hash = (hash * 31 + char.charCodeAt(0)) % 99991;
  return (hash + offset) % INSPIRATIONS.length;
}
