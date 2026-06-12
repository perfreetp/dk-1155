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
  SELF_DEPRECATING_TEMPLATES
} from '../types';

interface AppState {
  user: UserSettings | null;
  records: EmotionRecord[];
  squarePosts: SquarePost[];
  favoriteReplies: FavoriteReply[];

  initializeUser: () => void;
  addRecord: (record: Omit<EmotionRecord, 'id' | 'createdAt' | 'updatedAt' | 'selfDeprecatingCard'>) => EmotionRecord;
  updateRecord: (id: string, updates: Partial<EmotionRecord>) => void;
  deleteRecord: (id: string) => void;

  publishToSquare: (recordId: string) => void;
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  hugPost: (postId: string) => void;

  addFavoriteReply: (comment: Comment, authorId: string) => void;
  removeFavoriteReply: (id: string) => void;

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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      records: [],
      squarePosts: [],
      favoriteReplies: [],

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
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id
              ? { ...record, ...updates, updatedAt: new Date().toISOString() }
              : record
          )
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
          squarePosts: state.squarePosts.filter((post) => post.recordId !== id)
        }));
      },

      publishToSquare: (recordId) => {
        const state = get();
        const record = state.records.find((r) => r.id === recordId);
        if (!record) return;

        const newPost: SquarePost = {
          id: uuidv4(),
          recordId,
          authorId: state.user?.userId || 'anonymous',
          level: record.level,
          tags: record.tags,
          hugs: 0,
          hasHugged: false,
          comments: [],
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          squarePosts: [newPost, ...state.squarePosts]
        }));

        get().updateRecord(recordId, { visibility: 'public' });
      },

      addComment: (postId, content) => {
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
      },

      likeComment: (postId, commentId) => {
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
      },

      hugPost: (postId) => {
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
        favoriteReplies: state.favoriteReplies
      })
    }
  )
);
