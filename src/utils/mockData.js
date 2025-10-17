// Mock log data
export const mockLogs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:30:25",
    type: "detection",
    message: "Animal behavior anomaly detected: Camera 1 shows unusual movement patterns",
    severity: "warning",
    camera: "Camera 1",
    location: "Barn A",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:28:10",
    type: "system",
    message: "System operating normally",
    severity: "info",
    camera: "All",
    location: "All Areas",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:25:45",
    type: "detection",
    message: "AI analysis complete: Normal activity confirmed on Camera 3",
    severity: "success",
    camera: "Camera 3",
    location: "Barn C",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:22:30",
    type: "alert",
    message: "Temperature sensor warning: Temperature rising in Barn B",
    severity: "error",
    camera: "Camera 2",
    location: "Barn B",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:20:15",
    type: "detection",
    message: "Animal count verified: 15 animals confirmed on Camera 1",
    severity: "info",
    camera: "Camera 1",
    location: "Barn A",
  },
];

// Camera status data
export const mockCameras = [
  {
    id: 1,
    name: "Camera 1",
    status: "online",
    location: "Barn A",
    lastUpdate: "2024-01-15 14:30:25",
    resolution: "1080p",
    fps: 30,
    recording: true,
    videoFile: "cam1.mov",
  },
  {
    id: 2,
    name: "Camera 2",
    status: "online",
    location: "Barn B",
    lastUpdate: "2024-01-15 14:29:45",
    resolution: "1080p",
    fps: 30,
    recording: true,
    videoFile: "cam2.mp4",
  },
  {
    id: 3,
    name: "Camera 3",
    status: "online",
    location: "Barn C",
    lastUpdate: "2024-01-15 14:30:10",
    resolution: "720p",
    fps: 25,
    recording: true,
    videoFile: "cam3.mp4",
  },
  {
    id: 4,
    name: "Camera 4",
    status: "online",
    location: "Barn D",
    lastUpdate: "2024-01-15 14:30:15",
    resolution: "1080p",
    fps: 30,
    recording: true,
    videoFile: "cam4.mp4",
  },
  {
    id: 5,
    name: "Camera 5",
    status: "offline",
    location: "Reserved",
    lastUpdate: "Unknown",
    resolution: "1080p",
    fps: 30,
    recording: false,
    videoFile: null,
  },
];

// Alarm data
export const mockAlarms = [
  {
    id: 1,
    timestamp: "2024-01-15 14:30:25",
    type: "Animal Behavior Anomaly",
    severity: "high",
    camera: "Camera 1",
    location: "Barn A",
    resolved: false,
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:22:30",
    type: "Temperature Warning",
    severity: "medium",
    camera: "Camera 2",
    location: "Barn B",
    resolved: false,
  },
  {
    id: 3,
    timestamp: "2024-01-15 13:15:45",
    type: "Camera Offline",
    severity: "low",
    camera: "Camera 4",
    location: "External Surveillance",
    resolved: true,
  },
];

// System status data
export const mockSystemStatus = {
  totalCameras: 5,
  onlineCameras: 4,
  offlineCameras: 1,
  totalStorage: "2.5TB",
  usedStorage: "1.8TB",
  cpuUsage: "45%",
  memoryUsage: "62%",
  networkStatus: "stable",
  lastBackup: "2024-01-15 02:00:00",
};

// Sample video URLs (in real implementation, these would be uploaded video file paths)
export const sampleVideos = ["/videos/sample1.mp4", "/videos/sample2.mp4", "/videos/sample3.mp4"];
