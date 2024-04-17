// // In src/Components/FeaturesSection.js
// import React from 'react';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Grid from '@mui/material/Grid';
// import WarningCircleIcon from '../Images/Icons/warningCircle.svg';
// import ResourceManagementIcon from '../Images/Icons/resourceManagementIcon.svg';
// import VolunteerCoordinationIcon from '../Images/Icons/resourceIcon.svg';
// import DataVisualizationIcon from '../Images/Icons/dataVisualizationIcon.svg';


// const featuresList = [
//     {
//       title: 'Incident Reporting',
//       description: 'Report and track incidents in real-time to streamline crisis response efforts.',
//       ImageComponent: WarningCircleIcon,
//     },
//     {
//       title: 'Resource Management',
//       description: 'Manage resources efficiently, ensuring they are allocated where they are needed most.',
//       ImageComponent: ResourceManagementIcon,
//     },
//     {
//       title: 'Volunteer Coordination',
//       description: 'Coordinate volunteer efforts, matching skills and availability with needs.',
//       ImageComponent: VolunteerCoordinationIcon,
//     },
//     {
//       title: 'Real-time Data Visualization',
//       description: 'Utilize real-time data to make informed decisions and visualize crisis impact.',
//       ImageComponent: DataVisualizationIcon,
//     },
//   ];
  

// const FeaturesSection = () => {
//   return (
//     <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', p: 3 }} id="features-section">
//       <Typography variant="h4" gutterBottom>
//         Features
//       </Typography>
//       <Grid container spacing={2}>
//             {featuresList.map((feature, index) => (
//         <Grid item xs={12} sm={6} md={3} key={index}>
//         <Card>
//             <img
//             src={feature.ImageComponent}
//             alt={feature.title}
//             style={{ maxHeight: '140px', width: '100%', objectFit: 'contain' }}
//             />
//             <CardContent>
//             <Typography gutterBottom variant="h5" component="div">
//                 {feature.title}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//                 {feature.description}
//             </Typography>
//             </CardContent>
//         </Card>
//         </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// };

// export default FeaturesSection;


import React from 'react';
import { Grid, GridItem, Box, Text, VStack, Center } from '@chakra-ui/react';

function FeaturesSection() {
  return (
    <Box p={5} bg="white">
      <Text textAlign="center" fontSize="lg" mb={4}>Key Features</Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%" h="10" bg="blue.500">
          <VStack spacing={3}>
            <Text fontSize="large">Incident Reporting</Text>
            <Text fontSize="sm">Report and track incidents in real-time.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="green.500">
          <VStack spacing={3}>
            <Text fontSize="large">Resource Management</Text>
            <Text fontSize="sm">Efficient allocation of resources during crises.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="orange.500">
          <VStack spacing={3}>
            <Text fontSize="large">Volunteer Coordination</Text>
            <Text fontSize="sm">Coordinate volunteer efforts effectively.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="red.500">
          <VStack spacing={3}>
            <Text fontSize="large">Real-time Data Visualization</Text>
            <Text fontSize="sm">Visualize data to make informed decisions quickly.</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default FeaturesSection;
