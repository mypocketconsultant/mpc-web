/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { RiMenuFold2Line } from "react-icons/ri";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wrench,
  BookOpen,
  Settings,
  LifeBuoy,
  Briefcase,
  Users,
  Target,
  DollarSign,
  Heart,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Wrench, label: "Tools", href: "/tools" },
  ];

  const modules = [
    { icon: LifeBuoy, label: "Life Advisor", href: "/Life" },
    { icon: Briefcase, label: "Career Consulting", href: "/career" },
    {
      icon: Users,
      label: "Business Consultancy",
      href: "/business-consultancy",
    },
    { icon: BookOpen, label: "Study Support", href: "/study" },
    {
      icon: DollarSign,
      label: "Financial Literacy",
      href: "/financial-literacy",
    },
    { icon: Heart, label: "Faith (opt-in)", href: "/modules/faith" },
    { icon: Target, label: "Social Impact", href: "/modules/social-impact" },
  ];

  const settings = [
    { icon: Users, label: "User", href: "/settings/user" },
    { icon: Settings, label: "Security", href: "/settings/security" },
    { icon: DollarSign, label: "Pricing", href: "/settings/pricing" },
    { icon: HelpCircle, label: "Help Center", href: "/settings/help" },
  ];

  const NavLink = ({ icon: Icon, label, href, active = false }: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-2 py-4 rounded-full transition-all font-medium ${
        active
          ? "bg-linear-to-r from-[#5A3FFF] to-[#300878] text-white shadow-lg shrink-0"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      style={active ? { backgroundColor: "#5A3FFF" } : {}}
    >
      <Icon className="h-[17px] w-[17px] shrink-0" />
      {sidebarOpen && <span className="text-sm">{label}</span>}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile by default, slides in as overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen
            ? "w-56 sm:w-64 translate-x-0"
            : "w-0 -translate-x-full md:w-20 md:translate-x-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Header */}
        <div className="flex flex-col gap-6 px-3 pt-5 pb-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="self-start p-2 mb-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <RiMenuFold2Line className="text-xl sm:text-2xl" />
          </button>
          <img
            src="/LogoSqu.png"
            alt="My Pocket Consultant"
            className="w-24 sm:w-32 h-auto mx-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Main Menu */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={pathname === item.href}
              />
            ))}
          </div>

          {/* Modules Section */}
          <div>
            {sidebarOpen && (
              <h3 className="px-3 py-2 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Modules
              </h3>
            )}
            <div className="space-y-1">
              {modules.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          {sidebarOpen && <div className="border-t border-gray-200" />}

          {/* Settings Section */}
          <div>
            {sidebarOpen && (
              <h3 className="px-3 py-2 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
            )}
            <div className="space-y-1">
              {settings.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content — always full width on mobile */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar for mobile */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
          <span className="text-xs font-semibold text-gray-900">MyPocket</span>
        </div>

        {/* Page content */}
        <main
          className="flex-1 overflow-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </main>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 sm:px-6 sm:py-4">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            My Pocket Consultant v 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
