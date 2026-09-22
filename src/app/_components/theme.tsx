"use client";

import { Moon02Icon, Sun03Icon } from "hugeicons-react";
import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme is only known client-side; rendering the real icon before mount
  // would emit whichever one the server guessed and then swap it.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
    >
      {mounted ? (
        isDark ? (
          <Sun03Icon size={16} strokeWidth={1.5} />
        ) : (
          <Moon02Icon size={16} strokeWidth={1.5} />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}
