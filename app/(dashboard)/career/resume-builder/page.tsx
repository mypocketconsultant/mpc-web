'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/app/components/header';
import AIEditSidebar from '../components/AIEditSidebar';
import ResumeForm from '../components/ResumeForm';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

export default function ResumeBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'user',
      content: 'Run a 10-sec scan of my Resume',
      file: {
        name: 'Remi Ladi Resume.pdf',
        size: '55kb'
      }
    },
    {
      id: '2',
      type: 'assistant',
      content: "Here's your updated Resume."
    }
  ]);

  const getTitleFromPath = (path: string) => {
    if (path.includes('/resume-builder')) return 'Resume Builder';
    if (path.includes('/career')) return 'Career Advisory';
    return 'My Pocket Consultant';
  };

  const handleNext = () => {
    console.log('Resume completed');
  };

  const handleSend = (message: string) => {
    setMessages([...messages, {
      id: Date.now().toString(),
      type: 'user',
      content: message
    }]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Resume Builder
          </Link>

          <hr className="my-10" />

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Edit with AI */}
            <div className="col-span-5 sticky top-10 h-fit">
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

            {/* Right Side - Form */}
            <div className="col-span-7">
              <ResumeForm
                onNext={handleNext}
                onClose={() => router.back()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
