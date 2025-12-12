import React from "react";
import Link from "next/link";
import Image from "next/image";
import DailyTips from "./DailyTips";

export interface QuickLink {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

interface DailyTip {
  title: string;
  description: string;
}

interface QuickLinksSectionProps {
  quickLinks: QuickLink[];
  dailyTip: DailyTip;
  tipsIcon: any;
}

export default function QuickLinksSection({
  quickLinks,
  dailyTip,
  tipsIcon,
}: QuickLinksSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick links</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Links Grid - Left Side (2 cols) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`group relative shadow-lg overflow-hidden rounded-2xl p-6 text-gray-900 transition-all hover:shadow-lg hover:scale-105 active:scale-95 bg-gradient-to-br min-h-[130px] flex flex-col justify-between ${link.color}`}
              >
                <div className="flex items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/30 backdrop-blur-sm">
                    {link.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-base">{link.title}</h3>
                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Tips Card - Right Side */}
        <DailyTips dailyTip={dailyTip} tipsIcon={tipsIcon} />
      </div>
    </section>
  );
}
