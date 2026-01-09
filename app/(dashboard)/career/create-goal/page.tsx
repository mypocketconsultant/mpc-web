"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { apiService } from "@/lib/api/apiService";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/AIEditSidebar";
import CreateGoalForm from "../components/CreateGoalForm";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

export default function CreateGoalPage() {
  const pathname = usePathname();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00 am");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'user',
      content: 'Help me create a goal for this week',
    },
    {
      id: '2',
      type: 'assistant',
      content: "I can help you create an actionable goal. What would you like to focus on?"
    }
  ]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/create-goal")) return "Create New Goal";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      return;
    }

    // Build reminder schedule string
    let reminderScheduleString = "none";
    if (reminderEnabled) {
      if (selectedDate) {
        // Convert time from "HH:mm am/pm" format to 24-hour "HH:mm" format
        let time24hr = selectedTime;
        if (selectedTime) {
          const timeParts = selectedTime.toLowerCase().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
          if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = timeParts[2];
            const meridiem = timeParts[3];

            if (meridiem) {
              if (meridiem === "pm" && hours !== 12) {
                hours += 12;
              } else if (meridiem === "am" && hours === 12) {
                hours = 0;
              }
            }

            time24hr = `${String(hours).padStart(2, "0")}:${minutes}`;
          }
        } else {
          time24hr = "00:00";
        }
        reminderScheduleString = `${selectedDate} ${time24hr}`;
      } else {
        reminderScheduleString = "none";
      }
    }

    const message = `Goal: ${goalTitle}\nDescription: ${goalDescription}\nreminderSchedule: ${reminderScheduleString}`;

    const payload = {
      message,
      intent: "planner_create",
      session_id: `goal-${Date.now()}`,
    };

    console.log("[Frontend → mpc-api] Payload:", JSON.stringify(payload, null, 2));

    setIsLoading(true);

    try {
      const response : any = await apiService.post("/v1/career/goal", payload);

      if (response?.data?.message) {
        setMessages([...messages, {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.data.message
        }]);
      }

      // Store plan_id in localStorage
      if (response?.data?.plan_id) {
        localStorage.setItem("currentGoalId", response.data.plan_id);
      }

      // Clear form on success
      setGoalTitle('');
      setGoalDescription('');
      setSelectedDate('');
    } catch (error) {
      console.error('[handleCreateGoal] Error:', error);
      setMessages([...messages, {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Failed to create goal. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career/create-plan"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Career Planner
          </Link>

          <hr  className="my-10" />

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - AI Editor */}
            <div className="col-span-5 sticky top-8 h-fit">
              <AIEditSidebar
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={(msg) => {
                  setMessages([...messages, {
                    id: Date.now().toString(),
                    type: 'user',
                    content: msg
                  }]);
                  setInputValue('');
                }}
              />
            </div>
            {/* Right Content - Form */}
            <div className="col-span-7">
              <CreateGoalForm
                goalTitle={goalTitle}
                onTitleChange={setGoalTitle}
                goalDescription={goalDescription}
                onDescriptionChange={setGoalDescription}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                reminderEnabled={reminderEnabled}
                onReminderChange={setReminderEnabled}
                onCreateGoal={handleCreateGoal}
                onClose={() => window.location.href = "/career/create-plan"}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
