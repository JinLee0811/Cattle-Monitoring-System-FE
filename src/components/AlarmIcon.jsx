import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { detectingLogsMock } from "../utils/detectingLogsMock";

const AlarmIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alarms, setAlarms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Convert detectingLogsMock to alarm format and add resolved status
    const alarmData = detectingLogsMock.map((log) => ({
      id: log.id,
      timestamp: log.ts,
      type: log.title,
      severity: log.severity,
      camera: log.camera,
      location: log.location,
      resolved: false,
    }));
    setAlarms(alarmData);
  }, []);

  useEffect(() => {
    // Calculate unread alarm count
    const unread = alarms.filter((alarm) => !alarm.resolved).length;
    setUnreadCount(unread);
  }, [alarms]);

  const handleCheck = (alarmId) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => (alarm.id === alarmId ? { ...alarm, resolved: true } : alarm))
    );
  };

  const severityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const severityLabels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <div className='relative'>
      {/* Alarm icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors'>
        <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 128 128'>
          <path d='M95.89 88.25h-2.64V69.12a28.706 28.706 0 0 0-19.54-27.142V40a9.085 9.085 0 0 0-18.17 0v1.978A28.706 28.706 0 0 0 36 69.12v19.13h-2.64A8.751 8.751 0 0 0 24.61 97a8.76 8.76 0 0 0 8.75 8.75H52.3a12.445 12.445 0 0 0 24.65 0h18.94a8.75 8.75 0 0 0 0-17.5zm-31.271 24.718a8.974 8.974 0 0 1-8.785-7.218h17.582a8.979 8.979 0 0 1-8.797 7.218zM99.6 100.712a5.217 5.217 0 0 1-3.713 1.538H33.36a5.25 5.25 0 0 1-3.707-8.968 5.178 5.178 0 0 1 3.707-1.532h4.39A1.751 1.751 0 0 0 39.5 90V69.12a25.182 25.182 0 0 1 18.265-24.165 1.751 1.751 0 0 0 1.275-1.685V40a5.585 5.585 0 0 1 11.17 0v3.27a1.751 1.751 0 0 0 1.275 1.685A25.182 25.182 0 0 1 89.75 69.12V90a1.751 1.751 0 0 0 1.75 1.75h4.39a5.25 5.25 0 0 1 3.713 8.962zM86.2 31.636a1.75 1.75 0 0 0-1.122 3.316 25.408 25.408 0 0 1 17.272 24.086 1.75 1.75 0 0 0 3.5 0A28.907 28.907 0 0 0 86.2 31.636z' />
          <path d='M90.443 21.627a1.75 1.75 0 0 0-1.122 3.315 34.61 34.61 0 0 1 23.522 32.807 1.75 1.75 0 1 0 3.5 0 38.106 38.106 0 0 0-25.9-36.122zM26.9 59.038a25.408 25.408 0 0 1 17.269-24.086 1.75 1.75 0 1 0-1.122-3.316A28.907 28.907 0 0 0 23.4 59.038a1.75 1.75 0 0 0 3.5 0z' />
          <path d='M39.929 24.942a1.75 1.75 0 0 0-1.122-3.315 38.106 38.106 0 0 0-25.9 36.122 1.75 1.75 0 0 0 3.5 0 34.61 34.61 0 0 1 23.522-32.807z' />
        </svg>

        {/* Alarm count badge */}
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Alarm dropdown */}
      {showDropdown && (
        <div className='absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50'>
          <div className='p-4 border-b border-slate-700'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-bold text-white'>Alarms</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className='text-gray-400 hover:text-white'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <p className='text-sm text-gray-400 mt-1'>{unreadCount} unread alarms</p>
          </div>

          <div className='max-h-96 overflow-y-auto'>
            {alarms.length > 0 ? (
              <div className='p-4 space-y-3'>
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                      alarm.resolved
                        ? "opacity-60 border-slate-600 bg-slate-700/50"
                        : severityColors[alarm.severity]
                    }`}>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='mb-2'>
                          <span className='text-sm font-medium text-white'>{alarm.type}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <p className='text-xs text-gray-400 truncate'>
                            {alarm.camera} • {alarm.location}
                          </p>
                          <div className='text-right text-xs text-gray-400 flex-shrink-0'>
                            {new Date(alarm.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!alarm.resolved && (
                      <div className='mt-3 flex items-center justify-between'>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            severityColors[alarm.severity]
                          }`}>
                          {severityLabels[alarm.severity]}
                        </span>
                        <button
                          onClick={() => handleCheck(alarm.id)}
                          className='text-xs px-3 py-1 bg-farm-green text-white rounded hover:bg-green-600 transition-colors flex items-center space-x-1'>
                          <svg
                            className='w-3 h-3'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          <span>Check</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-8 text-center'>
                <svg
                  className='w-12 h-12 text-gray-500 mx-auto mb-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <p className='text-gray-400'>No alarms</p>
              </div>
            )}
          </div>

          <div className='p-4 border-t border-slate-700'>
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/logs");
              }}
              className='w-full text-center text-sm text-farm-green hover:text-green-400 transition-colors'>
              View All Alarms
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div className='fixed inset-0 z-40' onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default AlarmIcon;
