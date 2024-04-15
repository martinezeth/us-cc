import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Container, FormControl, FormGroup } from "@mui/material";
import TextField from "@mui/material/TextField";

export default function NewReportPage(){
    
    return (
        <Container>
            {/* This box is the "REPORTS NEARBY" area */}
            <Box>
            </Box>
            {/* This box is where they write the title and body of the post */}
            
            <Box>
                <div>

                </div>
                <div>
                    <form noValidate autoComplete="off">
                        <TextField 
                            label="Post Title"
                            variant="outlined"
                            color="secondary"
                            fullWidth
                        />

                    </form>
                </div>
            </Box>

        </Container>
    );

}