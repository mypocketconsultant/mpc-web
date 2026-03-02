"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import PlannerCalendar, {
  DayData,
  DayEntry,
} from "../components/PlannerCalendar";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

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

interface JournalEntry {
  id: string;
  entry_type: string;
  mood: string | null;
  energy_level: string | null;
  text: string;
  tags: string[];
  created_at: string;
}

export default function LifePlannerPage() {
  const router = useRouter();
  const [goalEvents, setGoalEvents] = useState<DayData[]>([]);
  const [moodEvents, setMoodEvents] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mood" | "goal">("goal");
  const { toast, showToast } = useToast();

  const handleEntryClick = (entryId: string, type?: "mood" | "goal") => {
    if (type === "mood") {
      router.push("/Life/mood-entry");
    } else {
      sessionStorage.setItem("currentGoalPlanId", entryId);
      router.push("/Life/new-goal");
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response: any = await apiService.get("/v1/life/plans");

        // Extract plans from response - handle nested data structure
        let plans: Plan[] = response?.data?.items || response?.items || [];
        if (!Array.isArray(plans)) {
          plans = [];
        }

        // Transform plans to calendar events grouped by date
        const calendarEvents = transformPlansToCalendarEvents(plans);
        setGoalEvents(calendarEvents);
      } catch (error) {
        showToast("error", "Failed to load plans");
        setGoalEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [showToast]);

  useEffect(() => {
    const fetchMoodEntries = async () => {
      try {
        const response: any = await apiService.get("/v1/life/journals?limit=100");
        let items: JournalEntry[] = response?.data?.items || response?.items || [];
        if (!Array.isArray(items)) items = [];

        // Filter to only mood entries
        const moodEntries = items.filter(
          (item) => item.entry_type === "mood"
        );
        const calendarEvents = transformMoodToCalendarEvents(moodEntries);
        setMoodEvents(calendarEvents);
      } catch (error) {
        console.error("[Planner] Failed to load mood entries:", error);
      }
    };
    fetchMoodEntries();
  }, []);

  const transformPlansToCalendarEvents = (plans: Plan[]): DayData[] => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group plans by date
    const groupedByDate: Record<string, { date: Date; entries: DayEntry[] }> =
      {};

    plans.forEach((plan, index) => {
      const createdDate = new Date(plan.created_at);
      const dateKey = createdDate.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: createdDate,
          entries: [],
        };
      }

      const entry: DayEntry = {
        id: index + 1,
        planId: plan.id,
        title: plan.goal || plan.name || "Untitled Plan",
        time: createdDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        description: plan.steps?.[0]?.description || `${plan.horizon} plan`,
        type: "goal",
        leftBorder:
          plan.status === "active"
            ? "border-l-4 border-l-indigo-400"
            : "border-l-4 border-l-gray-400",
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

  const transformMoodToCalendarEvents = (
    entries: JournalEntry[]
  ): DayData[] => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupedByDate: Record<string, { date: Date; entries: DayEntry[] }> =
      {};

    entries.forEach((entry, index) => {
      const createdDate = new Date(entry.created_at);
      const dateKey = createdDate.toISOString().split("T")[0];

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: createdDate, entries: [] };
      }

      const moodValue = entry.mood ? entry.mood.split("/")[0] : "?";
      const energyValue = entry.energy_level
        ? entry.energy_level.split("/")[0]
        : "?";

      const dayEntry: DayEntry = {
        id: index + 1,
        planId: entry.id,
        title: `Mood: ${moodValue}/10 | Energy: ${energyValue}/10`,
        time: createdDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        description: entry.text || "No journal text",
        type: "mood",
        leftBorder: "border-l-4 border-l-pink-400",
      };

      groupedByDate[dateKey].entries.push(dayEntry);
    });

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
                events={activeTab === "goal" ? goalEvents : moodEvents}
                isLoading={isLoading}
                onEntryClick={handleEntryClick}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
