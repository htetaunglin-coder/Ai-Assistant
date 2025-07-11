"use client";

import { useEffect, useState } from "react";
import { Button, ButtonProps, cn } from "@mijn-ui/react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/* -------------------------------------------------------------------------- */

const ThemeToggler = ({ className, ...props }: ButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return;

  if (resolvedTheme === "dark") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className={cn("rounded-md", className)}
        iconOnly
        {...props}>
        <Sun className="text-lg" />
      </Button>
    );
  }
  if (resolvedTheme === "light") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className={cn("rounded-md", className)}
        iconOnly
        {...props}>
        <Moon className="text-base" />
      </Button>
    );
  }
};

export { ThemeToggler };
