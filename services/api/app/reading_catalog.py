"""ASTRA's authored passages. Selection is deterministic; no prose is generated."""

CATALOG_VERSION = "1.0"

TOPIC_BODIES = {
    "identity": ("Sun", "Moon", "Mercury"),
    "love": ("Venus", "Mars", "Moon"),
    "career": ("Sun", "Saturn", "Jupiter"),
}

TITLES = {
    "identity": "Ways of being",
    "love": "Ways of connecting",
    "career": "Ways of working",
}

# Each topic/sign pair is a complete, reviewed passage. It is paired with a
# planet's authored role passage only after that planet's sign is calculated.
SIGN_PASSAGES = {
    "identity": {
        "Aries": "Initiative can help you see yourself clearly. Pause long enough to choose the direction.",
        "Taurus": "Continuity may be a source of confidence. Let your pace be deliberate.",
        "Gemini": "Questions can reveal new sides of you. Leave room to change your mind.",
        "Cancer": "Care often shapes your sense of belonging. Notice where you can offer it without losing your own needs.",
        "Leo": "Creative expression can feel affirming. Let yourself be seen for what you genuinely make.",
        "Virgo": "Attention to detail can become a quiet strength. Give yourself permission to be unfinished.",
        "Libra": "You may learn about yourself through dialogue. Keep your own preference in the conversation.",
        "Scorpio": "Privacy and depth may matter. Choose where trust can grow at a pace that suits you.",
        "Sagittarius": "Exploration can make your world feel larger. Return to the values that guide your choices.",
        "Capricorn": "Commitment can give your efforts shape. Rest deserves a place in that structure.",
        "Aquarius": "Independent ideas can help you feel spacious. Seek people who respect your perspective.",
        "Pisces": "Imagination can make subtle feelings easier to notice. Give your boundaries equal care.",
    },
    "love": {
        "Aries": "Directness may bring energy to connection. Make room for the other person's pace too.",
        "Taurus": "Steady affection can be reassuring. Notice how small, repeated acts build trust.",
        "Gemini": "Conversation may be part of closeness. Ask questions that leave room for a surprising answer.",
        "Cancer": "Protective care can feel intimate. Let the other person tell you what care means to them.",
        "Leo": "Warmth and celebration may help affection grow. Offer attention that feels sincere.",
        "Virgo": "Care may show up in the details. Speak your feelings as clearly as you show them through help.",
        "Libra": "Mutual consideration can make space for both people. Say what you want as well as what you can give.",
        "Scorpio": "Trust may deepen through honest conversation. Let disclosure happen at a pace both people choose.",
        "Sagittarius": "Shared discovery can keep a bond lively. Protect each person's freedom to grow.",
        "Capricorn": "Reliability can be a form of tenderness. Notice the promises you can truly keep.",
        "Aquarius": "Friendship and independence may belong together. Make room for closeness without demanding sameness.",
        "Pisces": "Gentleness can invite connection. Clear boundaries help that softness remain sustainable.",
    },
    "career": {
        "Aries": "Starting can be easier than waiting for certainty. Give the first step a clear purpose.",
        "Taurus": "Patient effort can build something lasting. Notice when steadiness becomes resistance to change.",
        "Gemini": "Learning across subjects may keep work alive for you. Choose a question worth following deeply.",
        "Cancer": "Work can feel meaningful when it protects or supports others. Keep your own capacity in view.",
        "Leo": "Creative ownership may help you stay engaged. Share credit with the people who help you build.",
        "Virgo": "Careful craft can make your contribution visible. Allow a finished version to leave your hands.",
        "Libra": "Collaboration may help ideas become clearer. Name your own judgment before seeking agreement.",
        "Scorpio": "Depth of focus can be valuable. Choose problems that deserve sustained attention.",
        "Sagittarius": "A wider horizon can renew motivation. Tie exploration to a concrete next step.",
        "Capricorn": "Structure can support a long ambition. Measure progress in ways that include rest.",
        "Aquarius": "Original thinking can open useful paths. Test a bold idea with people it will affect.",
        "Pisces": "Imagination can enrich practical work. Give an idea enough structure to be shared.",
    },
}

ROLE_PASSAGES = {
    "western": {
        "identity": {
            "Sun": "This placement offers a lens on how you express your sense of self.",
            "Moon": "This placement invites reflection on what helps you feel settled.",
            "Mercury": "This placement points toward the style of thinking and speaking you might explore.",
        },
        "love": {
            "Venus": "This placement offers a lens on affection and what feels appealing.",
            "Mars": "This placement invites reflection on desire, initiative, and the way you act.",
            "Moon": "This placement brings emotional needs into the conversation.",
        },
        "career": {
            "Sun": "This placement can frame how you seek purpose in work.",
            "Saturn": "This placement invites you to examine effort, limits, and responsibility.",
            "Jupiter": "This placement can frame where learning and growth feel possible.",
        },
    },
    "vedic": {
        "identity": {
            "Sun": "Surya offers a lens on purpose and the direction of your actions.",
            "Moon": "Chandra invites attention to emotional rhythm and inner steadiness.",
            "Mercury": "Budha offers a lens on study, speech, and discernment.",
        },
        "love": {
            "Venus": "Shukra offers a lens on affection, pleasure, and the care you practice.",
            "Mars": "Mangal invites attention to initiative and the way desire becomes action.",
            "Moon": "Chandra brings emotional rhythm into the relationship picture.",
        },
        "career": {
            "Sun": "Surya offers a lens on purposeful effort.",
            "Saturn": "Shani invites attention to discipline and the work that takes time.",
            "Jupiter": "Guru offers a lens on learning, guidance, and growth.",
        },
    },
}

VEDIC_NAMES = {"Sun": "Surya", "Moon": "Chandra", "Mercury": "Budha", "Venus": "Shukra", "Mars": "Mangal", "Saturn": "Shani", "Jupiter": "Guru"}

D9_PASSAGES = {
    "Aries": "In this finer lens, consider how courage can begin an honest conversation.",
    "Taurus": "In this finer lens, consider the trust built by steady attention.",
    "Gemini": "In this finer lens, consider how curiosity keeps a bond open.",
    "Cancer": "In this finer lens, consider how care can be offered and received.",
    "Leo": "In this finer lens, consider what it means to celebrate someone sincerely.",
    "Virgo": "In this finer lens, consider the kindness hidden in practical help.",
    "Libra": "In this finer lens, consider how both people's wishes can be heard.",
    "Scorpio": "In this finer lens, consider the pace at which trust becomes possible.",
    "Sagittarius": "In this finer lens, consider how shared discovery makes room for growth.",
    "Capricorn": "In this finer lens, consider which commitments you can sustain.",
    "Aquarius": "In this finer lens, consider how closeness and independence can coexist.",
    "Pisces": "In this finer lens, consider how gentleness can have clear boundaries.",
}

ASPECT_PASSAGES = {
    "conjunction": "These two placements share a focal point. Notice how their themes reinforce each other.",
    "sextile": "These placements offer an opening for cooperation. Notice what happens when you use both deliberately.",
    "square": "These placements can pull in different directions. Name the tension before choosing a response.",
    "trine": "These placements may work together with ease. Notice what still needs conscious attention.",
    "opposition": "These placements invite a balancing act. Give each side room to be understood.",
}
