import React from "react";
import { VStack, Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export default function DropDown() {
    return (
      <VStack>
        <Menu borderWidth="0px">
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg='blue.600'>
            Disasters
          </MenuButton>
          <MenuList borderColor="blue.600" padding={0} fontStyle="bold">
            <MenuItem as={Link} to="/wildfire" bg='blue.600' color="black">Wildfire</MenuItem>
            <MenuItem as={Link} to="/flood" bg='blue.600' color="black">Flood</MenuItem>
            <MenuItem as={Link} to="/hurricane" bg='blue.600' color="black">Hurricane</MenuItem>
            <MenuItem as={Link} to="/earthquake" bg='blue.600'color="black">Earthquake</MenuItem>
            {/* <MenuItem as={Link} to="/COVID" bg='blue.600' color="black">COVID-19</MenuItem> */}
          </MenuList>
        </Menu>
      </VStack>
    );
  }
  