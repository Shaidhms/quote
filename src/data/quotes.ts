import { Quote } from "@/types";
import { format, addDays } from "date-fns";

const START_DATE = new Date("2026-02-23");

interface RawQuote {
  quote_text: string;
  author: string;
  book_name: string;
  category: string;
}

const rawQuotes: RawQuote[] = [
  // --- Atomic Habits - James Clear ---
  { quote_text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", book_name: "Atomic Habits", category: "Productivity" },
  { quote_text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", book_name: "Atomic Habits", category: "Mindset" },
  { quote_text: "The task of breaking a bad habit is like uprooting a powerful oak within us.", author: "James Clear", book_name: "Atomic Habits", category: "Self-improvement" },

  // --- The Alchemist - Paulo Coelho ---
  { quote_text: "When you want something, all the universe conspires in helping you to achieve it.", author: "Paulo Coelho", book_name: "The Alchemist", category: "Mindset" },
  { quote_text: "There is only one thing that makes a dream impossible to achieve: the fear of failure.", author: "Paulo Coelho", book_name: "The Alchemist", category: "Entrepreneurship" },
  { quote_text: "People learn, early in their lives, what is their reason for being.", author: "Paulo Coelho", book_name: "The Alchemist", category: "Self-improvement" },

  // --- Think and Grow Rich - Napoleon Hill ---
  { quote_text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill", book_name: "Think and Grow Rich", category: "Mindset" },
  { quote_text: "Strength and growth come only through continuous effort and struggle.", author: "Napoleon Hill", book_name: "Think and Grow Rich", category: "Leadership" },
  { quote_text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.", author: "Napoleon Hill", book_name: "Think and Grow Rich", category: "Productivity" },

  // --- Deep Work - Cal Newport ---
  { quote_text: "If you don't produce, you won't thrive—no matter how skilled or talented you are.", author: "Cal Newport", book_name: "Deep Work", category: "Productivity" },
  { quote_text: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport", book_name: "Deep Work", category: "Productivity" },
  { quote_text: "The ability to perform deep work is becoming increasingly rare and increasingly valuable.", author: "Cal Newport", book_name: "Deep Work", category: "Productivity" },

  // --- Start with Why - Simon Sinek ---
  { quote_text: "People don't buy what you do; they buy why you do it.", author: "Simon Sinek", book_name: "Start with Why", category: "Leadership" },
  { quote_text: "Working hard for something we don't care about is called stress. Working hard for something we love is called passion.", author: "Simon Sinek", book_name: "Start with Why", category: "Entrepreneurship" },
  { quote_text: "Great leaders are willing to sacrifice their own interests for the good of those who follow them.", author: "Simon Sinek", book_name: "Start with Why", category: "Leadership" },

  // --- The 7 Habits - Stephen Covey ---
  { quote_text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey", book_name: "The 7 Habits of Highly Effective People", category: "Productivity" },
  { quote_text: "Begin with the end in mind.", author: "Stephen Covey", book_name: "The 7 Habits of Highly Effective People", category: "Leadership" },
  { quote_text: "Most people do not listen with the intent to understand; they listen with the intent to reply.", author: "Stephen Covey", book_name: "The 7 Habits of Highly Effective People", category: "Relationships" },

  // --- Rich Dad Poor Dad - Robert Kiyosaki ---
  { quote_text: "The richest people in the world look for and build networks; everyone else looks for work.", author: "Robert Kiyosaki", book_name: "Rich Dad Poor Dad", category: "Entrepreneurship" },
  { quote_text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki", book_name: "Rich Dad Poor Dad", category: "Entrepreneurship" },

  // --- Zero to One - Peter Thiel ---
  { quote_text: "Doing what we already know how to do takes the world from 1 to n. Every new creation goes from 0 to 1.", author: "Peter Thiel", book_name: "Zero to One", category: "Innovation" },
  { quote_text: "The most contrarian thing of all is not to oppose the crowd but to think for yourself.", author: "Peter Thiel", book_name: "Zero to One", category: "Innovation" },

  // --- Sapiens - Yuval Noah Harari ---
  { quote_text: "You could never convince a monkey to give you a banana by promising him limitless bananas after death.", author: "Yuval Noah Harari", book_name: "Sapiens", category: "Mindset" },
  { quote_text: "History is something that very few people have been doing while everyone else was ploughing fields.", author: "Yuval Noah Harari", book_name: "Sapiens", category: "Leadership" },

  // --- The Lean Startup - Eric Ries ---
  { quote_text: "The only way to win is to learn faster than anyone else.", author: "Eric Ries", book_name: "The Lean Startup", category: "Entrepreneurship" },
  { quote_text: "If you cannot fail, you cannot learn.", author: "Eric Ries", book_name: "The Lean Startup", category: "Innovation" },

  // --- Thinking, Fast and Slow - Daniel Kahneman ---
  { quote_text: "Nothing in life is as important as you think it is, while you are thinking about it.", author: "Daniel Kahneman", book_name: "Thinking, Fast and Slow", category: "Mindset" },
  { quote_text: "A reliable way to make people believe in falsehoods is frequent repetition.", author: "Daniel Kahneman", book_name: "Thinking, Fast and Slow", category: "Leadership" },

  // --- Man's Search for Meaning - Viktor Frankl ---
  { quote_text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl", book_name: "Man's Search for Meaning", category: "Mindset" },
  { quote_text: "He who has a why to live can bear almost any how.", author: "Viktor Frankl", book_name: "Man's Search for Meaning", category: "Self-improvement" },

  // --- The Subtle Art - Mark Manson ---
  { quote_text: "Who you are is defined by what you're willing to struggle for.", author: "Mark Manson", book_name: "The Subtle Art of Not Giving a F*ck", category: "Self-improvement" },
  { quote_text: "The desire for more positive experience is itself a negative experience.", author: "Mark Manson", book_name: "The Subtle Art of Not Giving a F*ck", category: "Mindset" },

  // --- Outliers - Malcolm Gladwell ---
  { quote_text: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good.", author: "Malcolm Gladwell", book_name: "Outliers", category: "Productivity" },
  { quote_text: "Success is not a random act. It arises out of a predictable and powerful set of circumstances.", author: "Malcolm Gladwell", book_name: "Outliers", category: "Entrepreneurship" },

  // --- Good to Great - Jim Collins ---
  { quote_text: "Good is the enemy of great.", author: "Jim Collins", book_name: "Good to Great", category: "Leadership" },
  { quote_text: "Greatness is not a function of circumstance. Greatness is largely a matter of conscious choice.", author: "Jim Collins", book_name: "Good to Great", category: "Leadership" },

  // --- How to Win Friends - Dale Carnegie ---
  { quote_text: "You can make more friends in two months by becoming interested in other people than in two years by trying to get people interested in you.", author: "Dale Carnegie", book_name: "How to Win Friends and Influence People", category: "Relationships" },
  { quote_text: "Any fool can criticize, complain, and condemn—and most fools do.", author: "Dale Carnegie", book_name: "How to Win Friends and Influence People", category: "Relationships" },

  // --- The 4-Hour Workweek - Tim Ferriss ---
  { quote_text: "Focus on being productive instead of busy.", author: "Tim Ferriss", book_name: "The 4-Hour Workweek", category: "Productivity" },
  { quote_text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss", book_name: "The 4-Hour Workweek", category: "Self-improvement" },

  // --- Mindset - Carol Dweck ---
  { quote_text: "Becoming is better than being.", author: "Carol Dweck", book_name: "Mindset", category: "Mindset" },
  { quote_text: "No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.", author: "Carol Dweck", book_name: "Mindset", category: "Mindset" },

  // --- Grit - Angela Duckworth ---
  { quote_text: "Enthusiasm is common. Endurance is rare.", author: "Angela Duckworth", book_name: "Grit", category: "Self-improvement" },
  { quote_text: "Our potential is one thing. What we do with it is quite another.", author: "Angela Duckworth", book_name: "Grit", category: "Mindset" },

  // --- The Power of Habit - Charles Duhigg ---
  { quote_text: "Change might not be fast and it isn't always easy. But with time and effort, almost any habit can be reshaped.", author: "Charles Duhigg", book_name: "The Power of Habit", category: "Self-improvement" },
  { quote_text: "Champions don't do extraordinary things. They do ordinary things, but they do them without thinking.", author: "Charles Duhigg", book_name: "The Power of Habit", category: "Productivity" },

  // --- Shoe Dog - Phil Knight ---
  { quote_text: "The cowards never started and the weak died along the way. That leaves us.", author: "Phil Knight", book_name: "Shoe Dog", category: "Entrepreneurship" },
  { quote_text: "Don't tell people how to do things, tell them what to do and let them surprise you with their results.", author: "Phil Knight", book_name: "Shoe Dog", category: "Leadership" },

  // --- Principles - Ray Dalio ---
  { quote_text: "Pain + Reflection = Progress.", author: "Ray Dalio", book_name: "Principles", category: "Self-improvement" },
  { quote_text: "He who lives by the crystal ball will eat shattered glass.", author: "Ray Dalio", book_name: "Principles", category: "Innovation" },

  // --- The Hard Thing About Hard Things - Ben Horowitz ---
  { quote_text: "Hard things are hard because there are no easy answers or recipes. They are hard because your emotions are at odds with your logic.", author: "Ben Horowitz", book_name: "The Hard Thing About Hard Things", category: "Entrepreneurship" },
  { quote_text: "Take care of the people, the products, and the profits—in that order.", author: "Ben Horowitz", book_name: "The Hard Thing About Hard Things", category: "Leadership" },

  // --- Ikigai - Héctor García & Francesc Miralles ---
  { quote_text: "There is no future, no past. There is only the present.", author: "Héctor García", book_name: "Ikigai", category: "Mindset" },
  { quote_text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Héctor García", book_name: "Ikigai", category: "Productivity" },

  // --- The Innovator's Dilemma - Clayton Christensen ---
  { quote_text: "The reason why it is so difficult for existing firms to capitalize on disruptive innovations is that their processes and business model make them unable to.", author: "Clayton Christensen", book_name: "The Innovator's Dilemma", category: "Innovation" },

  // --- Drive - Daniel Pink ---
  { quote_text: "Control leads to compliance; autonomy leads to engagement.", author: "Daniel Pink", book_name: "Drive", category: "Leadership" },
  { quote_text: "The secret to high performance isn't rewards and punishments, but that unseen intrinsic drive.", author: "Daniel Pink", book_name: "Drive", category: "Productivity" },

  // --- The Art of War - Sun Tzu ---
  { quote_text: "In the midst of chaos, there is also opportunity.", author: "Sun Tzu", book_name: "The Art of War", category: "Leadership" },
  { quote_text: "Appear weak when you are strong, and strong when you are weak.", author: "Sun Tzu", book_name: "The Art of War", category: "Leadership" },

  // --- Meditations - Marcus Aurelius ---
  { quote_text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", book_name: "Meditations", category: "Mindset" },
  { quote_text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", book_name: "Meditations", category: "Self-improvement" },
];

export const quotes: Quote[] = rawQuotes.map((q, index) => ({
  id: index + 1,
  day_number: index + 1,
  quote_text: q.quote_text,
  author: q.author,
  book_name: q.book_name,
  category: q.category,
  scheduled_date: format(addDays(START_DATE, index), "yyyy-MM-dd"),
  is_posted: false,
  posted_at: null,
  card_template: "minimalist",
}));

export const START_DATE_STR = format(START_DATE, "yyyy-MM-dd");
