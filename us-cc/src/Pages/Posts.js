import * as React from 'react';
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CardContent, Typography, Card, Box, Grid } from '@mui/material';

export default function Posts(){
    return(
        <>
            <CssBaseline>
                <Grid>
                    <Grid>
                     <Card>
                            <CardContent>
                                <Typography>
                                        <h1>Post title</h1>
                                        <h2> Post body</h2>
                                </Typography>
                            </CardContent>
                    </Card>
                    </Grid>
                </Grid>
            </CssBaseline>
        </>
    );
};