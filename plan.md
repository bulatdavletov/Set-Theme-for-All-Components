# Figma Theme Setter Plugin

## TODO
- ✅ Ignore if instance already had desired theme. Show in the results skipped.
- ✅ Don't show 0 with succes messages.
- ✅ Don't use colored background for messages. Find another UI for it.
- ✅ Instances with Theme property found
- ✅ Detailed loading state for long running operations - when select or apply to big file. 
- ✅ Use only hardcoded Light and Dark themes instead of searching for available themes
- ✅ For detailed status show numbers of checked layers
- ✅ Performance improvement: Only check layers when Apply button is pressed, show real-time progress
- ✅ Remove "Selected: N" text from UI
- ✅ Don't show skipped count. Show Applied count. If zero, tell something nice
- No ui version, with Figma native actions. Use notifications for feedback.
    - Dark Theme. Apply to all instances
    - Light Theme. Apply to all instances

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
- Simplified text display format with only essential information ✅
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
- It provides a segmented control with hardcoded theme options (Light and Dark)
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
- Skips instances that already have the desired theme and shows them in the results
- Improved UI for results with cleaner design (no colored backgrounds)
- Added detailed loading states for long-running operations
- Uses only hardcoded Light and Dark themes instead of searching for available themes
- Shows the total number of checked layers in both the main view and results screen

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
- Simplified theme handling to only use hardcoded Light and Dark themes:
  - Removed theme detection from component instances
  - Always use Light and Dark as the only available themes
  - This simplifies the code and makes the plugin more efficient
- Added dynamic selection updates:
  - Plugin now listens for selection changes in Figma
  - Instance count refreshes automatically when selection changes
  - Added UI feedback showing how many instances were found in the selection
  - Added a refresh button when no selection is present
- Simplified the UI:
  - Removed the plugin name heading for a cleaner interface
  - Removed the Cancel button (users can close the plugin using Figma's standard UI)
  - Reduced the plugin height to accommodate the simplified UI
  - Changed text display to a clearer format ("Selected: N", "Instances with Theme property: N")
  - Added a section to display instances with circular references that cannot be updated
  - Implemented a results screen that shows successful updates and skipped instances
  - Replaced dropdown with segmented control for more visual theme selection
  - Improved results display with cleaner design (no colored backgrounds)
  - Added detailed loading states for long-running operations
- Added functionality to skip instances that already have the desired theme:
  - Checks the current theme value before attempting to update
  - Counts skipped instances in the results
  - Shows clear information about why instances were skipped
- Added detailed layer counting:
  - Tracks the total number of layers checked during theme detection and application
  - Displays the count in both the main UI and results screen
  - Provides users with insight into how many layers were processed
- UI improvements for better user experience:
  - Changed "Updated" to "Applied" for clearer terminology
  - Removed the "Skipped" count display to focus on positive outcomes
  - Added encouraging messages when no components have been applied yet
  - Added a friendly message when all components are already perfect (zero applied count)
  - Used more friendly icons (✨) for positive feedback
  - Completely removed the "Skipped: X components" message and related information from results section
  - Simplified results view by removing "Results for theme: X" heading
  - Moved "Checked X layers in total" to the bottom of results for better visual hierarchy
  - Removed the Clear Results button to streamline the interface
  - Fixed alignment of the checkmark icon in "Applied: X components" message

## Next Steps
1. ~~Set up the initial project structure~~ ✅
2. ~~Implement the core functionality to detect and modify component instances~~ ✅
3. ~~Create the UI with theme selection dropdown~~ ✅
4. ~~Connect the UI with the main plugin code~~ ✅
5. ~~Test and refine the plugin~~ ✅
6. Create plugin icon and cover image for publishing
7. Write a compelling plugin description for the Figma Community
8. Submit the plugin for review in the Figma Community 