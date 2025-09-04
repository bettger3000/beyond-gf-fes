// Temporarily use only SVG images (which are uploaded to R2)
const shopUpdates = [
  `UPDATE shops SET thumb = 'tomarigi.svg', photos = '[]' WHERE id = 's01';`,
  `UPDATE shops SET thumb = 'doracafe.svg', photos = '[]' WHERE id = 's02';`,
  `UPDATE shops SET thumb = 'rucipio.svg', photos = '[]' WHERE id = 's03';`,
  `UPDATE shops SET thumb = 'kumasan.svg', photos = '[]' WHERE id = 's04';`,
  `UPDATE shops SET thumb = '2525sweets.svg', photos = '[]' WHERE id = 's05';`,
  `UPDATE shops SET thumb = 'tototo.svg', photos = '[]' WHERE id = 's06';`,
  `UPDATE shops SET thumb = 'sora1na.svg', photos = '[]' WHERE id = 's07';`,
  `UPDATE shops SET thumb = 'cocokara.svg', photos = '[]' WHERE id = 's08';`,
  `UPDATE shops SET thumb = 'corpo.svg', photos = '[]' WHERE id = 's09';`
];

console.log(shopUpdates.join('\n'));