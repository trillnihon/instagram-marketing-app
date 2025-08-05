import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addHours, setHours, setMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';

interface PostingTimeData {
  dayOfWeek: number; // 0-6 (日曜日-土曜日)
  hour: number; // 0-23
  engagementRate: number; // 0-1
  postCount: number;
}

interface PostingTimeHeatmapProps {
  data: PostingTimeData[];
  onTimeSelect?: (dayOfWeek: number, hour: number) => void;
  className?: string;
}

const PostingTimeHeatmap: React.FC<PostingTimeHeatmapProps> = ({
  data,
  onTimeSelect,
  className = ''
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

  // 曜日ラベル
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
  
  // 時間ラベル（3時間間隔）
  const hourLabels = Array.from({ length: 8 }, (_, i) => i * 3);

  // セルの色を計算
  const getCellColor = (day: number, hour: number) => {
    const cellData = data.find(d => d.dayOfWeek === day && d.hour === hour);
    if (!cellData) return 'bg-gray-100';
    
    const intensity = Math.min(cellData.engagementRate * 100, 100);
    const baseColor = 'bg-blue';
    const shade = Math.floor(intensity / 20) * 100;
    
    return `${baseColor}-${shade}`;
  };

  // セルの透明度を計算
  const getCellOpacity = (day: number, hour: number) => {
    const cellData = data.find(d => d.dayOfWeek === day && d.hour === hour);
    if (!cellData) return 'opacity-30';
    
    const intensity = cellData.engagementRate;
    if (intensity > 0.8) return 'opacity-100';
    if (intensity > 0.6) return 'opacity-80';
    if (intensity > 0.4) return 'opacity-60';
    if (intensity > 0.2) return 'opacity-40';
    return 'opacity-20';
  };

  // セルのツールチップ内容
  const getTooltipContent = (day: number, hour: number) => {
    const cellData = data.find(d => d.dayOfWeek === day && d.hour === hour);
    if (!cellData) {
      return `${dayLabels[day]} ${hour.toString().padStart(2, '0')}:00 - データなし`;
    }
    
    return `${dayLabels[day]} ${hour.toString().padStart(2, '0')}:00
投稿数: ${cellData.postCount}件
エンゲージメント率: ${(cellData.engagementRate * 100).toFixed(1)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        投稿時間別エンゲージメント率ヒートマップ
      </h3>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* 時間ラベル行 */}
          <div className="flex">
            <div className="w-12 h-8"></div> {/* 左上の空白 */}
            {hourLabels.map(hour => (
              <div key={hour} className="w-16 h-8 flex items-center justify-center text-xs text-gray-600 font-medium">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          
          {/* ヒートマップ本体 */}
          {dayLabels.map((dayLabel, dayIndex) => (
            <div key={dayIndex} className="flex">
              {/* 曜日ラベル */}
              <div className="w-12 h-16 flex items-center justify-center text-sm font-medium text-gray-700 border-r border-gray-200">
                {dayLabel}
              </div>
              
              {/* 時間セル */}
              {hourLabels.map(hour => (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={`
                    w-16 h-16 border border-gray-200 cursor-pointer transition-all duration-200
                    ${getCellColor(dayIndex, hour)}
                    ${getCellOpacity(dayIndex, hour)}
                    hover:scale-105 hover:shadow-md
                    ${hoveredCell?.day === dayIndex && hoveredCell?.hour === hour ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onMouseEnter={() => setHoveredCell({ day: dayIndex, hour })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => onTimeSelect?.(dayIndex, hour)}
                  title={getTooltipContent(dayIndex, hour)}
                >
                  {/* セル内の情報表示 */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs">
                    {(() => {
                      const cellData = data.find(d => d.dayOfWeek === dayIndex && d.hour === hour);
                      if (!cellData) return null;
                      
                      return (
                        <>
                          <span className="font-bold text-white">
                            {cellData.postCount}
                          </span>
                          <span className="text-white opacity-90">
                            {(cellData.engagementRate * 100).toFixed(0)}%
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* 凡例 */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 opacity-30"></div>
          <span className="text-xs text-gray-600">データなし</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 opacity-20"></div>
          <span className="text-xs text-gray-600">低</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-300 opacity-60"></div>
          <span className="text-xs text-gray-600">中</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 opacity-100"></div>
          <span className="text-xs text-gray-600">高</span>
        </div>
      </div>
      
      {/* 推奨時間表示 */}
      {data.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">推奨投稿時間</h4>
          {(() => {
            const bestTime = data.reduce((best, current) => 
              current.engagementRate > best.engagementRate ? current : best
            );
            
            return (
              <p className="text-sm text-blue-700">
                {dayLabels[bestTime.dayOfWeek]} {bestTime.hour.toString().padStart(2, '0')}:00
                （エンゲージメント率: {(bestTime.engagementRate * 100).toFixed(1)}%）
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PostingTimeHeatmap; 