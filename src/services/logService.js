import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

// 로그 관련 API 엔드포인트
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

// 로그 데이터를 메모리에 저장 (실제 프로덕션에서는 서버에서 관리)
let logs = [];
let nextLogId = 1;

// Query Keys
export const logKeys = {
  all: ["logs"],
  lists: () => [...logKeys.all, "list"],
  list: (filters) => [...logKeys.lists(), { filters }],
  details: () => [...logKeys.all, "detail"],
  detail: (id) => [...logKeys.details(), id],
};

// 로그 API 함수들
export const logAPI = {
  // 모든 로그 가져오기 (백엔드 API 호출)
  getAllLogs: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category && filters.category !== "all") {
        queryParams.append("category", filters.category);
      }
      if (filters.severity) {
        queryParams.append("severity", filters.severity);
      }
      if (filters.camera) {
        queryParams.append("camera", filters.camera);
      }

      const url = `${API_BASE_URL}/api/logs/all?${queryParams.toString()}`;
      console.log("🔍 Fetching logs from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 API Response:", {
        success: data.success,
        logsCount: data.logs?.length || 0,
        total: data.total,
      });
      return data;
    } catch (error) {
      console.error("❌ Error fetching logs from API:", error);
      // API 실패 시 메모리 데이터 반환
      let filteredLogs = [...logs];

      if (filters.category && filters.category !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.category === filters.category);
      }

      if (filters.severity) {
        filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity);
      }

      if (filters.camera) {
        filteredLogs = filteredLogs.filter((log) => log.camera.includes(filters.camera));
      }

      console.log("📊 Using fallback memory data:", { logsCount: filteredLogs.length });
      return {
        success: true,
        logs: filteredLogs,
        total: filteredLogs.length,
      };
    }
  },

  // 로그 생성
  createLog: async (logData) => {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...logData,
      ts: logData.ts || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    logs.unshift(newLog);
    logs = logs.slice(0, 100); // 최대 100개 유지

    // 캐시 무효화
    queryClient.invalidateQueries({ queryKey: logKeys.all });

    return newLog;
  },

  // 로그 삭제 (백엔드 API 호출)
  deleteLog: async (logId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/${logId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: logKeys.all });

      return data.deletedLog;
    } catch (error) {
      console.error("Error deleting log from API:", error);
      // API 실패 시 메모리에서 삭제
      const logIndex = logs.findIndex((log) => log.id === logId);
      if (logIndex === -1) {
        throw new Error("Log not found");
      }

      const deletedLog = logs.splice(logIndex, 1)[0];

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: logKeys.all });

      return deletedLog;
    }
  },

  // 모든 로그 삭제 (백엔드 API 호출)
  clearAllLogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: logKeys.all });

      return data;
    } catch (error) {
      console.error("Error clearing all logs from API:", error);
      // API 실패 시 메모리에서 삭제
      const deletedCount = logs.length;
      logs = [];

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: logKeys.all });

      return { deletedCount };
    }
  },

  // 실시간 로그 추가 (WebSocket에서 받은 로그)
  addRealtimeLog: async (logData) => {
    console.log("📝 Adding realtime log:", logData);

    // 백엔드 API를 통해 로그 추가 (실제로는 백엔드에서 이미 추가됨)
    // 캐시 무효화 후 즉시 새로고침
    console.log("🔄 Invalidating cache and forcing refetch...");
    queryClient.invalidateQueries({ queryKey: logKeys.all });
    // 추가로 강제 refetch 실행
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: logKeys.all });
      console.log("✅ Forced refetch completed");
    }, 100);
    console.log("✅ Cache invalidated");

    return logData;
  },
};

// React Query Hooks
export const useLogs = (filters = {}) => {
  return useQuery({
    queryKey: logKeys.list(filters),
    queryFn: () => logAPI.getAllLogs(filters),
    staleTime: 0, // 항상 최신 데이터 가져오기
    refetchInterval: 3000, // 3초마다 자동 새로고침
    refetchIntervalInBackground: true, // 백그라운드에서도 새로고침
    refetchOnWindowFocus: true, // 윈도우 포커스시 새로고침
    refetchOnMount: true, // 마운트시 새로고침
  });
};

export const useCreateLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logAPI.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
};

export const useDeleteLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logAPI.deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
};

export const useClearAllLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logAPI.clearAllLogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logKeys.all });
    },
  });
};

// 로그 상태 관리 유틸리티
export const logUtils = {
  // 로그를 알람 형태로 변환
  convertToAlarms: (logs) => {
    return logs.map((log) => ({
      id: log.id,
      timestamp: log.ts,
      type: log.title,
      severity: log.severity,
      camera: log.camera,
      location: log.location,
      isRealtime: log.isRealtime || false,
    }));
  },

  // 카테고리별 로그 수 계산
  getCategoryCounts: (logs) => {
    return logs.reduce((counts, log) => {
      counts[log.category] = (counts[log.category] || 0) + 1;
      return counts;
    }, {});
  },

  // 심각도별 로그 수 계산
  getSeverityCounts: (logs) => {
    return logs.reduce((counts, log) => {
      counts[log.severity] = (counts[log.severity] || 0) + 1;
      return counts;
    }, {});
  },
};

export default logAPI;
