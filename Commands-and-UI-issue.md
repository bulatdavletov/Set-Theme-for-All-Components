# Figma Plugin UI Command Issue: Technical Description

## Issue Summary
Your Figma plugin is encountering an error when trying to show the UI via the "show-ui" command. The specific error is:

```
Error: No UI defined for command `show-ui`
```

This is followed by another error when attempting to fix it:

```
Error: No UI defined
    at showUI (PLUGIN_293_SOURCE:42)
```

## Technical Details

### Root Cause
The issue stems from a mismatch between how UI resources are defined in the manifest and how they're accessed in the code. There are two key aspects to this problem:

1. **UI Resource Definition**: 
   - You've correctly updated your manifest.json to use a map of UI files:
   ```json
   "ui": {
     "main": "build/ui.js",
     "show-ui": "build/ui.js"
   }
   ```

2. **UI Resource Access**: 
   - The code is trying to access these UI resources using `__uiFiles__["show-ui"]` and `__uiFiles__.main`, but there's a fundamental issue with how the `@create-figma-plugin/utilities` package's `showUI` function works versus Figma's native `figma.showUI` method.

### Specific Technical Issues

1. **Utility Package vs. Native API**:
   - The `showUI` function from `@create-figma-plugin/utilities` is a wrapper around Figma's native `figma.showUI` but handles UI resources differently.
   - When using the utility package's `showUI`, it doesn't support command-specific UIs in the same way as the native API.

2. **Global Variables Access**:
   - The `__uiFiles__` global variable is only available when using Figma's native `figma.showUI` method, not when using the utility package.
   - The error suggests that the code is trying to access a variable that doesn't exist in the current context.

3. **Command-Specific UI Handling**:
   - Figma's plugin system requires special handling for command-specific UIs, which involves either:
     a) Using the native `figma.showUI` with the `__uiFiles__` global variable
     b) Using a different approach with the utility package that doesn't rely on command-specific UI files

## Research Directions

To solve this issue, you should research:

1. **Figma Plugin UI Architecture**:
   - How Figma handles UI resources for plugins, especially with command-specific UIs
   - The difference between `ui` as a string vs. a map in the manifest.json

2. **@create-figma-plugin/utilities Package**:
   - How the `showUI` function in this package works internally
   - Whether it supports command-specific UIs and how to configure them
   - Alternative approaches when using this package with command-based plugins

3. **Global Variables in Figma Plugins**:
   - When and how `__html__`, `__uiFiles__`, and other global variables are made available
   - The scope and limitations of these variables in different contexts

4. **Command-Based Plugin Best Practices**:
   - How to structure a plugin that has both command-based operations and a UI
   - Patterns for sharing UI code between different commands

5. **Figma Plugin API Updates**:
   - Recent changes to how UI resources are handled in Figma plugins
   - Any known issues or limitations with command-specific UIs

This research should help you understand the underlying architecture and find the appropriate solution for your specific plugin setup.
