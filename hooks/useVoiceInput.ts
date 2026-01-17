"use client";

import { useState, useRef, useCallback } from 'react';
import { apiService } from '@/lib/api/apiService';

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log('[useVoiceInput] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('[useVoiceInput] Recording started');
    } catch (error) {
      console.error('[useVoiceInput] Failed to start recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No recording in progress'));
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        console.log('[useVoiceInput] Recording stopped, transcribing...');

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          console.log('[useVoiceInput] Sending to /v1/life/stt/transcribe');
          const response: any = await apiService.post('/v1/life/stt/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          console.log('[useVoiceInput] Transcription response:', response);
          const text = response?.data?.text || response?.data?.data?.text || '';

          resolve(text);
        } catch (error) {
          console.error('[useVoiceInput] Transcription failed:', error);
          reject(error);
        } finally {
          setIsTranscribing(false);
          // Stop all audio tracks to release microphone
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const toggleRecording = useCallback(async (onTranscribed: (text: string) => void) => {
    if (isRecording) {
      try {
        const text = await stopRecording();
        if (text) {
          onTranscribed(text);
        }
      } catch (error) {
        console.error('[useVoiceInput] Error stopping recording:', error);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('[useVoiceInput] Error starting recording:', error);
      }
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    toggleRecording,
    startRecording,
    stopRecording,
  };
}
