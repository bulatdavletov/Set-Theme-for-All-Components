# Figma Theme Setter Plugin

This plugin allows you to quickly set a theme for all component instances within a selection. It provides a simple dropdown interface where you can select a theme, and upon confirmation, the plugin will update the "Theme" property for all component instances found within the selection.

## Features

- Simple dropdown UI to select a theme
- Ability to apply the selected theme to all component instances within the current selection
- Feedback on how many instances were updated
- Support for both light and dark mode in the plugin UI

## How to Use

1. Select one or more layers in your Figma document
2. Run the "Set Theme for All Components" plugin
3. Choose a theme from the dropdown menu
4. Click "Apply Theme" to update all component instances within your selection

## Requirements

- The component instances must have a "Theme" property defined
- The selected theme must be a valid option for the component instances

## Development

This plugin is built using:
- Figma Plugin API
- TypeScript
- Preact for UI components
- Create Figma Plugin utilities

### Setup

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run watch
```

### Project Structure

- `src/main.ts`: Contains the main plugin code that runs in the Figma context
- `src/ui.tsx`: Contains the UI code for the plugin
- `manifest.json`: Plugin configuration

## License

[MIT License](LICENSE)
