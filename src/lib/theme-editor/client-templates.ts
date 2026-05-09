"use client";

import type { ThemeConfig } from "@/types/theme";
import type React from "react";

export type RenderFn = (props: {
  content: unknown;
  theme: ThemeConfig;
  mode: "preview" | "public";
}) => React.ReactNode;

const LOADERS: Record<string, () => Promise<RenderFn>> = {
  "bio-link/minimal-dark": async () => {
    const { minimalDark } = await import("@/themes/bio-link/templates/minimal-dark");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (minimalDark as any).render as RenderFn;
  },
};

export async function loadTemplateRender(id: string): Promise<RenderFn | undefined> {
  return LOADERS[id]?.();
}
