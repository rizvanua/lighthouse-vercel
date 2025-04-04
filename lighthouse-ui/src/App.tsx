import { useState } from 'react'
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material'

interface LighthouseResult {
  success: boolean;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LighthouseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:3090/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to analyze URL. Please try again.')
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
            <TextField
              fullWidth
              label="Enter URL to analyze"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              sx={{ mb: 2 }}
            />
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

        {result && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            {result.success ? (
              <>
                <Typography>LCP: {result.lcp?.toFixed(2)}ms</Typography>
                <Typography>TTFB: {result.ttfb?.toFixed(2)}ms</Typography>
                <Button 
                  variant="outlined" 
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result.report, null, 2))}`}
                  download="lighthouse-report.json"
                  sx={{ mt: 2 }}
                >
                  Download Full Report
                </Button>
              </>
            ) : (
              <Alert severity="error">
                {result.error || 'Analysis failed'}
              </Alert>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default App
