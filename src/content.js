// All words the app shows. Evidence labels: E = evidence, R = reasoning, H = hypothesis. See little-lights-v1.md and feature-map-v1.md.

export const MESSAGES = {
  direct: {
    good: "Good to see you here. Notice what's working today. It's worth keeping.",
    soso: "So-so is a real answer. You don't have to fix it today. A small step is enough.",
    hard: "It's okay to feel this way today. It's real, and it isn't permanent: feelings change, even the heavy ones. You've already gotten through hard things, and you're showing up now. Your next step can be a small one.",
  },
  warm: {
    good: "I'm glad today feels good. Let it be good. You can carry a little of it into tomorrow.",
    soso: "A so-so day is allowed. You don't owe anyone more than what you have today. One small thing is plenty.",
    hard: "I'm so glad you're here. Today is heavy, and that makes sense. It won't stay this heavy. You've come through hard things before, and you can take this one gently, one small step at a time.",
  },
};

export const TONE_SAMPLES = {
  direct: "It's okay to feel this way today. It's real, and it isn't permanent.",
  warm: "I'm so glad you're here. Today is heavy, and that makes sense. It won't stay this heavy.",
};

export const ACE_EXAMPLES = ['Moved somewhere new', 'Got through a loss', 'Finished something difficult', 'A hard stretch at work or health'];
export const SMALL_ACE_EXAMPLES = ['Got out of the house', 'Reached out to someone', 'Did the thing I was dreading', 'Went for a walk', 'Asked for help'];

export const LIGHTS = [
  {
    id: 'words',
    title: 'Words calm the alarm',
    finding: "At UCLA, 30 adults looked at emotional faces in a brain scanner. When they picked a word for the emotion (\"angry\", \"afraid\"), activity in the amygdala, the brain's alarm centre, dropped. Matching names to faces didn't do this.",
    forYou: 'Saying "I feel ___" out loud may take some of the charge out of it.',
    tryIt: 'Finish one sentence on your walk: "Right now I feel ___." For example: "Right now I feel scared and tired."',
    caveat: 'A lab task with faces, not a heartbreak. It shows brain activity, not proof you will feel better.',
  },
  {
    id: 'walk',
    title: 'You don\'t have to feel like walking',
    finding: "In a series of studies, college students who walked felt better than those who sat or stood. Even when they expected to dread something, walkers' mood held steady, and the mood of people watching a video dropped.",
    forYou: "A walk can help even on the days you expect it won't.",
    tryIt: 'Walk 10 minutes before you decide how the day will go. For example: "I\'ll walk to the end of the street and see."',
    caveat: 'College students, short lab walks.',
  },
  {
    id: 'nature',
    title: 'Green and open spaces quiet the loop',
    finding: 'Healthy adults took a 90-minute walk, in nature or in a city. The nature walkers reported less rumination (going round the same thoughts), and a brain area linked to rumination was less active. The city walkers showed no change.',
    forYou: 'If you can, pick a route with trees, water or open sky.',
    tryIt: 'Notice three things you can see. For example: "A cat, a wall of ivy, the wind in the palms."',
    caveat: 'Healthy adults, 90 minutes. Shorter walks and low moods were not tested.',
  },
  {
    id: 'gentle',
    title: 'Gentle works better than hard on yourself',
    finding: 'In one study, writing about emotional pain with self-compassion improved mood more than distraction did. In another, one self-compassionate letter a day for a week lifted happiness and lowered depression symptoms months later.',
    forYou: "Being kind to yourself isn't giving up. It may be the part that does the work.",
    tryIt: 'Say it the way you would write it to yourself: "It makes sense that I\'m hurting. I\'m allowed to go slowly."',
    caveat: 'Mostly students. Short-term mood.',
  },
  {
    id: 'through',
    title: 'Facing it and taking breaks both count',
    finding: 'The Dual Process Model of grief says healthy coping swings back and forth between facing the loss and stepping away from it, to work, friends or small pleasures. It is not a straight line.',
    forYou: "An hour of not thinking about it isn't avoiding. It's part of the process.",
    tryIt: 'After a hard walk, plan one break. For example: "After this I\'ll cook something and watch an episode."',
    caveat: 'A model with research support, not a rule for what to do each day.',
  },
  {
    id: 'change',
    title: 'Feelings change faster than we predict',
    finding: 'Studies of "impact bias" find that people expect bad events to hurt longer and more intensely than they actually do.',
    forYou: "The way it feels today isn't a forecast for next month.",
    tryIt: 'Write one line to read in a week. For example: "Today is a 3 out of 5. Let\'s see what next Wednesday is."',
    caveat: "An average across people. It can't promise how long your own grief takes.",
  },
];

export const TOOLS = [
  {
    id: 'know-guess',
    title: 'Know versus guess',
    why: "The guesses are what keep you up at night. Hearing them next to the facts shows you which is which.",
    steps: ['Say one thing you actually know.', 'Say one thing you are guessing.'],
    example: 'Know: "He hasn\'t written, and he told me he made up his mind." Guess: "He\'s avoiding me because he can\'t face it."',
  },
  {
    id: 'angry-sentence',
    title: 'One angry sentence, unsoftened',
    why: 'Anger with nowhere to go tends to come out as sadness or self-blame. Saying it once, out loud, gives it somewhere to go.',
    steps: ['Finish: "I felt ___ when ___, and I needed ___."', 'Say it without softening. You are not sending it.'],
    example: '"I felt unheard when I said no and it kept coming back, and I needed that no to be taken seriously the first time."',
  },
  {
    id: 'wording',
    title: 'Another way to say it',
    why: '"You made me feel…" is fine to say. A second version separates what happened from how it landed on you, which gives you something you can use next time.',
    steps: ['Notice a line like "you made me feel ___".', 'Try: "I felt ___ when ___, and I needed ___."'],
    example: '"You made me feel helpless" → "I felt helpless when I couldn\'t see a way forward, and I needed to know we\'d work it out."',
  },
  {
    id: 'if-then',
    title: 'If this happens, then I will',
    why: 'Deciding in advance what you will do makes it easier on a day when you have no energy to decide. A 2-minute version counts.',
    steps: ['Pick a moment that pulls you in.', 'Pick one small thing to do instead.'],
    example: '"If I start replaying the conversation, I\'ll walk to the window and breathe three times."',
  },
  {
    id: 'feel-break',
    title: 'Feel-it time, then break time',
    why: 'Facing a feeling and stepping away from it both help. Giving each a time keeps the hard feelings from taking over the whole day.',
    steps: ['Give the feeling 10 minutes, fully.', 'Then plan one break you will enjoy.'],
    example: '"Ten minutes on the balcony with the hard stuff. Then music and a shower."',
  },
];

export const QUESTIONS = [
  { id: 'fills', text: 'What do you love doing, even on low days?', multi: true, options: ['Walking', 'Yoga or movement', 'Music', 'Cooking', 'Drawing or making', 'Ideas and building', 'Animals', 'Time with friends', 'Nature'], free: true },
  { id: 'minute', text: 'Where in your day could one minute fit?', multi: true, options: ['Commute', 'Coffee or kettle', 'In the car', 'After the kids sleep', 'Leaving work', 'Before bed'], free: false },
  { id: 'rough', text: 'How do you usually get through a rough day?', multi: false, options: ['Talk it out', 'Do something', 'Think it through', 'Keep busy'], free: false },
  { id: 'myself', text: 'Where do you feel most like yourself?', multi: true, options: ['Hiking or nature', 'The sea', 'In the kitchen', 'Making something', 'With my dog', 'With certain people'], free: true },
  { id: 'purpose', text: 'Is there something outside this hurt that matters to you?', multi: true, options: ['A project', 'Someone I help', 'A pet or a plant', 'My family', 'My work'], free: true },
];

export const ALLOWED_EXAMPLES = ['Smoking a few cigarettes', 'Comfort food', 'Staying in my pajamas', 'Rewatching a show', 'Crying at odd hours', 'Cancelling plans', 'Not answering messages', 'Skipping a walk'];

export const CRISIS_RE = /(kill myself|end my life|end it all|suicid|want to die|don't want to be alive|do not want to be alive|להתאבד|התאבדות|לא רוצה לחיות|רוצה למות|לסיים את החיים)/i;

export const SAMPLE_REFLECTION = {
  process: 'You begin with questions and circle for a while. The clearer sentences come near the end.',
  feelings: [
    { name: 'Longing', quote: 'we still do' },
    { name: 'Fear', quote: 'scared of the day' },
    { name: 'Pride', quote: 'I did it' },
  ],
  newThing: 'This is the first time you named your own part.',
  invitation: 'On your next walk, say one thing you know and one thing you are guessing. For example: "I know he hasn\'t written. I\'m guessing he\'s avoiding me."',
  wording: { before: 'You made me feel helpless.', after: "I felt helpless when I couldn't see a way forward, and I needed to know we'd work it out." },
};
