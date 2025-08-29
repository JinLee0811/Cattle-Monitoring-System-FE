import { useState, useRef } from "react";

const Upload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith("video/")) {
      setUploadedFile(file);
      setAnalysisResult(null);
    } else {
      alert("Only video files can be uploaded.");
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);

    // AI analysis simulation (3 second wait)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock analysis result
    const mockResult = {
      timestamp: new Date().toISOString(),
      fileName: uploadedFile.name,
      duration: "00:02:15",
      detections: [
        {
          id: 1,
          type: "Animal",
          confidence: 0.95,
          timestamp: "00:00:45",
          boundingBox: { x: 100, y: 150, width: 200, height: 300 },
          description: "1 cow detected",
        },
        {
          id: 2,
          type: "Anomaly",
          confidence: 0.87,
          timestamp: "00:01:20",
          boundingBox: { x: 300, y: 200, width: 150, height: 250 },
          description: "Unusual movement pattern detected",
        },
        {
          id: 3,
          type: "Health Status",
          confidence: 0.92,
          timestamp: "00:01:45",
          boundingBox: { x: 200, y: 100, width: 180, height: 280 },
          description: "Normal health status confirmed",
        },
      ],
      summary: {
        totalAnimals: 3,
        anomalies: 1,
        healthIssues: 0,
        recommendations: [
          "Monitor 1 cow in Barn A section",
          "Check temperature sensors",
          "Verify regular health check schedule",
        ],
      },
    };

    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };

  const getDetectionColor = (type) => {
    switch (type) {
      case "Anomaly":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Health Status":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Header */}
      <header className='bg-slate-800 border-b border-slate-700 px-6 py-4 ml-64'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white'>Video Upload & Analysis</h1>
            <p className='text-gray-400 text-sm'>
              Upload video files for AI-powered animal behavior and health analysis
            </p>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Main content */}
        <main className='flex-1 ml-64 p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Upload section */}
            <div className='space-y-6'>
              {/* File upload */}
              <div className='bg-slate-800 rounded-lg p-6'>
                <h2 className='text-xl font-bold text-white mb-4'>Video Upload</h2>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-farm-green bg-green-400/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}>
                  {uploadedFile ? (
                    <div>
                      <svg
                        className='w-12 h-12 text-green-400 mx-auto mb-4'
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
                      <h3 className='text-lg font-medium text-white mb-2'>File Upload Complete</h3>
                      <p className='text-gray-400 mb-4'>{uploadedFile.name}</p>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className='text-sm text-red-400 hover:text-red-300'>
                        Select Different File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className='w-12 h-12 text-gray-400 mx-auto mb-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                        />
                      </svg>
                      <h3 className='text-lg font-medium text-white mb-2'>Upload video file</h3>
                      <p className='text-gray-400 mb-4'>Drag and drop or click to select a file</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className='bg-farm-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'>
                        Select File
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='video/*'
                    onChange={handleFileInput}
                    className='hidden'
                  />
                </div>

                {/* Analysis button */}
                {uploadedFile && (
                  <div className='mt-6'>
                    <button
                      onClick={simulateAnalysis}
                      disabled={isAnalyzing}
                      className='w-full bg-farm-green text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-farm-green focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      {isAnalyzing ? (
                        <div className='flex items-center justify-center space-x-2'>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                          <span>AI Analysis in Progress...</span>
                        </div>
                      ) : (
                        "Start AI Analysis"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis progress */}
              {isAnalyzing && (
                <div className='bg-slate-800 rounded-lg p-6'>
                  <h3 className='text-lg font-bold text-white mb-4'>Analysis Progress</h3>
                  <div className='space-y-4'>
                    {[
                      "Extracting video frames...",
                      "Loading AI model...",
                      "Analyzing animal detection...",
                      "Analyzing behavior patterns...",
                      "Evaluating health status...",
                      "Generating results...",
                    ].map((step, index) => (
                      <div key={index} className='flex items-center space-x-3'>
                        <div className='w-4 h-4 bg-farm-green rounded-full'></div>
                        <span className='text-gray-300'>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis results */}
            <div className='space-y-6'>
              {analysisResult && (
                <>
                  {/* Analysis summary */}
                  <div className='bg-slate-800 rounded-lg p-6'>
                    <h2 className='text-xl font-bold text-white mb-4'>Analysis Results</h2>
                    <div className='grid grid-cols-3 gap-4 mb-6'>
                      <div className='text-center p-4 bg-slate-700 rounded-lg'>
                        <div className='text-2xl font-bold text-blue-400'>
                          {analysisResult.summary.totalAnimals}
                        </div>
                        <div className='text-sm text-gray-400'>Animals Detected</div>
                      </div>
                      <div className='text-center p-4 bg-slate-700 rounded-lg'>
                        <div className='text-2xl font-bold text-yellow-400'>
                          {analysisResult.summary.anomalies}
                        </div>
                        <div className='text-sm text-gray-400'>Anomalies</div>
                      </div>
                      <div className='text-center p-4 bg-slate-700 rounded-lg'>
                        <div className='text-2xl font-bold text-green-400'>
                          {analysisResult.summary.healthIssues}
                        </div>
                        <div className='text-sm text-gray-400'>Health Issues</div>
                      </div>
                    </div>
                  </div>

                  {/* Detection results */}
                  <div className='bg-slate-800 rounded-lg p-6'>
                    <h3 className='text-lg font-bold text-white mb-4'>Detection Results</h3>
                    <div className='space-y-3'>
                      {analysisResult.detections.map((detection) => (
                        <div
                          key={detection.id}
                          className={`p-4 rounded-lg border ${getDetectionColor(detection.type)}`}>
                          <div className='flex items-start justify-between'>
                            <div>
                              <div className='flex items-center space-x-2 mb-1'>
                                <span className='font-medium'>{detection.type}</span>
                                <span className='text-xs px-2 py-1 bg-white/20 rounded-full'>
                                  {Math.round(detection.confidence * 100)}%
                                </span>
                              </div>
                              <p className='text-sm'>{detection.description}</p>
                              <p className='text-xs text-gray-400 mt-1'>
                                Time: {detection.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className='bg-slate-800 rounded-lg p-6'>
                    <h3 className='text-lg font-bold text-white mb-4'>Recommendations</h3>
                    <div className='space-y-2'>
                      {analysisResult.summary.recommendations.map((rec, index) => (
                        <div key={index} className='flex items-start space-x-3'>
                          <div className='w-2 h-2 bg-farm-green rounded-full mt-2'></div>
                          <p className='text-sm text-gray-300'>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Upload;

