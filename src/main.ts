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
  
  // Check if the plugin was launched with a command
  if (figma.command) {
    console.log('Plugin launched with command:', figma.command)
    
    // Handle menu commands
    if (figma.command === 'apply-dark-theme') {
      const result = applyThemeToSelectionCommand('Dark')
      
      // Show message based on results
      if (result.updatedCount > 0) {
        // Show ratio of updated to already themed
        figma.notify(`✅ Updated ${result.updatedCount} / ${result.skippedCount + result.updatedCount}`)
      } else if (result.skippedCount > 0) {
        // If nothing was updated but some were already themed
        figma.notify(`🌚 Everything already Dark`)
      }
      
      figma.closePlugin()
      return
    } else if (figma.command === 'apply-light-theme') {
      const result = applyThemeToSelectionCommand('Light')
      
      // Show message based on results
      if (result.updatedCount > 0) {
        // Show ratio of updated to already themed
        figma.notify(`✅ Updated ${result.updatedCount}/${result.skippedCount + result.updatedCount}`)
      } else if (result.skippedCount > 0) {
        // If nothing was updated but some were already themed
        figma.notify(`☀️ Everything already Light`)
      }
      
      figma.closePlugin()
      return
    }
  }
  
  // If no command or unknown command, show the UI
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
    
    // Just send the selection count to UI without analyzing
    figma.ui.postMessage({ 
      type: 'THEMES_AVAILABLE', 
      themes: ['Light', 'Dark'],
      selectionCount: figma.currentPage.selection.length
    })
  }
  
  // Set up message handlers
  figma.ui.onmessage = (msg) => {
    if (msg.type === 'INIT' || msg.type === 'SELECTION_CHANGED') {
      updateThemesFromSelection()
    } else if (msg.type === 'SUBMIT') {
      console.log('Applying theme:', msg.formValues.theme)
      const theme = msg.formValues.theme
      
      // Notify UI that we're applying the theme
      figma.ui.postMessage({
        type: 'APPLYING_THEME'
      })
      
      // Apply the selected theme to all component instances in the selection
      const result = applyThemeToSelection(theme)
      console.log('Updated instances count:', result.updatedCount)
      console.log('Circular instances in result:', result.circularInstances)
      console.log('Circular instances count:', result.circularInstances.length)
      console.log('Checked layers count:', result.checkedLayersCount)
      
      // Send the results back to the UI without showing notifications
      figma.ui.postMessage({
        type: 'THEME_APPLIED',
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        circularInstances: result.circularInstances,
        theme: theme,
        checkedLayersCount: result.checkedLayersCount
      })
      
      // No notifications, success states will be shown in the UI
      // No plugin closing, UI will remain visible
    } else if (msg.type === 'CLOSE') {
      figma.closePlugin()
    } else if (msg.type === 'CANCEL') {
      figma.closePlugin()
    }
  }
  
  // Initial update - just check for empty selection
  setTimeout(() => {
    updateThemesFromSelection()
  }, 300)
}

// Function to check if an instance is part of its own main component (circular reference)
function hasCircularReference(instance: InstanceNode): boolean {
  if (!instance.mainComponent) return false
  
  try {
    const mainComponentId = instance.mainComponent.id
    const mainComponentSetId = instance.mainComponent.parent?.id
    let parent = instance.parent
    
    // First check: Is this instance inside its own main component?
    while (parent) {
      // Check if parent is a component and has the same ID as the main component
      if (parent.type === 'COMPONENT' && parent.id === mainComponentId) {
        console.log('Circular reference detected:', instance.name, 'is inside its own main component')
        return true
      }
      
      // Check if parent is a component set and contains the main component
      if (parent.type === 'COMPONENT_SET' && parent.id === mainComponentSetId) {
        // If they're from the same component set, this is likely a theme variation
        // (like Light/Dark variants), so we'll ignore it
        console.log('Ignoring instance from same component set:', instance.name);
        return false
      }
      
      // Enhanced check: Is this instance inside another instance from the same component set?
      if (parent.type === 'INSTANCE') {
        // Check if the parent instance's main component is from the same component set
        if (parent.mainComponent && parent.mainComponent.parent && 
            parent.mainComponent.parent.id === mainComponentSetId) {
          console.log('Potential cycle detected: Instance nested inside another instance from the same component set:', instance.name)
          return true
        }
      }
      
      parent = parent.parent
    }
    
    // If we made it here, there's no circular reference detected in the hierarchy
    return false
  } catch (error) {
    // If any error occurs during the check, log it but don't treat it as circular
    console.log('Error checking for circular reference, ignoring:', instance.name)
    return false
  }
}

// Function to find all available themes from component instances in the selection
function findAvailableThemes(): { instanceCount: number, circularInstances: CircularInstance[], checkedLayersCount: number } {
  let instanceCount = 0
  let themePropertyCount = 0
  let checkedLayersCount = 0
  const circularInstances: CircularInstance[] = []
  
  // Recursive function to traverse nodes
  function traverseNode(node: SceneNode) {
    // Count each node we check
    checkedLayersCount++
    
    // Log the layer name
    console.log('Checking layer:', node.name, 'Type:', node.type)
    
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
              // themes.add(themeProperty.value)
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
                        // themes.add(value)
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
  
  console.log(`Found ${instanceCount} instances, ${themePropertyCount} with Theme property, checked ${checkedLayersCount} layers total`)
  return { 
    instanceCount: themePropertyCount,
    circularInstances: circularInstances,
    checkedLayersCount: checkedLayersCount
  }
}

// Function to apply the selected theme to all component instances in the selection (UI Mode)
function applyThemeToSelection(theme: string): { updatedCount: number, skippedCount: number, circularInstances: CircularInstance[], checkedLayersCount: number } {
  let updatedCount = 0
  let skippedCount = 0
  let checkedLayersCount = 0
  let instanceCount = 0
  let progressUpdateCounter = 0
  const circularInstances: CircularInstance[] = []
  
  // Calculate total nodes to process for progress estimation
  let totalNodesToProcess = 0
  figma.currentPage.selection.forEach(node => {
    // Rough estimate of total nodes
    countNodes(node)
  })
  
  function countNodes(node: SceneNode) {
    totalNodesToProcess++
    if ('children' in node) {
      for (const child of node.children) {
        countNodes(child)
      }
    }
  }
  
  console.log('Estimated total nodes to process:', totalNodesToProcess)
  
  // Send initial progress update
  figma.ui.postMessage({
    type: 'PROGRESS_UPDATE',
    checked: 0,
    total: totalNodesToProcess,
    updated: 0,
    skipped: 0,
    instances: 0
  })
  
  // Recursive function to traverse nodes
  function traverseNode(node: SceneNode) {
    // Count each node we check
    checkedLayersCount++
    
    // Log the layer name
    console.log('Checking layer:', node.name, 'Type:', node.type)
    
    // Send progress updates periodically (every 20 nodes or for instances)
    progressUpdateCounter++
    if (progressUpdateCounter >= 20 || node.type === 'INSTANCE') {
      figma.ui.postMessage({
        type: 'PROGRESS_UPDATE',
        checked: checkedLayersCount,
        total: totalNodesToProcess,
        updated: updatedCount,
        skipped: skippedCount,
        instances: instanceCount
      })
      progressUpdateCounter = 0
    }
    
    if (node.type === 'INSTANCE') {
      instanceCount++
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
      } else {
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
              } else {
                // Try to update the theme property
                try {
                  console.log('Updating theme for node:', node.name)
                  try {
                    node.setProperties({ Theme: theme })
                    updatedCount++
                  } catch (error: any) {
                    // Check if the error is related to cycles
                    if (error.message && error.message.includes('cycle')) {
                      console.log('Cycle error detected when updating theme for:', node.name, '- Skipping this instance')
                      circularInstances.push({
                        name: node.name,
                        id: node.id
                      })
                    } else {
                      console.error('Error updating theme for node:', node.name, error)
                    }
                    skippedCount++
                  }
                } catch (error) {
                  console.error('Error updating theme for node:', node.name, error)
                  skippedCount++
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing instance for theme update:', error)
        }
      }
    }
    
    // Always traverse children, even for instances
    if ('children' in node) {
      for (const child of node.children) {
        traverseNode(child)
      }
    }
  }
  
  // Traverse all selected nodes
  figma.currentPage.selection.forEach(node => traverseNode(node))
  
  // Send final progress update
  figma.ui.postMessage({
    type: 'PROGRESS_UPDATE',
    checked: checkedLayersCount,
    total: totalNodesToProcess,
    updated: updatedCount,
    skipped: skippedCount,
    instances: instanceCount,
    isComplete: true
  })
  
  console.log('Final circular instances count:', circularInstances.length)
  console.log('Circular instances:', circularInstances)
  console.log('Checked layers count:', checkedLayersCount)
  console.log('Total instances count:', instanceCount)
  
  return { updatedCount, skippedCount, circularInstances, checkedLayersCount }
}

// Function to apply the selected theme to all component instances in the selection (Command Mode - No UI)
function applyThemeToSelectionCommand(theme: string): { updatedCount: number, skippedCount: number, circularInstances: CircularInstance[], checkedLayersCount: number } {
  let updatedCount = 0
  let skippedCount = 0
  let checkedLayersCount = 0
  let instanceCount = 0
  const circularInstances: CircularInstance[] = []
  
  // Calculate total nodes to process for progress estimation
  let totalNodesToProcess = 0
  figma.currentPage.selection.forEach(node => {
    // Rough estimate of total nodes
    countNodesCommand(node)
  })
  
  function countNodesCommand(node: SceneNode) {
    totalNodesToProcess++
    if ('children' in node) {
      for (const child of node.children) {
        countNodesCommand(child)
      }
    }
  }
  
  console.log('Estimated total nodes to process:', totalNodesToProcess)
  
  // Recursive function to traverse nodes
  function traverseNodeCommand(node: SceneNode) {
    // Count each node we check
    checkedLayersCount++
    
    // Log the layer name
    console.log('Checking layer:', node.name, 'Type:', node.type)
    
    if (node.type === 'INSTANCE') {
      instanceCount++
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
      } else {
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
              } else {
                // Try to update the theme property
                try {
                  console.log('Updating theme for node:', node.name)
                  try {
                    node.setProperties({ Theme: theme })
                    updatedCount++
                  } catch (error: any) {
                    // Check if the error is related to cycles
                    if (error.message && error.message.includes('cycle')) {
                      console.log('Cycle error detected when updating theme for:', node.name, '- Skipping this instance')
                      circularInstances.push({
                        name: node.name,
                        id: node.id
                      })
                    } else {
                      console.error('Error updating theme for node:', node.name, error)
                    }
                    skippedCount++
                  }
                } catch (error) {
                  console.error('Error updating theme for node:', node.name, error)
                  skippedCount++
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing instance for theme update:', error)
        }
      }
    }
    
    // Always traverse children, even for instances
    if ('children' in node) {
      for (const child of node.children) {
        traverseNodeCommand(child)
      }
    }
  }
  
  // Traverse all selected nodes
  figma.currentPage.selection.forEach(node => traverseNodeCommand(node))
  
  console.log('Final circular instances count:', circularInstances.length)
  console.log('Circular instances:', circularInstances)
  console.log('Checked layers count:', checkedLayersCount)
  console.log('Total instances count:', instanceCount)
  
  return { updatedCount, skippedCount, circularInstances, checkedLayersCount }
} 