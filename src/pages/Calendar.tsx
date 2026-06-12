import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  X,
  Trash2,
  Play,
  Pause,
  Users,
  Globe
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { LEVEL_CONFIG, Visibility } from '../types';
import { formatDate } from '../utils';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { records, deleteRecord, updateRecord } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay() || 7;
  const emptyDays = Array(firstDayOfWeek - 1).fill(null);

  const getRecordForDate = (date: Date) => {
    return records.find((r) => isSameDay(parseISO(r.date), date));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
      setSelectedRecord(null);
    }
  };

  const handleVisibilityChange = (id: string, visibility: Visibility) => {
    updateRecord(id, { visibility });
    setSelectedRecord((prev: any) => prev ? { ...prev, visibility } : null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">崩溃日历 📅</h1>
          <p className="text-gray-500 text-sm">回顾每一天的情绪波动</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {format(currentMonth, 'yyyy年MM月')}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
              <div
                key={day}
                className="text-center text-xs text-gray-500 py-2 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const record = getRecordForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => record && setSelectedRecord(record)}
                  disabled={!record}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                    !isCurrentMonth
                      ? 'opacity-30'
                      : record
                      ? 'cursor-pointer hover:scale-105'
                      : 'opacity-50'
                  } ${isToday ? 'ring-2 ring-orange-400' : ''}`}
                  style={{
                    backgroundColor: record
                      ? LEVEL_CONFIG[record.level].color
                      : '#f5f5f5'
                  }}
                >
                  <span
                    className={`text-sm font-medium ${
                      record ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {record && (
                    <span className="text-lg">{LEVEL_CONFIG[record.level].emoji}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">情绪等级说明</h3>
          <div className="space-y-2">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <div
                key={level}
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ backgroundColor: `${LEVEL_CONFIG[level].color}40` }}
              >
                <span className="text-xl">{LEVEL_CONFIG[level].emoji}</span>
                <span className="text-sm text-gray-700">{LEVEL_CONFIG[level].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">记录详情</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${LEVEL_CONFIG[selectedRecord.level].color}40` }}>
                <span className="text-3xl">{LEVEL_CONFIG[selectedRecord.level].emoji}</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {LEVEL_CONFIG[selectedRecord.level].label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(selectedRecord.date, 'MM月dd日')}
                  </div>
                </div>
                {selectedRecord.visibility === 'private' && (
                  <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                )}
              </div>

              {selectedRecord.trigger && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">触发事件</div>
                  <p className="text-gray-700">{selectedRecord.trigger}</p>
                </div>
              )}

              {selectedRecord.tags.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">情绪标签</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.content && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">心情记录</div>
                  <p className="text-gray-700">{selectedRecord.content}</p>
                </div>
              )}

              {selectedRecord.voiceUrl && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">语音记录</div>
                  <VoicePlayer voiceUrl={selectedRecord.voiceUrl} />
                </div>
              )}

              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">自嘲卡片</div>
                <p className="text-gray-700 italic">"{selectedRecord.selfDeprecatingCard}"</p>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">隐私设置</div>
                <div className="flex gap-2">
                  {([
                    { value: 'private' as Visibility, label: '仅自己', icon: Lock },
                    { value: 'friends' as Visibility, label: '好友圈', icon: Users },
                    { value: 'public' as Visibility, label: '公开', icon: Globe }
                  ]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVisibilityChange(selectedRecord.id, option.value)}
                      className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all ${
                        selectedRecord.visibility === option.value
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <option.icon className="w-3 h-3" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(selectedRecord.id)}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除记录
            </button>
          </div>
        </div>
      )}

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
            className="flex flex-col items-center gap-1 p-2 text-purple-600"
          >
            <svg className="w-6 h-6 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">日历</span>
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

const VoicePlayer: React.FC<{ voiceUrl: string }> = ({ voiceUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayback}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center hover:shadow-lg transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <div className="flex-1">
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={voiceUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};

export default CalendarPage;
