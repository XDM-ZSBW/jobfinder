#!/usr/bin/env python3
"""
Simple script to generate placeholder icons for the Chrome extension.
Requires Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Error: Pillow not installed. Install it with: pip install Pillow")
    exit(1)

# Icon sizes
SIZES = [16, 48, 128]

# Colors
BACKGROUND = (102, 126, 234)  # Purple gradient color
TEXT_COLOR = (255, 255, 255)  # White

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')

def create_icon(size):
    """Create a simple icon with a target emoji or text"""
    
    # Create image with background
    img = Image.new('RGB', (size, size), BACKGROUND)
    draw = ImageDraw.Draw(img)
    
    # Draw target emoji / symbol
    # For simplicity, draw a circle with text
    margin = size // 8
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(255, 255, 255),
        outline=(118, 75, 162),
        width=max(1, size // 32)
    )
    
    # Try to add text "JM" for JobMatch
    try:
        font_size = size // 2
        # Try to use a default font
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        text = "🎯" if size >= 48 else "JM"
        
        # Get text bounding box for centering
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        position = ((size - text_width) // 2, (size - text_height) // 2 - size // 16)
        draw.text(position, text, fill=BACKGROUND, font=font)
    except Exception as e:
        print(f"Warning: Could not add text to icon: {e}")
    
    return img

def main():
    """Generate all icon sizes"""
    
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Generating icons...")
    
    for size in SIZES:
        icon = create_icon(size)
        output_path = os.path.join(OUTPUT_DIR, f'icon{size}.png')
        icon.save(output_path, 'PNG')
        print(f"✓ Created {output_path}")
    
    print("\nDone! Icons generated in:", OUTPUT_DIR)
    print("\nYou can now load the extension in Chrome:")
    print("1. Go to chrome://extensions/")
    print("2. Enable Developer mode")
    print("3. Click 'Load unpacked'")
    print("4. Select the chrome-extension folder")

if __name__ == '__main__':
    main()
