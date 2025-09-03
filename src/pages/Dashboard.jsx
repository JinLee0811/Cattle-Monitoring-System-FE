import { useState, useEffect } from "react";
import VideoPlayer from "../components/VideoPlayer";
import LogPanel from "../components/LogPanel";
import { mockCameras } from "../utils/mockData";

const USE_WEATHER_MOCK = true; // 백엔드 없이 임시 데이터 사용

const mockWeatherData = {
  current: {
    temperature: 24,
    humidity: 62,
    pressure: 1014,
    description: "clear sky",
    icon: "01d",
    windSpeed: 3.6,
    rain: 0,
  },
  location: {
    name: "Sydney",
    country: "AU",
    lat: -33.8688,
    lon: 151.2093,
  },
  alerts: [
    {
      type: "cattle_heat_stress",
      severity: "low",
      message: "Warm conditions - Ensure shade and water are available",
    },
  ],
  timestamp: new Date().toISOString(),
  is_mock: true,
};

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCamera, setSelectedCamera] = useState(1);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch current weather using geolocation (fallback to Sydney)
  useEffect(() => {
    if (USE_WEATHER_MOCK) {
      setWeather(mockWeatherData);
      setLoadingWeather(false);
      setWeatherError(null);
      return;
    }

    const defaultCoords = { lat: -33.8688, lon: 151.2093 };

    const fetchWeather = async (lat, lon) => {
      try {
        setLoadingWeather(true);
        setWeatherError(null);
        const res = await fetch(
          `http://localhost:5000/api/weather/current?lat=${lat}&lon=${lon}`
        );
        if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
        const data = await res.json();
        setWeather(data);
      } catch {
        // 실패 시 모의 데이터로 대체
        setWeather(mockWeatherData);
        setWeatherError(null);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeather(latitude, longitude);
        },
        () => fetchWeather(defaultCoords.lat, defaultCoords.lon),
        { maximumAge: 10 * 60 * 1000, timeout: 5000 }
      );
    } else {
      fetchWeather(defaultCoords.lat, defaultCoords.lon);
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-AU", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Smart Farm Monitoring Dashboard
            </h1>
            <p className="text-gray-400 text-sm">{formatDate(currentTime)}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* System status display */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Normal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 ml-64 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main video player */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Real-time Monitoring
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Select Camera:
                    </span>
                    <select
                      value={selectedCamera}
                      onChange={(e) =>
                        setSelectedCamera(Number(e.target.value))
                      }
                      className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-farm-green"
                    >
                      {mockCameras.map((camera) => (
                        <option key={camera.id} value={camera.id}>
                          {camera.name} - {camera.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Camera view with Monitor page format */}
                <div className="relative bg-slate-800 rounded-lg overflow-hidden">
                  {/* Camera header */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {mockCameras.find((c) => c.id === selectedCamera)
                            ?.name || "Camera 1"}
                        </h3>
                        <p className="text-gray-300 text-xs">
                          {mockCameras.find((c) => c.id === selectedCamera)
                            ?.location || "Barn A"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const camera = mockCameras.find(
                            (c) => c.id === selectedCamera
                          );
                          const isOnline = camera?.status === "online";
                          return isOnline ? (
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                              NORMAL
                            </div>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <span className="text-white text-xs">
                                OFFLINE
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Video player */}
                  <div className="aspect-video bg-black">
                    {(() => {
                      const camera = mockCameras.find(
                        (c) => c.id === selectedCamera
                      );
                      const isOnline = camera?.status === "online";
                      return isOnline ? (
                        <VideoPlayer
                          videoUrl="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                          cameraName={camera?.name || "Camera 1"}
                          location={camera?.location || "Barn A"}
                          isLive={true}
                          showControls={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 text-gray-600 mx-auto mb-4"
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
                            <p className="text-gray-400 text-sm">
                              Camera Offline
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Last update: {camera?.lastUpdate || "Unknown"}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Camera info footer */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-xs">
                        <div className="flex items-center space-x-4">
                          {(() => {
                            const camera = mockCameras.find(
                              (c) => c.id === selectedCamera
                            );
                            return (
                              <>
                                <span>{camera?.resolution || "1080p"}</span>
                                <span>{camera?.fps || "30"} FPS</span>
                                <span
                                  className={`flex items-center space-x-1 ${
                                    camera?.recording
                                      ? "text-red-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      camera?.recording
                                        ? "bg-red-400 animate-pulse"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span>
                                    {camera?.recording
                                      ? "Recording"
                                      : "Stopped"}
                                  </span>
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* LIVE indicator and time */}
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const camera = mockCameras.find(
                            (c) => c.id === selectedCamera
                          );
                          const isOnline = camera?.status === "online";
                          return (
                            isOnline && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                <span className="text-white text-xs font-medium">
                                  LIVE
                                </span>
                              </div>
                            )
                          );
                        })()}
                        <span className="text-white text-xs">
                          {currentTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System status cards */}
            <div className="space-y-6">
              {/* Weather (simple) */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Weather</h3>
                {loadingWeather ? (
                  <div className="text-sm text-gray-400">
                    Loading weather...
                  </div>
                ) : weatherError ? (
                  <div className="text-sm text-red-400">
                    Failed to load weather
                  </div>
                ) : weather ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-end space-x-3">
                        <div className="text-2xl font-bold text-white">
                          {Math.round(weather.current?.temperature)}°C
                        </div>
                        <div className="text-sm text-gray-400 capitalize">
                          {weather.current?.description}
                        </div>
                      </div>
                      {weather.current?.icon && (
                        <img
                          alt="icon"
                          className="w-10 h-10"
                          src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {weather.location?.name}, {weather.location?.country}
                    </div>
                    {Array.isArray(weather.alerts) &&
                    weather.alerts.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {weather.alerts.slice(0, 4).map((a, idx) => (
                          <div
                            key={idx}
                            className={`text-xs rounded-md border px-3 py-2 ${
                              a.severity === "high"
                                ? "border-red-400/30 bg-red-400/10 text-red-300"
                                : a.severity === "medium"
                                  ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                                  : "border-blue-400/30 bg-blue-400/10 text-blue-300"
                            }`}
                          >
                            {a.message}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No alerts</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No weather data</div>
                )}
              </div>

              {/* Camera status */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Camera Online Status
                </h3>
                <div className="h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {mockCameras.map((camera) => (
                      <div
                        key={camera.id}
                        className={`p-3 rounded-lg border ${
                          camera.status === "online"
                            ? "border-green-500/20 bg-green-500/10"
                            : "border-red-500/20 bg-red-500/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {camera.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {camera.location}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                camera.status === "online"
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            ></div>
                            <span className="text-xs text-gray-400">
                              {camera.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Log panel */}
          <div className="mt-6">
            {/* Real-time Detection Status */}
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  LIVE DETECTION STATUS
                </h3>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const camera = mockCameras.find(
                      (c) => c.id === selectedCamera
                    );
                    const isOnline = camera?.status === "online";
                    return (
                      <>
                        <span className="text-sm text-gray-400">
                          {isOnline ? "REAL-TIME" : "STOPPED"}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse ${
                            isOnline ? "bg-red-400" : "bg-gray-400"
                          }`}
                        ></div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Camera Info */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Camera</div>
                  <div className="text-white font-medium">
                    {mockCameras.find((c) => c.id === selectedCamera)?.name ||
                      "Camera 1"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {mockCameras.find((c) => c.id === selectedCamera)
                      ?.location || "Barn A"}
                  </div>
                </div>

                {/* Detection Status */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Current Status</div>
                  {(() => {
                    const camera = mockCameras.find(
                      (c) => c.id === selectedCamera
                    );
                    const isOnline = camera?.status === "online";
                    return (
                      <>
                        <div
                          className={`text-2xl font-bold ${
                            isOnline ? "text-green-400" : "text-gray-400"
                          }`}
                        >
                          {isOnline ? "NORMAL" : "OFFLINE"}
                        </div>
                        {isOnline && (
                          <div className="text-xs text-gray-500">
                            Confidence: 95.2%
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Timestamp */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Detection Time</div>
                  <div className="text-white font-medium">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Behavior Analysis - Only show for online cameras */}
              {(() => {
                const camera = mockCameras.find((c) => c.id === selectedCamera);
                const isOnline = camera?.status === "online";
                return isOnline ? (
                  <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">
                      Behavior Analysis
                    </div>
                    <div className="text-white">
                      Normal cattle behavior detected. No signs of distress or
                      unusual movement patterns observed.
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Action Buttons for Abnormal Conditions */}
              {/* <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleAcknowledge}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div> */}
            </div>

            {/* Camera-specific System Logs */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {mockCameras.find((c) => c.id === selectedCamera)?.name ||
                  "Camera 1"}{" "}
                | Camera Logs
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Historical abnormal behavior records for the selected camera
              </p>
              <LogPanel selectedCamera={selectedCamera} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
