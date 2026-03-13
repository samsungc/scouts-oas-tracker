from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


WINTER_SKILLS_DATA = {
    "Winter Skills 1": [
        {
            "title": "Winter Skills 1.1",
            "description": "I have built something out of snow.",
            "hint": "Scouts will demonstrate an ability to have fun in the outdoors (even in the cold of winter) by building something out of snow such as a snowman, a snow fort, or some kind of snow sculpture.\nThis can be completed as a group activity or individually.\nIt is preferable that this be completed as part of a Scouting activity with the Scout’s team.",
        },
        {
            "title": "Winter Skills 1.2",
            "description": "I have prepared a good snack for a winter outing.",
            "hint": "The Scout will know how to pack a nutritious and tasty snack appropriate for the outing to eat outdoors, bearing in mind that activities in winter require more energy than in other seasons. Snacks should consider the environment and should minimize garbage.",
        },
        {
            "title": "Winter Skills 1.3",
            "description": "I always carry a water bottle when going on a winter outing.",
            "hint": "Scouts should routinely drink water when on outdoor activities and should recognize that being grumpy and tired are early signs of dehydration.",
        },
        {
            "title": "Winter Skills 1.4",
            "description": "I can keep my water bottle from freezing on a winter outing.",
            "hint": "Scouts can keep water bottles from freezing by keeping them under their coats or using an insulated water bottle or water bottle insulating sleeve.",
        },
        {
            "title": "Winter Skills 1.5",
            "description": "I have participated in a winter sports day (Beaveree, Cuboree, winter challenge).",
            "hint": "Scouts will have participated in an outdoor sports or games day, ideally with their Patrol or Section.",
        },
        {
            "title": "Winter Skills 1.6",
            "description": "I know how to dress when I go outside in winter.",
            "hint": "Scouts should demonstrate a basic understanding of how to dress when going outside in the wintertime.\nThey should know to wear a hat, mittens or gloves, and layered clothing appropriate for the climate and conditions.",
        },
        {
            "title": "Winter Skills 1.7",
            "description": "I know to stay dry or change to dry clothes when I am outside in winter.",
            "hint": "Scouts wear clothing made of synthetic fibres to wick moisture and keep dry and warm, or they wear wool clothing, which will stay warm when wet.",
        },
        {
            "title": "Winter Skills 1.8",
            "description": "I know about the buddy system and why it is used when participating in outdoor activities.",
            "hint": "Scouts can describe the buddy system and why it is used, providing some examples of winter emergencies.",
        },
        {
            "title": "Winter Skills 1.9",
            "description": "I know to follow the instructions of the activity leader when at an outdoor event.",
            "hint": "Scouts can explain why they must be especially careful to follow the instructions of an activity leader to make sure that they stay safe from winter and normal hazards.",
        },
        {
            "title": "Winter Skills 1.10",
            "description": "I have hiked at least 1 km in winter.",
            "hint": "Scouts have taken part in a short winter hike, wearing appropriate clothing and packing appropriate gear. They have used the buddy system.",
        },
        {
            "title": "Winter Skills 1.11",
            "description": "I know that I should not touch cold metal with bare skin, especially my lips or tongue.",
            "hint": "Scouts can describe why they should not touch cold metal with bare skin, including what will happen (skin freezes to metal) and what injuries can result (at worst, some skin remains frozen to the metal, resulting in a serious abrasion).",
        },
    ],
    "Winter Skills 2": [
        {
            "title": "Winter Skills 2.1",
            "description": "I have gone sledding or tobogganing.",
            "hint": "When sledding or tobogganing, Scouts follow appropriate safety precautions: staying away from roads and other dangerous obstacles, watching out for others on the hill and wearing appropriate clothing and helmets.",
        },
        {
            "title": "Winter Skills 2.2",
            "description": "I have packed a proper lunch for a winter outing.",
            "hint": "Scouts can describe how to make a nutritious and tasty meal to eat outdoors in the winter.\nPacked lunches should include as little garbage as possible.",
        },
        {
            "title": "Winter Skills 2.3",
            "description": "I have participated in two winter sports days (Beaveree, Cuboree, winter challenge).",
            "hint": "Scouts have participated in two winter sports days, at least one of which was in support of this stage.",
        },
        {
            "title": "Winter Skills 2.4",
            "description": "I know how to pack extra clothes for winter outings.",
            "hint": "Scouts can describe the appropriate clothing for winter outings, including what extra clothing should be packed for a scenario. They can also describe why these clothing articles are appropriate—for example, synthetic fibres will not hold moisture like cotton; wet cotton will make one cold.",
        },
        {
            "title": "Winter Skills 2.5",
            "description": "I know how to keep my feet dry while I am outside in the winter.",
            "hint": "Scouts know how to keep their feet dry by using waterproof boots and staying out of water.\nScouts can describe why a change of dry wool or synthetic socks is important.",
        },
        {
            "title": "Winter Skills 2.6",
            "description": "When I come inside, I know how to put away my outdoor clothing so that it will dry quickly.",
            "hint": "Scouts can describe how to hang up clothing to dry safely (not burning, melting or catching fire) and effectively.",
        },
        {
            "title": "Winter Skills 2.7",
            "description": "I can help less experienced Scouts to get dressed to go outside.",
            "hint": "Scouts can help less experienced Scouts with tying boots, doing up zippers or making sure they have their toques and mittens on properly.",
        },
        {
            "title": "Winter Skills 2.8",
            "description": "I have attended one overnight winter camp or sleepover.",
            "hint": "Scouts can spend one night at a winter camp.\nAt this stage, it is acceptable for the Scout to have spent the night in a heated cabin or other permanent shelter.",
        },
        {
            "title": "Winter Skills 2.9",
            "description": "I have completed two winter hikes of at least 1 km.",
            "hint": "With their Section and/or Patrol, Scouts can complete two short hikes in winter conditions, specifically for this stage.",
        },
        {
            "title": "Winter Skills 2.10",
            "description": "I know to avoid ice or open water without an adult present.",
            "hint": "Scouts can demonstrate an understanding of this hazard and know to avoid iced-over rivers, lakes or ponds without adult supervision.",
        },
        {
            "title": "Winter Skills 2.11",
            "description": "I have made a piece of simple winter gear or clothing (wristlet or neck warmer).",
            "hint": "Scouts can make a piece of winter gear or clothing and describe its use and value for winter Adventures.",
        },
    ],
    "Winter Skills 3": [
        {
            "title": "Winter Skills 3.1",
            "description": "I have participated in a winter sport (alpine skiing, cross-country skiing, snowshoeing, snowboarding, skating, hockey, tobogganing, sledding, curling).",
            "hint": "With members of their Section, family or through school, Scouts will have participated in a winter sporting activity (such as one listed above).\nIt is not expected that Scouts will participate in a league or achieve a specific proficiency in the sport.",
        },
        {
            "title": "Winter Skills 3.2",
            "description": "I can light a small fire.",
            "hint": "Scouts can demonstrate the ability to light a small fire in winter conditions.\nThe principles of Leave No Trace should be adhered to.",
        },
        {
            "title": "Winter Skills 3.3",
            "description": "I have helped plan a menu for a winter camp.",
            "hint": "Scouts can work with members of their team to produce a balanced menu for a winter camp.",
        },
        {
            "title": "Winter Skills 3.4",
            "description": "I have cooked a lunch over an open fire.",
            "hint": "Scouts can cook a simple meal over an open fire.",
        },
        {
            "title": "Winter Skills 3.5",
            "description": "I understand the layering principle when dressing for winter activities and apply it to all activities.",
            "hint": "Scouts can explain the principles behind layering clothes (wicking, warmth and wind/wet) for winter activities and have an opportunity to demonstrate this skill.\nScouts understand what clothing fabrics are appropriate and are aware of less-expensive options.",
        },
        {
            "title": "Winter Skills 3.6",
            "description": "With a small group, I have built an emergency shelter in winter.",
            "hint": "Scouts can build a simple emergency shelter with tarp, piece of plastic, snow or other easily-obtainable items and materials.\n(At this stage it is not expected that Scouts will be able to produce an “expert” shelter; rather, they should have had an opportunity to work as a member of a team trying to build a simple shelter.)",
        },
        {
            "title": "Winter Skills 3.7",
            "description": "I know how to find shelter from the wind on a cold day.",
            "hint": "Scouts can demonstrate the ability to find shelter from the wind when outdoors in winter conditions.",
        },
        {
            "title": "Winter Skills 3.8",
            "description": "I can pack a day pack for a winter outing.",
            "hint": "Scouts can demonstrate the ability to pack a personal day pack for a winter outing.",
        },
        {
            "title": "Winter Skills 3.9",
            "description": "I know how to watch my fellow Scouts for signs of exposure to the cold.",
            "hint": "Scouts can demonstrate how to identify signs of hypothermia and/or frostbite.\n(Please refer to the Field Book for Canadian Scouting.)",
        },
        {
            "title": "Winter Skills 3.10",
            "description": "I have spent one night at winter camp in a cabin or heated tent (in addition to requirements for previous stages).",
            "hint": "Scouts can spend one night at a winter camp in a cabin or heated tent.",
        },
        {
            "title": "Winter Skills 3.11",
            "description": "I can identify the North Star and three other features in the winter night sky.",
            "hint": "Scouts can identify the North Star as well as some of the constellations and/or planets in the winter night sky, and can describe why they can be valuable for navigation and culture.",
        },
        {
            "title": "Winter Skills 3.12",
            "description": "I have completed a winter hike of at least 3 km.",
            "hint": "As part of their Section and/or Patrol, Scouts can complete a 3 km hike in winter conditions.",
        },
        {
            "title": "Winter Skills 3.13",
            "description": "I have made a winter survival kit that I take with me on all winter activities.",
            "hint": "Scouts can make a winter survival kit that is suitable for all winter activities.\nScouts can explain why they have included the items in the kit and how each can be used in a winter emergency, and they can explain why other possible items are not included.\nScouts can describe possible scenarios (lost in the woods, stranded in a vehicle or cabin due to the weather) in which the kit could be used.",
        },
        {
            "title": "Winter Skills 3.14",
            "description": "In addition to previous stages, I have made a piece of winter gear or clothing.",
            "hint": "Scouts can make a significant item of winter gear or clothing.",
        },
    ],
    "Winter Skills 4": [
        {
            "title": "Winter Skills 4.1",
            "description": "I have participated in a winter sport (different from the sport done in earlier stages).",
            "hint": "With members of their Section, family, or through school, Scouts can participate in a winter sporting activity.\n(It is not expected that Scouts will participate in a league or achieve a specific level of proficiency in the given sport.)",
        },
        {
            "title": "Winter Skills 4.2",
            "description": "I have helped purchase food for a winter outing.",
            "hint": "With members of their Patrol, Scouts can assist in purchasing appropriate food for a winter outing. They can explain the rationale for the food chosen, addressing considerations such as taste, nutrition, cost and packing weight and volume.",
        },
        {
            "title": "Winter Skills 4.3",
            "description": "I have helped cook meals at winter camp.",
            "hint": "As part of a team, Scouts can help prepare more than one meal for their Patrol while at winter camp.",
        },
        {
            "title": "Winter Skills 4.4",
            "description": "I have attended a winter campfire.",
            "hint": "Scouts can participate in at least one outdoor winter campfire.",
        },
        {
            "title": "Winter Skills 4.5",
            "description": "I have put up a tent in winter to sleep in.",
            "hint": "As a part of their Patrol, Scouts can put up a tent in winter conditions and sleep in it overnight.",
        },
        {
            "title": "Winter Skills 4.6",
            "description": "I can properly set up my sleeping area to stay warm through the night at winter camp.",
            "hint": "Scouts can demonstrate how to properly set up their sleeping areas to stay warm and comfortable while at winter camp.",
        },
        {
            "title": "Winter Skills 4.7",
            "description": "I have used a toboggan or sled to transport equipment.",
            "hint": "Scouts can use a toboggan or sled to transport personal and/or Patrol equipment to camp.",
        },
        {
            "title": "Winter Skills 4.8",
            "description": "I have taught a winter skill to a less experienced Scout.",
            "hint": "Scouts can teach a winter skill to a less-experienced Scout.",
        },
        {
            "title": "Winter Skills 4.9",
            "description": "I have spent two consecutive nights at winter camp (in addition to requirements for previous stages).",
            "hint": "Scouts can spend two consecutive nights at a winter camp. At this stage, it is acceptable for the Scout to spend one of these two nights in a heated cabin or other permanent shelter.",
        },
        {
            "title": "Winter Skills 4.10",
            "description": "I have traveled in snow using snowshoes or nordic skis.",
            "hint": "Scouts can travel in snow wearing snowshoes or nordic skis.",
        },
        {
            "title": "Winter Skills 4.11",
            "description": "I have participated in two 3 km hikes.",
            "hint": "As part of their Section and/or Patrol, Scouts can complete two 3 km hike in winter conditions.",
        },
        {
            "title": "Winter Skills 4.12",
            "description": "I know how to help someone who has fallen through the ice.",
            "hint": "Scouts can demonstrate how assist in rescuing someone who has fallen through the ice.\nPlease refer to the Field Book for Canadian Scouting.",
        },
        {
            "title": "Winter Skills 4.13",
            "description": "I know how to prevent and treat hypothermia and frostbite.",
            "hint": "Scouts can explain and demonstrate how to prevent and treat hypothermia and frostbite.\nPlease refer to the Field Book for Canadian Scouting.",
        },
        {
            "title": "Winter Skills 4.14",
            "description": "I know how to avoid and treat snow blindness.",
            "hint": "Scouts can explain and demonstrate how to prevent and treat snow blindness.\nPlease refer to the Field Book for Canadian Scouting.",
        },
    ],
    "Winter Skills 5": [
        {
            "title": "Winter Skills 5.1",
            "description": "I have played an outdoor game in winter at least six Scout meetings.",
            "hint": "Outdoor games at a winter Scout meeting can include anything from tag to snowshoe soccer. An associated requirement is that Scouts come to all meetings prepared to spend time outside (regardless of the weather) in order to be able to complete this requirement.",
        },
        {
            "title": "Winter Skills 5.2",
            "description": "I have led my Patrol in planning and purchasing meals for a winter camp.",
            "hint": "Scouts can lead their Patrols in planning and purchasing food for a winter camp.\nScouts can explain the rationale behind the menu, explaining considerations such as taste, nutrition, budget and food weight and volume.",
        },
        {
            "title": "Winter Skills 5.3",
            "description": "I have been chief cook for at least one meal at winter camp.",
            "hint": "Scouts can lead Patrols in preparing at least one balanced and tasty meal while at winter camp.",
        },
        {
            "title": "Winter Skills 5.4",
            "description": "I have helped to run a campfire at a winter camp.",
            "hint": "Scouts can assist in running a formal campfire while at a winter camp.\nThis could include laying the fire, running the opening, planning the program, leading some songs or telling a story.",
        },
        {
            "title": "Winter Skills 5.5",
            "description": "I am able to pack the appropriate clothing and equipment for a two-night winter camp.",
            "hint": "Scouts can demonstrate the ability to pack appropriate clothing and gear for a two-night winter camp.",
        },
        {
            "title": "Winter Skills 5.6",
            "description": "I have built and slept in a temporary winter shelter such as a quinzhee, snow trench or a lean-to.",
            "hint": "As a part of their Patrol, Scouts can build and sleep in a temporary shelter that they have built themselves.",
        },
        {
            "title": "Winter Skills 5.7",
            "description": "I can lay and light a fire in winter conditions for warmth and cooking.",
            "hint": "Scouts can lay, light and maintain a fire in winter conditions that can be used for cooking and for comfort.",
        },
        {
            "title": "Winter Skills 5.8",
            "description": "I can use a liquid fuel stove in winter conditions and understand why it is important not to get fuel on clothing and skin.",
            "hint": "Scouts can safely use a liquid fuel stove in winter conditions; they can safely transfer fuel, safely and properly set up a stove on a suitable surface, and light and manage the stove.\nScouts can explain safety hazards of using a stove and handling fuel, and how to manage identified hazards.\nScouts can explain appropriate responses to possible emergency scenarios related to operating a liquid fuel stove in winter conditions.",
        },
        {
            "title": "Winter Skills 5.9",
            "description": "I have helped lead a winter sports day.",
            "hint": "As a part of a Patrol, Scouts can lead a winter sports day for a younger Section.",
        },
        {
            "title": "Winter Skills 5.10",
            "description": "I have slept outside for two nights in winter (in addition to requirements for previous stages).",
            "hint": "Scouts can spend two consecutive nights at a winter camp. At this stage, it is expected that Scouts stay in a temporary shelter that they have built or a tent.",
        },
        {
            "title": "Winter Skills 5.11",
            "description": "I have participated in a winter hike lasting at least six hours and covering at least 6 km.",
            "hint": "As a part of a Patrol, Scouts can hike for at least six hours, covering at least 6 km. This can be done using snowshoes or nordic skis.",
        },
        {
            "title": "Winter Skills 5.12",
            "description": "I have hiked a minimum of 5 km in winter conditions following compass bearings.",
            "hint": "Scouts can hike a minimum of 5 km following compass bearings. This can be done as a part of the six-hour hike completed for this stage.",
        },
        {
            "title": "Winter Skills 5.13",
            "description": "I know how to avoid, recognize and treat carbon monoxide poisoning (which can occur in winter shelters).",
            "hint": "Scouts can describe how to avoid and treat carbon monoxide poisoning.\nScouts can identify possible causes of carbon monoxide poisoning related to winter camping.",
        },
        {
            "title": "Winter Skills 5.14",
            "description": "I have a first aid qualification equivalent to the Scout First Aid badge (St John’s or Red Cross Standard First Aid).",
            "hint": "Scouts will have completed standard first aid training.",
        },
        {
            "title": "Winter Skills 5.15",
            "description": "I can execute a ladder rescue, chain assist and reaching assist for someone who has fallen through the ice.",
            "hint": "Scouts Canada Field Book pages 188–89 describe the required rescue techniques.",
        },
    ],
    "Winter Skills 6": [
        {
            "title": "Winter Skills 6.1",
            "description": "I have led an outdoor winter game for a younger Section.",
            "hint": "Scouts can select, teach and lead an appropriate outdoor winter game for a younger Section.",
        },
        {
            "title": "Winter Skills 6.2",
            "description": "I know how to obtain and keep a supply of safe drinking water for a winter camp.",
            "hint": "Scouts can describe how water can be obtained by melting snow or ice, or sourcing from open water or under ice.\nScouts can describe how melting snow or ice will impact a camp with regard to time and gear (eg-fuel).\nScouts can describe how to determine if ice is safe to venture out on, and how to treat water to make it safe to drink.\nScouts can list what gear is needed to source water in winter conditions (axe, auger, safety equipment, purification equipment).",
        },
        {
            "title": "Winter Skills 6.3",
            "description": "I know how to store water overnight so that it will not freeze.",
            "hint": "Scouts can describe how to keep water from freezing by keeping it in secure and near one’s body in a sleeping bag.",
        },
        {
            "title": "Winter Skills 6.4",
            "description": "I have baked bread or a dessert at a winter camp.",
            "hint": "Scouts know how to bake in winter conditions using an improvised trail oven using pots, a commercial trail oven or reflector oven.",
        },
        {
            "title": "Winter Skills 6.5",
            "description": "I have taught a less experienced Scout how to dress for winter activities.",
            "hint": "Scouts can teach less experienced Scouts about dressing in layers (wicking, warmth and wind/wet), what clothing fabrics are appropriate and less expensive options.",
        },
        {
            "title": "Winter Skills 6.6",
            "description": "I have taught a less experienced Scout how to build a winter shelter.",
            "hint": "Scouts can teach less experienced Scouts to construct a shelter from snow or other materials (tarp, parachute, etc.).",
        },
        {
            "title": "Winter Skills 6.7",
            "description": "I can do simple repairs on liquid fuel stoves.",
            "hint": "Scouts know how to:\n• dry out a stove that has snow or water in the burners\n• oil the pump leather when the pump will not pressurize the fuel tank",
        },
        {
            "title": "Winter Skills 6.8",
            "description": "I have led a cooking team for a winter camp.",
            "hint": "Scouts can lead a team in cooking all meals (breakfast, lunch and supper) at a camp.\nScouts can describe the rationale behind the menu: taste, nutrition, budget and weight and volume considerations.",
        },
        {
            "title": "Winter Skills 6.9",
            "description": "I have assisted at a winter sports day in a leadership role.",
            "hint": "Scouts can help at a winter Beaveree, Cuboree or community event where the activities are primarily outside.",
        },
        {
            "title": "Winter Skills 6.10",
            "description": "I have slept outside for two nights in a lightweight shelter in winter (in addition to requirements for previous stages).",
            "hint": "Scouts can sleep outside in winter conditions in a lightweight shelter such as a tent.",
        },
        {
            "title": "Winter Skills 6.11",
            "description": "I have practised a winter evacuation of a simulated causality.",
            "hint": "Scouts can practise a winter evacuation using a sled or other improvised self-propelled method of person/gear transportation to a road .5 km from the simulated injury.",
        },
    ],
    "Winter Skills 7": [
        {
            "title": "Winter Skills 7.1",
            "description": "I know how to plan and implement a simple but nutritious menu for a mobile winter camp.",
            "hint": "Scouts can plan a menu that will meet the nutritional needs of growing youth in the cold.\nThe food can be easily transported using packs or on sleds, depending how the Scouts plan to carry gear.",
        },
        {
            "title": "Winter Skills 7.2",
            "description": "I know how to select an appropriate tent for winter camping.",
            "hint": "Scouts can explain what makes a tent appropriate for winter camping (ventilation, snow load, overall stability).",
        },
        {
            "title": "Winter Skills 7.3",
            "description": "I have made a piece of winter camping or winter safety equipment.",
            "hint": "Scouts can make a piece of winter camping or winter safety equipment, such as: snow goggles, ice recovery picks, snowshoes, adapted pulk sled for hauling winter gear, or freight toboggan).",
        },
        {
            "title": "Winter Skills 7.4",
            "description": "I have participated in a winter mobile expedition of at least three days (two nights).",
            "hint": "Scouts can participate in a challenging winter day hike (back country, alpine) appropriate to their region.\nScouts can prepare the emergency plan for a winter day hike or overnight camp that takes into consideration local winter dangers such as avalanche, wet climate, wind chill, freezing rain, or other weather patterns that could lead to unsafe conditions for their Section.\nScouts can submit the plan to the Group Commissioner for approval with the Outdoor Activity Application.",
        },
        {
            "title": "Winter Skills 7.5",
            "description": "I have maintained my first-aid certification.",
            "hint": "Scouts can maintain standard first-aid certification officially recognized by a reputable organization, such as St. John’s Ambulance, the Red Cross, or a local EMT provider.",
        },
    ],
    "Winter Skills 8": [
        {
            "title": "Winter Skills 8.1",
            "description": "I can carry out repairs on gas-fuelled stoves in winter conditions.",
            "hint": "Scouts can determine the causes of problems and conduct the necessary repairs to keep stoves running at camp in winter conditions.",
        },
        {
            "title": "Winter Skills 8.2",
            "description": "With a team, I have provided leadership for a one- or two-night activity.",
            "hint": "Scouts can provide a fun and safe overnight activity in the winter for younger Scouts.\nScouts can engage less-experienced youth in the Plan-Do-Review process.",
        },
        {
            "title": "Winter Skills 8.3",
            "description": "I have participated in a five-day (four-night) mobile winter expedition.",
            "hint": "Scouts can participate in a five-day mobile expedition in winter.\nScouts can demonstrate a comprehensive understanding of the risks and mitigating measures for the climatic conditions in a specific region during winter and can select the most appropriate equipment for an activity.",
        },
        {
            "title": "Winter Skills 8.4",
            "description": "I understand the risks and am able to implement appropriate safety procedures for camping in heated tents.",
            "hint": "Scouts can demonstrate an understanding of the challenges and advantages of hot tenting and can describe the specific safety considerations in selecting equipment for this activity.",
        },
        {
            "title": "Winter Skills 8.5",
            "description": "I have wilderness first aid certifications appropriate for the areas in which I am traveling and the activities I am doing.",
            "hint": "Scouts have the necessary qualifications and skills to provide first aid during an extended winter expedition.\nScouts can recognize and treat conditions common in winter conditions such as snow blindness, frostbite, hypothermia and carbon monoxide poisoning; furthermore, Scouts know how to prevent such medical conditions.",
        },
    ],
    "Winter Skills 9": [
        {
            "title": "Winter Skills 9.1",
            "description": "I have led a winter campfire.",
            "hint": "Scouts can lead a winter campfire, and describe the hazards of the activity (especially for younger Scouts) and how they can be addressed.",
        },
        {
            "title": "Winter Skills 9.2",
            "description": "I have led a mobile winter expedition of three to five days.",
            "hint": "As the leader of an extended winter expedition, Scouts can demonstrate the skills required to ensure the safety and comfort of the expedition members (using Plan-Do-Review).",
        },
        {
            "title": "Winter Skills 9.3",
            "description": "I have slept outside at least 20 nights (including nights from previous stages) in winter conditions.",
            "hint": "Through the course of all stages, Scouts have slept in cabins, tents and temporary shelters for at least 20 nights.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Winter Skills badges and requirements"

    def handle(self, *args, **options):
        category = "winter_skills"

        for badge_name, requirements in WINTER_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Winter Skills."))