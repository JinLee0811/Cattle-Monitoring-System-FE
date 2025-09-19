import { useState, useEffect } from "react";
import VideoPlayer from "../components/VideoPlayer";
import NotificationSystem from "../components/NotificationSystem";
import LogPanel from "../components/LogPanel";
import { mockCameras } from "../utils/mockData";

const Monitor = () => {
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGridClass = () => (expandedCamera ? "grid-cols-1" : "grid-cols-2");

  const handleCameraClick = (cameraId) => {
    if (expandedCamera === cameraId) {
      setExpandedCamera(null); // 이미 확장된 카메라를 클릭하면 원래대로
    } else {
      setExpandedCamera(cameraId); // 새로운 카메라를 확장
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Header */}
      <header className='bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Monitor System</h1>
            <p className='text-gray-400 text-sm'>
              {mockCameras.filter((c) => c.status === "online").length} cameras online •{" "}
              {formatDate(currentTime)} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Main content */}
        <main className='flex-1 ml-64 p-6'>
          {/* Camera list summary - moved to top */}
          <div className='mb-6 bg-slate-800 rounded-lg p-6'>
            <h3 className='text-lg font-bold text-white mb-4'>Camera Online Status</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {mockCameras.map((camera) => (
                <div
                  key={camera.id}
                  onClick={() => handleCameraClick(camera.id)}
                  className='p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer hover:bg-slate-750'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='font-medium text-white'>{camera.name}</h4>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        camera.status === "online" ? "bg-green-400" : "bg-red-400"
                      }`}></div>
                  </div>
                  <p className='text-sm text-gray-400 mb-2'>{camera.location}</p>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>{camera.resolution}</span>
                    <span>{camera.fps} FPS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`grid ${getGridClass()} gap-4`}>
            {mockCameras
              .filter((camera) => !expandedCamera || camera.id === expandedCamera)
              .map((camera) => {
                const isExpanded = expandedCamera === camera.id;
                const isOnline = camera.status === "online";

                return (
                  <div
                    key={camera.id}
                    onClick={() => handleCameraClick(camera.id)}
                    className={`relative bg-slate-800 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer hover:bg-slate-750 ${
                      isExpanded ? "col-span-1 row-span-1 ring-2 ring-blue-500" : ""
                    }`}>
                    {/* Camera header */}
                    <div className='absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-white font-semibold text-sm'>{camera.name}</h3>
                          <p className='text-gray-300 text-xs'>{camera.location}</p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCamera(null);
                              }}
                              className='px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors'>
                              Exit Full View
                            </button>
                          )}
                          {!isOnline ? (
                            <>
                              <div className='w-2 h-2 rounded-full bg-red-400'></div>
                              <span className='text-white text-xs'>OFFLINE</span>
                            </>
                          ) : (
                            <div className='px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white'>
                              NORMAL
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video player with AI detection */}
                    <div className={`bg-black ${isExpanded ? "aspect-[16/9]" : "aspect-video"}`}>
                      {isOnline ? (
                        <VideoPlayer
                          videoUrl={`/video/${camera.videoFile}`}
                          cameraName={camera.name}
                          location={camera.location}
                          isLive={isExpanded}
                          showControls={false}
                          videoId={`camera_${camera.id}`}
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
                              Last update: {camera.lastUpdate}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Camera info footer */}
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='text-white text-xs'>
                          <div className='flex items-center space-x-4'>
                            <span>{camera.resolution}</span>
                            <span>{camera.fps} FPS</span>
                            <span
                              className={`flex items-center space-x-1 ${
                                camera.recording ? "text-red-400" : "text-gray-400"
                              }`}>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  camera.recording ? "bg-red-400 animate-pulse" : "bg-gray-400"
                                }`}></div>
                              <span>{camera.recording ? "Recording" : "Stopped"}</span>
                            </span>
                          </div>
                        </div>

                        {/* LIVE indicator and time */}
                        <div className='flex items-center space-x-3'>
                          {isOnline && (
                            <div className='flex items-center space-x-1'>
                              <div className='w-2 h-2 rounded-full bg-red-400 animate-pulse'></div>
                              <span className='text-white text-xs font-medium'>LIVE</span>
                            </div>
                          )}
                          <span className='text-white text-xs'>
                            {currentTime.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* (camera list summary moved to top) */}
        </main>

        {/* Real-time log panel - only show when camera is expanded */}
        {expandedCamera && (
          <aside className='w-80 p-6'>
            <LogPanel selectedCamera={expandedCamera} />
          </aside>
        )}
      </div>

      {/* Real-time notification system */}
      <NotificationSystem />
    </div>
  );
};

export default Monitor;
