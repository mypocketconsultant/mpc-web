"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import PlannerCalendar, { DayData, DayEntry } from "../components/PlannerCalendar";
import { apiService } from "@/lib/api/apiService";

interface Plan {
  id: string;
  goal: string;
  name?: string;
  horizon: string;
  domains: string[];
  steps: Array<{
    title: string;
    description?: string;
    order?: number;
    due_date?: string;
  }>;
  status: string;
  created_at: string;
  updated_at?: string;
}

export default function LifePlannerPage() {
  const router = useRouter();
  const [events, setEvents] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleEntryClick = (planId: string) => {
    console.log('[LifePlannerPage] Navigating to edit plan:', planId);
    sessionStorage.setItem('currentGoalPlanId', planId);
    router.push('/Life/new-goal');
  };

  useEffect(() => {
    const fetchPlans = async () => {
      console.log('[LifePlannerPage] Fetching plans...');
      try {
        const response: any = await apiService.get('/v1/life/plans');
        console.log('[LifePlannerPage] Raw response:', response);

        // Extract plans from response - handle nested data structure
        let plans: Plan[] = response?.data?.items || response?.items || [];
        if (!Array.isArray(plans)) {
          plans = [];
        }

        console.log('[LifePlannerPage] Plans fetched:', plans.length, 'items');

        // Transform plans to calendar events grouped by date
        const calendarEvents = transformPlansToCalendarEvents(plans);
        setEvents(calendarEvents);
      } catch (error) {
        console.error('[LifePlannerPage] Failed to fetch plans:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const transformPlansToCalendarEvents = (plans: Plan[]): DayData[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group plans by date
    const groupedByDate: Record<string, { date: Date; entries: DayEntry[] }> = {};

    plans.forEach((plan, index) => {
      const createdDate = new Date(plan.created_at);
      const dateKey = createdDate.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: createdDate,
          entries: [],
        };
      }

      const entry: DayEntry = {
        id: index + 1,
        planId: plan.id,
        title: plan.goal || plan.name || 'Untitled Plan',
        time: createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: plan.steps?.[0]?.description || `${plan.horizon} plan`,
        type: 'goal',
        leftBorder: plan.status === 'active' ? 'border-l-4 border-l-indigo-400' : 'border-l-4 border-l-gray-400',
      };

      groupedByDate[dateKey].entries.push(entry);
    });

    // Convert to array and sort by date
    const sortedDates = Object.keys(groupedByDate).sort();

    return sortedDates.map((dateKey, index) => {
      const { date, entries } = groupedByDate[dateKey];
      const dayDate = new Date(date);
      dayDate.setHours(0, 0, 0, 0);

      return {
        id: index + 1,
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        day: String(date.getDate()),
        isToday: dayDate.getTime() === today.getTime(),
        entries,
      };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Life Planner" />

      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1300px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner</span>
            </button>
          </Link>

          <div className="gap-2">
            {/* Right Column - Calendar - Full Width */}
            <div className="lg:col-span-2">
              <PlannerCalendar
                events={events}
                isLoading={isLoading}
                onEntryClick={handleEntryClick}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}