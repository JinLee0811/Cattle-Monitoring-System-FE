import { useState, useEffect } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // localStorage에서 저장된 테마 가져오기
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // 시스템 설정 감지
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // 테마 변경 시 document에 data-theme 속성 설정
    document.documentElement.setAttribute("data-theme", theme);

    // localStorage에 저장
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      if (theme === "auto") {
        // auto 모드일 때만 시스템 변경에 반응
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return { theme, changeTheme };
};
