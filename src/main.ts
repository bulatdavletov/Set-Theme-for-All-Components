import { once, showUI } from '@create-figma-plugin/utilities'

export interface ThemeFormValues {
  theme: string
}

export interface ThemeSubmitHandler {
  name: 'SUBMIT',
  handler: (formValues: ThemeFormValues) => void
}

export interface ThemeCancelHandler {
  name: 'CANCEL',
  handler: () => void
}

export interface ThemeInitHandler {
  name: 'INIT',
  handler: () => void
}

export interface ThemesAvailableHandler {
  name: 'THEMES_AVAILABLE',
  handler: (themes: string[]) => void
}

// Interface for circular reference instance
export interface CircularInstance {
  name: string;
  id: string;
}

export default function () {
  console.log('Plugin started')
  const options = { width: 240, height: 320 }
  
  // Show UI immediately
  showUI(options)
  
  // Function to update themes based on current selection
  function updateThemesFromSelection() {
    // Check if there's a valid selection
    if (figma.currentPage.selection.length === 0) {
      figma.ui.postMessage({ 
        type: 'SELECTION_EMPTY',
        message: 'Please select at least one layer'
      })
      return
    }
    
    // Find available themes and instances from component instances in the selection
    const { themes: detectedThemes, instanceCount, circularInstances } = findAvailableThemes()
    console.log('Detected themes:', detectedThemes)
    console.log('Instance count:', instanceCount)
    console.log('Circular instances:', circularInstances)
    
    // Always include both Light and Dark themes, plus any other detected themes
    const standardThemes = ['Light', 'Dark']
    const themesToUse = Array.from(new Set([...standardThemes, ...detectedThemes]))
    console.log('Themes to use:', themesToUse)
    
    // Send themes and instance count to UI
    figma.ui.postMessage({ 
      type: 'THEMES_AVAILABLE', 
      themes: themesToUse,
      instanceCount: instanceCount,
      selectionCount: figma.currentPage.selection.length,
      circularInstances: circularInstances
    })
  }
  
  // Set up message handlers
  figma.ui.onmessage = (msg) => {
    if (msg.type === 'INIT' || msg.type === 'SELECTION_CHANGED') {
      updateThemesFromSelection()
    } else if (msg.type === 'SUBMIT') {
      console.log('Applying theme:', msg.formValues.theme)
      const theme = msg.formValues.theme
      
      // Apply the selected theme to all component instances in the selection
      const result = applyThemeToSelection(theme)
      console.log('Updated instances count:', result.updatedCount)
      console.log('Circular instances in result:', result.circularInstances)
      console.log('Circular instances count:', result.circularInstances.length)
      
      // Send the results back to the UI without showing notifications
      figma.ui.postMessage({
        type: 'THEME_APPLIED',
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        circularInstances: result.circularInstances,
        theme: theme
      })
      
      // No notifications, success states will be shown in the UI
      // No plugin closing, UI will remain visible
    } else if (msg.type === 'CLOSE') {
      figma.closePlugin()
    } else if (msg.type === 'CANCEL') {
      figma.closePlugin()
    }
  }
  
  // Listen for selection changes
  figma.on('selectionchange', () => {
    updateThemesFromSelection()
  })
  
  // Initial update
  setTimeout(() => {
    updateThemesFromSelection()
  }, 300)
}

// Function to check if an instance is part of its own main component (circular reference)
function hasCircularReference(instance: InstanceNode): boolean {
  if (!instance.mainComponent) return false
  
  const mainComponentId = instance.mainComponent.id
  const mainComponentSetId = instance.mainComponent.parent?.id
  let parent = instance.parent
  
  while (parent) {
    // Check if parent is a component and has the same ID as the main component
    if (parent.type === 'COMPONENT' && parent.id === mainComponentId) {
      console.error('CIRCULAR REFERENCE DETECTED:', instance.name, 'is inside its own main component:', instance.mainComponent.name)
      return true
    }
    
    // Check if parent is a component set and contains the main component
    if (parent.type === 'COMPONENT_SET' && parent.id === mainComponentSetId) {
      // If they're from the same component set, this is likely a theme variation
      // (like Light/Dark variants), so we'll ignore it
      console.log('Ignoring instance from same component set:', instance.name);
      return false
    }
    
    parent = parent.parent
  }
  
  return false
}

// Function to find all available themes from component instances in the selection
function findAvailableThemes(): { themes: string[], instanceCount: number, circularInstances: CircularInstance[] } {
  const themes = new Set<string>()
  let instanceCount = 0
  let themePropertyCount = 0
  const circularInstances: CircularInstance[] = []
  
  // Recursive function to traverse nodes
  function traverseNode(node: SceneNode) {
    // Debug info for component instances
    if (node.type === 'INSTANCE') {
      instanceCount++
      console.log('Instance found:', node.name)
      
      // Check for main component to detect circular references
      if (node.mainComponent) {
        console.log('Main component:', node.mainComponent.name)
        
        // Check if this instance is part of its own main component
        if (hasCircularReference(node)) {
          console.error('Skipping theme detection for circular instance:', node.name)
          circularInstances.push({
            name: node.name,
            id: node.id
          })
          return // Skip this instance to avoid issues
        }
      }
      
      try {
        // Check if the instance has a "Theme" property
        const componentProperties = node.componentProperties
        
        if (componentProperties && 'Theme' in componentProperties) {
          themePropertyCount++
          const themeProperty = componentProperties['Theme']
          
          if (themeProperty && themeProperty.type === 'VARIANT') {
            // Get the current theme value
            if (themeProperty.value && typeof themeProperty.value === 'string') {
              themes.add(themeProperty.value)
            }
            
            // Try to get other possible values by checking other instances
            try {
              const mainComponent = node.mainComponent
              if (mainComponent) {
                // Method 1: Using variantProperties
                if (mainComponent.variantProperties) {
                  if ('Theme' in mainComponent.variantProperties) {
                    const themeValues = mainComponent.variantProperties['Theme']
                    if (Array.isArray(themeValues)) {
                      themeValues.forEach((value: string) => {
                        themes.add(value)
                      })
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error accessing main component properties:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error processing instance:', error)
      }
    }
    
    // Traverse children if the node is a parent
    if ('children' in node) {
      for (const child of node.children) {
        traverseNode(child)
      }
    }
  }
  
  // Traverse all selected nodes
  figma.currentPage.selection.forEach(node => traverseNode(node))
  
  console.log(`Found ${instanceCount} instances, ${themePropertyCount} with Theme property`)
  return { 
    themes: Array.from(themes),
    instanceCount: themePropertyCount,
    circularInstances: circularInstances
  }
}

// Function to apply the selected theme to all component instances in the selection
function applyThemeToSelection(theme: string): { updatedCount: number, skippedCount: number, circularInstances: CircularInstance[] } {
  let updatedCount = 0
  let skippedCount = 0
  const circularInstances: CircularInstance[] = []
  
  // Recursive function to traverse nodes
  function traverseNode(node: SceneNode) {
    if (node.type === 'INSTANCE') {
      console.log('Checking instance for update:', node.name)
      
      // Skip instances that are part of their own main component
      if (hasCircularReference(node)) {
        console.error('Skipping update for circular instance:', node.name)
        circularInstances.push({
          name: node.name,
          id: node.id
        })
        console.log('Added circular instance to list:', node.name, 'Total:', circularInstances.length)
        skippedCount++
        return
      }
      
      try {
        // Check if the instance has a "Theme" property
        const componentProperties = node.componentProperties
        if (componentProperties && 'Theme' in componentProperties) {
          const themeProperty = componentProperties['Theme']
          if (themeProperty && themeProperty.type === 'VARIANT') {
            // Check if the instance already has the desired theme
            if (themeProperty.value === theme) {
              console.log('Instance already has the desired theme:', node.name)
              skippedCount++
              return
            }
            
            // Try to update the theme property
            try {
              console.log('Updating theme for node:', node.name)
              node.setProperties({ Theme: theme })
              updatedCount++
            } catch (error) {
              console.error('Error updating theme for node:', node.name, error)
              skippedCount++
            }
          }
        }
      } catch (error) {
        console.error('Error processing instance for theme update:', error)
      }
    }
    
    // Traverse children if the node is a parent
    if ('children' in node) {
      for (const child of node.children) {
        traverseNode(child)
      }
    }
  }
  
  // Traverse all selected nodes
  figma.currentPage.selection.forEach(node => traverseNode(node))
  
  console.log('Final circular instances count:', circularInstances.length)
  console.log('Circular instances:', circularInstances)
  
  return { updatedCount, skippedCount, circularInstances }
} 