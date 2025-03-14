import {
  Button,
  Container,
  Columns,
  Text,
  Dropdown,
  VerticalSpace,
  render,
  LoadingIndicator,
  Divider,
  SegmentedControl
} from '@create-figma-plugin/ui'
import { h, Fragment } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

// Define the dropdown option type
type ThemeOption = {
  value: string;
  text: string;
}

// Define the segmented control option type
type SegmentOption = {
  value: string;
  children: string;
}

// Define the circular instance type
type CircularInstance = {
  name: string;
  id: string;
}

function Plugin() {
  const [theme, setTheme] = useState<string>('')
  const [themes, setThemes] = useState<Array<ThemeOption>>([])
  const [segmentOptions, setSegmentOptions] = useState<Array<SegmentOption>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [instanceCount, setInstanceCount] = useState<number>(0)
  const [selectionCount, setSelectionCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [circularInstances, setCircularInstances] = useState<CircularInstance[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [results, setResults] = useState<{
    updatedCount: number;
    skippedCount: number;
    theme: string;
    circularInstances: CircularInstance[];
  } | null>(null)

  // Initialize and listen for available themes
  useEffect(() => {
    // Send INIT message to the plugin
    parent.postMessage({ pluginMessage: { type: 'INIT' } }, '*')
    
    // Listen for messages from the plugin
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      
      if (!msg) return;
      
      if (msg.type === 'THEMES_AVAILABLE') {
        const availableThemes = msg.themes;
        setInstanceCount(msg.instanceCount || 0);
        setSelectionCount(msg.selectionCount || 0);
        setCircularInstances(msg.circularInstances || []);
        setErrorMessage('');
        
        if (availableThemes && availableThemes.length > 0) {
          // Create options for dropdown (keeping for backup)
          const themeOptions = availableThemes.map((theme: string) => ({ value: theme, text: theme }))
          setThemes(themeOptions)
          
          // Create options for segmented control
          const segOptions = availableThemes.map((theme: string) => ({ value: theme, children: theme }))
          setSegmentOptions(segOptions)
          
          setTheme(availableThemes[0])
        } else {
          setThemes([{ value: 'no-themes', text: 'No themes found' }])
          setSegmentOptions([{ value: 'no-themes', children: 'No themes found' }])
        }
        
        setLoading(false)
      } else if (msg.type === 'SELECTION_EMPTY') {
        setErrorMessage(msg.message || 'No selection');
        setInstanceCount(0);
        setSelectionCount(0);
        setCircularInstances([]);
        setLoading(false);
      } else if (msg.type === 'THEME_APPLIED') {
        // Show results without hiding the main UI
        console.log('Theme applied results:', msg);
        console.log('Circular instances from message:', msg.circularInstances);
        
        // Ensure we have a valid array of circular instances
        const circularInstancesArray = Array.isArray(msg.circularInstances) ? msg.circularInstances : [];
        console.log('Circular instances array length:', circularInstancesArray.length);
        
        setResults({
          updatedCount: msg.updatedCount || 0,
          skippedCount: msg.skippedCount || 0,
          theme: msg.theme || '',
          circularInstances: circularInstancesArray
        });
        setShowResults(true);
      }
    }
    
    // Add event listener
    window.addEventListener('message', handleMessage)
    
    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Notify plugin when selection changes
  const handleSelectionChange = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'SELECTION_CHANGED' } }, '*')
  }, [])

  const handleThemeChange = useCallback(
    (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value
      setTheme(newValue)
    },
    []
  )
  
  // Handler for segmented control
  const handleSegmentChange = useCallback(
    (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value
      setTheme(newValue)
    },
    []
  )

  const handleSubmit = useCallback(() => {
    if (theme && theme !== 'no-themes') {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'SUBMIT', 
          formValues: { theme } 
        } 
      }, '*')
    }
  }, [theme])

  const handleClose = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'CLOSE' } }, '*')
  }, [])

  const handleCancel = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'CANCEL' } }, '*')
  }, [])

  // Main UI
  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      
      {loading ? (
        <Fragment>
          <Text>Loading available themes...</Text>
          <VerticalSpace space="small" />
          <LoadingIndicator />
        </Fragment>
      ) : errorMessage ? (
        <Fragment>
          <Text>{errorMessage}</Text>
          <VerticalSpace space="medium" />
          <Button fullWidth onClick={handleSelectionChange}>
            Refresh Selection
          </Button>
        </Fragment>
      ) : (
        <Fragment>
          <Text>Selected: {selectionCount} </Text>
          <VerticalSpace space="small" />
          <Text>Instances found: {instanceCount}</Text>
          <VerticalSpace space="small" />
          
          {circularInstances.length > 0 && (
            <Fragment>
              <Divider />
              <VerticalSpace space="small" />
              <Text style={{ color: 'var(--figma-color-text-danger)', fontWeight: 'bold' }}>Cannot apply to:</Text>
              <VerticalSpace space="extraSmall" />
              <div style={{ 
                maxHeight: '80px', 
                overflowY: 'auto', 
                fontSize: '12px',
                color: 'var(--figma-color-text)',
                padding: '8px',
                backgroundColor: 'var(--figma-color-bg-secondary)',
                borderRadius: '4px',
                border: '1px solid var(--figma-color-border)'
              }}>
                {circularInstances.map((instance, index) => (
                  <div key={instance.id} style={{ 
                    marginBottom: '4px',
                    padding: '2px',
                    borderBottom: index < circularInstances.length - 1 ? '1px solid var(--figma-color-border-disabled)' : 'none'
                  }}>
                    {instance.name}
                  </div>
                ))}
              </div>
              <VerticalSpace space="small" />
              <Divider />
              <VerticalSpace space="small" />
            </Fragment>
          )}
          
          <Text>Select theme to apply:</Text>
          <VerticalSpace space="small" />
          
          {/* Replace dropdown with segmented control */}
          {segmentOptions.length > 0 && segmentOptions[0].value !== 'no-themes' && instanceCount > 0 ? (
            <SegmentedControl 
              onChange={handleSegmentChange}
              options={segmentOptions}
              value={theme}
            />
          ) : (
            <Text style={{ color: 'var(--figma-color-text-secondary)' }}>
              {instanceCount === 0 ? 'No components with Theme property found' : 'No themes available'}
            </Text>
          )}
          
          <VerticalSpace space="large" />
          
          <Button 
            fullWidth 
            onClick={handleSubmit}
            disabled={!theme || theme === 'no-themes' || instanceCount === 0}
          >
            Apply Theme
          </Button>
          
          {/* Show results section at the bottom if available */}
          {showResults && results && (
            <Fragment>
              <VerticalSpace space="medium" />
              <Divider />
              <VerticalSpace space="medium" />
              
              <div style={{ 
                padding: '8px', 
                backgroundColor: 'var(--figma-color-bg-success-secondary)',
                borderRadius: '4px',
                border: '1px solid var(--figma-color-border-success)'
              }}>
                <Text style={{ fontWeight: 'bold', color: 'var(--figma-color-text-success)' }}>
                  Theme applied: {results.theme}
                </Text>
                <VerticalSpace space="extraSmall" />
                <Text style={{ color: 'var(--figma-color-text-success)' }}>
                  Updated: {results.updatedCount} component{results.updatedCount !== 1 ? 's' : ''}
                </Text>
              </div>
              
              {results.skippedCount > 0 && (
                <Fragment>
                  <VerticalSpace space="small" />
                  
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: 'var(--figma-color-bg-warning-secondary)',
                    borderRadius: '4px',
                    border: '1px solid var(--figma-color-border-warning)'
                  }}>
                    <Text style={{ fontWeight: 'bold', color: 'var(--figma-color-text-warning)' }}>
                      Skipped: {results.skippedCount} component{results.skippedCount !== 1 ? 's' : ''}
                    </Text>
                    
                    <VerticalSpace space="extraSmall" />
                    
                    {results.circularInstances && results.circularInstances.length > 0 ? (
                      <Fragment>
                        <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-warning)' }}>
                          Some components were skipped because they:
                        </Text>
                        <ul style={{ 
                          margin: '4px 0 0 16px', 
                          padding: 0, 
                          fontSize: '12px', 
                          color: 'var(--figma-color-text-warning)'
                        }}>
                          <li>Already had the selected theme</li>
                          <li>Had circular references</li>
                        </ul>
                        
                        <Text style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          marginTop: '8px', 
                          color: 'var(--figma-color-text-warning)'
                        }}>
                          Components with circular references:
                        </Text>
                        
                        <div style={{ 
                          maxHeight: '100px', 
                          overflowY: 'auto', 
                          fontSize: '12px',
                          marginTop: '4px'
                        }}>
                          {results.circularInstances.map((instance) => (
                            <div key={instance.id} style={{ 
                              marginBottom: '4px',
                              padding: '2px',
                              borderBottom: '1px solid var(--figma-color-border-warning-strong)'
                            }}>
                              {instance.name}
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    ) : (
                      <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-warning)' }}>
                        Components were skipped because they already had the selected theme.
                      </Text>
                    )}
                  </div>
                </Fragment>
              )}
              
              <VerticalSpace space="small" />
              <Button 
                secondary
                fullWidth 
                onClick={() => setShowResults(false)}
              >
                Clear Results
              </Button>
            </Fragment>
          )}
        </Fragment>
      )}
      
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin) 