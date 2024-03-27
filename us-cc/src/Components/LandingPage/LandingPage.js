import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import getLPTheme from './getLPTheme';

export default function LandingPage() {
  const [mode, setMode] = React.useState('light');
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });


  return (
    <ThemeProvider theme={LPtheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}>
        {/* Box is the Container for landing page content */}
        <h1>Welcome to Our Landing Page</h1>
        <p>This is a basic setup. We will add more components and content here.</p>
      </Box>
    </ThemeProvider>
  );
}
