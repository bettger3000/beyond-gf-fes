#!/bin/bash

# Create placeholder images for all shops
shops=("tomarigi" "doracafe" "rucipio" "kumasan" "2525sweets" "tototo" "sora1na" "cocokara" "corpo" "haruhana")

for shop in "${shops[@]}"; do
  # Create placeholder SVG for photos
  for i in 1 2; do
    filename="${shop}_${i}.webp"
    # Since we can't create actual webp, we'll upload SVG placeholders with webp names
    echo "Creating placeholder for $filename"
    
    # Create a simple SVG placeholder
    cat > "assets/shops/${filename}.svg" << EOF
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#999">${shop} Photo ${i}</text>
</svg>
EOF
    
    # Upload to R2 (as SVG but with webp filename)
    wrangler r2 object put gf-fes-images/"${filename}" --file="assets/shops/${filename}.svg"
    
    # Clean up temporary file
    rm "assets/shops/${filename}.svg"
  done
done

echo "All placeholder images created and uploaded!"