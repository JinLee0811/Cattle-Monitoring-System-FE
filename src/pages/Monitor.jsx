import { useState, useEffect } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { mockCameras } from "../utils/mockData";

const Monitor = () => {
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [layout, setLayout] = useState("quad"); // Changed default to "quad" for 2x2 layout
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCameraClick = (cameraId) => {
    if (expandedCamera === cameraId) {
      setExpandedCamera(null);
    } else {
      setExpandedCamera(cameraId);
    }
  };

  const getGridClass = () => {
    if (expandedCamera) {
      return "grid-cols-1";
    }
    // Always use 2x2 grid layout (quad)
    return "grid-cols-2";

    // Commented out other layout options
    // switch (layout) {
    //   case "single":
    //     return "grid-cols-1";
    //   case "quad":
    //     return "grid-cols-2";
    //   default:
    //     return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    // }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Monitor System</h1>
            <p className="text-gray-400 text-sm">
              {mockCameras.filter((c) => c.status === "online").length} cameras
              online • {formatDate(currentTime)} •{" "}
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
          {/* Layout selection - commented out */}
          {/* <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Layout:</span>
              <div className="flex bg-slate-700 rounded-lg p-1">
                {[
                  { key: "grid", label: "Grid", icon: "⊞" },
                  { key: "quad", label: "Quad", icon: "⊟" },
                  { key: "single", label: "Single", icon: "⊡" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setLayout(option.key)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      layout === option.key
                        ? "bg-farm-green text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title={option.label}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </header>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 ml-64 p-6">
          <div className={`grid ${getGridClass()} gap-4`}>
            {mockCameras.map((camera) => {
              const isExpanded = expandedCamera === camera.id;
              const isOnline = camera.status === "online";

              return (
                <div
                  key={camera.id}
                  className={`relative bg-slate-800 rounded-lg overflow-hidden transition-all duration-300 ${
                    isExpanded ? "col-span-1 row-span-1" : ""
                  }`}
                >
                  {/* Camera header */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {camera.name}
                        </h3>
                        <p className="text-gray-300 text-xs">
                          {camera.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isOnline ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-white text-xs">OFFLINE</span>
                          </>
                        ) : (
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                            NORMAL
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video player */}
                  <div className="aspect-video bg-black">
                    {isOnline ? (
                      <VideoPlayer
                        videoUrl="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                        cameraName={camera.name}
                        location={camera.location}
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
                            Last update: {camera.lastUpdate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera info footer */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-xs">
                        <div className="flex items-center space-x-4">
                          <span>{camera.resolution}</span>
                          <span>{camera.fps} FPS</span>
                          <span
                            className={`flex items-center space-x-1 ${
                              camera.recording
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                camera.recording
                                  ? "bg-red-400 animate-pulse"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <span>
                              {camera.recording ? "Recording" : "Stopped"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* LIVE indicator and time */}
                      <div className="flex items-center space-x-3">
                        {isOnline && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                            <span className="text-white text-xs font-medium">
                              LIVE
                            </span>
                          </div>
                        )}
                        <span className="text-white text-xs">
                          {currentTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Camera list summary */}
          <div className="mt-6 bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Camera Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCameras.map((camera) => (
                <div
                  key={camera.id}
                  className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => handleCameraClick(camera.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{camera.name}</h4>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        camera.status === "online"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {camera.location}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{camera.resolution}</span>
                    <span>{camera.fps} FPS</span>
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

export default Monitor;
