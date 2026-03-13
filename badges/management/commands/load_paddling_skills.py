from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


PADDLING_SKILLS_DATA = {
    "Paddling Skills 1": [
        {
            "title": "Paddling Skills 1.1",
            "description": "I can jump into chest-deep water with my Personal Flotation Device (PFD) on.",
            "hint": "Scouts can demonstrate they are comfortable getting into and out of the water with a PFD on.",
        },
        {
            "title": "Paddling Skills 1.2",
            "description": "I can blow bubbles in the water for 10 seconds.",
            "hint": "Scouts can demonstrate that they are comfortable putting their faces in the water for 10 seconds.",
        },
        {
            "title": "Paddling Skills 1.3",
            "description": "I can explain what a PFD is for.",
            "hint": "Scouts can show that they know and understand the purpose of a PFD; a PFD must be worn at all times when paddling and a PFD is to be put on before entering any watercraft.",
        },
        {
            "title": "Paddling Skills 1.4",
            "description": "I can put on my PFD and know how it should fit.",
            "hint": "Scouts can demonstrate how to properly put on a PFD, ensuring all buckles and zippers are properly fastened and that their PFD is snug enough not to slide over their heads.",
        },
        {
            "title": "Paddling Skills 1.5",
            "description": "I can show where the bow and stern are in a canoe or kayak.",
            "hint": "Scouts can tell the difference between the front and the back of a watercraft and know the proper names for the front and the back.",
        },
        {
            "title": "Paddling Skills 1.6",
            "description": "I can demonstrate the correct way to hold my paddle.",
            "hint": "Scouts can show the proper use of a paddle with the top hand properly on the grip and the bottom hand on the shaft.\nScouts’ hands should be as far apart as their shoulders.",
        },
        {
            "title": "Paddling Skills 1.7",
            "description": "I have demonstrated how to behave safely in my canoe or kayak.",
            "hint": "Scouts can demonstrate (while in a watercraft) that they must keep their weight low in the watercraft and balance themselves by holding both gunwales.\nScouts can demonstrate that if they are not paddling they should sit on the floor and that there is no jumping, sudden movements or horseplay while in the watercraft.",
        },
        {
            "title": "Paddling Skills 1.8",
            "description": "I can explain why I should care for my PFD.",
            "hint": "Scouts know that a poorly cared for PFD is at risk of mould, tears and deterioration. They should also know that a damaged PFD will not work reliably.",
        },
        {
            "title": "Paddling Skills 1.9",
            "description": "I can explain the risks of cold water.",
            "hint": "A Scout can explain that cold water means your body will not function as well as it should.",
        },
        {
            "title": "Paddling Skills 1.10",
            "description": "I know how to contact the emergency services.",
            "hint": "Scouts know how to call 9-1-1 or their local emergency number and to request assistance from the nearest adult.",
        },
        {
            "title": "Paddling Skills 1.11",
            "description": "I can get in and out of my watercraft safely.",
            "hint": "Scouts can demonstrate that they can get in and out of their watercraft safely.",
        },
        {
            "title": "Paddling Skills 1.12",
            "description": "I have taken part in a short paddling adventure of at least one hour.",
            "hint": "Scouts will have experienced a short paddling adventure.\nScouts only need only be in the watercraft.\nIf Scouts want to paddle, they may, but Scouters or more-experienced Scouts are in charge of the watercraft.",
        },
    ],
    "Paddling Skills 2": [
        {
            "title": "Paddling Skills 2.1",
            "description": "I can swim 25 metres with my PFD on.",
            "hint": "Scouts can demonstrate that they are comfortable in the water and able to swim a short distance with a PFD on. Any swimming stroke is acceptable.",
        },
        {
            "title": "Paddling Skills 2.2",
            "description": "I can explain the difference between a PFD and a life jacket.",
            "hint": "Scouts can explain that a PFD may not hold a person’s face out of the water if the person is unconscious and that a life jacket will turn a person face up.",
        },
        {
            "title": "Paddling Skills 2.3",
            "description": "Before I launch my watercraft, I can show where I am allowed to go canoeing or kayaking.",
            "hint": "Scouts can explain where they are allowed to paddle, as they have been instructed by the person in charge of the paddling activity.",
        },
        {
            "title": "Paddling Skills 2.4",
            "description": "I can explain why I should not drink the water from the lake or river I am paddling on until it has been filtered or treated.",
            "hint": "Scout understand that lake and river water may not be safe to drink due to bacteria, chemicals, parasites and germs that may be present in the water.",
        },
        {
            "title": "Paddling Skills 2.5",
            "description": "I can identify the equipment Transport Canada requires me to have in my canoe or kayak.",
            "hint": "Scouts can identify the five essential pieces of safety equipment and have a rudimentary idea of how to use them.\n• PFD\n• Signaling Device (whistle)\n• Floating Rope\n• Paddle\n• Bailer\nScouts can explain the use of a flashlight for fog or nighttime paddling.",
        },
        {
            "title": "Paddling Skills 2.6",
            "description": "I can explain the safety rules for being near water.",
            "hint": "Scouts can explain basic safety rules for common hazards including: slippery rocks, sharp objects, unstable banks, moving water, etc.",
        },
        {
            "title": "Paddling Skills 2.7",
            "description": "I can list the appropriate action I should take if I capsize in a canoe or kayak.",
            "hint": "Scouts need to know that when their watercraft capsizes they should to the following:\n• stay with your watercraft\n• make noise to get attention\n• count to five and take a breath\n• hang onto your paddle if you can\n• follow the instructions of your rescuer",
        },
        {
            "title": "Paddling Skills 2.8",
            "description": "I have explained some of the ways that paddling a canoe or kayak can have a negative impact on the environment where I am paddling.",
            "hint": "Scouts should have an awareness of the fact that paddling can have a negative impact on the environment and the need to be respectful of the places where we paddle to minimize our impact.",
        },
        {
            "title": "Paddling Skills 2.9",
            "description": "I can get help if I see somebody in difficulty on the water.",
            "hint": "If Scouts see someone in difficulty on the water, they know to call for help by whistling and yelling.\nScouts can use a throwing assist if one is available.",
        },
        {
            "title": "Paddling Skills 2.10",
            "description": "I am familiar with common whistle signals and when they would be used.",
            "hint": "While there are variations to exactly how whistles are used, Scouts should be aware of some of the basic whistle signals.\n• one blast—stop paddling and pay attention for further instructions\n• two blasts—raft up. If the group is spread out, the lead paddlers should go back and raft up with the back paddlers\n• three blasts—EMERGENCY—go to who blew the whistle and stand by. Follow the instructions of the person directing the rescue.",
        },
        {
            "title": "Paddling Skills 2.11",
            "description": "I have used a throw bag.",
            "hint": "Scouts can demonstrate an ability to use a throw bag. Distance and accurately at this stage are not the prime objectives.",
        },
        {
            "title": "Paddling Skills 2.12",
            "description": "I can identify the parts of my watercraft and my paddle.",
            "hint": "Any type of self-propelled watercraft and paddle are suitable.\nParts should include:\n• Paddle: blade, tip, neck, shaft, handle, etc.\n• Watercraft: hull, bow, stern, bum rest, etc.",
        },
        {
            "title": "Paddling Skills 2.13",
            "description": "I am familiar with the signs and symptoms of mild hypothermia.",
            "hint": "Scouts can list the signs and symptoms of mild hypothermia:\n• constant shivering\n• tiredness\n• low energy\n• cold or pale skin\n• fast breathing (hyperventilation)",
        },
        {
            "title": "Paddling Skills 2.14",
            "description": "I have taken part in an at least two paddling activities.",
            "hint": "Scouts will have completed two paddling adventures of at least one hour in duration each, and have practised their paddling skills with the support of a more experienced Scout or Scouter.",
        },
    ],
    "Paddling Skills 3": [
        {
            "title": "Paddling Skills 3.1",
            "description": "I can swim 100 metres with my PFD on using any stroke.",
            "hint": "Scouts can demonstrate that they are comfortable in the water and able to swim a short distance with a PFD on.\nAny swimming stroke is acceptable.",
        },
        {
            "title": "Paddling Skills 3.2",
            "description": "I know how to choose a paddle that is the correct size.",
            "hint": "Scouts can discuss options for sizing and understand that the paddle that ‘feels right’ is usually best.",
        },
        {
            "title": "Paddling Skills 3.3",
            "description": "With help from my team or my Scouter, I can paddle my canoe or kayak forward a short way.",
            "hint": "Scouts can paddle their watercraft forward in a reasonably straight line for a short distance.\nAs much as possible, Scouts achieve this skill with another youth with similar skills.\nAdults or more senior youth may be the passenger.",
        },
        {
            "title": "Paddling Skills 3.4",
            "description": "I have capsized a canoe while sitting in it.",
            "hint": "Scouts can rock a watercraft and have it dump.\nScouts do not jump out of the watercraft; they attempt to stay with the watercraft.",
        },
        {
            "title": "Paddling Skills 3.5",
            "description": "I can get back into my canoe or kayak with help from someone in another watercraft if my watercraft capsizes.",
            "hint": "Someone else rights the swamped watercraft and assists the paddlers to get back into their watercraft.",
        },
        {
            "title": "Paddling Skills 3.6",
            "description": "I know how and where to get the latest weather forecast for the area where I will be paddling.",
            "hint": "Scouts can demonstrate the ability to get accurate weather forecasts from the internet, radio or television and can discuss what the forecast might mean for their paddling trip.",
        },
        {
            "title": "Paddling Skills 3.7",
            "description": "I know what the risks are for paddling in different weather conditions.",
            "hint": "Scouts can explain how different weather conditions (wind, rain, sun and cold) can impact a paddling trip and have an understanding of the risks associated with different weather.",
        },
        {
            "title": "Paddling Skills 3.8",
            "description": "I can make a recognized distress signal.",
            "hint": "Scouts can demonstrate how to make a distress signal such as three whistle blasts or by lighting three fires or putting three watercrafts in a triangle.",
        },
        {
            "title": "Paddling Skills 3.9",
            "description": "I can throw a throw bag.",
            "hint": "Scouts can throw a throw bag at least 5 metres and be within the length of their watercraft of the target.",
        },
        {
            "title": "Paddling Skills 3.10",
            "description": "I have helped a Stage 1 paddler learn to put on his or her PFD.",
            "hint": "Stage 3 Scouts can help a less experienced Scout to properly select and put on a PFD.",
        },
        {
            "title": "Paddling Skills 3.11",
            "description": "I have taken part in two paddling activities.",
            "hint": "Scouts have completed two paddling adventures of two hours or more each.\nScouts must carry out most of the paddling with a Scouter or a more experienced Scout (either in the same watercraft or close by to help if assistance is required).",
        },
    ],
    "Paddling Skills 4": [
        {
            "title": "Paddling Skills 4.1",
            "description": "I can demonstrate the HELP and huddle positions while in the water wearing a PFD.",
            "hint": "Scouts can demonstrate the ability to preserve body heat in the event they are stranded in the water for extended periods.\nThey can demonstrate the ability to maintain both positions for a period of five minutes each.",
        },
        {
            "title": "Paddling Skills 4.2",
            "description": "I can explain what clothing should be worn while canoe tripping.",
            "hint": "(This competency will vary depending on the region of the country and the season Scouts are paddling in.)\nScouts can demonstrate an understanding of the clothing options available and some of the pros and cons of the different options, including: different footwear, different headwear, long-sleeves vs short-sleeves, trousers vs shorts, rain gear and wet suits.",
        },
        {
            "title": "Paddling Skills 4.3",
            "description": "I can assist in launching and landing a canoe or kayak.",
            "hint": "Scouts can demonstrate an ability to assist in the launching of a canoe from the shore and from a dock. When doing this, they can demonstrate the following:\n• one person holds the watercraft stable while the other is moving\n• use paddle to stabilize the watercraft while moving or sitting in position\n• avoid damage to watercrafts\n• watercraft should be in the water before the paddler gets into it\n• stepping into the water is encouraged",
        },
        {
            "title": "Paddling Skills 4.4",
            "description": "I can trade places with my paddling partner while on the water.",
            "hint": "Scouts will demonstrate the following technique:\n• Stern paddler moves ahead of rear thwart and crunches up in a ball\n• Bow paddler steps over stern paddler to back seat\n• Stern paddler moves to bow seat\n• Only one person moving at a time\n• Communication between paddlers must happen",
        },
        {
            "title": "Paddling Skills 4.5",
            "description": "I have helped a Stage 2 paddler to explain the basic safety rules for being near water.",
            "hint": "A Stage 4 Scout will have spent time helping a Scout working at Stage 2 to learn basic safety rules for being near the water.",
        },
        {
            "title": "Paddling Skills 4.6",
            "description": "I can explain the seven principles of Leave No Trace.",
            "hint": "See LNT program website: www.leavenotrace.ca/principles",
        },
        {
            "title": "Paddling Skills 4.7",
            "description": "I have taken part in a canoe or kayak raft-up and can explain its uses.",
            "hint": "Scouts have participated in a raft-up with three or more watercraft in the raft. When rafting-up, watercraft should be touching each other with paddlers holding each other or each other’s watercraft.\nScouts understand that the raft-up is used for communication or breaks.",
        },
        {
            "title": "Paddling Skills 4.8",
            "description": "By myself or with a paddling partner, I can paddle a canoe or kayak in a straight line going forward for at least 50 metres.",
            "hint": "Scouts can use whatever paddle strokes they wish to keep the line reasonably straight for 50 metres.\nScouts can demonstrate this skill with another Stage 4 paddler, or with a Scouter or more experienced paddler.",
        },
        {
            "title": "Paddling Skills 4.9",
            "description": "I can make my canoe or kayak turn in the direction I want it to turn.",
            "hint": "Scouts can demonstrate a basic understanding of what to do to make the watercraft turn in the direction they intend it to go.",
        },
        {
            "title": "Paddling Skills 4.10",
            "description": "I can demonstrate basic canoe strokes (forward, reverse, draw, pry, stop, j, sweep).",
            "hint": "Scouts can demonstrate these different strokes and have a basic understanding of what happens to the watercraft when different strokes are applied.",
        },
        {
            "title": "Paddling Skills 4.11",
            "description": "I can explain why my watercraft needs a painter and can attach one so that it is secure and readily available when I need it.",
            "hint": "Scouts know that a painter is the rope attached to the bow and/or stern of the watercraft. They can secure the painter to their watercraft using an appropriate knot.",
        },
        {
            "title": "Paddling Skills 4.12",
            "description": "I can describe water and weather conditions that make paddling unsafe and can explain what to do if I encounter them while I am on the water.",
            "hint": "Scouts understand water and weather conditions (such as waves, thunderstorms and tides) and can explain the appropriate course of action when they encounter them while on the water.",
        },
        {
            "title": "Paddling Skills 4.13",
            "description": "I can explain why canoes and kayaks are important to Canadian aboriginal people and the history of Canada.",
            "hint": "Scouts can demonstrate (through a group discussion with their patrol, a presentation, skit, story, etc.) an understanding of the importance of canoes and kayaks to Canadians both before and after European contact.",
        },
        {
            "title": "Paddling Skills 4.14",
            "description": "I can identify three methods for helping someone in the water to reach safety and have demonstrated how to use them. (This can be demonstrated in open water or a swimming pool.)",
            "hint": "Scouts can identify three methods for helping someone in distress in the water, such as: talking someone to safety, throwing something buoyant to the person in distress, or going to the person.\nAny aids identified should be items that would normally be found on a canoe trip and can include, but are not limited to the following:\n• throw bags\n• reaching assist (paddle, pole)\n• throwing assists\n• PFD",
        },
        {
            "title": "Paddling Skills 4.15",
            "description": "I can throw a throw bag so that someone in the water can reach it.",
            "hint": "Scouts can demonstrate the ability to throw a throw bag to someone in the water so that the person can easily reach it within a few swimming strokes.",
        },
        {
            "title": "Paddling Skills 4.16",
            "description": "I have taken part in and logged at least four paddling activities.",
            "hint": "Scouts maintain paddling logs.\nThe log include date, location, distance, time, participants and something interesting about each activity.",
        },
        {
            "title": "Paddling Skills 4.17",
            "description": "I can explain what a float plan is.",
            "hint": "Scouts know that a float plan documents: where they are going, when they will return, where the closest aid is and who is in the paddling group.",
        },
        {
            "title": "Paddling Skills 4.18",
            "description": "I have participated in at least one paddling activity of at least eight hours’ duration that includes making and eating a meal.",
            "hint": "During this paddling activity, Scouts are tasked with all the paddling.\nOlder paddlers can be in the watercraft or in a nearby watercraft to help if required.\nScouts who have completed the Paddle Canada Waterfront program have demonstrated most of the paddling and safety requirements for Stages 1–4. Items specifically related to tripping may not be part of the Waterfront program.",
        },
    ],
    "Paddling Skills 5": [
        {
            "title": "Paddling Skills 5.1",
            "description": "I have participated in at least two two-day paddling trips.",
            "hint": "Scouts have participated in a minimum of two paddling trips that include overnight camping.",
        },
        {
            "title": "Paddling Skills 5.2",
            "description": "I have helped prepare an emergency plan and a float plan with a more experienced paddler for a two-day paddling trip.",
            "hint": "With the help of a more experienced Scout or Scouter, Scouts can assist in the completion of a trip emergency plan (as outlined on pages 10–11 in the Field Guide to Canadian Scouting).\nScouts can complete their own float plan that includes their intended route, dates, potential camping locations and intended return date.\nScouts can complete an emergency plan that identifies potential hazards they may encounter, a system for dealing with hazards and a method for contacting emergency services if required.",
        },
        {
            "title": "Paddling Skills 5.3",
            "description": "I have participated in creating a menu for an overnight trip.",
            "hint": "As a part of their Patrol, Scouts can contribute meal ideas for one each of breakfast, lunch and supper for a menu.",
        },
        {
            "title": "Paddling Skills 5.4",
            "description": "I can recognize the symptoms of weather-related injuries and know how to treat them.",
            "hint": "Scouts know the signs and symptoms and recommended treatment of weather-related injuries such as: hypothermia, hyperthermia, heat exhaustion, sun stroke, frost bite, etc.",
        },
        {
            "title": "Paddling Skills 5.5",
            "description": "I can demonstrate a self-rescue with my canoe or kayak.",
            "hint": "Scouts can swim a capsized watercraft to shore or paddle it (10 m) while sitting in it.",
        },
        {
            "title": "Paddling Skills 5.6",
            "description": "I can demonstrate how to pack my personal gear so that it will stay dry.",
            "hint": "Scouts can properly pack their personal gear so that it will stay dry during a paddling trip.\nThey have considered options such as ziploc bags and garbage bags or commercial dry bags and barrels, and can discuss the pros and cons of these options.",
        },
        {
            "title": "Paddling Skills 5.7",
            "description": "I have participated in a canoe-over-canoe rescue as both the rescuer and the one being rescued.",
            "hint": "In a swimming pool or in open water, Scouts can demonstrate the ability to complete a canoe-over-canoe rescue.",
        },
        {
            "title": "Paddling Skills 5.8",
            "description": "I can light a fire using no more than three matches.",
            "hint": "Scouts can demonstrate the ability to light a fire quickly and efficiently.",
        },
        {
            "title": "Paddling Skills 5.9",
            "description": "I have made a personal survival kit.",
            "hint": "Scouts can make a personal survival kit (including signaling devices, first aid items, food items, tinder and a fire starter) that is waterproof and buoyant.",
        },
        {
            "title": "Paddling Skills 5.10",
            "description": "I can explain Scouts Canada’s guidelines for paddle sports.",
            "hint": "Scouts have reviewed and can explain Scouts Canada’s Safety Procedures with particular attention to the Adventure and Swimming Standards.",
        },
        {
            "title": "Paddling Skills 5.11",
            "description": "I can assist Stage 3 paddlers to get back into their swamped watercraft.",
            "hint": "Using the watercraft-over-watercraft rescue technique, Scouts can assist Stage 3 paddlers to get back into their watercraft.",
        },
        {
            "title": "Paddling Skills 5.12",
            "description": "I can help paddlers at Stage 1 identify the parts of their paddle and their canoe or kayak.",
            "hint": "Scouts working at Stage 5 can teach paddlers at Stage 1 to identify the parts of their paddles and their canoes or kayaks.",
        },
        {
            "title": "Paddling Skills 5.13",
            "description": "I have completed and logged at least six days of backcountry paddling.",
            "hint": "Scouts have logged six days of backcountry paddling.\nThis can include a mix of day trips and overnight trips.",
        },
        {
            "title": "Paddling Skills 5.14",
            "description": "I have attained at least the Paddle Canada Canoe Basic Skills level of paddling certification.",
            "hint": "Contact Paddle Canada to determine this requirement.",
        },
    ],
    "Paddling Skills 6": [
        {
            "title": "Paddling Skills 6.1",
            "description": "I can load my canoe with personal and group gear for a multi-day trip.",
            "hint": "In loading a canoe, Scouts consider weight distribution, wind direction and ease of access for items that might be needed while on the water (e.g. throw bag, rain gear).",
        },
        {
            "title": "Paddling Skills 6.2",
            "description": "I have demonstrated several methods for ensuring that water is safe to drink.",
            "hint": "Scouts can demonstrate a variety of ways to purify water, such as filtration, chemical purification and boiling.",
        },
        {
            "title": "Paddling Skills 6.3",
            "description": "I have attained at least Paddle Canada Lake Canoe Skills Introduction Tandem certification (or provincial equivalent where applicable; see requirements).",
            "hint": "Contact Paddle Canada or other paddling certifying body to determine this requirement.\nExamples of provincial bodies include: ORCKA ( the Ontario Recreational Canoe and Kayak Assoc.), Paddle Alberta, Alberta Recreational Canoe Association, Recreational Canoeing Association. of BC, Canoe Kayak BC, Paddle Manitoba, Manitoba Recreational Canoeing Association, Canoe Kayak New Brunswick, Canoe New Brunswick, Paddle Newfoundland and Labrador, Newfoundland Canoe Association, NWT Canoeing Association, Canoe Kayak Nova Scotia, Canoe Nova Scotia, Canoe Kayak Saskatchewan, Saskatchewan Canoe Association, Yukon Canoe and Kayak Club, Manitoba Paddling Association, Canoe Kayak PEI, PEI Recreational Canoeing Association, Canoe Kayak Ontario, Association Quebecoise de canoe-kayak de vitesse, Federation Quebecoise du Canot Camping, etc.",
        },
        {
            "title": "Paddling Skills 6.4",
            "description": "I can create a gear list for the personal and group gear required on a four-day trip.",
            "hint": "Scouts can create a gear list for the personal and group gear required on a four-day trip, considering the size and nature of the group, the season and the destination.",
        },
        {
            "title": "Paddling Skills 6.5",
            "description": "I can explain the features of a good campsite on a waterway.",
            "hint": "Scouts can explain the importance of tent locations (including slope of land/drainage), safe entry and exit to water, absence of dead branches overhead/standing trees, suitable and appropriate location for cat hole for human waste, etc.",
        },
        {
            "title": "Paddling Skills 6.6",
            "description": "I know how to find out the backcountry camping regulations in the area where I will be travelling.",
            "hint": "Scouts can explain that regulations can be found by consulting websites, park offices and local land managers.",
        },
        {
            "title": "Paddling Skills 6.7",
            "description": "I can explain how to deal with waste while traveling in the backcountry, including greywater, solid waste, food scraps and human waste.",
            "hint": "Scouts can explain what waste needs to be packed out and what waste can be disposed of in the backcountry, and how the former can be responsibly disposed-of.",
        },
        {
            "title": "Paddling Skills 6.8",
            "description": "I can read and understand a topographical map, and can use it and a compass to tell where I am and where I am going while on a canoe trip.",
            "hint": "At any time during a paddle trip, Scouts can establish on a map where they have traveled from, where they are and where they are going to.",
        },
        {
            "title": "Paddling Skills 6.9",
            "description": "I can recognize conditions that may precede bad weather.",
            "hint": "Scouts know that a few elements to consider are: sky and cloud conditions, change in wind direction or speed and humidity.",
        },
        {
            "title": "Paddling Skills 6.10",
            "description": "I know the limits of weather conditions that are safe to paddle in.",
            "hint": "Scouts know that they need to consider wind, waves, tides, current and precipitation before and during a paddling outing.",
        },
        {
            "title": "Paddling Skills 6.11",
            "description": "I have completed and logged at least eight days of backcountry canoe tripping.",
            "hint": "From Stage 6 onwards, tripping will normally take place in backcountry areas that are: not accessible by car, have limited communication options (no cell coverage) and require two hours or more to reach assistance if it is needed.",
        },
        {
            "title": "Paddling Skills 6.12",
            "description": "I have taught at least one paddling skill, one paddling safety element and one paddling knowledge item to paddlers working on Stages 1–4.",
            "hint": "This can be accomplished over time and does not have to happen at one outing.",
        },
        {
            "title": "Paddling Skills 6.13",
            "description": "I have explained the seven principles of Leave No Trace to a Stage 4 paddler.",
            "hint": "Scouts should know the principles without having to refer to written notes.",
        },
        {
            "title": "Paddling Skills 6.14",
            "description": "I have kept a journal of my canoe excursions that includes both details of the trip and my personal reflections.",
            "hint": "Readings from the journal should be shared with the Patrol.",
        },
        {
            "title": "Paddling Skills 6.15",
            "description": "With my paddling team, I can plan a healthy menu for our canoe adventure and help prepare the meals we have planned.",
            "hint": "Scouts can plan a healthy menu for a canoe adventure, considering the proper amount of calories, food allergies and preferences.",
        },
        {
            "title": "Paddling Skills 6.16",
            "description": "I can explain how I can access emergency assistance while in the backcountry.",
            "hint": "Communication devices include: SPOT (GPS emergency communicator), satellite phone, radios, InReach, PLB and cell phone where the service is reliable.",
        },
        {
            "title": "Paddling Skills 6.17",
            "description": "I have completed at least one paddling trip that is four days, 50 km, has a minimum of three different campsites and includes portages.",
            "hint": "This trip can be with or not with a Scout group.",
        },
    ],
    "Paddling Skills 7": [
        {
            "title": "Paddling Skills 7.1",
            "description": "I can efficiently and safely carry my canoe and my gear across a portage of a least 700 metres.",
            "hint": "Can be accomplished as a tandem carry with another member of the team.",
        },
        {
            "title": "Paddling Skills 7.2",
            "description": "I have attained a minimum of Paddle Canada Lake Canoe Skills Intermediate Tandem level certification.",
            "hint": "Evidence of this certification is to be presented to confirm completion of this Stage.",
        },
        {
            "title": "Paddling Skills 7.3",
            "description": "I have attained a minimum of Paddle Canada Moving Water Canoe Skills Introduction Tandem certification.",
            "hint": "Evidence of this certification is to be presented to confirm completion of this Stage.",
        },
        {
            "title": "Paddling Skills 7.4",
            "description": "I always wear an approved paddling helmet when I paddle in rapids.",
            "hint": "Scouts can demonstrate this practice.",
        },
        {
            "title": "Paddling Skills 7.5",
            "description": "I can explain the relative benefits of various types of canoe materials and designs.",
            "hint": "Scouts can explain these benefits to a Patrol.",
        },
        {
            "title": "Paddling Skills 7.6",
            "description": "I know how to outfit a canoe for safety and comfort.",
            "hint": "Scouts can describe how to outfit a canoe for safety and comfort, listing features including: kneeling pads, painters, yoke, tie downs, air bags and spray skirts.",
        },
        {
            "title": "Paddling Skills 7.7",
            "description": "I know how to use basic tripping technology and understand the pros and cons of the devices I use.",
            "hint": "This technology includes: satellite phone, GPS and SPOT communicator.",
        },
        {
            "title": "Paddling Skills 7.8",
            "description": "I can show how and why the way I load my canoe will be different for different water conditions.",
            "hint": "Scouts can demonstrate this skill, considering trim for wind direction and current.",
        },
        {
            "title": "Paddling Skills 7.9",
            "description": "I understand the food requirements for canoe trippers and have prepared a nutritious and delicious menu for a multiday canoe trip.",
            "hint": "Scouts can assist with creating a menu and cooking a meal.",
        },
        {
            "title": "Paddling Skills 7.10",
            "description": "I can use several different methods for cooking.",
            "hint": "Scouts can demonstrate several different methods for cooking, including: fire, gas stove, Dutch oven, solar and reflector oven.",
        },
        {
            "title": "Paddling Skills 7.11",
            "description": "I have taught at least one paddling skill, one safety element and one knowledge item to paddlers working on Stage 4 or Stage 5.",
            "hint": "Not required to be taught all at one outing.",
        },
        {
            "title": "Paddling Skills 7.12",
            "description": "I have participated in 12 days of canoe tripping at Stage 7 and recorded the information in my trip log.",
            "hint": "Log book should be available as evidence of completed requirement.",
        },
        {
            "title": "Paddling Skills 7.13",
            "description": "I have completed a canoe trip of six days’ duration, 100 kilometres in distance. The trip included four or more campsites, and any number of portages or swifts of moving water (Class 1 or Class 2).",
            "hint": "Log book should be available as evidence of completed requirement.",
        },
        {
            "title": "Paddling Skills 7.14",
            "description": "With my team, I have developed a hazard assessment and risk control plan detailing how we will deal with injuries, illness, loss of equipment and other potential emergencies on our trip.",
            "hint": "Plan should be in written form and presented to the Patrol.",
        },
        {
            "title": "Paddling Skills 7.15",
            "description": "With my team, I have developed a float plan for my canoe trip.",
            "hint": "Plan should be in written form and presented to the Patrol.",
        },
        {
            "title": "Paddling Skills 7.16",
            "description": "I know what items should be in a first aid kit for backcountry travel as per Transport Canada regulations.",
            "hint": "Scouts should be able to go through the first aid kit and explain the items and the use of each.",
        },
        {
            "title": "Paddling Skills 7.17",
            "description": "I have attained a minimum of standard first aid training from an accredited agency. Standard wilderness first aid is strongly recommended.",
            "hint": "Any national or provincial first aid certification body is appropriate.",
        },
        {
            "title": "Paddling Skills 7.18",
            "description": "With my team, I can plan all the details for an overnight canoe trip and have evaluated the trip afterwards to ensure that our planning was complete and appropriate.",
            "hint": "Planning details should include:\n• knowing the area to be paddled in\n• preparing a menu and arranging for the food and supplies\n• preparing a float plan and emergency plan\n• ensuring all required permissions have been attained\n• organizing gear and equipment\nPost trip evaluation should examine what went right, what went wrong, and how to improve for the next trip.",
        },
    ],
    "Paddling Skills 8": [
        {
            "title": "Paddling Skills 8.1",
            "description": "I can plan and carry out a backcountry canoe trip with my team of at least 14 days, 250 km, and a minimum of 11 different camp sites.",
            "hint": "The trip will include portages and Class 2 moving water.\nScouts need to complete their moving water course (as per Paddling 8.4) and an advanced wilderness first aid course (as per Paddling 8.10) before this extended trip.",
        },
        {
            "title": "Paddling Skills 8.2",
            "description": "I can inspect a rapid to determine the best lines for running it.",
            "hint": "The inspection of rapids should be conducted from the shoreline wherever possible.",
        },
        {
            "title": "Paddling Skills 8.3",
            "description": "I can recognize a rapid that is beyond my skill level to run.",
            "hint": "Scouts can recognize and describe a rapid that is beyond the limits of their own skills.",
        },
        {
            "title": "Paddling Skills 8.4",
            "description": "I have attained Paddle Canada Moving Water Canoe Skills Intermediate Tandem certifications.",
            "hint": "Contact Paddle Canada to arrange for this certification.",
        },
        {
            "title": "Paddling Skills 8.5",
            "description": "I have completed and logged at least 25 days of canoe tripping at Stage 8.",
            "hint": "Log book should be available as evidence of completed requirement.",
        },
        {
            "title": "Paddling Skills 8.6",
            "description": "I have successfully completed a Paddle Canada Waterfront Canoeing Instructor course.",
            "hint": "Contact Paddle Canada to arrange for this certification.",
        },
        {
            "title": "Paddling Skills 8.7",
            "description": "While on my extended trip, I have been the designated trip leader for at least one day (Two Scouts—but not more than two—may share the trip leader role).",
            "hint": "Scouts must to able to identify the responsibilities of a trip leader including:\n• responsible for safety of the trip\n• ultimate maker of safety and navigation decisions\n• identifies the lead and sweep watercraft\n• aware of the potential risks and has the tools to address them (risk management)",
        },
        {
            "title": "Paddling Skills 8.8",
            "description": "I can rescue a capsized loaded canoe and get the swimmers to safety.",
            "hint": "Scouts must properly prioritize the rescue—people, watercraft, gear.\nPractice rescues should be completed in less than perfect conditions (eg. in rapids, in windy conditions, in cold water).",
        },
        {
            "title": "Paddling Skills 8.9",
            "description": "I can explain the responsibilities of a trip leader.",
            "hint": "See requirement 7 Stage 8.",
        },
        {
            "title": "Paddling Skills 8.10",
            "description": "I have successfully completed an advanced wilderness first aid course of at least 40 hours duration (80 hours preferred) with a certified accreditation agency (St. John Ambulance, Red Cross or equivalent).",
            "hint": "Scouts are to complete a wilderness first aid course prior to their extended trip.",
        },
        {
            "title": "Paddling Skills 8.11",
            "description": "I have assisted in teaching a paddling course to Stage 5 or Stage 6 paddlers.",
            "hint": "Scouts will work under the direction of an adult who is qualified to lead the course.",
        },
    ],
    "Paddling Skills 9": [
        {
            "title": "Paddling Skills 9.1",
            "description": "I have completed instructor-level certification in at least one Paddle Canada discipline.",
            "hint": "• tandem or solo lake paddling\n• tandem or solo moving water paddling\n• canoe tripping\nScouts are qualified to teach introductory or intermediate level skills courses in the chosen instructor level certification.",
        },
        {
            "title": "Paddling Skills 9.2",
            "description": "I have completed and logged at least 25 days of backcountry canoe tripping (which may include time spent leading trips for less experienced paddlers).",
            "hint": "Log book should be available as evidence of completed requirement.",
        },
        {
            "title": "Paddling Skills 9.3",
            "description": "I know and follow the Transport Canada requirements for guided canoe trips.",
            "hint": "Scouts must be aware of federal legislation governing human-powered watercraft, including the requirements for guided trips (primarily SOR 2010-91 part 3).\nUnder the definitions of the legislation, all trips with a designated leader are considered to be ‘guided’. Refer to www.laws-lois.justice.gc.ca/eng/regulations/SOR-2010-91/page-13.html#docCont",
        },
        {
            "title": "Paddling Skills 9.4",
            "description": "I have completed all necessary paperwork for leading a trip, including a float plan, an emergency plan and Scouts Canada requirements.",
            "hint": "Plan should be in written form and shared with the Patrol.",
        },
        {
            "title": "Paddling Skills 9.5",
            "description": "I have successfully completed a swift water rescue course.",
            "hint": "Scouts have successfully completed a swift water rescue course.\nScouts should complete this course prior to leading any trip that includes moving water.",
        },
        {
            "title": "Paddling Skills 9.6",
            "description": "I can lead a group of Stage 6 or Stage 7 paddlers on a multi-day excursion.",
            "hint": "Stage 9 Scouts will assist younger paddlers to plan for their trip and will accompany them during the paddle trip.\nThe Stage 9 Scout will ensure that the trip is properly equipped and has a healthy menu and the provisions to prepare it.\nScouts will help the younger trippers to create an emergency plan (complete with an evacuation process and communication systems) and will ensure that trip participants have the skills to do the trip safely.",
        },
        {
            "title": "Paddling Skills 9.7",
            "description": "I have taught at least two sanctioned Paddle Canada courses to Scouts working at Stage 5–8.",
            "hint": "Scouts must have the appropriate paddling certification(s) to teach these courses.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Paddling Skills badges and requirements"

    def handle(self, *args, **options):
        category = "paddling_skills"

        for badge_name, requirements in PADDLING_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Paddling Skills."))