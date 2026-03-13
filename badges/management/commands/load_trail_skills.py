from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


TRAIL_SKILLS_DATA = {
    "Trail Skills 1": [
        {
            "title": "Trail Skills 1.1",
            "description": "I can help pack a rucksack for a day hike.",
            "hint": "Scouts can indicate the items to bring for a day hike.\nScouts can explain how to pack soft items, heavy items and food items.\nScouts can explain what is meant by “first in-last out” when packing items.\nScouts can demonstrate the wet weather equipment to bring on a day hike.",
        },
        {
            "title": "Trail Skills 1.2",
            "description": "I can dress myself for a day hike.",
            "hint": "Scouts can explain how weather affects what can be worn for a day hike.\nScouts can explain the concept of layering and understand what to wear for wet weather.\nScouts can demonstrate the types of footwear needed for a day hike in each season.",
        },
        {
            "title": "Trail Skills 1.3",
            "description": "I can list what food to bring on a day hike.",
            "hint": "Scouts can explain the food groups to bring for a day hike to sustain and boost energy.\nScouts can show what to bring for snacks.\nScouts can show how to keep drinks hot or cold.\nScouts can explain what dehydration means and can show how to bring water on a day hike.",
        },
        {
            "title": "Trail Skills 1.4",
            "description": "I can follow directions on a day hike.",
            "hint": "Scouts can explain why they must listen to the Scouter so that everyone is kept safe on a day hike.",
        },
        {
            "title": "Trail Skills 1.5",
            "description": "I can identify the main parts of a compass.",
            "hint": "Scouts can identify the parts of a compass outdoors in a practical experience.",
        },
        {
            "title": "Trail Skills 1.6",
            "description": "I can behave safely while hiking.",
            "hint": "Scouts can describe safety rules and procedures that will keep themselves and their group safe while on a day hike.\nScouts can explain how their own behaviour affects others on the day hike.\nScouts can demonstrate how to hike on various types of terrain (smooth, rough), how to keep up with others and the importance of always being able to see a Scouter while on the day hike.",
        },
        {
            "title": "Trail Skills 1.7",
            "description": "I can be responsible for myself while we are hiking.",
            "hint": "Scouts can explain how they contribute to the success of the day hike by being members of the team.\nScouts can describe how their awareness will help everyone have a safe day hike.",
        },
        {
            "title": "Trail Skills 1.8",
            "description": "I can explain the buddy system.",
            "hint": "Scouts explain how and why the buddy system is used on a day hike.",
        },
        {
            "title": "Trail Skills 1.9",
            "description": "I can recognize the main distress signals.",
            "hint": "Scouts can draw and identify the main distress signals.",
        },
        {
            "title": "Trail Skills 1.10",
            "description": "I have attended at least two hikes.",
            "hint": "As much as possible these can be different types of day hikes, such as in neighborhoods, parks, open natural areas, etc.",
        },
    ],
    "Trail Skills 2": [
        {
            "title": "Trail Skills 2.1",
            "description": "I know what gear to bring for a hike depending on the weather.",
            "hint": "Scouts can explain how weather varies from one location to another (from flat urban areas to wooded areas, valleys to hilltops) and how that will affect what gear to bring on a day hike.\nScouts can explain the gear needed for downpour, high winds, sun and humidity.\nScouts can explain the importance of bringing personal protection materials needed for insects and sun.",
        },
        {
            "title": "Trail Skills 2.2",
            "description": "I can show how to take care of all personal gear needed for a day hike.",
            "hint": "Scouts can explain the value of gear needed for hikes and the importance of caring for it. Scouts can check their equipment prior to the hike.\nScouts show how to put away and store equipment after the hike.",
        },
        {
            "title": "Trail Skills 2.3",
            "description": "I can read a simple map.",
            "hint": "Scouts can read a simply drawn map of the neighbourhood (e.g. meeting area, local park etc.). Scouts can demonstrate how to orient a map and how to follow a simple route around the map.\nScouts can explain how different colours on a map define the areas (water, urban, park, forest) and can identify symbols used for roads, trails, buildings, rivers, etc.",
        },
        {
            "title": "Trail Skills 2.4",
            "description": "I can use a compass to find basic directions.",
            "hint": "Scouts can demonstrate basic use of the compass: how to take a bearing and how to follow a bearing.\nScouts can demonstrate how to use a map and compass together to navigate an area.",
        },
        {
            "title": "Trail Skills 2.5",
            "description": "I can obtain a weather forecast.",
            "hint": "Scouts can list methods to obtain a weather forecast.\nScouts can explain why Scouts need to watch forecasts ahead of a hike.",
        },
        {
            "title": "Trail Skills 2.6",
            "description": "I can be a responsible member of my team while we are hiking.",
            "hint": "Scouts can identify some risk concerns that might be present on a day hike and offer safety procedures to counteract them.\nScouts can explain how to be a member of the team while on a hike and how their behaviour will impact the hike and experience of others.",
        },
        {
            "title": "Trail Skills 2.7",
            "description": "I can get help if someone is hurt.",
            "hint": "Scouts can recognize when someone is injured and needs help.\nScouts can explain how to get help in various conditions.",
        },
        {
            "title": "Trail Skills 2.8",
            "description": "I have attended at least three hikes.",
            "hint": "Scouts have attended at least three hikes in natural areas such as parks, forests and Scout camps.",
        },
        {
            "title": "Trail Skills 2.9",
            "description": "I can explain why one brings certain foods and drinks on hikes.",
            "hint": "Scouts can explain the need for sustaining and energy foods.\nScouts can help plan the food items for a day hike.\nSome food considerations include: Canada’s Food guide, high energy; water; carbohydrates, weight considerations, cooking equipment.",
        },
    ],
    "Trail Skills 3": [
        {
            "title": "Trail Skills 3.1",
            "description": "I can pack a rucksack for a day hike.",
            "hint": "Scouts can list the equipment, including team equipment to bring with them for a day hike.\nScouts can show how to pack equipment in their rucksack: heavy items, soft items, last in-first out principle, food items and water.",
        },
        {
            "title": "Trail Skills 3.2",
            "description": "I can explain what clothes to bring for a day hike depending on the weather.",
            "hint": "Scouts can explain how the weather can change very quickly and how they need to plan in advance.\nScouts can explain the layering system, outer shell; how to control body head and ventilation; wicking principle.",
        },
        {
            "title": "Trail Skills 3.3",
            "description": "I can follow a route on an orienteering map.",
            "hint": "Scouts can follow a simple orienteering trail using an orienteering map.",
        },
        {
            "title": "Trail Skills 3.4",
            "description": "I can identify the features of a topographical map.",
            "hint": "Scouts can point out key features of a map and describe the landscape based on contours, vegetation and water features.\nScouts can explain scale and grid references found on maps.",
        },
        {
            "title": "Trail Skills 3.5",
            "description": "I can demonstrate the basic use of a GPS unit.",
            "hint": "Scouts can turn on a GPS and use it to orient their location.",
        },
        {
            "title": "Trail Skills 3.6",
            "description": "I can teach another youth how to find directions by using a compass.",
            "hint": "Scouts can demonstrate the use of a compass to another youth including: taking a bearing, following a bearing and orienting a map with a compass.",
        },
        {
            "title": "Trail Skills 3.7",
            "description": "I can explain the effect of weather on hiking activities.",
            "hint": "Scouts can describe how weather will affect their hike—duration, pace.\nScouts can explain what to do if encountering severe weather alone or in a group.",
        },
        {
            "title": "Trail Skills 3.8",
            "description": "I can be responsible for myself and aware of my surroundings while hiking.",
            "hint": "Scouts can explain how terrain and trails affect their hike.\nScouts can reduce risks when crossing steep or rugged areas as well as in remote areas.",
        },
        {
            "title": "Trail Skills 3.9",
            "description": "I can explain the main principles of Leave No Trace.",
            "hint": "Scouts can demonstrate the Leave No Trace principles in action when on a hike, including: waste reduction, respect for animals, minimizing impact on the trail, consideration for others.\nScouts can explain how urination and defecation are handled on the trail.",
        },
        {
            "title": "Trail Skills 3.10",
            "description": "I can treat simple cuts and scratches.",
            "hint": "Scouts can demonstrate how to clean the wound, apply a bandage and reassure the patient.",
        },
        {
            "title": "Trail Skills 3.11",
            "description": "I know how to avoid becoming lost, and I know what to do if I get lost.",
            "hint": "Scouts can explain how to prevent becoming lost and what to do if they are lost alone or as a group.",
        },
        {
            "title": "Trail Skills 3.12",
            "description": "I have attended at least three hiking activities, one of which involves hiking on hilly trails.",
            "hint": "Scouts have attended at least three activities in various terrains, and trail types.\nThese can be different from those experienced at Stage 1 or 2.",
        },
    ],
    "Trail Skills 4": [
        {
            "title": "Trail Skills 4.1",
            "description": "I can teach another youth what to pack for a day hike.",
            "hint": "Scouts can show other Scouts how to pack the equipment in their rucksack: heavy items, soft items, last in-first out principle, food items and water.",
        },
        {
            "title": "Trail Skills 4.2",
            "description": "I can pack a rucksack for a weekend hike.",
            "hint": "Scouts can explain the equipment (including group equipment) needed for an overnight hike. Scouts can show how to pack heavy items, soft items, food, fuel, stoves, and their share of team equipment.\nScouts can explain the types of eye protection needed for various conditions, such as: sunglasses, glacier glasses and snow goggles.\nScouts can list and describe the 10 essential items to always have in their rucksacks. According to AdventureSmart, they are:\n• Flashlight\n• Fire-making kit\n• Whistle or mirror\n• Extra food and water\n• Extra clothing\n• Navigational/communication aids\n• First aid kit\n• Emergency shelter\n• Pocket knife\n• Sun protection",
        },
        {
            "title": "Trail Skills 4.3",
            "description": "I can show how to care for all my personal hiking equipment needed for a weekend hike.",
            "hint": "Scouts can explain the value of maintaining equipment and demonstrate how to check and care for their equipment including: safety considerations, keeping equipment in working condition, checking in advance, simple repairs and cleaning.",
        },
        {
            "title": "Trail Skills 4.4",
            "description": "I know how to plan for and avoid food allergies in a group hike.",
            "hint": "Scouts can describe how to keep food safe for all members of the group and avoid cross-contamination.\nScouts can explain how to recognize and treat allergies, including anaphylactic reactions.",
        },
        {
            "title": "Trail Skills 4.5",
            "description": "I can use a map and compass together for navigation.",
            "hint": "Scouts can plot a hiking route on a map, taking into consideration the terrain and features. Scouts can follow the progress of the hike and mark points as they are achieved.\nScouts can demonstrate the use of a compass to determine bearings for the route.\nScouts can plot locations based on grid references, calculate distances and changes in height.",
        },
        {
            "title": "Trail Skills 4.6",
            "description": "I can teach another youth how to follow a route on an orienteering map.",
            "hint": "Scouts demonstrate to others how to follow a pre-defined route on a map.",
        },
        {
            "title": "Trail Skills 4.7",
            "description": "I can keep a map dry and safe from the elements.",
            "hint": "Scouts can describe and use the various methods of keeping a map dry and safe: zip-lock bags, laminating, map cases and map coatings.",
        },
        {
            "title": "Trail Skills 4.8",
            "description": "I can locate a waypoint that has been pre-programmed into a GPS unit.",
            "hint": "Scouts can demonstrate how to locate a pre-programmed waypoint.",
        },
        {
            "title": "Trail Skills 4.9",
            "description": "I can plan and bring appropriate personal gear to use on a hike based on weather forecasts for the hiking area.",
            "hint": "Scouts can demonstrate methods of obtaining the forecast for the hiking area.\nScouts can show how to prepare for the various weather conditions that may be encountered on the hike.",
        },
        {
            "title": "Trail Skills 4.10",
            "description": "I can cross various terrains, such as wet or rocky ground.",
            "hint": "Scouts can explain how to cross various terrains safely.\nScouts can cross wet bogs or marshes safely and minimize their impact on the environment.",
        },
        {
            "title": "Trail Skills 4.11",
            "description": "I can apply the Leave No Trace principles while hiking.",
            "hint": "Scouts can demonstrate their knowledge of the Leave No Trace principles by disposing of waste properly, respecting wildlife, minimizing the impacts of hiking and fire, showing consideration of others and hiking and camping on durable surfaces whenever possible.",
        },
        {
            "title": "Trail Skills 4.12",
            "description": "I can minimize trail hazards for myself and others as encountered (trip hazards on the trail, minimizing branch whip while moving them out of the way, etc.—overall trail etiquette).",
            "hint": "Scouts can demonstrate hiking etiquette on the trail.\nScouts know what to do if encountering other hikers on a trail.\nScouts can avoid livestock or wildlife on a trail, and know what to do if animals are encountered.",
        },
        {
            "title": "Trail Skills 4.13",
            "description": "I can be responsible for younger or less experienced members of my team while we are hiking.",
            "hint": "Scouts have a level of awareness to help younger or less-experienced Scouts while hiking.",
        },
        {
            "title": "Trail Skills 4.14",
            "description": "I can treat simple sprains and blisters.",
            "hint": "Scouts can demonstrate treatment of simple foot or ankle sprains and blisters.\nScouts can explain the difficulties providing treatment of simple sprains and blisters when on the trail and why to avoid these injuries.\nScouts can make the patient feel safe and know how to get help.\nScouts know the materials in a first aid kit that are used to treat a blister and demonstrate their skill.",
        },
        {
            "title": "Trail Skills 4.15",
            "description": "I can identify the different emergency services that are available and how and when to call them.",
            "hint": "Scouts can explain how to call for emergency services in the area in which Scouts are hiking (police, ambulance, search etc.).\nScouts are able to explain what each service would provide in a hiking situation.",
        },
        {
            "title": "Trail Skills 4.16",
            "description": "I can build or find an emergency shelter.",
            "hint": "Scouts can demonstrate how to erect a simple emergency shelter or explain natural formations that could be used for emergency shelters.",
        },
        {
            "title": "Trail Skills 4.17",
            "description": "I have attended three hikes (including an overnight).",
            "hint": "Scouts have attended at least three hikes in wilderness-type areas different from those experienced in other stages. One of the hikes is to be an overnight experience.",
        },
        {
            "title": "Trail Skills 4.18",
            "description": "I can lead a leg of a hike.",
            "hint": "Scouts can take the lead position on a section of a hike.\nScouts will demonstrate how to navigate, support, guide and lead others over the trail.",
        },
        {
            "title": "Trail Skills 4.19",
            "description": "I can help plan a day hike.",
            "hint": "Scouts have been involved in the selection of season and location for a day hike.",
        },
    ],
    "Trail Skills 5": [
        {
            "title": "Trail Skills 5.1",
            "description": "I can explain how the weather affects the equipment I bring on a weekend hike.",
            "hint": "Scouts can explain how the weather can change very quickly and how they need to plan in advance.\nScouts can explain the layering system, outer shell; how to control body heat and ventilation; wicking principle.\nScouts can demonstrate how to keep their pack and pack contents dry in wet and snow conditions.",
        },
        {
            "title": "Trail Skills 5.2",
            "description": "I can show what group equipment to bring on a weekend hike and explain why each item is needed.",
            "hint": "Scouts can list the basic equipment needed and why and how it is to be used on a weekend hike.\nThis includes camping, safety and personal equipment.",
        },
        {
            "title": "Trail Skills 5.3",
            "description": "I can show how to use group equipment correctly.",
            "hint": "Scouts can demonstrate proper use of equipment while supervised on a hike.",
        },
        {
            "title": "Trail Skills 5.4",
            "description": "I can select appropriate footwear for various hikes.",
            "hint": "Scouts can describe appropriate footwear and comfort factors such as ankle support, sole support and construction materials.\nScouts can explain the use of gaiters when hiking.",
        },
        {
            "title": "Trail Skills 5.5",
            "description": "I can demonstrate how to use different types of lightweight stoves to prepare a meal.",
            "hint": "Scouts can describe the different types of stoves and fuel that can be used on day and overnight hikes.",
        },
        {
            "title": "Trail Skills 5.6",
            "description": "I can keep food and food preparation materials hygienic.",
            "hint": "Scouts can describe how to keep food, food containers and food utensils hygienic and how to handle food safely during the hike and while preparing meals.",
        },
        {
            "title": "Trail Skills 5.7",
            "description": "I can use a map and compass to find my position on the ground.",
            "hint": "Scouts can demonstrate their skills with a map and compass while supervised on the trail. Scouts can show how to find their position on the map with reference to their surroundings and local features.\nScouts can take bearings of surrounding areas and find their position.",
        },
        {
            "title": "Trail Skills 5.8",
            "description": "I can plot a proposed hiking route on a map and obtain the required compass bearings.",
            "hint": "Scouts can demonstrate how to plot a hike route and use a compass to obtain the necessary bearings.\nScouts can orient the map using features on a map and use the features to plot a hiking route.",
        },
        {
            "title": "Trail Skills 5.9",
            "description": "I can input a given waypoint into a GPS and then find it.",
            "hint": "Scouts can demonstrate how to use a GPS by entering waypoints and navigating to the destination.",
        },
        {
            "title": "Trail Skills 5.10",
            "description": "I can teach another youth the basic use of a GPS unit.",
            "hint": "Scouts can demonstrate how to use a GPS to other Scouts.",
        },
        {
            "title": "Trail Skills 5.11",
            "description": "I can find directions without a compass.",
            "hint": "Scouts can demonstrate various methods of finding direction: using the sun, stars, shadows, a watch, the moon.",
        },
        {
            "title": "Trail Skills 5.12",
            "description": "I can describe the dangers of weather on hikes.",
            "hint": "Scouts can explain how temperature changes and changes in wind speed and direction can indicate weather changes.\nScouts can describe how cloud cover, mist, fog and snow can affect the hike and how to be proactively safe.",
        },
        {
            "title": "Trail Skills 5.13",
            "description": "I can plan effectively and recommend appropriate gear for my group to take based on weather forecasts for the hike area.",
            "hint": "Scouts can list the gear needed for the hike and the adjustments required depending on weather forecasts.\nScouts can distinguish between regular group gear and safety/emergency use gear.",
        },
        {
            "title": "Trail Skills 5.14",
            "description": "I know when and how to cross a river.",
            "hint": "Scouts can demonstrate how to cross a river using various methods, including the preferred safe crossing on a bridge or other designated safe crossing areas.\nScouts can explain safety procedures including how to protect clothes so youth stay dry, and steps to keep warm.",
        },
        {
            "title": "Trail Skills 5.15",
            "description": "I can show how and explain when to use the main distress signals.",
            "hint": "Scouts can demonstrate distress signals while supervised outdoors in both daytime and night-time conditions.",
        },
        {
            "title": "Trail Skills 5.16",
            "description": "I can be an active member of my team while hiking.",
            "hint": "Scouts can demonstrate awareness of trail conditions and ways to support other members of the team.\nScouts can explain the various roles required for a safe hiking experience.\nScouts can describe proper trail pacing for a group and how to schedule rest and water breaks.\nScouts can explain the role of the front leader and rear follower on a hike.",
        },
        {
            "title": "Trail Skills 5.17",
            "description": "I can recognize and respond to hazards from flora and fauna.",
            "hint": "Scouts demonstrate their knowledge of flora and fauna that could be hazardous on the trail. Scouts can explain how to recognize these hazards, how to avoid the hazards and how to respond to exposure.",
        },
        {
            "title": "Trail Skills 5.18",
            "description": "I have taken part in three hikes (including an overnight).",
            "hint": "Scouts have attended at least three hikes in wilderness-type areas in addition to and different from those experienced in other stages.\nOne of the hikes is to be a two-night hike experience.",
        },
        {
            "title": "Trail Skills 5.19",
            "description": "I have written a log for at least two of these activities.",
            "hint": "Scouts can keep the date, route and other details of the adventure in a log which can be added to with each hiking adventure.",
        },
        {
            "title": "Trail Skills 5.20",
            "description": "I can help plan an overnight hike.",
            "hint": "Scouts can be involved in all aspects of planning an overnight hike.",
        },
        {
            "title": "Trail Skills 5.21",
            "description": "I can help choose a suitable hiking destination.",
            "hint": "Scouts can select a location that meets the desired hiking trip requirements.",
        },
        {
            "title": "Trail Skills 5.22",
            "description": "I can hike on steep trails safely, using appropriate gear as required.",
            "hint": "Scouts can describe and demonstrate safe practices for steep trails and list the required safety gear (such as hiking poles).",
        },
    ],
    "Trail Skills 6": [
        {
            "title": "Trail Skills 6.1",
            "description": "I can teach another youth what to pack for a weekend hike.",
            "hint": "Scouts can teach others how and what to pack for a weekend hike.\nScouts can explain to others the different types of materials used for clothing such as cotton, wool and synthetics, and can describe their properties for hiking (e.g. breathable, waterproof, weight, etc.).",
        },
        {
            "title": "Trail Skills 6.2",
            "description": "I can show what group emergency equipment we can carry on a weekend hike, and how to use each item.",
            "hint": "Scouts can list the items that are needed for safety and emergency use for a weekend hike, including safety ropes, sleeping materials, dry bags, shelters and first aid kits.",
        },
        {
            "title": "Trail Skills 6.3",
            "description": "I can teach another youth how to care for, store and maintain the group equipment.",
            "hint": "Scouts demonstrate to other youth how to look after group equipment.",
        },
        {
            "title": "Trail Skills 6.4",
            "description": "I can look after my hiking footwear.",
            "hint": "Scouts demonstrate proper cleaning and storage of their footwear, including waterproofing.",
        },
        {
            "title": "Trail Skills 6.5",
            "description": "I can select and maintain my pack for various hiking adventures.",
            "hint": "Scouts explain how to choose a pack, fit it, name the key parts, and know how to make repairs while on the trail.",
        },
        {
            "title": "Trail Skills 6.6",
            "description": "I know how much water to drink and the effects and treatment of dehydration.",
            "hint": "Scouts explain dehydration: its signs and symptoms and treatment.\nScouts can explain how much water intake is needed at rest and on the hike.",
        },
        {
            "title": "Trail Skills 6.7",
            "description": "I know how to use different methods to treat water.",
            "hint": "Scouts demonstrate how to use water purifiers and identify suitable natural sources from which to obtain water.",
        },
        {
            "title": "Trail Skills 6.8",
            "description": "I can avoid hyponatremia by ensuring proper planning for the hike.",
            "hint": "Scouts can explain the signs and symptoms of hyponatremia and how to avoid it on hiking experiences.",
        },
        {
            "title": "Trail Skills 6.9",
            "description": "I can obtain coordinates from a point of interest on a topographical map so that it can be inputted into a GPS unit.",
            "hint": "Scouts can demonstrate how to find their position on a map and use their map skills to enter coordinates into a GPS unit so that others can navigate from that point to another on the hike.",
        },
        {
            "title": "Trail Skills 6.10",
            "description": "I can demonstrate the limitations of the compass and other navigation tools.",
            "hint": "Scouts can describe how a compass and other navigation tools each have limitations and know where and under what conditions these will not operate correctly.",
        },
        {
            "title": "Trail Skills 6.11",
            "description": "I can teach another youth how to find his or her position on the ground using a map and compass.",
            "hint": "Scouts can demonstrate their expertise by teaching others how to use a map and compass to find their position on the hike.",
        },
        {
            "title": "Trail Skills 6.12",
            "description": "I can recognize changing weather patterns while hiking.",
            "hint": "Scouts can demonstrate their knowledge of weather by recognizing temperature changes, changes in wind speed, and cloud formations.",
        },
        {
            "title": "Trail Skills 6.13",
            "description": "I can show different methods for crossing waterways.",
            "hint": "Scouts can demonstrate various ways of crossing waterways while on a hike.",
        },
        {
            "title": "Trail Skills 6.14",
            "description": "I can teach the principles of Leave No Trace.",
            "hint": "Scouts can teach the principles of Leave No Trace in a hiking context to others.",
        },
        {
            "title": "Trail Skills 6.15",
            "description": "I can recognize unstable or elevated risk areas (e.g. slick trails, icy terrain) and either avoid them or minimize the risk in crossing the area with accepted use of gear and technique.",
            "hint": "Scouts can demonstrate safe techniques while hiking on various types of terrain.",
        },
        {
            "title": "Trail Skills 6.16",
            "description": "I can recognize and treat hypothermia, hyperthermia, sunstroke, dehydration and asthma, or other medical conditions relevant to my team.",
            "hint": "Scouts can demonstrate their knowledge of first aid by listing the symptoms and treatment for various situations.\nScouts understand the need to update medical information prior to a hike.",
        },
        {
            "title": "Trail Skills 6.17",
            "description": "I can be responsible for myself and my team while hiking.",
            "hint": "Scouts display confidence and preparedness on hikes.\nScouts can use Naismith’s rule and its modifications while hiking to set pace and rest positions.\nScouts can explain the role of a good trail leader and trail follower.",
        },
        {
            "title": "Trail Skills 6.18",
            "description": "I can describe the limitations of my team.",
            "hint": "Scouts can demonstrate their team skills by being aware of others’ energy levels or trail conditions which may be beyond others’ skill levels.\nScouts can demonstrate trail etiquette and rules to ensure a safe hiking adventure.",
        },
        {
            "title": "Trail Skills 6.19",
            "description": "I have taken part in at least six hiking activities, at least one of which was a two-night hike.",
            "hint": "Scouts have attended at least six hiking adventures beyond those of previous stages.\nThe hikes can be in various types of terrain.",
        },
        {
            "title": "Trail Skills 6.20",
            "description": "I have written logs for all of these activities.",
            "hint": "Scouts can keep the date, route and other details of the adventure in a log which can be added to with each hiking adventure.",
        },
        {
            "title": "Trail Skills 6.21",
            "description": "I can plan and lead a day hike.",
            "hint": "Scouts can take the leadership role in planning a hike with supervision.\nActivities include choice of area, trail, route preparation, navigation, weather, budget, etc.\nScouts can explain and demonstrate good trail leadership and followership.",
        },
        {
            "title": "Trail Skills 6.22",
            "description": "I can help organize the transportation required for an activity.",
            "hint": "Scouts help to plan rides, ferries and busses to location of a hike.",
        },
    ],
    "Trail Skills 7": [
        {
            "title": "Trail Skills 7.1",
            "description": "I can pack a rucksack for a hiking expedition of more than two nights.",
            "hint": "Scouts can demonstrate how to pack their personal and group gear for a hiking expedition of more than two nights.",
        },
        {
            "title": "Trail Skills 7.2",
            "description": "I can inspect group emergency equipment for a hiking expedition of more than two nights.",
            "hint": "Scouts will recognize equipment that needs maintenance repair or replacement.",
        },
        {
            "title": "Trail Skills 7.3",
            "description": "I can show what group equipment to bring on a hiking expedition of more than two nights and explain why each item is needed.",
            "hint": "Scouts will demonstrate their expertise by describing the equipment.",
        },
        {
            "title": "Trail Skills 7.4",
            "description": "I can choose appropriate lightweight hiking equipment.",
            "hint": "Scouts can demonstrate their expertise by explaining what lightweight equipment is and how it is used, and help to evaluate various makes and brands of equipment prior to its purchase.",
        },
        {
            "title": "Trail Skills 7.5",
            "description": "I can plan and cook a variety of meals on a hiking expedition of more than two nights.",
            "hint": "Scouts can demonstrate cooking while on the hiking expedition.\nMeals can fulfil nutritious needs and sustain energy for hiking.\nScouts can also explain how to pack and carry emergency rations for a hike.",
        },
        {
            "title": "Trail Skills 7.6",
            "description": "I can explain how much food is needed on hiking expeditions of various lengths.",
            "hint": "Scouts can explain how trail snacks can be used on a hike to supply energy.\nScouts can describe how much energy is used on a hike (calories) and how much food is needed to support a hiking expedition.",
        },
        {
            "title": "Trail Skills 7.7",
            "description": "I can navigate at night or in poor visibility.",
            "hint": "Scouts can demonstrate their skill in hiking in poor visibility conditions (e.g. mist or fog) or at night under supervision.\nScouts can locate grid reference points on various terrains.",
        },
        {
            "title": "Trail Skills 7.8",
            "description": "I can use a topographical map to plan a hike in unfamiliar territory.",
            "hint": "Scouts can demonstrate their skill by plotting a route through new territory.",
        },
        {
            "title": "Trail Skills 7.9",
            "description": "I can predict weather changes without the use of weather forecasts.",
            "hint": "Scouts can recognize temperature changes, changes in wind speed and cloud formations, and use these and other indicators to predict the weather on their hiking activity.",
        },
        {
            "title": "Trail Skills 7.10",
            "description": "I can make changes to my group’s outing for safety reasons based on changing weather patterns that can occur during the activity.",
            "hint": "Scouts can recognize temperature changes, changes in wind speed and cloud formations, and use these and other indicators to adjust the hiking activity’s length, duration, camp locations, etc.",
        },
        {
            "title": "Trail Skills 7.11",
            "description": "I can teach trail-travel techniques for various trail types.",
            "hint": "Scouts can demonstrate their expertise to others.",
        },
        {
            "title": "Trail Skills 7.12",
            "description": "I can teach appropriate trail etiquette to other Scouts.",
            "hint": "Scouts can demonstrate their expertise to others.",
        },
        {
            "title": "Trail Skills 7.13",
            "description": "I can assess risk and be aware of group safety.",
            "hint": "Scouts can complete a risk assessment for hiking expeditions.\nScouts can describe the limitations of their team members.\nScouts can make informed decisions about their participation based on various factors including: equipment, weather and skill level.",
        },
        {
            "title": "Trail Skills 7.14",
            "description": "I can plan escape routes.",
            "hint": "Scouts can explain how severe weather or injury can change a hiking expedition and what they would do to incorporate a quick escape to safety or help while planning the expedition.\nScouts can identify escape or safety routes.",
        },
        {
            "title": "Trail Skills 7.15",
            "description": "I have participated in at least five hikes of various lengths.",
            "hint": "Scouts will participate in various types of hikes and terrains different from those experienced for previous stages.\nWhen possible, at least one hike can be to height over 1300 m.",
        },
        {
            "title": "Trail Skills 7.16",
            "description": "I have taken, planned and led one hike without a Scouter.",
            "hint": "Scouts have acted as a leader in the planning and execution of a hike, within Scouts Canada procedures.\nAs part of normal operations, the plan will be discussed with the Group Committee prior to the hike.",
        },
        {
            "title": "Trail Skills 7.17",
            "description": "I have taken part in an unaccompanied but supervised two-night hike.",
            "hint": "Scouts can hike with Scouters nearby to provide aid if necessary.\nEach night’s camp can be in a different location on the route of the hike.",
        },
        {
            "title": "Trail Skills 7.18",
            "description": "I have written logs for all of these activities.",
            "hint": "Scouts can add the details for these hikes including the location, route, weather, interesting points, etc. to their logbook.",
        },
        {
            "title": "Trail Skills 7.19",
            "description": "I can plan and lead an overnight hike.",
            "hint": "Scouts can demonstrate their skills by leading the planning and execution of the overnight hike. Scouts can explain how they will make decisions off and on the trail, who and how the pace of the hike will be determined and how, how and when rest and water breaks will be decided.",
        },
        {
            "title": "Trail Skills 7.20",
            "description": "I can organize the transport required for an activity.",
            "hint": "Scouts can participate in planning the transportation options such as rentals, buses, etc.\nScouts can discuss costs and benefits of their plans.",
        },
        {
            "title": "Trail Skills 7.21",
            "description": "I can research and find information about the hiking destination.",
            "hint": "Scouts can use various methods to prepare for a hiking expedition including personal guides, guidebooks, internet, maps and trail books.",
        },
        {
            "title": "Trail Skills 7.22",
            "description": "I can create a budget for a hiking trip for my group.",
            "hint": "Scouts can prepare for a hiking expedition, considering details including: cost to camp at the destination, water resources and other important information.",
        },
    ],
    "Trail Skills 8": [
        {
            "title": "Trail Skills 8.1",
            "description": "I can teach another youth how to pack for a hiking expedition.",
            "hint": "Scouts can teach others how to pack their personal and group gear for a hiking expedition of more than two nights.",
        },
        {
            "title": "Trail Skills 8.2",
            "description": "I can make recommendations to improve group equipment.",
            "hint": "Scouts can review group equipment and research alternatives to improve hiking experiences.",
        },
        {
            "title": "Trail Skills 8.3",
            "description": "I can navigate accurately and safely over rough terrain in any type of weather, and at night.",
            "hint": "Scouts can demonstrate their expertise in hiking in poor visibility conditions (e.g. mist or fog) or at night under supervision.\nScouts can locate precise points or grid reference points on various terrains.\nTime and accuracy to find the points are important.",
        },
        {
            "title": "Trail Skills 8.4",
            "description": "I can teach another youth how to plan a hike in unfamiliar territory using the appropriate tools.",
            "hint": "Scouts can teach other youth how to find their position on a map and use their map skills to enter coordinates into a GPS unit so that they can navigate from that point to another on the hike.\nScouts can teach how to prepare a route by considering features shown on a topographic map.",
        },
        {
            "title": "Trail Skills 8.5",
            "description": "I can teach how to read weather patterns outdoors without the use of weather forecasts.",
            "hint": "Scouts can explain and describe to other Scouts how temperature changes, changes in wind speed, cloud formations and other indicators can indicate the coming weather.",
        },
        {
            "title": "Trail Skills 8.6",
            "description": "I have completed a Wilderness First Aid course.",
            "hint": "Scouts have completed certification in first aid in an outdoor setting where help is not immediately available.",
        },
        {
            "title": "Trail Skills 8.7",
            "description": "I can follow the procedures in the event of an accident.",
            "hint": "Scouts can prepare a safety plan and can follow the plan directions.",
        },
        {
            "title": "Trail Skills 8.8",
            "description": "I have taken part in at least six hiking adventures of various lengths, two of which include overnight components.",
            "hint": "Scouts can participate in various types of hikes and terrain different from those experienced in previous stages.\nWhen possible, at least one hike can be to height over 1300 m.",
        },
        {
            "title": "Trail Skills 8.9",
            "description": "I can lead a hiking expedition of several nights.",
            "hint": "Scouts can demonstrate their skills by leading the planning and execution of the hike.",
        },
        {
            "title": "Trail Skills 8.10",
            "description": "I can take responsibility for our group on a hiking adventure.",
            "hint": "Scouts can take the lead position on a hiking adventure and demonstrate responsible actions including checks and measures for safety.",
        },
        {
            "title": "Trail Skills 8.11",
            "description": "I have written logs for all of these activities.",
            "hint": "Scouts add the details for these hikes including the location, route, weather, interesting points, etc. to their logbook.",
        },
        {
            "title": "Trail Skills 8.12",
            "description": "I can follow Scouts Canada procedures for a hiking trip.",
            "hint": "Scouts access and complete Scouts Canada’s required forms for outings.",
        },
    ],
    "Trail Skills 9": [
        {
            "title": "Trail Skills 9.1",
            "description": "I know what equipment is required for various hiking expeditions and the correct use and care of this equipment.",
            "hint": "Scouts can demonstrate their knowledge and competency in this area by discussing various situations and the types of equipment (including personal and group equipment) needed and used.",
        },
        {
            "title": "Trail Skills 9.2",
            "description": "I can be responsible for others in various situations on hiking expeditions longer than two nights.",
            "hint": "Scouts can demonstrate their expertise by leading a number of hiking expeditions and have the confidence and leadership skills to lead a hiking expedition in various terrains.",
        },
        {
            "title": "Trail Skills 9.3",
            "description": "I can assess risk and take appropriate action to ensure safety.",
            "hint": "Scouts can recognize the dangers that might be present and other safety considerations for hiking expeditions of various lengths.\nScouts can create a risk management control and safety plan.",
        },
        {
            "title": "Trail Skills 9.4",
            "description": "Where possible, I have taken part in and contributed to the planning of an expedition to 3250 m.",
            "hint": "Scouts can display high level of competency to participate in a high-altitude hiking expedition.",
        },
        {
            "title": "Trail Skills 9.5",
            "description": "I can practise basic winter hiking skills.",
            "hint": "Scouts can demonstrate the preparation hiking and safety skills needed to hike in winter conditions.",
        },
        {
            "title": "Trail Skills 9.6",
            "description": "I have a logbook detailing at least 20 hikes and expeditions that I have undertaken since Stage 7.",
            "hint": "Scouts can add the details for these hikes including the location, route, weather, interesting points, etc. to their logbook.",
        },
        {
            "title": "Trail Skills 9.7",
            "description": "I can create an exciting expedition while catering for everyone’s needs.",
            "hint": "Scouts can lead the development of a hiking expedition for their own age group, as well as younger Scouts.\nScouts can discuss and assess the skill level of others and be aware of the challenges that may be encountered on a hiking expedition.",
        },
        {
            "title": "Trail Skills 9.8",
            "description": "I can budget, prepare and manage every aspect of the expedition without input from Scouters.",
            "hint": "Scouts can use their knowledge from other expeditions to lead the financial planning and budgeting portion of a hiking expedition.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Trail Skills badges and requirements"

    def handle(self, *args, **options):
        category = "trail_skills"

        for badge_name, requirements in TRAIL_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Trail Skills."))