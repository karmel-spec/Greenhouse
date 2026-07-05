/**
 * Top ways to cook each crop: five classic dishes per plant, each linking to
 * AllRecipes search results for that dish (search links can't go stale the
 * way individual recipe pages do), plus a browse-more link.
 */

export type RecipeLink = { title: string; url: string };

const recipeSearch = (dish: string) => `https://www.allrecipes.com/search?q=${encodeURIComponent(dish)}`;
const browseMore = (crop: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`best ${crop} recipes`)}`;

const DISH_IDEAS: { match: RegExp; dishes: string[] }[] = [
  { match: /tomato/i, dishes: ["Fresh tomato salsa", "Caprese salad", "Roasted tomato soup", "Tomato bruschetta", "Slow-roasted tomato pasta sauce"] },
  { match: /green snap|green bean|bean, green/i, dishes: ["Green bean casserole", "Garlic sautéed green beans", "Green bean almondine", "Blistered green beans", "Three-bean salad"] },
  { match: /fava|broad bean/i, dishes: ["Ful medames", "Fava bean and pecorino salad", "Fava bean hummus", "Braised fava beans", "Fava bean risotto"] },
  { match: /kidney/i, dishes: ["Classic chili con carne", "Red beans and rice", "Kidney bean curry (rajma)", "Three-bean salad", "Kidney bean soup"] },
  { match: /lima|butter bean/i, dishes: ["Succotash", "Southern butter beans", "Butter bean soup", "Baked lima beans", "Butter beans with bacon"] },
  { match: /pinto/i, dishes: ["Refried beans", "Charro beans", "Pinto bean soup", "Slow cooker pinto beans", "Pinto bean burritos"] },
  { match: /^bean\b/i, dishes: ["Baked beans", "Bean and ham soup", "Three-bean salad", "White bean stew", "Bean burritos"] },
  { match: /lentil/i, dishes: ["Red lentil soup", "Lentil curry (dal)", "Lentil salad with feta", "Lentil shepherd's pie", "Mujadara lentils and rice"] },
  { match: /pea\b|pea,/i, dishes: ["Split pea soup", "Buttered peas with mint", "Pea and bacon pasta", "Sugar snap pea stir fry", "Green pea salad"] },
  { match: /carrot/i, dishes: ["Honey glazed carrots", "Carrot cake", "Roasted carrots", "Carrot ginger soup", "Carrot raisin salad"] },
  { match: /beet/i, dishes: ["Borscht", "Roasted beet and goat cheese salad", "Pickled beets", "Beet hummus", "Beet chips"] },
  { match: /radish/i, dishes: ["Roasted radishes", "Radish butter toast", "Quick pickled radishes", "Radish cucumber salad", "Radish top pesto"] },
  { match: /turnip/i, dishes: ["Mashed turnips", "Roasted turnips", "Turnip gratin", "Turnip and potato soup", "Glazed turnips"] },
  { match: /parsnip/i, dishes: ["Roasted parsnips", "Parsnip puree", "Parsnip apple soup", "Honey glazed parsnips", "Parsnip fries"] },
  { match: /kohlrabi/i, dishes: ["Kohlrabi slaw", "Roasted kohlrabi", "Kohlrabi fritters", "Kohlrabi fries", "Creamy kohlrabi soup"] },
  { match: /onion/i, dishes: ["French onion soup", "Caramelized onions", "Onion rings", "Pickled red onions", "Onion tart"] },
  { match: /pumpkin/i, dishes: ["Pumpkin pie", "Pumpkin soup", "Pumpkin bread", "Roasted pumpkin seeds", "Pumpkin risotto"] },
  { match: /squash/i, dishes: ["Butternut squash soup", "Roasted winter squash", "Squash casserole", "Stuffed acorn squash", "Zucchini bread"] },
  { match: /cucumber/i, dishes: ["Tzatziki", "Cucumber salad", "Refrigerator dill pickles", "Cucumber sandwiches", "Cucumber gazpacho"] },
  { match: /melon(?!.*water)/i, dishes: ["Melon prosciutto skewers", "Cantaloupe smoothie", "Melon fruit salad", "Melon sorbet", "Melon with honey and lime"] },
  { match: /watermelon/i, dishes: ["Watermelon feta salad", "Watermelon agua fresca", "Grilled watermelon", "Watermelon salsa", "Watermelon sorbet"] },
  { match: /corn/i, dishes: ["Corn on the cob", "Cornbread", "Elote (Mexican street corn)", "Corn chowder", "Fresh corn salad"] },
  { match: /broccoli/i, dishes: ["Roasted broccoli", "Broccoli cheddar soup", "Broccoli salad", "Beef and broccoli stir fry", "Broccoli casserole"] },
  { match: /brussels/i, dishes: ["Crispy roasted Brussels sprouts", "Brussels sprouts with bacon", "Shaved Brussels sprout salad", "Maple glazed Brussels sprouts", "Air fryer Brussels sprouts"] },
  { match: /cabbage/i, dishes: ["Coleslaw", "Stuffed cabbage rolls", "Sautéed cabbage", "Cabbage soup", "Homemade sauerkraut"] },
  { match: /kale/i, dishes: ["Kale chips", "Kale Caesar salad", "Caldo verde soup", "Sautéed kale with garlic", "Kale smoothie"] },
  { match: /collard/i, dishes: ["Southern collard greens", "Collard green wraps", "Sautéed collards with garlic", "Collard greens and ham hocks", "Brazilian collard greens"] },
  { match: /chard/i, dishes: ["Sautéed Swiss chard", "Swiss chard gratin", "Chard and white bean stew", "Stuffed chard leaves", "Swiss chard frittata"] },
  { match: /spinach/i, dishes: ["Creamed spinach", "Spinach artichoke dip", "Palak paneer", "Spinach salad with warm bacon dressing", "Spinach lasagna"] },
  { match: /lettuce/i, dishes: ["Caesar salad", "Lettuce wraps", "Wedge salad", "Grilled romaine", "Garden salad with vinaigrette"] },
  { match: /chicory/i, dishes: ["Salade lyonnaise", "Braised chicory", "Chicory salad with citrus", "Grilled radicchio", "Chicory gratin"] },
  { match: /celery/i, dishes: ["Waldorf salad", "Cream of celery soup", "Ants on a log", "Braised celery", "Celery salad with parmesan"] },
  { match: /asparagus/i, dishes: ["Roasted asparagus", "Cream of asparagus soup", "Asparagus quiche", "Grilled asparagus with lemon", "Asparagus risotto"] },
  { match: /okra/i, dishes: ["Gumbo", "Fried okra", "Roasted okra", "Bhindi masala", "Pickled okra"] },
  { match: /pepper, hot|hot pepper/i, dishes: ["Homemade hot sauce", "Jalapeño poppers", "Stuffed jalapeños", "Chili oil", "Pickled jalapeños"] },
  { match: /pepper/i, dishes: ["Stuffed bell peppers", "Roasted red pepper soup", "Fajita peppers and onions", "Marinated roasted peppers", "Pepper steak stir fry"] },
  { match: /mustard/i, dishes: ["Homemade mustard", "Sautéed mustard greens", "Mustard greens with bacon", "Indian sarson ka saag", "Mustard vinaigrette"] },
  { match: /poppy/i, dishes: ["Poppy seed roll", "Lemon poppy seed muffins", "Poppy seed dressing", "Poppy seed bagels", "Poppy seed cake"] },
  { match: /amaranth/i, dishes: ["Amaranth porridge", "Popped amaranth granola", "Amaranth patties", "Sautéed amaranth greens", "Amaranth flatbread"] },
  { match: /almond/i, dishes: ["Candied almonds", "Almond butter", "Marzipan", "Almond crusted chicken", "Almond biscotti"] },
  { match: /coriander|cilantro/i, dishes: ["Cilantro lime rice", "Green chutney", "Chimichurri", "Cilantro pesto", "Pico de gallo"] },
  { match: /fennel/i, dishes: ["Shaved fennel salad", "Roasted fennel", "Braised fennel with parmesan", "Fennel and orange salad", "Fennel sausage pasta"] },
];

const FALLBACK = (crop: string) => [
  `Roasted ${crop}`,
  `${crop} soup`,
  `Sautéed ${crop} with garlic`,
  `Pickled ${crop}`,
  `${crop} salad`,
];

/** At least five recipe links for a crop, plus a browse-more link. */
export function recipeIdeas(commonName: string): RecipeLink[] {
  const cropWord = commonName.split(",")[0].trim();
  const entry = DISH_IDEAS.find((candidate) => candidate.match.test(commonName));
  const dishes = entry?.dishes ?? FALLBACK(cropWord.toLowerCase());
  return [
    ...dishes.map((dish) => ({ title: dish, url: recipeSearch(dish) })),
    { title: `Browse more ${cropWord.toLowerCase()} recipes →`, url: browseMore(cropWord) },
  ];
}
