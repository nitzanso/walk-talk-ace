// Plain-language knowledge the app uses to read a recording. Own wording, based on the Penn resilience and character-strengths courses.
// Thinking traps: five patterns from the Penn Resilience course. Strengths: the 24 VIA character strengths.
export const TRAPS = {
  mindreading: { en: 'Mind reading', he: 'קריאת מחשבות',
    what: { en: 'Deciding what someone else thinks or feels without asking, or expecting them to know what you think.', he: 'להחליט מה מישהו אחר חושב או מרגיש בלי לשאול, או לצפות שהוא ידע מה אתם חושבים.' },
    why: { en: 'It feels true because we know people well, and a guess can feel like a fact.', he: 'זה מרגיש נכון כי אנחנו מכירים אנשים, וניחוש יכול להרגיש כמו עובדה.' },
    tryIt: { en: 'Say: "I know ___. I am guessing ___."', he: 'אמרו: "אני יודע/ת ___. אני מנחש/ת ___."' }, tool: 'know-guess' },
  me: { en: 'Blaming myself', he: 'האשמה עצמית',
    what: { en: 'Taking all the weight of what happened, even the part that was not yours.', he: 'לקחת על עצמנו את כל המשקל של מה שקרה, גם את החלק שלא היה שלנו.' },
    why: { en: 'It can feel like control: if it was me, I can fix it.', he: 'זה יכול להרגיש כמו שליטה: אם זה אני, אפשר לתקן.' },
    tryIt: { en: 'Finish: "That is not the whole picture, because ___."', he: 'השלימו: "זו לא התמונה המלאה, כי ___."' }, tool: 'evidence' },
  them: { en: 'Blaming them', he: 'האשמת האחר',
    what: { en: 'Seeing the other person as the only cause, and leaving out your own part or the situation.', he: 'לראות את האחר כסיבה היחידה, ולהשאיר בחוץ את החלק שלנו או את הנסיבות.' },
    why: { en: 'It protects us from pain for a while, and anger can be a sign something mattered.', he: 'זה מגן עלינו מהכאב לזמן מה, וכעס יכול להעיד שמשהו היה חשוב.' },
    tryIt: { en: 'Say the anger once, out loud, then add: "What I needed was ___."', he: 'אמרו את הכעס פעם אחת בקול, ואז הוסיפו: "מה שהייתי צריך/ה היה ___."' }, tool: 'angry-sentence' },
  catastrophe: { en: 'Running to the worst', he: 'ריצה לגרוע ביותר',
    what: { en: 'Jumping to the worst possible outcome and treating it as the likely one.', he: 'לקפוץ לתוצאה הגרועה ביותר ולהתייחס אליה כסבירה.' },
    why: { en: 'The mind tries to prepare us by rehearsing danger.', he: 'המוח מנסה להכין אותנו בכך שהוא מתרגל סכנה.' },
    tryIt: { en: 'Say the worst, then the best, then the most likely, then one kind plan.', he: 'אמרו את הגרוע, ואז את הטוב, ואז את הסביר, ואז תוכנית עדינה אחת.' }, tool: 'worst-best-likely' },
  helpless: { en: 'Feeling helpless', he: 'תחושת חוסר אונים',
    what: { en: 'Believing that nothing you do will matter.', he: 'להאמין שאין שום דבר שנעשה שישנה.' },
    why: { en: 'After a blow, it can feel like nothing is in our hands.', he: 'אחרי מכה, זה יכול להרגיש שדבר לא בידינו.' },
    tryIt: { en: 'Find one small thing that is in your hands today.', he: 'מצאו דבר קטן אחד שבידיכם היום.' }, tool: 'if-then' },
};

export const STRENGTHS = {
  creativity: { en: 'Creativity', he: 'יצירתיות', what: { en: 'Coming up with new ways to do things.', he: 'להמציא דרכים חדשות לעשות דברים.' }, shadow: { en: 'Can drift from what is practical.', he: 'עלולה להתרחק ממה שמעשי.' } },
  curiosity: { en: 'Curiosity', he: 'סקרנות', what: { en: 'Wanting to explore and understand.', he: 'רצון לחקור ולהבין.' }, shadow: { en: 'Can scatter attention.', he: 'עלולה לפזר קשב.' } },
  judgment: { en: 'Judgment', he: 'שיקול דעת', what: { en: 'Weighing things from several sides.', he: 'לשקול דברים מכמה צדדים.' }, shadow: { en: 'Can freeze decisions.', he: 'עלול להקפיא החלטות.' } },
  learning: { en: 'Love of learning', he: 'אהבת למידה', what: { en: 'Joy in mastering new things.', he: 'שמחה בלימוד דברים חדשים.' }, shadow: { en: 'Can replace doing.', he: 'עלולה להחליף עשייה.' } },
  perspective: { en: 'Perspective', he: 'פרספקטיבה', what: { en: 'Seeing the bigger picture and helping others do so.', he: 'לראות את התמונה הגדולה ולעזור לאחרים.' }, shadow: { en: 'Can feel distant from the moment.', he: 'עלולה להרגיש רחוקה מהרגע.' } },
  bravery: { en: 'Bravery', he: 'אומץ', what: { en: 'Acting despite fear.', he: 'לפעול למרות פחד.' }, shadow: { en: 'Can take risks that are not needed.', he: 'עלול לקחת סיכונים מיותרים.' } },
  perseverance: { en: 'Perseverance', he: 'התמדה', what: { en: 'Continuing when it is hard.', he: 'להמשיך כשקשה.' }, shadow: { en: 'Can keep going past the point of rest.', he: 'עלולה להמשיך מעבר לנקודה של מנוחה.' } },
  honesty: { en: 'Honesty', he: 'כנות', what: { en: 'Being true to yourself and others.', he: 'להיות אמיתיים עם עצמנו ועם אחרים.' }, shadow: { en: 'Can land harder than meant.', he: 'עלולה לנחות חזק מהמתוכנן.' } },
  zest: { en: 'Zest', he: 'להט חיים', what: { en: 'Approaching life with energy.', he: 'לגשת לחיים באנרגיה.' }, shadow: { en: 'Can run on empty.', he: 'עלול לרוץ על ריק.' } },
  love: { en: 'Love', he: 'אהבה', what: { en: 'Valuing close, warm relationships.', he: 'להעריך קשרים קרובים וחמים.' }, shadow: { en: 'Can put others before yourself.', he: 'עלולה להעמיד אחרים לפנינו.' } },
  kindness: { en: 'Kindness', he: 'חסד', what: { en: 'Caring for and helping others.', he: 'לדאוג לאחרים ולעזור להם.' }, shadow: { en: 'Can forget your own needs.', he: 'עלול לשכוח צרכים שלנו.' } },
  social: { en: 'Social intelligence', he: 'אינטליגנציה חברתית', what: { en: 'Understanding what moves people, yourself included.', he: 'להבין מה מניע אנשים, כולל אותנו.' }, shadow: { en: 'Can over-read others.', he: 'עלולה לקרוא אחרים יותר מדי.' } },
  teamwork: { en: 'Teamwork', he: 'עבודת צוות', what: { en: 'Working well as part of a group.', he: 'לעבוד היטב כחלק מקבוצה.' }, shadow: { en: 'Can lose your own voice.', he: 'עלולה לאבד את הקול שלנו.' } },
  fairness: { en: 'Fairness', he: 'הגינות', what: { en: 'Treating people with equal care.', he: 'להתייחס לאנשים בשוויון.' }, shadow: { en: 'Can be hard on yourself.', he: 'עלולה להיות קשה כלפי עצמנו.' } },
  leadership: { en: 'Leadership', he: 'מנהיגות', what: { en: 'Organizing and guiding a group.', he: 'לארגן ולהוביל קבוצה.' }, shadow: { en: 'Can carry too much.', he: 'עלולה לשאת יותר מדי.' } },
  forgiveness: { en: 'Forgiveness', he: 'סליחה', what: { en: 'Giving second chances.', he: 'לתת הזדמנות שנייה.' }, shadow: { en: 'Can excuse what is not okay.', he: 'עלולה לתרץ מה שלא בסדר.' } },
  humility: { en: 'Humility', he: 'ענווה', what: { en: 'Letting accomplishments speak for themselves.', he: 'לתת להישגים לדבר בעד עצמם.' }, shadow: { en: 'Can hide your own worth.', he: 'עלולה להסתיר את הערך שלנו.' } },
  prudence: { en: 'Prudence', he: 'זהירות', what: { en: 'Careful choices, looking ahead.', he: 'בחירות זהירות, מבט קדימה.' }, shadow: { en: 'Can hold back too much.', he: 'עלולה לרסן יותר מדי.' } },
  selfreg: { en: 'Self-regulation', he: 'ויסות עצמי', what: { en: 'Managing feelings and actions.', he: 'לווסת רגשות ופעולות.' }, shadow: { en: 'Can bottle things up.', he: 'עלול לאגור דברים.' } },
  beauty: { en: 'Appreciation of beauty', he: 'הערכת יופי', what: { en: 'Noticing and being moved by beauty and skill.', he: 'להבחין ביופי ובמיומנות ולהתרגש.' }, shadow: { en: 'Can make the ordinary feel dull.', he: 'עלולה לגרום לרגיל להרגיש משעמם.' } },
  gratitude: { en: 'Gratitude', he: 'הכרת תודה', what: { en: 'Noticing and being thankful for good things.', he: 'להבחין בדברים טובים ולהודות עליהם.' }, shadow: { en: 'Can push away real pain.', he: 'עלולה לדחוק כאב אמיתי.' } },
  hope: { en: 'Hope', he: 'תקווה', what: { en: 'Expecting the best and working toward it.', he: 'לצפות לטוב ולפעול אליו.' }, shadow: { en: 'Can skip over what is true now.', he: 'עלולה לדלג על מה שנכון עכשיו.' } },
  humor: { en: 'Humor', he: 'הומור', what: { en: 'Bringing lightness, making others smile.', he: 'להביא קלילות ולגרום לאחרים לחייך.' }, shadow: { en: 'Can cover what hurts.', he: 'עלול לכסות על מה שכואב.' } },
  spirituality: { en: 'Meaning and faith', he: 'משמעות ואמונה', what: { en: 'Feeling part of something bigger.', he: 'להרגיש חלק ממשהו גדול יותר.' }, shadow: { en: 'Can ignore practical needs.', he: 'עלולה להתעלם מצרכים מעשיים.' } },
};
export const TRAP_IDS = Object.keys(TRAPS);
export const STRENGTH_IDS = Object.keys(STRENGTHS);
export const nm = (o, he) => (he ? o.he : o.en);
