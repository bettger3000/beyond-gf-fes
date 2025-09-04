// Fix image paths in database to use R2 URLs
const shopData = [
  {
    id: "s01",
    thumb: "tomarigi.svg",  // Remove assets/shops/ prefix
    photos: ["tomarigi_1.webp", "tomarigi_2.webp"]
  },
  {
    id: "s02", 
    thumb: "69EA9AFA-B3F9-458F-8A2C-C54783E2488F - ã®ã®ã®ãããã®ã³ããã¼_1200_1756955063456.jpeg",
    photos: [
      "EMJ09833 - ã®ã®ã®ãããã®ã³ããã¼_1200_1756955068006.jpeg",
      "EMJ09953 - ã®ã®ã®ãããã®ã³ããã¼_1200_1756955072217.jpeg",
      "EMJ00235 - ã®ã®ã®ãããã®ã³ããã¼_1200_1756955075456.jpeg",
      "IMG_9491 - ã®ã®ã®ãããã®ã³ããã¼_1200_1756955078492.jpeg"
    ]
  },
  {
    id: "s03",
    thumb: "rucipio.svg",
    photos: ["rucipio_1.webp", "rucipio_2.webp"]
  },
  {
    id: "s04",
    thumb: "kumasan.svg", 
    photos: ["kumasan_1.webp", "kumasan_2.webp"]
  },
  {
    id: "s05",
    thumb: "2525sweets.svg",
    photos: ["2525sweets_1.webp", "2525sweets_2.webp"]
  },
  {
    id: "s06",
    thumb: "tototo.svg",
    photos: ["tototo_1.webp", "tototo_2.webp"]
  },
  {
    id: "s07",
    thumb: "sora1na.svg",
    photos: ["sora1na_1.webp", "sora1na_2.webp"]
  },
  {
    id: "s08",
    thumb: "cocokara.svg",
    photos: ["cocokara_1.webp", "cocokara_2.webp"]
  },
  {
    id: "s09",
    thumb: "corpo.svg",
    photos: ["corpo_1.webp", "corpo_2.webp"]
  }
];

// Generate SQL to update image paths
const updates = shopData.map(shop => 
  `UPDATE shops SET thumb = '${shop.thumb}', photos = '${JSON.stringify(shop.photos)}' WHERE id = '${shop.id}';`
);

console.log(updates.join('\n'));