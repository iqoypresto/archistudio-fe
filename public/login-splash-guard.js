(() => {
  if (window.location.pathname !== "/login") return;

  const root = document.documentElement;
  const supportsMediaQuery = typeof window.matchMedia === "function";
  const mobile = supportsMediaQuery && window.matchMedia("(max-width: 767px)").matches;
  const reducedMotion = supportsMediaQuery && window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  try {
    const seen = window.sessionStorage.getItem("archistudio:login-splash-seen");
    const storedAuth = window.localStorage.getItem("archistudio.auth.v1");
    let hasStoredAuth = false;
    try {
      const authPayload = storedAuth ? JSON.parse(storedAuth) : null;
      hasStoredAuth = Boolean(
        authPayload &&
          typeof authPayload.accessToken === "string" &&
          typeof authPayload.refreshToken === "string"
      );
    } catch {
      hasStoredAuth = false;
    }
    if (reducedMotion) {
      window.sessionStorage.setItem("archistudio:login-splash-seen", "1");
    }
    if (!mobile || reducedMotion || seen || hasStoredAuth) {
      root.dataset.loginSplashSkip = "true";
      root.dataset.loginSplashExit = "false";
    } else {
      root.dataset.loginSplashSkip = "false";
      root.dataset.loginSplashExit = "true";
    }
  } catch {
    root.dataset.loginSplashSkip = "true";
    root.dataset.loginSplashExit = "false";
  }
})();
