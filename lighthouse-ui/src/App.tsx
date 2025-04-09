import { useState } from 'react'
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface LighthouseResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}

function App() {
  const [urls, setUrls] = useState<string[]>(['https://www.camotrading.com/','https://www.camotrading.com/?no-cache-proxy=true'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LighthouseResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const addUrlField = () => {
    if (urls.length < 2) {
      setUrls([...urls, ''])
    }
  }

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)

    // Filter out empty URLs
    const urlsToAnalyze = urls.filter(url => url.trim() !== '')

    if (urlsToAnalyze.length === 0) {
      setError('Please enter at least one URL')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3090/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlsToAnalyze }),
      })
      const data = await response.json()
      console.log('[DATA]', data)
      setResults(data.results)
    } catch (err) {
      setError('Failed to analyze URLs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lighthouse Performance Analyzer
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <List>
              {urls.map((url, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Enter URL ${index + 1} to analyze`}
                    variant="outlined"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com"
                  />
                  {urls.length > 1 && (
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => removeUrlField(index)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>

            {urls.length < 2 && (
              <Button
                startIcon={<AddIcon />}
                onClick={addUrlField}
                sx={{ mb: 2 }}
              >
                Add Another URL
              </Button>
            )}

            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Analyze
            </Button>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            {results.map((result, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {result.url}
                </Typography>
                {result.success ? (
                  <>
                    <Typography>LCP: {result.lcp?.toFixed(2)}ms</Typography>
                    <Typography>TTFB: {result.ttfb?.toFixed(2)}ms</Typography>
                    <Button 
                      variant="outlined" 
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result.report, null, 2))}`}
                      download={`lighthouse-report-${result.url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`}
                      sx={{ mt: 1 }}
                    >
                      Download Full Report
                    </Button>
                  </>
                ) : (
                  <Alert severity="error">
                    {result.error || 'Analysis failed'}
                  </Alert>
                )}
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default App
