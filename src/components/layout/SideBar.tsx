"use client";
import React, { useState } from "react";
import SidebarItem from "../ui/SideBarItems";
import { Home, Settings } from "lucide-react";
import { sidebarItems } from "@/libs/sideBarLinks";

export default function SideBar() {
  const userName = "Sebastien Joseph";
  const userEmail = "josephsebastien.sj@gmail.com";
  const userImage = "/icons/ProfileIcon.svg";
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative z-30 h-[100dvh] flex flex-col border-r border-[var(--border-gray)] bg-white transition-all duration-300 ease-in-out flex-shrink-0"
      style={{ width: expanded ? 256 : 64 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Top Logo */}
      <div className="h-[56px] p-2 flex items-center">
        <div className="flex items-center gap-2 p-2 min-w-0">
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/icons/Logo.svg" alt="Premia Studio" className="h-8 w-8" />
          </div>
          <div className={`min-w-0 overflow-hidden transition-all duration-300 ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
            <h1 className="text-sm font-semibold leading-[20px] text-[var(--foreground)] whitespace-nowrap">
              Premia Studio
            </h1>
            <p className="text-xs leading-[16px] text-[var(--foreground)] whitespace-nowrap">
              premiastudio.com
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar links */}
      <div className="w-full flex-1 p-2 overflow-auto scrollbar-hide">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const lucideIconMap = {
              home: Home,
              settings: Settings,
            } as const;

            const IconComponent = item.lucideIcon
              ? lucideIconMap[item.lucideIcon]
              : null;

            const iconNode = IconComponent ? (
              <IconComponent size={16} />
            ) : item.icon ? (
              <img src={item.icon} alt={item.label} className="w-4 h-4" />
            ) : undefined;

            return (
              <SidebarItem
                key={item.label}
                icon={iconNode}
                label={item.label}
                route={item.route}
                collapsed={!expanded}
              >
                {item.children?.map((child) => (
                  <SidebarItem
                    key={child.label}
                    label={child.label}
                    route={child.route}
                  />
                ))}
              </SidebarItem>
            );
          })}
        </div>
      </div>

      {/* Bottom profile card */}
      <div className="p-2 border-t border-[var(--border-gray)]">
        <div className="w-full p-2 flex items-center gap-2">
          <img
            src={userImage}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${expanded ? "opacity-100" : "opacity-0 w-0"}`}>
            <p className="text-sm font-semibold text-[var(--foreground)] leading-[20px] truncate">
              {userName}
            </p>
            <p className="text-xs font-normal text-[var(--foreground)] truncate leading-[16px]">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
