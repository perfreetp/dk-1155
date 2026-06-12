import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Star,
  MessageSquare,
  Mic,
  Copy,
  Share2,
  ChevronRight,
  Heart,
  Lock,
  Users,
  Globe
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  EmotionLevel,
  Visibility,
  EMOTION_TAGS,
  LEVEL_CONFIG
} from '../types';
import { formatDate } from '../utils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addRecord, publishToSquare, initializeUser, records } = useAppStore();

  const [level, setLevel] = useState<EmotionLevel | null>(null);
  const [trigger, setTrigger] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentCard, setCurrentCard] = useState('');

  useEffect(() => {
    if (!user) {
      initializeUser();
    }
    setVisibility(user?.defaultVisibility || 'private');
  }, [user, initializeUser]);

  const todayRecord = records.find(
    (r) => r.date === formatDate(new Date())
  );

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < 3) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = () => {
    if (!level) return;

    const newRecord = addRecord({
      date: formatDate(new Date()),
      level,
      trigger,
      tags,
      content,
      visibility
    });

    setShowSuccess(true);
    setCurrentCard(newRecord.selfDeprecatingCard);

    setTimeout(() => {
      setShowSuccess(false);
      if (visibility === 'public') {
        publishToSquare(newRecord.id);
      }
      setLevel(null);
      setTrigger('');
      setTags([]);
      setContent('');
    }, 3000);
  };

  const copyCard = () => {
    navigator.clipboard.writeText(currentCard);
  };

  const VisibilityIcon = {
    private: Lock,
    friends: Users,
    public: Globe
  };

  const VisibilityLabel = {
    private: '仅自己',
    friends: '好友圈',
    public: '公开'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-pink-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            今日崩溃 💔
          </h1>
          <p className="text-gray-500 text-sm">
            {formatDate(new Date(), 'yyyy年MM月dd日')} · 星期{formatDate(new Date(), 'EEE').replace('周', '')}
          </p>
        </header>

        {todayRecord ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full mb-4">
                <span className="text-3xl">{LEVEL_CONFIG[todayRecord.level].emoji}</span>
                <span className="text-lg font-medium text-gray-700">
                  {LEVEL_CONFIG[todayRecord.level].label}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">今天的崩溃已经记录啦</p>
              <button
                onClick={() => navigate('/calendar')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                查看历史 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4">
              <p className="text-gray-700 text-center italic">
                "{todayRecord.selfDeprecatingCard}"
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                今天崩溃程度
              </h2>
              <div className="flex justify-between gap-2">
                {([1, 2, 3, 4, 5] as EmotionLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`flex-1 p-3 rounded-xl transition-all ${
                      level === lvl
                        ? 'scale-105 shadow-lg'
                        : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: level === lvl ? LEVEL_CONFIG[lvl].color : '#f5f5f5'
                    }}
                  >
                    <div className="text-2xl mb-1">{LEVEL_CONFIG[lvl].emoji}</div>
                    <div className="text-xs text-gray-600">{LEVEL_CONFIG[lvl].label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                触发事件
              </h2>
              <textarea
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="是什么让你崩溃了？"
                className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none text-gray-700"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {trigger.length}/500
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                情绪标签 <span className="text-sm font-normal text-gray-500">(最多选3个)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      tags.includes(tag)
                        ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                记录心情
              </h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下此刻的心情... (支持emoji)"
                className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none text-gray-700"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {content.length} 字
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                谁能看到
              </h2>
              <div className="flex gap-3">
                {(['private', 'friends', 'public'] as Visibility[]).map((v) => {
                  const Icon = VisibilityIcon[v];
                  return (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        visibility === v
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{VisibilityLabel[v]}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              onClick={handleSubmit}
              disabled={!level}
              className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all ${
                level
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:scale-102'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              记录今日崩溃
            </button>
          </>
        )}

        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">记录成功！</h3>
              <p className="text-gray-600 text-sm mb-4">你的自嘲卡片：</p>
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 italic">"{currentCard}"</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyCard}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={() => navigate('/square')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  互助广场
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-40">
        <div className="max-w-2xl mx-auto flex justify-around">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 p-2 text-orange-600"
          >
            <Heart className="w-6 h-6 fill-current" />
            <span className="text-xs font-medium">打卡</span>
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
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">广场</span>
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

export default HomePage;
