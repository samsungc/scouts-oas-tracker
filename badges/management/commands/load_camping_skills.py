from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


CAMPING_SKILLS_DATA = {
    "Camping Skills 1": [
        {
            "title": "Camping Skills 1.1",
            "description": "I can collect small sticks for a campfire.",
            "hint": "Scouts can search for and return with some dry sticks for starting a campfire.\nScouts can separate tinder, lightweight sticks and logs.",
        },
        {
            "title": "Camping Skills 1.2",
            "description": "I can follow directions while at camp.",
            "hint": "Scouts can demonstrate the ability to successfully follow simple instructions.",
        },
        {
            "title": "Camping Skills 1.3",
            "description": "I can help pack a bag for camp.",
            "hint": "Scouts can assist with the packing of a bag for camp.\nScouts can unpack their bags and then re-pack them, explaining what they are doing.",
        },
        {
            "title": "Camping Skills 1.4",
            "description": "I can keep my camping gear neat and tidy.",
            "hint": "Scouts can demonstrate in a camp setting how to keep things tidy to maintain safety and comfort. Scouts can describe what would happen in adverse weather conditions if their gear was left untidy.",
        },
        {
            "title": "Camping Skills 1.5",
            "description": "I can care for my basic personal gear on an overnight camp.",
            "hint": "Scouts can explain how to check the condition of basic personal gear and show how to care for it.\nScouts can explain the impact on their safety if their gear is not working (for example, if the batteries in their flashlight are not fresh).",
        },
        {
            "title": "Camping Skills 1.6",
            "description": "I can explain the use of the buddy system at camp.",
            "hint": "Scouts can describe the buddy system and how and why it is important to use at camp.",
        },
        {
            "title": "Camping Skills 1.7",
            "description": "I can describe the different emergency services in the camp area and how to call them.",
            "hint": "Scouts can demonstrate how to call emergency services when an accident takes place on a camp.\nScouts can explain the information they will need to provide to the emergency responder.",
        },
        {
            "title": "Camping Skills 1.8",
            "description": "I can set out my sleeping area for a good night’s sleep at camp.",
            "hint": "Scouts can demonstrate how to roll out a sleeping bag, pillow and sleeping mat and show that their sleeping area is organized and tidy.",
        },
        {
            "title": "Camping Skills 1.9",
            "description": "I have spent one night at camp.",
            "hint": "Scouts have attended their first camp (possibly the ‘family camp’ described in BP&P).",
        },
    ],
    "Camping Skills 2": [
        {
            "title": "Camping Skills 2.1",
            "description": "I can explain the importance of following directions at camp.",
            "hint": "Scouts can explain why and how they must listen to instructions, and how to ask for clarification if they don’t understand.",
        },
        {
            "title": "Camping Skills 2.2",
            "description": "I can list what personal gear to bring on an overnight camp.",
            "hint": "Scouts can list the items they need to bring with them for an overnight camping event, including clothing and personal care items.\n• Spare clothing\n• Eating gear\n• Wash gear\n• Wet weather gear\n• Repair equipment\n• Sleeping equipment",
        },
        {
            "title": "Camping Skills 2.3",
            "description": "I can look after all my personal gear while at camp.",
            "hint": "Scouts can describe the value of camping equipment and demonstrate how to go about checking and caring for equipment.\nScouts can explain safety implications of poor or dysfunctional camp equipment.\nScouts can demonstrate how to keep personal camp equipment in working order.\nScouts can show when items of camp equipment are in need of repair.\nScouts can describe the quality of different items of camp equipment.",
        },
        {
            "title": "Camping Skills 2.4",
            "description": "I can explain what clothing to bring on an overnight camp.",
            "hint": "Scouts can describe what clothes they need to bring for different weather conditions.\n• Basic clothing for overnight camp\n• Layer system\n• Outer shell\n• Wet weather gear",
        },
        {
            "title": "Camping Skills 2.5",
            "description": "I can explain how to use Canada’s Food Guide at camp and help to plan a nutritious meal.",
            "hint": "Scouts can give examples of foods in each food group.\nScouts can give examples of what makes a serving from the basic food groups and can show where to locate the required servings for their age group as outlined in the guide.\nIn a group setting, Scouts can use the guide to help plan a nutritious meal.",
        },
        {
            "title": "Camping Skills 2.6",
            "description": "I can describe safe food handling and hygiene at camp.",
            "hint": "Scouts can demonstrate at camp how to store food safely.\nScouts can demonstrate how to properly wash their hands.\nScouts can maintain a clean working area while working with different types of food.\nScouts can demonstrate how to prevent spoilage when there is no electricity and how to cover and protect foods and surfaces.",
        },
        {
            "title": "Camping Skills 2.7",
            "description": "I can help prepare food for cooking at camp and be safe while cooking at camp.",
            "hint": "Working in a team (or with an experienced cook) Scouts can demonstrate how to clean and prepare various food items and how to check that food is cooked thoroughly.\nScouts can demonstrate how to use knives safely when cutting food items.\nScouts can use proper techniques when lifting hot liquids.\nScouts can use proper techniques when lifting hot pots and pans.",
        },
        {
            "title": "Camping Skills 2.8",
            "description": "I can get help if someone is hurt while at camp.",
            "hint": "Scouts can recognize serious injuries and demonstrate how to ask for help.\nScouts can demonstrate how to call 911 or their local emergency number and can request assistance from the nearest adult.",
        },
        {
            "title": "Camping Skills 2.9",
            "description": "I can identify the main parts of a tent.",
            "hint": "Scouts can identify the tent, fly, poles and pegs.",
        },
        {
            "title": "Camping Skills 2.10",
            "description": "I can help pitch a tent at camp.",
            "hint": "Scouts can demonstrate putting up a tent with other Scouts.",
        },
        {
            "title": "Camping Skills 2.11",
            "description": "I behave safely around fires at camp.",
            "hint": "Scouts can demonstrate care and safety around fires.\nScouts can state basic fire safety rules at camp:\n• No horseplay\n• No poking at the fire\n• Keep a safe distance\n• Follow instructions of the person in charge of the fire",
        },
        {
            "title": "Camping Skills 2.12",
            "description": "I can identify and explain the elements of the fire triangle.",
            "hint": "Scouts can explain each part of the fire triangle (fuel, heat, oxygen) and demonstrate the role of each element in a good fire.",
        },
        {
            "title": "Camping Skills 2.13",
            "description": "I have spent two nights in a tent at camp.",
            "hint": "Scouts spend at least two nights camping while completing this stage.",
        },
    ],
    "Camping Skills 3": [
        {
            "title": "Camping Skills 3.1",
            "description": "I can help others learn about camping.",
            "hint": "Scouts display a willingness to help others learn in a natural way over a period of time, rather than mount a single display of expertise.",
        },
        {
            "title": "Camping Skills 3.2",
            "description": "I can audit my personal gear for camp.",
            "hint": "Scouts show an awareness of the value of camping equipment.\nScouts can explain that if equipment is not working properly, it is likely to fail in bad weather conditions.\nScouts can demonstrate how to go about checking and caring for equipment.\nScouts can explain the safety implications of poor or dysfunctional equipment.\nScouts can keep personal equipment in working order.\nScouts can demonstrate how to repair items of equipment.",
        },
        {
            "title": "Camping Skills 3.3",
            "description": "I can pack a bag for camp.",
            "hint": "Scouts can present a packed bag for inspection.\nScouts can demonstrate and discuss, while unpacking and repacking:\n• The value of the method used in the packing process\n• The necessary equipment to pack\n• Where to place soft items\n• Where to place heavy items\n• Where to place food\n• What is meant by “first in, last out”\n• What wet weather equipment to bring",
        },
        {
            "title": "Camping Skills 3.4",
            "description": "I can help plan a basic balanced meal for camp.",
            "hint": "Scouts can plan a meal using the guidelines of Canada’s Food Guide.",
        },
        {
            "title": "Camping Skills 3.5",
            "description": "I can demonstrate how to store food at camp.",
            "hint": "Scouts can demonstrate the proper methods to keep food safe in camp (using food containers and/or coolers as required).",
        },
        {
            "title": "Camping Skills 3.6",
            "description": "I can assist in cooking a meal at camp.",
            "hint": "Scouts can assist in the cooking of a meal in a camp setting.",
        },
        {
            "title": "Camping Skills 3.7",
            "description": "I can be safe while cooking at camp.",
            "hint": "Scouts can use pots safely to prevent tipping.\nScouts can use protective equipment or utensils while working with hot items while cooking.",
        },
        {
            "title": "Camping Skills 3.8",
            "description": "I can demonstrate first aid treatment for a minor cut or scratch at camp, and explain how to prevent infection and describe the signs of infections.",
            "hint": "Scouts can clean a small wound.\nScouts can apply a bandage to wound.",
        },
        {
            "title": "Camping Skills 3.9",
            "description": "I can get a weather forecast for a camp.",
            "hint": "Scouts can access information from the appropriate weather forecasters in their area.\nThis could be from websites, television weather channels or news broadcasts, radio stations or phone apps.",
        },
        {
            "title": "Camping Skills 3.10",
            "description": "I can describe how weather can affect our camp.",
            "hint": "Scouts can explain the different types of weather likely to occur in the area they plan to travel to, given the time of year.\nScouts can explain what will happen if it rains in the camp area.\nScouts can explain what will happen if it is very hot.\nScouts can explain what extra gear they need to bring (just in case).",
        },
        {
            "title": "Camping Skills 3.11",
            "description": "I can discuss the seven principles of Leave No Trace.",
            "hint": "Scouts discuss a basic knowledge of the principles of Leave No Trace and how they affect the way groups camp.",
        },
        {
            "title": "Camping Skills 3.12",
            "description": "I can show how to pitch a tent (with help from others).",
            "hint": "Working with a team, Scouts can demonstrate how to properly pitch a tent.",
        },
        {
            "title": "Camping Skills 3.13",
            "description": "I can make a hot drink on a campfire at camp.",
            "hint": "Scouts can make a hot drink on an open fire with cooking pots.",
        },
        {
            "title": "Camping Skills 3.14",
            "description": "I can clean up a fire area after camp.",
            "hint": "Scouts can clean up the pit, wood pile and area around the fire pit.",
        },
        {
            "title": "Camping Skills 3.15",
            "description": "I have spent seven nights at camp.",
            "hint": "Scouts have spent at least four nights camping while completing this stage.\nScouts have spent at least two consecutive nights at camp while completing this stage.",
        },
    ],
    "Camping Skills 4": [
        {
            "title": "Camping Skills 4.1",
            "description": "I can demonstrate shared teamwork while at camp.",
            "hint": "Scouts can participate in camp as full members of the Patrol.\nScouts can play a number of roles while on camp and generally add to the wellbeing of the whole Patrol.",
        },
        {
            "title": "Camping Skills 4.2",
            "description": "I can list the personal gear for a standing camp.",
            "hint": "Scouts can indicate (in list form) the items of clothing they need to bring with them for various camping activities over a number of days for a standing camp.\nScouts can show consideration of proper clothes provision for wet weather.\nScouts can explain the benefit of the equipment design as it relates to a standing camp.\n• Spare clothing\n• Eating gear\n• Wash gear\n• Wet weather gear\n• Repair equipment\n• Sleeping equipment",
        },
        {
            "title": "Camping Skills 4.3",
            "description": "I can show how to use group gear safely at camp.",
            "hint": "Scouts can demonstrate how to correctly use any of the individual items of group gear.",
        },
        {
            "title": "Camping Skills 4.4",
            "description": "I can show proper use, care and maintenance of group gear during and in between camps.",
            "hint": "Scouts can demonstrate how to go about checking and caring for equipment, considering:\n• Safety implications of poor or dysfunctional equipment\n• Keeping personal equipment in working order\n• How to repair items of equipment\n• The quality of different items of equipment",
        },
        {
            "title": "Camping Skills 4.5",
            "description": "I can use basic camp tools safely.",
            "hint": "Scouts can demonstrate how to use a tool correctly and are aware of any safety implications.\n• Be able to use a tool correctly to do the job it was designed for\n• Display your skill in using a particular tool",
        },
        {
            "title": "Camping Skills 4.6",
            "description": "I can store and cook food safely at camp.",
            "hint": "Scouts can describe the type of containers best suited for a camp setting to keep food away from animals.\nScouts can demonstrate the proper methods to store containers while in camp.\nScouts can demonstrate when and how to use methods such as hanging food containers to prevent animal access.\nScouts can demonstrate proper food safely in a camp setting.",
        },
        {
            "title": "Camping Skills 4.7",
            "description": "I can demonstrate how to treat cuts and minor burns, and prevent infection at camp.",
            "hint": "Scouts can clean and treat wounds using appropriate methods for the injury.\nScouts can apply an appropriate bandage to a wound to promote proper healing.",
        },
        {
            "title": "Camping Skills 4.8",
            "description": "I can explain and demonstrate the seven principles of Leave No Trace while at camp.",
            "hint": "Scouts can name the seven principles of Leave No Trace and apply each of the principles at camp.",
        },
        {
            "title": "Camping Skills 4.9",
            "description": "I can find the best place to pitch a tent at camp and explain my reasoning.",
            "hint": "Scouts can explain what kind of terrain is good for pitching a tent.\nExamples include:\n• Level ground\n• Rocky ground\n• Near/away/on hill\n• Shady\n• Sunny\n• Close or away from trees",
        },
        {
            "title": "Camping Skills 4.10",
            "description": "I can assist pitching tent with my team at camp.",
            "hint": "Working with a team, can demonstrate how to properly pitch a tent.",
        },
        {
            "title": "Camping Skills 4.11",
            "description": "I can demonstrate safe practices around fires and cooking equipment to minimize the risk of burns, scalds and other injuries.",
            "hint": "Scouts can demonstrate a consistent and high level of fire risk management behaviour.",
        },
        {
            "title": "Camping Skills 4.12",
            "description": "I have spent 12 nights at camp.",
            "hint": "Scouts have spent at least four of the twelve nights camping while completing this stage.",
        },
    ],
    "Camping Skills 5": [
        {
            "title": "Camping Skills 5.1",
            "description": "I have assisted in the organization of two camps for my team or others.",
            "hint": "Scouts have actively assisted in the planning of two separate camps for their team or others.",
        },
        {
            "title": "Camping Skills 5.2",
            "description": "I can assist in planning a camp program of activities.",
            "hint": "Scouts can actively assist the person in charge of planning the activities at a camp.",
        },
        {
            "title": "Camping Skills 5.3",
            "description": "I can show the personal gear needed for an overnight lightweight camp.",
            "hint": "Scouts can indicate (in list form) the items of clothing they need to bring with them for various camping activities over a number of days for a lightweight camp.\nScouts can explain factors to consider for proper clothes and provision for wet weather.\nThe weight of the pack is also a concern; Scouts can describe weight-saving measures.\nScouts can explain the benefits of the chosen equipment design as it relates to lightweight camping.\n• Spare clothing\n• Eating gear\n• Wash gear\n• Wet weather gear\n• Repair equipment\n• Sleeping equipment",
        },
        {
            "title": "Camping Skills 5.4",
            "description": "I can explain how the type of camp affects the choice of equipment needed.",
            "hint": "Scouts can list the Patrol equipment necessary for a variety of camps.\nScouts can discuss how each item is relevant and what safety equipment is required.\nWith regards to a lightweight camp, Scouts can discuss how the load might be distributed among the party.",
        },
        {
            "title": "Camping Skills 5.5",
            "description": "I can use, maintain and store tools safely at camp.",
            "hint": "Scouts can show how to properly maintain and care for the tools being used at camp.\nScouts know how to store the tools for use at another time.",
        },
        {
            "title": "Camping Skills 5.6",
            "description": "I can teach another Scout what to pack for a camp.",
            "hint": "Scouts can mentor other Scouts such that they have successfully completed the packing requirements for Stages 1-4.",
        },
        {
            "title": "Camping Skills 5.7",
            "description": "I can plan a balanced menu for camp with a team.",
            "hint": "Scouts can create, with a team, a well-balanced menu plan for a weekend camp.",
        },
        {
            "title": "Camping Skills 5.8",
            "description": "I can demonstrate how to use different cooking methods (with different fuel types) at camp.",
            "hint": "Scouts can use at least two different types of cooking fires.\nScouts can explain the advantages and disadvantages of different stoves.\nScouts can build and use two types of cooking fires to cook a meal.\nScouts can properly use two different types of camp stoves.",
        },
        {
            "title": "Camping Skills 5.9",
            "description": "I can prepare for and help prevent heat-, cold- and sun-related injuries at camp.",
            "hint": "Scouts can describe heat and cold injuries such as sunburn, frostbite, hypothermia, etc.\nScouts can describe proper activity levels and clothing to prevent heat-, cold- and sun-related injuries.\nScouts can seek help for any of the above conditions.",
        },
        {
            "title": "Camping Skills 5.10",
            "description": "I can describe the weather forecast and record the weather for the duration of camp.",
            "hint": "Scouts can use the weather information they have researched and present it to their Troop Leader and to the Troop in general in a clear, concise fashion that it easy to understand.",
        },
        {
            "title": "Camping Skills 5.11",
            "description": "I can demonstrate the appropriate measures for minimizing and dealing with food waste, solid waste and human waste, in keeping with Leave No Trace principles.",
            "hint": "Scouts can demonstrate the proper way to deal with garbage and camping refuse and how to dispose of it correctly.\nScouts can demonstrate the proper method of dealing with kitchen and human waste in a wilderness environment.",
        },
        {
            "title": "Camping Skills 5.12",
            "description": "I can pitch a variety of tents and shelters.",
            "hint": "Scouts can pitch lightweight tents, standing tents, lean-tos, tarps, etc.",
        },
        {
            "title": "Camping Skills 5.13",
            "description": "I can demonstrate measures to secure tents for inclement weather.",
            "hint": "Scouts can demonstrate how to set up a tent properly for rainy, snowy or windy conditions—considering tie-down and staking techniques.",
        },
        {
            "title": "Camping Skills 5.14",
            "description": "I can select a suitable location for a standing or lightweight camp.",
            "hint": "Scouts can select a location for the camp based on type (standing/lightweight/hike-in/etc.).",
        },
        {
            "title": "Camping Skills 5.15",
            "description": "I can show the best layout for a campsite and explain my reasoning.",
            "hint": "Scouts can demonstrate how and where camp equipment is set up at a campsite (i.e. kitchen, tents, shelter, chopping area).",
        },
        {
            "title": "Camping Skills 5.16",
            "description": "I can light, maintain and use a fire to cook a balanced meal at camp.",
            "hint": "Scouts can prepare a complete meal (not just one menu item).",
        },
        {
            "title": "Camping Skills 5.17",
            "description": "I have spent 18 nights at camp.",
            "hint": "Scouts have spent at least six of the 18 nights at camp while completing this stage, including one night of lightweight camping.",
        },
    ],
    "Camping Skills 6": [
        {
            "title": "Camping Skills 6.1",
            "description": "I can teach camping skills with my team at camp.",
            "hint": "Scouts can teach others on their team new camping skills while at a camp.",
        },
        {
            "title": "Camping Skills 6.2",
            "description": "I can plan and lead a weekend camp.",
            "hint": "Scouts can be responsible for the planning and implementation of all aspects (transportation, site location, menu, equipment) of a two-night camp.",
        },
        {
            "title": "Camping Skills 6.3",
            "description": "I can plan a program of activities for camp.",
            "hint": "Scouts can demonstrate knowledge of the different types of activity that are possible on the campsite and how best to maximize the opportunities they present.\nTimetabling and equipment considerations need to be displayed.",
        },
        {
            "title": "Camping Skills 6.4",
            "description": "I can assist with the organization of transportation to camp.",
            "hint": "Scouts can actively assist the person responsible for organizing transportation for a camp.",
        },
        {
            "title": "Camping Skills 6.5",
            "description": "I can explain group emergency equipment for a camp.",
            "hint": "Scouts are safety aware and can discuss realistic possible emergency situations.\nScouts can explain the type of equipment that is present on the campsite.\n• First aid kit\n• Safety ropes\n• Survival bag\n• Emergency shelter",
        },
        {
            "title": "Camping Skills 6.6",
            "description": "I can demonstrate to others how to care for, store and maintain group gear for camp.",
            "hint": "Scouts can demonstrate basic procedures for cleaning and caring for equipment.\nScouts can demonstrate how to clean, care for and store tools, tents and cooking equipment.",
        },
        {
            "title": "Camping Skills 6.7",
            "description": "I can prepare a list of personal and group gear required for a standing camp.",
            "hint": "Scouts can prepare a list of personal and group gear for a standing camp, including all required tools, portable shelters (tarps and tents), cooking equipment, emergency equipment, and all other optional or recommended items.",
        },
        {
            "title": "Camping Skills 6.8",
            "description": "I can help plan a menu and purchase food for a weekend camp.",
            "hint": "Scouts can acquire the necessary menu items planned for a team’s weekend camp.",
        },
        {
            "title": "Camping Skills 6.9",
            "description": "I can demonstrate to others how to use a variety of cooking stoves at camp and explain to others when each type is most effective.",
            "hint": "Scouts can explain the different types of cooking stoves available for camp use (single and double burner, propane and naphtha.)\nScouts can explain when each stove type and fuel type is appropriate for the type and season of camp planned.",
        },
        {
            "title": "Camping Skills 6.10",
            "description": "I can teach another youth to prepare a meal to be cooked on a fire or improvised stove.",
            "hint": "Scouts can show other Scouts how to cook meals in a fire using tinfoil or on a created stove (such as a hobo stove design).",
        },
        {
            "title": "Camping Skills 6.11",
            "description": "I can demonstrate treatment of heat-, cold- and sun-related injuries at camp.",
            "hint": "Scouts can describe the causes of hypothermia, hyperthermia, sunburn, frostbite etc.\nScouts can identify the signs and symptoms of exposure to the elements.\nScouts can treat weather-related injuries and medical conditions.",
        },
        {
            "title": "Camping Skills 6.12",
            "description": "I demonstrate responsibility for myself at camp.",
            "hint": "Scouts can recognize and take steps to manage themselves in all environmental elements they are exposed to.",
        },
        {
            "title": "Camping Skills 6.13",
            "description": "I can recognize weather signs and prepare for their impact on camp activities.",
            "hint": "Scouts can explain the effects that different types of weather have on the local surroundings.\nScouts can recognize the various types of clouds and explain the weather conditions they represent.\nScouts can recognize and explain how changing temperatures, wind direction and humidity affect the weather.",
        },
        {
            "title": "Camping Skills 6.14",
            "description": "I can travel while following the seven principles of Leave No Trace.",
            "hint": "Scouts can demonstrate a consistent behaviour with all Leave No Trace practices.",
        },
        {
            "title": "Camping Skills 6.15",
            "description": "I can describe how to choose the best tent for a specific camp.",
            "hint": "Scouts can select a tent based on weather, season and location of the camp.",
        },
        {
            "title": "Camping Skills 6.16",
            "description": "I can teach how to pitch a tent at camp.",
            "hint": "Scouts can assist younger Scouts with pitching tents.",
        },
        {
            "title": "Camping Skills 6.17",
            "description": "I can help organize campsite setup and takedown.",
            "hint": "Scouts can assist in leading setting up and taking down camp (i.e. kitchen, tents, picking site, shelter).",
        },
        {
            "title": "Camping Skills 6.18",
            "description": "I can help research proposed camping areas and locate services.",
            "hint": "Scouts can book a camp with all appropriate paperwork (including an emergency plan with directions to the nearest hospital).",
        },
        {
            "title": "Camping Skills 6.19",
            "description": "I have spent 24 nights at camp in three different season, including a week-long camp, while completing this stage.",
            "hint": "Scouts have spent at least six of the 24 nights at camp while completing this stage.\nScouts must have camped at least three nights out in every season.",
        },
        {
            "title": "Camping Skills 6.20",
            "description": "I have spent two consecutive nights lightweight camping while completing this stage.",
            "hint": "Scouts have camped in a remote setting where all the equipment must be transported in a pack or by a self-propelled watercraft.",
        },
    ],
    "Camping Skills 7": [
        {
            "title": "Camping Skills 7.1",
            "description": "I can plan and lead a two-night backcountry camp.",
            "hint": "Scouts have been responsible for the planning and implementing all aspects (transportation, site location, route, menu, equipment) of a two-night backcountry camp.",
        },
        {
            "title": "Camping Skills 7.2",
            "description": "I can plan activities for at least two different types of camps.",
            "hint": "Scouts have shown the ability and knowledge required by planning the activities for both a standing camp and a lightweight camp.",
        },
        {
            "title": "Camping Skills 7.3",
            "description": "I can organize required transportation for camp.",
            "hint": "Scouts can demonstrate a capability to seek information from and by a number of sources.\nScouts can organize a suitable transport to and from the campsite.",
        },
        {
            "title": "Camping Skills 7.4",
            "description": "I can help plan and lead a backcountry camp of a minimum of two consecutive nights.",
            "hint": "Scouts can actively assist the person responsible for planning an expedition.",
        },
        {
            "title": "Camping Skills 7.5",
            "description": "I can audit group emergency equipment for camp.",
            "hint": "Scouts can present a listing of all group emergency equipment, specifically identifying any broken or missing items.",
        },
        {
            "title": "Camping Skills 7.6",
            "description": "I can teach another youth how to care for, store and maintain group gear needed for camps.",
            "hint": "Scouts have mentored other Scouts such that they have successfully completed the group gear/tools requirements for Stages 4, 5, and 6.",
        },
        {
            "title": "Camping Skills 7.7",
            "description": "I can create personal and group gear lists for lightweight camping excursions.",
            "hint": "Scouts can present the list to their campmates in preparation for a campout.",
        },
        {
            "title": "Camping Skills 7.8",
            "description": "I can teach the use of various stoves and their effective use to another youth at camp.",
            "hint": "Scouts can teach others how to properly use different types of stoves and fuel types.\nScouts can teach the proper use and storage of fuel (i.e. propane and naphtha).",
        },
        {
            "title": "Camping Skills 7.9",
            "description": "I can help prepare and describe an emergency plan for expected risks and hazards at camp.",
            "hint": "Scouts can explain the risks various activities may have and are able prepare any required safety measures to reduce the risks.",
        },
        {
            "title": "Camping Skills 7.10",
            "description": "I can take responsibility for myself and my team while at camp.",
            "hint": "Scouts can recognize and take steps to reduce any perceived issues that may arise in a team environment.",
        },
        {
            "title": "Camping Skills 7.11",
            "description": "I can demonstrate how to plan for and adapt to changing weather patterns at camp.",
            "hint": "Scouts can recognize the signs of rainstorms, wind or snowstorms, and know how to protect themselves and their Patrol.",
        },
        {
            "title": "Camping Skills 7.12",
            "description": "I can teach the seven principles of Leave No Trace as they apply to a camp.",
            "hint": "Scouts teach the Leave No Trace principles to Scouts who do not know Leave No Trace.",
        },
        {
            "title": "Camping Skills 7.13",
            "description": "I can teach another youth tent selection by camp type.",
            "hint": "Scouts can explain to another Scout what types of tents are best for certain seasons and types of weather.",
        },
        {
            "title": "Camping Skills 7.14",
            "description": "I can organize campsite setup and takedown.",
            "hint": "Scouts can take a lead role in the setting up and taking down of camp (i.e. kitchen, tents, site selection, shelter).\nScouts can appoint others’ direction and duties.",
        },
        {
            "title": "Camping Skills 7.15",
            "description": "I have spent 30 nights at camp in all four seasons, including two nights without a Scouter while completing this stage.",
            "hint": "Scouts have camped at least six of the 30 nights camping while completing this stage.\nScouts have camped for at least four nights out in each season.",
        },
    ],
    "Camping Skills 8": [
        {
            "title": "Camping Skills 8.1",
            "description": "I have mentored someone else who was responsible for planning and leading a camp.",
            "hint": "Scouts have mentored another Scout who was successful in completing the Stage 6 requirement to plan a camp.",
        },
        {
            "title": "Camping Skills 8.2",
            "description": "I can source, compare and organize transportation options for local and foreign locations.",
            "hint": "Scouts can demonstrate a capability of seeking information by a number of sources. Scouts can organize the transport to and from the campsite.",
        },
        {
            "title": "Camping Skills 8.3",
            "description": "I can describe an expedition plan and how the needs of participants have been met in its development.",
            "hint": "Scouts can plan, organize and run a camping expedition so that everyone will find the camp both fun and challenging.\n• discuss abilities of his/her team\n• grade hiking terrain and be aware of difficulties that may be encountered\n• choose a route that is challenging but not dangerous for those taking part\n• select suitable program activities for a weekend and long term camp",
        },
        {
            "title": "Camping Skills 8.4",
            "description": "I can prepare for a specialized expedition.",
            "hint": "Scouts can plan and organize expeditions that require special skills (e.g. mountaineering, snowshoeing or canoeing), adding whatever skills necessary to their existing skills set.",
        },
        {
            "title": "Camping Skills 8.5",
            "description": "I can make recommendations to improve group equipment for various camp types.",
            "hint": "Scouts can share with other Scouts improvements that can be made to the existing group gear.",
        },
        {
            "title": "Camping Skills 8.6",
            "description": "I can determine if specialized training is required for camp activities.",
            "hint": "Scouts can explain the need to obtain specific training to safely participate in an activity.",
        },
        {
            "title": "Camping Skills 8.7",
            "description": "I can use knowledge of weather patterns to change activities as required at camp.",
            "hint": "Scouts can recognize the signs of upcoming weather and adapt plans the group may have to accommodate the weather conditions.\nThis may require changing the venue for the event or changing the activity altogether.",
        },
        {
            "title": "Camping Skills 8.8",
            "description": "I have spent 36 nights on various types of camps.",
            "hint": "Scouts have spent at least six of the 36 nights while completing this stage.",
        },
    ],
    "Camping Skills 9": [
        {
            "title": "Camping Skills 9.1",
            "description": "I can source amenities and local places of interest for various camp types.",
            "hint": "Scouts can demonstrate a capability to seek information by a number of sources.\nBefore the camp, Scouts can research information on the local shops, places to eat, hospital, religious services, etc. that other Scouts can be availed of on camp.\nScouts can conduct research into what in the locality of the campsite is of historical, artistic or geographical interest.",
        },
        {
            "title": "Camping Skills 9.2",
            "description": "I can budget, prepare and manage every aspect of a camping expedition.",
            "hint": "Scouts can demonstrate how to prepare a budget and manage that budget over a camping activity to achieve a break-even situation.\nScouts can run or assist in preparing and managing at least three camping adventures.",
        },
        {
            "title": "Camping Skills 9.3",
            "description": "I have acted as the outing leader on at least two camping expeditions.",
            "hint": "Scouts have led at least two camping expeditions, which are to be at least four days long.",
        },
        {
            "title": "Camping Skills 9.4",
            "description": "I can plan and execute camping expeditions in all types of locations and regions, including internationally.",
            "hint": "Scouts can run, in conjunction with others, successful camps and expeditions no matter the factors impinging on possible success or failure.\nScouts can plan at least one camping expedition in a far-away part of Canada or internationally.",
        },
        {
            "title": "Camping Skills 9.5",
            "description": "I am able to source local training required for the specific camp or activity.",
            "hint": "Scouts can locate appropriate training providers to gain the necessary knowledge to safely participate or carry out an activity.",
        },
        {
            "title": "Camping Skills 9.6",
            "description": "I have spent 42 nights on various types of camps.",
            "hint": "Scouts have spent at least six nights camping while completing this stage.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Camping Skills badges and requirements"

    def handle(self, *args, **options):
        category = "camping_skills"

        for badge_name, requirements in CAMPING_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Camping Skills."))