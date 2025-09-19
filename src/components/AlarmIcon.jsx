import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogs, logUtils } from "../services/logService";

const AlarmIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [checkedAlarmIds, setCheckedAlarmIds] = useState(new Set()); // 체크된 알람 ID만 추적
  const navigate = useNavigate();

  // React Query를 사용한 로그 상태 관리
  const { data: logsData } = useLogs();

  // 로그를 알람 형태로 변환하고 체크된 알람 필터링
  const alarms = logUtils.convertToAlarms(
    (logsData?.logs || []).filter((log) => !checkedAlarmIds.has(log.id))
  );

  // 알람 수 업데이트
  const unreadCount = alarms.length;

  // 알람 체크 핸들러
  const handleCheck = (alarmId) => {
    setCheckedAlarmIds((prev) => new Set([...prev, alarmId]));
    console.log("Alarm checked and removed:", alarmId);
  };

  // 로그 삭제 시 체크된 알람에서도 제거
  useEffect(() => {
    const handleLogDeleted = (event) => {
      const { logId } = event.detail;
      setCheckedAlarmIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(logId);
        return newSet;
      });
    };

    const handleAllLogsDeleted = () => {
      setCheckedAlarmIds(new Set());
    };

    window.addEventListener("dummyLogDeleted", handleLogDeleted);
    window.addEventListener("allLogsDeleted", handleAllLogsDeleted);

    return () => {
      window.removeEventListener("dummyLogDeleted", handleLogDeleted);
      window.removeEventListener("allLogsDeleted", handleAllLogsDeleted);
    };
  }, []);

  return (
    <div className='relative'>
      {/* Alarm Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 text-gray-400 hover:text-white transition-colors'>
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z'
          />
        </svg>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className='absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
          <div className='p-4 border-b border-slate-700'>
            <h3 className='text-lg font-semibold text-white'>Recent Alerts</h3>
            <p className='text-sm text-gray-400'>{unreadCount} unread alerts</p>
          </div>

          <div className='max-h-64 overflow-y-auto'>
            {alarms.length === 0 ? (
              <div className='p-4 text-center text-gray-400'>
                <svg
                  className='w-12 h-12 mx-auto mb-2 opacity-50'
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
                <p>No alerts</p>
              </div>
            ) : (
              alarms.slice(0, 10).map((alarm) => (
                <div
                  key={alarm.id}
                  className='p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-1'>
                        <span className='text-sm font-medium text-white'>{alarm.type}</span>
                        {alarm.isRealtime && (
                          <span className='px-2 py-0.5 bg-green-500 text-white text-xs rounded-full'>
                            LIVE
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            alarm.severity === "high"
                              ? "bg-red-500/20 text-red-400"
                              : alarm.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}>
                          {alarm.severity}
                        </span>
                      </div>
                      <p className='text-xs text-gray-400 mb-1'>
                        {alarm.camera} • {alarm.location}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(alarm.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCheck(alarm.id)}
                      className='ml-2 px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500 transition-colors'>
                      Check
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {alarms.length > 10 && (
            <div className='p-3 border-t border-slate-700'>
              <button
                onClick={() => navigate("/logs")}
                className='w-full text-center text-sm text-farm-green hover:text-farm-green-light transition-colors'>
                View all alerts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div className='fixed inset-0 z-40' onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default AlarmIcon;
