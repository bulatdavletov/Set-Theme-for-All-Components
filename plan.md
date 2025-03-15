# Figma Theme Setter Plugin

## Repository Management
- Reset main branch to commit 6e1c5974074532dfda3476f0553d053b3f9493af (2023-10-15)
  - This commit contains the refactored theme application logic with async operations
  - Includes improved circular reference detection and refined theme loading process
  - All subsequent commits have been discarded
  - This commit is now the HEAD of the main branch

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
- ✅ No ui version, with Figma native actions. Use notifications for feedback.
    - ✅ Apply Dark Theme to All
    - ✅ Apply Light Theme to All
- ✅ Fix nested instances: Check and update instances inside other instances
- ✅ Suppress circular reference errors and simplify notifications
- Add command to show UI, because now there is no way to do it.
- ✅ Update manifest.json with required fields for publishing:
    - ✅ Added "networkAccess" with "allowedDomains": ["none"]
    - ✅ Added "documentAccess": "dynamic-page"
- ✅ Update code to support dynamic-page loading:
    - ✅ Replaced direct mainComponent access with getMainComponentAsync()
    - ✅ Updated functions to be async/await compatible
    - ✅ Fixed circular reference detection to work asynchronously
    - ✅ Made main function async and properly awaited results from async functions

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
- Added menu commands for direct theme application without UI:
  - "Apply Dark Theme to All" command applies Dark theme to all components with notifications for feedback
  - "Apply Light Theme to All" command applies Light theme to all components with notifications for feedback
  - Both commands show the number of components updated and layers checked
  - Both commands notify about any skipped components with circular references
  - Commands operate in a UI-less mode, communicating exclusively through Figma notifications
  - Implemented separate command-specific functions to avoid UI-related code when running in command mode
- Fixed handling of nested instances:
  - Now properly checks and updates instances that are inside other instances
  - Traverses through all children of instances to find nested instances
  - Ensures all instances in the selection are updated, regardless of nesting level
- Improved circular reference handling and simplified notifications:
  - Modified circular reference detection to be more lenient
  - Changed console.error to console.log to avoid red error messages in the console
  - Removed the second check that was causing false positives
  - Updated notification messages to only mention skipped components that already had the desired theme
  - Removed all mentions of circular references from user-facing messages
  - Changed warning icon (⚠️) to info icon (ℹ️) for skipped components notification
- Fixed notification issues in command mode:
  - Added timeout to skipped components notification to make it automatically close
  - Improved the message for zero updated components to be more friendly
  - Consolidated multiple notifications into a single message with clear format:
    - Shows ratio of updated to total themed components: "✅ Updated X/N"
    - Uses friendly message when nothing was updated: "🌚 Everything already Dark" or "☀️ Everything already Light"
    - Shows no notification at all if nothing was updated or already themed
    - Added appropriate emojis for better visual distinction
- Added comprehensive logging of all checked layer names in the console for debugging
- Enhanced cycle detection for nested instances:
  - Improved the hasCircularReference function to detect instances nested inside other instances from the same component set
  - Added specific handling for cycle-related errors when updating themes
  - Properly categorized cycle errors to prevent console error messages
  - Added more detailed logging for cycle detection to aid in debugging
  - This fixes issues with nested instances that have overridden themes (e.g., a Dark theme instance containing a Light theme instance)

## Recent Fixes
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
- Added menu commands for direct theme application:
  - Created menu items in the manifest.json file
  - Implemented command handling in the main code
  - Created a separate command-specific function for theme application that doesn't use UI
  - Added notifications for feedback when running in command mode
  - Fixed issues with UI messaging when running in command mode
- Fixed handling of nested instances:
  - Modified both UI and command mode functions to check instances inside other instances
  - Removed early returns that were preventing traversal into instance children
  - Restructured the code to always traverse children, even for instances
  - This ensures all nested instances are properly checked and updated
- Fixed notification issues in command mode:
  - Added timeout to skipped components notification to make it automatically close
  - Improved the message for zero updated components to be more friendly
  - Consolidated multiple notifications into a single message with clear format:
    - Shows ratio of updated to total themed components: "✅ Updated X/N"
    - Uses friendly message when nothing was updated: "🌚 Everything already Dark" or "☀️ Everything already Light"
    - Shows no notification at all if nothing was updated or already themed
    - Added appropriate emojis for better visual distinction
- Added comprehensive logging of all checked layer names in the console for debugging
- Enhanced cycle detection for nested instances:
  - Improved the hasCircularReference function to detect instances nested inside other instances from the same component set
  - Added specific handling for cycle-related errors when updating themes
  - Properly categorized cycle errors to prevent console error messages
  - Added more detailed logging for cycle detection to aid in debugging
  - This fixes issues with nested instances that have overridden themes (e.g., a Dark theme instance containing a Light theme instance)

## Algorithm Explanation

### How the Plugin Works

The plugin follows a systematic approach to apply themes to component instances:

1. **Initialization**:
   - The plugin can be launched in two ways:
     - Via menu commands ("Apply Dark Theme to All" or "Apply Light Theme to All")
     - Via the normal plugin interface with UI
   - In command mode, it directly applies the specified theme without showing UI
   - In UI mode, it shows a segmented control for theme selection

2. **Node Traversal Algorithm**:
   - The plugin uses a recursive depth-first traversal to process all nodes in the selection:
   ```typescript
   function traverseNode(node: SceneNode) {
     // Process current node
     if (node.type === 'INSTANCE') {
       // Handle component instance
     }
     
     // Recursively process children
     if ('children' in node) {
       for (const child of node.children) {
         traverseNode(child)
       }
     }
   }
   ```

3. **Component Instance Processing**:
   - For each instance, the plugin:
     1. Checks if it has a circular reference (is part of its own main component)
     2. Checks if it has a "Theme" property
     3. Checks if the current theme matches the desired theme
     4. Updates the theme if needed

4. **Circular Reference Detection**:
   - The plugin uses a specialized function to detect circular references:
   ```typescript
   function hasCircularReference(instance: InstanceNode): boolean {
     // Check if instance is part of its own main component
     // This prevents "Components can't contain instances of themselves" errors
   }
   ```

5. **Theme Application**:
   - The plugin uses the Figma API to update the theme property:
   ```typescript
   node.setProperties({ Theme: theme });
   ```

6. **Progress Tracking**:
   - Throughout the process, the plugin tracks:
     - Total layers checked
     - Instances updated
     - Instances skipped (already had the theme or circular references)
     - Progress percentage (for UI feedback)

7. **Results Reporting**:
   - In UI mode: Shows a detailed results screen
   - In command mode: Displays Figma notifications with summary information

### Performance Optimizations

1. **Selective Processing**:
   - Only processes nodes when needed (when Apply button is pressed)
   - Skips instances that already have the desired theme

2. **Progress Updates**:
   - Provides real-time progress updates for large selections
   - Updates UI periodically rather than after every node to prevent performance issues

3. **Error Handling**:
   - Catches and handles errors during theme application
   - Prevents plugin crashes due to circular references or other issues

### Special Cases

1. **Nested Instances**:
   - The plugin handles instances inside other instances by recursively traversing all children
   - This ensures all instances are updated regardless of nesting level

2. **Circular References**:
   - Detects and skips instances that are part of their own main component
   - Prevents the "Components can't contain instances of themselves" error
   - Provides feedback on skipped instances

3. **Theme Property Variations**:
   - Handles different Figma API structures for component properties
   - Ensures compatibility with various component setups

## Next Steps
1. ~~Set up the initial project structure~~ ✅
2. ~~Implement the core functionality to detect and modify component instances~~ ✅
3. ~~Create the UI with theme selection dropdown~~ ✅
4. ~~Connect the UI with the main plugin code~~ ✅
5. ~~Test and refine the plugin~~ ✅
6. Create plugin icon and cover image for publishing
7. Write a compelling plugin description for the Figma Community
8. Submit the plugin for review in the Figma Community 