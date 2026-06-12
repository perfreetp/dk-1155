import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { EmotionRecord, EmotionLevel } from '../types';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: zhCN });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getRecordsForDate = (records: EmotionRecord[], date: Date): EmotionRecord[] => {
  return records.filter((record) => isSameDay(parseISO(record.date), date));
};

export const calculateWeeklyStats = (records: EmotionRecord[]) => {
  const weekDays = getWeekDays(new Date());
  const stats = weekDays.map((day) => {
    const dayRecords = getRecordsForDate(records, day);
    const avgLevel = dayRecords.length > 0
      ? dayRecords.reduce((sum, r) => sum + r.level, 0) / dayRecords.length
      : 0;
    return {
      day: format(day, 'EEE', { locale: zhCN }),
      count: dayRecords.length,
      avgLevel
    };
  });
  return stats;
};

export const calculateTagStats = (records: EmotionRecord[]) => {
  const tagCount: Record<string, number> = {};
  records.forEach((record) => {
    record.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

export const calculateTimeSlotStats = (records: EmotionRecord[]) => {
  const timeSlots = {
    '深夜 0-6点': 0,
    '早上 6-12点': 0,
    '下午 12-18点': 0,
    '晚上 18-24点': 0
  };
  
  const avgLevels = {
    '深夜 0-6点': [] as number[],
    '早上 6-12点': [] as number[],
    '下午 12-18点': [] as number[],
    '晚上 18-24点': [] as number[]
  };
  
  records.forEach((record) => {
    const hour = new Date(record.createdAt).getHours();
    let slot = '';
    
    if (hour >= 0 && hour < 6) {
      slot = '深夜 0-6点';
    } else if (hour >= 6 && hour < 12) {
      slot = '早上 6-12点';
    } else if (hour >= 12 && hour < 18) {
      slot = '下午 12-18点';
    } else {
      slot = '晚上 18-24点';
    }
    
    timeSlots[slot as keyof typeof timeSlots]++;
    avgLevels[slot as keyof typeof avgLevels].push(record.level);
  });
  
  return Object.entries(timeSlots).map(([slot, count]) => ({
    slot,
    count,
    avgLevel: avgLevels[slot as keyof typeof avgLevels].length > 0
      ? avgLevels[slot as keyof typeof avgLevels].reduce((a, b) => a + b, 0) / avgLevels[slot as keyof typeof avgLevels].length
      : 0
  }));
};

export const calculateMonthlyTrend = (records: EmotionRecord[], month: Date) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const trend = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dayRecords = getRecordsForDate(records, date);
    const avgLevel = dayRecords.length > 0
      ? dayRecords.reduce((sum, r) => sum + r.level, 0) / dayRecords.length
      : 0;
    trend.push({
      date: format(date, 'd'),
      avgLevel: Math.round(avgLevel * 10) / 10,
      count: dayRecords.length
    });
  }

  return trend;
};

export const exportToJSON = (data: any): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `today_breakdown_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateMockSquarePosts = (): any[] => {
  return [
    {
      id: '1',
      recordId: 'mock-1',
      authorId: 'user-1',
      level: 3 as EmotionLevel,
      tags: ['工作压力', '人际关系'],
      hugs: 12,
      hasHugged: false,
      comments: [
        {
          id: 'c1',
          postId: '1',
          authorId: 'user-2',
          content: '抱抱你，工作上的事真的很让人崩溃，但你能坚持说出来已经很棒了 💪',
          likes: 5,
          isLiked: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'c2',
          postId: '1',
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
      id: '2',
      recordId: 'mock-2',
      authorId: 'user-4',
      level: 4 as EmotionLevel,
      tags: ['感情问题', '未来焦虑'],
      hugs: 23,
      hasHugged: false,
      comments: [
        {
          id: 'c3',
          postId: '2',
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
      id: '3',
      recordId: 'mock-3',
      authorId: 'user-6',
      level: 2 as EmotionLevel,
      tags: ['学业负担'],
      hugs: 8,
      hasHugged: false,
      comments: [
        {
          id: 'c4',
          postId: '3',
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
};
