import { useState, useRef, useEffect } from "react";

const VideoPlayer = ({ videoUrl, cameraName, location, isLive = false, showControls = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
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
  }, [showControls]);

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

      {/* AI detection result overlay (future implementation) */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* AI detection bounding boxes will be displayed here */}
      </div>
    </div>
  );
};

export default VideoPlayer;
