from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


SCOUTCRAFT_SKILLS_DATA = {
    "Scoutcraft Skills 1": [
        {
            "title": "Scoutcraft Skills 1.1",
            "description": "I can hang a drying line at camp with a half hitch or other knot.",
            "hint": "Scouts can hang a line that can hold items for the whole Patrol.",
        },
        {
            "title": "Scoutcraft Skills 1.2",
            "description": "I can keep my mess kit clean at camp.",
            "hint": "Scouts can properly clean their mess kits with hot water and soap, and properly bleach and rinse.",
        },
        {
            "title": "Scoutcraft Skills 1.3",
            "description": "When outdoors or at camp, I know what is drinkable (safe) and not drinkable (unsafe) water, and to check with a Scouter when I am unsure.",
            "hint": "Scouts can explain where to get drinkable water at a camp and where not to get water.",
        },
        {
            "title": "Scoutcraft Skills 1.4",
            "description": "I know why it is important to stick to trails when outdoors.",
            "hint": "Scouts can explain that they must stay on trails to keep from getting lost.",
        },
        {
            "title": "Scoutcraft Skills 1.5",
            "description": "I know three reasons for having a shelter when sleeping outdoors.",
            "hint": "Scouts can explain that a shelter is used to keep warm, to stay out of the rain or hot sun, and to stay out of the wind.",
        },
        {
            "title": "Scoutcraft Skills 1.6",
            "description": "I can name three wildflowers by direct observation in a wild field, bush or forest.",
            "hint": "Scouts can find and identify three wildflowers growing in the wild.",
        },
        {
            "title": "Scoutcraft Skills 1.7",
            "description": "I can gather dry, burnable wood for a fire.",
            "hint": "Scouts can find dry wood in the right sizes for a campfire (tinder, kindling, fuel).",
        },
        {
            "title": "Scoutcraft Skills 1.8",
            "description": "I know to tell adults where I am going when outdoors.",
            "hint": "Scouts can explain why it is important to always tell an adult where they will be when in the outdoors.",
        },
        {
            "title": "Scoutcraft Skills 1.9",
            "description": "I know how to keep a camp clean.",
            "hint": "Scouts can keep personal equipment clean and organized and can help keep the fire pit, kitchen, sleeping area and dining area clean and free from trash and equipment that should be stored in the proper place.\nScouts can explain why a clean and tidy camp is important.",
        },
    ],
    "Scoutcraft Skills 2": [
        {
            "title": "Scoutcraft Skills 2.1",
            "description": "I can tie a reef knot, a round turn and two half-hitch knots.",
            "hint": "Scouts can demonstrate each of these knots correctly and explain good uses for each.",
        },
        {
            "title": "Scoutcraft Skills 2.2",
            "description": "I can cook a foil-wrapped meal in a fire.",
            "hint": "Scouts can cook a complete foil-wrapped meal, and can describe other meals that could be cooked using this method.",
        },
        {
            "title": "Scoutcraft Skills 2.3",
            "description": "I know how much water I should carry when on a hike or taking part in an outdoor activity, and I know how to carry the water.",
            "hint": "Scouts can fill their water bottles while out hiking and know that their bottles should always be full when they start out on a hike.\nScouts can explain why carrying plenty of water is important.",
        },
        {
            "title": "Scoutcraft Skills 2.4",
            "description": "I know what natural shelter materials or locations are to keep out of the wind, rain, sun and snow, and where these may be found.",
            "hint": "Scouts can use tree bows, grasses and bushes as wind and weather breaks and covers.\nScouts can also use rock formations and large trees as weather shields.\nScouts can demonstrate how to incorporate natural features and materials into a constructed shelter.",
        },
        {
            "title": "Scoutcraft Skills 2.5",
            "description": "I can identify four trees by direct observation in a wild field, bush or forest.",
            "hint": "Scouts can consistently identify and name four trees in the wild.",
        },
        {
            "title": "Scoutcraft Skills 2.6",
            "description": "I have helped light a fire using only natural fire-starter materials found in the forest, and I know the safety rules for when around a campfire.",
            "hint": "Scouts can use a match or lighter to start the fire, but only natural material grown in the outdoors may be used as fire starter materials.",
        },
        {
            "title": "Scoutcraft Skills 2.7",
            "description": "I know why it is important to use a buddy system when traveling in the forest.",
            "hint": "Scouts can explain that the buddy system is helpful because if something were to happen, a Scout buddy can go for help.",
        },
        {
            "title": "Scoutcraft Skills 2.8",
            "description": "I know the rules for hygiene at camp (for eating and preparing food).",
            "hint": "Scouts know that they must wash and disinfect their hands before handling any food.",
        },
    ],
    "Scoutcraft Skills 3": [
        {
            "title": "Scoutcraft Skills 3.1",
            "description": "I can tie a half hitch, clove hitch and a fisherman’s knot.",
            "hint": "Scouts can demonstrate the three knots tied to a mastery level with a firm feel to the knot, symmetry with no twists or cross overs in the knot, with a 5–10 cm tail at the end of the knot, and can explain a good use for each.",
        },
        {
            "title": "Scoutcraft Skills 3.2",
            "description": "I can cook a meal on a camp stove.",
            "hint": "Scouts can use a camp stove to cook a meal for their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 3.3",
            "description": "I can use a shovel to build a camp greywater sump pit, and close the pit when finished.",
            "hint": "Scouts can build and maintain a pit at a campout.",
        },
        {
            "title": "Scoutcraft Skills 3.4",
            "description": "I have boiled water over a campfire, and know the safety precautions around fires and hot pots.",
            "hint": "Scouts can boil a pot of water on or next to a fire.\nScouts know not to poke sticks or throw trash into a fire.\nScouts know not to leave a fire or hot coals unattended.\nScouts know to use insulated hand protection when working with hot pots.\nScouts know there is no horseplay around fires.",
        },
        {
            "title": "Scoutcraft Skills 3.5",
            "description": "I know the first-aid treatment for burns from hot water, grease and food.",
            "hint": "Scouts know to remove the source of the heat.\nScouts know that immediate cooling of the burn is required.\nScouts know that infections are a risk from burns and can apply the appropriate medication and dressing to the burn.",
        },
        {
            "title": "Scoutcraft Skills 3.6",
            "description": "I have used a compass to walk on a bearing.",
            "hint": "Scouts have walked for a minimum of 2 km using a compass bearing and arrived successfully at their intended destination.",
        },
        {
            "title": "Scoutcraft Skills 3.7",
            "description": "I can make a personal shelter out of plastic sheeting and rope.",
            "hint": "Scouts can make a waterproof shelter large enough to sleep under.",
        },
        {
            "title": "Scoutcraft Skills 3.8",
            "description": "I can identify three wild animal tracks.",
            "hint": "Scouts can identify three sets of animal tracks from different species in the wild.",
        },
        {
            "title": "Scoutcraft Skills 3.9",
            "description": "I can lay and start a fire with only matches and materials found in the forest.",
            "hint": "Scouts can lay and start a fire large enough to keep three persons warm using only matches and natural materials found in the forest.",
        },
        {
            "title": "Scoutcraft Skills 3.10",
            "description": "I have put together a personal outdoor survival kit.",
            "hint": "Scouts can demonstrate a personal outdoor survival kit suitable for a particular expedition, explaining the rationale for the items included and the items left out.",
        },
        {
            "title": "Scoutcraft Skills 3.11",
            "description": "I know what makes a comfortable and safe place for a sleeping shelter or site.",
            "hint": "Scouts know to look for a smooth and level surface to sleep on.\nScouts know to keep the site out of the wind and (where possible) precipitation.\nScouts know to look up and ensure there are no hazards from falling objects such as rocks and dead trees or limbs.\nScouts know to keep off of animal trails or human walking paths.\nScouts know to keep the site out of low areas where water may pool or run through.\nScouts know to keep a site out of a possible avalanche or landslide path.",
        },
    ],
    "Scoutcraft Skills 4": [
        {
            "title": "Scoutcraft Skills 4.1",
            "description": "I have completed a Scoutcraft project with my Scout team using at least a square lashing to join two poles at right angles.",
            "hint": "Scouts must have a Scouter inspect the construction before use.",
        },
        {
            "title": "Scoutcraft Skills 4.2",
            "description": "I can tie a figure eight, bowline, trucker’s hitch and sheet bend, and whip the end of a rope.",
            "hint": "Scouts can tie the four knots to a mastery level with a firm feel for the knot, symmetry with no twists or crossovers in the knot, and with a 5–10 cm tail at the end of the knot where required.\nA rope over 8 mm in diameter is to be used to demonstrate the whipping skill.",
        },
        {
            "title": "Scoutcraft Skills 4.3",
            "description": "I can cook over a fire to roast and bake food items.",
            "hint": "Scouts can cook (by both roasting and baking over a fire) enough food to be shared with the Patrol.",
        },
        {
            "title": "Scoutcraft Skills 4.4",
            "description": "I can use a knife safely (opening, closing, passing, cleaning, caring for) and have earned my knife permit.",
            "hint": "Scouts must demonstrate these skills to a Scouter to obtain a permit.",
        },
        {
            "title": "Scoutcraft Skills 4.5",
            "description": "I know how to disinfect water for drinking.",
            "hint": "Scouts must demonstrate this knowledge by preparing a minimum of a 1 litre bottle filled with water from a natural source.",
        },
        {
            "title": "Scoutcraft Skills 4.6",
            "description": "I can establish the four cardinal directions (north, south, east, west) without a magnetic compass or any electronic means.",
            "hint": "Scouts can establish the cardinal points and explain how they accomplished this task.",
        },
        {
            "title": "Scoutcraft Skills 4.7",
            "description": "I can build a personal sleeping shelter out of snow or any other natural materials.",
            "hint": "Scouts can construct a shelter that protects from wind, rain, sun and snow.",
        },
        {
            "title": "Scoutcraft Skills 4.8",
            "description": "I can safely identify three edible wild plants. (Note: Scouters must approve all plants before they are consumed by Scouts.)",
            "hint": "Scouts can safely identify three edible wild plants in a natural setting and context. Scouters must approve all plants before they are consumed by Scouts.",
        },
        {
            "title": "Scoutcraft Skills 4.9",
            "description": "I can quickly (under five minutes) build an emergency warming fire for a group of three persons without using tools (only matches).",
            "hint": "Within five minutes (timed), Scouts can build a fire that should be burning sufficiently so that it does not require fuel or manipulation to remain reliably burning.",
        },
        {
            "title": "Scoutcraft Skills 4.10",
            "description": "I know what to do if lost and alone outdoors with no constructed shelter available.",
            "hint": "Scouts know:\n• To not panic and try to stay calm.\n• To call out for help or use a signaling device such as whistle or phone.\n• To retrace their steps, if possible—otherwise, stay put in place.\n• To try to find or make a shelter out of the wind and precipitation.\n• To dress warmly; light a warming and signal fire if possible.\n• To spread out visible material on the ground for air searchers to see.",
        },
        {
            "title": "Scoutcraft Skills 4.11",
            "description": "I can set up a tree food hang to protect my food from animals.",
            "hint": "Scouts can set up a hang that can support at least 5 kilograms of weight.",
        },
    ],
    "Scoutcraft Skills 5": [
        {
            "title": "Scoutcraft Skills 5.1",
            "description": "I have built a lean-to shelter and an A-frame sleeping tripod shelter using wood, tied with four lashing knots: square, diagonal, tripod and shear lashings.",
            "hint": "Scouts can build both of these shelters, suitable for one person to sleep in.",
        },
        {
            "title": "Scoutcraft Skills 5.2",
            "description": "I have cooked with cast-iron cookware (or substitute cookware) by placing cookware in the fire or coals, as well as on top of the fire or coals.",
            "hint": "Scouts can cook a meal over a fire or coals using cast iron cookware suitable to feed a minimum of three persons.",
        },
        {
            "title": "Scoutcraft Skills 5.3",
            "description": "I know how to use a camp axe and camp folding saw or bow saw safely (opening, closing, passing, cleaning, caring for, sharpening, cutting), and have obtained the appropriate permits for these.",
            "hint": "Scouts will demonstrate axe and saw skills consistently over a campout.",
        },
        {
            "title": "Scoutcraft Skills 5.4",
            "description": "I have maintained and used a commercial backpacking portable water-treatment device, and know the limitations, advantages and disadvantages of the device.",
            "hint": "Scouts will demonstrate these skills over a campout or a two-day trail outing.",
        },
        {
            "title": "Scoutcraft Skills 5.5",
            "description": "I have navigated using a magnetic compass bearing (all off trail) 3 km to a predetermined fixed point in a wilderness area.",
            "hint": "Scouts are to demonstrate this skill by leading a Patrol on an off-trail outing over 3 km using a magnetic compass bearing.",
        },
        {
            "title": "Scoutcraft Skills 5.6",
            "description": "I have built a shelter big enough for three, made of only natural materials found outdoors and rope, and I have slept out in it for at least two nights.",
            "hint": "Scouts can construct a shelter suitable enough to keep out wind and precipitation, and the shelter has been used over at least two nights.",
        },
        {
            "title": "Scoutcraft Skills 5.7",
            "description": "I have caught, cleaned and cooked a fish over a campfire (check local regulations for species, size and season prohibitions).",
            "hint": "Scouts may use any tools or equipment they can carry in a backpack to accomplish this task. Scouts must follow local regulations with regard to both fishing and campfires.",
        },
        {
            "title": "Scoutcraft Skills 5.8",
            "description": "I have laid and lit a teepee fire, pyramid fire, star fire and reflector fire.",
            "hint": "Scouts are to demonstrate all four of these fires to a level that is suitable enough to warm one person.",
        },
        {
            "title": "Scoutcraft Skills 5.9",
            "description": "I have built an improvised stretcher out of rope, overnight backpacking camping equipment and natural materials found outdoors.",
            "hint": "Scouts are to construct a stretcher suitable to carry the weight of one person.",
        },
        {
            "title": "Scoutcraft Skills 5.10",
            "description": "I have dehydrated 1000 calories of food and taken it on a camping trip as my trail snack for two days.",
            "hint": "Scouts are to share this dehydrated food with their Patrol during a hiking or camping outing.",
        },
    ],
    "Scoutcraft Skills 6": [
        {
            "title": "Scoutcraft Skills 6.1",
            "description": "I have built a usable Burma/Monkey bridge.",
            "hint": "Scouts can construct a bridge a minimum of 5 metres long. The bridge can be tested, but should not be used high off the ground.",
        },
        {
            "title": "Scoutcraft Skills 6.2",
            "description": "I have built and cooked on a personal-sized stove only made out of tin cans, wax, candle wicks and cardboard (a buddy stove).",
            "hint": "Scouts can demonstrate their stove’s capacity to boil a pot of water for a hot drink.",
        },
        {
            "title": "Scoutcraft Skills 6.3",
            "description": "Using a knife and axe, I have prepared a 10-person campfire with tinder, kindling and fuel logs gathered from a forest floor. The fire burned for five hours with all wood gathered before the fire was lit (no gathering additional fire wood once the fire is lit and burning).",
            "hint": "Scouts can demonstrate this skill at an evening campout fire.",
        },
        {
            "title": "Scoutcraft Skills 6.4",
            "description": "I have built a solar still and collected at least one cup of drinking water from the still.",
            "hint": "Scouts can demonstrate this skill to their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 6.5",
            "description": "I have navigated to and found 10 geocache locations.",
            "hint": "Scouts can use any type of navigational aids, but they need to explain how they navigated to the cache sites.",
        },
        {
            "title": "Scoutcraft Skills 6.6",
            "description": "I have built and slept two nights in an igloo, quinzhee or trench snow shelter capable of sleeping three persons.",
            "hint": "Scouts demonstrating this skill do not need to use their shelter on consecutive nights, and they do not need to share their shelter with two other Scouts overnight.",
        },
        {
            "title": "Scoutcraft Skills 6.7",
            "description": "I have identified 15 bird species in the wild using a written birding record journal.",
            "hint": "Scouts can identify 15 bird species in the wild using a written birding record journal that includes information such as species name, habitat, weather, date and time, appearance, behaviour, flock size, etc.",
        },
        {
            "title": "Scoutcraft Skills 6.8",
            "description": "I can light a fire using only mechanical means (flint and steel, ferrocerium striker or friction-e.g. bow and drill).",
            "hint": "Scouts are to be able to light a three-person warming fire.",
        },
        {
            "title": "Scoutcraft Skills 6.9",
            "description": "I know how to send a signal for help (without any electronic means) in four different ways that can be observed by air searchers.",
            "hint": "Scouts can explain the four air search signal methods.",
        },
        {
            "title": "Scoutcraft Skills 6.10",
            "description": "From wood I have not harvested from a live source, I have carved and used my own hiking staff on a trail hike.",
            "hint": "Scouts can use the staff on at least five hiking days.",
        },
    ],
    "Scoutcraft Skills 7": [
        {
            "title": "Scoutcraft Skills 7.1",
            "description": "Using spars (poles) and rope, I have constructed a three-metre-high tower or a bridge over a three-metre span.",
            "hint": "Scouts can complete this construction with the help of other Patrol members.",
        },
        {
            "title": "Scoutcraft Skills 7.2",
            "description": "I have taught five knots to younger Scouts.",
            "hint": "Scouts can teach the knots to a mastery level with a firm feel for the knot, symmetry with no twists or crossovers in the knot, with a 5–10 cm tail at the end of the knot as required.",
        },
        {
            "title": "Scoutcraft Skills 7.3",
            "description": "I have made a vagabond (tin-can) stove and cooked a personal camp meal on it.",
            "hint": "Scouts can demonstrate the stove and how it works.",
        },
        {
            "title": "Scoutcraft Skills 7.4",
            "description": "I can construct a 2:1, 3:1 and 4:1 rope pulley system to raise or move loads or tension lines.",
            "hint": "Scouts can build all these systems and demonstrate the function by moving a 20 kilogram load.",
        },
        {
            "title": "Scoutcraft Skills 7.5",
            "description": "I have made newspaper fire logs and bricks, sufficient to have a three-hour warming fire indoors in a stove or fireplace, or outside with a campfire.",
            "hint": "Scouts can demonstrate the use of this newspaper material to keep three persons warm.",
        },
        {
            "title": "Scoutcraft Skills 7.6",
            "description": "I can identify the poisonous living organisms, animals and plants in Canada.",
            "hint": "Scouts can describe the poisonous flora and fauna in their part of Canada.",
        },
        {
            "title": "Scoutcraft Skills 7.7",
            "description": "I have made and used a solar snow-melt reflector or absorber to melt enough snow to generate two litres of drinking water.",
            "hint": "Scouts can produce the water over several days of a campout.",
        },
        {
            "title": "Scoutcraft Skills 7.8",
            "description": "Using a topographic map and magnetic compass, I have taught younger Scouts to determine their location on a map and to make their way to another location on a map.",
            "hint": "Scouts can teach these lessons over multiple days.",
        },
        {
            "title": "Scoutcraft Skills 7.9",
            "description": "I have led a Scout group and participated in five days of trail or tent campsite construction, maintenance or clean-up work.",
            "hint": "Scouts do not have to complete the five days of work at one time.",
        },
        {
            "title": "Scoutcraft Skills 7.10",
            "description": "I can make a marine rescue Mayday radio call using the required procedures and voice script.",
            "hint": "Scouts can demonstrate this knowledge and refer to and use the Transport Canada Radio Distress Call script.",
        },
        {
            "title": "Scoutcraft Skills 7.11",
            "description": "I have constructed and used an improvised solar shower at camp or on a camping trip.",
            "hint": "The shower can be used over several days.",
        },
    ],
    "Scoutcraft Skills 8": [
        {
            "title": "Scoutcraft Skills 8.1",
            "description": "I can backsplice, short splice and eye splice a three-strand rope.",
            "hint": "Scouts must show the splices to their Patrol mates.",
        },
        {
            "title": "Scoutcraft Skills 8.2",
            "description": "I can cook a complete campout meal using only improvised natural cooking surfaces and devices (cooking only using flat stones, wood planks, cooking hooks, spits, covered pits or trenches).",
            "hint": "Scouts must cook a meal for a minimum of three persons.",
        },
        {
            "title": "Scoutcraft Skills 8.3",
            "description": "I have made cooking and eating spoons and a bowl with carving tools (or a knife) and wood.",
            "hint": "Scouts are to use these carved items at a campout.",
        },
        {
            "title": "Scoutcraft Skills 8.4",
            "description": "I have given a lesson to Scout youth on obtaining drinkable water in the wilderness all year round.",
            "hint": "Scouts are to provide the lesson in one session to young Scouts, covering concepts including: water filtration, disinfecting methods, locating, daily and activity hydration amount requirements, storing and carrying in winter and non-winter months, hazards of untreated water.",
        },
        {
            "title": "Scoutcraft Skills 8.5",
            "description": "I can find the North Star and identify four of the constellations in the northern sky.",
            "hint": "Scouts are to provide this identification to their Patrol mates during an evening outing.",
        },
        {
            "title": "Scoutcraft Skills 8.6",
            "description": "With only materials found in the forest, rope and plastic sheeting, I have built a 10-person campout dining shelter, protected on all sides from the weather.",
            "hint": "Scouts are to use this shelter at a campout.",
        },
        {
            "title": "Scoutcraft Skills 8.7",
            "description": "I have observed (and photographed as proof) a total of 15 North American mammals, reptiles and amphibians in the wild.",
            "hint": "Scouts are to share these photos with their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 8.8",
            "description": "Using only natural materials, I can light and maintain a fire in falling rain or falling snow conditions.",
            "hint": "Scouts are to demonstrate these fire skills to their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 8.9",
            "description": "I know how to set up and lead a ground search exercise for a missing person using a hasty search and a grid search, all in an area of a minimum of 2 km2 in size.",
            "hint": "Scouts are to set up and run a search proactive scenario with their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 8.10",
            "description": "I have made 4 metres of 3-strand cordage from only natural plant products found outdoors.",
            "hint": "Scouts do not have to produce the cordage as one complete strand.",
        },
    ],
    "Scoutcraft Skills 9": [
        {
            "title": "Scoutcraft Skills 9.1",
            "description": "I have built a large temporary pole and lashing (with flag pole) “gateway” entrance for a jamboree or campout activity site.",
            "hint": "Scouts can construct this gateway with the assistance of their Patrol.",
        },
        {
            "title": "Scoutcraft Skills 9.2",
            "description": "Using only wood as a heat source, I have built a reflector camp oven and cooked a meal for five persons, including both roasted and baked food preparation.",
            "hint": "Scouts can provide this meal over several meal times.",
        },
        {
            "title": "Scoutcraft Skills 9.3",
            "description": "I have built and used an improvised potable water filter.",
            "hint": "Any type of filter can be made as long as 10 litres of water can be filtered.",
        },
        {
            "title": "Scoutcraft Skills 9.4",
            "description": "Using GPS devices, I have set up and facilitated a ten-station outdoor orienteering course activity for Scouts.",
            "hint": "Scouts can lead this activity for a group of younger Scouts.\nScouts can teach GPS operation and map reading.",
        },
        {
            "title": "Scoutcraft Skills 9.5",
            "description": "I have planted a minimum of 100 new trees.",
            "hint": "Scouts do not have to complete this planting at one time.",
        },
        {
            "title": "Scoutcraft Skills 9.6",
            "description": "I have built and used a Leave No Trace warming fire for 10 persons for three hours. No markings or signs of a fire were left on the ground once the fire was out and disassembled.",
            "hint": "Scouts can ensure no markings are left on the ground (once it is out and disassembled).",
        },
        {
            "title": "Scoutcraft Skills 9.7",
            "description": "I have led a team on an evacuation simulation exercise of a victim being carried out on at the minimum 3 km of trail using only an improvised stretcher. (Note: It is expected youth have training in wilderness first aid before undertaking this activity.)",
            "hint": "Scouts can conduct this exercise with the utmost in safety in mind.\nThere should be more than adequate persons to address fatigue issues with stretcher bearers.\nThere is to be an improvised mock casualty in the stretcher that weighs the equivalent of an adult victim.",
        },
        {
            "title": "Scoutcraft Skills 9.8",
            "description": "I have run a field camp kitchen for two days or more, for a Cub Scout (or younger) group.",
            "hint": "Scouts can operate the camp kitchen with assistance from other Patrol members.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Scoutcraft Skills badges and requirements"

    def handle(self, *args, **options):
        category = "scoutcraft_skills"

        for badge_name, requirements in SCOUTCRAFT_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Scoutcraft Skills."))