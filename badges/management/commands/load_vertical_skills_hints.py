from django.core.management.base import BaseCommand
from badges.models import BadgeRequirement


VERTICAL_SKILLS_HINTS = {
    "Vertical Skills 1.1": (
        "Scouts know to always climb with an adult’s permission and an adult present.\n"
        "Scouts do not climb on fences.\n"
        "Scouts climb in playgrounds on play equipment—not on inappropriate structures.\n"
        "Scouts get permission from an adult before climbing trees."
    ),
    "Vertical Skills 1.2": (
        "Scouts always take turns and share the equipment.\n"
        "Scouts do not climb on other people.\n"
        "Scouts tell adults when they are going to play at the playground.\n"
        "Scouts do not jump down from high places."
    ),

    "Vertical Skills 2.1": (
        "Scouts have tried either climbing in the context of a supervised "
        "“bouldering” or a top rope climbing lesson."
    ),
    "Vertical Skills 2.2": (
        "Scouts do not play or get close to a cliff edge unless an adult is present.\n"
        "Scouts do not look over a climbing cliff edge unless tied in with a climbing rope.\n"
        "Scouts do not play, rest or stand below a cliff face where rocks, dirt and other things could fall down.\n"
        "Scouts always have a climbing helmet on when at the bottom of a climbing site.\n"
        "Scouts never push or throw anything over a cliff edge."
    ),
    "Vertical Skills 2.3": (
        "Scouts can properly adjust their helmets so that they fit snuggly to stay "
        "central on the head and not slide forward or back easily.\n"
        "The chin strap and attachment straps to the helmet are snug, but do not interfere with breathing or talking."
    ),
    "Vertical Skills 2.4": (
        "Scouts can identify the gate, spine, nose, hinge, latch, basket "
        "(where the rope sits), crotch (where the attachment connects), barrel and spring on a carabiner."
    ),

    "Vertical Skills 3.1": (
        "Scouts can tie the knot to a mastery level with a firm feel to the knot, "
        "symmetry with no twists or crossovers in the knot, with a 5–10 cm tail at the end of the knot."
    ),
    "Vertical Skills 3.2": (
        "Scouts know a helmet is to be worn for any climbing activity where a fall or loss "
        "of body control could result in impact to the head, or when a person or an object "
        "could fall onto a climber, belayer or spectator."
    ),
    "Vertical Skills 3.3": (
        "Scouts can describe the safety rules for climbing or rappelling on an artificial wall, "
        "including supervision by a qualified instructor; the importance of climbers, belayers "
        "and spectators wearing helmets; careful inspection of knots, harnesses and belays before "
        "beginning to climb; prohibition of horseplay in the climbing vicinity; and the importance "
        "of being belayed when climbing."
    ),
    "Vertical Skills 3.4": (
        "Scouts can describe the care and handling of climbing equipment, including storage in a clean dry place "
        "out of direct sunlight; eliminating exposure to ANY petroleum products or ANY chemicals "
        "(such as battery acid); preventing the growth of mold on equipment; inspection by sight and feel "
        "of all equipment at every use, looking for damage, wear, discolouration and incompleteness; "
        "preventing participants from standing on, throwing down or dropping equipment; and ensuring "
        "the equipment is only used for its intended purpose."
    ),
    "Vertical Skills 3.5": (
        "Scouts can list the seven principles of Leave No Trace.\n"
        "Scouts do not disturb any flora or fauna to set up a climb or use a climbing site."
    ),
    "Vertical Skills 3.6": (
        "Scouts (using a top rope climbing method) can climb to the top of a climbing wall under their own power."
    ),
    "Vertical Skills 3.7": (
        "Scouts can put a harness on with the leg loops and waist belt adjusted properly and securely tightened."
    ),
    "Vertical Skills 3.8": (
        "Scouts climb under supervision and with permission from the challenge course instructor.\n"
        "Scouts follow the challenge course instructors’ directions and the safety rules for the site.\n"
        "Scouts always wear climbing helmets.\n"
        "Scouts are supportive and do not distract others.\n"
        "Scouts respect and look after the equipment."
    ),
    "Vertical Skills 3.9": (
        "Scouts can describe what is happening with the rope, belayer and the climber in each of these five "
        "climbing methods:\n"
        "a. single-pitch\n"
        "b. multi-pitch\n"
        "c. top-rope\n"
        "d. lead climbing\n"
        "e. seconding climbing methods."
    ),

    "Vertical Skills 4.1": (
        "Scouts can tie a climbing rope into their harnesses using any appropriate knot.\n"
        "The harness tie-in must be accomplished at a masterly level with the knot tied correctly "
        "into the proper location on the harness and the harness adjusted properly."
    ),
    "Vertical Skills 4.2": (
        "Scouts can demonstrate where and when to wear a helmet.\n"
        "Scouts can demonstrate when to be tied in with a rope, anchored and belayed.\n"
        "Scouts can demonstrate when it is safe to begin to climb and rappel.\n"
        "Scouts can demonstrate where to be situated to safely observe climbers."
    ),
    "Vertical Skills 4.3": (
        "Scouts can perform a head-to-toe check of clothing and attire (no loose clothing, sharp objects in pockets, "
        "untied shoes, jewelry and helmet/harness is properly secured).\n"
        "Scouts can perform a squeeze and visual check of all knots and carabiners before use.\n"
        "Scouts can check that there are redundant, equalized and properly loaded anchor systems.\n"
        "Scouts can establish there is a proper connection/anchoring and loading of belay devices."
    ),
    "Vertical Skills 4.4": (
        "Scouts can explain when and why the climbing communication script is required, including what specific "
        "words to say for the belayer and climber before climbing and when the climb is over; what to say if "
        "a rock falls; and how, why and what to ask for to change the rope tension during a climb."
    ),
    "Vertical Skills 4.5": (
        "Scouts can coil at a beginner level.\n"
        "The coil should be sufficient to be carried in a backpack and can be uncoiled in a short time "
        "freely without entanglements or knots."
    ),
    "Vertical Skills 4.6": (
        "Scouts can recognize and describe the hazards posed by loose rock, soil and vegetation.\n"
        "Scouts can describe the hazards of flora and fauna: poisonous/thorny plants, tree sap, bees and ants, "
        "poisonous snakes, dead/rotted trees, hanging dead trees/branches, animals defending territory or that may kick down rocks.\n"
        "Scouts can recognize and describe man-made hazards: power lines, telephone/communication cables, pipes and iron works, "
        "litter (such as glass and tin cans), standing water/fluid spills, other climbers above.\n"
        "Scouts can recognize and describe environmental hazards: lighting, rain/snow, waterfalls/flash floods and avalanches."
    ),
    "Vertical Skills 4.7": (
        "The Scout belayer can provide a continuous belay to a climber from the start to the finish "
        "(when the climber unties from the rope).\n"
        "The knowledge and skill of attaching and detaching the belay device to the rope is not required."
    ),
    "Vertical Skills 4.8": (
        "Scouts can describe the use of and the advantages and limitations of the types of carabiners.\n"
        "Locking could include: auto-locking, screw gate pear (Munter hitch), screw gate D steel, etc.\n"
        "Non-locking could include: aluminum oval, bent gate, wire gate, aluminum D, etc."
    ),

    "Vertical Skills 5.1": (
        "Scouts can tie the knots to a mastery level with a firm feel to the knot, symmetry with no twists "
        "or crossovers in the knot, with a 5–10 cm tail coming out of the knot."
    ),
    "Vertical Skills 5.2": (
        "Scouts can tie the coil to a mastery level with consistent coil lengths and a proper whipping or finish.\n"
        "The coil should be sufficient to be carried in a backpack, slung over one arm and shoulder and over the back "
        "and tied off around the body.\n"
        "The coil must be able to uncoil freely without entanglements or knots and in short order.\n"
        "The coils must be in order and of constant length and free of any twists."
    ),
    "Vertical Skills 5.3": (
        "Scouts know what to inspect on each of these items for wear, damage, improper working condition and missing components.\n"
        "Helmet: all rivets and fasteners secure, all webbing in good condition, the shell is without cracks or defects, "
        "all buckles present and working, all size adjustment functions working.\n"
        "Harness: all webbing in good condition with no cuts, defects or abrasions, all buckles present and in good condition "
        "with no cracks, defects or burs, all buckle adjustments working.\n"
        "Rope: rope has no constrictions or blowouts; no mantle fibers showing through the kern; no abraded, cut or melted kern fibers; "
        "dynamic properties are intact; rope is the proper length (usually 60–70 metres); rope is not overly soiled by dirt "
        "or foreign contaminates such as oils or chemicals.\n"
        "Carabiners: all working parts present, gate opens freely without sticking, on a locking gate the barrel works freely, "
        "no cracks or defects in the material, no metal burs or sharp edges."
    ),
    "Vertical Skills 5.4": (
        "The Scout belayer can provide a continuous belay to a climber from the start to the finish of the climb "
        "when the climber unties from the rope.\n"
        "The knowledge and skill of attaching and detaching the belay device to the rope is not required."
    ),
    "Vertical Skills 5.5": (
        "Scouts can properly feed the rope through the rappel device.\n"
        "Correct attachment by carabiner from the device to the harness is made.\n"
        "Proper hand and body position to operate the device is achieved and maintained during the rappel.\n"
        "Tension by the belay safety rope is not required during the rappel, but a minimum of slack should be in the belay rope."
    ),
    "Vertical Skills 5.6": (
        "Scouts using a belay breaking device can lower a climber at a controlled rate and in a safe fashion.\n"
        "Scouts can use proper verbal climbing commands and procedures before, during and at the end of the rappel."
    ),
    "Vertical Skills 5.7": (
        "Scouts can correctly size and tie the knots to make a Swiss seat improvised climbing harness.\n"
        "The harness is to be tied to the body with the correct leg loop and waist tightness.\n"
        "A complete top rope climb and lower back down is to be made with the harness on.\n"
        "The Scout climber is to experience full body weight suspended in the harness."
    ),
    "Vertical Skills 5.8": (
        "Scouts can explain the rules for bouldering: wear a helmet, do not boulder alone or unsupervised, "
        "do not climb with feet over waist height, use a partner to spot climbers and have a crash pad in place."
    ),
    "Vertical Skills 5.9": (
        "Scouts can use rocks, trees and man-made objects as anchor points.\n"
        "Natural and man-made attachments must be inspected by Scouts for security.\n"
        "Scouts must use properly mastered and tied knots (bowline, water knot, overhand, full strength tie off, etc.).\n"
        "Scouts can demonstrate the use of manufactured passive climbing protection: nuts, hexes, stoppers, cams, etc.\n"
        "Scouts can explain and correctly apply the principles of the anchor building acronym “SARENE-SA” "
        "(Solid Anchors, Redundant, Equalized, No Extension, Small Angles)."
    ),
    "Vertical Skills 5.10": (
        "Scouts in their climbing practice demonstrate the climbing Leave No Trace principles.\n"
        "Plan Ahead:\n"
        "- Pick a climb that suits the skill level of your group to minimize the possibility of injury and need of rescue.\n"
        "- Use appropriate equipment thoroughly checked before the climb.\n"
        "- Find out about permits and practices; some locations do not allow drilling or anchors, or require permits.\n"
        "- Carpool to minimize overcrowding at the trailhead.\n"
        "Durable Surfaces:\n"
        "- Ensure the staging area is large enough to accommodate your group.\n"
        "- Use quick draws to reduce wear on existing permanent anchors.\n"
        "- When bouldering, ensure the ground is durable so spotters or crash pads will not destroy vegetation.\n"
        "- Removal of rocks or landscaping to make a bouldering problem safe should be avoided.\n"
        "- Popular climbing routes have established descent trails—use them.\n"
        "- Do not wrap rope around trees where the friction can destroy the bark.\n"
        "Dispose of Waste Properly:\n"
        "- Pack out worn out or discarded gear.\n"
        "- Minimize chalk dust; keep chalk bags closed to prevent spills.\n"
        "- Human waste is a problem around popular climbing areas.\n"
        "- Urinate well away from the climbing site location.\n"
        "- Pack out all human waste where appropriate.\n"
        "Leave What You Find:\n"
        "- Use removable climbing protection as much as possible.\n"
        "- Use fixed protection sparingly.\n"
        "- Before placing bolts, check with local land managers.\n"
        "- If climbing a new route, avoid lichen-covered rock, vegetated cracks and areas that require cleaning.\n"
        "- Leave the rocks in place rather than force a route that will leave a noticeable path.\n"
        "Respect Wildlife:\n"
        "- Be aware of seasonal rock site closures.\n"
        "- Leave animals their space.\n"
        "- Be careful not to destroy nests or disturb hidden wildlife and insects.\n"
        "Be Considerate of Other Visitors:\n"
        "- Consider climbing on weekdays or less-popular times.\n"
        "- Wear earth-tone clothes to minimize visual impact.\n"
        "- Minimize noise.\n"
        "- Give other climbing parties plenty of room and time."
    ),
    "Vertical Skills 5.11": (
        "Scouts can set up a pulley system that can raise the weight of an adult.\n"
        "The pulley system should be constructed out of equipment specifically engineered for climbing.\n"
        "The system should not be tensioned on a climbing rope beyond the power of one person pulling."
    ),
    "Vertical Skills 5.12": (
        "Scouts can explain shock loading: when an object in motion is suddenly met with an equal "
        "(or greater) and opposite force, the object (climber) in motion is halted very suddenly; "
        "the force of that sudden stop is shock loaded.\n"
        "Scouts can describe the effect shock loading has on climbing equipment and systems.\n"
        "Scouts can describe the effect shock loading has on a belayer and climber.\n"
        "Scouts can describe how to avoid or minimize shock loading from happening."
    ),

    "Vertical Skills 6.1": (
        "Using a carabiner specially designed for a Munter Hitch knot, Scouts can belay a climber when climbing up "
        "and being lowered back down.\n"
        "Scouts can tie a Munter hitch knot correctly and attach the knot to a Munter Hitch carabiner.\n"
        "Scouts can tie off the Munter hitch knot with a Munter mule knot when the hitch is under load."
    ),
    "Vertical Skills 6.2": (
        "Scouts can tie a Parisian Baudrier chest harness and incorporate it into their seat harness, "
        "and use the two harnesses together on a climb.\n"
        "Scouts can explain when a chest harness is required."
    ),
    "Vertical Skills 6.3": (
        "Scouts can demonstrate the position with feet shoulder-width apart and semi-flat on the climbing face, "
        "back straight leaning back from the climbing face, hands in the position as per the rappel device "
        "manufacturer’s requirements."
    ),
    "Vertical Skills 6.4": (
        "Scouts can describe the system and how they can use the system to plan a climb.\n"
        "Scouts can state at what grade of Yosemite Decimal climbing system a climbing rope is required "
        "to protect themselves during an ascent or descent."
    ),
    "Vertical Skills 6.5": (
        "A Scout belayer seated at the top of a belay site and using a friction device can belay a climber down the rappel, "
        "allowing the rappeller to use the friction of the rappel device to control the descent; rather than tension "
        "from the belay line, the belay line is only a safety backup."
    ),
    "Vertical Skills 6.6": (
        "Scouts can demonstrate setting up a top rope anchor or a bottom belay station anchor system that incorporates "
        "at least two placements of active climbing protection.\n"
        "Scouts can explain and correctly apply the principles of the anchor-building acronym “SARENE-SA” "
        "when setting anchors: Solid Anchors, Redundant, Equalized, No Extension, Small Angles."
    ),
    "Vertical Skills 6.7": (
        "Scouts demonstrate they can visually and physically check bolt anchors by:\n"
        "- looking for loose rock material around the bolt placement\n"
        "- checking the bolt and hanger for security, cracks, bends, rust and modern design\n"
        "- describing what modern bolt hangers and bolts look like, and what older designs look like."
    ),
    "Vertical Skills 6.8": (
        "The climbing Scout is to be belayed on a top rope belay safety rope.\n"
        "The climbing Scout is also tied into a second rope belayed from the ground up.\n"
        "This rope is to be clipped into carabiners attached to pre-set protection placements on the climbing route "
        "as the climber ascends.\n"
        "The climbing Scout is to be belayed with the ground up belay in a fashion consistent with a method used "
        "as if the Scout was making an actual non-mock lead climb."
    ),
    "Vertical Skills 6.9": (
        "Scouts can set up one of each of a tube, auto-locking and auto-blocking belay device, attached to a climbing rope "
        "and used during a climb by the Scout belayer."
    ),
    "Vertical Skills 6.10": (
        "Scouts can explain the difference between flat and tubular webbing and the different widths and strengths of webbing.\n"
        "Scouts can explain the differences between nylon, Dyneema and Spectra webbing materials and the advantages "
        "and disadvantages of these webbing fabrics.\n"
        "Scouts can make a self-constructed climbing sling with a water knot.\n"
        "Scouts can describe what a commercially sewn climbing sling is."
    ),
    "Vertical Skills 6.11": (
        "Scouts can describe what a fall factor is in climbing and the hazards associated.\n"
        "Scouts can explain how to minimize fall factors."
    ),
    "Vertical Skills 6.12": (
        "Scouts can describe a “UIAA” certified climbing rope.\n"
        "Scouts can describe a standard length of a climbing rope (60–70 metres).\n"
        "Scouts can describe the size and use of a single climbing rope: 9 to 11 mm diameter.\n"
        "Smaller diameter ropes are lighter and better for multi-pitch longer climbing.\n"
        "8–9 mm diameter ropes offer a full rope length for rappelling, produce less impact force in a fall "
        "and offer less chance of both ropes being cut in a rock fall."
    ),

    "Vertical Skills 7.1": (
        "The completed climb can be a top rope, second or lead climb and is to be a climb of a minimum of a half a rope length."
    ),
    "Vertical Skills 7.2": (
        "The construction is to be out of engineered purpose-built climbing equipment.\n"
        "The weight of one person must be moved from one side of the highline to another."
    ),
    "Vertical Skills 7.3": (
        "Via ferrata routes are offered by commercial companies and can be found in both the east and west of Canada.\n"
        "Nationally, caving is generally controlled by a small number of caving clubs.\n"
        "It is best for Scouts to contact one of these clubs to obtain assistance for this requirement."
    ),
    "Vertical Skills 7.4": (
        "The climbing Scout is belayed on a top rope belay safety rope.\n"
        "The climbing Scout is also tied into a second rope belayed from the ground up; this rope is to be clipped "
        "into carabiners attached to pre-set protection placements on the climbing route.\n"
        "The climbing Scout is to be belayed with a ground up belay in a fashion consistent with a method used "
        "as if the Scout was making an actual non-mock lead climb."
    ),
    "Vertical Skills 7.5": (
        "Scouts demonstrate the use of a Prusik knot or other suitable friction knot that attaches the climber "
        "to the rappel rope as a redundant back up in case of rappel device failure/malfunction or loss of control "
        "by the rappeller."
    ),
    "Vertical Skills 7.6": (
        "Scouts can describe the climbing activities for which dynamic and static climbing ropes are suitable.\n"
        "Scouts can describe the functional differences of dynamic and static climbing rope."
    ),

    "Vertical Skills 8.1": (
        "Scouts can set up anchor and belay systems to the satisfaction of a qualified climbing instructor before use."
    ),
    "Vertical Skills 8.2": (
        "Scouts can follow a lead climber on a route and clean all the protection from the route."
    ),
    "Vertical Skills 8.3": (
        "Scouts can follow a lead climber on a route and clean all the protection from the route."
    ),
    "Vertical Skills 8.4": (
        "Scouts (under the supervision of a qualified climbing instructor) can help to facilitate the technical set up "
        "and teaching of beginner top rope climbers."
    ),
    "Vertical Skills 8.5": (
        "Scouts (under the supervision of a qualified climbing instructor) can help to facilitate the technical set up "
        "and teaching of a beginner-level rappel site."
    ),
    "Vertical Skills 8.6": (
        "Scouts are to teach these seven knots to a beginner level only.\n"
        "The knots are not to be used for climbing or rappelling activities."
    ),

    "Vertical Skills 9.1": (
        "Scouts must have achieved the status of a qualified top rope climbing instructor to offer this service.\n"
        "Scouts must work under the direct supervision of a qualified climbing instructor with five or more years of "
        "climbing instruction experience."
    ),
    "Vertical Skills 9.2": (
        "Scouts must have achieved the status of a qualified top rope climbing instructor to offer this service.\n"
        "Scouts must work under the direct supervision of a qualified climbing instructor with five or more years of "
        "climbing instruction experience."
    ),
    "Vertical Skills 9.3": (
        "Scouts can complete a lead climb under the direct supervision of a qualified climbing instructor "
        "with five or more years of experience."
    ),
    "Vertical Skills 9.4": (
        "Scouts can conduct a rescue scenario where a rappeller is freed from the rappel rope and the belay rope, "
        "and the Scout facilitator lowers the rappelling Scout down to the ground on a third backup safety rope "
        "with a Munter hitch friction knot.\n"
        "Scouts can complete this rescue under the direct supervision of a qualified climbing instructor "
        "with five or more years of experience."
    ),
}


class Command(BaseCommand):
    help = "Load hint text for existing Vertical Skills requirements"

    def handle(self, *args, **options):
        updated = 0
        missing = []

        for title, hint in VERTICAL_SKILLS_HINTS.items():
            try:
                req = BadgeRequirement.objects.get(title=title, badge__category="vertical_skills")
                req.hint = hint
                req.save(update_fields=["hint"])
                updated += 1
                self.stdout.write(self.style.SUCCESS(f"Updated {title}"))
            except BadgeRequirement.DoesNotExist:
                missing.append(title)
                self.stdout.write(self.style.WARNING(f"Missing: {title}"))

        self.stdout.write(self.style.SUCCESS(f"\nUpdated {updated} requirements."))

        if missing:
            self.stdout.write(self.style.WARNING("\nCould not find:"))
            for title in missing:
                self.stdout.write(f" - {title}")