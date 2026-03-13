from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


AQUATIC_SKILLS_DATA = {
    "Aquatic Skills 1": [
        {
            "title": "Aquatic Skills 1.1",
            "description": "I know when to use a PFD (Personal Floatation Device).",
            "hint": "Scouts can describe when a PFD is necessary.",
        },
        {
            "title": "Aquatic Skills 1.2",
            "description": "I can float for five seconds and glide for five metres on my front and back without assistance.",
            "hint": "Scouts can enter a swimming pool and (under the supervision of a lifeguard) demonstrate the water skills.",
        },
        {
            "title": "Aquatic Skills 1.3",
            "description": "I can put my face in the water and blow bubbles.",
            "hint": "Scouts can blow bubbles underwater.",
        },
        {
            "title": "Aquatic Skills 1.4",
            "description": "I understand the importance of the buddy system, and how it works for swimming and water activities.",
            "hint": "Scouts can demonstrate (in practice) the buddy system (selecting a buddy, watching out for their buddy, etc.).",
        },
        {
            "title": "Aquatic Skills 1.5",
            "description": "I know how to stay safe while playing around water.",
            "hint": "Scouts can demonstrate awareness of risks by using (and encouraging others to use) protection such as sunscreen, UV clothing, hats and sunglasses (where appropriate).",
        },
        {
            "title": "Aquatic Skills 1.6",
            "description": "I can get an object off the bottom in chest-deep water.",
            "hint": "Scouts can demonstrate this skill in a pool or a lake.",
        },
        {
            "title": "Aquatic Skills 1.7",
            "description": "I know three different types of animals that live in the ocean.",
            "hint": "Scouts can name or describe the sea animals.",
        },
    ],
    "Aquatic Skills 2": [
        {
            "title": "Aquatic Skills 2.1",
            "description": "I can swim with my head in the water.",
            "hint": "Scouts can demonstrate this skill under the supervision of a lifeguard.",
        },
        {
            "title": "Aquatic Skills 2.2",
            "description": "I can swim 10 metres (any stroke) without assistance.",
            "hint": "Scouts (under the supervision of a lifeguard) can demonstrate their ability to swim with their heads in the water.",
        },
        {
            "title": "Aquatic Skills 2.3",
            "description": "I know how to put on a PFD by myself.",
            "hint": "Scouts can correctly put on PFD’s and test them.\nFor purposes of comfort, warmer water (such as a swimming pool) is ideal for this demonstration.",
        },
        {
            "title": "Aquatic Skills 2.4",
            "description": "I know how snorkel gear works.",
            "hint": "Scouts can explain how snorkeling equipment (snorkel, snorkel vest, wetsuit, fins) works and when a wetsuit may be necessary.",
        },
        {
            "title": "Aquatic Skills 2.5",
            "description": "I have snorkeled in a pool or open water (such as a lake).",
            "hint": "Dive shops are able to provide equipment and support this activity with professional instruction if desired.",
        },
    ],
    "Aquatic Skills 3": [
        {
            "title": "Aquatic Skills 3.1",
            "description": "I can explain common water safety risks and how to avoid them.",
            "hint": "Scouts can explain common risks, such as drowning, hypothermia and sunburn.\nScouts can explain common solutions for risks such as a buddy system, wearing exposure protection and staying out of the water in cold conditions.",
        },
        {
            "title": "Aquatic Skills 3.2",
            "description": "I can use a snorkel and adjust my mask to fit comfortably.",
            "hint": "Scouts can demonstrate the “stay on face” test to confirm if a mask fits correctly.\nScouts can clear a snorkel partially flooded with water.",
        },
        {
            "title": "Aquatic Skills 3.3",
            "description": "I know how to remove a cramp in my leg with a buddy’s help.",
            "hint": "Scouts can demonstrate cramp removal by pulling the fin tip towards themselves, either on themselves or on a buddy.",
        },
        {
            "title": "Aquatic Skills 3.4",
            "description": "I can put on a PFD while in the water and use the HELP and huddle positions.",
            "hint": "Scout can demonstrate the HELP survival position with the legs tucked in and in a huddle.",
        },
        {
            "title": "Aquatic Skills 3.5",
            "description": "I can swim 25 metres in a pool (using any stroke).",
            "hint": "Scouts can demonstrate they are capable of moving in the water.",
        },
        {
            "title": "Aquatic Skills 3.6",
            "description": "I can recognize the signs of a panicked snorkeler or diver and know how to call for help.",
            "hint": "Scouts can identify someone wildly flapping his or her arms and gasping for air as somebody who is in distress.\nCalling for help can be something as simple as yelling to attract attention or calling 911 on a telephone.",
        },
    ],
    "Aquatic Skills 4": [
        {
            "title": "Aquatic Skills 4.1",
            "description": "I have achieved one of the following: Aquaquest Stage 6, YMCA Swimmer Level, Red Cross Swim Kids Stage 5, or I can demonstrate equivalent skills.",
            "hint": "Scouts can provide proof of external qualification or demonstrate comparable skills to a qualified individual.",
        },
        {
            "title": "Aquatic Skills 4.2",
            "description": "I can free dive with snorkel and mask to 1.5 metres and fetch an item from the bottom, and clear my snorkel upon surfacing—without lifting my head out of the water.",
            "hint": "Scouts can fetch the object without a time limit.",
        },
        {
            "title": "Aquatic Skills 4.3",
            "description": "I can explain the hazards of shallow water blackout.",
            "hint": "Scouts can explain what shallow water blackout is and the steps that can be taken to prevent it.",
        },
        {
            "title": "Aquatic Skills 4.4",
            "description": "I know what gear is necessary for a water-based snorkel Adventure, including protective clothing, masks and sunscreen.",
            "hint": "Scouts can describe the equipment and why it is required.",
        },
        {
            "title": "Aquatic Skills 4.5",
            "description": "I know how to select a safe place to snorkel.",
            "hint": "Scouts can describe what make a snorkel site safe: it is away from boat traffic, swells, surge, marine hazards, etc.",
        },
        {
            "title": "Aquatic Skills 4.6",
            "description": "I have snorkeled in open water and observed at least one marine creature.",
            "hint": "Scouts have been out for at least a half-day snorkel Adventure.",
        },
        {
            "title": "Aquatic Skills 4.7",
            "description": "I know why ear equalization is necessary when snorkelling or diving at depth.",
            "hint": "Scouts can describe why it is important to know how to equalize.",
        },
    ],
    "Aquatic Skills 5": [
        {
            "title": "Aquatic Skills 5.1",
            "description": "I have tried an introductory Scuba experience in a pool (Bubblemaker/SEAL Team/Discover Scuba Diving).",
            "hint": "Scouts can maintain neutral buoyancy and clear a mask of water while underwater.\nScouts can open their eyes underwater without goggles.",
        },
        {
            "title": "Aquatic Skills 5.2",
            "description": "I can identify five species in my local aquatic environment (either on the surface or underwater), including hazardous species.",
            "hint": "Scouts can name five animals, insects or plants that live on or under the water.",
        },
        {
            "title": "Aquatic Skills 5.3",
            "description": "I can achieve the “Swim to Survive” standard.",
            "hint": "Scouts can fall or roll into deep water, tread water for one minute, swim 50 metres—all in one continuous attempt, without touching the bottom or shoreline or side of a pool.",
        },
    ],
    "Aquatic Skills 6": [
        {
            "title": "Aquatic Skills 6.1",
            "description": "I have completed at least Emergency First Aid, or an equivalent course.",
            "hint": "Scouts are to use a recognized provider for this course.",
        },
        {
            "title": "Aquatic Skills 6.2",
            "description": "I have completed the Open Water Diver Certification.",
            "hint": "Scouts are to use a recognized provider for this certification.",
        },
        {
            "title": "Aquatic Skills 6.3",
            "description": "I have gone for two additional dives after the Open Water Diver Certification dive.",
            "hint": "Scouts are to dive under the supervision of an experienced adult diver and as per their certification level.",
        },
        {
            "title": "Aquatic Skills 6.4",
            "description": "I have talked with a younger Section about my diving experience.",
            "hint": "Scouts have met with younger non-certified Scouts and spoken to them about my diving experience and how they can become certified.",
        },
        {
            "title": "Aquatic Skills 6.5",
            "description": "I have assisted with Scouts (who are at Stage 3 or 4) learning to snorkel in open water.",
            "hint": "Scouts are to assist in this teaching under direct adult qualified dive instructor supervision.",
        },
    ],
    "Aquatic Skills 7": [
        {
            "title": "Aquatic Skills 7.1",
            "description": "I have logged at least five open water dives and assisted in the planning.",
            "hint": "Diving with an outside organization (dive club, dive shop, etc.) is also acceptable for this requirement.",
        },
        {
            "title": "Aquatic Skills 7.2",
            "description": "I can navigate with a compass underwater and understand the specific challenges of underwater navigation (currents, lack of landmarks, etc.).",
            "hint": "Scouts are to meet this requirement in accordance with their level of dive certification.",
        },
        {
            "title": "Aquatic Skills 7.3",
            "description": "I have participated in a marine environmental service project, cleaning up a water body.",
            "hint": "Scouts can achieve this requirement with an outside organization, such as a dive club, dive shop, etc.",
        },
        {
            "title": "Aquatic Skills 7.4",
            "description": "I have two of the following experiences:\n• I can shoot an underwater photo or video and understand the impacts of water on light.\n• I have either found or placed an underwater geocache.\n• I have used a dry suit (in cooler waters).\n• I have performed basic repairs on my gear (replacing a mouthpiece with a spare etc.).\n• I have taken part in a non-penetration wreck dive or any other specialty dive course.\n• I have helped a younger Scout at Stage 4 or 5 learn how to...(Scout’s Choice).",
            "hint": "Scouts can achieve this requirement with a non-Scouts organization, such as a dive club, dive shop, etc.",
        },
    ],
    "Aquatic Skills 8": [
        {
            "title": "Aquatic Skills 8.1",
            "description": "I have completed an Advanced Open Water Certification.",
            "hint": "Scouts are to use a recognized provider for this certification.",
        },
        {
            "title": "Aquatic Skills 8.2",
            "description": "I have led a less experienced buddy on a dive through a site that is new to the Scout.",
            "hint": "Scouts can achieve this requirement with an outside organization, such as a dive club, dive shop, etc.",
        },
        {
            "title": "Aquatic Skills 8.3",
            "description": "I have drawn a rough map of a dive site.",
            "hint": "Scouts have shared and explained this map to their Patrols.",
        },
        {
            "title": "Aquatic Skills 8.4",
            "description": "I have assisted Scouts with their dives at Stage 5 or 6.",
            "hint": "Scouts are to assist in this teaching under direct adult qualified dive instructor supervision.",
        },
    ],
    "Aquatic Skills 9": [
        {
            "title": "Aquatic Skills 9.1",
            "description": "I have organized a dive trip for a Rover Crew.",
            "hint": "Scouts will be involved in securing rental equipment, checking for restrictions on the dive site and ensuring the dive site’s suitability for the skill stage of all involved.",
        },
        {
            "title": "Aquatic Skills 9.2",
            "description": "I have completed a Rescue Diver Certification course, or have learned and mastered the curriculum to demonstrate the equivalent skills.",
            "hint": "Scouts demonstrating this skill are to do so under an adult qualified Rescue Diver instructor direct supervision.",
        },
        {
            "title": "Aquatic Skills 9.3",
            "description": "I have assisted Scouts at Stage 6 or 7 with learning dive navigation or other advanced dive skills.",
            "hint": "Scouts are to assist in this teaching under direct adult qualified dive instructor supervision.",
        },
        {
            "title": "Aquatic Skills 9.4",
            "description": "I have completed one of the following dives:\n• A “deep dive” to more than 80 feet/24.36m\n• An altitude dive\n• A dive on nitrox\n• A DPV dive\n• A search-and-recovery dive",
            "hint": "Scouts are to meet this requirement under direct adult qualified dive instructor supervision and as per the Scout’s dive certification.",
        },
    ],
}


class Command(BaseCommand):
    help = "Load all Aquatic Skills badges and requirements"

    def handle(self, *args, **options):
        category = "aquatic_skills"

        for badge_name, requirements in AQUATIC_SKILLS_DATA.items():
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

        self.stdout.write(self.style.SUCCESS("Finished loading Aquatic Skills."))