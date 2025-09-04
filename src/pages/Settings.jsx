import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

const Settings = () => {
  const { theme, changeTheme } = useTheme();

  const [settings, setSettings] = useState({
    // Appearance
    language: "en",

    // Monitoring
    autoRefresh: true,
    refreshInterval: 30,
    alertSound: true,
    alertVolume: 70,

    // Camera
    recordingQuality: "1080p",
    recordingDuration: 24,
    motionDetection: true,
    nightVision: true,

    // Notifications
    emailAlerts: true,
    pushNotifications: true,
    criticalAlerts: true,
    weatherAlerts: true,

    // System
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: 30,
    performanceMode: "balanced",
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem("farmSettings", JSON.stringify(settings));
    // Show success message
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      const defaultSettings = {
        language: "en",
        autoRefresh: true,
        refreshInterval: 30,
        alertSound: true,
        alertVolume: 70,
        recordingQuality: "1080p",
        recordingDuration: 24,
        motionDetection: true,
        nightVision: true,
        emailAlerts: true,
        pushNotifications: true,
        criticalAlerts: true,
        weatherAlerts: true,
        autoBackup: true,
        backupFrequency: "daily",
        dataRetention: 30,
        performanceMode: "balanced",
      };
      setSettings(defaultSettings);
      // 테마도 기본값으로 리셋
      changeTheme("dark");
    }
  };

  return (
    <div className='min-h-screen bg-theme-primary text-theme-primary'>
      <div className='ml-64 p-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-theme-primary mb-2'>Settings</h1>
            <p className='text-theme-muted'>Configure your farm monitoring system preferences</p>
          </div>

          {/* Settings Sections */}
          <div className='space-y-8'>
            {/* Appearance */}
            <div className='bg-theme-card rounded-lg p-6 border border-theme'>
              <h2 className='text-xl font-semibold text-theme-primary mb-4 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a4 4 0 00-4-4v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a4 4 0 01-4 4z'
                  />
                </svg>
                Appearance
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='dark'>Dark Mode</option>
                    <option value='light'>Light Mode</option>
                    <option value='auto'>Auto (System)</option>
                  </select>
                  <p className='text-xs text-theme-muted mt-1'>
                    {theme === "auto"
                      ? "Following system preference"
                      : `Currently using ${theme} mode`}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange("language", e.target.value)}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='en'>English</option>
                    <option value='ko'>한국어</option>
                    <option value='ja'>日本語</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Monitoring */}
            <div className='bg-theme-card rounded-lg p-6 border border-theme'>
              <h2 className='text-xl font-semibold text-theme-primary mb-4 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
                Monitoring
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Auto Refresh
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.autoRefresh}
                      onChange={(e) => handleSettingChange("autoRefresh", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>
                      Enable auto-refresh of data
                    </span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Refresh Interval
                  </label>
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      handleSettingChange("refreshInterval", parseInt(e.target.value))
                    }
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='10'>10 seconds</option>
                    <option value='30'>30 seconds</option>
                    <option value='60'>1 minute</option>
                    <option value='300'>5 minutes</option>
                    <option value='600'>10 minutes</option>
                    <option value='1800'>30 minutes</option>
                    <option value='3600'>1 hour</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Alert Sound
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.alertSound}
                      onChange={(e) => handleSettingChange("alertSound", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>Enable alert sound</span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Alert Volume
                  </label>
                  <select
                    value={settings.alertVolume}
                    onChange={(e) => handleSettingChange("alertVolume", parseInt(e.target.value))}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='0'>Silent</option>
                    <option value='30'>Low</option>
                    <option value='60'>Medium</option>
                    <option value='90'>High</option>
                    <option value='100'>Max</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Camera */}
            <div className='bg-theme-card rounded-lg p-6 border border-theme'>
              <h2 className='text-xl font-semibold text-theme-primary mb-4 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                Camera
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Recording Quality
                  </label>
                  <select
                    value={settings.recordingQuality}
                    onChange={(e) => handleSettingChange("recordingQuality", e.target.value)}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='1080p'>1080p (Full HD)</option>
                    <option value='720p'>720p (HD)</option>
                    <option value='480p'>480p (Standard)</option>
                    <option value='360p'>360p (Low)</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Recording Duration
                  </label>
                  <select
                    value={settings.recordingDuration}
                    onChange={(e) =>
                      handleSettingChange("recordingDuration", parseInt(e.target.value))
                    }
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='1'>1 hour</option>
                    <option value='2'>2 hours</option>
                    <option value='4'>4 hours</option>
                    <option value='8'>8 hours</option>
                    <option value='12'>12 hours</option>
                    <option value='24'>24 hours</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Motion Detection
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.motionDetection}
                      onChange={(e) => handleSettingChange("motionDetection", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>
                      Enable motion detection
                    </span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Night Vision
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.nightVision}
                      onChange={(e) => handleSettingChange("nightVision", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>Enable night vision</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className='bg-theme-card rounded-lg p-6 border border-theme'>
              <h2 className='text-xl font-semibold text-theme-primary mb-4 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
                Notifications
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Email Alerts
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.emailAlerts}
                      onChange={(e) => handleSettingChange("emailAlerts", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>Enable email alerts</span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Push Notifications
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange("pushNotifications", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>
                      Enable push notifications
                    </span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Critical Alerts
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.criticalAlerts}
                      onChange={(e) => handleSettingChange("criticalAlerts", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>
                      Enable critical alerts
                    </span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Weather Alerts
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.weatherAlerts}
                      onChange={(e) => handleSettingChange("weatherAlerts", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>Enable weather alerts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System */}
            <div className='bg-theme-card rounded-lg p-6 border border-theme'>
              <h2 className='text-xl font-semibold text-theme-primary mb-4 flex items-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-3-3v6m5 0a2 2 0 110 4 2 2 0 010-4zm-9 0a2 2 0 110 4 2 2 0 010-4z'
                  />
                </svg>
                System
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Auto Backup
                  </label>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange("autoBackup", e.target.checked)}
                      className='w-4 h-4 text-theme-accent focus:ring-theme-accent border-theme rounded'
                    />
                    <span className='ml-2 text-sm text-theme-secondary'>
                      Enable auto-backup of data
                    </span>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='daily'>Daily</option>
                    <option value='weekly'>Weekly</option>
                    <option value='monthly'>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Data Retention
                  </label>
                  <select
                    value={settings.dataRetention}
                    onChange={(e) => handleSettingChange("dataRetention", parseInt(e.target.value))}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='7'>7 days</option>
                    <option value='15'>15 days</option>
                    <option value='30'>30 days</option>
                    <option value='90'>90 days</option>
                    <option value='180'>180 days</option>
                    <option value='365'>1 year</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-theme-secondary mb-2'>
                    Performance Mode
                  </label>
                  <select
                    value={settings.performanceMode}
                    onChange={(e) => handleSettingChange("performanceMode", e.target.value)}
                    className='w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary focus:outline-none focus:border-theme-accent'>
                    <option value='balanced'>Balanced</option>
                    <option value='performance'>Performance</option>
                    <option value='battery'>Battery</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div className='flex justify-end space-x-4'>
            <button
              onClick={handleReset}
              className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
              Reset All
            </button>
            <button
              onClick={handleSave}
              className='px-6 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-hover transition-colors'>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
