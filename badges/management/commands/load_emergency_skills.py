from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


EMERGENCY_SKILLS_DATA = {
    "Emergency Skills 1": [
        {
            "title": "Emergency Skills 1.1",
            "description": "I have made my own personal first aid kit.",
            "hint": "Scout’s kit should contain:\n• a list of emergency numbers\n• gloves of my size\n• an emergency blanket\n• 5–10 adhesive bandages (e.g. Band-Aids™)\n• pencil and paper",
        },
        {
            "title": "Emergency Skills 1.2",
            "description": "I can demonstrate the basic approach to first aid.",
            "hint": "In a practice drill, Scouts can demonstrate:\n• checking the scene for dangers (and staying away from them)\n• checking the person who is ill or injured only if it safe to do so\n• calling an adult for help or calling 9-1-1 on the telephone\n• staying with the sick or injured person until help arrives",
        },
        {
            "title": "Emergency Skills 1.3",
            "description": "I can treat minor cuts or scrapes.",
            "hint": "Scouts can demonstrate:\n• gently cleaning the wound with soap and water\n• putting pressure on the wound if it is still bleeding\n• applying an adhesive bandage that covers the wound",
        },
        {
            "title": "Emergency Skills 1.4",
            "description": "I can be responsible for my own health.",
            "hint": "Scouts can explain:\n• drinking water during activities or when it is warm outside\n• wearing proper clothing for weather conditions\n• using sunscreen when playing out in the sun",
        },
        {
            "title": "Emergency Skills 1.5",
            "description": "I can be responsible for my own safety.",
            "hint": "Scouts know not to talk to or go anywhere with strangers.",
        },
        {
            "title": "Emergency Skills 1.6",
            "description": "I know my address and location in an emergency.",
            "hint": "Scouts can recite their own address and home phone number.",
        },
        {
            "title": "Emergency Skills 1.7",
            "description": "I know not to play with matches and lighters.",
            "hint": "Scouts can explain why it is not safe to play with matches and lighters.",
        },
        {
            "title": "Emergency Skills 1.8",
            "description": "I know how to spot things in my home that are not safe.",
            "hint": "Scouts can list a few items in the home that may be dangerous (for example, hot or sharp) to touch, such as stoves, barbecues, fireplaces, knives, tools, etc.",
        },
        {
            "title": "Emergency Skills 1.9",
            "description": "I know the different emergency services that are available, and how and when to call them and what to say.",
            "hint": "Scouts can recite the ‘911’ telephone number (if applicable in their community) and state the type of emergencies required for calling the number: police, fire, ambulance.\nScouts can make a simulated call to describe the help needed to a 911 operator.",
        },
        {
            "title": "Emergency Skills 1.10",
            "description": "I use the “buddy system” when outdoors.",
            "hint": "Scouts know to buddy-up with a friend during outdoor activities.",
        },
        {
            "title": "Emergency Skills 1.11",
            "description": "I can signal for help if needed when outdoors.",
            "hint": "Scouts know how to make themselves seen and heard for searchers.",
        },
        {
            "title": "Emergency Skills 1.12",
            "description": "I always tell an adult where I am going.",
            "hint": "Scouts can explain why they need to tell an adult in charge where they are going if leaving the adults with small groups or a buddy during an outdoor activity.",
        },
        {
            "title": "Emergency Skills 1.13",
            "description": "I carry a whistle and visible signal covering when I go out in the bush.",
            "hint": "Scouts carry a whistle and visible signal covering (e.g. bright orange garbage bag) with them when in an outdoor setting where they could become lost.",
        },
        {
            "title": "Emergency Skills 1.14",
            "description": "I know to “hug a tree” if lost, or to stay in one place if there are no trees.",
            "hint": "Scouts can demonstrate in a practice drill the technique of staying close to a tree and staying in one spot when lost.\nScouts can describe how they know that they are lost.\nScouts know to yell and whistle for help.\nScouts know to stay warm and dry if they can.\nScouts know to spread out visible items for searchers to see from the air.\nScouts know to eat food and drink water if they have these items.",
        },
        {
            "title": "Emergency Skills 1.15",
            "description": "I know how to be safe around a campfire.",
            "hint": "Scouts can state that are to stay a safe distance away from fire.\nScouts can state that they will not run and play in the area of the fire.\nScouts can state that they will not touch the fire without the help of a Scouter.\nScouts can state that they will not touch tools, such as an axe or saw, without proper training and supervision.\nScouts can state that they will not throw anything into the fire.",
        },
        {
            "title": "Emergency Skills 1.16",
            "description": "I know how to behave around wildlife.",
            "hint": "Scouts show a respect for wildlife and do not do anything to harm animals or their habitat.",
        },
    ],
    "Emergency Skills 2": [
        {
            "title": "Emergency Skills 2.1",
            "description": "I have added items to my own personal first aid kit, and I know how and when to use it.",
            "hint": "Scouts have added the following items to their first aid kits (made in Stage 1) and should be able to describe basic use of the materials in first aid situations:\n• 5–10 gauze pads\n• 1 roll of medical tape\n• triangular bandages\n• roller gauzes",
        },
        {
            "title": "Emergency Skills 2.2",
            "description": "I can keep myself safe in emergency situations.",
            "hint": "Scouts can describe what could be done by in some of the following emergency situations: house fire, earthquake, tornado, flooding, power outage, etc.",
        },
        {
            "title": "Emergency Skills 2.3",
            "description": "I can care for someone who has a minor burn.",
            "hint": "Scouts can describe and demonstrate minor burn care: cooling the burn with clean, cool water for at least 10 minutes, or until the burn is cool.",
        },
        {
            "title": "Emergency Skills 2.4",
            "description": "I have made a home escape plan with my family.",
            "hint": "Scouts, with help of their families, have made a home escape plan that could include the following:\n• fall & crawl in fire and smoke\n• two exits from every room\n• get out and stay out\n• a safe family meeting spot outside the home\n• what to do if a stranger is at the door",
        },
        {
            "title": "Emergency Skills 2.5",
            "description": "I know where the list of emergency telephone numbers is located in my home and I know how to call them.",
            "hint": "Scouts can verify where the emergency numbers are posted in a convenient location in their homes.",
        },
        {
            "title": "Emergency Skills 2.6",
            "description": "I know how to stop, drop and roll if my clothes are on fire.",
            "hint": "Scouts can demonstrate how to stop, drop and roll.",
        },
        {
            "title": "Emergency Skills 2.7",
            "description": "I can recognize a warning label on a product and know to leave the product alone.",
            "hint": "Scouts can identify the four hazard symbol pictures (explosive, corrosive, flammable, poison) on a number of household products.",
        },
        {
            "title": "Emergency Skills 2.8",
            "description": "I can check for dangers at an emergency situation.",
            "hint": "Scouts can describe how they should look for potential hazards.",
        },
        {
            "title": "Emergency Skills 2.9",
            "description": "I always follow directions from a Scouter.",
            "hint": "Scouts demonstrate the ability to follow Scouters’ directions to keep safe, and can explain why it is important to follow directions from an adult.",
        },
        {
            "title": "Emergency Skills 2.10",
            "description": "I can direct a responder to a location where help is needed.",
            "hint": "Scouts can lead or direct responders to the specific location where help is needed.\nA practice drill can be used to show this skill.",
        },
        {
            "title": "Emergency Skills 2.11",
            "description": "I know the hazards of water sources in my local area.",
            "hint": "Scouts can explain the dangers of getting too close to creeks, streams, rivers, lakes and other bodies of water in all seasons.\nScouts know to have a responsible adult present when swimming and to never swim or play in water alone.",
        },
        {
            "title": "Emergency Skills 2.12",
            "description": "I wear my helmet when using my bicycle, skateboard or scooter.",
            "hint": "Scouts consistently wear a properly fitted helmet when riding bicycle, skateboard or scooter",
        },
        {
            "title": "Emergency Skills 2.13",
            "description": "I can dress myself appropriately for the weather.",
            "hint": "Scouts consistently demonstrate wearing the appropriate clothing for all weather conditions.",
        },
        {
            "title": "Emergency Skills 2.14",
            "description": "I know some of the wild animals in my area and how to be safe around them.",
            "hint": "Scouts know what wildlife could be dangerous in the area and how best to react when they come in to contact with these animals.",
        },
        {
            "title": "Emergency Skills 2.15",
            "description": "I can find a safe place in bad weather.",
            "hint": "Scouts can describe the best place to go in case of a thunder and lightning storm, rain, snow, cold, heat, and/or severe wind.",
        },
    ],
    "Emergency Skills 3": [
        {
            "title": "Emergency Skills 3.1",
            "description": "I can perform first aid for large wounds.",
            "hint": "Scouts can demonstrate proper care for large wounds:\n• applying pressure to the wound with a clean dressing (such as gauze)\n• securing the dressing with a bandage such as roller gauze or a triangular bandage\n• demonstrate the use of the Scout neckerchief as a triangular bandage\n• if the bleeding does not stop, applying more dressing and bandages and seeking additional help",
        },
        {
            "title": "Emergency Skills 3.2",
            "description": "I can perform first aid for nosebleeds.",
            "hint": "Scout can demonstrate proper care for a common nosebleed including:\n• pinching the nose\n• tilting the head forward\n• keeping the nose pinched for at least 10 minutes\n• seeking help if the bleeding does not stop after 10 minutes of pressure",
        },
        {
            "title": "Emergency Skills 3.3",
            "description": "I can perform first aid for someone who is choking.",
            "hint": "Scouts can demonstrate proper care for a choking victim according to the latest methods taught by a first aid organization.",
        },
        {
            "title": "Emergency Skills 3.4",
            "description": "I know the signs and symptoms of shock and how to treat shock.",
            "hint": "Scouts can explain the signs and symptoms of shock:\n• pale, cool, sweaty skin\n• fast and shallow breathing\n• light-headedness\n• increased heart rate\n• confusion\nScout can demonstrate the proper care for shock:\n• putting the person in a comfortable position\n• keeping their body temperature normal (a blanket for someone who is cold, or a shady place for someone who is warm)\n• getting help and keeping the person calm",
        },
        {
            "title": "Emergency Skills 3.5",
            "description": "I can comfort someone who is ill or injured.",
            "hint": "Scouts can demonstrate the proper care, including:\n• talking calmly with the person\n• keeping the person comfortable\n• treating for shock\n• reassuring the person that help is on the way\n• staying with the person unless they need to go somewhere to call for more help",
        },
        {
            "title": "Emergency Skills 3.6",
            "description": "I can show how to lock, unlock and secure all windows, doors and other entryways into my home.",
            "hint": "Scouts can demonstrate how to lock, unlock and secure windows, doors and entryways in their homes.",
        },
        {
            "title": "Emergency Skills 3.7",
            "description": "I know the dangers of playing on or near train tracks, trestles, crossings and train yards.",
            "hint": "Scouts can explain the dangers of playing near train areas.",
        },
        {
            "title": "Emergency Skills 3.8",
            "description": "I know the dangers of touching power lines with a stick or ladder; climbing on electrical power poles, towers and substations; and poking electrical outlets.",
            "hint": "Scouts can explain the hazards of such activities.",
        },
        {
            "title": "Emergency Skills 3.9",
            "description": "I know the dangers of playing around storm sewers, construction sites, garbage dumps or dumpsters, ice-covered water or water areas, dams, vacant buildings, farm machinery, quarries, old wells and unfriendly animals.",
            "hint": "Scouts can explain the dangers of playing near listed dangerous areas.",
        },
        {
            "title": "Emergency Skills 3.10",
            "description": "I have made a list of emergency numbers (such as police, fire, ambulance and poison control) and posted it by a telephone in my home.",
            "hint": "Scouts can verify the emergency numbers are posted in a convenience location in their homes.",
        },
        {
            "title": "Emergency Skills 3.11",
            "description": "I know how to help create an escape plan for a building or activity location in case of fire.",
            "hint": "Scouts (working with friends) can make and practise a fire escape plan for a classroom, meeting hall or similar location.",
        },
        {
            "title": "Emergency Skills 3.12",
            "description": "I know the “Rules of the Road” for safe bicycling.",
            "hint": "Scouts can explain and demonstrate safe bicycle riding.",
        },
        {
            "title": "Emergency Skills 3.13",
            "description": "I can identify some of the hazardous plants in my area, and those I may encounter when travelling in Canada.",
            "hint": "Scouts can identify in nature or describe some poisonous/hazardous plants local to their area (e.g. poison ivy, poison sumac) and know their hazards (e.g causes rash when touched, vomiting when ingesting berries) and can demonstrate how to avoid their toxic elements.",
        },
        {
            "title": "Emergency Skills 3.14",
            "description": "I know some of the international distress signals and when to use them.",
            "hint": "Scouts can demonstrate two or three international distress signals for a variety of situations (such as lost on land or on water).",
        },
        {
            "title": "Emergency Skills 3.15",
            "description": "I can treat bee stings and reactions to some local plants (such as stinging nettle).",
            "hint": "Scouts can describe the treatment for a bee sting and exposure to poisonous plants.",
        },
    ],
    "Emergency Skills 4": [
        {
            "title": "Emergency Skills 4.1",
            "description": "I can place someone into the recovery (safe airway) position.",
            "hint": "Scouts can demonstrate placing someone in the recovery position, including care for an unconscious person.",
        },
        {
            "title": "Emergency Skills 4.2",
            "description": "I can provide care for someone who is poisoned.",
            "hint": "Scouts can explain:\n• not giving the person anything to eat or drink\n• finding out what the poison was\n• calling the local Poison Control number or 9-1-1",
        },
        {
            "title": "Emergency Skills 4.3",
            "description": "I know the first aid treatment for dirt in an eye.",
            "hint": "Scouts can explain:\n• not rubbing the eye\n• blinking fast\n• if there is still something in the eye, flushing the eye under running water (with the affected eye towards the ground)\n• getting medical assistance quickly if material remains in the eye",
        },
        {
            "title": "Emergency Skills 4.4",
            "description": "I know what goes into a home first aid kit.",
            "hint": "Scouts can describe the items in the kit to their Patrols.",
        },
        {
            "title": "Emergency Skills 4.5",
            "description": "I can help reduce the risk of fire and burns in the home.",
            "hint": "Scouts can check that:\n• paint, paper, rags and flammables are away from heat\n• hot water tank is set below 54°C (130°F) to help prevent scalding\n• stove-top pot handles are turned away from the front of the stove",
        },
        {
            "title": "Emergency Skills 4.6",
            "description": "I can show how to test and care for a smoke alarm.",
            "hint": "Scouts will demonstrate with a smoke alarm.",
        },
        {
            "title": "Emergency Skills 4.7",
            "description": "I can manage a home emergency situation.",
            "hint": "Scouts can explain what to do if:\n• the lights go out\n• a fuse blows or circuit breaker trips\n• a water pipe bursts\n• they smell natural gas\n• a drain backs up\n• a fire or carbon monoxide alarm goes off",
        },
        {
            "title": "Emergency Skills 4.8",
            "description": "I know where my local community emergency shelter is located or how to find out where a community emergency shelter is located if one is needed.",
            "hint": "Scouts can report the local community emergency shelter information to their Patrols.",
        },
        {
            "title": "Emergency Skills 4.9",
            "description": "I know what is in our group first aid kit and know how to use the kit.",
            "hint": "Scouts can take out the group first aid kit before an outing and review the contents with the outing group.",
        },
        {
            "title": "Emergency Skills 4.10",
            "description": "I can care for my feet while outdoors.",
            "hint": "Scouts know how to;\n• detect a pre-blister hot spot on a foot\n• treat a blister\n• identify and prevent trench foot\n• select the proper footwear for the activity\n• keep toe nails clipped before hiking\n• hike in dry socks and footwear",
        },
        {
            "title": "Emergency Skills 4.11",
            "description": "I can explain how to prevent and treat heat and cold injuries.",
            "hint": "Scouts can describe the heat and cold injuries encountered when outdoors and the behaviour, equipment, medical and shelter plans to avoid these.",
        },
        {
            "title": "Emergency Skills 4.12",
            "description": "I know how to treat and report (if appropriate) insect and animal bites.",
            "hint": "Scouts can explain what types of insect and animal bites could happen when outdoors, what the first aid treatment should be and what the follow-up plan should be (if needed).",
        },
    ],
    "Emergency Skills 5": [
        {
            "title": "Emergency Skills 5.1",
            "description": "I have successfully completed an Emergency First Aid and CPR (Level A) course from a recognized provider.",
            "hint": "Recognized providers include:\n• the Canadian Red Cross Society\n• St. John Ambulance\n• the Lifesaving Society\n• the Heart and Stroke Foundation of Canada\n• Canadian Ski Patrol",
        },
        {
            "title": "Emergency Skills 5.2",
            "description": "I can correctly record everything that has happened at the scene of the accident.",
            "hint": "Scouts can demonstrate (in a practice drill) a written record of:\n• who was ill/injured\n• when did this happen\n• where did this happen\n• what happened\n• what treatment was done\n• what additional help did you get",
        },
        {
            "title": "Emergency Skills 5.3",
            "description": "I know the rules and why they are important for a home pool, community pool or a body of water used for swimming.",
            "hint": "Scouts can explain the pool rules.",
        },
        {
            "title": "Emergency Skills 5.4",
            "description": "I can demonstrate how to safely use and care for a barbecue.",
            "hint": "Scouts will demonstrate, by cooking a barbecue meal for their Patrol mates, how to safely use and care for the appliance.",
        },
        {
            "title": "Emergency Skills 5.5",
            "description": "I have assisted in providing training to others in aspects of emergency aid.",
            "hint": "Scouts are able to assist with emergency aid training at a Scout meeting or camp.",
        },
        {
            "title": "Emergency Skills 5.6",
            "description": "I know how to deal with an incident, injury or illness in a remote outdoor location and how to summon help.",
            "hint": "Scouts can explain how to:\n• secure the site and individual(s) from further hazard and harm\n• care for the victim(s) and rest of the group\n• make and activate a plan to raise an alarm for assistance\n• begin an evacuation or establish a treatment site",
        },
        {
            "title": "Emergency Skills 5.7",
            "description": "I know how and when to use flares, mirrors, horns and other long-distance signalling devices.",
            "hint": "Scouts can explain these devices, and the advantages and disadvantages of each.",
        },
        {
            "title": "Emergency Skills 5.8",
            "description": "I know how to build a stretcher from improvised materials.",
            "hint": "Scouts can build a stretcher from items brought along on a typical outdoor activity day.",
        },
        {
            "title": "Emergency Skills 5.9",
            "description": "I can use a compass or a GPS device to find direction and travel to a desired location.",
            "hint": "Scouts can lead a navigational exercise in the field that includes the following:\n• Scouts can read a map and locate themselves on a map\n• Scouts can navigate to any fixed point on a map and do so with a safe and effective route plan\n• Scouts can establish an evacuation route on a map",
        },
    ],
    "Emergency Skills 6": [
        {
            "title": "Emergency Skills 6.1",
            "description": "I have participated in and successfully completed a Standard First Aid with CPR (Level C) course or a Marine Basic First Aid with CPR (Level C) from a recognized provider.",
            "hint": "Recognized providers include:\n• the Canadian Red Cross Society\n• St. John Ambulance\n• the Lifesaving Society\n• the Heart and Stroke Foundation of Canada\n• Canadian Ski Patrol",
        },
        {
            "title": "Emergency Skills 6.2",
            "description": "I have acted as an emergency response/preparedness resource on at least one Scouting activity.",
            "hint": "Scouts can participate as a resource on campout, jamboree or any other event where a large group or Patrol is present.",
        },
        {
            "title": "Emergency Skills 6.3",
            "description": "I can explain the different classes of fires and how to use different types of fire extinguishers.",
            "hint": "Scouts can explain the fire classes and fire extinguisher type to a Patrol.",
        },
        {
            "title": "Emergency Skills 6.4",
            "description": "I have met with a member of a community-based emergency response team and discussed his or her role and responsibilities in my community (e.g. search and rescue, police, fire, ambulance or coast guard).",
            "hint": "Scouts can arrange for a community-based emergency response team member to visit a Scout meeting or for a Patrol to travel and meet with the response team member.",
        },
        {
            "title": "Emergency Skills 6.5",
            "description": "I can identify common poisonous plants in my area and know how to treat exposure and symptoms.",
            "hint": "Scouts can demonstrate their poisonous plant knowledge to a group of Scouts.",
        },
        {
            "title": "Emergency Skills 6.6",
            "description": "I have acted as a member of a first aid team on at least one outdoor activity.",
            "hint": "Scouts can be a designated first aid provider on a Scout outing for a minimum of four days. This service does not have to be at one outing.",
        },
    ],
    "Emergency Skills 7": [
        {
            "title": "Emergency Skills 7.1",
            "description": "I have successfully completed an outdoor curriculum first aid course.",
            "hint": "Scouts can attend one of the following:\n• Advanced Wilderness & Remote First Aid course (Canadian Red Cross)\n• Wilderness First Aid Level III course (St. John Ambulance)\n• Wilderness First Responder — from commercial vendor\n• or equivalent certification level from a recognized provider",
        },
        {
            "title": "Emergency Skills 7.2",
            "description": "I respond to emergency situations and follow best practices for first aid, as per whatever first Aid certification I hold.",
            "hint": "Scouts can maintain their first aid skill and certification competence by:\n• attending a renewal course\n• participating in first aid scenarios\n• being a first aider at events\n• reviewing course manuals",
        },
        {
            "title": "Emergency Skills 7.3",
            "description": "I have prepared and maintain a 72-hour home emergency kit.",
            "hint": "Scouts should create this emergency kit with their families.",
        },
        {
            "title": "Emergency Skills 7.4",
            "description": "I have filled out Scouts Canada’s Outdoor Activity application for at least three Scout group events.",
            "hint": "Scouts are to ensure they consider participants, including Scouters, are:\n• in the Right Place,\n• at the Right Time,\n• with the Right People\n• and with the Right Equipment",
        },
        {
            "title": "Emergency Skills 7.5",
            "description": "I have acted as a first aider on at least four occasions during a single-day group outing or two standard weekend camps.",
            "hint": "Scouts duties include preparing the first aid kit, treating any injuries and properly following-up on any incidents.",
        },
        {
            "title": "Emergency Skills 7.6",
            "description": "I have acted as an emergency preparedness and management support for at least one weekend standing camp or two area events.",
            "hint": "Scouts in this role are to be under the direct supervision of an adult Scouter.",
        },
        {
            "title": "Emergency Skills 7.7",
            "description": "I can use a variety of communication devices effectively in an emergency situation. I have participated in a session on correct use of radio communications and protocols (ARES).",
            "hint": "Scouts know how to use a variety of emergency communication devices, such as:\n• satellite phone,\n• Spot device,\n• InReach device,\n• Personal Locator Beacon,\n• VHF/UHF/CB radio,\n• marine radio,\n• Emergency Position Indicator Radio Beacon (EPIRB).",
        },
        {
            "title": "Emergency Skills 7.8",
            "description": "I have met with a member of a community-based search and rescue emergency response team and discussed his or her role and responsibilities in my community.",
            "hint": "Scouts have arranged for this response team member to meet with a Scout Group.",
        },
        {
            "title": "Emergency Skills 7.9",
            "description": "I have participated in a wilderness search and rescue operation (training or real).",
            "hint": "Scouts can spend at the minimum of one days’ time in a SAR operation.",
        },
        {
            "title": "Emergency Skills 7.10",
            "description": "I know what specialized equipment is required in my field first aid kit based upon my activities, skill level and certification, and I know how to use and care for the equipment.",
            "hint": "Scouts can present their kit to their Patrol for review.",
        },
    ],
    "Emergency Skills 8": [
        {
            "title": "Emergency Skills 8.1",
            "description": "I have successfully completed an advanced first aid course.",
            "hint": "Scouts can choose from the following courses:\n• First Responder with CPR Level HCP (Canadian Red Cross Society),\n• Advanced Medical First Responder with CPR Level HCP (St. John Ambulance),\n• Marine Advanced First Aid (as recognized by Transport Canada),\n• Advanced First Aid (as recognized by the Province of Alberta), or equivalent nationally-recognized certificate, or higher qualification or\n• hold a current certificate from a recognised body in Emergency/Disaster Response such as VERC, TeenCERT, Ontario Volunteer Emergency Response Team",
        },
        {
            "title": "Emergency Skills 8.2",
            "description": "I have successfully completed a non-first aid certification course in an area of my personal interest within emergency aid.",
            "hint": "Scouts can take a course in the following:\n• Aquatic Lifesaving and Lifeguarding\n• Swiftwater Rescue\n• High Angle Rescue\n• Boat Rescue\n• Ice Safety, Glacier/Avalanche Safety\n• Search and Rescue\n• Canadian Ski Patrol Training\n• SCUBA Rescue\n• TeenCERT Train-the-Trainer, or\n• Emergency Management Ontario’s BEM-100 [Basic Emergency Management Certificate] or local provincial equivalent or\n• A training or qualification that can be approved by my Section Leadership Team as meeting this non-first aid certification course requirement.",
        },
        {
            "title": "Emergency Skills 8.3",
            "description": "As part of taking a non-first aid certification course, I can improve my risk management skills.",
            "hint": "Scouts can assess and manage risk in various and constantly changing situations.\nScouts can constantly assess hazardous situations as they arise and take measures to limit risk.",
        },
        {
            "title": "Emergency Skills 8.4",
            "description": "I can safely perform basic emergency repairs on an automobile, such as changing a flat tire or jump-starting a car.",
            "hint": "Scouts can explain a circle check on a vehicle.\nScouts can instruct younger Scouts (16 years and older) on how to jump-start a car and change a tire.",
        },
        {
            "title": "Emergency Skills 8.5",
            "description": "I can start and maintain a consumer emergency generator.",
            "hint": "Scouts can follow the manufacturer’s instructions for the safe start and maintenance of an emergency generator.",
        },
        {
            "title": "Emergency Skills 8.6",
            "description": "I have taught a group of people the importance of, and what should be in, a 72-hour home preparedness kit.",
            "hint": "Scouts can lead a session for younger Scouts or another group on the contents and use of a 72-hr home preparedness kit.",
        },
        {
            "title": "Emergency Skills 8.7",
            "description": "I know and can describe the steps required to triage in a mass casualty incident (MCI).",
            "hint": "Scouts can practise this skill in an incident scenario.",
        },
        {
            "title": "Emergency Skills 8.8",
            "description": "I have met with a member of underwater community-based emergency response search team and discussed his or her role and responsibilities in my community.",
            "hint": "Scouts will arrange for this emergency response search team member to meet a Scout Group.",
        },
        {
            "title": "Emergency Skills 8.9",
            "description": "I can create a trip plan with detailed risk management strategies for an activity with my group.",
            "hint": "Scouts will have the plan and strategies approved by a Scouter or Group Commissioner.",
        },
        {
            "title": "Emergency Skills 8.10",
            "description": "I know what equipment needs to be in a first aid kit for an activity of at least one weekend in length in the wilderness.",
            "hint": "Scouts will demonstrate the kit to their Patrols.",
        },
        {
            "title": "Emergency Skills 8.11",
            "description": "I have been the responsible first aider for an outdoor expedition of at least three nights.",
            "hint": "Scouts are to have the appropriate first aid certification for this outing.",
        },
        {
            "title": "Emergency Skills 8.12",
            "description": "I can purify water in a safe manner.",
            "hint": "Scouts can purify water from a natural source.",
        },
        {
            "title": "Emergency Skills 8.13",
            "description": "I have built an emergency shelter in the wilderness with minimal equipment, and I have slept in it overnight.",
            "hint": "Scouts can build a shelter with whatever they can carry in a backpack; the shelter is to be precipitation-proof.",
        },
        {
            "title": "Emergency Skills 8.14",
            "description": "I can lead a team at least 100m over wilderness terrain in transporting a patient with an injury who cannot walk by his or her own power.",
            "hint": "Scouts can complete this task as part of an outdoor rescue scenario.",
        },
        {
            "title": "Emergency Skills 8.15",
            "description": "I know the limitations in a wilderness setting when calling for medical evacuation transport.",
            "hint": "Scouts can explain how different locations and terrain require different means of transport.",
        },
        {
            "title": "Emergency Skills 8.16",
            "description": "I know what preparations should be made when calling a medical helicopter.",
            "hint": "Scouts can explain the landing requirements, landing site safety and victim packaging requirements.",
        },
        {
            "title": "Emergency Skills 8.17",
            "description": "I can describe and demonstrate proper use of fire extinguishers (or other tools or methods for extinguishing fires).",
            "hint": "Scouts can speak about extinguish cooking fires, grassfire, electrical fires, etc.",
        },
    ],
    "Emergency Skills 9": [
        {
            "title": "Emergency Skills 9.1",
            "description": "I have successfully completed Instructor training in the area of my personal interest within emergency aid.",
            "hint": "Scouts can choose instructor training in any of the flowing:\n• First Aid\n• Aquatic Lifesaving and Lifeguarding\n• Swiftwater Rescue\n• High Angle Rescue,\n• Boat Rescue\n• Ice Safety, Glacier/Avalanche Safety\n• Search and Rescue\n• Canadian Ski Patrol Training\n• SCUBA Rescue\n• TeenCERT Train-the-Trainer\n• Emergency Management Ontario’s BEM-100 [Basic Emergency Management Certificate] or local provincial equivalent or\n• Any training or qualification approved by the Section Leadership Team as meeting the instructor training requirement.",
        },
        {
            "title": "Emergency Skills 9.2",
            "description": "I have used my instructor qualification to teach Scouts or another community group the course’s curriculum as permitted by my instructor certificate.",
            "hint": "Scouts can teach an emergency skill based upon the qualifications permitted by instructor’s certificate.",
        },
        {
            "title": "Emergency Skills 9.3",
            "description": "I can provide immediate treatment and deal with complicated emergency situations.",
            "hint": "Scouts can demonstrate this competency to the Section Leadership Team by either:\n• presenting a case study of a situation the Scout has been in that was complicated and in the Scout’s personal interest in Emergency Aid.\nor\n• participating in scenarios relevant to the Scout’s personal interest in Emergency Aid that are complicated in nature and include an personal and group evaluation component.",
        },
        {
            "title": "Emergency Skills 9.4",
            "description": "I have completed a minimum of 75 hours of volunteer first aid service in addition to those hours already used to complete an earlier stage.",
            "hint": "Scouts can perform this service at a Scout or community event approved by the Section Leadership Team.",
        },
        {
            "title": "Emergency Skills 9.5",
            "description": "I have participated in the preparation and implementation of an Emergency Response Plan for an Area event lasting five days or involving at least 400 participants.",
            "hint": "Scouts can participate in the planning and implementation of an Emergency Response Plan for a large Scouting event that is five days in length or has over 400 participates for a shorter period.",
        },
        {
            "title": "Emergency Skills 9.6",
            "description": "I have provided Emergency Skills mentorship to a Stage 7 or Stage 8 Emergency Skills Scout.",
            "hint": "Scouts can provide instructions and assistance with Scouts working on Stage 7 or 8 of Emergency Skills.",
        },
        {
            "title": "Emergency Skills 9.7",
            "description": "I have met with a member of community-based emergency air search response team and discussed his or her role and responsibilities in my community.",
            "hint": "Scouts can arrange for a response team member to meet with a Scout group.",
        },
        {
            "title": "Emergency Skills 9.8",
            "description": "I can assemble, display and describe winter and summer survival kits, and explain how to use them.",
            "hint": "Scouts can help younger Scouts assemble their own survival kits.",
        },
        {
            "title": "Emergency Skills 9.9",
            "description": "I can explain to another group (for example, Wood Badge participants) what to do if you become lost in the wilderness.",
            "hint": "Scouts can teach a lost in the woods lesson to a younger group.",
        },
        {
            "title": "Emergency Skills 9.10",
            "description": "I have participated in a multi-casualty emergency exercise.",
            "hint": "Scouts can contact the local Search and Rescue groups to arrange for this participation. Emergency Management exercises are required by Provincial Emergency Management Acts.",
        },
        {
            "title": "Emergency Skills 9.11",
            "description": "I know the health risks, and possible ways to mitigate the risks, when travelling to a part of the world I have not before visited.",
            "hint": "Scouts can explain what governmental and non-governmental sources can be accessed as part of the health and safety planning for an international trip.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Emergency Skills badges and requirements"

    def handle(self, *args, **options):
        category = "emergency_skills"

        for badge_name, requirements in EMERGENCY_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Emergency Skills."))