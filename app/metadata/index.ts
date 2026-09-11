import type { Metadata, Viewport } from "next";

export const siteMetadata: Metadata = {
  title: "Video Feed",
  description: "Video player and management",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Video Feed",
  },
};

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
