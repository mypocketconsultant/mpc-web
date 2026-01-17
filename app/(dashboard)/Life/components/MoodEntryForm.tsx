import React, { useState, useRef } from 'react';
import { X, Mic, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api/apiService';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function MoodEntryForm() {
  const router = useRouter();
  const [overallMood, setOverallMood] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const moodEmojis = ["😰", "😟", "😕", "😐", "🙂", "😊", "🤗", "😍", "✨"];

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${dayNames[now.getDay()]}, ${now.getDate()}. ${monthNames[now.getMonth()]}`;
  const formattedTime = now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      streamRef.current = stream;

      // Log audio tracks info
      const audioTracks = stream.getAudioTracks();
      console.log('[MoodEntryForm] Audio tracks:', audioTracks.length);
      audioTracks.forEach((track, i) => {
        console.log(`[MoodEntryForm] Track ${i}:`, track.label, track.readyState, track.enabled, track.getSettings());
      });

      // Test if audio is actually flowing using AudioContext
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Configure analyser for high sensitivity
      analyser.fftSize = 2048;
      analyser.minDecibels = -90; // Very sensitive to quiet sounds
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.85;

      // Check audio levels using time domain data (more sensitive than frequency)
      const timeDomainData = new Uint8Array(analyser.fftSize);
      setTimeout(() => {
        analyser.getByteTimeDomainData(timeDomainData);
        // Check for any deviation from silence (128 = silence in time domain)
        const maxDeviation = timeDomainData.reduce((max, val) => Math.max(max, Math.abs(val - 128)), 0);
        console.log('[MoodEntryForm] Audio level check:', maxDeviation > 1 ? 'Audio detected' : 'No audio', 'maxDeviation:', maxDeviation);
      }, 500);

      // Let browser pick the best supported mimeType
      let mimeType: string | undefined;
      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      console.log('[MoodEntryForm] Selected mimeType:', mimeType || 'default');

      // Create MediaRecorder - try without options if mimeType fails
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch (e) {
        console.warn('[MoodEntryForm] Failed with mimeType, trying default:', e);
        mediaRecorder = new MediaRecorder(stream);
      }

      console.log('[MoodEntryForm] MediaRecorder created, mimeType:', mediaRecorder.mimeType);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('[MoodEntryForm] ondataavailable, size:', event.data.size, 'type:', event.data.type);
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onerror = (event) => {
        console.error('[MoodEntryForm] MediaRecorder error:', event);
      };

      mediaRecorder.onstop = async () => {
        console.log('[MoodEntryForm] Recording stopped, chunks:', audioChunksRef.current.length);
        const totalSize = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
        console.log('[MoodEntryForm] Total chunks size:', totalSize);

        const recordedMimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        console.log('[MoodEntryForm] Blob size:', audioBlob.size, 'type:', audioBlob.type);

        // Stop all tracks and close audio context
        audioContext.close();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioBlob.size > 100) {
          await transcribeAudio(audioBlob);
        } else {
          console.error('[MoodEntryForm] Audio too small, likely empty recording');
          setIsTranscribing(false);
        }
      };

      // Start recording without timeslice - data available on stop
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      console.log('[MoodEntryForm] Recording started, state:', mediaRecorder.state);
    } catch (error) {
      console.error('[MoodEntryForm] Microphone access error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('[MoodEntryForm] Stopping recorder, state:', mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await apiService.post<{ data: { text: string; model: string } }>(
        '/v1/life/stt/transcribe',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setJournalText(response.data.text);
    } catch (error) {
      console.error('[MoodEntryForm] Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToast({ id, type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!journalText.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.post('/v1/life/journals', {
        entry_type: 'mood',
        text: journalText,
        mood: `${overallMood}/10`,
        energy_level: `${energyLevel}/10`,
        tags: ['MOOD'],
      });

      showToast('success', 'Mood entry saved successfully!');

      // Clear form
      setJournalText("");
      setOverallMood(1);
      setEnergyLevel(1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save mood entry';
      showToast('error', errorMessage);
      console.error('[MoodEntryForm] Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start w-full">
      <div className=" bg-white rounded-3xl w-full max-w-[600px] shadow-xs border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6  border-gray-100">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Publish'}
          </button>
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-medium text-black mb-8 font-sans">
            How are you feeling today?
          </h1>

          {/* Overall Mood Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-gray-700">
                Overall Mood
              </label>
              <span className="text-base font-bold text-red-500">
                {overallMood}/10
              </span>
            </div>

            {/* Emoji Row */}
            <div className="flex justify-center items-center mb-4 px-1  rounded-lg">
              {moodEmojis.map((emoji, index) => {
                const moodValue = index + 1;
                const isActive = overallMood === moodValue;
                const isNearActive = Math.abs(overallMood - moodValue) <= 1;
                
                return (
                  <button
                    key={index}
                    onClick={() => setOverallMood(moodValue)}
                    className={`text-3xl transition-all duration-200 ${
                      isActive
                        ? "scale-125 opacity-100"
                        : isNearActive
                        ? "scale-100 opacity-70"
                        : "scale-90 opacity-40"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            {/* Mood Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={overallMood}
                onChange={(e) => setOverallMood(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #FCA5A5 0%, 
                    #FDBA74 20%,
                    #FCD34D 40%,
                    #BEF264 60%,
                    #86EFAC 80%,
                    #6EE7B7 100%)`,
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #EF4444;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #EF4444;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Energy Levels Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-gray-700">
                Energy Levels
              </label>
              <span className="text-base font-bold text-red-500">
                {energyLevel}/10 ⚡
              </span>
            </div>

            {/* Energy Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    #BFDBFE 0%,
                    #A5B4FC 33%,
                    #C4B5FD 66%,
                    #DDD6FE 100%)`,
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #312E81;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input[type="range"]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #312E81;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Journal Entry */}
          <div className="mb-6 relative">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Tell me in your own words"
              className="w-full h-35 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none pr-14"
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`absolute right-9 top-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start recording'}
            >
              <Mic className="w-6 h-6 text-white" />
            </button>
            {isRecording && (
              <div className="absolute right-24 top-3 flex items-center gap-2">
                <span className="text-xs font-medium text-red-600">Recording...</span>
              </div>
            )}
            {isTranscribing && (
              <div className="absolute right-24 top-3 flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-600">Transcribing...</span>
              </div>
            )}
          </div>

          {/* Date and Tags Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formattedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Tags */}
            {/* <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                INTERVIEW
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                CAREER
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium uppercase">
                DESIGN
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in" style={{
          backgroundColor: toast.type === 'success' ? '#D1FAE5' : '#FEE2E2',
        }}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span style={{ color: toast.type === 'success' ? '#065F46' : '#7F1D1D' }} className="text-sm font-medium">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}