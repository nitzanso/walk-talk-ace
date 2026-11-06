// Scripts for the hand-drawn films. Each scene: `art` (which drawing), `min` (minimum seconds), and the spoken line in en/he.
// Rule: every number or finding was checked against its source before it went in. Sources are shown at the end.
export const FILMS = {
  intro: {
    id: 'intro',
    source: {
      en: 'Stanford walking study (176 people; helped open-ended thinking, slightly worse on single-answer tasks). Kross et al., 2014 (self-distanced language). Cochrane review of exercise for depression (39 trials; moderate overall, small in the best-designed trials). Chris is a companion, not therapy.',
      he: 'מחקר ההליכה של סטנפורד (176 אנשים; עזר לחשיבה פתוחה, מעט פחות בשאלות עם תשובה אחת). Kross ואחרים, 2014 (שפה מרוחקת מעצמנו). סקירת Cochrane על פעילות גופנית ודיכאון (39 ניסויים; השפעה בינונית בסך הכול, קטנה בניסויים האיכותיים ביותר). כריס היא מלווה, לא טיפול.',
    },
    scenes: [
      { art: 'hello', min: 9, en: "Hi, I'm Chris. Yes, like crisis, minus the drama. I'm your walking buddy, here for the days that feel heavy, confusing, or too loud inside.", he: 'היי, אני כריס. כן, כמו משבר, רק בלי הדרמה. אני החברה שלכם להליכות, לימים שהם כבדים, מבלבלים או רועשים מדי בפנים.' },
      { art: 'born', min: 11, en: 'I was born on a walk, during a hard time. Someone talked out loud to herself as she walked, and noticed she could finally hear what was going on inside. This app is here to give that to anyone who needs it.', he: 'נולדתי בהליכה, בתקופה קשה. מישהי דיברה לעצמה בקול תוך כדי הליכה, ופתאום שמעה מה באמת קורה בתוכה. האפליקציה הזו נבנתה כדי לתת את זה לכל מי שצריך.' },
      { art: 'how', min: 14, en: "You press record and talk while you walk, about anything. I write it down and give you a short reflection: something you may not see from inside. Over time, a page called Me shows how you're changing. And when it's too much, there's a pause button.", he: "לוחצים על הקלטה ומדברים בזמן שהולכים, על כל דבר. אני כותבת את זה, ונותנת השתקפות קצרה: משהו שאולי קשה לראות מבפנים. עם הזמן, דף שנקרא 'אני' מראה איך אתם משתנים. וכשזה יותר מדי, יש כפתור עצירה." },
      { art: 'walk', min: 13, en: "Why walking? In a Stanford study of 176 people, walking helped with open-ended thinking, the kind that finds new ways through a problem. It didn't help with questions that have one right answer. A hard time is mostly an open-ended problem.", he: 'למה הליכה? במחקר של סטנפורד עם 176 אנשים, הליכה עזרה לחשיבה פתוחה, כזו שמוצאת דרכים חדשות לבעיה. היא לא עזרה בשאלות עם תשובה נכונה אחת. תקופה קשה היא בעיקר בעיה פתוחה.' },
      { art: 'talk', min: 14, en: "Why talk out loud? Hearing yourself puts a little distance between you and the feeling. Researchers found that using your own name, or \"you\", when thinking about a stressful moment helped people manage their thoughts and feelings, like advice from a friend.", he: 'למה לדבר בקול? כששומעים את עצמנו נוצר מרחק קטן בינינו לבין הרגש. חוקרים מצאו שדיבור אל עצמנו בשם שלנו או ב"אתה/את", כשחושבים על רגע מלחיץ, עזר לווסת מחשבות ורגשות, כמו עצה מחברה.' },
      { art: 'voices', min: 10, en: "Everyone has advice. I'm not going to add to it. I'll help you notice what you need, and what you want, underneath the noise.", he: 'לכולם יש עצות. אני לא אוסיף עוד אחת. אני אעזור לשים לב למה שאתם צריכים ורוצים, מתחת לרעש.' },
      { art: 'move', min: 15, en: 'Moving helps too, though honestly less than we would like. A big review of 39 trials found exercise moderately reduced depression symptoms, but the effect was small in the best-designed trials. So think of it as one helper, not a cure.', he: 'גם תנועה עוזרת, אבל פחות ממה שהיינו רוצים. סקירה גדולה של 39 ניסויים מצאה שפעילות גופנית מורידה תסמיני דיכאון במידה בינונית, אבל בניסויים האיכותיים ביותר ההשפעה הייתה קטנה. אז חושבים על זה כעוזרת אחת, לא כתרופה.' },
      { art: 'lock', min: 9, en: 'Your recordings stay on your phone. You can delete any of them, and you can see exactly what is sent when you ask for a reflection.', he: 'ההקלטות נשארות בטלפון. אפשר למחוק כל אחת, ואפשר לראות בדיוק מה נשלח כשמבקשים השתקפות.' },
      { art: 'bench', min: 8, en: "I'm a companion, not a therapist. If you're in danger, please reach out to someone who can help, right now.", he: 'אני מלווה, לא מטפלת. אם יש סכנה, בבקשה לפנות עכשיו למישהו שיכול לעזור.' },
      { art: 'start', min: 8, en: 'Whenever you are ready, we can start with one minute. Just press the button, and talk.', he: 'כשתהיו מוכנים, אפשר להתחיל בדקה אחת. לוחצים על הכפתור, ומדברים.' },
    ],
  },
};
