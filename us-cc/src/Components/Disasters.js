import React from "react";
import {Select} from '@chakra-ui/react';

export default function DropDown(){
    return(
        <Select  placeholder="Disasters">
            <option value='wildfire'>Wildfire</option>
            <option value='flood'>Flood</option>
            <option value='hurricane'>Hurricane</option>
            <option value='earthquake'>Earthquake</option>
            <option value='virus'>Virus</option>
            <option value='zombies'>Zombies</option>
        </Select>
    );
};