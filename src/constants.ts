import type { PromptCategory, Prompt } from './types';
import type { Timestamp } from 'firebase/firestore';

const ts = { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, valueOf: () => '' } as unknown as Timestamp;

export const CHILD_COLORS = [
  '#EA580C', // orange
  '#0891B2', // cyan
  '#16A34A', // green
  '#7C3AED', // violet
];

export const CHILD_AVATARS = ['🦊', '🐨', '🐸', '🦋'];

export const GRANDPA_COLOR = '#2563EB';
export const GRANDMA_COLOR = '#DB2777';

export const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#EAB308', '#EA580C', '#D97706',
  '#22C55E', '#16A34A', '#10B981', '#14B8A6', '#059669',
  '#06B6D4', '#0891B2', '#3B82F6', '#2563EB', '#6366F1',
  '#8B5CF6', '#7C3AED', '#A855F7', '#EC4899', '#DB2777',
  '#F43F5E', '#64748B', '#0F172A', '#92400E', '#065F46',
];

export const AVATAR_OPTIONS = [
  '🦊', '🐨', '🐸', '🦋', '🐯', '🐼', '🦄', '🐶',
  '🐱', '🐰', '🦁', '🐻', '🐮', '🐷', '🐙', '🦜',
  '🐧', '🦩', '🐺', '🦝',
  '🌟', '⭐', '🌈', '🎈', '🌸', '🌺', '🌻', '🍀',
  '🚀', '🎨', '🎸', '🏆', '💎', '🔥',
  '👤', '👴', '👵', '👦', '👧',
];

export const CATEGORIES: PromptCategory[] = [
  { id: 'childhood',   nameEn: 'Childhood & School Days', nameZh: '童年与学校时光', icon: '🏫', order: 1 },
  { id: 'family',      nameEn: 'Family & Traditions',     nameZh: '家庭与传统',     icon: '🏠', order: 2 },
  { id: 'love',        nameEn: 'Love & Marriage',         nameZh: '爱情与婚姻',     icon: '💑', order: 3 },
  { id: 'work',        nameEn: 'Work & Life Lessons',     nameZh: '工作与人生经验', icon: '💼', order: 4 },
  { id: 'food',        nameEn: 'Food, Places & Hobbies',  nameZh: '美食、地方与爱好', icon: '🍜', order: 5 },
];

export const SEED_PROMPTS: Omit<Prompt, 'id' | 'createdAt' | 'approvedBy'>[] = [
  // Childhood & School Days
  { categoryId: 'childhood', textEn: 'What was your favourite game to play as a child?', textZh: '你小时候最喜欢玩什么游戏？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What was your favourite subject in school?', textZh: '你在学校最喜欢哪门课？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'Tell me about your best friend growing up.', textZh: '告诉我你小时候最好的朋友吧。', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What did you want to be when you grew up?', textZh: '你小时候想长大做什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What toys or books did you love as a child?', textZh: '你小时候最喜欢什么玩具或书？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What was the funniest thing that ever happened at school?', textZh: '你在学校发生过最有趣的事是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What was a typical day like when you were my age?', textZh: '你和我一样大的时候，一天是怎么过的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'Did you ever get into trouble as a kid? What happened?', textZh: '你小时候有没有惹过麻烦？发生了什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What was the neighbourhood like where you grew up?', textZh: '你长大的地方是什么样的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'childhood', textEn: 'What was your favourite holiday memory from childhood?', textZh: '你童年时最美好的节日记忆是什么？', grandparentId: null, status: 'active', suggestedBy: null },

  // Family & Traditions
  { categoryId: 'family', textEn: 'What is a family tradition you love most?', textZh: '你最喜欢的家庭传统是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'Tell me about your parents and what they were like.', textZh: '告诉我你的父母是什么样的人。', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'What family stories do you most want us to remember?', textZh: '你最希望我们记住哪些家族故事？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'How did your family celebrate Chinese New Year when you were young?', textZh: '你小时候家里怎么庆祝新年？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'What is something special about our family heritage?', textZh: '我们家族有什么特别的传统或文化？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'Did you have siblings? What were they like?', textZh: '你有兄弟姐妹吗？他们是什么样的人？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'What was the biggest challenge your family ever faced together?', textZh: '你们家一起面对过最大的挑战是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'Who in the family had the most influence on you growing up?', textZh: '家里谁对你成长影响最大？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'What is a funny family story you love telling?', textZh: '你最喜欢讲的一个有趣家族故事是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'family', textEn: 'What values did your parents teach you that you still follow?', textZh: '父母教给你哪些价值观是你至今还坚持的？', grandparentId: null, status: 'active', suggestedBy: null },

  // Love & Marriage
  { categoryId: 'love', textEn: 'How did you and 婆婆/公公 first meet?', textZh: '你和婆婆/公公是怎么认识的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What was your first date like?', textZh: '你们第一次约会是什么样的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'How did you know they were "the one"?', textZh: '你怎么知道他/她就是你的另一半？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What was your wedding day like?', textZh: '你们的婚礼是什么样的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What is the secret to a long and happy marriage?', textZh: '长久幸福婚姻的秘诀是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What is your favourite memory with 婆婆/公公?', textZh: '你和婆婆/公公最美好的记忆是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What did your family think when you first started dating?', textZh: '你刚开始谈恋爱时，家人有什么反应？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What advice would you give me about love someday?', textZh: '关于爱情，你想给我什么建议？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'What was the best gift you ever gave or received from your partner?', textZh: '你送给或收到伴侣最棒的礼物是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'love', textEn: 'How has your relationship changed over the years?', textZh: '你们的感情这些年有什么变化？', grandparentId: null, status: 'active', suggestedBy: null },

  // Work & Life Lessons
  { categoryId: 'work', textEn: 'What was your first job ever?', textZh: '你的第一份工作是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What career are you most proud of?', textZh: '你最自豪的职业成就是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What is the best life lesson you have learned?', textZh: '你学到最重要的人生经验是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What was the hardest decision you ever had to make?', textZh: '你做过最难的决定是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'If you could give your younger self one piece of advice, what would it be?', textZh: '如果可以给年轻的自己一个建议，你会说什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What is something you wish you had done differently in life?', textZh: '你希望人生中有什么可以做得不一样？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What are you most proud of in your life?', textZh: '你人生中最自豪的事是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'How did the world change the most during your lifetime?', textZh: '你觉得你这一生中，世界变化最大的是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What do you hope I will achieve in my life?', textZh: '你最希望我这辈子能做到什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'work', textEn: 'What does family mean to you?', textZh: '家对你来说意味着什么？', grandparentId: null, status: 'active', suggestedBy: null },

  // Food, Places & Hobbies
  { categoryId: 'food', textEn: 'What was your favourite food as a child?', textZh: '你小时候最喜欢吃什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What is a family recipe you would love to pass down?', textZh: '有什么家传食谱你希望传给我们？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What is the most interesting place you have ever visited?', textZh: '你去过最有趣的地方是哪里？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What hobbies did you love when you were young?', textZh: '你年轻时最喜欢什么爱好？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'Is there a dish you make that everyone loves?', textZh: '有没有一道菜是大家都很喜欢吃的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'If you could travel anywhere in the world, where would you go?', textZh: '如果可以去世界任何地方，你会去哪里？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What did a special celebration meal look like in your family?', textZh: '你家里过节时的团圆饭是什么样的？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'Did you have any unusual hobbies or talents?', textZh: '你有没有什么特别的爱好或才艺？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What is the most delicious meal you have ever eaten?', textZh: '你吃过最好吃的一顿饭是什么？', grandparentId: null, status: 'active', suggestedBy: null },
  { categoryId: 'food', textEn: 'What place in the world felt most like home to you?', textZh: '世界上哪个地方让你最有家的感觉？', grandparentId: null, status: 'active', suggestedBy: null },
];

// suppress unused warning for ts placeholder
void ts;
