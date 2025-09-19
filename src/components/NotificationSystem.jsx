import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { logAPI } from "../services/logService";

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Socket.IO 연결
    const newSocket = io(
      import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:5050"
    );
    setSocket(newSocket);

    // 이상 행동 알림 수신
    newSocket.on("abnormal_behavior_alert", (alertData) => {
      showNotification(alertData);
    });

    // 로그 업데이트 수신
    newSocket.on("log_update", (logData) => {
      console.log("📝 Received log_update from backend:", logData);
      // logService에 실시간 로그 추가
      logAPI.addRealtimeLog(logData);
    });

    // 분석 결과 수신
    newSocket.on("analysis_result", (analysisData) => {
      // 분석 결과를 비디오 플레이어에 전달
      window.dispatchEvent(new CustomEvent("analysisResult", { detail: analysisData }));
    });

    // 분석 에러 수신
    newSocket.on("analysis_error", (errorData) => {
      console.error("Analysis error:", errorData);
      showNotification({
        type: "error",
        title: "Analysis Error",
        message: errorData.error,
        timestamp: new Date(),
        videoTime: errorData.videoTime,
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const showNotification = (alertData) => {
    const notification = {
      id: Date.now() + Math.random(),
      type: alertData.severity || "medium",
      title: alertData.title || "Alert",
      message: alertData.message || "Unknown alert",
      timestamp: new Date(alertData.createdAt || alertData.timestamp || Date.now()),
      videoTime: alertData.videoTime,
      videoId: alertData.videoId || "unknown",
      cattleCount: alertData.cattleData?.length || 0,
      confidence: alertData.confidence || null,
      location: alertData.location || null,
      autoHide: true,
      duration: 7000, // 7초로 연장
    };

    console.log("🔔 Showing notification:", notification);

    setNotifications((prev) => [notification, ...prev.slice(0, 4)]); // 최대 5개까지만 표시

    // 자동 숨김
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }

    // 알림음 재생 (브라우저 허용 시)
    try {
      const audio = new Audio("/notification.mp3"); // 알림음 파일 필요
      audio.volume = 0.3;
      audio.play().catch(() => {
        // 알림음 재생 실패 시 무시
      });
    } catch (error) {
      // 알림음 재생 실패 시 무시
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "high":
        return "🚨";
      case "medium":
        return "⚠️";
      case "low":
        return "ℹ️";
      case "error":
        return "❌";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "high":
        return "bg-red-500 border-red-400";
      case "medium":
        return "bg-yellow-500 border-yellow-400";
      case "low":
        return "bg-blue-500 border-blue-400";
      case "error":
        return "bg-red-600 border-red-500";
      default:
        return "bg-gray-500 border-gray-400";
    }
  };

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm'>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationColor(notification.type)} text-white p-4 rounded-lg border-l-4 shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in`}>
          <div className='flex items-start justify-between'>
            <div className='flex items-start space-x-3'>
              <span className='text-xl'>{getNotificationIcon(notification.type)}</span>
              <div className='flex-1'>
                <h4 className='font-semibold text-sm'>{notification.title}</h4>
                <p className='text-sm opacity-90 mt-1'>{notification.message}</p>
                <div className='text-xs opacity-75 mt-2 space-y-1'>
                  <div className='flex items-center space-x-2'>
                    <span>{notification.timestamp.toLocaleTimeString()}</span>
                    {notification.videoTime && (
                      <span>Video: {Math.floor(notification.videoTime)}s</span>
                    )}
                  </div>
                  {notification.cattleCount > 0 && (
                    <div className='flex items-center space-x-2'>
                      <span>🐄 {notification.cattleCount} cattle detected</span>
                      {notification.confidence && (
                        <span>Confidence: {(notification.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  )}
                  {notification.location && (
                    <div className='flex items-center space-x-2'>
                      <span>📍 {notification.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className='text-white opacity-75 hover:opacity-100 ml-2 text-lg leading-none'>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
