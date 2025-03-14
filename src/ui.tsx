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
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...')
  const [applyingTheme, setApplyingTheme] = useState<boolean>(false)
  const [instanceCount, setInstanceCount] = useState<number>(0)
  const [selectionCount, setSelectionCount] = useState<number>(0)
  const [checkedLayersCount, setCheckedLayersCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [circularInstances, setCircularInstances] = useState<CircularInstance[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [progress, setProgress] = useState<{
    checked: number;
    total: number;
    updated: number;
    skipped: number;
    instances: number;
    percent: number;
  }>({
    checked: 0,
    total: 0,
    updated: 0,
    skipped: 0,
    instances: 0,
    percent: 0
  })
  const [results, setResults] = useState<{
    updatedCount: number;
    skippedCount: number;
    theme: string;
    circularInstances: CircularInstance[];
    checkedLayersCount: number;
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
        setSelectionCount(msg.selectionCount || 0);
        // Reset all counts when receiving themes
        setInstanceCount(0);
        setCircularInstances([]);
        setCheckedLayersCount(0);
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
        setCheckedLayersCount(0);
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
          circularInstances: circularInstancesArray,
          checkedLayersCount: msg.checkedLayersCount || 0
        });
        setShowResults(true);
        setApplyingTheme(false);
      } else if (msg.type === 'LOADING_STATUS') {
        setLoadingMessage(msg.message || 'Loading...');
        setLoading(msg.loading !== undefined ? msg.loading : true);
      } else if (msg.type === 'APPLYING_THEME') {
        // Reset progress
        setProgress({
          checked: 0,
          total: 0,
          updated: 0,
          skipped: 0,
          instances: 0,
          percent: 0
        });
        setApplyingTheme(true);
      } else if (msg.type === 'PROGRESS_UPDATE') {
        const checked = msg.checked || 0;
        const total = msg.total || 1; // Avoid division by zero
        const updated = msg.updated || 0;
        const skipped = msg.skipped || 0;
        const instances = msg.instances || 0;
        const percent = Math.min(100, Math.round((checked / total) * 100));
        
        setProgress({
          checked,
          total,
          updated,
          skipped,
          instances,
          percent
        });
        
        if (msg.isComplete) {
          // Final update finished, but we stay in applying state until THEME_APPLIED
          setCheckedLayersCount(checked);
          setInstanceCount(instances);
        }
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
    setLoading(true);
    setLoadingMessage('Checking selection for instances with Theme property...');
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
      setApplyingTheme(true);
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
          <Text>{loadingMessage}</Text>
          <VerticalSpace space="small" />
          <LoadingIndicator />
        </Fragment>
      ) : applyingTheme ? (
        <Fragment>
          <Text>Applying theme: {theme}</Text>
          <VerticalSpace space="extraSmall" />
          
          {/* Progress information */}
          <div style={{ marginBottom: '12px' }}>
            {/* Progress bar */}
            <div style={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: 'var(--figma-color-bg-secondary)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                width: `${progress.percent}%`, 
                height: '100%', 
                backgroundColor: 'var(--figma-color-bg-brand)',
                borderRadius: '3px',
                transition: 'width 0.2s ease-in-out'
              }} />
            </div>
            
            {/* Progress details */}
            <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-secondary)' }}>
              Processed {progress.checked} of {progress.total} layers ({progress.percent}%)
            </Text>
            
            {progress.instances > 0 && (
              <Fragment>
                <VerticalSpace space="extraSmall" />
                <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-secondary)' }}>
                  Found {progress.instances} components with Theme property
                </Text>
              </Fragment>
            )}
            
            {progress.updated > 0 && (
              <Fragment>
                <VerticalSpace space="extraSmall" />
                <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-success)' }}>
                  Updated: {progress.updated}
                </Text>
              </Fragment>
            )}
            
            {progress.skipped > 0 && (
              <Fragment>
                <VerticalSpace space="extraSmall" />
                <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-warning)' }}>
                  Skipped: {progress.skipped}
                </Text>
                <VerticalSpace space="extraSmall" />
              </Fragment>
            )}
          </div>
          
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
          <Text>Select theme to apply:</Text>
          <VerticalSpace space="small" />
          
          {/* Replace dropdown with segmented control */}
          {segmentOptions.length > 0 && segmentOptions[0].value !== 'no-themes' ? (
            <SegmentedControl 
              onChange={handleSegmentChange}
              options={segmentOptions}
              value={theme}
            />
          ) : (
            <Text style={{ color: 'var(--figma-color-text-secondary)' }}>
              No themes available
            </Text>
          )}
          
          <VerticalSpace space="large" />
          
          <Button 
            fullWidth 
            onClick={handleSubmit}
            disabled={!theme || theme === 'no-themes' || selectionCount === 0}
          >
            Apply Theme
          </Button>
          
          {/* Show results section at the bottom if available */}
          {showResults && results && (
            <Fragment>
              <VerticalSpace space="medium" />
              <Divider />
              <VerticalSpace space="medium" />
              
              <Text style={{ fontWeight: 'bold' }}>Results for theme: {results.theme}</Text>
              <VerticalSpace space="extraSmall" />
              <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-secondary)' }}>
                Checked {results.checkedLayersCount} layers in total
              </Text>
              <VerticalSpace space="small" />
              
              {results.updatedCount > 0 && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    color: 'var(--figma-color-icon-success)'
                  }}>
                    ✓
                  </div>
                  <Text>
                    Updated: {results.updatedCount} component{results.updatedCount !== 1 ? 's' : ''}
                  </Text>
                </div>
              )}
              
              {results.skippedCount > 0 && (
                <Fragment>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      color: 'var(--figma-color-icon-warning)'
                    }}>
                      !
                    </div>
                    <div>
                      <Text>
                        Skipped: {results.skippedCount} component{results.skippedCount !== 1 ? 's' : ''}
                      </Text>
                      
                      {results.circularInstances && results.circularInstances.length > 0 ? (
                        <Fragment>
                          <VerticalSpace space="extraSmall" />
                          <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-secondary)' }}>
                            Components were skipped because they:
                          </Text>
                          <ul style={{ 
                            margin: '4px 0 0 16px', 
                            padding: 0, 
                            fontSize: '12px', 
                            color: 'var(--figma-color-text-secondary)'
                          }}>
                            <li>Already had the selected theme</li>
                            <li>Had circular references</li>
                          </ul>
                          
                          {results.circularInstances.length > 0 && (
                            <Fragment>
                              <Text style={{ 
                                fontSize: '12px', 
                                marginTop: '8px', 
                                color: 'var(--figma-color-text-secondary)'
                              }}>
                                Components with circular references:
                              </Text>
                              
                              <div style={{ 
                                maxHeight: '100px', 
                                overflowY: 'auto', 
                                fontSize: '12px',
                                marginTop: '4px',
                                paddingLeft: '8px',
                                borderLeft: '1px solid var(--figma-color-border)'
                              }}>
                                {results.circularInstances.map((instance) => (
                                  <div key={instance.id} style={{ 
                                    marginBottom: '4px',
                                    padding: '2px'
                                  }}>
                                    {instance.name}
                                  </div>
                                ))}
                              </div>
                            </Fragment>
                          )}
                        </Fragment>
                      ) : (
                        <Text style={{ fontSize: '12px', color: 'var(--figma-color-text-secondary)' }}>
                          Components were skipped because they already had the selected theme.
                        </Text>
                      )}
                    </div>
                  </div>
                </Fragment>
              )}
              
              {/* Show a message when nothing happened */}
              {results.updatedCount === 0 && results.skippedCount === 0 && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    color: 'var(--figma-color-icon)'
                  }}>
                    i
                  </div>
                  <Text>
                    No components were updated or skipped.
                  </Text>
                </div>
              )}
              
              <VerticalSpace space="medium" />
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