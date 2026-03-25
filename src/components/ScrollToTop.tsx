"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Disable browser scroll restoration and force top on every load
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return null;
}
