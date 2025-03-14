# Figma Theme Setter Plugin

## TODO
- Ignore if instance already had desired theme. Show in the results skipped.
- Don't show 0 with succes messages.
- Don't use colored background for messages. Find another UI for it.
- Instances with Theme property found
- Detailed loading state for long running operations - when select or apply to big file. 

## Description
This plugin allows users to quickly set a theme for all component instances within a selection. The plugin provides a segmented control interface where users can select a theme, and upon confirmation, the plugin will update the "Theme" property for all component instances found within the selection.

## Features
- Visual segmented control UI to select a theme ✅
- Ability to apply the selected theme to all component instances within the current selection ✅
- Feedback on how many instances were updated ✅
- Support for both light and dark mode in the plugin UI ✅
- Dynamic updates when selection changes ✅
- Display of instance count in the current selection ✅
- Minimalist UI with no plugin name or cancel button ✅
- Simplified text display format ("Selected: N", "Instances found: N") ✅
- Display list of instances with circular references that cannot be updated ✅
- Results screen showing successful updates and skipped instances ✅

## Technical Requirements
- Figma Plugin API ✅
- TypeScript for type safety ✅
- Preact for UI components ✅
- CSS variables for theming support ✅

## Implementation Plan

### 1. Setup Project Structure ✅
- Initialize the plugin project using Create Figma Plugin ✅
- Set up TypeScript configuration ✅
- Create necessary directories (src, ui, etc.) ✅

### 2. Create Plugin Main Code ✅
- Implement code to check if there's a valid selection ✅
- Create functions to traverse through the selection and find all component instances ✅
- Implement logic to check if instances have a "Theme" property ✅
- Create functions to update the "Theme" property of instances ✅

### 3. Design and Implement UI ✅
- Create a segmented control component for theme selection ✅
- Implement a button to apply the selected theme ✅
- Add status messages for user feedback ✅
- Ensure UI supports both light and dark themes ✅
- Implement minimalist UI by removing plugin name and Cancel button ✅
- Use simplified text display format for better readability ✅
- Display list of instances with circular references that cannot be updated ✅
- Add results screen showing successful updates and skipped instances ✅

### 4. Connect UI with Plugin Logic ✅
- Set up communication between the UI and the main plugin code ✅
- Pass selection data from the main code to the UI ✅
- Send theme selection from the UI back to the main code ✅
- Send circular reference information to the UI ✅
- Send theme application results back to the UI ✅

### 5. Error Handling and Edge Cases ✅
- Handle cases where no items are selected ✅
- Handle cases where selected items don't contain any component instances ✅
- Handle cases where component instances don't have a "Theme" property ✅
- Provide appropriate error messages to the user ✅
- Identify and display instances with circular references ✅
- Show detailed results after theme application ✅

### 6. Testing ✅
- Test the plugin with various selection scenarios ✅
- Test with different component structures ✅
- Verify theme changes are applied correctly ✅
- Test UI in both light and dark modes ✅
- Test circular reference detection and display ✅
- Test results screen functionality ✅

### 7. Optimization and Refinement ✅
- Optimize code for performance with large selections ✅
- Refine UI for better user experience ✅
- Add loading states for operations that might take time ✅

### 8. Documentation ✅
- Create documentation for users ✅
- Add comments in the code for future maintenance ✅

### 9. Packaging and Publishing 🔄
- Prepare the plugin for publishing ✅
- Create necessary assets (icon, cover image, etc.) ⏳
- Write a compelling description for the plugin listing ⏳

## Current Status
The plugin has been successfully implemented and debugged. All core functionality is working as expected:
- The plugin can detect component instances with a "Theme" property in the selection
- It provides a segmented control with available theme options (always including Light and Dark)
- Users can select and apply a theme to all compatible instances
- Appropriate feedback is provided to the user
- Added robust error handling and fallback theme values
- Added circular reference detection to prevent "Components can't contain instances of themselves" errors
- Dynamic updates when selection changes
- Display of instance count in the current selection
- Minimalist UI with no plugin name or Cancel button
- Simplified text display format for better readability
- Display list of instances with circular references that cannot be updated
- Results screen showing successful updates and skipped instances

### Recent Fixes
- Added comprehensive logging to debug UI and main code execution
- Improved error handling with try/catch blocks to prevent crashes
- Added fallback theme values (Light/Dark) when no themes are detected
- Enhanced the component property detection to handle different Figma API structures
- Improved the UI loading state with more informative messages
- Fixed communication between main plugin code and UI by:
  - Switching from @create-figma-plugin/utilities messaging to direct postMessage
  - Adding a timeout to ensure UI is ready before sending initial themes
  - Implementing proper message event listeners in the UI
  - Adding more detailed logging for message passing
- Added circular reference detection and handling:
  - Created a dedicated function to check for circular references
  - Skip instances that are part of their own main component
  - Provide feedback on how many instances were skipped due to circular references
  - Prevent the "Components can't contain instances of themselves" error
  - Display list of instances with circular references in the UI
  - Added results screen showing detailed information after theme application
- Modified theme detection to always include both Light and Dark themes:
  - Standard themes (Light and Dark) are always available in the dropdown
  - Any additional themes detected in the selection are also included
  - This ensures users always have basic theme options available
- Added dynamic selection updates:
  - Plugin now listens for selection changes in Figma
  - Theme list and instance count refresh automatically when selection changes
  - Added UI feedback showing how many instances were found in the selection
  - Added a refresh button when no selection is present
- Simplified the UI:
  - Removed the plugin name heading for a cleaner interface
  - Removed the Cancel button (users can close the plugin using Figma's standard UI)
  - Reduced the plugin height to accommodate the simplified UI
  - Changed text display to a clearer format ("Selected: N", "Instances found: N")
  - Added a section to display instances with circular references that cannot be updated
  - Implemented a results screen that shows successful updates and skipped instances
  - Replaced dropdown with segmented control for more visual theme selection

## Next Steps
1. ~~Set up the initial project structure~~ ✅
2. ~~Implement the core functionality to detect and modify component instances~~ ✅
3. ~~Create the UI with theme selection dropdown~~ ✅
4. ~~Connect the UI with the main plugin code~~ ✅
5. ~~Test and refine the plugin~~ ✅
6. Create plugin icon and cover image for publishing
7. Write a compelling plugin description for the Figma Community
8. Submit the plugin for review in the Figma Community 