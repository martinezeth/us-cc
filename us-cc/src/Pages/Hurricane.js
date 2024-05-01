import * as React from 'react';
import { VStack, Box, Text, useColorModeValue, OrderedList, ListItem, UnorderedList, List } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom';
import hurricane from '../Images/hurricane.png';


export default function Hurricane() {
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
                bgImage={`url(${hurricane})`}
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
                    Hurricane
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontSize='lg' font-variant="normal">
                    A hurricane is a type of tropical cyclone, a powerful rotating storm system characterized by a low-pressure center, a closed low-level atmospheric circulation, strong winds, and a spiral arrangement of thunderstorms that produce heavy rain. Hurricanes form over warm tropical oceans and gain energy from the heat of the sea surface, evaporating water that feeds the storm.
                    <br></br>
                    Here are the key features of hurricanes:
                </Text>
                <OrderedList>
                    <ListItem>
                        <b>Structure:</b>
                        <b>Eye:</b> The center of a hurricane, known for being relatively calm with low atmospheric pressure. The eye is typically 20-40 miles across.
                        <b>Eyewall:</b> Surrounds the eye, where the most severe weather occurs, including the highest winds and intense rainfall.
                        <b>Rainbands:</b> Bands of clouds and thunderstorms that spiral out from the eyewall, capable of producing heavy bursts of rain and wind.
                    </ListItem>
                    <ListItem>
                        <b>Classification:</b> Hurricanes are classified into five categories based on their wind speed, using the Saffir-Simpson Hurricane Wind Scale:
                        <UnorderedList>
                            <ListItem>
                                Category 1: Winds 74-95 mph (minor damage)
                            </ListItem>
                            <ListItem>
                                Category 2: Winds 96-110 mph (extensive damage)
                            </ListItem>
                            <ListItem>
                                Category 3: Winds 111-129 mph (devastating damage)
                            </ListItem>
                            <ListItem>
                                Category 4: Winds 130-156 mph (catastrophic damage)
                            </ListItem>
                            <ListItem>
                                Category 5: Winds 157 mph and higher (incredible damage)
                            </ListItem>
                        </UnorderedList>
                    </ListItem>
                    <ListItem>
                        <b>Formation and Development:</b> Hurricanes develop from disturbances in the atmosphere that gain strength under the right conditions: warm sea surface temperatures, high humidity in the troposphere, and low wind shear.
                    </ListItem>
                    <ListItem>
                        <b>Impacts:</b> Hurricanes can cause severe damage due to high winds, heavy rainfall, storm surges, coastal and inland flooding, landslides, and tornadoes.
                        The impacts extend over large areas and can lead to significant loss of life and billions of dollars in damage to property and infrastructure.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">
                    Hurricanes are known by different names in different parts of the world. In the Atlantic and Northeast Pacific, they are called hurricanes, in the Northwest Pacific they are called typhoons, and in the South Pacific and Indian Ocean, they are referred to as cyclones.
                </Text>




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
                    Before a hurricane, preparing effectively can significantly reduce potential damage and enhance your personal safety. Here’s a comprehensive list of steps to take in anticipation of a hurricane:                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Stay Informed:</b> Monitor weather updates and alerts through local news, NOAA Weather Radio, or weather apps. Awareness of the storm’s path and intensity changes is crucial.
                    </ListItem>
                    <ListItem>
                        <b>Emergency Supplies:</b>  Prepare an emergency kit that includes water (one gallon per person per day for at least three days), non-perishable food for at least three days, a flashlight, extra batteries, a first aid kit, medications, a manual can opener, and personal hygiene items. Consider needs specific to your family, including supplies for pets, infants, or elderly members.
                    </ListItem>
                    <ListItem>
                        <b>Create an Evacuation Plan:</b>  Know the local hurricane evacuation routes and have a plan for where you can evacuate if needed. Make arrangements for a place to stay with family, friends, or a public shelter outside the evacuation zone.
                        Keep your car fueled and in good condition, and stocked with emergency supplies and a change of clothes.
                    </ListItem>
                    <ListItem>
                        <b>Protect Your Home:</b> Install storm shutters or board up windows with 5/8” marine plywood, cut to fit and ready to install.
                        Secure or bring in outdoor objects like lawn furniture, toys, garden tools, and trash cans that could be blown away or turned into projectiles.
                        Clear gutters and downspouts to prevent water buildup and potential damage.
                        Reinforce garage doors; if wind enters a garage, it can cause dangerous and expensive structural damage.
                    </ListItem>
                    <ListItem>
                        <b>Plan for Power Outages:</b> Have alternative charging methods for your phone or any device that requires power.
                        Consider investing in a generator for emergency power, and learn how to use it safely.
                    </ListItem>
                    <ListItem>
                        <b>Communicate:</b> Inform family and friends of your emergency plan. Designate an out-of-town contact that all family members know to call or email to check on you.
                        Prepare a list of important contacts including local emergency numbers, hospitals, and utilities.
                    </ListItem>
                    <ListItem>
                        <b>Special Considerations:</b> If you or someone in your household has special medical needs, plan for mobility and medical devices that may need power or special accommodations during a prolonged outage.
                    </ListItem>
                </OrderedList>
                <Text fontStyle="lg">
                    By following these steps, you can prepare your home and family for a hurricane, helping to ensure everyone's safety and minimizing damage to your property.
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

                    During a hurricane, your actions can significantly impact your safety and the safety of those around you. Here are the steps you should follow
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Stay Indoors:</b> Remain inside, away from windows, skylights, and glass doors. Find a safe area in your home—often a designated storm shelter or an interior room on the lowest level that is not likely to flood.
                    </ListItem>
                    <ListItem>
                        <b>Stay Informed::</b> Keep a battery-powered radio or TV on to listen to the latest storm updates and emergency information.
                        Follow updates on your mobile device if the internet is available, but conserve device battery life.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Electrical Equipment and Plumbing:</b> Refrain from using landline phones, except for emergencies.
                        Avoid taking baths, showers, or using sinks if possible, as plumbing can conduct electrical charges if there is lightning.
                    </ListItem>
                    <ListItem>
                        <b>Be Prepared for the Eye of the Hurricane:</b> If the "eye" (center) of the storm passes over your area, there will be a temporary lull in the wind. It may seem calm, but remember that the other side of the hurricane is approaching.
                        During this lull, do not go outside; the winds will pick up again, often very quickly and potentially with even greater force.
                    </ListItem>
                    <ListItem>
                        <b>Monitor Carbon Monoxide Levels:</b> If you are using a generator, keep it outside and away from windows and doors to prevent carbon monoxide poisoning.
                    </ListItem>
                    <ListItem>
                        <b>Communicate:</b> Use text messages or social media to communicate with family and friends to preserve phone battery and minimize network congestion for emergency calls.
                    </ListItem>
                    <ListItem>
                        <b>Stay Calm:</b> Keep calm and reassure others, especially children, to help them cope with the stressful situation.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">
                    By following these guidelines, you can protect yourself and your family during a hurricane, reducing the risk of injury and making a difficult situation more manageable.
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
                <Text fontSize="lg">After a hurricane, it's essential to proceed cautiously as you assess the damage, begin clean-up, and start recovery efforts. Here are important steps to take following a hurricane:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Ensure Safety First:</b> Wait for official word that it is safe to return home if you were evacuated.
                        Check for structural damage before entering your home. If you suspect damage to water, gas, electricity, or the structural integrity, do not enter until a professional can assess it.
                        Be cautious of snakes, insects, and other animals driven to higher ground.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Flood Waters:</b> Stay away from flood waters, as they may be contaminated or deeper and faster flowing than they appear. They may also hide dangers like sharp objects, washed away road surfaces, chemicals, and electrical wires.
                    </ListItem>
                    <ListItem>
                        <b>Document the Damage:</b> Take photos or videos of the damage before you start cleaning and keep records for insurance claims.
                        List all damaged or lost items including their age and value if possible.
                        Contact your insurance company to start the claims process.
                    </ListItem>
                    <ListItem>
                        <b>Check Utilities:</b>Carefully check for gas leaks, electrical system damage, and sewage and water line damage. If you suspect damage, contact the utility company.
                        Do not turn on electrical appliances if they have been wet until they are declared safe.
                    </ListItem>
                    <ListItem>
                        <b>Begin Clean-Up Safely:</b> Wear protective clothing, including gloves, safety glasses, and waterproof boots.
                        Be cautious with debris, which may contain nails and broken glass.
                        Dry out your home to prevent mold. This includes opening doors and windows and using fans if electricity is operational.
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
                        <b>Seek Support and Resources:</b> Utilize support from local community services and national aid programs offering help to Hurricane victims. This can include financial assistance, counseling, and help with temporary housing.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">Taking these steps can help you manage the immediate aftermath of a hurricane safely and effectively, setting the stage for the rebuilding and recovery process.
                </Text>
            </VStack>
        </>
    )
};