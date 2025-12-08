"use client"
import { RiMenuFold2Line } from "react-icons/ri";
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Wrench, label: "Tools", href: "/tools" },
  ]

  const modules = [
    { icon: LifeBuoy, label: "Life Advisor", href: "/modules/life-advisor" },
    { icon: Briefcase, label: "Career Consulting", href: "/career" },
    { icon: Users, label: "Business Consultancy", href: "/modules/business-consultancy" },
    { icon: BookOpen, label: "Study Support", href: "/modules/study-support" },
    { icon: DollarSign, label: "Financial Literacy", href: "/modules/financial-literacy" },
    { icon: Heart, label: "Faith (opt-in)", href: "/modules/faith" },
    { icon: Target, label: "Social Impact", href: "/modules/social-impact" },
  ]

  const settings = [
    { icon: Users, label: "User", href: "/settings/user" },
    { icon: Settings, label: "Security", href: "/settings/security" },
    { icon: DollarSign, label: "Pricing", href: "/settings/pricing" },
    { icon: HelpCircle, label: "Help Center", href: "/settings/help" },
  ]

  const NavLink = ({ icon: Icon, label, href, active = false }: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-4 rounded-full transition-all font-medium ${
        active
          ? "bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      style={active ? { backgroundColor: '#5A3FFF' } : {}}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm">{label}</span>
    </Link>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Header */}
        <div className="flex flex-col gap-8 px-4 pt-6 pb-2">
          <button className="self-start p-2 mb-2" aria-label="Menu">
            {/* Hamburger icon SVG */}
         <RiMenuFold2Line className="text-2xl" />
          </button>
          <img src="/LogoSqu.png" alt="My Pocket Consultant" className="w-32 h-auto mx-auto" />
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-6">
          {/* Main Menu */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </div>

          {/* Modules Section */}
          <div>
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Modules
            </h3>
            <div className="space-y-2">
              {modules.map((item) => (
                <NavLink key={item.href} {...item} active={pathname === item.href} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Settings Section */}
          <div>
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </h3>
            <div className="space-y-2">
              {settings.map((item) => (
                <NavLink key={item.href} {...item} active={pathname === item.href} />
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-gray-900">MyPocket</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {children}
        </main>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <h1 className="text-center text-sm text-gray-600">My Pocket Consultant v 1.0</h1>
        </div>
      </div>
    </div>
  )
}
