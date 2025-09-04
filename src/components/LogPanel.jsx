import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockLogs } from "../utils/mockData";

const LogPanel = ({ selectedCamera = 1 }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const severityColors = {
    error: "text-red-400 bg-red-400/10 border-red-400/20",
    warning: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    success: "text-green-400 bg-green-400/10 border-green-400/20",
    info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const typeIcons = {
    detection: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    system: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
    alert: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
  };

  // Filter logs by selected camera first, then by other criteria
  const cameraFilteredLogs = mockLogs.filter((log) => {
    // Extract camera number from log.camera (e.g., "Camera 1" -> 1)
    const logCameraNumber = parseInt(log.camera.match(/\d+/)?.[0] || "0");
    return logCameraNumber === selectedCamera;
  });

  const filteredLogs = cameraFilteredLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.severity === filter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">System Logs</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Real-time</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <button
            onClick={() => navigate("/logs")}
            className="px-4 py-2 bg-farm-green text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span>View All</span>
          </button>
        </div>
      </div>

      {/* Log statistics - moved to top */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {mockLogs.filter((log) => log.severity === "error").length}
            </div>
            <div className="text-xs text-gray-400">Error</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {mockLogs.filter((log) => log.severity === "warning").length}
            </div>
            <div className="text-xs text-gray-400">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {mockLogs.filter((log) => log.severity === "success").length}
            </div>
            <div className="text-xs text-gray-400">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {mockLogs.filter((log) => log.severity === "info").length}
            </div>
            <div className="text-xs text-gray-400">Info</div>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-farm-green"
          />
        </div>
        <div className="flex space-x-2">
          {["all", "error", "warning", "success", "info"].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === severity
                  ? "bg-farm-green text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {severity === "all"
                ? "All"
                : severity === "error"
                  ? "Error"
                  : severity === "warning"
                    ? "Warning"
                    : severity === "success"
                      ? "Success"
                      : "Info"}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 rounded-lg border ${severityColors[log.severity]} transition-colors hover:bg-opacity-20`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">{typeIcons[log.type]}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">{log.camera}</span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-xs opacity-75">{log.location}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{log.message}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-75 mb-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs opacity-75">
                  {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
