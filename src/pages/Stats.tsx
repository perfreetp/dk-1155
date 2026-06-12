import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Download, Calendar, Tag, X, Globe, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { LEVEL_CONFIG } from '../types';
import {
  calculateWeeklyStats,
  calculateTagStats,
  calculateMonthlyTrend,
  calculateTimeSlotStats,
  exportToJSON,
  formatDate
} from '../utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { records, squarePosts } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const weeklyStats = useMemo(() => calculateWeeklyStats(records), [records]);
  const tagStats = useMemo(() => calculateTagStats(records), [records]);
  const timeSlotStats = useMemo(() => calculateTimeSlotStats(records), [records]);
  const monthlyTrend = useMemo(
    () => calculateMonthlyTrend(records, selectedMonth),
    [records, selectedMonth]
  );
  
  const filteredRecords = useMemo(() => {
    if (!selectedTag) return [];
    return records.filter(r => r.tags.includes(selectedTag));
  }, [records, selectedTag]);
  
  const privacyStats = useMemo(() => {
    const privateCount = records.filter(r => r.visibility === 'private').length;
    const friendsCount = records.filter(r => r.visibility === 'friends').length;
    const publicCount = records.filter(r => r.visibility === 'public').length;
    return [
      { name: '仅自己', count: privateCount, color: '#9575CD' },
      { name: '好友圈', count: friendsCount, color: '#4FC3F7' },
      { name: '公开', count: publicCount, color: '#81C784' }
    ];
  }, [records]);
  
  const shareEffectStats = useMemo(() => {
    const calculateStats = (filteredRecords: typeof records) => {
      let totalHugs = 0;
      let totalComments = 0;
      const tagHugMap: Record<string, number> = {};
      const tagCommentMap: Record<string, number> = {};
      
      filteredRecords.forEach(record => {
        const post = squarePosts.find(p => p.recordId === record.id);
        if (post) {
          totalHugs += post.hugs;
          totalComments += post.comments.length;
          record.tags.forEach(tag => {
            tagHugMap[tag] = (tagHugMap[tag] || 0) + post.hugs;
            tagCommentMap[tag] = (tagCommentMap[tag] || 0) + post.comments.length;
          });
        }
      });
      
      const tagEngagement = Object.keys(tagHugMap).map(tag => ({
        tag,
        hugs: tagHugMap[tag],
        comments: tagCommentMap[tag] || 0,
        total: (tagHugMap[tag] || 0) + (tagCommentMap[tag] || 0)
      })).sort((a, b) => b.total - a.total);
      
      return { totalHugs, totalComments, tagEngagement };
    };
    
    const publicRecords = records.filter(r => r.visibility === 'public');
    const friendsRecords = records.filter(r => r.visibility === 'friends');
    
    return {
      public: calculateStats(publicRecords),
      friends: calculateStats(friendsRecords)
    };
  }, [records, squarePosts]);

  const COLORS = ['#FF8A80', '#81C784', '#9575CD', '#4FC3F7', '#FFD54F', '#FF8A65', '#4DB6AC', '#BA68C8', '#7986CB', '#4DD0E1'];
  
  const getHighestTimeSlot = () => {
    const max = timeSlotStats.reduce((max, slot) => slot.count > max.count ? slot : max, timeSlotStats[0]);
    return max && max.count > 0 ? max.slot : null;
  };

  const totalRecords = records.length;
  const avgLevel = totalRecords > 0
    ? (records.reduce((sum, r) => sum + r.level, 0) / totalRecords).toFixed(1)
    : '0';
  const maxLevelRecord = records.length > 0
    ? records.reduce((max, r) => (r.level > max.level ? r : max))
    : null;

  const handleExportJSON = () => {
    exportToJSON({
      records,
      exportDate: new Date().toISOString()
    });
  };

  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('今日崩溃 - 月度情绪报告', 50, 60);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(
      `${formatDate(selectedMonth, 'yyyy年MM月')} 情绪统计`,
      50,
      95
    );

    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(50, 120, 340, 200);
    ctx.fillRect(410, 120, 340, 200);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('本周情绪趋势', 70, 150);
    ctx.fillText('压力来源分析', 430, 150);

    if (weeklyStats.length > 0) {
      const maxCount = Math.max(...weeklyStats.map((s) => s.count));
      weeklyStats.forEach((stat, index) => {
        const barHeight = maxCount > 0 ? (stat.count / maxCount) * 120 : 0;
        const x = 80 + index * 40;
        const y = 300 - barHeight;

        ctx.fillStyle = stat.count > 0 ? '#FF8A80' : '#E5E7EB';
        ctx.fillRect(x, y, 30, barHeight);

        ctx.fillStyle = '#6B7280';
        ctx.font = '12px sans-serif';
        ctx.fillText(stat.day, x, 315);
      });
    }

    if (tagStats.length > 0) {
      tagStats.slice(0, 5).forEach((stat, index) => {
        const y = 180 + index * 30;
        ctx.fillStyle = COLORS[index % COLORS.length];
        ctx.fillRect(430, y, 15, 15);
        ctx.fillStyle = '#374151';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${stat.tag} (${stat.count})`, 455, y + 12);
      });
    }

    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(50, 340, 700, 200);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('本月情绪日历', 70, 370);

    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`总记录: ${totalRecords} 次`, 70, 410);
    ctx.fillText(`平均崩溃等级: ${avgLevel} ⭐`, 70, 440);
    if (maxLevelRecord) {
      ctx.fillText(
        `最高崩溃: ${LEVEL_CONFIG[maxLevelRecord.level].emoji} ${LEVEL_CONFIG[maxLevelRecord.level].label}`,
        70,
        470
      );
    }

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.fillText(`生成时间: ${formatDate(new Date(), 'yyyy-MM-dd HH:mm')}`, 50, 520);

    const link = document.createElement('a');
    link.download = `monthly_report_${formatDate(selectedMonth, 'yyyy-MM')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">情绪统计 📊</h1>
          <p className="text-gray-500 text-sm">了解你的情绪波动规律</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-500">{totalRecords}</div>
            <div className="text-xs text-gray-500 mt-1">总记录次数</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <div className="text-3xl font-bold text-pink-500">{avgLevel}</div>
            <div className="text-xs text-gray-500 mt-1">平均崩溃等级</div>
          </div>
        </div>

        {maxLevelRecord && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{LEVEL_CONFIG[maxLevelRecord.level].emoji}</span>
              <div>
                <div className="font-medium text-gray-800">
                  {LEVEL_CONFIG[maxLevelRecord.level].label}
                </div>
                <div className="text-xs text-gray-500">
                  最崩溃的一天：{formatDate(maxLevelRecord.date, 'MM月dd日')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            本周情绪趋势
          </h3>
          {weeklyStats.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyStats}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#FF8A80"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              本周还没有记录哦
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⏰</span>
            高发时段分析
          </h3>
          {getHighestTimeSlot() && (
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-700">
                💡 你最常在 <span className="font-bold text-orange-600">{getHighestTimeSlot()}</span> 崩溃
              </p>
            </div>
          )}
          {timeSlotStats.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeSlotStats}>
                <XAxis dataKey="slot" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}次崩溃`,
                    '崩溃次数'
                  ]}
                />
                <Bar
                  dataKey="count"
                  fill="#9575CD"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              还没有时段数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-500" />
            压力来源分析
          </h3>
          {tagStats.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tagStats.slice(0, 6)}
                    dataKey="count"
                    nameKey="tag"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {tagStats.slice(0, 6).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 lg:w-1/2">
                {tagStats.slice(0, 6).map((stat, index) => (
                  <button
                    key={stat.tag}
                    onClick={() => setSelectedTag(stat.tag)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 flex-1 text-left">{stat.tag}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {stat.count}次
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              还没有标签数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">月度情绪趋势</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSelectedMonth(
                    new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
                  )
                }
                className="px-2 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 px-2 py-1">
                {formatDate(selectedMonth, 'yyyy年MM月')}
              </span>
              <button
                onClick={() =>
                  setSelectedMonth(
                    new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
                  )
                }
                className="px-2 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                →
              </button>
            </div>
          </div>
          {monthlyTrend.some((t) => t.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgLevel"
                  stroke="#FF8A80"
                  strokeWidth={3}
                  dot={{ fill: '#FF8A80', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              当月还没有记录
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🔒</span>
            隐私分布
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {privacyStats.map((stat) => (
              <div
                key={stat.name}
                className="text-center p-3 rounded-xl"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600 mt-1">{stat.name}</div>
              </div>
            ))}
          </div>
          {records.length > 0 && (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={privacyStats.filter(s => s.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {privacyStats.filter(s => s.count > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📢</span>
            分享效果
          </h3>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">公开广场</span>
              </div>
              {shareEffectStats.public.totalHugs > 0 || shareEffectStats.public.totalComments > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-pink-600">{shareEffectStats.public.totalHugs}</div>
                      <div className="text-xs text-gray-500">收到抱抱</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">{shareEffectStats.public.totalComments}</div>
                      <div className="text-xs text-gray-500">收到安慰</div>
                    </div>
                  </div>
                  {shareEffectStats.public.tagEngagement.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">最容易得到安慰的标签：</p>
                      <div className="space-y-1">
                        {shareEffectStats.public.tagEngagement.slice(0, 2).map((item, index) => (
                          <div key={item.tag} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 text-center leading-4">
                              {index + 1}
                            </span>
                            <span className="flex-1 text-gray-600">{item.tag}</span>
                            <span className="text-gray-400">🤗{item.hugs} 💬{item.comments}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">还没有公开记录</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">好友圈</span>
              </div>
              {shareEffectStats.friends.totalHugs > 0 || shareEffectStats.friends.totalComments > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-pink-600">{shareEffectStats.friends.totalHugs}</div>
                      <div className="text-xs text-gray-500">收到抱抱</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">{shareEffectStats.friends.totalComments}</div>
                      <div className="text-xs text-gray-500">收到安慰</div>
                    </div>
                  </div>
                  {shareEffectStats.friends.tagEngagement.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">最容易得到安慰的标签：</p>
                      <div className="space-y-1">
                        {shareEffectStats.friends.tagEngagement.slice(0, 2).map((item, index) => (
                          <div key={item.tag} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-center leading-4">
                              {index + 1}
                            </span>
                            <span className="flex-1 text-gray-600">{item.tag}</span>
                            <span className="text-gray-400">🤗{item.hugs} 💬{item.comments}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">还没有好友圈记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            导出数据
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="py-3 px-4 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              导出 JSON
            </button>
            <button
              onClick={handleExportImage}
              className="py-3 px-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
            >
              导出 PNG 报告
            </button>
          </div>
        </div>
      </div>

      {selectedTag && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedTag(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedTag} 回顾</h3>
                <p className="text-xs text-gray-500">{filteredRecords.length} 条相关记录</p>
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{LEVEL_CONFIG[record.level].emoji}</span>
                      <div>
                        <div className="font-medium text-gray-800">{LEVEL_CONFIG[record.level].label}</div>
                        <div className="text-xs text-gray-500">{formatDate(record.date, 'MM月dd日')}</div>
                      </div>
                    </div>
                    {record.trigger && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">触发事件</div>
                        <p className="text-sm text-gray-700">{record.trigger}</p>
                      </div>
                    )}
                    {record.content && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">心情记录</div>
                        <p className="text-sm text-gray-700">{record.content}</p>
                      </div>
                    )}
                    <div className="mt-2 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600 italic">"{record.selfDeprecatingCard}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  还没有相关记录
                </div>
              )}
            </div>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs">广场</span>
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex flex-col items-center gap-1 p-2 text-green-600"
          >
            <svg className="w-6 h-6 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">统计</span>
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

export default StatsPage;
