import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const VideoPlayer = ({
  videoUrl,
  cameraName,
  location,
  isLive = false,
  showControls = true,
  videoId = "default",
}) => {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [detections, setDetections] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedTimes, setAnalyzedTimes] = useState(new Set());

  // Socket.IO 연결 및 실시간 분석 설정
  useEffect(() => {
    if (!isLive) return;

    // Socket.IO 연결
    const socket = io(
      import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:5050"
    );
    console.log("🔌 Connecting to WebSocket server...");
    socketRef.current = socket;

    // 분석 결과 수신
    socket.on("analysis_result", (data) => {
      console.log("📥 Analysis result received:", data);
      console.log("📥 Cattle detections:", data.result.cattle);
      console.log("📥 Cattle count:", data.result.cattle_count);

      if (data.result.cattle && data.result.cattle.length > 0) {
        console.log("✅ Real AI detections found!");
        setDetections(data.result.cattle);
      } else {
        console.log("❌ No cattle detected by AI");
        setDetections([]);
      }
      setIsAnalyzing(false);
    });

    // 분석 에러 수신
    socket.on("analysis_error", (error) => {
      console.error("Analysis error:", error);
      setIsAnalyzing(false);
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [isLive, videoId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // 실시간 분석 트리거 (2초마다)
      if (isLive && Math.floor(video.currentTime) % 2 === 0) {
        const timeKey = Math.floor(video.currentTime);
        if (!analyzedTimes.has(timeKey)) {
          analyzeCurrentFrame(video.currentTime);
          setAnalyzedTimes((prev) => new Set([...prev, timeKey]));

          // 실제 AI 분석 결과를 기다리기 위해 더미 데이터 비활성화
          // setTimeout(() => {
          //   const dummyDetections = [
          //     {
          //       id: 1,
          //       confidence: 0.85,
          //       bounding_box: {
          //         x1: Math.random() * 300 + 50,
          //         y1: Math.random() * 200 + 50,
          //         x2: Math.random() * 300 + 200,
          //         y2: Math.random() * 200 + 200,
          //       },
          //       behavior: {
          //         primary: "Standing",
          //         confidence: 0.8,
          //       },
          //     },
          //     {
          //       id: 2,
          //       confidence: 0.92,
          //       bounding_box: {
          //         x1: Math.random() * 300 + 100,
          //         y1: Math.random() * 200 + 100,
          //         x2: Math.random() * 300 + 300,
          //         y2: Math.random() * 200 + 250,
          //       },
          //       behavior: {
          //         primary: "Eating",
          //         confidence: 0.9,
          //       },
          //     },
          //   ];
          //   console.log("🎯 Setting dummy detections:", dummyDetections);
          //   setDetections(dummyDetections);
          // }, 500);
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Auto-play and loop for surveillance monitoring
    if (!showControls) {
      video.autoplay = true;
      video.loop = true;
      video.muted = true; // Mute for auto-play
      video.play().catch((e) => console.log("Auto-play failed:", e));
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [showControls, isLive, analyzedTimes]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekTime = (clickX / width) * duration;
      video.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // 프레임 캡처 및 분석 함수
  const captureFrame = (videoElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 비디오 크기 확인
    console.log(`📐 Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // 고품질 프레임 캡처
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // 캔버스를 실제 비디오 요소 크기로 조정
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    console.log(`📸 Captured frame size: ${dataURL.length} characters`);

    return dataURL;
  };

  const analyzeCurrentFrame = (videoTime) => {
    if (!socketRef.current || !videoRef.current || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const frameBase64 = captureFrame(videoRef.current);
      console.log(
        `📸 Frame captured for ${videoId} at ${videoTime}s, size: ${frameBase64.length} chars`
      );

      socketRef.current.emit("analyze_frame", {
        frameBase64: frameBase64,
        videoId: videoId,
        videoTime: videoTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to analyze frame:", error);
      setIsAnalyzing(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className='relative bg-black rounded-lg overflow-hidden group'>
      {/* Video element */}
      <video
        ref={videoRef}
        className='w-full h-full object-cover'
        src={videoUrl}
        onClick={showControls ? togglePlay : undefined}
        onMouseEnter={showControls ? () => setControlsVisible(true) : undefined}
        onMouseLeave={showControls ? () => setControlsVisible(false) : undefined}
        autoPlay={!showControls}
        loop={!showControls}
        muted={!showControls}
        playsInline={!showControls}
      />

      {/* Control overlay - only show if showControls is true */}
      {showControls && controlsVisible && (
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
          {/* Play/pause button */}
          <div className='flex items-center justify-center mb-2'>
            <button
              onClick={togglePlay}
              className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors'>
              {isPlaying ? (
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                </svg>
              ) : (
                <svg className='w-6 h-6 text-white ml-1' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M8 5v14l11-7z' />
                </svg>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className='mb-2'>
            <div
              className='w-full h-1 bg-white/30 rounded-full cursor-pointer'
              onClick={handleSeek}>
              <div
                className='h-full bg-farm-green rounded-full transition-all'
                style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>
          </div>

          {/* Volume control */}
          <div className='flex items-center space-x-2'>
            <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
            </svg>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={volume}
              onChange={handleVolumeChange}
              className='w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer'
            />
          </div>
        </div>
      )}

      {/* AI detection result overlay */}
      <div className='absolute inset-0 pointer-events-none'>
        {detections.map((detection, index) => (
          <div
            key={index}
            className='absolute border-4 border-red-500 bg-red-500/30 shadow-2xl'
            style={{
              left: detection.bounding_box?.x1 || 0,
              top: detection.bounding_box?.y1 || 0,
              width: (detection.bounding_box?.x2 || 0) - (detection.bounding_box?.x1 || 0),
              height: (detection.bounding_box?.y2 || 0) - (detection.bounding_box?.y1 || 0),
            }}>
            <div className='absolute -top-8 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg font-bold'>
              🐄 Cattle {(detection.confidence * 100).toFixed(0)}% -{" "}
              {detection.behavior?.primary || "Unknown"}
            </div>
            <div className='absolute -bottom-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg'>
              Behavior: {(detection.behavior?.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ))}

        {/* 분석 중 인디케이터 */}
        {isAnalyzing && (
          <div className='absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            <span className='text-sm'>Analyzing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
