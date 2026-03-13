from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


SAILING_SKILLS_DATA = {
    "Sailing Skills 1": [
        {
            "title": "Sailing Skills 1.1",
            "description": "I can explain the risks of cold water.",
            "hint": "Scouts should simply understand that cold water means your body will not function as well as it should.",
        },
        {
            "title": "Sailing Skills 1.2",
            "description": "I can explain what a Personal Flotation Device (PFD) is for.",
            "hint": "Scouts will show that they know and understand the purpose of a PFD. A PFD must be worn all times when sailing, and a PFD is to be put on before entering any watercraft.",
        },
        {
            "title": "Sailing Skills 1.3",
            "description": "I can put on my PFD and know how it should fit.",
            "hint": "Scouts will demonstrate that they know how to properly put on a PFD, making sure all buckles and zippers are properly fastened and will make sure that their PFD is snug enough not to slide over their heads.",
        },
        {
            "title": "Sailing Skills 1.4",
            "description": "I can show how to avoid sunburns.",
            "hint": "Scouts can show how to avoid sunburns by using sunscreen, and wearing a hat to avoid sunburn and heatstroke.",
        },
        {
            "title": "Sailing Skills 1.5",
            "description": "I can show how to contact emergency services.",
            "hint": "Scouts can show how to contact the emergency services at a local emergency number, and to request assistance from the nearest adult.",
        },
        {
            "title": "Sailing Skills 1.6",
            "description": "I can show where the bow and stern are in a sailboat.",
            "hint": "Scouts will be able to tell the difference between the front and back of their boat and will know the proper names.",
        },
        {
            "title": "Sailing Skills 1.7",
            "description": "I can jump into chest-deep water wearing my PFD.",
            "hint": "Scouts will be able to demonstrate that they are comfortable getting into and out of the water wearing their PFD’s.",
        },
        {
            "title": "Sailing Skills 1.8",
            "description": "I can blow bubbles in the water for ten seconds.",
            "hint": "Scouts will demonstrate that they are comfortable putting their faces in the water for ten seconds.",
        },
        {
            "title": "Sailing Skills 1.9",
            "description": "I can explain and have demonstrated how to behave safely in my sailboat.",
            "hint": "Scouts will demonstrate, while in a boat, that they must keep their weight low in the boat and are able to balance themselves by holding the gunwales. They should also demonstrate that if they are not sailing that they should sit on the floor and that there should not be any jumping, sudden movements or horseplay while in the boat.",
        },
        {
            "title": "Sailing Skills 1.10",
            "description": "I have taken part in a short sailing adventure of at least one hour.",
            "hint": "Scouts will have experienced a short non-powered sailing adventure. Scouts only need be in the watercraft and must wear their PFD properly.",
        },
        {
            "title": "Sailing Skills 1.11",
            "description": "I have participated in a fun physical fitness program designed for sailing.",
            "hint": "Scouts should participate in a fun physical fitness program designed for sailing that improves flexibility, builds stamina, improves strength, quickens their speed, and improves their skill level, suitable to the age of the participant.",
        },
    ],
    "Sailing Skills 2": [
        {
            "title": "Sailing Skills 2.1",
            "description": "I can explain the safety rules for being near water.",
            "hint": "Scouts should be able to explain the safety rules for being near water including wearing a PFD, having a buddy and telling an adult that they are going near the water.",
        },
        {
            "title": "Sailing Skills 2.2",
            "description": "I am familiar with the signs and symptoms of mild hypothermia.",
            "hint": "Scouts should be able to describe the early signs and symptoms of hypothermia, and know that the body loses heat 25 times faster than in air.\n• constant shivering\n• tiredness\n• low energy\n• cold or pale skin\n• fast breathing (hyperventilation)",
        },
        {
            "title": "Sailing Skills 2.3",
            "description": "I can explain how I should care for my PFD.",
            "hint": "Scouts should know that a poorly cared-for PFD is at risk of mold, tears and/or deterioration. They should also know that a damaged PFD will not work reliably.",
        },
        {
            "title": "Sailing Skills 2.4",
            "description": "I can explain the difference between a PFD and a life jacket.",
            "hint": "Scouts should be able to explain that a PFD may not hold a person’s face out of the water if they are unconscious, and that a life jacket will turn a person face up.",
        },
        {
            "title": "Sailing Skills 2.5",
            "description": "I am familiar with the three common whistle signals and when they would be used.",
            "hint": "While there may be variations to exactly how whistles are used, Scouts should be aware of some of the basic whistle signals.\n• One blast means ease the sheets to depower the sails and listen for further instructions;\n• Two blasts means tack/gybe and sail towards the leaders’ safety boat or the designated fleet leader in another sailboat; and\n• Three blasts means EMERGENCY—go to who blew the whistle and stand by to assist if possible.",
        },
        {
            "title": "Sailing Skills 2.6",
            "description": "I can describe five appropriate actions I should take if I capsize a sailboat.",
            "hint": "Scouts should know five actions in the event of capsizing.\n• Stay with the boat.\n• Make noise to get attention.\n• Count to five and take a breath.\n• Hang onto the sailboat.\n• Follow the instructions of the rescuer.",
        },
        {
            "title": "Sailing Skills 2.7",
            "description": "I can demonstrate how to tie the reef knot, sheet bend and figure-eight.",
            "hint": "Scouts should be able to tie the reef knot, sheet bend and figure-eight.",
        },
        {
            "title": "Sailing Skills 2.8",
            "description": "I can identify twelve key parts of my sailboat.",
            "hint": "Scouts need to be able to identify the twelve key parts of a sailboat.\n• hull\n• mast\n• sprit pole\n• boom\n• rudder\n• tiller\n• flotation air bags\n• dagger board\n• centerboard\n• painter\n• halyard\n• mainsheet",
        },
        {
            "title": "Sailing Skills 2.9",
            "description": "I have used a throw bag.",
            "hint": "Scouts should demonstrate an ability to use a throw bag, but without a standard for how far or how accurately it goes at this stage.",
        },
        {
            "title": "Sailing Skills 2.10",
            "description": "I can lift a boat with help from others, rig a sailboat, and practise getting into and out of my boat safely.",
            "hint": "Scouts will demonstrate how to rig a sailboat while ashore, then demonstrate how to get into and out of their sailboat safely, how to dry tack, hold the tiller and hold the mainsheet while in shallow water.",
        },
        {
            "title": "Sailing Skills 2.11",
            "description": "Before I launch my boat, I can show where I am allowed to go sailing.",
            "hint": "Scouts need to know, and be able to explain, where they are allowed to sail as they have been instructed by the person in charge of the sailing activity.",
        },
        {
            "title": "Sailing Skills 2.12",
            "description": "I can swim 50 metres wearing my PFD.",
            "hint": "Scouts should be able to demonstrate that they are comfortable in the water and be able to swim a short distance wearing a PFD. Any swimming stroke is acceptable.",
        },
        {
            "title": "Sailing Skills 2.13",
            "description": "I can sail away from dock, hold the tiller, pull in the mainsheet, ease the sheets, and sail straight for one minute.",
            "hint": "Scouts should be able to practise sailing a boat when on the water with a buddy.",
        },
        {
            "title": "Sailing Skills 2.14",
            "description": "I have taken part in at least two daysails of four hours each or four daysails of two hours each.",
            "hint": "Scouts should have an opportunity to practise their sailing skills.",
        },
    ],
    "Sailing Skills 3": [
        {
            "title": "Sailing Skills 3.1",
            "description": "I can get help if I see somebody in difficulty on the water.",
            "hint": "If Scouts see someone in difficulty on the water, they should know to call for help by whistling and yelling.",
        },
        {
            "title": "Sailing Skills 3.2",
            "description": "I can explain why I should not drink the water from the lake, river or ocean on which I am sailing.",
            "hint": "Scouts need to understand that untreated lake, river or ocean water may not be safe to drink due to bacteria, germs, parasites or chemicals that may be present in the water.",
        },
        {
            "title": "Sailing Skills 3.3",
            "description": "I am familiar with common hand signals and know when they are to be used.",
            "hint": "Scouts should be aware of the Sail Canada basic hand signals.\n• one hand in air—stop, look at the leader and listen awaiting further instructions;\n• two hands overhead with hands on head—come to the safety boat;\n• thumbs up on one or two hands held high—I am OK signal; and\n• two arms waving in a vertical arc overhead—EMERGENCY—I need help.",
        },
        {
            "title": "Sailing Skills 3.4",
            "description": "I can identify the equipment Transport Canada requires me to have in my sailboat.",
            "hint": "Scouts should be able to identify the five essential pieces of safety equipment and have a rudimentary idea of how to use them.\n• One life jacket or PFD for each person on board\n• One signalling device (whistle)\n• One paddle\n• One bailer\n• One buoyant heaving line of at least 15 m in length\nSee Transport Canada—Sail boating guide for details on all classes of boats.",
        },
        {
            "title": "Sailing Skills 3.5",
            "description": "I can explain what impact I have on the environment while sailing.",
            "hint": "Scouts should know that sailing can have an impact on the environment and are respectful of the places in which they sail.",
        },
        {
            "title": "Sailing Skills 3.6",
            "description": "I can identify six types of sailcraft.",
            "hint": "Scouts should be able to identify or draw the rigging of six types of sailcraft.\n• cat-rigged\n• gaff-rigged dinghy\n• sloop-rigged dinghy\n• sail board\n• keelboat\n• catamaran",
        },
        {
            "title": "Sailing Skills 3.7",
            "description": "I can identify the signs of dangerous weather and water conditions.",
            "hint": "Scouts need to know and explain how different weather conditions (wind, rain, sun, and cold) can impact a daysail.",
        },
        {
            "title": "Sailing Skills 3.8",
            "description": "I can tie the reef knot, sheet bend, figure-eight and bowline used by Scouts when sailing or when camping.",
            "hint": "Scouts should be able to tie four knots within thirty seconds each.\n• reef knot\n• sheet bend\n• figure-eight\n• bowline",
        },
        {
            "title": "Sailing Skills 3.9",
            "description": "I can rig my boat and then practise getting into and out of my boat safely.",
            "hint": "Scouts will demonstrate that they can rig a sailboat, and get into and out of their sailboat safely on the water from the shore or dock.",
        },
        {
            "title": "Sailing Skills 3.10",
            "description": "I can tack, gybe, sit on gunwale, hike, slow down, speed up, bail the boat and balance the boat.",
            "hint": "Scouts should be able to practise sailing a boat when on the water by themselves or with a buddy.",
        },
        {
            "title": "Sailing Skills 3.11",
            "description": "I can de-rig a sailboat, dry the sails and store all the parts properly.",
            "hint": "Scouts, by themselves, are able to put all the parts of a boat in proper storage when they are finished with each sailing experience.",
        },
        {
            "title": "Sailing Skills 3.12",
            "description": "I have taken part in at least three daysails of four hours each, or six daysails of two hours each.",
            "hint": "Scouts should have an opportunity to practise their sailing skills.",
        },
        {
            "title": "Sailing Skills 3.13",
            "description": "I know how and where to get the latest weather forecast for the area where I will be sailing.",
            "hint": "Scouts need to demonstrate the ability to get accurate weather forecasts from the internet, radio, marine radio or television, and be able to discuss what the forecast might mean for their daysail.",
        },
        {
            "title": "Sailing Skills 3.14",
            "description": "While fully clothed and with a properly fitted PFD, I can tread water for five minutes, then swim 100 metres using any stroke.",
            "hint": "To prepare Scouts for a simulated common accident around water, Scouts must demonstrate that they have the skills to self-rescue within 100 metres of shore, while fully clothed and wearing a properly fitted PFD, by treading water for 5 minutes, then swim a distance of 100 metres to shore. Any swimming stroke is acceptable.",
        },
    ],
    "Sailing Skills 4": [
        {
            "title": "Sailing Skills 4.1",
            "description": "I know how to find an appropriate PFD that is the right size and fit for me.",
            "hint": "Scouts should be able to describe what is required to find and put on a properly-sized PFD.",
        },
        {
            "title": "Sailing Skills 4.2",
            "description": "I am aware that everyone must wear properly fitted PFD’s while in a boat.",
            "hint": "To ensure the safety of Scouts on the water, Scouts Canada watercraft regulations require that all persons in a boat must wear a properly fitted PFD.",
        },
        {
            "title": "Sailing Skills 4.3",
            "description": "I am familiar with the signs and symptoms of severe hypothermia.",
            "hint": "Scouts need to be fully able to identify and treat severe hypothermia, and understand the importance of avoiding hypothermia.",
        },
        {
            "title": "Sailing Skills 4.4",
            "description": "I can describe and demonstrate safety in and on the water.",
            "hint": "Scouts need to be aware of local hazards in and around boats, on the water, in known local conditions and in unknown conditions when near water.",
        },
        {
            "title": "Sailing Skills 4.5",
            "description": "I know how to properly secure a towline to my sailboat.",
            "hint": "Scouts should be able to describe where to secure a towline and how to prepare a sailboat for towing.",
        },
        {
            "title": "Sailing Skills 4.6",
            "description": "I know the hazards for sailing in different weather conditions.",
            "hint": "Scouts need to know and explain how different weather conditions (wind, rain, sun and cold) can impact a daysail and have an understanding of the hazards associated with different weather.",
        },
        {
            "title": "Sailing Skills 4.7",
            "description": "I understand balance in the sailboat, and know how to sail the boat flat.",
            "hint": "Scouts should be able to describe how to move body position to balance the sailboat and to keep the sailboat flat.",
        },
        {
            "title": "Sailing Skills 4.8",
            "description": "I understand how to trim my sail to get the best performance from the sailboat.",
            "hint": "Scouts should be able to describe how to properly trim the sails: where the sails should be when close hauled, and the mechanics of luffing the sail to depower.",
        },
        {
            "title": "Sailing Skills 4.9",
            "description": "I can tie eight knots that are useful when sailing, canoeing or camping.",
            "hint": "Scouts must be able to tie the eight knots listed below (time limit: 30 seconds for each knot).\n• reef knot\n• sheet bend\n• figure-eight\n• bowline\n• round turn and two half hitches\n• clove hitch\n• rolling hitch\n• fisherman’s bend",
        },
        {
            "title": "Sailing Skills 4.10",
            "description": "Under the direction of the Skipper, I have sailed my sailboat forward for 200 metres.",
            "hint": "Under direction of the Skipper, Scouts should be able to sail their boat forward in a reasonably straight line for a short distance. As much as possible, Scouts should do this with another youth. Adults may be a passenger and/or crew.",
        },
        {
            "title": "Sailing Skills 4.11",
            "description": "I can demonstrate how to steer a sailboat going upwind or downwind.",
            "hint": "Under direction of the Skipper, Scouts will be able to head up or bear off the wind depending on the wind conditions and direction.",
        },
        {
            "title": "Sailing Skills 4.12",
            "description": "I can demonstrate how to balance my sailboat and can sail the boat flat.",
            "hint": "Under direction of the Skipper, Scouts should be able to move body position to balance the sailboat and to keep the sailboat flat.",
        },
        {
            "title": "Sailing Skills 4.13",
            "description": "I have capsized the sailboat and recovered to an upright position.",
            "hint": "Scouts will have rocked a sailboat until it capsizes to gain a sense of the critical “heeling point of no return”. Scouts should never jump out of the boat, and they must stay with the boat and help the Skipper recover the boat to an upright position.",
        },
        {
            "title": "Sailing Skills 4.14",
            "description": "I can get back into the sailboat solo, or with help from the Skipper, if my boat capsizes.",
            "hint": "A Scout should be able to right a capsized sailboat with the help of the crew/Skipper, or solo, and demonstrate re-entry over the transom or gunwale.",
        },
        {
            "title": "Sailing Skills 4.15",
            "description": "I can help my Skipper to return the sailboat to the dock or to the beach safely.",
            "hint": "A Scout, acting as crew, should be able to assist the Skipper to dock or beach the boat safely, and then lift the boat from the water to dry land storage.",
        },
        {
            "title": "Sailing Skills 4.16",
            "description": "I can de-rig a sailboat, dry the sails and store all the parts properly.",
            "hint": "Scouts, by themselves, should be able to put all the parts of a boat into proper storage when they are finished with each sailing experience.",
        },
        {
            "title": "Sailing Skills 4.17",
            "description": "I have taken part in at least four daysails of four hours each, or eight daysails of at least two hours each, on safe, familiar waters.",
            "hint": "In addition to the daysail completed for the previous three stages, Scouts must have completed at least four four-hour daysail adventures or eight two-hour sailing adventures for a total of 16 hours. Scouts must demonstrate all of the sailing skills expected of a crew with a more experienced Stage 7 Scout/Venturer/Rover Scout in the sailboat.",
        },
        {
            "title": "Sailing Skills 4.18",
            "description": "I can toss a throw bag so that someone in the water can reach it.",
            "hint": "Scouts should be able to toss throw a throw bag to within 2 metres of a person in the water.",
        },
        {
            "title": "Sailing Skills 4.19",
            "description": "I can swim and demonstrate the HELP and huddle positions while in the water wearing a PFD.",
            "hint": "While in the water, Scouts should demonstrate the solo HELP position and the huddle positions with other Scouts for 7 minutes.",
        },
        {
            "title": "Sailing Skills 4.20",
            "description": "I have been introduced to self-help procedures and can explain how to perform the HELP position by myself and the huddle position with others.",
            "hint": "Scouts should be able to describe when to perform the HELP and huddle positions and what the self-help positions are intended to do in the water.",
        },
    ],
    "Sailing Skills 5": [
        {
            "title": "Sailing Skills 5.1",
            "description": "I know when and how to follow the Sail Coach’s commands.",
            "hint": "Scouts must be aware of the Sail Coach’s instructions at all times for their personal safety and for making the Learn to Sail session a positive learning experience.",
        },
        {
            "title": "Sailing Skills 5.2",
            "description": "I can identify mild symptoms of hyperthermia.",
            "hint": "Scouts should be able to identify and treat mild symptoms of hyperthermia.",
        },
        {
            "title": "Sailing Skills 5.3",
            "description": "I can identify three reaching assists that could be used to help someone in the water to reach safety and have demonstrated how to use one of them.",
            "hint": "Scouts must demonstrate using reaching assists in open water using:\n• throw bags\n• reaching assists—towel, paddle, pole\n• throwing assist—PFD, life ring\n• items that would normally be found in a sailboat",
        },
        {
            "title": "Sailing Skills 5.4",
            "description": "I know how to create and use a float plan.",
            "hint": "Scouts should create a float plan and leave it with their parents or their Scouter as the safety contact at home. The content of the float plan should include:\n• where they are going\n• when they will return\n• who is coming with them\n• where the closest aid is\n• how to contact them",
        },
        {
            "title": "Sailing Skills 5.5",
            "description": "I can explain why my boat needs a painter.",
            "hint": "Scouts should know that a painter is the rope attached to the boat to secure bow or stern to dock, mooring buoy or tow boat.",
        },
        {
            "title": "Sailing Skills 5.6",
            "description": "I know games youth can play to promote flexibility prior to going sailing.",
            "hint": "Scouts should know three active games to play to limber up and do warm-up exercises before launching their boats.",
        },
        {
            "title": "Sailing Skills 5.7",
            "description": "I can explain what clothing should be worn while sailing.",
            "hint": "Scouts should be able to explain what clothing should be worn while sailing.\n• footwear\n• hat\n• long vs. short-sleeved shirt\n• long pants vs. shorts\n• all-weather gear\n• wetsuit and/or drysuit\nClothing will vary depending on the season of the sailing excursion. Clothing may vary between different Scout Councils across Canada.",
        },
        {
            "title": "Sailing Skills 5.8",
            "description": "As the Skipper of my sailcraft, I can identify the equipment Transport Canada requires to be on the sailboat and demonstrate its proper use.",
            "hint": "Level 5 Scouts MUST identify the five pieces of safety equipment required by the Transport Canada and demonstrate their proper use.\n• One life jacket or PFD for each person on board\n• One signalling device (whistle)\n• One buoyant heaving line of at least 15 metres in length\n• One paddle\n• One bailer\nSee the Transport Canada’s Safe Boating Guide for details on all classes of boats.",
        },
        {
            "title": "Sailing Skills 5.9",
            "description": "I can describe the basic Transport Canada navigational aids on the water.",
            "hint": "A Stage 5 Scout must be able to identify the following:\n• lateral port and starboard buoys and day beacons\n• four cardinal buoys\n• special purpose (diving, keep out, mooring, swimming) buoys\n• mandatory lights required on sailing vessels underway\n• mandatory lights when anchored",
        },
        {
            "title": "Sailing Skills 5.10",
            "description": "I can explain the rules established to avoid collision.",
            "hint": "A Stage 5 Scout must be able to understand explain the following consistent with the Collision Regulations Rule 12–17:\n• Rule 12 Sailing vessels: opposite tack, same tack, windward tack, leeward tack, downwind tack, tack/gybing\n• Rule 13 Sailing vessels Overtaking Boat must keep clear\n• Rule 14 Sailing vessels Head–on situation\n• Rule 15 Vessels Crossing Situation\n• Rule 16 Action by the Give-Way vessel\n• Rule 17 Action by the Stand-on vessel",
        },
        {
            "title": "Sailing Skills 5.11",
            "description": "I can inspect a rigged sailboat and identify faulty boat parts.",
            "hint": "Scouts should be able to identify the parts of a boat that would make it unsafe to go sailing if in need of repair.\n• frayed whippings on lines\n• torn stitching on the sails\n• absent telltales on the shrouds\n• weakened swedges on the forestay and shrouds\n• loose turnbuckles on the shrouds\n• weakened or loose holding fittings in place\n• missing or unusable retaining pin on the pintle of the rudder\n• missing painter at the bow of the boat",
        },
        {
            "title": "Sailing Skills 5.12",
            "description": "I can launch a boat from the dock or from the shore.",
            "hint": "Scouts should have the knowledge and demonstrate how to launch from the dock or from the shore.\n• To avoid boat damage, the sailboat should be in the water before the sailor gets into it.\n• One person holds the boat stable, while the other person slides over the opposite gunwale and into the boat.\n• When launching from the shore, stepping into the water is encouraged.",
        },
        {
            "title": "Sailing Skills 5.13",
            "description": "I can trade places with my sailing crew while on the water in winds less than 9 knots.",
            "hint": "Scouts should be able to demonstrate exchanging places on the water when sailing in light wind conditions so that two youth on board can experience both helm and jib control without having to go back to the shore or the dock.",
        },
        {
            "title": "Sailing Skills 5.14",
            "description": "I have demonstrated steering a sailboat heading upwind, or bearing off and going downwind, depending on wind conditions and direction.",
            "hint": "Scouts should be able to manoeuvre the boat.\n• Steer a boat to go upwind and downwind.\n• Tack and gybe the sailboat under control.",
        },
        {
            "title": "Sailing Skills 5.15",
            "description": "I can demonstrate a self-rescue with my sailboat.",
            "hint": "A Scout in command of a sailboat must be able to right a capsized sailing dinghy and re-enter the sailboat by both themselves and with crew.",
        },
        {
            "title": "Sailing Skills 5.16",
            "description": "I have demonstrated proper Man Over Board (MOB) procedures while on the water.",
            "hint": "A Scout must be able to sail solo to tack/gybe the boat around, sail back to the location of the man overboard, bring the boat into irons next to the person in the water and help the MOB get back into the boat.",
        },
        {
            "title": "Sailing Skills 5.17",
            "description": "I have demonstrated making a sail raft and can explain its uses.",
            "hint": "Scouts should know how to raft boats together while holding the neighbouring boat, keeping hands 30 centimetres above the gunwales to keep fingers clear of being pinched between the hulls:\n• with two or more boats in the raft\n• for communication between boats or with a sail coach\n• for taking breaks on the water",
        },
        {
            "title": "Sailing Skills 5.18",
            "description": "I can work as part of a team to sail in a straight line going forward for at least 200 metres.",
            "hint": "A Scout, in command of a sailboat, can sail with a crew as a team to sail the boat properly.",
        },
        {
            "title": "Sailing Skills 5.19",
            "description": "I can effectively steer the sailboat while sailing flat, identify wind direction while sailing, make the boat turn, and head up or bear off within one boat length of the mark.",
            "hint": "A Scout, in command of the sailboat, must be able to read the wind in order to turn the boat upwind or downwind, and set the sails properly while underway.",
        },
        {
            "title": "Sailing Skills 5.20",
            "description": "I have demonstrated how to trim the sail while sailing at all points of sail, including adjusting the sails for wind shifts, and adjusting the sails for puffs or lulls.",
            "hint": "Scouts, in command of the sailboat, must be able to read the wind at all points of sail in order to trim the sail to gain the best performance in changing wind conditions.",
        },
        {
            "title": "Sailing Skills 5.21",
            "description": "I can manoeuvre the sailboat properly while giving the proper commands to my crew.",
            "hint": "Scouts, in command of the sailboat, must be able to issue the proper commands in the correct sequence to safely tack/gybe correctly, set a new course and to stop the boat to the leeward of the coach boat.",
        },
        {
            "title": "Sailing Skills 5.22",
            "description": "I can safely dock or beach a sailboat.",
            "hint": "Scouts, in command of the boat, should be able to:\n• judge the boat’s speed during its approach before turning head to wind towards the dock and stop the boat within one arm’s length of the dock, allowing the crew to reach out and shinny onto the dock\n• turn the boat head to wind parallel to the shore in waist deep water, slowing the boat to a stop before both Skipper and crew slide over the opposite gunwales and into the water\n• stop the boat before hitting the dock or hitting the sand and rocks preventing hull damage",
        },
        {
            "title": "Sailing Skills 5.23",
            "description": "I can lift the boat from the water to dry storage, de-rig the boat, and store the sails and foils correctly in the boat storage.",
            "hint": "Scouts should be able to safely remove the sailboat from the water for proper storage.",
        },
        {
            "title": "Sailing Skills 5.24",
            "description": "I have participated in one daysail of at least six hours’ duration which includes sailing to and landing at a beach, making and eating a meal, and returning safely.",
            "hint": "Scouts and crew should tie their daypacks under the forward deck, then sail the boat to the lunch spot.",
        },
        {
            "title": "Sailing Skills 5.25",
            "description": "I have taken part in at least five daysails of six hours each, or ten daysails of three hours each, on safe, familiar waters.",
            "hint": "In addition to the daysails completed for the previous four stages, Scouts must demonstrate all of the sailing skills expected of a Skipper to ensure the safety of the boat and crew, while sailing in familiar water and winds up to 12 knots.",
        },
        {
            "title": "Sailing Skills 5.26",
            "description": "I have helped a Stage 2 or Stage 3 sailor explain the basic safety rules for being near water.",
            "hint": "Scouts should be familiar with and capable of sharing their sailing knowledge.",
        },
    ],
    "Sailing Skills 6": [
        {
            "title": "Sailing Skills 6.1",
            "description": "I can identify signs of moderate levels of hyperthermia.",
            "hint": "Scouts should be able to recognize and identify and treat moderate symptoms of hyperthermia.",
        },
        {
            "title": "Sailing Skills 6.2",
            "description": "I understand and have taken the appropriate actions to maintain hydration.",
            "hint": "Scouts should know why they should keep their body hydrated.",
        },
        {
            "title": "Sailing Skills 6.3",
            "description": "I understand, and can explain, air dynamics on a sail.",
            "hint": "Scouts should be able to:\n• draw air flow around a cat and sloop-rigged sail plan\n• describe how the presence of the jib accelerates air around the main",
        },
        {
            "title": "Sailing Skills 6.4",
            "description": "I can evaluate local sailing hazards.",
            "hint": "A Scout must be able to identify surrounding hazards and evaluate the risks of sailing before going out on the water through the use of navigational charts and knowledge of local navigable waters.",
        },
        {
            "title": "Sailing Skills 6.5",
            "description": "I have, and can demonstrate, a full understanding of the local Racing Rules.",
            "hint": "Scouts should be able to understand and describe the intent of the local racing rules declared annually.",
        },
        {
            "title": "Sailing Skills 6.6",
            "description": "I can clearly communicate with my crew to synchronize the helm to sail trim and to boat balance.",
            "hint": "Scouts on the tiller should be able to provide verbal commands when tacking, gybing, trimming the sails or what to do in the event that the boat capsizes.",
        },
        {
            "title": "Sailing Skills 6.7",
            "description": "I have demonstrated proper steering techniques including smooth mark rounding, sailing by the lee and match sheeting to the turn.",
            "hint": "Scouts learning to sail faster should be able to perform these tasks on demand, executing a gybing exercise that includes six gybes in one-minute intervals.",
        },
        {
            "title": "Sailing Skills 6.8",
            "description": "I can properly trim the sail of the sailboat and the crew should identify the point and speed nodes for the helm upwind.",
            "hint": "Scouts should be able to:\n• adjust the sail controls to achieve maximum power\n• depower using sail controls when suitable\n• steer the sailboat for maximum speed\n• manage power achieved through proper sail trim",
        },
        {
            "title": "Sailing Skills 6.9",
            "description": "I can manoeuvre the sailboat.",
            "hint": "Scouts should be able to:\n• stop and sail backward for 100 metres\n• stop leeward of another boat\n• find a hole on the start line\n• accelerate from a reach and from irons\n• accelerate off a start line in a race",
        },
        {
            "title": "Sailing Skills 6.10",
            "description": "I have participated in a local club race.",
            "hint": "Scouts should have the opportunity to test their knowledge to sail faster at a local dinghy race and be able to:\n• tack onto the laylines of a racing course\n• perform a double tack to lay a mark and on a start line\n• head up and tack around a mark\n• identify opportunities to bear away, and for gybe sets at a mark",
        },
        {
            "title": "Sailing Skills 6.11",
            "description": "I have participated in a sailing rescue as both the rescuer and the one being rescued, and I have experienced a simulated capsize to acquire the knowledge to recover the boat properly.",
            "hint": "Scouts must be competent to right a capsized sailboat and assist others in righting other sailboats.",
        },
        {
            "title": "Sailing Skills 6.12",
            "description": "I can sail a single / double-handed boat to CANSail 3 skills standards.",
            "hint": "Scouts must be competent to sail single-handed sailboat (e.g., Laser Radial) or a double-handed sailboat (e.g., 470, Club 420, Flying Junior, Mistral 4.04, Skiff).",
        },
        {
            "title": "Sailing Skills 6.13",
            "description": "I have participated in at least six daysail outings.",
            "hint": "In addition to the daysails completed for the previous five stages, Scouts must demonstrate all of the sailing skills expected of a Skipper to ensure the safety of the boat and crew, while sailing in familiar water and winds up to 15 knots.",
        },
        {
            "title": "Sailing Skills 6.14",
            "description": "I have maintained a logbook of my training.",
            "hint": "Scouts should maintain an International Sailing Logbook, available from Sail Canada, recording the date, location, and personal reflection of recreational, training, and competitive sailing experiences.",
        },
        {
            "title": "Sailing Skills 6.15",
            "description": "I have assisted the sail coach in delivering one safety element, one knowledge item and one on-the-water skill to sailors working on Stage 2, 3 or 4.",
            "hint": "Scouts should be familiar with, and capable of, sharing their sailing knowledge with younger Scouts.",
        },
    ],
    "Sailing Skills 7": [
        {
            "title": "Sailing Skills 7.1",
            "description": "I can recognize and treat severe hypothermia and hyperthermia.",
            "hint": "Scouts should be able to recognize the symptoms of weather related injuries including:\n• heat exhaustion and sun stroke found in hyperthermia, or\n• shivering, and slurring of words found in hypothermia and know how to treat them.",
        },
        {
            "title": "Sailing Skills 7.2",
            "description": "I can evaluate geographical and tidal effects of a sailing venue.",
            "hint": "Scouts should be able to:\n• describe types of clouds and local weather patterns\n• explain the major factors affecting tides and currents\n• study the nautical charts of a new sailing venue and be able to point out impacts of currents and potential hazards of the sailing area",
        },
        {
            "title": "Sailing Skills 7.3",
            "description": "I can describe common seamanship knowledge.",
            "hint": "Scouts should be able to:\n• describe the types of wind shifts\n• identify gradient and thermal winds\n• draw a cat and sloop-rigged sail plan",
        },
        {
            "title": "Sailing Skills 7.4",
            "description": "I can describe common racing strategies.",
            "hint": "Scouts should be able to:\n• know what to look for choosing the favoured end of the gate and finish line while sailing\n• describe how lifts and headers affect their position on a course\n• determine the direction of current while sailing",
        },
        {
            "title": "Sailing Skills 7.5",
            "description": "I can describe the mechanics of air flow over the sail.",
            "hint": "Scouts should be able to:\n• draw air flow around a cat-rig, and sloop-rig sail plans\n• describe how the presence of a jib accelerates air around the main\n• recognize optimal leech profile\n• describe 3 ways to depower the sails",
        },
        {
            "title": "Sailing Skills 7.6",
            "description": "I can describe how to tune a boat.",
            "hint": "Scouts should be able to:\n• describe the sail rigging each day prior to training\n• choose the rig settings for the day’s conditions",
        },
        {
            "title": "Sailing Skills 7.7",
            "description": "I know and can describe the intent of the current ISAF racing rules 1–7.",
            "hint": "Scouts working toward advanced sailing skills should have a full understanding of the current local sailing and ISAF racing rules 1–7 published nationally.",
        },
        {
            "title": "Sailing Skills 7.8",
            "description": "I have demonstrated an understanding of sail rigging.",
            "hint": "Scouts should be able to:\n• choose rigging settings for the day’s conditions\n• correctly rig sails each day for training\n• place telltales on the jib luff and leech, and on mainsail leech\n• correctly rig the kite each day",
        },
        {
            "title": "Sailing Skills 7.9",
            "description": "I have demonstrated the skills to balance the sailboat while underway on the water.",
            "hint": "Scouts should be able to:\n• maintain accurate body position at all points of sail, and\n• balance the boat by using hiking, and by moving fore and aft.",
        },
        {
            "title": "Sailing Skills 7.10",
            "description": "I can demonstrate Intermediate sailing skills.",
            "hint": "Scouts should be able to:\n• stop leeward of another boat\n• find a hole on the start line\n• accelerate from a reach, and from irons\n• accelerate off a start line in a race\n• Identify opportunities for bear away and gybe sets at a mark\n• accelerate from marks",
        },
        {
            "title": "Sailing Skills 7.11",
            "description": "I have demonstrated the skills to steer the sailboat while underway.",
            "hint": "Scouts should be able to:\n• demonstrate how to head up and tack around the marks\n• demonstrate smooth tactical mark roundings",
        },
        {
            "title": "Sailing Skills 7.12",
            "description": "I have demonstrated the skills to trim the sails while underway.",
            "hint": "Scouts should be able to:\n• complete sail control adjustments to head up and bear away\n• as a crew, identify point and speed modes for helm upwind\n• trim the sails using all sail controls\n• trim the jib leech to keep top and bottom telltales breaking together\n• sheet the main to trim sails appropriately\n• depower the sails using sail controls",
        },
        {
            "title": "Sailing Skills 7.13",
            "description": "I have successfully shown how to manoeuvre while sailing.",
            "hint": "Scouts should be able to:\n• demonstrate how and when to tack on headers\n• perform a double tack to lay a mark and on start line\n• accelerate out of marks\n• identify opportunities for bearing away and gybe sets at a mark\n• promote planing and surfing",
        },
        {
            "title": "Sailing Skills 7.14",
            "description": "I have demonstrated down-speed opportunities.",
            "hint": "Scouts should be able to:\n• hold a position on a start line for 30 seconds\n• identify opportunities to sail slowly at a leeward mark",
        },
        {
            "title": "Sailing Skills 7.15",
            "description": "I have demonstrated tactical manoeuvres while racing.",
            "hint": "Scouts should be able to:\n• identify the windward and leeward end of the starting line\n• have the crew provide countdown information to helm during the start\n• have the crew back the mainsail to stop\n• bear off by backing the jib\n• implement strategy and tactics while racing",
        },
        {
            "title": "Sailing Skills 7.16",
            "description": "I have participated in a one- to two-day local regatta.",
            "hint": "Scouts should participate in a local regatta in order to expand their sailing experience.",
        },
        {
            "title": "Sailing Skills 7.17",
            "description": "I can sail a single / double-handed boat to CANSail 4 standards.",
            "hint": "Scouts must be competent to sail single-handed sailboat (e.g., Laser Radial) or a double-handed sailboat (e.g., 470, Club 420, Flying Junior, Skiff).",
        },
        {
            "title": "Sailing Skills 7.18",
            "description": "I have participated in at least seven daysail outings.",
            "hint": "In addition to the daysails completed for the previous six stages, Scouts must demonstrate all of the sailing skills expected of a Skipper to ensure the safety of the boat and crew, while sailing in familiar water and winds up to 18 knots.",
        },
    ],
    "Sailing Skills 8": [
        {
            "title": "Sailing Skills 8.1",
            "description": "I know the Collision Regulations and proper etiquette for using a marine radio on the water.",
            "hint": "A Scout supervising another sailboat by powerboat should have a full understanding of the Collision Regulations 1–17 and have a full understanding of the etiquette to deliver the intended messages by use of a marine radio, including, hailing for help using prefaces of either MAYDAY MAYDAY MAYDAY, PAN-PAN PAN-PAN PAN-PAN, SECURITY SECURITY SECURITY; or on Marine Channels 9 or 16.",
        },
        {
            "title": "Sailing Skills 8.2",
            "description": "I know how to properly prepare my boat for safe travel.",
            "hint": "A Scout must be able to travel safely between sailing venues.",
        },
        {
            "title": "Sailing Skills 8.3",
            "description": "I can evaluate geographical and tidal effects of a new sailing venue.",
            "hint": "Scouts should be able to:\n• describe three types of clouds and local weather patterns\n• and explain the major factors affecting tides and currents",
        },
        {
            "title": "Sailing Skills 8.4",
            "description": "I know and can describe the current racing rules.",
            "hint": "Scouts must be able to describe the implications of the I, P, Z and black flags on used in racing with full understanding of the of their intent in accordance to the current CANSail / ISAF Racing Rules.",
        },
        {
            "title": "Sailing Skills 8.5",
            "description": "I have demonstrated how to tune a boat.",
            "hint": "Scouts should be able to:\n• choose proper sail rigging for the day’s conditions\n• correctly rig sails each day prior to training\n• correctly rig the kite each day for training",
        },
        {
            "title": "Sailing Skills 8.6",
            "description": "I have demonstrated optimal body position at all times when sailing.",
            "hint": "Scouts should be able to balance a boat properly while flying a spinnaker.",
        },
        {
            "title": "Sailing Skills 8.7",
            "description": "I have demonstrated tacking/gybe manoeuvres.",
            "hint": "Scouts must be able to:\n• perform wire to wire tacks at one-minute intervals\n• perform 10 gybes sets at one-minute intervals\n• identify opportunities to bear away\n• perform gybe sets for a mark\n• perform wide and close mark rounding\n• steer promoting planing and surfing",
        },
        {
            "title": "Sailing Skills 8.8",
            "description": "I have demonstrated the skills to fly a spinnaker/kite on the water.",
            "hint": "Scouts should be able to:\n• head up and tack around a mark\n• perform a leeward hoist around a windward mark\n• perform a windward hoist around a windward mark\n• successfully hoist and fly a kite on a downwind leg\n• set the pole once the spinnaker is hoisted (on both windward and leeward hoists)\n• free fly the kite into a leeward mark\n• steer the boat to keep pressure in kite on a reach and run\n• steer the boat to promote planing and surfing with a kite\n• release the kite halyard to make a reach mark lay line\n• douse the kite to windward at a leeward mark\n• demonstrate a tactical rounding with a kite",
        },
        {
            "title": "Sailing Skills 8.9",
            "description": "I can demonstrate the skill to gybe while flying a spinnaker/kite.",
            "hint": "Scouts should be able to:\n• gybe the kite by switching the pole after a gybe\n• gybe with the kite on command ten times at one-minute intervals\n• line up on a beat with a tuning partner and accelerate",
        },
        {
            "title": "Sailing Skills 8.10",
            "description": "I can demonstrate tactics while racing.",
            "hint": "Scouts should able to:\n• perform double tacks to lay a mark and at the start line\n• tack to perform a close and loose cover\n• tack and duck under another boat\n• sail slowly approaching leeward marks\n• sail slowly approaching marks while flying a spinnaker",
        },
        {
            "title": "Sailing Skills 8.11",
            "description": "I have demonstrated racing strategies.",
            "hint": "Scouts should be able to:\n• accelerate from the start line\n• identify and choose the favoured end of a gate and finish while sailing\n• describe three types of wind shifts",
        },
        {
            "title": "Sailing Skills 8.12",
            "description": "I can sail a single-handed boat to CANSail 5 skills standards.",
            "hint": "Scouts must be competent to sail a single-handed sailboat (e.g. Laser Radial, Finn, Skiff).",
        },
        {
            "title": "Sailing Skills 8.13",
            "description": "I have participated in at least eight daysail outings.",
            "hint": "In addition to the daysails completed for the previous seven stages, Scouts must demonstrate all of the sailing skills expected of a Skipper to ensure the safety of the boat and crew, while sailing in familiar water and winds up to 18 knots.",
        },
        {
            "title": "Sailing Skills 8.14",
            "description": "I have participated in a regional training camp and a regional regatta.",
            "hint": "I have participated in a regional training camp to hone the skills needed to SAIL to WIN and participated in a regional regatta coached by a certified CANSail 5–6 Advanced Sail Coach.",
        },
        {
            "title": "Sailing Skills 8.15",
            "description": "I have successfully completed the equivalent requirements for a CANSail 1–2 Fundamental Sailing Instructor course, from Sail Canada or its member provincial association, or internationally recognized equivalent.",
            "hint": "A Scout at the advanced sailing level should have the skills to teach sailing to younger and/or less-experienced Scouts must have completed the equivalent standards of a CANSail 1–2 Fundamental Sailing Instructor course or internationally recognized equivalent.",
        },
    ],
    "Sailing Skills 9": [
        {
            "title": "Sailing Skills 9.1",
            "description": "I have prepared the vehicle and/or trailer with the boat that I am responsible for prior to travelling to any events.",
            "hint": "Scouts should be able to:\n• inspect both the vehicle and/or the trailer and its valued racing dinghy cargo securely tied\n• check all vehicle brakes and signal lights to ensure they are in good working order at the time of departure to any sailing events",
        },
        {
            "title": "Sailing Skills 9.2",
            "description": "I have used precautionary driving skills while travelling safely to events carrying passengers and/or transporting sailboats.",
            "hint": "A Scout, at the advanced sailing level, traveling to compete at regional and/or provincial events, must do so safely, using precautionary driving skills according to Provincial motor vehicle regulations, and with the utmost care while carrying passengers and/or transporting sailboats.",
        },
        {
            "title": "Sailing Skills 9.3",
            "description": "I have developed strategic and tactical plans, based on wind, geography, tides and currents, prior to a race.",
            "hint": "A Scout, at the advanced sailing level, planning for a sailing expedition or a racing event should assess the sailing event area strategically and make tactical plans to determine if there are any unique geographic features affecting local laminar wind flow, tidal activity, and flooding/ebbing tidal currents at the time of the event.",
        },
        {
            "title": "Sailing Skills 9.4",
            "description": "I can describe the implications of the I, P, Z and black flags used in racing with full understanding of their intent in accordance with the current CANSail / World Sailing Racing Rules.",
            "hint": "A Scout, racing at the advanced level, must be able to describe the implications of the I, P, Z and black flags used in racing with full understanding of their intent in accordance with the current CANSail / World Sailing Racing Rules.",
        },
        {
            "title": "Sailing Skills 9.5",
            "description": "I have the knowledge to effectively evaluate and adjust both standing and running rigging prior to a race with the intent of achieving maximum performance.",
            "hint": "A Scout, at the advanced level, must be able to effectively evaluate and adjust both standing and running rigging prior to a race with the intent of achieving maximum performance.",
        },
        {
            "title": "Sailing Skills 9.6",
            "description": "I have a full understanding of air flow over the sails, and can explain the implications of changing laminar flow on sail trim.",
            "hint": "A Scout, at the advanced sailing level, must have a full understanding of air flow over the sails, and can explain the implications of changing laminar flow on sail trim.",
        },
        {
            "title": "Sailing Skills 9.7",
            "description": "I can demonstrate at least six steering skills.",
            "hint": "• tactical rounding of the mark while racing\n• tacking to duck under a boat\n• maintaining bow out on start line\n• consistently starting within 3 seconds of the starting horn\n• gybing on waves to promote planing and surfing\n• holding a position going upwind or downwind for a minute",
        },
        {
            "title": "Sailing Skills 9.8",
            "description": "I have successfully demonstrated at least two tactical sailing manoeuvres.",
            "hint": "• defending a position on a downwind leg\n• exonerating myself after a penalty by completing a 360 or a 720 during the race",
        },
        {
            "title": "Sailing Skills 9.9",
            "description": "I have demonstrated at least four optimal body positions while sailing on a double-handed boat.",
            "hint": "• balancing the boat for the conditions, using hiking and trapezing\n• pushing the body out onto the trapeze before clipping in\n• clipping on to the trapeze using a straight arm\n• trapezing with feet together and shoulders back",
        },
        {
            "title": "Sailing Skills 9.10",
            "description": "I have demonstrated at least four skills to steer the sailboat while underway on the water.",
            "hint": "• helm trimming main and driving to keep the crew trapezing\n• promoting planing and surfing\n• completing adjustments to the sail controls to head up\n• demonstrating smooth tactical mark roundings",
        },
        {
            "title": "Sailing Skills 9.11",
            "description": "I have successfully shown at least three manoeuvres on a boat with a trapeze.",
            "hint": "• roll tacking using the trapeze puck to roll the boat\n• performing wire to wire tacks at one-minute intervals\n• performing wire to wire gybes at one-minute intervals",
        },
        {
            "title": "Sailing Skills 9.12",
            "description": "I have prepared for competition.",
            "hint": "Scouts should have:\n• prepared for competition by conditioning themselves through a daily physical warm-up prior to training\n• set skill / process-based goals for training and racing sessions\n• maintained a written log book throughout training",
        },
        {
            "title": "Sailing Skills 9.13",
            "description": "I have participated in a provincial regatta where all the skills that I have learned are consolidated into performance in order to excel during the regatta.",
            "hint": "A Scout, at the advanced sailing level, must have participated in a provincial regatta where all the skills learned are consolidated into performance in order to excel during the regatta.",
        },
        {
            "title": "Sailing Skills 9.14",
            "description": "I have successfully completed the equivalent requirements for an Intermediate CANSail 3–4 Sailing Instructor course from Sail Canada or its provincial association, or an internationally recognized equivalent.",
            "hint": "A Scout, at the advanced sailing level, should have the skills to teach Scout Sailing Stage 5, 6, 7 and 8. Scouts must have completed the equivalent standards of a CANSail 3–4 Intermediate Sailing Instructor course or internationally recognized equivalent.",
        },
        {
            "title": "Sailing Skills 9.15",
            "description": "I can sail a double-handed boat to CANSail 5 skills standards including CANSail 5 chute skill sets.",
            "hint": "Scouts must be competent to sail a double-handed sailboat (e.g. 470, Club 420, Flying Junior, Mistral 4.04, 49er) with spinnaker or kite.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Sailing Skills badges and requirements"

    def handle(self, *args, **options):
        category = "sailing_skills"

        for badge_name, requirements in SAILING_SKILLS_DATA.items():
            badge, _ = Badge.objects.update_or_create(
                name=badge_name,
                defaults={
                    "category": category,
                    "is_active": True,
                },
            )

            seen_orders = set()

            for order, req in enumerate(requirements, start=1):
                BadgeRequirement.objects.update_or_create(
                    badge=badge,
                    order=order,
                    defaults={
                        "title": req["title"],
                        "description": req["description"],
                        "hint": req["hint"],
                    },
                )
                seen_orders.add(order)

            badge.requirements.exclude(order__in=seen_orders).delete()

            self.stdout.write(self.style.SUCCESS(f"Loaded {badge_name}"))

        self.stdout.write(self.style.SUCCESS("Finished loading Sailing Skills."))