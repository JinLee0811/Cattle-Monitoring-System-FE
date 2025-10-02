import { useMemo, useState } from "react";
import { useLogs, useDeleteLog, useClearAllLogs } from "../services/logService";

const Logs = () => {
  const [category, setCategory] = useState("all"); // all | behavior | weather | sound | camera
  const [severityDir, setSeverityDir] = useState("desc"); // 'desc' | 'asc'
  const [searchTerm, setSearchTerm] = useState("");

  // React Query hooks 사용
  const { data: logsData, isLoading, error } = useLogs({ category });
  const deleteLogMutation = useDeleteLog();
  const clearAllLogsMutation = useClearAllLogs();

  const detectingLogs = useMemo(() => logsData?.logs || [], [logsData?.logs]);

  // 로그 삭제 함수
  const handleDeleteLog = (logId) => {
    deleteLogMutation.mutate(logId);
  };

  // 전체 삭제 함수
  const handleClearAllLogs = () => {
    if (window.confirm("Do you want to delete all logs? This action cannot be undone.")) {
      clearAllLogsMutation.mutate();
    }
  };

  const severityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    warning: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    error: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  const categoryLabel = {
    behavior: "Behavior",
    weather: "Weather",
    sound: "Sound",
    camera: "Camera",
  };

  const filteredLogsRaw = detectingLogs.filter((log) => {
    const matchesCategory = category === "all" || log.category === category;
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      log.title.toLowerCase().includes(s) ||
      log.message.toLowerCase().includes(s) ||
      log.camera.toLowerCase().includes(s) ||
      log.location.toLowerCase().includes(s);
    return matchesCategory && matchesSearch;
  });

  // Sort by severity order 위험 > 주의 > 보통, then time desc
  const severityOrder = { high: 3, medium: 2, low: 1, warning: 2, error: 3, info: 1 };
  const filteredLogs = [...filteredLogsRaw].sort((a, b) => {
    const dir = severityDir === "desc" ? 1 : -1;
    const sDiff = dir * ((severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
    if (sDiff !== 0) return sDiff;
    return new Date(b.ts || b.createdAt) - new Date(a.ts || a.createdAt);
  });

  const categoryCounts = useMemo(() => {
    return {
      behavior: detectingLogs.filter((l) => l.category === "behavior").length,
      weather: detectingLogs.filter((l) => l.category === "weather").length,
      sound: detectingLogs.filter((l) => l.category === "sound").length,
      camera: detectingLogs.filter((l) => l.category === "camera").length,
    };
  }, [detectingLogs]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-farm-green border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400'>Error loading logs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Header */}
      <header className='bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Detecting Logs</h1>
            <p className='text-gray-400 text-sm'>
              Recent behavior, weather, sound and camera events
            </p>
          </div>
          <button
            onClick={handleClearAllLogs}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
            <span>Clear All Logs</span>
          </button>
        </div>
      </header>

      <div className='flex'>
        {/* Main content */}
        <main className='flex-1 ml-64 p-6'>
          <div className='bg-slate-800 rounded-lg p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-white'>Detecting Logs</h2>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-400'>Real-time</span>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
              </div>
            </div>

            {/* Category KPIs (numbers only) */}
            <div className='mb-6 grid grid-cols-4 gap-x-16 divide-x divide-slate-700/60'>
              <div className='text-center px-8'>
                <div className='text-2xl font-bold text-rose-400'>{categoryCounts.behavior}</div>
                <div className='text-xs text-gray-400'>Abnormal Behavior</div>
              </div>
              <div className='text-center px-8'>
                <div className='text-2xl font-bold text-yellow-400'>{categoryCounts.weather}</div>
                <div className='text-xs text-gray-400'>Weather Alerts</div>
              </div>
              <div className='text-center px-8'>
                <div className='text-2xl font-bold text-cyan-300'>{categoryCounts.sound}</div>
                <div className='text-xs text-gray-400'>Abnormal Sound</div>
              </div>
              <div className='text-center px-8'>
                <div className='text-2xl font-bold text-indigo-300'>{categoryCounts.camera}</div>
                <div className='text-xs text-gray-400'>Camera Issues</div>
              </div>
            </div>

            {/* Category / Search / Sort */}
            <div className='flex flex-col sm:flex-row gap-4 mb-6'>
              <div className='flex-1'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search logs'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-8 py-2 bg-slate-700/60 border border-slate-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-farm-green'
                  />
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>🔎</span>
                </div>
              </div>
              <div className='flex space-x-2'>
                {["all", "behavior", "weather", "sound", "camera"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? "bg-slate-600 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"}`}>
                    {cat === "all" ? "All" : categoryLabel[cat]}
                  </button>
                ))}
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-xs text-gray-400'>Sort:</span>
                <button
                  onClick={() => setSeverityDir((d) => (d === "desc" ? "asc" : "desc"))}
                  className='text-xs px-2 py-1 rounded-md border border-slate-600 text-white hover:bg-slate-700'>
                  {`Severity ${severityDir === "desc" ? "↓" : "↑"}`}
                </button>
              </div>
            </div>

            {/* Log list */}
            <div className='space-y-4'>
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-5 rounded-lg border ${severityColors[log.severity]} transition-all hover:scale-[1.01]`}>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start space-x-4 flex-1'>
                      <div className='p-2 bg-slate-700/50 rounded-lg mt-1'>
                        <span className='text-xs capitalize'>
                          {log.category === "behavior"
                            ? "🐄"
                            : log.category === "weather"
                              ? "🌧️"
                              : log.category === "sound"
                                ? "🔊"
                                : "📷"}{" "}
                          {categoryLabel[log.category]}
                        </span>
                      </div>
                      <div className='flex-1 space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <div className='flex items-center space-x-2'>
                            <span className='text-sm font-semibold'>{log.camera}</span>
                            <span className='text-xs opacity-75'>•</span>
                            <span className='text-xs opacity-75'>{log.location}</span>
                          </div>
                          <div className='text-xs text-gray-400'>
                            ID: {log.id} • {new Date(log.ts || log.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className='text-sm font-semibold'>{log.title}</div>
                          <div className='bg-slate-700/30 rounded-lg p-3 mt-1'>
                            <p className='text-sm leading-relaxed'>{log.message}</p>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-6 text-xs'>
                          <div>
                            <span className='text-gray-400'>Severity:</span>
                            <span className='ml-2 font-medium capitalize'>{log.severity}</span>
                          </div>
                          <div>
                            <span className='text-gray-400'>Category:</span>
                            <span className='ml-2 font-medium capitalize'>
                              {categoryLabel[log.category]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className='px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center space-x-2'
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
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Logs;
