"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Maximize2, Minimize2, Play, Pause } from "lucide-react";
import Image from "next/image";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  title?: string;
  description?: string;
}

export default function MediaModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  title,
  description,
}: MediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && mediaType === "VIDEO" && videoRef.current) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "m" && mediaType === "VIDEO" && videoRef.current) {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" && mediaType === "VIDEO" && videoRef.current) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mediaType, onClose]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && mediaType === "VIDEO" && videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(true);
      setCurrentTime(0);
    }
  }, [isOpen, mediaType]);

  // Check if video has audio track
  useEffect(() => {
    if (mediaType === "VIDEO" && videoRef.current) {
      const video = videoRef.current;
      const checkAudio = () => {
        // Check if video has audio tracks
        const videoElement = video as any;
        const hasAudioTracks = videoElement.mozHasAudio || 
          (videoElement.webkitAudioDecodedByteCount > 0) ||
          (videoElement.audioTracks && videoElement.audioTracks.length > 0);
        setHasAudio(hasAudioTracks !== false);
      };

      video.addEventListener("loadedmetadata", checkAudio);
      video.addEventListener("canplay", checkAudio);
      
      return () => {
        video.removeEventListener("loadedmetadata", checkAudio);
        video.removeEventListener("canplay", checkAudio);
      };
    }
  }, [mediaType, mediaUrl]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoRef.current.currentTime = percentage * duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0  bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors group"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Media Container */}
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {mediaType === "IMAGE" ? (
            <div className="relative w-full min-w-0 h-full min-h-[50vh] flex items-center justify-center">
              <Image
                src={mediaUrl}
                alt={title || "Gallery image"}
                fill
                className="object-contain rounded-lg"
                priority
              />
              {(title || description) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent rounded-b-lg">
                  {title && <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>}
                  {description && <p className="text-white/90 text-sm">{description}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
              <video
                ref={videoRef}
                src={mediaUrl}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                playsInline
              />

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Top Bar - Title and Fullscreen */}
                {(title || description) && (
                  <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/60 to-transparent">
                    {title && <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>}
                    {description && <p className="text-white/90 text-sm line-clamp-2">{description}</p>}
                  </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                  {/* Progress Bar */}
                  <div
                    className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full bg-green-500 rounded-full transition-all relative group-hover/progress:bg-green-400"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlayPause}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>

                    {/* Time Display */}
                    <div className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Mute/Unmute */}
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors relative"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                      {/* Sound Indicator */}
                      {hasAudio && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                      )}
                    </button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                      aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5 text-white" />
                      ) : (
                        <Maximize2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/80">
                  <div>Space: Play/Pause</div>
                  <div>M: Mute/Unmute</div>
                  <div>F: Fullscreen</div>
                  <div>Esc: Close</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
