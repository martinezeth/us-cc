import * as React from 'react';
import { VStack, Box, Text, useColorModeValue, ListItem, OrderedList } from '@chakra-ui/react'
import earthquake from '../Images/earthquake.png';


export default function Earthquake() {
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
                bgImage={`url(${earthquake})`}
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
                    Earthquake
                </Text>
                <Box
                    width="50%"
                    height="3px"
                    backgroundColor="black"
                    marginX="auto" // Centers the Box horizontally
                />
                <Text fontSize='2xl' font-variant="normal">

                    An earthquake is the shaking of the surface of the Earth resulting from a sudden release of energy in the Earth's lithosphere that creates seismic waves. Earthquakes can range in size from those that are so weak that they cannot be felt to those violent enough to toss people around and destroy entire cities.
                    <br></br>
                    <br></br>
                    The seismic activity of an area refers to the frequency, type, and size of earthquakes experienced over a period of time. The point of origin of an earthquake beneath the earth's surface is called the hypocenter, and the point directly above it on the surface of the earth is called the epicenter.
                    <br></br>
                    <br></br>
                    Earthquakes can cause a variety of significant effects, such as ground shaking, surface rupture, and the generation of tsunamis, which can lead to loss of life and damage to property. They are caused by various mechanisms including tectonic movements, volcanic activity, and human activities like mining or reservoir-induced seismicity.
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
                    Preparing for an earthquake involves several proactive steps to enhance safety and minimize damage. Here’s what you can do before an earthquake occurs:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Identify Safe Spots:</b> Learn where to take cover in each room—under sturdy furniture like a heavy desk or table, or against an inside wall away from windows that could shatter.
                    </ListItem>
                    <ListItem>
                        <b>Secure Heavy Items:</b> Fasten shelves securely to walls, and place heavy or breakable objects on lower shelves. Securely mount large appliances and furniture such as refrigerators, bookcases, mirrors, and televisions to walls. Use straps or furniture anchors to prevent tipping.
                    </ListItem>
                    <ListItem>
                        <b>Create an Emergency Kit:</b> Prepare a disaster supply kit that includes essential items like water, non-perishable food, a flashlight, batteries, a first aid kit, medications, copies of important documents, and extra cash. Keep this kit in an easily accessible location.
                    </ListItem>
                    <ListItem>
                        <b>Develop a Family Emergency Plan:</b> Ensure everyone knows what to do in case of an earthquake. Designate a safe meeting place outside your home, and plan how to communicate if cell phone networks are down. Make sure everyone knows how to turn off the gas, water, and electricity.
                    </ListItem>
                    <ListItem>
                        <b>Practice Drop, Cover, and Hold On:</b> Regularly conduct earthquake drills with your family. When you feel shaking, you should:
                        <b>Drop </b>to the ground.
                        Take <b>Cover</b> under a sturdy desk or table.
                        <b>Hold On</b> to it until the shaking stops.
                    </ListItem>
                    <ListItem>
                        <b>Check Your Building’s Structural Integrity:</b> If you own your home, consider having it evaluated by a professional to assess its ability to withstand an earthquake. Retrofitting may be necessary, especially for older buildings.
                    </ListItem>
                    <ListItem>
                        <b>Learn How to Shut Off Utilities:</b> Know how to turn off your gas, water, and electricity to prevent fires and flooding caused by damaged lines.
                    </ListItem>
                </OrderedList>
                <Text fontStyle="lg">
                    Taking these precautions can significantly improve your readiness for an earthquake, potentially saving lives and reducing the risk of severe property damage.
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
                    During an earthquake, it's crucial to react quickly and calmly to protect yourself from injury. Here are the key steps you should follow:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Drop, Cover, and Hold On:</b>
                        Drop to your hands and knees. This position prevents you from being knocked down and allows you to move if necessary.
                        Cover your head and neck with your arms and seek shelter under a sturdy table or desk. If there is no shelter nearby, stay near an interior wall away from windows.
                        Hold On to your shelter (or to your head and neck) until the shaking stops. Be prepared to move with your shelter if the shaking shifts it.
                    </ListItem>
                    <ListItem>
                        <b>Stay Indoors:</b> If you are inside, do not run outside during the shaking. Moving to another room during an earthquake is risky as the movement can cause you to fall or be injured by debris.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Elevators:</b> Do not use the elevators during an earthquake. If you are in an elevator when the shaking starts, press all floor buttons and get out as soon as you can.
                    </ListItem>
                    <ListItem>
                        <b>If You Are Outdoors:</b> Move away from buildings, streetlights, utility wires, and anything else that could fall. Find a clear spot and drop to the ground until the shaking stops.
                    </ListItem>
                    <ListItem>
                        <b>If You Are Driving:</b> Pull over to a safe place, away from underpasses/overpasses, bridges, trees, large signs, and other hazards. Stay inside the vehicle until the shaking stops. After the earthquake, proceed with caution, avoiding bridges or ramps that might have been damaged.
                    </ListItem>
                    <ListItem>
                        <b>If You Are in a Coastal Area:</b> Be aware of tsunami risks, especially if the earthquake is strong and lasts more than 20 seconds. Move inland or to higher ground immediately after the shaking stops.
                    </ListItem>
                    <ListItem>
                        <b>Protect Yourself at All Times:</b>  Use your arms to protect your head and neck, and stay alert for aftershocks, which can occur minutes, days, or even weeks after the main quake.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">
                    The key is to remain as calm as possible and not to run or move about during the shaking, as most injuries occur when people inside buildings attempt to move to a different location inside the building or try to leave.
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
                <Text fontSize="lg">After an earthquake, it's important to ensure your safety and assess damages carefully. Here are steps to take once the shaking has stopped:
                </Text>
                <OrderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Check for Injuries and Hazards:</b> Check yourself and others for injuries. Provide first aid if necessary.
                        Be aware of potential hazards such as broken glass, exposed wiring, and gas leaks.
                    </ListItem>
                    <ListItem>
                        <b>Inspect Your Home for Damage:</b> Look for structural damage. If you suspect your home is unsafe, evacuate. Be particularly cautious of potential chimney collapses, which could fall through the roof.
                        Check for fires or fire hazards. If you can do so safely, turn off the gas if you smell gas or hear a hissing noise.
                    </ListItem>
                    <ListItem>
                        <b>Listen to Information:</b> Use a battery-operated radio or your mobile device to listen to news updates and instructions from local authorities.
                    </ListItem>
                    <ListItem>
                        <b>Be Prepared for Aftershocks:</b> Aftershocks frequently follow the main shock. While generally less intense, aftershocks can cause further damage to weakened structures and can be strong enough to do additional harm.
                    </ListItem>
                    <ListItem>
                        <b>Communicate and Reunite:</b> Let friends and family know you’re safe using text messages, social media, or emergency contact numbers. Phone systems are often busy after a disaster; use text messaging which might work even if voice calls don't.
                        Follow your family communication plan or reunite at your predetermined meeting location.
                    </ListItem>
                    <ListItem>
                        <b>Check Utilities and Appliances:</b> Check for damaged water, gas, and electric lines. If there is damage, turn off the service at the main valve or switch. Do not switch the power back on until the damage is repaired.
                        Do not light matches or turn on light switches until you are sure there are no gas leaks.
                    </ListItem>
                    <ListItem>
                        <b>Stay Out of Damaged Buildings:</b> Stay outside if your home is unsafe or if it is uncertain whether it is safe. Structures may be weakened and could collapse in aftershocks.
                    </ListItem>
                    <ListItem>
                        <b>Document the Damage:</b> Take pictures of the damage, both to your property and surrounding areas, for insurance purposes and to assist inspectors.
                    </ListItem>
                    <ListItem>
                        <b>Avoid Coastal Areas:</b> If the earthquake was strong and you are in a coastal area, stay away from the shore. Tsunamis can follow earthquakes, and the first wave is often not the last or the largest.
                    </ListItem>
                </OrderedList>
                <Text fontSize="lg">These steps can help you manage the immediate aftermath safely, begin recovery, and prepare for any further potential hazards.
                </Text>

            </VStack>
        </>
    )
};