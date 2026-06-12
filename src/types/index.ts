export type EmotionLevel = 1 | 2 | 3 | 4 | 5;

export type Visibility = 'private' | 'friends' | 'public';

export interface EmotionRecord {
  id: string;
  date: string;
  level: EmotionLevel;
  trigger: string;
  tags: string[];
  content: string;
  voiceUrl?: string;
  selfDeprecatingCard: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface SquarePost {
  id: string;
  recordId: string;
  authorId: string;
  level: EmotionLevel;
  tags: string[];
  hugs: number;
  hasHugged: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  nickname: string;
  avatar: string;
  defaultVisibility: Visibility;
  nightReminder: {
    enabled: boolean;
    time: string;
  };
  darkMode: boolean;
  createdAt: string;
}

export interface FavoriteReply {
  id: string;
  commentId: string;
  content: string;
  authorId: string;
  favoritedAt: string;
}

export const EMOTION_TAGS = [
  '工作压力',
  '人际关系',
  '家庭矛盾',
  '感情问题',
  '学业负担',
  '健康担忧',
  '经济压力',
  '未来焦虑',
  '无端低落',
  '其他'
] as const;

export const LEVEL_CONFIG: Record<EmotionLevel, { label: string; emoji: string; color: string }> = {
  1: { label: '微崩溃', emoji: '😐', color: '#C8E6C9' },
  2: { label: '有点崩', emoji: '😔', color: '#DCEDC8' },
  3: { label: '相当崩溃', emoji: '😢', color: '#FFCC80' },
  4: { label: '严重崩溃', emoji: '😰', color: '#FFAB91' },
  5: { label: '彻底崩了', emoji: '😭', color: '#EF9A9A' }
};

export const SELF_DEPRECATING_TEMPLATES: Record<EmotionLevel, string[]> = {
  1: [
    '今天被小事绊了一下，但没关系，明天继续加油！',
    '微崩溃而已，生活还在继续，继续冲！',
    '小小的挫折，大大的成长，继续努力！'
  ],
  2: [
    '有点崩，但还在掌控之中，给自己一个拥抱',
    '今天的挫折是明天的成长，继续坚持！',
    '压力有点大，但你还撑得住，给自己点个赞'
  ],
  3: [
    '今天有点难过，但倾诉出来会好很多',
    '压力山大，不过说出来就是进步',
    '崩溃归崩溃，睡一觉又是好汉一条'
  ],
  4: [
    '今天真的很难，但我在这里陪着你',
    '承受了很多，但你很坚强',
    '崩溃也是一种释放，哭完继续战斗'
  ],
  5: [
    '彻底崩了也没关系，明天又是新的一天',
    '最难的时候，记住你不是一个人',
    '今天很难，但你熬过来了，这就是胜利'
  ]
};
