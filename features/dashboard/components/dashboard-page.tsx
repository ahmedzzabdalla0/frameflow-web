"use client";

import { useState, useCallback, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { DashboardSection } from "@/types/dashboard";
import OverviewSection from "./overview-section";
import VideosSection from "./videos-section";
import CategoriesSection from "./categories-section";
import SettingsSection from "./settings-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTIONS: { id: DashboardSection; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "videos",
    label: "Videos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    id: "categories",
    label: "Categories",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const VALID_SECTION_IDS: DashboardSection[] = ["overview", "videos", "categories", "settings"];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [navOpen, setNavOpen] = useState(false);

  const navigate = useCallback((section: DashboardSection) => {
    setActiveSection(section);
    setNavOpen(false);
    window.location.hash = section;
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1) as DashboardSection;
      if (VALID_SECTION_IDS.includes(hash)) setActiveSection(hash);
    };

    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-background font-sans text-foreground/90">
      <Button
        variant="secondary"
        size="md"
        onClick={() => setNavOpen(true)}
        className="fixed top-3 left-3 z-40 size-10 px-0 shadow-lg md:hidden"
        aria-label="Open dashboard navigation"
      >
        <Menu size={20} />
      </Button>
      {navOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/65 md:hidden"
          onClick={() => setNavOpen(false)}
          aria-label="Close dashboard navigation"
        />
      )}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] shrink-0 flex-col border-r border-surface-hover bg-surface transition-transform duration-200 md:static md:w-55 md:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setNavOpen(false)}
          className="absolute top-3 right-3 size-8 px-0 md:hidden"
          aria-label="Close dashboard navigation"
        >
          <X size={18} />
        </Button>
        <div className="flex items-center gap-2 border-b border-surface-hover px-4 py-5 text-base font-bold text-foreground">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          Dashboard
        </div>

        <div className="px-4 pt-3 pb-1 text-xs tracking-[0.08em] text-subtle uppercase">Library</div>

        {SECTIONS.slice(0, 3).map((s) => (
          <NavItem
            key={s.id}
            section={s.id}
            label={s.label}
            icon={s.icon}
            active={activeSection === s.id}
            onClick={navigate}
          />
        ))}

        <div className="px-4 pt-3 pb-1 text-xs tracking-[0.08em] text-subtle uppercase">System</div>

        <NavItem
          section="settings"
          label="Settings"
          icon={SECTIONS[3].icon}
          active={activeSection === "settings"}
          onClick={navigate}
        />

        <div className="mt-auto border-t border-surface-hover px-4 py-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 text-sm text-muted no-underline transition-colors hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open Player
          </a>
        </div>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto px-3 pt-16 pb-8 sm:px-5 sm:pt-6 lg:px-8">
        {activeSection === "overview" && <OverviewSection />}
        {activeSection === "videos" && <VideosSection />}
        {activeSection === "categories" && <CategoriesSection />}
        {activeSection === "settings" && <SettingsSection />}
      </main>
    </div>
  );
}

interface NavItemProps {
  section: DashboardSection;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (section: DashboardSection) => void;
}

function NavItem({ section, label, icon, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={() => onClick(section)}
      className={cn(
        "flex w-full items-center gap-2.5 border-l-[3px] px-4 py-[11px] text-sm transition-all",
        active
          ? "border-primary bg-surface-hover text-foreground"
          : "border-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
