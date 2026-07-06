/**
 * Variety-specific crop photos from Wikimedia Commons (e.g. Brandywine vs
 * Cherokee Purple tomato). Keyed by "commonname|variety" (lowercased).
 * Falls back to the crop-level photo when a variety photo isn't available.
 */

export const varietyPhotos: Record<string, { photo: string }> = {
  "pumpkin|mammoth gold": {
    "photo": "/crops/varieties/pumpkin-mammoth-gold.jpg"
  },
  "squash|blue hubbard": {
    "photo": "/crops/varieties/squash-blue-hubbard.jpg"
  },
  "bean, green snap|tendergreen": {
    "photo": "/crops/varieties/bean-green-snap-tendergreen.jpg"
  },
  "bean, fava (broad bean)|broad windsor": {
    "photo": "/crops/varieties/bean-fava-broad-bean-broad-windsor.jpg"
  },
  "bean, lima (butter bean)|king of the garden (pole)": {
    "photo": "/crops/varieties/bean-lima-butter-bean-king-of-the-garden-pole.jpg"
  },
  "tomato|heirloom": {
    "photo": "/crops/varieties/tomato-heirloom.jpg"
  },
  "tomato|marma": {
    "photo": "/crops/varieties/tomato-marma.jpg"
  },
  "okra|three foot tall": {
    "photo": "/crops/varieties/okra-three-foot-tall.jpg"
  },
  "pepper, hot|hot wax": {
    "photo": "/crops/varieties/pepper-hot-hot-wax.jpg"
  },
  "spinach|bloomsdale": {
    "photo": "/crops/varieties/spinach-bloomsdale.jpg"
  },
  "kohlrabi|white vienna": {
    "photo": "/crops/varieties/kohlrabi-white-vienna.jpg"
  },
  "swiss chard|fordhook giant": {
    "photo": "/crops/varieties/swiss-chard-fordhook-giant.jpg"
  },
  "kale|lacinato": {
    "photo": "/crops/varieties/kale-lacinato.jpg"
  },
  "amaranth|red head": {
    "photo": "/crops/varieties/amaranth-red-head.jpg"
  },
  "squash|delicata": {
    "photo": "/crops/varieties/squash-delicata.jpg"
  },
  "watermelon|charleston gray": {
    "photo": "/crops/varieties/watermelon-charleston-gray.jpg"
  },
  "watermelon|sugar baby": {
    "photo": "/crops/varieties/watermelon-sugar-baby.jpg"
  },
  "mustard|brown": {
    "photo": "/crops/varieties/mustard-brown.jpg"
  },
  "onion|yellow sweet spanish": {
    "photo": "/crops/varieties/onion-yellow-sweet-spanish.jpg"
  },
  "tomato|rutgers": {
    "photo": "/crops/varieties/tomato-rutgers.jpg"
  },
  "swiss chard|fordhook": {
    "photo": "/crops/varieties/swiss-chard-fordhook.jpg"
  },
  "pumpkin|cheese pumpkin": {
    "photo": "/crops/varieties/pumpkin-cheese-pumpkin.jpg"
  },
  "lentil|red": {
    "photo": "/crops/varieties/lentil-red.jpg"
  },
  "corn, dent|dent": {
    "photo": "/crops/varieties/corn-dent-dent.jpg"
  },
  "melon|honeydew": {
    "photo": "/crops/varieties/melon-honeydew.jpg"
  },
  "radish|icicle": {
    "photo": "/crops/varieties/radish-icicle.jpg"
  },
  "lettuce|red butterhead": {
    "photo": "/crops/varieties/lettuce-red-butterhead.jpg"
  },
  "fennel|florence": {
    "photo": "/crops/varieties/fennel-florence.jpg"
  },
  "cucumber|lemon": {
    "photo": "/crops/varieties/cucumber-lemon.jpg"
  },
  "watermelon|congo": {
    "photo": "/crops/varieties/watermelon-congo.jpg"
  },
  "beet|baby queen": {
    "photo": "/crops/varieties/beet-baby-queen.jpg"
  },
  "carrot|nantes": {
    "photo": "/crops/varieties/carrot-nantes.jpg"
  },
  "radish|french breakfast": {
    "photo": "/crops/varieties/radish-french-breakfast.jpg"
  },
  "beet|detroit dark red": {
    "photo": "/crops/varieties/beet-detroit-dark-red.jpg"
  },
  "lettuce|romaine": {
    "photo": "/crops/varieties/lettuce-romaine.jpg"
  },
  "carrot|white": {
    "photo": "/crops/varieties/carrot-white.jpg"
  },
  "spinach|new zealand": {
    "photo": "/crops/varieties/spinach-new-zealand.jpg"
  },
  "sweet corn|golden bantam": {
    "photo": "/crops/varieties/sweet-corn-golden-bantam.jpg"
  },
  "pea|little marvel": {
    "photo": "/crops/varieties/pea-little-marvel.jpg"
  },
  "bean, green|blue lake (pole)": {
    "photo": "/crops/varieties/bean-green-blue-lake-pole.jpg"
  },
  "bean, green|table king (bush)": {
    "photo": "/crops/varieties/bean-green-table-king-bush.jpg"
  },
  "bean|dark (black)": {
    "photo": "/crops/varieties/bean-dark-black.jpg"
  },
  "bean, lima|long red lima": {
    "photo": "/crops/varieties/bean-lima-long-red-lima.jpg"
  },
  "mustard|old fashioned": {
    "photo": "/crops/varieties/mustard-old-fashioned.jpg"
  },
  "watermelon|crimson sweet": {
    "photo": "/crops/varieties/watermelon-crimson-sweet.jpg"
  },
  "tomato|roma": {
    "photo": "/crops/varieties/tomato-roma.jpg"
  },
  "tomato|marketable improved": {
    "photo": "/crops/varieties/tomato-marketable-improved.jpg"
  },
  "tomato|san marzano": {
    "photo": "/crops/varieties/tomato-san-marzano.jpg"
  },
  "squash|summer vegetable": {
    "photo": "/crops/varieties/squash-summer-vegetable.jpg"
  },
  "radish|china rose": {
    "photo": "/crops/varieties/radish-china-rose.jpg"
  },
  "bean, pinto|pinto": {
    "photo": "/crops/varieties/bean-pinto-pinto.jpg"
  },
  "onion|yellow": {
    "photo": "/crops/varieties/onion-yellow.jpg"
  },
  "onion|red burgundy": {
    "photo": "/crops/varieties/onion-red-burgundy.jpg"
  },
  "melon|hale's best green flesh": {
    "photo": "/crops/varieties/melon-hale-s-best-green-flesh.jpg"
  },
  "melon|banana": {
    "photo": "/crops/varieties/melon-banana.jpg"
  },
  "kale|red russian": {
    "photo": "/crops/varieties/kale-red-russian.jpg"
  },
  "tomato|purple calabash": {
    "photo": "/crops/varieties/tomato-purple-calabash.jpg"
  },
  "tomato|azoychka": {
    "photo": "/crops/varieties/tomato-azoychka.jpg"
  },
  "tomato|brandywine yellow": {
    "photo": "/crops/varieties/tomato-brandywine-yellow.jpg"
  },
  "tomato|sweetie": {
    "photo": "/crops/varieties/tomato-sweetie.jpg"
  },
  "tomato|black sea man": {
    "photo": "/crops/varieties/tomato-black-sea-man.jpg"
  },
  "tomato|cherokee purple": {
    "photo": "/crops/varieties/tomato-cherokee-purple.jpg"
  },
  "tomato|black cherry": {
    "photo": "/crops/varieties/tomato-black-cherry.jpg"
  },
  "almond|sweet": {
    "photo": "/crops/varieties/almond-sweet.jpg"
  },
  "lettuce|butterhead": {
    "photo": "/crops/varieties/lettuce-butterhead.jpg"
  },
  "kale|dwarf siberian": {
    "photo": "/crops/varieties/kale-dwarf-siberian.jpg"
  },
  "bean, kidney|kidney": {
    "photo": "/crops/varieties/bean-kidney-kidney.jpg"
  },
  "onion|red": {
    "photo": "/crops/varieties/onion-red.jpg"
  },
  "collard|blue stem": {
    "photo": "/crops/varieties/collard-blue-stem.jpg"
  },
  "squash|butternut": {
    "photo": "/crops/varieties/squash-butternut.jpg"
  },
  "tomato|red cherry": {
    "photo": "/crops/varieties/tomato-red-cherry.jpg"
  },
  "celery|tall utah": {
    "photo": "/crops/varieties/celery-tall-utah.jpg"
  },
  "cucumber|armenian": {
    "photo": "/crops/varieties/cucumber-armenian.jpg"
  },
  "pepper, bell|bell": {
    "photo": "/crops/varieties/pepper-bell-bell.jpg"
  },
  "cabbage|golden acre": {
    "photo": "/crops/varieties/cabbage-golden-acre.jpg"
  },
  "brussels sprouts|long island improved": {
    "photo": "/crops/varieties/brussels-sprouts-long-island-improved.jpg"
  },
  "poppy|annual": {
    "photo": "/crops/varieties/poppy-annual.jpg"
  },
  "watermelon|black diamond": {
    "photo": "/crops/varieties/watermelon-black-diamond.jpg"
  },
  "parsnip|hollow crown": {
    "photo": "/crops/varieties/parsnip-hollow-crown.jpg"
  },
  "carrot|danvers": {
    "photo": "/crops/varieties/carrot-danvers.jpg"
  }
};

export function varietyPhoto(commonName: string, variety?: string): string | undefined {
  if (!variety) return undefined;
  return varietyPhotos[`${commonName.toLowerCase()}|${variety.toLowerCase()}`]?.photo;
}
