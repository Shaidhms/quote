-- Run this in your Supabase SQL Editor to set up the database

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL,
  quote_text TEXT NOT NULL,
  author TEXT NOT NULL,
  book_name TEXT NOT NULL,
  category TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  is_posted BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ,
  card_template TEXT DEFAULT 'minimalist'
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image_url TEXT DEFAULT '',
  display_name TEXT DEFAULT '',
  linkedin_handle TEXT DEFAULT ''
);

-- Enable Row Level Security (allow all for simplicity - single user app)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to quotes" ON quotes FOR ALL USING (true);
CREATE POLICY "Allow all access to user_settings" ON user_settings FOR ALL USING (true);

-- Insert the 60 quotes (run this after creating the table)
INSERT INTO quotes (day_number, quote_text, author, book_name, category, scheduled_date) VALUES
(1, 'You do not rise to the level of your goals. You fall to the level of your systems.', 'James Clear', 'Atomic Habits', 'Productivity', '2026-02-23'),
(2, 'Every action you take is a vote for the type of person you wish to become.', 'James Clear', 'Atomic Habits', 'Mindset', '2026-02-24'),
(3, 'The task of breaking a bad habit is like uprooting a powerful oak within us.', 'James Clear', 'Atomic Habits', 'Self-improvement', '2026-02-25'),
(4, 'When you want something, all the universe conspires in helping you to achieve it.', 'Paulo Coelho', 'The Alchemist', 'Mindset', '2026-02-26'),
(5, 'There is only one thing that makes a dream impossible to achieve: the fear of failure.', 'Paulo Coelho', 'The Alchemist', 'Entrepreneurship', '2026-02-27'),
(6, 'People learn, early in their lives, what is their reason for being.', 'Paulo Coelho', 'The Alchemist', 'Self-improvement', '2026-02-28'),
(7, 'Whatever the mind can conceive and believe, it can achieve.', 'Napoleon Hill', 'Think and Grow Rich', 'Mindset', '2026-03-01'),
(8, 'Strength and growth come only through continuous effort and struggle.', 'Napoleon Hill', 'Think and Grow Rich', 'Leadership', '2026-03-02'),
(9, 'Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.', 'Napoleon Hill', 'Think and Grow Rich', 'Productivity', '2026-03-03'),
(10, 'If you don''t produce, you won''t thrive—no matter how skilled or talented you are.', 'Cal Newport', 'Deep Work', 'Productivity', '2026-03-04'),
(11, 'Clarity about what matters provides clarity about what does not.', 'Cal Newport', 'Deep Work', 'Productivity', '2026-03-05'),
(12, 'The ability to perform deep work is becoming increasingly rare and increasingly valuable.', 'Cal Newport', 'Deep Work', 'Productivity', '2026-03-06'),
(13, 'People don''t buy what you do; they buy why you do it.', 'Simon Sinek', 'Start with Why', 'Leadership', '2026-03-07'),
(14, 'Working hard for something we don''t care about is called stress. Working hard for something we love is called passion.', 'Simon Sinek', 'Start with Why', 'Entrepreneurship', '2026-03-08'),
(15, 'Great leaders are willing to sacrifice their own interests for the good of those who follow them.', 'Simon Sinek', 'Start with Why', 'Leadership', '2026-03-09'),
(16, 'The key is not to prioritize what''s on your schedule, but to schedule your priorities.', 'Stephen Covey', 'The 7 Habits of Highly Effective People', 'Productivity', '2026-03-10'),
(17, 'Begin with the end in mind.', 'Stephen Covey', 'The 7 Habits of Highly Effective People', 'Leadership', '2026-03-11'),
(18, 'Most people do not listen with the intent to understand; they listen with the intent to reply.', 'Stephen Covey', 'The 7 Habits of Highly Effective People', 'Relationships', '2026-03-12'),
(19, 'The richest people in the world look for and build networks; everyone else looks for work.', 'Robert Kiyosaki', 'Rich Dad Poor Dad', 'Entrepreneurship', '2026-03-13'),
(20, 'It''s not how much money you make, but how much money you keep.', 'Robert Kiyosaki', 'Rich Dad Poor Dad', 'Entrepreneurship', '2026-03-14'),
(21, 'Doing what we already know how to do takes the world from 1 to n. Every new creation goes from 0 to 1.', 'Peter Thiel', 'Zero to One', 'Innovation', '2026-03-15'),
(22, 'The most contrarian thing of all is not to oppose the crowd but to think for yourself.', 'Peter Thiel', 'Zero to One', 'Innovation', '2026-03-16'),
(23, 'You could never convince a monkey to give you a banana by promising him limitless bananas after death.', 'Yuval Noah Harari', 'Sapiens', 'Mindset', '2026-03-17'),
(24, 'History is something that very few people have been doing while everyone else was ploughing fields.', 'Yuval Noah Harari', 'Sapiens', 'Leadership', '2026-03-18'),
(25, 'The only way to win is to learn faster than anyone else.', 'Eric Ries', 'The Lean Startup', 'Entrepreneurship', '2026-03-19'),
(26, 'If you cannot fail, you cannot learn.', 'Eric Ries', 'The Lean Startup', 'Innovation', '2026-03-20'),
(27, 'Nothing in life is as important as you think it is, while you are thinking about it.', 'Daniel Kahneman', 'Thinking, Fast and Slow', 'Mindset', '2026-03-21'),
(28, 'A reliable way to make people believe in falsehoods is frequent repetition.', 'Daniel Kahneman', 'Thinking, Fast and Slow', 'Leadership', '2026-03-22'),
(29, 'When we are no longer able to change a situation, we are challenged to change ourselves.', 'Viktor Frankl', 'Man''s Search for Meaning', 'Mindset', '2026-03-23'),
(30, 'He who has a why to live can bear almost any how.', 'Viktor Frankl', 'Man''s Search for Meaning', 'Self-improvement', '2026-03-24'),
(31, 'Who you are is defined by what you''re willing to struggle for.', 'Mark Manson', 'The Subtle Art of Not Giving a F*ck', 'Self-improvement', '2026-03-25'),
(32, 'The desire for more positive experience is itself a negative experience.', 'Mark Manson', 'The Subtle Art of Not Giving a F*ck', 'Mindset', '2026-03-26'),
(33, 'Practice isn''t the thing you do once you''re good. It''s the thing you do that makes you good.', 'Malcolm Gladwell', 'Outliers', 'Productivity', '2026-03-27'),
(34, 'Success is not a random act. It arises out of a predictable and powerful set of circumstances.', 'Malcolm Gladwell', 'Outliers', 'Entrepreneurship', '2026-03-28'),
(35, 'Good is the enemy of great.', 'Jim Collins', 'Good to Great', 'Leadership', '2026-03-29'),
(36, 'Greatness is not a function of circumstance. Greatness is largely a matter of conscious choice.', 'Jim Collins', 'Good to Great', 'Leadership', '2026-03-30'),
(37, 'You can make more friends in two months by becoming interested in other people than in two years by trying to get people interested in you.', 'Dale Carnegie', 'How to Win Friends and Influence People', 'Relationships', '2026-03-31'),
(38, 'Any fool can criticize, complain, and condemn—and most fools do.', 'Dale Carnegie', 'How to Win Friends and Influence People', 'Relationships', '2026-04-01'),
(39, 'Focus on being productive instead of busy.', 'Tim Ferriss', 'The 4-Hour Workweek', 'Productivity', '2026-04-02'),
(40, 'What we fear doing most is usually what we most need to do.', 'Tim Ferriss', 'The 4-Hour Workweek', 'Self-improvement', '2026-04-03'),
(41, 'Becoming is better than being.', 'Carol Dweck', 'Mindset', 'Mindset', '2026-04-04'),
(42, 'No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.', 'Carol Dweck', 'Mindset', 'Mindset', '2026-04-05'),
(43, 'Enthusiasm is common. Endurance is rare.', 'Angela Duckworth', 'Grit', 'Self-improvement', '2026-04-06'),
(44, 'Our potential is one thing. What we do with it is quite another.', 'Angela Duckworth', 'Grit', 'Mindset', '2026-04-07'),
(45, 'Change might not be fast and it isn''t always easy. But with time and effort, almost any habit can be reshaped.', 'Charles Duhigg', 'The Power of Habit', 'Self-improvement', '2026-04-08'),
(46, 'Champions don''t do extraordinary things. They do ordinary things, but they do them without thinking.', 'Charles Duhigg', 'The Power of Habit', 'Productivity', '2026-04-09'),
(47, 'The cowards never started and the weak died along the way. That leaves us.', 'Phil Knight', 'Shoe Dog', 'Entrepreneurship', '2026-04-10'),
(48, 'Don''t tell people how to do things, tell them what to do and let them surprise you with their results.', 'Phil Knight', 'Shoe Dog', 'Leadership', '2026-04-11'),
(49, 'Pain + Reflection = Progress.', 'Ray Dalio', 'Principles', 'Self-improvement', '2026-04-12'),
(50, 'He who lives by the crystal ball will eat shattered glass.', 'Ray Dalio', 'Principles', 'Innovation', '2026-04-13'),
(51, 'Hard things are hard because there are no easy answers or recipes. They are hard because your emotions are at odds with your logic.', 'Ben Horowitz', 'The Hard Thing About Hard Things', 'Entrepreneurship', '2026-04-14'),
(52, 'Take care of the people, the products, and the profits—in that order.', 'Ben Horowitz', 'The Hard Thing About Hard Things', 'Leadership', '2026-04-15'),
(53, 'There is no future, no past. There is only the present.', 'Héctor García', 'Ikigai', 'Mindset', '2026-04-16'),
(54, 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Héctor García', 'Ikigai', 'Productivity', '2026-04-17'),
(55, 'The reason why it is so difficult for existing firms to capitalize on disruptive innovations is that their processes and business model make them unable to.', 'Clayton Christensen', 'The Innovator''s Dilemma', 'Innovation', '2026-04-18'),
(56, 'Control leads to compliance; autonomy leads to engagement.', 'Daniel Pink', 'Drive', 'Leadership', '2026-04-19'),
(57, 'The secret to high performance isn''t rewards and punishments, but that unseen intrinsic drive.', 'Daniel Pink', 'Drive', 'Productivity', '2026-04-20'),
(58, 'In the midst of chaos, there is also opportunity.', 'Sun Tzu', 'The Art of War', 'Leadership', '2026-04-21'),
(59, 'You have power over your mind — not outside events. Realize this, and you will find strength.', 'Marcus Aurelius', 'Meditations', 'Mindset', '2026-04-22'),
(60, 'The happiness of your life depends upon the quality of your thoughts.', 'Marcus Aurelius', 'Meditations', 'Self-improvement', '2026-04-23');
