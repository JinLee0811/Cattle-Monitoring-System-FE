import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogs, useDeleteLog } from "../services/logService";

const LogPanel = ({ selectedCamera = 1, compact = false }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // React Query를 사용한 로그 상태 관리
  const { data: logsData } = useLogs();
  const deleteLogMutation = useDeleteLog();

  // 카메라별 로그 필터링
  const cameraLogs = (logsData?.logs || []).filter(
    (log) => log.camera.includes(`Camera ${selectedCamera}`) || filter === "all"
  );

  const severityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const typeIcons = {
    behavior: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z' />
      </svg>
    ),
    weather: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M6 19a4 4 0 010-8 5 5 0 119.9 1H17a3 3 0 110 6H6z' />
      </svg>
    ),
    sound: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M3 10v4h3l4 4V6L6 10H3z' />
        <path d='M16.5 12a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z' />
        <path d='M14 4.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
      </svg>
    ),
    camera: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M4 7h3l2-2h6l2 2h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z' />
        <circle cx='12' cy='13' r='4' />
      </svg>
    ),
  };

  // Filter logs by selected camera first, then by other criteria
  const cameraFilteredLogs = cameraLogs.filter((log) => {
    // Extract camera number from log.camera (e.g., "Camera 1" -> 1)
    const logCameraNumber = parseInt(log.camera.match(/\d+/)?.[0] || "0");
    return logCameraNumber === selectedCamera;
  });

  // Then apply other filters
  const filteredLogs = cameraFilteredLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.category === filter;
    const matchesSearch =
      searchTerm === "" ||
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate category counts for statistics
  const categoryCounts = {
    behavior: cameraLogs.filter((log) => log.category === "behavior").length,
    weather: cameraLogs.filter((log) => log.category === "weather").length,
    sound: cameraLogs.filter((log) => log.category === "sound").length,
    camera: cameraLogs.filter((log) => log.category === "camera").length,
  };

  const handleDeleteLog = (logId) => {
    deleteLogMutation.mutate(logId);
  };

  const containerClasses = `bg-slate-800 border border-slate-700 rounded-lg ${compact ? "p-3" : "p-4"} h-full flex flex-col overflow-hidden`;

  const iconSizeClass = compact ? "w-6 h-6" : "w-6 h-6";
  const titleClass = compact
    ? "text-sm font-medium text-white whitespace-normal break-words"
    : "text-sm font-medium text-white truncate";
  const messageClass = compact
    ? "text-[11px] text-gray-300 mb-0.5 line-clamp-1"
    : "text-xs text-gray-300 mb-1 line-clamp-2";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold text-white'>Camera {selectedCamera} Logs</h3>
        <button
          onClick={() => navigate("/logs")}
          className='text-sm text-farm-green hover:text-farm-green-light transition-colors'>
          View All
        </button>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-2 ${compact ? "mb-2" : "mb-4"}`}>
        <div className='bg-slate-700/50 rounded p-2 text-center'>
          <div className='text-lg font-bold text-yellow-400'>{categoryCounts.behavior}</div>
          <div className='text-xs text-gray-400'>Behavior</div>
        </div>
        <div className='bg-slate-700/50 rounded p-2 text-center'>
          <div className='text-lg font-bold text-blue-400'>{categoryCounts.weather}</div>
          <div className='text-xs text-gray-400'>Weather</div>
        </div>
        <div className='bg-slate-700/50 rounded p-2 text-center'>
          <div className='text-lg font-bold text-green-400'>{categoryCounts.sound}</div>
          <div className='text-xs text-gray-400'>Sound</div>
        </div>
        <div className='bg-slate-700/50 rounded p-2 text-center'>
          <div className='text-lg font-bold text-purple-400'>{categoryCounts.camera}</div>
          <div className='text-xs text-gray-400'>Camera</div>
        </div>
      </div>

      {/* Filters */}
      {!compact && (
        <div className='flex flex-col space-y-2 mb-4'>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className='bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:border-farm-green focus:outline-none text-sm'>
            <option value='all'>All Types</option>
            <option value='behavior'>Behavior</option>
            <option value='weather'>Weather</option>
            <option value='sound'>Sound</option>
            <option value='camera'>Camera</option>
          </select>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search logs...'
            className='bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:border-farm-green focus:outline-none text-sm'
          />
        </div>
      )}

      {/* Log List */}
      <div className='flex-1 space-y-2 overflow-y-auto'>
        {filteredLogs.length === 0 ? (
          <div className='text-center text-gray-400 py-8'>
            <div className='w-12 h-12 mx-auto mb-2 opacity-50'>
              {typeIcons[filter] || typeIcons.behavior}
            </div>
            <p className='text-sm'>No {filter === "all" ? "" : filter} logs found</p>
          </div>
        ) : (
          filteredLogs.slice(0, 20).map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border ${severityColors[log.severity]} overflow-hidden min-h-[88px] flex flex-col justify-between`}>
              {/* 상단: 아이콘 + 전체 제목 */}
              <div className='flex items-start space-x-3 min-w-0'>
                <div
                  className={`${iconSizeClass} rounded-lg flex items-center justify-center ${
                    log.category === "behavior"
                      ? "bg-yellow-400/20 text-yellow-400"
                      : log.category === "weather"
                        ? "bg-blue-400/20 text-blue-400"
                        : log.category === "sound"
                          ? "bg-green-400/20 text-green-400"
                          : "bg-purple-400/20 text-purple-400"
                  }`}>
                  {typeIcons[log.category] || typeIcons.behavior}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='leading-snug break-words whitespace-normal text-white text-sm'>
                    {log.title}
                  </div>
                </div>
              </div>

              {/* 하단: 시간(좌) + 삭제 버튼(우) */}
              <div className='flex items-center justify-between pt-2'>
                <span className='text-xs text-gray-400'>
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className='px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors'
                  title='Delete log'>
                  <svg
                    className='w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden='true'>
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
                    <path d='M10 11v6M14 11v6' />
                    <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogPanel;
