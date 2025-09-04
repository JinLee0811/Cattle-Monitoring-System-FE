import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { detectingLogsMock } from "../utils/detectingLogsMock";

const LogPanel = ({ selectedCamera = 1 }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const severityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const typeIcons = {
    behavior: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
        />
      </svg>
    ),
    weather: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.004 5.004 0 10-9.78 2.096A4.001 4.001 0 003 15z'
        />
      </svg>
    ),
    sound: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
        />
      </svg>
    ),
    camera: (
      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        />
      </svg>
    ),
  };

  // Filter logs by selected camera first, then by other criteria
  const cameraFilteredLogs = detectingLogsMock.filter((log) => {
    // Extract camera number from log.camera (e.g., "Camera 1" -> 1)
    const logCameraNumber = parseInt(log.camera.match(/\d+/)?.[0] || "0");
    return logCameraNumber === selectedCamera;
  });

  const filteredLogs = cameraFilteredLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.category === filter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate category counts for statistics
  const categoryCounts = {
    behavior: detectingLogsMock.filter((log) => log.category === "behavior").length,
    weather: detectingLogsMock.filter((log) => log.category === "weather").length,
    sound: detectingLogsMock.filter((log) => log.category === "sound").length,
    camera: detectingLogsMock.filter((log) => log.category === "camera").length,
  };

  return (
    <div className='bg-slate-800 rounded-lg p-6 h-full'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-bold text-white'>Detecting Logs</h2>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-400'>Real-time</span>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
          </div>
          <button
            onClick={() => navigate("/logs")}
            className='px-4 py-2 bg-farm-green text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
            <span>View All</span>
          </button>
        </div>
      </div>

      {/* Log statistics - moved to top */}
      <div className='mb-6'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-400'>{categoryCounts.behavior}</div>
            <div className='text-xs text-gray-400'>Behavior</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-400'>{categoryCounts.weather}</div>
            <div className='text-xs text-gray-400'>Weather</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-400'>{categoryCounts.sound}</div>
            <div className='text-xs text-gray-400'>Sound</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-400'>{categoryCounts.camera}</div>
            <div className='text-xs text-gray-400'>Camera</div>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='flex-1'>
          <input
            type='text'
            placeholder='Search logs...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-farm-green'
          />
        </div>
        <div className='flex space-x-2'>
          {["all", "behavior", "weather", "sound", "camera"].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === category
                  ? "bg-farm-green text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}>
              {category === "all"
                ? "All"
                : category === "behavior"
                  ? "Behavior"
                  : category === "weather"
                    ? "Weather"
                    : category === "sound"
                      ? "Sound"
                      : "Camera"}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 rounded-lg border ${severityColors[log.severity]} transition-colors hover:bg-opacity-20`}>
            <div className='flex items-start justify-between'>
              <div className='flex items-start space-x-3 flex-1'>
                <div className='mt-1'>{typeIcons[log.category]}</div>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <span className='text-sm font-medium'>{log.camera}</span>
                    <span className='text-xs opacity-75'>•</span>
                    <span className='text-xs opacity-75'>{log.location}</span>
                  </div>
                  <p className='text-sm leading-relaxed'>{log.message}</p>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs opacity-75 mb-1'>
                  {new Date(log.ts).toLocaleTimeString()}
                </div>
                <div className='text-xs opacity-75'>{new Date(log.ts).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
