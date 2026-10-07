---
name: crop
description: Crop a region for a zoomed sub-view. Use when you need to examine a specific area in greater detail.
---

# Crop

Crop any region of interest using the provided CLI script.

## Command

```bash
python workplace/skills/crop/scripts/crop.py \
  --image <image_path> \
  --bbox <x1>,<y1>,<x2>,<y2> \
  --output <output_path> \
  [--coord-mode relative|absolute]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `--image` | Path to the source image |
| `--bbox` | Bounding box as `x1,y1,x2,y2` (left,top,right,bottom) |
| `--output` | Path to save the cropped image |
| `--coord-mode` | `relative` (default): coordinates in [0,1000] range; `absolute`: pixel coordinates |

## Examples

**Relative coordinates (0-1000):**
```bash
python workplace/skills/crop/scripts/crop.py \
  --image input.jpg \
  --bbox 100,200,500,600 \
  --output artifacts/crop_region1.jpg
```

**Absolute pixel coordinates:**
```bash
python workplace/skills/crop/scripts/crop.py \
  --image input.jpg \
  --bbox 50,100,400,300 \
  --output artifacts/crop_region1.jpg \
  --coord-mode absolute
```

## Output

Prints JSON to stdout:
```json
{"ok": true, "crop_path": "artifacts/crop_region1.jpg", "width": 350, "height": 200}
```

On error:
```json
{"ok": false, "error": "description of the error"}
```

## Tips

- Save cropped images to the `artifacts/` directory for the current sample
- Output picture format is automatically forced to match the input image format (e.g. input `.jpg` -> output `.jpg`).
