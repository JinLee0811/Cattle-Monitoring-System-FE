import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogs, useDeleteLog } from "../services/logService";

const LogPanel = ({ selectedCamera = 1 }) => {
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
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
        <path
          fillRule='evenodd'
          d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
          clipRule='evenodd'
        />
      </svg>
    ),
    weather: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
          clipRule='evenodd'
        />
      </svg>
    ),
    sound: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.814a1 1 0 011-.11zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z'
          clipRule='evenodd'
        />
      </svg>
    ),
    camera: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
          clipRule='evenodd'
        />
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

  return (
    <div className='bg-slate-800 border border-slate-700 rounded-lg p-4 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white'>Camera {selectedCamera} Logs</h3>
        <button
          onClick={() => navigate("/logs")}
          className='text-sm text-farm-green hover:text-farm-green-light transition-colors'>
          View All
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-2 mb-4'>
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
              className={`p-3 rounded-lg border ${severityColors[log.severity]} transition-all hover:scale-[1.02]`}>
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-2 flex-1'>
                  <div className='mt-1'>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
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
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='text-sm font-medium text-white truncate'>{log.title}</span>
                      {log.isRealtime && (
                        <span className='px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full whitespace-nowrap'>
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-gray-300 mb-1 line-clamp-2'>{log.message}</p>
                    <div className='flex items-center space-x-3 text-xs text-gray-400'>
                      <span>{log.camera}</span>
                      <span>•</span>
                      <span>{log.location}</span>
                      <span>•</span>
                      <span>{new Date(log.ts).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                {log.isRealtime && (
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className='px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors'
                    title='Delete log'>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogPanel;
