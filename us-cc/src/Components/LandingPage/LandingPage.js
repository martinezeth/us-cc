import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import getLPTheme from './getLPTheme';
import AboutSection from '../AboutSection';
import { CardContent, Container, Grid, Typography, Card, Box, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import landingPageMainImage from '../../Styles/Images/landingPageMainImage.webp';
import FeaturesSection from '../FeaturesSection';


export default function LandingPage() {
  const [mode, setMode] = React.useState('light'); // Going to try to implement dark mode option in the future
  // const LPtheme = createTheme(getLPTheme(mode));
  // const defaultTheme = createTheme({ palette: { mode } });


  return (
    // <ThemeProvider theme={LPtheme}> // commented until dark mode is implemented
    <CssBaseline>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, padding: '24px'}}>
    <Grid container spacing={3}>
      {/* Left Column for Taskbar or Links */}
      <Grid item xs={3} sx={{padding: '12px'}}> {/* Adjust the size as needed for smaller screens */}
        <Card>
          <CardContent>
            {/* Taskbar/Link Component or Data */}
            <Typography variant="h6">Disaster Pages</Typography>
            <List>
              <ListItem>
                <ListItemButton>
                  <ListItemText>
                      Survival Kit
                  </ListItemText>
                </ListItemButton>          
              </ListItem>
              <ListItem>
                <ListItemButton>
                  <ListItemText>
                       Fire
                  </ListItemText>
                </ListItemButton>          
              </ListItem>
              <ListItem>
                <ListItemButton>
                  <ListItemText>
                      Flood
                  </ListItemText>
                </ListItemButton>          
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Middle Column for Main Content */}
      <Grid item xs={6}> {/* This is the larger, central column */}
      
      {/*Include a foreach statement here that adds the posts */}
            <Card>
              <CardContent>
                <Typography variant="h5">Post title</Typography>  {/*posts.title*/}
                <Typography>Post body</Typography> {/*posts.body*/}
              </CardContent>
            </Card>
      </Grid>

      {/* Right Column for Additional Information */}
      <Grid item xs={3}> {/* Adjust the size as needed for smaller screens */}
        <Card>
          <CardContent>
            {/* Additional Info or Links */}
            <Typography variant="h6">Sidebar Content</Typography>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  </Container>
  </CssBaseline>
  
  );
}


      {/* <Container sx={{
        alignContent:'right',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'eggshell',
        border: 1,
        margin: 5
      }}>
      
        <Card sx={{
          width: 300,
          height: 300,
          alignItems: 'center',
          justifyContent: 'center'
          
        }}>
          <CardContent>
            <Typography>
                Hello World
            </Typography>
          </CardContent>
        </Card>
        <AboutSection />
        <FeaturesSection />

      </Container>
    </CssBaseline>*/} 
      


    // <>
    //   <CssBaseline />
    //   <Box sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}>
    //     {/* Box is the Container for landing page content */}
    //     <Typography variant="h2">
    //         Welcome to United States Crisis Coordination
    //     </Typography>
    //     <img src={landingPageMainImage} alt="Main Banner" style={{ width: '100%', height: 'auto' }} />
    //     <AboutSection />
    //     <FeaturesSection />
    //   </Box>
    // {/* </ThemeProvider> */}
    //  </>