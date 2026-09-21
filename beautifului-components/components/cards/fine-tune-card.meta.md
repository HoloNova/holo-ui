# Fine-tune Card

**Category**: Cards  
**Source**: https://www.beautifului.dev/#fine-tune-card  
**Tags**: fine-tune, parameters, sliders, model settings, configuration, controls, hyperparameters

## Description
Compact parameter tuning card for tweaking AI model parameters before or during inference. Features:
- Clean card header with icon and action reset button
- Parameter rows with numeric labels and steppers/sliders (Temperature, Top P, Max Tokens)
- Real-time tabular figures updating on input change
- Presets dropdown selector (Creative, Balanced, Precise)
- Apply / Save button in card footer

## Dependencies
- `shared/base.css` — card shadows and typography variables
- Tailwind CSS v4 — form elements and card layout

## Parameters Supported
| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| **Temperature** | `0.7` | `0.0 - 2.0` | Controls randomness vs predictability |
| **Top P** | `0.9` | `0.0 - 1.0` | Nucleus sampling probability cutoff |
| **Max Tokens** | `2048` | `1 - 8192` | Hard response length limit |

## Customization
- Bind native `<input type="range">` to the value badges with real-time `input` event listeners.
