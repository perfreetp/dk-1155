import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  EmotionRecord,
  SquarePost,
  UserSettings,
  FavoriteReply,
  EmotionLevel,
  Visibility,
  Comment,
  SELF_DEPRECATING_TEMPLATES,
  MyInteraction
} from '../types';

interface AppState {
  user: UserSettings | null;
  records: EmotionRecord[];
  squarePosts: SquarePost[];
  favoriteReplies: FavoriteReply[];
  myInteractions: MyInteraction[];

  initializeUser: () => void;
  addRecord: (record: Omit<EmotionRecord, 'id' | 'createdAt' | 'updatedAt' | 'selfDeprecatingCard'>) => EmotionRecord;
  updateRecord: (id: string, updates: Partial<EmotionRecord>) => void;
  deleteRecord: (id: string) => void;

  publishToSquare: (recordId: string) => void;
  updateSquarePost: (recordId: string, updates: Partial<SquarePost>) => void;
  removeSquarePost: (recordId: string) => void;
  addComment: (postId: string, content: string, recordId: string) => void;
  likeComment: (postId: string, commentId: string, recordId: string) => void;
  hugPost: (postId: string, recordId: string) => void;

  addFavoriteReply: (comment: Comment, authorId: string) => void;
  removeFavoriteReply: (id: string) => void;

  addInteraction: (interaction: Omit<MyInteraction, 'id' | 'createdAt'>) => void;
  getMyInteractions: (type?: 'comment' | 'hug' | 'like') => MyInteraction[];
  getVisiblePosts: () => SquarePost[];

  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const generateSelfDeprecatingCard = (level: EmotionLevel): string => {
  const templates = SELF_DEPRECATING_TEMPLATES[level];
  return templates[Math.floor(Math.random() * templates.length)];
};

const getRandomAvatar = (): string => {
  const colors = ['FF8A80', '81C784', '9575CD', '4FC3F7', 'FFD54F'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=AN&background=${color}&color=fff&size=128`;
};

const STORAGE_KEYS = {
  USER: 'today_breakdown_user',
  RECORDS: 'today_breakdown_records',
  SQUARE_POSTS: 'today_breakdown_square',
  FAVORITES: 'today_breakdown_favorites'
};

const DEFAULT_SQUARE_POSTS: SquarePost[] = [
  {
    id: 'default-1',
    recordId: 'mock-1',
    authorId: 'user-1',
    level: 3 as EmotionLevel,
    tags: ['工作压力', '人际关系'],
    hugs: 12,
    hasHugged: false,
    comments: [
      {
        id: 'dc1',
        postId: 'default-1',
        authorId: 'user-2',
        content: '抱抱你，工作上的事真的很让人崩溃，但你能坚持说出来已经很棒了 💪',
        likes: 5,
        isLiked: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'dc2',
        postId: 'default-1',
        authorId: 'user-3',
        content: '我懂这种感受，甲方爸爸的需求永远变来变去，但这就是成长啊',
        likes: 3,
        isLiked: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'default-2',
    recordId: 'mock-2',
    authorId: 'user-4',
    level: 4 as EmotionLevel,
    tags: ['感情问题', '未来焦虑'],
    hugs: 23,
    hasHugged: false,
    comments: [
      {
        id: 'dc3',
        postId: 'default-2',
        authorId: 'user-5',
        content: '感情的坎真的很难过，但记住，你值得被爱，也会找到属于自己的幸福 🤗',
        likes: 8,
        isLiked: false,
        createdAt: new Date(Date.now() - 5400000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'default-3',
    recordId: 'mock-3',
    authorId: 'user-6',
    level: 2 as EmotionLevel,
    tags: ['学业负担'],
    hugs: 8,
    hasHugged: false,
    comments: [
      {
        id: 'dc4',
        postId: 'default-3',
        authorId: 'user-7',
        content: '考试季大家都压力山大，坚持就是胜利！你已经做得很好了 🌟',
        likes: 2,
        isLiked: false,
        createdAt: new Date(Date.now() - 10800000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      records: [],
      squarePosts: DEFAULT_SQUARE_POSTS,
      favoriteReplies: [],
      myInteractions: [],

      initializeUser: () => {
        const state = get();
        if (state.user) return;

        const newUser: UserSettings = {
          userId: uuidv4(),
          nickname: '崩溃患者',
          avatar: getRandomAvatar(),
          defaultVisibility: 'private',
          nightReminder: {
            enabled: false,
            time: '22:00'
          },
          darkMode: false,
          createdAt: new Date().toISOString()
        };

        set({ user: newUser });
      },

      addRecord: (recordData) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const selfDeprecatingCard = generateSelfDeprecatingCard(recordData.level);

        const newRecord: EmotionRecord = {
          ...recordData,
          id,
          selfDeprecatingCard,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          records: [newRecord, ...state.records]
        }));

        return newRecord;
      },

      updateRecord: (id, updates) => {
        const state = get();
        const oldRecord = state.records.find(r => r.id === id);
        const wasPublic = oldRecord?.visibility === 'public';
        const willBePublic = updates.visibility === 'public';
        
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id
              ? { ...record, ...updates, updatedAt: new Date().toISOString() }
              : record
          )
        }));

        if (wasPublic && !willBePublic) {
          get().removeSquarePost(id);
        } else if (!wasPublic && willBePublic) {
          get().publishToSquare(id);
        } else if (wasPublic && willBePublic) {
          get().updateSquarePost(id, updates);
        }
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
          squarePosts: state.squarePosts.filter((post) => post.recordId !== id),
          myInteractions: state.myInteractions.filter(i => i.postRecordId !== id)
        }));
      },

      publishToSquare: (recordId) => {
        const state = get();
        const record = state.records.find((r) => r.id === recordId);
        if (!record) return;

        const existingPost = state.squarePosts.find(p => p.recordId === recordId);
        if (existingPost) return;

        const newPost: SquarePost = {
          id: uuidv4(),
          recordId,
          authorId: state.user?.userId || 'anonymous',
          level: record.level,
          tags: record.tags,
          hugs: 0,
          hasHugged: false,
          comments: [],
          createdAt: record.createdAt
        };

        set((state) => ({
          squarePosts: [newPost, ...state.squarePosts]
        }));
      },

      updateSquarePost: (recordId, updates) => {
        set((state) => ({
          squarePosts: state.squarePosts.map((post) =>
            post.recordId === recordId
              ? { ...post, ...updates }
              : post
          )
        }));
      },

      removeSquarePost: (recordId) => {
        set((state) => ({
          squarePosts: state.squarePosts.filter((post) => post.recordId !== recordId)
        }));
      },

      addComment: (postId, content, recordId) => {
        const state = get();
        const newComment: Comment = {
          id: uuidv4(),
          postId,
          authorId: state.user?.userId || 'anonymous',
          content,
          likes: 0,
          isLiked: false,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          squarePosts: state.squarePosts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          )
        }));

        get().addInteraction({
          type: 'comment',
          postId,
          postRecordId: recordId,
          targetId: newComment.id,
          content
        });
      },

      likeComment: (postId, commentId, recordId) => {
        const state = get();
        const post = state.squarePosts.find(p => p.id === postId);
        const comment = post?.comments.find(c => c.id === commentId);
        
        set((state) => ({
          squarePosts: state.squarePosts.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                      isLiked: !comment.isLiked
                    }
                  : comment
              )
            };
          })
        }));

        if (comment && !comment.isLiked) {
          get().addInteraction({
            type: 'like',
            postId,
            postRecordId: recordId,
            targetId: commentId
          });
        }
      },

      hugPost: (postId, recordId) => {
        const state = get();
        const post = state.squarePosts.find(p => p.id === postId);
        
        set((state) => ({
          squarePosts: state.squarePosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  hugs: post.hasHugged ? post.hugs - 1 : post.hugs + 1,
                  hasHugged: !post.hasHugged
                }
              : post
          )
        }));

        if (post && !post.hasHugged) {
          get().addInteraction({
            type: 'hug',
            postId,
            postRecordId: recordId
          });
        }
      },

      addFavoriteReply: (comment, authorId) => {
        const newFavorite: FavoriteReply = {
          id: uuidv4(),
          commentId: comment.id,
          content: comment.content,
          authorId,
          favoritedAt: new Date().toISOString()
        };

        set((state) => ({
          favoriteReplies: [newFavorite, ...state.favoriteReplies]
        }));
      },

      removeFavoriteReply: (id) => {
        set((state) => ({
          favoriteReplies: state.favoriteReplies.filter((f) => f.id !== id)
        }));
      },

      addInteraction: (interaction) => {
        const newInteraction: MyInteraction = {
          ...interaction,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          myInteractions: [newInteraction, ...state.myInteractions]
        }));
      },

      getMyInteractions: (type) => {
        const state = get();
        if (type) {
          return state.myInteractions.filter(i => i.type === type);
        }
        return state.myInteractions;
      },

      getVisiblePosts: () => {
        const state = get();
        return state.squarePosts.filter(post => {
          const record = state.records.find(r => r.id === post.recordId);
          return record?.visibility === 'public';
        });
      },

      updateUserSettings: (settings) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...settings } : null
        }));
      }
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        records: state.records,
        squarePosts: state.squarePosts,
        favoriteReplies: state.favoriteReplies,
        myInteractions: state.myInteractions
      })
    }
  )
);
