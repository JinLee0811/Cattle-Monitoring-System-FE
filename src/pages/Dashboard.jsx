import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLogs } from "../services/logService";
import VideoPlayer from "../components/VideoPlayer";
import LogPanel from "../components/LogPanel";
import NotificationSystem from "../components/NotificationSystem";
import { mockCameras } from "../utils/mockData";

const USE_WEATHER_MOCK = false;

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
  const [showRiskView, setShowRiskView] = useState(false);
  const [riskIndex, setRiskIndex] = useState(0);
  const [lastWeatherFetch, setLastWeatherFetch] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // React Query를 사용한 로그 상태 관리
  const { data: logsData } = useLogs();

  // Detecting Logs KPI counts
  const kpiCounts = useMemo(() => {
    const allLogs = logsData?.logs || [];
    return {
      behavior: allLogs.filter((l) => l.category === "behavior").length,
      weather: allLogs.filter((l) => l.category === "weather").length,
      sound: allLogs.filter((l) => l.category === "sound").length,
      camera: allLogs.filter((l) => l.category === "camera").length,
    };
  }, [logsData]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle camera parameter from URL
  useEffect(() => {
    const cameraParam = searchParams.get("camera");
    if (cameraParam) {
      const cameraId = parseInt(cameraParam);
      if (cameraId && cameraId >= 1 && cameraId <= mockCameras.length) {
        setSelectedCamera(cameraId);
      }
    }
  }, [searchParams]);

  // Fetch current weather using geolocation (fallback to Sydney)
  useEffect(() => {
    if (USE_WEATHER_MOCK) {
      setWeather(mockWeatherData);
      setLoadingWeather(false);
      setWeatherError(null);
      return;
    }

    // 캐시된 데이터가 있고 10분 이내라면 재사용
    const now = Date.now();
    const WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10분

    if (lastWeatherFetch && now - lastWeatherFetch < WEATHER_CACHE_DURATION) {
      console.log("Using cached weather data");
      setLoadingWeather(false);
      return;
    }

    const defaultCoords = { lat: -33.8688, lon: 151.19950864428853 };

    const fetchWeather = async (lat, lon) => {
      try {
        console.log("Weather API call:", { lat: lat.toString(), lon: lon.toString() });
        setLoadingWeather(true);
        setWeatherError(null);

        const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
        const data = await res.json();

        setWeather(data);
        setLastWeatherFetch(now); // 캐시 시간 업데이트
        console.log("Weather data fetched successfully");
      } catch (err) {
        console.error("Weather fetch error:", err);
        setWeather(null);
        setWeatherError(err?.message || "Failed to fetch weather");
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
        () => {
          console.log("Geolocation failed, using default coordinates");
          fetchWeather(defaultCoords.lat, defaultCoords.lon);
        },
        {
          maximumAge: 10 * 60 * 1000, // 10분간 캐시
          timeout: 5000,
          enableHighAccuracy: false, // 정확도 낮춰서 빠른 응답
        }
      );
    } else {
      console.log("Geolocation not supported, using default coordinates");
      fetchWeather(defaultCoords.lat, defaultCoords.lon);
    }
  }, [lastWeatherFetch]); // lastWeatherFetch 의존성 추가

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
    <div className='min-h-screen bg-slate-900'>
      {/* Header */}
      <header className='bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Smart Farm Monitoring Dashboard</h1>
            <div className='flex items-center space-x-2 text-gray-400 text-sm'>
              <span>{formatDate(currentTime)}</span>
              <span className='text-slate-500'>|</span>
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            {/* System status display */}
            <div className='flex items-center space-x-2 text-sm text-gray-300'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
              <span>System Normal</span>
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Main content */}
        <main className='flex-1 ml-64 p-3'>
          {/* Top Detecting Logs bar */}
          <div className='mb-3 rounded-md border border-slate-700 bg-slate-800 px-4 py-2'>
            <div className='flex items-center justify-between'>
              <div className='text-white font-bold text-lg'>Detecting Logs</div>
              <button
                onClick={() => navigate("/logs")}
                className='text-xs px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'>
                View detail
              </button>
            </div>
            <div className='mt-3 flex items-stretch text-center divide-x divide-slate-700/60'>
              <div className='flex-1 py-2'>
                <div className='text-2xl font-extrabold text-rose-400'>{kpiCounts.behavior}</div>
                <div className='mt-1 text-slate-300 text-xs'>Abnormal Behavior</div>
              </div>
              <div className='flex-1 py-2'>
                <div className='text-2xl font-extrabold text-yellow-300'>{kpiCounts.weather}</div>
                <div className='mt-1 text-slate-300 text-xs'>Weather Alerts</div>
              </div>
              <div className='flex-1 py-2'>
                <div className='text-2xl font-extrabold text-cyan-300'>{kpiCounts.sound}</div>
                <div className='mt-1 text-slate-300 text-xs'>Abnormal Sound</div>
              </div>
              <div className='flex-1 py-2'>
                <div className='text-2xl font-extrabold text-indigo-300'>{kpiCounts.camera}</div>
                <div className='mt-1 text-slate-300 text-xs'>Camera Issues</div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main video player */}
            <div className='lg:col-span-2'>
              <div className='bg-slate-800 rounded-lg p-6'>
                <div className='flex items-center justify-between mb-2'>
                  <h2 className='text-xl font-bold text-white'>Real-time Monitoring</h2>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-400'>Select Camera:</span>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(Number(e.target.value))}
                      className='bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-farm-green'>
                      {mockCameras.map((camera) => (
                        <option key={camera.id} value={camera.id}>
                          {camera.name} - {camera.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Camera view with Monitor page format */}
                <div className='relative bg-slate-800 rounded-lg overflow-hidden'>
                  {/* Camera header */}
                  <div className='absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='text-white font-semibold text-sm'>
                          {mockCameras.find((c) => c.id === selectedCamera)?.name || "Camera 1"}
                        </h3>
                        <p className='text-gray-300 text-xs'>
                          {mockCameras.find((c) => c.id === selectedCamera)?.location || "Barn A"}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {(() => {
                          const camera = mockCameras.find((c) => c.id === selectedCamera);
                          const isOnline = camera?.status === "online";
                          return isOnline ? (
                            <div className='px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white'>
                              NORMAL
                            </div>
                          ) : (
                            <>
                              <div className='w-2 h-2 rounded-full bg-red-400'></div>
                              <span className='text-white text-xs'>OFFLINE</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Video player with overlaid footer */}
                  <div className='relative'>
                    <div className='aspect-video bg-black'>
                      {(() => {
                        const camera = mockCameras.find((c) => c.id === selectedCamera);
                        const isOnline = camera?.status === "online";
                        return isOnline ? (
                          <VideoPlayer
                            videoUrl={`/video/${camera?.videoFile}`}
                            cameraName={camera?.name}
                            location={camera?.location}
                            isLive={true}
                            showControls={false}
                            videoId={`camera_${selectedCamera}`}
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <div className='text-center'>
                              <svg
                                className='w-16 h-16 text-gray-600 mx-auto mb-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                                />
                              </svg>
                              <p className='text-gray-400 text-sm'>Camera Offline</p>
                              <p className='text-gray-500 text-xs mt-1'>
                                Last update: {camera?.lastUpdate || "Unknown"}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Camera info footer (stays over black area) */}
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='text-white text-xs'>
                          <div className='flex items-center space-x-4'>
                            {(() => {
                              const camera = mockCameras.find((c) => c.id === selectedCamera);
                              return (
                                <>
                                  <span>{camera?.resolution || "1080p"}</span>
                                  <span>{camera?.fps || "30"} FPS</span>
                                  <span
                                    className={`flex items-center space-x-1 ${
                                      camera?.recording ? "text-red-400" : "text-gray-400"
                                    }`}>
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        camera?.recording
                                          ? "bg-red-400 animate-pulse"
                                          : "bg-gray-400"
                                      }`}></div>
                                    <span>{camera?.recording ? "Recording" : "Stopped"}</span>
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* LIVE indicator and time */}
                        <div className='flex items-center space-x-3'>
                          {(() => {
                            const camera = mockCameras.find((c) => c.id === selectedCamera);
                            const isOnline = camera?.status === "online";
                            return (
                              isOnline && (
                                <div className='flex items-center space-x-1'>
                                  <div className='w-2 h-2 rounded-full bg-red-400 animate-pulse'></div>
                                  <span className='text-white text-xs font-medium'>LIVE</span>
                                </div>
                              )
                            );
                          })()}
                          <span className='text-white text-xs'>
                            {currentTime.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Live Detection Status inside video card */}
                  {(() => {
                    const camera = mockCameras.find((c) => c.id === selectedCamera);
                    const isOnline = camera?.status === "online";
                    return (
                      <div className='mt-3 rounded-md bg-slate-700/60 border border-slate-600 p-3'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='text-xs text-gray-300 font-semibold'>
                            LIVE DETECTION STATUS
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-xs text-gray-300'>
                              {isOnline ? "REAL-TIME" : "STOPPED"}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${isOnline ? "bg-red-400 animate-pulse" : "bg-gray-400"}`}></div>
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-3'>
                          <div>
                            <div className='text-[10px] text-gray-400'>Camera</div>
                            <div className='text-xs text-white font-medium truncate'>
                              {camera?.name || "Camera 1"}
                            </div>
                            <div className='text-[10px] text-gray-500 truncate'>
                              {camera?.location || "Barn A"}
                            </div>
                          </div>
                          <div>
                            <div className='text-[10px] text-gray-400'>Current Status</div>
                            <div
                              className={`text-sm font-bold ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                              {isOnline ? "NORMAL" : "OFFLINE"}
                            </div>
                            {isOnline && (
                              <div className='text-[10px] text-gray-500'>Confidence: 95.2%</div>
                            )}
                          </div>
                          <div>
                            <div className='text-[10px] text-gray-400'>Detection Time</div>
                            <div className='text-xs text-white font-medium'>
                              {formatTime(currentTime)}
                            </div>
                            <div className='text-[10px] text-gray-500'>
                              {currentTime.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {isOnline && (
                          <div className='mt-4 p-2 bg-slate-600/60 rounded text-xs text-white min-h-[64px]'>
                            Normal cattle behavior detected. No signs of distress or unusual
                            movement patterns observed.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* System status cards */}
            <div className='space-y-6'>
              {/* Detecting Logs summary moved to the top bar above. This box removed by request */}
              {/* Weather (simple) */}
              <div className='bg-slate-800 rounded-lg p-6 relative overflow-hidden h-74 flex flex-col'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-white'>Weather</h3>
                  <div className='flex items-center gap-2'>
                    {/* 새로고침 버튼 */}
                    <button
                      type='button'
                      onClick={() => {
                        setLastWeatherFetch(null); // 캐시 무효화
                        setLoadingWeather(true);
                        // 강제로 날씨 데이터 다시 가져오기
                        const defaultCoords = { lat: -33.8688, lon: 151.19950864428853 };
                        const fetchWeather = async (lat, lon) => {
                          try {
                            console.log("Manual weather refresh:", {
                              lat: lat.toString(),
                              lon: lon.toString(),
                            });
                            setLoadingWeather(true);
                            setWeatherError(null);

                            const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
                            if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
                            const data = await res.json();

                            setWeather(data);
                            setLastWeatherFetch(Date.now());
                            console.log("Weather data refreshed successfully");
                          } catch (err) {
                            console.error("Weather refresh error:", err);
                            setWeather(null);
                            setWeatherError(err?.message || "Failed to fetch weather");
                          } finally {
                            setLoadingWeather(false);
                          }
                        };
                        fetchWeather(defaultCoords.lat, defaultCoords.lon);
                      }}
                      disabled={loadingWeather}
                      className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-600/40 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      title='Refresh weather data'>
                      <svg
                        className={`w-3 h-3 ${loadingWeather ? "animate-spin" : ""}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                        />
                      </svg>
                    </button>
                    <button
                      type='button'
                      onClick={() => setShowRiskView((v) => !v)}
                      className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-md border focus:outline-none transition-colors ${
                        showRiskView
                          ? "border-slate-400/40 text-slate-300 hover:bg-slate-400/10"
                          : "border-red-400/50 text-red-300 hover:bg-red-400/10 shadow-[0_0_0_1px_rgba(248,113,113,0.15)]"
                      }`}>
                      <svg viewBox='0 0 24 24' fill='none' className='w-4 h-4'>
                        <path
                          d='M12 8v4l3 3'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      {showRiskView ? "Back to current" : "Upcoming risks"}
                    </button>
                  </div>
                </div>
                {loadingWeather ? (
                  <div className='space-y-3 flex-1 flex flex-col justify-center items-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
                    <div className='text-sm text-gray-400'>Loading weather data...</div>
                    {/* 임시 데이터로 박스 크기 유지 */}
                    <div className='w-full space-y-3 opacity-30'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-end space-x-3'>
                          <div className='text-2xl font-bold text-white'>--°C</div>
                          <div className='text-sm text-gray-400'>Loading...</div>
                        </div>
                        <div className='w-10 h-10 bg-gray-600 rounded'></div>
                      </div>
                      <div className='text-xs text-gray-500'>Loading location...</div>
                      <div className='mt-2 grid grid-cols-3 gap-2 text-center'>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Humidity</div>
                          <div className='text-[12px] text-white'>--%</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Wind</div>
                          <div className='text-[12px] text-white'>-- m/s</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Pressure</div>
                          <div className='text-[12px] text-white'>-- hPa</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : weatherError ? (
                  <div className='space-y-3 flex-1 flex flex-col justify-center items-center'>
                    <div className='text-sm text-red-400 text-center'>
                      Failed to load weather: {weatherError}
                    </div>
                    <div className='text-xs text-gray-500 text-center'>Using fallback data</div>
                    {/* 에러 시에도 박스 크기 유지 */}
                    <div className='w-full space-y-3 opacity-50'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-end space-x-3'>
                          <div className='text-2xl font-bold text-white'>24°C</div>
                          <div className='text-sm text-gray-400'>clear sky</div>
                        </div>
                        <div className='w-10 h-10 bg-gray-600 rounded'></div>
                      </div>
                      <div className='text-xs text-gray-500'>Sydney, AU</div>
                      <div className='mt-2 grid grid-cols-3 gap-2 text-center'>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Humidity</div>
                          <div className='text-[12px] text-white'>62%</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Wind</div>
                          <div className='text-[12px] text-white'>3.6 m/s</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Pressure</div>
                          <div className='text-[12px] text-white'>1014 hPa</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : weather ? (
                  <div className='space-y-3 flex-1'>
                    {!showRiskView && (
                      <div className='flex items-center justify-between'>
                        <div className='flex items-end space-x-3'>
                          <div className='text-2xl font-bold text-white'>
                            {Math.round(weather.current?.temperature)}°C
                          </div>
                          <div className='text-sm text-gray-400 capitalize'>
                            {weather.current?.description}
                          </div>
                          {weather.is_mock && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-300'>
                              MOCK
                            </span>
                          )}
                        </div>
                        {!showRiskView && weather.current?.icon && (
                          <img
                            alt='icon'
                            className='w-10 h-10'
                            src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                          />
                        )}
                      </div>
                    )}
                    {!showRiskView ? (
                      <>
                        <div className='text-xs text-gray-500'>
                          {weather.location?.name}, {weather.location?.country}
                        </div>
                        {/* alerts hidden to fit content height */}

                        {/* mini stats */}
                        <div className='mt-2 grid grid-cols-3 gap-2 text-center'>
                          <div className='rounded-md border border-slate-700/60 p-2'>
                            <div className='text-[10px] text-slate-400'>Humidity</div>
                            <div className='text-[12px] text-white'>
                              {weather.current?.humidity ?? "-"}%
                            </div>
                          </div>
                          <div className='rounded-md border border-slate-700/60 p-2'>
                            <div className='text-[10px] text-slate-400'>Wind</div>
                            <div className='text-[12px] text-white'>
                              {weather.current?.windSpeed ?? "-"} m/s
                            </div>
                          </div>
                          <div className='rounded-md border border-slate-700/60 p-2'>
                            <div className='text-[10px] text-slate-400'>Pressure</div>
                            <div className='text-[12px] text-white'>
                              {weather.current?.pressure ?? "-"} hPa
                            </div>
                          </div>
                        </div>

                        {/* compact hourly forecast (mocked from current) */}
                        <div className='mt-2 rounded-md border border-slate-700/60 bg-slate-700/20 p-2'>
                          <div className='grid grid-cols-5 gap-2 text-center'>
                            {[
                              {
                                t: "Now",
                                temp: Math.round(weather.current?.temperature),
                                icon: weather.current?.icon || "01d",
                              },
                              {
                                t: "1h",
                                temp: Math.round((weather.current?.temperature ?? 0) + 1),
                                icon: "02d",
                              },
                              {
                                t: "2h",
                                temp: Math.round((weather.current?.temperature ?? 0) + 2),
                                icon: "03d",
                              },
                              {
                                t: "3h",
                                temp: Math.round((weather.current?.temperature ?? 0) - 1),
                                icon: "11d",
                              },
                              {
                                t: "4h",
                                temp: Math.round(weather.current?.temperature ?? 0),
                                icon: "01n",
                              },
                            ].map((h, i) => (
                              <div key={i} className='space-y-1'>
                                <div className='text-[10px] text-slate-300'>{h.t}</div>
                                <img
                                  alt='h'
                                  className='w-5 h-5 mx-auto'
                                  src={`https://openweathermap.org/img/wn/${h.icon}.png`}
                                />
                                <div className='text-[10px] text-slate-200'>{h.temp}°</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className='space-y-2'>
                        {(() => {
                          const risks = [
                            {
                              dayOffset: 3,
                              severity: "high",
                              title: "Heavy rain (60–90mm) with strong wind (18 m/s)",
                              recommendation:
                                "Move cattle to sheltered areas and prepare indoor pens",
                            },
                            {
                              dayOffset: 2,
                              severity: "medium",
                              title: "Strong wind up to 15 m/s",
                              recommendation: "Ensure windbreaks and secure loose equipment",
                            },
                            {
                              dayOffset: 1,
                              severity: "medium",
                              title: "Moderate rain expected (20–30mm)",
                              recommendation: "Check drainage routes and prepare bedding",
                            },
                          ];
                          const r = risks[riskIndex % risks.length];
                          const badgeIcon =
                            r.severity === "high" ? "⚡" : r.icon === "wind" ? "💨" : "🌧";
                          const badgeLabel =
                            r.severity === "high" ? "Thunder" : r.icon === "wind" ? "Wind" : "Rain";
                          return (
                            <>
                              <div
                                className={`rounded-md border p-3 relative h-40 overflow-hidden flex flex-col ${r.severity === "high" ? "border-red-400/30 bg-red-400/10" : "border-yellow-400/30 bg-yellow-400/10"}`}>
                                {/* top-left D-day badge */}
                                <div className='absolute left-3 top-3'>
                                  <span className='text-[11px] px-2 py-0.5 rounded-md bg-slate-900/40 border border-slate-600/40 text-slate-200'>
                                    D+{r.dayOffset}
                                  </span>
                                </div>
                                {/* top-right badge */}
                                <span className='absolute right-3 top-3 inline-flex items-center justify-center'>
                                  {r.severity === "high" && (
                                    <span className='absolute -inset-1 rounded-full bg-red-400/30 animate-ping'></span>
                                  )}
                                  <span
                                    className={`relative h-8 min-w-[92px] px-3 rounded-full flex items-center justify-center gap-1 ${r.severity === "high" ? "bg-red-500 text-white" : "bg-yellow-400 text-slate-900"}`}>
                                    <span className='text-[13px] leading-none'>{badgeIcon}</span>
                                    <span className='text-[11px] font-semibold leading-none tracking-wide'>
                                      {badgeLabel}
                                    </span>
                                  </span>
                                </span>
                                {/* content below */}
                                <div className='pt-10 overflow-y-auto'>
                                  <div className='text-white text-sm font-medium'>{r.title}</div>
                                  <div className='text-xs text-slate-200 mt-2'>
                                    {r.recommendation}
                                  </div>
                                </div>
                              </div>
                              <div className='flex justify-end'>
                                <button
                                  onClick={() => setRiskIndex((riskIndex + 1) % risks.length)}
                                  className='text-xs px-3 py-1 rounded-md border border-slate-500 text-slate-200 hover:bg-slate-600/20'>
                                  Next
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='space-y-3 flex-1 flex flex-col justify-center items-center'>
                    <div className='text-sm text-gray-400 text-center'>
                      No weather data available
                    </div>
                    <div className='text-xs text-gray-500 text-center'>
                      Please check your connection
                    </div>
                    {/* 데이터 없을 때도 박스 크기 유지 */}
                    <div className='w-full space-y-3 opacity-30'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-end space-x-3'>
                          <div className='text-2xl font-bold text-white'>--°C</div>
                          <div className='text-sm text-gray-400'>No data</div>
                        </div>
                        <div className='w-10 h-10 bg-gray-600 rounded'></div>
                      </div>
                      <div className='text-xs text-gray-500'>Unknown location</div>
                      <div className='mt-2 grid grid-cols-3 gap-2 text-center'>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Humidity</div>
                          <div className='text-[12px] text-white'>--%</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Wind</div>
                          <div className='text-[12px] text-white'>-- m/s</div>
                        </div>
                        <div className='rounded-md border border-slate-700/60 p-2'>
                          <div className='text-[10px] text-slate-400'>Pressure</div>
                          <div className='text-[12px] text-white'>-- hPa</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Removed rain overlay effect by request */}

                {showRiskView && weather?.current?.description?.toLowerCase().includes("clear") && (
                  <div className='pointer-events-none absolute -right-3 -top-3'>
                    <div className='w-16 h-16 rounded-full bg-yellow-300/60 blur-sm animate-pulse'></div>
                  </div>
                )}
              </div>

              {/* Camera status */}
              <div className='bg-slate-800 rounded-lg p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Camera Online Status</h3>
                <div className='h-82 overflow-y-auto'>
                  <div className='space-y-3'>
                    {mockCameras.map((camera) => (
                      <div
                        key={camera.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-20 ${
                          camera.status === "online"
                            ? "border-green-500/20 bg-green-500/10 hover:bg-green-500/20"
                            : "border-red-500/20 bg-red-500/10 hover:bg-red-500/20"
                        }`}
                        onClick={() => setSelectedCamera(camera.id)}>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-white'>{camera.name}</p>
                            <p className='text-xs text-gray-400'>{camera.location}</p>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                camera.status === "online" ? "bg-green-400" : "bg-red-400"
                              }`}></div>
                            <span className='text-xs text-gray-400'>{camera.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 실시간 알림 시스템 */}
      <NotificationSystem />
    </div>
  );
};

export default Dashboard;
