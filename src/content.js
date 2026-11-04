// All words the app shows. Evidence labels: E = evidence, R = reasoning, H = hypothesis. See little-lights-v1.md and feature-map-v1.md.

export const MESSAGES = {
  direct: {
    good: "Good to see you here. Notice what's working today. It's worth keeping.",
    soso: "So-so is a real answer. You don't have to fix it today. A small step is enough.",
    hard: "It's okay to feel this way today. It's real, and it makes sense. You don't have to do anything with it right now. If you'd like company or one small thing, I'm here.",
  },
  warm: {
    good: "I'm glad today feels good. Let it be good. You can carry a little of it into tomorrow.",
    soso: "A so-so day is allowed. You don't owe anyone more than what you have today. One small thing is plenty.",
    hard: "I'm so glad you're here. Today is heavy, and that makes sense. Nothing has to be fixed right now. We can just be with it, or find one small gentle thing, whichever you'd like.",
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
    id: 'kind-company', title: 'Keep yourself company for a minute', for: ['heavy', 'empty'], low: true,
    why: 'When something hurts, being gentle with yourself can matter more than fixing it. This is for the moments you just need to be with it, with no goal.',
    steps: ['Rest a hand on your chest or your belly.', 'Say, quietly: "This hurts, and it makes sense that it hurts."', 'Stay as long as you like. Stopping is fine too.'],
    example: '"It hurts because it mattered. I\'m allowed to hurt."',
  },
  {
    id: 'belly-breath', title: 'Slow breath into the belly', for: ['heavy', 'urge', 'anger', 'body'], low: true,
    why: 'A slow breath out tells the body it can come down a little. It does not fix anything; it gives you a bit of room.',
    steps: ['One hand on your chest, one on your belly.', 'Breathe in so the belly rises like a balloon. Breathe out a little longer.', 'Go for about two minutes, or as long as feels okay.'],
    example: 'In for 4, out for 6. If counting is annoying, just make the out-breath longer.',
  },
  {
    id: 'senses-walk', title: 'Walk and notice', for: ['thoughts', 'empty', 'body', 'heavy'], low: true,
    why: 'Walking and noticing what is around you gives a spinning mind something else to hold for a while. You don\'t need to feel better first.',
    steps: ['Walk for a few minutes, slower than usual if you like.', 'Notice three things you can see, then two you can hear.'],
    example: '"A cat on the wall, a car door, wind in the palms. And my own steps."',
  },
  {
    id: 'name-feeling', title: 'Find the right word for it', for: ['heavy', 'thoughts', 'anger'], low: true,
    why: 'Putting a precise word on a feeling can take some of the charge out of it. The right word is the one that fits, not the nicest one.',
    steps: ['Say: "Right now I feel ___."', 'If it does not fit, try another word until one feels right.'],
    example: '"Right now I feel lonely, and a little scared, and tired."',
  },
  {
    id: 'know-guess', title: 'What I know and what I\'m guessing', for: ['thoughts'], low: false,
    why: 'The guesses are what keep you up at night. Hearing them next to the facts shows you which is which.',
    steps: ['Say one thing you actually know.', 'Say one thing you are guessing.'],
    example: 'Know: "The results come on Thursday." Guess: "They will be bad."',
  },
  {
    id: 'evidence', title: 'Is the whole picture true?', for: ['thoughts'], low: false,
    why: 'A painful thought often holds one piece of the truth and leaves the rest out. Adding the rest back is not arguing with your pain.',
    steps: ['Say the painful thought.', 'Finish: "That\'s not the whole picture, because ..."', 'Use real things that happened, as vividly as you can.'],
    example: '"It\'s all my fault." → "That\'s not the whole picture, because we both made choices, and I tried for a long time."',
  },
  {
    id: 'worst-best-likely', title: 'Worst, best, most likely, then a kind plan', for: ['thoughts'], low: false,
    why: 'Worry keeps its force by staying vague. Saying the whole chain out loud, then the likely version, then one gentle plan, makes it smaller.',
    steps: ['Say the worst case, all the way to the end.', 'Say the best case, as vividly as the worst.', 'Say what will most likely happen, including that you will feel sad.', 'Choose one kind thing to do if that happens.'],
    example: 'Worry: "the meeting on Monday." Likely: "I\'ll be nervous and stumble over a few words." Plan: "I\'ll breathe slowly before it and keep water next to me."',
  },
  {
    id: 'if-then', title: 'When the pull comes, one small thing first', for: ['urge'], low: true,
    why: 'An urge is a wave. You don\'t have to fight it or be perfect about it, only put one small thing in front of it.',
    steps: ['Name the pull: "I want to ___."', 'Say it\'s allowed to be there. Whatever you choose is yours.', 'Before you decide, do one small thing for ten minutes.'],
    example: '"I want to check my phone again. I\'ll water the plants and drink a glass of water first, then I\'ll see how I feel."',
  },
  {
    id: 'company-near', title: 'Be near people, no talking needed', for: ['empty', 'heavy'], low: true,
    why: 'Sometimes the lonely part is the silence, not the lack of conversation. Being around others can ease it without asking anything of you.',
    steps: ['Pick a place where people are: a cafe, a park bench, a friend\'s kitchen.', 'Stay as long as is comfortable. You don\'t need to explain anything.'],
    example: '"I\'ll take my book to the cafe and sit by the window for half an hour."',
  },
  {
    id: 'remember-through', title: 'Remember something you\'ve already come through', for: ['heavy', 'empty', 'thoughts'], low: false,
    why: 'Remembering how you got through something hard shows you what you have inside, without saying today is easy.',
    steps: ['Pick one hard thing you got through. Open one of your aces if you like.', 'Say one thing that helped you then.'],
    example: '"When I moved alone, it helped to call my sister every evening."',
  },
  {
    id: 'feel-break', title: 'Time for the feeling, and time to rest', for: ['heavy', 'thoughts', 'empty'], low: true,
    why: 'Feeling the loss and stepping away from it both belong to grief. You can move between them as you need.',
    steps: ['Give the feeling a few minutes, fully, if you want to.', 'Then choose one thing that is gentle or enjoyable, with no guilt.'],
    example: '"Ten minutes on the balcony with it. Then music and a shower."',
  },
  {
    id: 'one-good', title: 'One small good thing', for: ['empty', 'heavy'], low: true,
    why: 'When things are hard, small good things are easy to miss. This is not about the pain going away; it is about noticing the gentle things too. It can be tiny.',
    steps: ['Think of one small thing today that was okay or kind.', 'Say why, in one sentence.'],
    example: '"The coffee was warm, and the sun reached the table."',
  },
  {
    id: 'angry-sentence', title: 'Let the anger speak (not to send)', for: ['anger'], low: true,
    why: 'Anger with nowhere to go often turns into sadness or blame of yourself. Saying it once gives it somewhere to go. It\'s allowed.',
    steps: ['Finish: "I felt ___ when ___, and I needed ___."', 'Say it without softening. You\'re not sending it.'],
    example: '"I felt unheard when I said no and it kept coming back, and I needed that no to be taken seriously the first time."',
  },
  {
    id: 'wording', title: 'Another way to say it', for: ['anger', 'thoughts'], low: false,
    why: 'A second version separates what happened from how it landed on you, which gives you something you can use next time.',
    steps: ['Notice a line like "you made me feel ___".', 'Try: "I felt ___ when ___, and I needed ___."'],
    example: '"You made me feel helpless" → "I felt helpless when I couldn\'t see a way forward, and I needed to know we\'d work it out."',
  },
  {
    id: 'hobby-ten', title: 'Ten minutes of something you love', for: ['empty', 'body', 'heavy'], low: true,
    why: 'Doing something that absorbs you, even briefly, gives the mind a rest from the hurt. It is not running away; it is part of the balance.',
    steps: ['Pick something you enjoy and can start in a minute.', 'Put the phone in another room for ten minutes.', 'When the time is up, notice how you feel, whatever it is.'],
    example: '"Ten minutes of drawing," "one song on the guitar," "a short yoga flow," "chopping vegetables slowly."',
  },
  {
    id: 'time-with-loved', title: 'A little time with someone who is good for you', for: ['empty', 'heavy', 'body'], low: false,
    why: 'Being with people we love is one of the most reliable sources of well-being in the research you studied. It does not have to be a deep talk.',
    steps: ['Think of one person you feel good around.', 'Choose something small to do together or near each other.', 'Say in one line what you would like. You can keep it simple.'],
    example: '"Coffee with Dana on Thursday," "sit in the same room and each do our own thing," "a walk with my sister."',
  },
  {
    id: 'small-finish', title: 'Finish one tiny thing', for: ['empty', 'thoughts', 'body'], low: true,
    why: 'Completing something small gives a feeling of having done something, which matters when everything feels out of hand.',
    steps: ['Pick one task that takes five minutes or less.', 'Do only that task.', 'Tick it, or say out loud: "That one is done."'],
    example: '"Answer one message," "wash the cups," "fold one pile of clothes."',
  },
  {
    id: 'one-for-someone', title: 'One small thing for someone else', for: ['empty', 'heavy', 'body'], low: false,
    why: 'Doing something for another person, or for something you care about, is a steady source of meaning. It can be very small, and you do not owe it to anyone.',
    steps: ['Think of one person or cause you care about.', 'Pick the smallest useful thing you could do.', 'Do it, or put it in your calendar.'],
    example: '"Send a student a short encouraging note," "water a neighbor\'s plants," "share a recipe."',
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
  headline: 'You are looking at what happened from more than one side, and it hurts.',
  process: 'You start with questions and circle for a while. The clearer sentences come near the end.',
  heard: 'You started by asking questions about what happened. You went back over it a few times, looking at it from his side and from yours. Near the end you said you did it, and that you are scared of the day it gets real.',
  underneath: 'It sounds like part of you wants to be fair to both of you, and another part is afraid of the hardest day. Maybe what matters most right now is feeling safe enough to be honest without losing yourself.',
  holding: 'You are carrying a lot of uncertainty at once. And you are already doing something hard: naming your own part without turning it against yourself.',
  feelings: [
    { name: 'Longing', quote: 'we still do', pleasant: false, energy: 'low' },
    { name: 'Fear', quote: 'scared of the day', pleasant: false, energy: 'high' },
    { name: 'Pride', quote: 'I did it', pleasant: true, energy: 'high' },
  ],
  traps: [{ id: 'catastrophe', quote: 'scared of the day', why: 'The mind jumps ahead to the hardest day and treats it as certain.' }],
  strengths: [{ id: 'honesty', quote: 'I did it', how: 'You say plainly what is true for you, including your own part.' }],
  newThing: 'This is the first time you named your own part.',
  steadying: { quote: 'I did it' },
  tool: 'worst-best-likely',
};
