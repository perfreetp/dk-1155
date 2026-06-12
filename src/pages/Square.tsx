import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Send,
  X
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { LEVEL_CONFIG } from '../types';
import { formatDate, generateMockSquarePosts } from '../utils';

const SquarePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    squarePosts,
    addComment,
    likeComment,
    hugPost,
    addFavoriteReply,
    favoriteReplies
  } = useAppStore();

  const [localPosts, setLocalPosts] = useState(squarePosts);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    if (squarePosts.length === 0) {
      const mockPosts = generateMockSquarePosts();
      setLocalPosts(mockPosts);
    } else {
      setLocalPosts(squarePosts);
    }
  }, [squarePosts]);

  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    addComment(postId, content);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    
    // 立即更新本地状态
    setLocalPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now().toString(),
              postId,
              authorId: 'current_user',
              content,
              likes: 0,
              isLiked: false,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    likeComment(postId, commentId);
    
    // 立即更新本地状态
    setLocalPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              };
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  const handleHug = (postId: string) => {
    hugPost(postId);
    
    // 立即更新本地状态
    setLocalPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hugs: post.hasHugged ? post.hugs - 1 : post.hugs + 1,
          hasHugged: !post.hasHugged
        };
      }
      return post;
    }));
  };

  const handleFavorite = (postId: string, comment: any) => {
    addFavoriteReply(comment, comment.authorId);
  };

  const COMFORT_TEMPLATES = [
    '抱抱你，能说出来已经很棒了 💪',
    '我懂这种感受，你不是一个人 🤗',
    '今天辛苦了，明天会更好的 🌟',
    '崩溃也是一种释放，你已经很坚强了 💪',
    '记得照顾好自己，你值得被爱 ❤️'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-orange-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">互助广场 🤝</h1>
          <p className="text-gray-500 text-sm">在这里，我们互相接住彼此</p>
        </header>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowFavorites(false)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              !showFavorites
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            广场动态
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              showFavorites
                ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            我的收藏
          </button>
        </div>

        {showFavorites ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">温暖语录收藏 🌸</h3>
            {favoriteReplies.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-500">还没有收藏的温暖语录</p>
                <p className="text-gray-400 text-sm mt-2">去广场收藏那些打动你的话吧</p>
              </div>
            ) : (
              favoriteReplies.map((favorite) => (
                <div key={favorite.id} className="bg-white rounded-2xl shadow-lg p-4">
                  <p className="text-gray-700 italic">"{favorite.content}"</p>
                  <div className="text-xs text-gray-400 mt-2">
                    收藏于 {formatDate(favorite.favoritedAt, 'MM月dd日 HH:mm')}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg px-3 py-1 text-xs text-gray-600">
                  💡 小提示
                </div>
              </div>
              <p className="text-sm text-gray-600">
                点击卡片查看详情，给崩溃的朋友发送抱抱 🤗，也可以留下温暖的安慰
              </p>
            </div>

            {localPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    崩
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">崩溃患者</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: `${LEVEL_CONFIG[post.level].color}`,
                          color: '#374151'
                        }}
                      >
                        {LEVEL_CONFIG[post.level].emoji} {LEVEL_CONFIG[post.level].label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(post.createdAt, 'MM月dd日 HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => handleHug(post.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition-all ${
                      post.hasHugged
                        ? 'bg-pink-500 text-white'
                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    <span className="text-lg">🤗</span>
                    <span>抱抱</span>
                    {post.hugs > 0 && <span className="font-medium">{post.hugs}</span>}
                  </button>

                  <button className="flex items-center gap-1 px-3 py-2 rounded-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                    <MessageSquare className="w-4 h-4" />
                    <span>安慰</span>
                    {post.comments.length > 0 && (
                      <span className="font-medium">{post.comments.length}</span>
                    )}
                  </button>
                </div>

                {post.comments.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            安
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">安慰者</span>
                              <span className="text-xs text-gray-400">
                                {formatDate(comment.createdAt, 'MM月dd日')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  comment.isLiked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                                <span>{comment.likes || ''}</span>
                              </button>
                              <button
                                onClick={() => handleFavorite(post.id, comment)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-600 transition-colors"
                              >
                                <Bookmark className="w-3 h-3" />
                                <span>收藏</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [post.id]: e.target.value
                      })
                    }
                    placeholder="写下安慰的话..."
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {COMFORT_TEMPLATES.slice(0, 3).map((template, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setCommentInputs({
                          ...commentInputs,
                          [post.id]: template
                        })
                      }
                      className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs hover:bg-purple-100 transition-colors"
                    >
                      {template.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {localPosts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-5xl mb-4">🌙</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">还没有崩溃记录</h3>
                <p className="text-gray-500 text-sm mb-4">去打个卡吧，或者分享你的记录到广场</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                >
                  去打卡
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-40">
        <div className="max-w-2xl mx-auto flex justify-around">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">打卡</span>
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">日历</span>
          </button>
          <button
            onClick={() => navigate('/square')}
            className="flex flex-col items-center gap-1 p-2 text-pink-600"
          >
            <Users className="w-6 h-6 fill-current" />
            <span className="text-xs font-medium">广场</span>
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">统计</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">设置</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SquarePage;
