# Figma Theme Setter Plugin

This plugin allows you to quickly set a theme for all component instances within a selection. It provides a visual segmented control interface where you can select a theme, and upon confirmation, the plugin will update the "Theme" property for all component instances found within the selection.

## Features

- Visual segmented control UI to select a theme
- Ability to apply the selected theme to all component instances within the current selection
- Feedback on how many instances were updated
- Support for both light and dark mode in the plugin UI
- Dynamic updates when selection changes
- Display of instance count in the current selection
- Minimalist UI with simplified text display format
- Detection and display of instances with circular references that cannot be updated
- Results screen showing successful updates and skipped instances
- Always includes both Light and Dark themes, plus any other detected themes

## How to Use

1. Select one or more layers in your Figma document
2. Run the "Set Theme for All Components" plugin
3. Choose a theme from the segmented control
4. Click "Apply Theme" to update all component instances within your selection
5. View the results showing how many instances were updated and which ones were skipped

## Requirements

- The component instances must have a "Theme" property defined
- The selected theme must be a valid option for the component instances

## Technical Details

This plugin handles several edge cases:

- **Circular References**: The plugin detects and skips instances that are part of their own main component to prevent the "Components can't contain instances of themselves" error
- **Dynamic Selection Updates**: The plugin listens for selection changes in Figma and updates the available themes and instance count automatically
- **Fallback Themes**: Even if no themes are detected in the selection, the plugin always provides Light and Dark as standard options

## Development

This plugin is built using:
- Figma Plugin API
- TypeScript for type safety
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

**Manifest Generation**

The plugin uses `manifest.template.json` as the source of truth for configuration.  
After each build (`npm run build`), `manifest.json` is automatically regenerated from `manifest.template.json`.  
**Edit only `manifest.template.json`** to make changes to your plugin manifest.

### Project Structure

- `src/main.ts`: Contains the main plugin code that runs in the Figma context
- `src/ui.tsx`: Contains the UI code for the plugin
- `manifest.template.json`: Source of truth for plugin configuration.
- `manifest.json`: Generated automatically from `manifest.template.json` after each build.

## Current Status

The plugin has been successfully implemented and debugged. All core functionality is working as expected. The next steps include:

1. Create plugin icon and cover image for publishing
2. Write a compelling plugin description for the Figma Community
3. Submit the plugin for review in the Figma Community

## License

[MIT License](LICENSE)
