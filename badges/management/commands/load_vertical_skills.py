from django.core.management.base import BaseCommand
from badges.models import Badge, BadgeRequirement


VERTICAL_SKILLS_DATA = {
    "Vertical Skills 1": [
        "I know the safety rules for climbing on rocks, trees, fences and man-made structures.",
        "I have been to a jungle-gym playground and know how to play safely and cooperatively with others.",
    ],
    "Vertical Skills 2": [
        "I have been climbing on an artificial wall or natural rock formation.",
        "I know the safety rules for being at the top of or the bottom of a cliff face.",
        "I can properly put on a climbing helmet.",
        "I can identify and name the parts of a carabiner.",
    ],
    "Vertical Skills 3": [
        "I have correctly tied a figure-8 follow-through knot.",
        "I know when and where I should have a climbing helmet on.",
        "I know the safety rules for climbing or rappelling at an artificial climbing wall.",
        "I know how to care for, handle and store a climbing rope, harness, helmet and climbing webbing.",
        "I know the basic Leave No Trace rules for an outdoor climbing site.",
        "I have completed a climb to the top of an artificial climbing wall.",
        "I can put on and adjust a climbing harness.",
        "I know the safety rules for participating on an aerial or ropes challenge course.",
        "I know the difference between: 1. single-pitch, 2. multi-pitch, 3. top-rope, 4. lead climbing 5. seconding climbing methods.",
    ],
    "Vertical Skills 4": [
        "I have tied a climbing rope into my climbing harness.",
        "I know the main safety rules for climbing or rappelling at an outdoor natural climbing site.",
        "I know how to perform an equipment safety check of myself, my climbing partner, and anchor and belay systems.",
        "I know the communication calls and script to follow between a climber and belayer.",
        "I have coiled a climbing rope (any method).",
        "I know what makes a safe and unsafe climbing site.",
        "I can belay using an auto-locking belay device.",
        "I can name and identify the use of three types of locking carabiners and three types of non-locking carabiners.",
    ],
    "Vertical Skills 5": [
        "I can tie these knots: water (tape), double fisherman’s, Prusik, clove hitch and bowline.",
        "I can coil a climbing rope using a butterfly and a mountaineer method.",
        "I can perform a safety inspection of a climbing helmet, harness, rope and carabiners.",
        "I can belay using a friction, (non-moving part) belay device such as a tube or auto-blocking device.",
        "I have attached a friction (non-moving part) rappel device to a rope and harness and used the device to rappel.",
        "I can lower a climber on a top rope down to the ground.",
        "I have constructed and climbed in a “Swiss seat” improvised climbing harness made with tubular or tape webbing.",
        "I know the safety rules for “bouldering” climbing.",
        "I can set and use passive and natural climbing protection to build both top and bottom climbing pitch anchor-point systems.",
        "I know the climbing-specific principles of Leave No Trace.",
        "I have set up a 3:1 (or greater) rope pulley system.",
        "I understand the concepts, principles, physics and consequences of shock loading in climbing.",
    ],
    "Vertical Skills 6": [
        "I have tied and used a Munter hitch knot (also known as an Italian hitch) as a belay method.",
        "I have constructed and used an improvised Parisian Baudrier chest harness.",
        "I can maintain the correct foot, body and hand positioning for rappelling.",
        "I know the Yosemite Decimal climbing grading system and how to use it.",
        "I have belayed a rappeller from above a rappel site.",
        "I have set up climbing-anchor systems using active protection.",
        "I know how to assess and use in-place climbing bolt anchors and systems.",
        "I have completed a mock lead climb on an artificial climbing wall.",
        "I have set up and used a tube, auto-locking, and auto-blocking belay device.",
        "I know the different types of climbing webbing and slings and their uses.",
        "I understand the concept, principle, physics and consequences of fall factor in climbing.",
        "I know how to identify what is an approved rope for climbing and what sizes of rope are available.",
    ],
    "Vertical Skills 7": [
        "I have completed a climbing route over a 30 degree incline, either on an ice climb, glacier or frozen snow field.",
        "I have constructed and used a highline (also called Tyrolean Travers or Aerial Runway).",
        "I have been caving or on a via ferrata.",
        "I have completed a single pitch mock lead climb on a natural (not constructed) climbing site.",
        "I have used utility cord and a friction knot (or system) as protection on a rappel.",
        "I know the difference between a dynamic and static climbing rope, and where and when these rope types are used.",
    ],
    "Vertical Skills 8": [
        "I have climbed at a natural (not constructed) top rope climbing site where I set up all the anchor and belay systems for the routes I climbed or rappelled on.",
        "I have seconded on a multi-pitch rock climb of grade 5.7 or higher.",
        "I have seconded on an ice climb of W3 or higher.",
        "I have assisted with setting up a top rope climbing site and assisted with managing beginner climbers learning to climb at that site.",
        "I have assisted with setting up a rappel site with a belay from above, and assisted with managing beginners learning to rappel at that site.",
        "I have taught younger Scouts to tie these seven knots: follow-through figure-8, double fisherman’s, water knot, bowline, Munter hitch, Prusik and clove hitch.",
    ],
    "Vertical Skills 9": [
        "I have set up a top rope climbing site and managed or instructed beginner climbers learning to climb at that site.",
        "I have set up a rappel site with a belay from above and managed or instructed beginners learning to rappel at that site.",
        "I have completed a lead climb on one of the following multi-pitch climbs: 1. rock climb grade 5.7 or above 2. ice climb grade WI3 or above 3. mountain alpine climb grade III or above 4. caving that requires climbing ropes and harness",
        "I have set up and used a Munter mule combination hitch to facilitate the rescue of beginners learning to rappel.",
    ],
}


class Command(BaseCommand):
    help = "Load all Vertical Skills badges and requirements"

    def handle(self, *args, **options):
        category = "vertical_skills"

        for badge_name, requirements in VERTICAL_SKILLS_DATA.items():
            badge, badge_created = Badge.objects.update_or_create(
                name=badge_name,
                defaults={
                    "category": category,
                    "is_active": True,
                },
            )

            existing_requirements = {req.order: req for req in badge.requirements.all()}
            seen_orders = set()

            level_number = badge_name.split()[-1]

            for index, requirement_text in enumerate(requirements, start=1):
                title = f"Vertical Skills {level_number}.{index}"

                BadgeRequirement.objects.update_or_create(
                    badge=badge,
                    order=index,
                    defaults={
                        "title": title,
                        "description": requirement_text,
                    },
                )
                seen_orders.add(index)

            # Remove old requirements that no longer exist in the source data
            for order, req in existing_requirements.items():
                if order not in seen_orders:
                    req.delete()

            action = "Created" if badge_created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action} {badge_name}"))

        self.stdout.write(self.style.SUCCESS("Finished loading Vertical Skills badges."))