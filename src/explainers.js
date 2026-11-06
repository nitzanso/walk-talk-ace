// The pool of short explainers. Each one is a few scenes: a drawing, a spoken line, and a caption.
// `tags` say when it fits: situations and states. `source` is shown at the end so the person can check it.
export const EXPLAINERS = [
  {
    id: 'spiral', tags: ['spiraling', 'flooded', 'anxious', 'overthinking'], minutes: 2,
    en: { title: 'Spiraling, and zooming out', source: 'Lieberman et al., 2007, "Putting feelings into words" (Psychological Science). A simplified picture, not a medical explanation.' },
    he: { title: 'ספירלה, ואיך מתרחקים ממנה', source: 'Lieberman ואחרים, 2007, "Putting feelings into words" (Psychological Science). תמונה מפושטת, לא הסבר רפואי.' },
    scenes: [
      { art: 'walk', en: 'Maybe this has happened to you. You are fine, and then one worry turns into ten.', he: 'אולי זה קרה לך. הכול בסדר, ואז דאגה אחת הופכת לעשר.' },
      { art: 'spin', en: 'The thoughts begin to circle. Each one feeds the next, and it feels like it is happening to you and getting out of control. Many people call this spiraling.', he: 'המחשבות מתחילות להסתובב. כל אחת מזינה את הבאה, וזה מרגיש כאילו זה קורה לך ויוצא משליטה. הרבה אנשים קוראים לזה ספירלה.' },
      { art: 'alarm', en: 'Inside, an alarm system is firing. It is fast, and it is built to protect you. The part that plans and thinks things through is slower, and quieter when the alarm is loud. So spiraling is not weakness. It is an alarm doing its job a little too loudly.', he: 'בפנים, מערכת אזעקה פועלת. היא מהירה, והיא נועדה להגן עליך. החלק שמתכנן וחושב לעומק איטי יותר, ושקט יותר כשהאזעקה חזקה. אז ספירלה היא לא חולשה. זו אזעקה שעושה את תפקידה קצת חזק מדי.' },
      { art: 'zoom', en: 'Here is the key. You can zoom out. Imagine floating up and watching yourself walk, with the thoughts circling. Say it plainly: I am spiraling. That one step moves you from inside it to beside it.', he: 'והנה המפתח. אפשר להתרחק. תארי לעצמך שאת מרחפת למעלה וצופה בעצמך הולכת, עם המחשבות שמסתובבות. אמרי את זה פשוט: אני בספירלה. הצעד הזה מעביר אותך מבפנים לצד.' },
      { art: 'label', en: 'Putting a name on the feeling, like anxious or angry, seems to quiet the alarm a little. In brain studies, people who named their feelings showed less alarm activity. It does not make the feeling vanish. It gives you some room.', he: 'לתת שם לרגש, כמו חרדה או כעס, נראה כמרגיע קצת את האזעקה. במחקרי מוח, אנשים שקראו בשם לרגשות שלהם הראו פחות פעילות אזעקה. זה לא גורם לרגש להיעלם. זה נותן לך קצת מקום.' },
      { art: 'breath', en: 'Then give your body a minute. Breathe out slower than you breathe in. A long out-breath helps many people feel the body ease off.', he: 'ואז תני לגוף דקה. נשפי לאט יותר ממה שאת שואפת. נשיפה ארוכה עוזרת להרבה אנשים להרגיש שהגוף נרגע.' },
      { art: 'wave', en: 'And remember how urges behave. The pull to act, to send the message, to decide, rises, peaks, and then comes down. When it is at its highest, that is the best moment to wait.', he: 'וזכרי איך דחפים מתנהגים. המשיכה לפעול, לשלוח הודעה, להחליט, עולה, מגיעה לשיא, ואז יורדת. כשהיא בשיאה, זה הרגע הכי טוב לחכות.' },
      { art: 'end', en: 'You do not have to fix anything now. Notice it, name it, give your body a minute, and let it pass. That is a skill, and you can use it again.', he: 'את לא חייבת לתקן שום דבר עכשיו. הבחיני בזה, קראי לזה בשם, תני לגוף דקה, ותני לזה לעבור. זו מיומנות, ואפשר להשתמש בה שוב.' },
    ],
  },
];
