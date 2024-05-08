import * as React from 'react';
import { VStack, Box, Text, useColorModeValue, OrderedList, ListItem } from '@chakra-ui/react'
import flood from '../Images/flood.png';


export default function Flood() {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'gray.100');

    return (
        <>
            <Box
                w="full"
                h="60vh"
                m={0}
                p={0}
                bg={bg}
                align="center"
                justify="center"
                bgImage={`url(${flood})`}
                bgPos="center"
                bgSize="cover"
            >
            </Box>
            <VStack
                spacing={6}
                justify="center"
                align="left"
                height="full"
                pt={12}
                pr={12}
                pl={12}
                pb={12}
            >
                <Text fontSize='5xl' color={textColor} maxW="lg">
                    Flood
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontSize='2xl' font-variant="normal">
                    A flood is an overflow of water that submerges land that is usually dry. Floods can occur in various contexts, such as when rivers or lakes overflow their banks due to excessive rain or snowmelt, or when ocean waves come onshore, flooding coastal areas. They can also result from dam breaks or be caused by a sudden release of water retained by an ice jam. Floods are significant natural hazards that can cause extensive damage to infrastructure, loss of life, and adverse environmental impacts.            </Text>
                <Text fontSize='4xl' color={textColor} maxW="lg">
                    What To Do Before
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontSize="lg">
                    Before a flood, it's important to prepare to protect yourself, your family, and your property. Here are some key steps to consider:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Understand Your Risk:</b> Check if your home or business is in a flood-prone area. Your local government or a flood zone map can provide this information.
                    </ListItem>
                    <ListItem>
                        <b>Create an Emergency Plan:</b>  Develop a family emergency plan that includes evacuation routes and meeting points. Make sure everyone knows what to do in case of a flood.
                    </ListItem>
                    <ListItem>
                        <b>Sign Up for Alerts:</b>  Register for your community's warning system. The Emergency Alert System (EAS) and National Oceanic and Atmospheric Administration (NOAA) Weather Radio also provide emergency alerts.
                    </ListItem>
                    <ListItem>
                        <b>Protect Your Property:</b> Board up windows to slow the amount of water getting into your house. Waterproof basements and consider installing a sump pump with a battery backup.
                    </ListItem>
                    <ListItem>
                        <b>Stay Informed:</b>Monitor weather forecasts and stay informed about potential flood threats. Knowing when to act is crucial.
                    </ListItem>
                </OrderedList>
                <Text fontStyle="lg">
                    Taking these steps can help mitigate the risks associated with floods and provide peace of mind during the rainy season or in times of potential flooding.
                </Text>

                <Text fontSize='4xl' color={textColor} maxW="lg">
                    What To Do During
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontStyle="lg">
                    During a flood event, it's crucial to prioritize safety and follow any instructions from local authorities. Here’s what you should do:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Stay Informed:</b> Keep updated with local news, weather forecasts, and emergency notifications. Listen for any evacuation orders or safety instructions from local officials.
                    </ListItem>
                    <ListItem>
                        <b>Evacuate if Necessary:</b> If evacuation orders are given, do so immediately. Follow designated evacuation routes; do not take shortcuts as they may be blocked or dangerous.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Floodwaters:</b> Do not walk, swim, or drive through floodwaters. Just six inches of moving water can knock a person down, and one foot of moving water can sweep a vehicle away.
                    </ListItem>
                    <ListItem>
                        <b>Stay on Higher Ground:</b> If evacuation is not possible, move to higher ground or the highest floor of your building. Avoid basements or any lower areas that may become traps.
                    </ListItem>
                    <ListItem>
                        <b>Secure Utilities and Appliances:</b> Turn off utilities at the main switches or valves if instructed by authorities. Disconnect electrical appliances. Do not touch electrical equipment if you are wet or standing in water.
                        If you have gas, turn it off to prevent leaks and potential explosions.
                    </ListItem>
                    <ListItem>
                        <b>Protect Your Personal Safety:</b> Use a flashlight to move around in the dark; avoid using candles or any open flames since there may be gas leaks.
                        Wear sturdy shoes and protective clothing to help prevent injuries from debris in the water.
                        Keep important personal documents in a waterproof bag or container.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Using the Toilet or Sinks:</b> If floodwaters are above sewer lines, sewage can back up into your house. Avoid using the toilet and minimize the use of sinks and showers until the system is checked post-flood.
                    </ListItem>
                    <ListItem>
                        <b>Communicate With Family:</b> Let your family members know where you are if you are not together. Use text messaging or social media to keep phone lines open for emergency calls.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">
                    Taking these actions during a flood can help ensure your safety and the safety of others around you. Always err on the side of caution and adhere to the guidance of local emergency services.
                </Text>

                <Text fontSize='4xl' color={textColor} maxW="lg">
                    What To Do After
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontSize="lg">After a flood, it's important to focus on recovery and ensure that it's safe to return to your property. Here’s a step-by-step guide on what to do after a flood:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Wait for Clearance:</b> Only return home when authorities have declared it safe to do so. Premature returns can be dangerous due to lingering hazards.
                    </ListItem>
                    <ListItem>
                        <b>Inspect Your Property Carefully:</b> Before entering your home, check for visible structural damage like warping, loosened or cracked foundation elements, and holes.
                        If you detect gas or smell gas, leave immediately and contact emergency services.
                        Beware of wildlife and other hazards that might have entered with the floodwater.
                    </ListItem>
                    <ListItem>
                        <b>Document the Damage:</b> Take photos or videos of the damage before you start cleaning and keep records for insurance claims.
                        List all damaged or lost items including their age and value if possible.
                        Contact your insurance company to start the claims process.
                    </ListItem>
                    <ListItem>
                        <b>Prioritize Safety During Cleanup:</b> Wear protective clothing, including rubber boots and gloves, when cleaning up.
                        Be cautious with electrical systems. Do not turn on the power in your home if there is water damage or if you are wet.
                        Use appropriate masks if you're dealing with mold or other airborne contaminants.
                    </ListItem>
                    <ListItem>
                        <b>Clean and Disinfect:</b> Remove standing water and dry areas as soon as possible. Use pumps or wet-dry vacuums if necessary.
                        Clean and disinfect everything that got wet to prevent health hazards. This includes walls, floors, and household items.
                        Throw away anything that cannot be cleaned or disinfected, like mattresses, carpeting, and cosmetic items.
                    </ListItem>
                    <ListItem>
                        <b>Contact Insurance:</b> Contact your insurance company to file claims for damages. Provide documentation and photos of the damage.
                    </ListItem>
                    <ListItem>
                        <b>Prevent Mold Growth:</b> Keep doors and windows open if it’s dry outside to increase air circulation.
                        Use fans and dehumidifiers to help dry out the home.
                        Remove and replace any drywall and insulation that has been soaked.
                    </ListItem>
                    <ListItem>
                        <b>Seek Support and Resources:</b> Utilize support from local community services and national aid programs offering help to flood survivors. This can include financial assistance, counseling, and help with temporary housing.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">Taking these steps will help you manage the aftermath of a flood more effectively, ensuring that your recovery process is as smooth and safe as possible.
                </Text>

            </VStack>
        </>
    )
};