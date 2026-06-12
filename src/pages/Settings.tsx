import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  User,
  Bell,
  Lock,
  Download,
  Trash2,
  Moon,
  Globe,
  Users,
  Info,
  ChevronRight,
  Camera
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Visibility } from '../types';
import { exportToJSON } from '../utils';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, records, updateUserSettings, deleteRecord } = useAppStore();

  const [nickname, setNickname] = useState(user?.nickname || '崩溃患者');
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>(
    user?.defaultVisibility || 'private'
  );
  const [nightReminderEnabled, setNightReminderEnabled] = useState(
    user?.nightReminder?.enabled || false
  );
  const [nightReminderTime, setNightReminderTime] = useState(
    user?.nightReminder?.time || '22:00'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
      setDefaultVisibility(user.defaultVisibility);
      setNightReminderEnabled(user.nightReminder.enabled);
      setNightReminderTime(user.nightReminder.time);
    }
  }, [user]);

  const handleSaveNickname = () => {
    updateUserSettings({ nickname });
  };

  const handleSaveVisibility = () => {
    updateUserSettings({ defaultVisibility });
  };

  const handleSaveReminder = () => {
    updateUserSettings({
      nightReminder: {
        enabled: nightReminderEnabled,
        time: nightReminderTime
      }
    });
    if (nightReminderEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleExportData = () => {
    exportToJSON({
      user,
      records,
      exportDate: new Date().toISOString()
    });
  };

  const handleDeleteAllData = () => {
    if (confirm('确定要删除所有数据吗？此操作不可恢复！')) {
      records.forEach((record) => deleteRecord(record.id));
      setShowDeleteConfirm(false);
    }
  };

  const totalRecords = records.length;
  const privateRecords = records.filter((r) => r.visibility === 'private').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">设置 ⚙️</h1>
          <p className="text-gray-500 text-sm">个性化你的崩溃记录体验</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  nickname.charAt(0).toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={handleSaveNickname}
                className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-orange-400 outline-none transition-colors"
              />
              <div className="text-sm text-gray-500 mt-1">点击编辑昵称</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">记录天数</div>
                  <div className="text-xs text-gray-500">坚持记录的日子</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-500">{totalRecords}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-sm font-medium text-gray-800">隐私记录</div>
                  <div className="text-xs text-gray-500">仅自己可见</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-500">{privateRecords}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <h3 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            夜间提醒
          </h3>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">开启提醒</div>
                <div className="text-xs text-gray-500">每天固定时间提醒打卡</div>
              </div>
              <button
                onClick={() => {
                  setNightReminderEnabled(!nightReminderEnabled);
                  setTimeout(handleSaveReminder, 0);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  nightReminderEnabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    nightReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {nightReminderEnabled && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">提醒时间</div>
                <input
                  type="time"
                  value={nightReminderTime}
                  onChange={(e) => {
                    setNightReminderTime(e.target.value);
                  }}
                  onBlur={handleSaveReminder}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <h3 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            隐私设置
          </h3>

          <div className="p-6">
            <div className="text-sm text-gray-600 mb-3">默认可见性</div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'private', label: '仅自己', icon: Lock, color: 'purple' },
                { value: 'friends', label: '好友圈', icon: Users, color: 'blue' },
                { value: 'public', label: '公开', icon: Globe, color: 'green' }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDefaultVisibility(option.value);
                    setTimeout(handleSaveVisibility, 0);
                  }}
                  className={`p-4 rounded-xl transition-all ${
                    defaultVisibility === option.value
                      ? `bg-${option.color}-50 border-2 border-${option.color}-400`
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <option.icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      defaultVisibility === option.value
                        ? `text-${option.color}-500`
                        : 'text-gray-400'
                    }`}
                  />
                  <div
                    className={`text-sm font-medium ${
                      defaultVisibility === option.value
                        ? `text-${option.color}-700`
                        : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <h3 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            数据管理
          </h3>

          <div className="p-6 space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">导出全部数据</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">删除所有数据</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">💔</div>
            <h3 className="text-lg font-bold text-gray-800">今日崩溃</h3>
            <p className="text-sm text-gray-500 mt-1">版本 1.0.0</p>
          </div>
          <p className="text-center text-xs text-gray-400">
            帮助你表达、整理和互相接住的情绪陪伴工具
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            不做严肃咨询，只做温暖的陪伴 🌸
          </p>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-sm text-gray-600">
                确定要删除所有数据吗？此操作不可恢复，所有记录都将永久消失。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAllData}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
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
            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">统计</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 p-2 text-purple-600"
          >
            <svg className="w-6 h-6 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">设置</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SettingsPage;
