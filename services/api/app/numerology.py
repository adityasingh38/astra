"""A transparent Moolank convention and ASTRA-authored reflective passages."""

from datetime import date

ASSOCIATIONS = {
    1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
    6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
}

# These are editorial prompts, not predictions or claims of personality fact.
READINGS = {
    1: (
        "The initiator",
        "Agency", "Beginning something can feel energizing. Notice the difference between a choice you own and a role others expect you to lead.",
        "Connection", "Leave room for another person's idea to change the plan. Shared direction can still have a clear beginning.",
        "Practice", "Choose one small action you can take today. Let its result inform the next step.",
    ),
    2: (
        "The listener",
        "Sensitivity", "Attention to mood and nuance can help you notice what goes unsaid. Check your impression with the person involved.",
        "Connection", "Listening is a form of care. Your own needs deserve the same clear attention.",
        "Practice", "Name one feeling before deciding what to do with it. A little space can make the next choice gentler.",
    ),
    3: (
        "The learner",
        "Growth", "Curiosity can open a wider view. Choose a question worth staying with beyond the first answer.",
        "Connection", "Offer what you have learned without needing to be the teacher. A conversation can expand both perspectives.",
        "Practice", "Write down one idea and one way to test it. Let learning become something you can observe.",
    ),
    4: (
        "The experimenter",
        "Difference", "An unusual route can reveal possibilities others missed. Give the idea a simple test before committing to it.",
        "Connection", "Explain what you are changing and why. Other people can join an experiment they understand.",
        "Practice", "Keep one steady routine while trying something new. A familiar anchor can make exploration easier.",
    ),
    5: (
        "The messenger",
        "Curiosity", "Ideas may arrive quickly. Notice which one still holds your attention when the first excitement passes.",
        "Connection", "Ask a question and listen through the full answer. Conversation becomes richer when it has room to land.",
        "Practice", "Give one thought a short, clear form. A note, sketch, or message can help you see it anew.",
    ),
    6: (
        "The harmonizer",
        "Care", "You may notice what would make a space more welcoming. Include your own comfort in that picture.",
        "Connection", "Kindness works best when it is mutual. Ask what the other person values rather than guessing.",
        "Practice", "Make one small part of your day more pleasant. Let the change be useful as well as beautiful.",
    ),
    7: (
        "The seeker",
        "Reflection", "Time alone can make subtle thoughts easier to hear. Bring one insight back into ordinary life.",
        "Connection", "Privacy can coexist with closeness. Tell someone what kind of space helps you return present.",
        "Practice", "Spend a few quiet minutes with one question. You can leave it unanswered for now.",
    ),
    8: (
        "The builder",
        "Endurance", "A long effort can take shape through repeated care. Measure progress without making every day a test.",
        "Connection", "Dependability matters, and so does flexibility. Let people know when a commitment needs to change.",
        "Practice", "Choose one structure that supports you. Make it small enough to use on a difficult day.",
    ),
    9: (
        "The advocate",
        "Courage", "Energy can move you toward what matters. Pause to decide which effort truly deserves it.",
        "Connection", "Speak with conviction and leave space for a reply. Being heard and hearing others can work together.",
        "Practice", "Turn one strong feeling into a helpful action. Let its scale match what you can sustain.",
    ),
}


def moolank_for(birth_date: date) -> dict:
    day = birth_date.day
    steps = [day]
    number = day
    while number > 9:
        number = sum(int(digit) for digit in str(number))
        steps.append(number)
    title, first_heading, first_text, second_heading, second_text, third_heading, third_text = READINGS[number]
    return {
        "number": number,
        "associated_planet": ASSOCIATIONS[number],
        "calculation": {"day_of_month": day, "steps": steps, "rule": "Add the digits of the birth day until one digit from 1 to 9 remains."},
        "reading": {"title": title, "entries": [
            {"heading": first_heading, "text": first_text},
            {"heading": second_heading, "text": second_text},
            {"heading": third_heading, "text": third_text},
        ]},
        "source": "astra_catalog",
        "tradition_note": "Moolank is a popular Indian numerology convention. It is separate from the astronomical Western and Vedic charts and is offered for reflection, not prediction.",
    }
