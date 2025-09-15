import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  MessageSquare,
  Brain,
  Volume2,
  Loader2,
  X,
  Settings,
  Activity,
  Database
} from 'lucide-react';

// Voice Agent Widget Component
const VoiceAgentWidget: React.FC = () => {
  const { profile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Only render for admin users
  if (!profile || profile.role !== 'admin') {
    return null;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceQuery(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const processVoiceQuery = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Get current session token
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:8000/voice-query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get audio response
      const audioResponse = await response.blob();
      const audioUrl = URL.createObjectURL(audioResponse);
      setAudioUrl(audioUrl);
      
      // Auto-play the response
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
      
      toast({
        title: "Query Processed",
        description: "Voice query processed successfully. Playing response...",
      });
      
    } catch (error) {
      console.error('Error processing voice query:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextQuery = async () => {
    if (!textQuery.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/text-query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textQuery }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Query Result",
        description: `Query processed: ${result.query}`,
      });
      
      console.log('Text query result:', result);
      
    } catch (error) {
      console.error('Error processing text query:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process text query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setTextQuery('');
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                size="sm"
              >
                <div className="relative">
                  <Brain className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="font-medium">AI Voice Assistant</p>
              <p className="text-xs opacity-80">Ask questions about your data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Voice Agent Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle>AI Voice Assistant</DialogTitle>
                  <DialogDescription>
                    Ask questions about your construction data using voice or text
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Admin Only
              </Badge>
            </div>
          </DialogHeader>

          <CardContent className="space-y-6 p-6 pt-0">
            {/* Status Indicators */}
            <div className="flex items-center justify-center space-x-4 py-2">
              <div className={`flex items-center space-x-2 ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                <Activity className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">
                  {isRecording ? `Recording ${formatTime(recordingTime)}` : 'Ready'}
                </span>
              </div>
              
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-3">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="h-16 w-16 rounded-full bg-gray-500 hover:bg-gray-600 text-white shadow-lg"
                    >
                      <MicOff className="h-6 w-6" />
                    </Button>
                  )}
                  
                  {audioUrl && (
                    <Button
                      onClick={togglePlayback}
                      variant="outline"
                      className="h-16 w-16 rounded-full"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {isRecording 
                    ? "Recording your question... Click to stop"
                    : "Click the microphone to start recording your question"
                  }
                </p>
              </div>

              {/* Text Input Option */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Or type your question</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTextInput(!showTextInput)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showTextInput ? 'Hide' : 'Show'} Text Input
                  </Button>
                </div>
                
                {showTextInput && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your question about projects, equipment, inventory, or tasks..."
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={processTextQuery}
                      disabled={!textQuery.trim() || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      Process Query
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Player (Hidden) */}
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              hidden
            />

            {/* Example Questions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Example Questions:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div>"Show me all active projects"</div>
                <div>"How much equipment is checked out?"</div>
                <div>"What tasks are overdue?"</div>
                <div>"List inventory items below minimum stock"</div>
              </div>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceAgentWidget;
