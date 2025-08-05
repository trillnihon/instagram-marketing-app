import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showAdminLink?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, showAdminLink = false }) => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const getTabClass = (tab: string) => {
    const baseClass = "px-3 py-2 rounded text-sm font-medium mr-2 transition-colors";
    return activeTab === tab 
      ? `${baseClass} bg-indigo-600 text-white` 
      : `${baseClass} bg-gray-100 hover:bg-gray-200 text-gray-700`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ padding: '1rem', background: '#ede9fe', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <button className={getTabClass('analytics')}>
          <Link to="/analytics">分析</Link>
        </button>
        <button className={getTabClass('dashboard')}>
          <Link to="/analytics-dashboard">アナリティクス</Link>
        </button>
        <button className={getTabClass('create')}>
          <Link to="/create">投稿作成</Link>
        </button>
        <button className={getTabClass('history')}>
          <Link to="/history">履歴</Link>
        </button>
        <button className={getTabClass('scheduler')}>
          <Link to="/scheduler">スケジューラー</Link>
        </button>
        <button className={getTabClass('hashtags')}>
          <Link to="/hashtags">ハッシュタグ分析</Link>
        </button>
        <button className={getTabClass('posting-time')}>
          <Link to="/posting-time-analysis">投稿時間分析</Link>
        </button>
        <button className={getTabClass('instagram')}>
          <Link to="/auth/instagram">Instagram連携</Link>
        </button>
        <button className={getTabClass('diagnostics')}>
          <Link to="/diagnostics">診断ツール</Link>
        </button>
        <button className={getTabClass('analyze-url')}>
          <Link to="/analyze-url">URL分析</Link>
        </button>
        <button className={getTabClass('threads-analysis')}>
          <Link to="/threads-analysis">Threads分析</Link>
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        {showAdminLink && (
          <Link 
            to="/admin" 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <Cog6ToothIcon className="h-4 w-4 mr-1" />
            <span>管理者</span>
          </Link>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors px-3 py-2 rounded text-sm font-medium"
          style={{ textDecoration: 'none' }}
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
          <span>ログアウト</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation; 