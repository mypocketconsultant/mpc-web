import React from "react";
import Link from "next/link";
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
  tipsTitle?: string;
}

export default function QuickLinksSection({
  quickLinks,
  dailyTip,
  tipsIcon,
  tipsTitle,
}: QuickLinksSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick links</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-8">
        {/* Quick Links Grid - Left Side (2 cols) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`group relative shadow-md overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex flex-col justify-between min-h-[140px] ${link.color}`}
              >
                <div className="flex items-start z-10 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    {link.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-white text-base leading-snug z-10 w-[80%]">
                  {link.title.split(" ").map((word, i) => (
                    <React.Fragment key={i}>
                      {word} {word === "Business" && i === 1 ? <br /> : ""}
                      {word === "SWOT" ? <br /> : ""}
                    </React.Fragment>
                  ))}
                </h3>
                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-3xl z-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Tips Card - Right Side */}
        <DailyTips dailyTip={dailyTip} tipsIcon={tipsIcon} title={tipsTitle} />
      </div>
    </section>
  );
}
