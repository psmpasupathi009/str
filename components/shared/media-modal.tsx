"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Maximize2, Minimize2, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  title?: string;
  description?: string;
  // Navigation props
  currentIndex?: number;
  totalItems?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function MediaModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  title,
  description,
  currentIndex = 0,
  totalItems = 1,
  onPrevious,
  onNext,
}: MediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define toggle functions first
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
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
  }, [isFullscreen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
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
  }, [isOpen, mediaType, onClose, onPrevious, onNext, togglePlayPause, toggleMute, toggleFullscreen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset and auto-play video when modal opens or media changes
  useEffect(() => {
    if (!isOpen) {
      // Pause and reset when modal closes
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    if (mediaType === "VIDEO" && videoRef.current) {
      const video = videoRef.current;
      
      // Reset video state when media URL changes
      video.currentTime = 0;
      setIsPlaying(false);
      setIsMuted(true);
      setCurrentTime(0);
      
      // Check if video URL is valid
      if (!mediaUrl || mediaUrl.trim() === '') {
        console.error("Invalid video URL:", mediaUrl);
        return;
      }

      // Set video source attributes for better compatibility
      video.setAttribute('crossorigin', 'anonymous');
      video.setAttribute('preload', 'auto');
      
      // Load the new video source
      video.load();
      
      // Wait for video to be ready
      const handleCanPlay = () => {
        if (video && isOpen && !isPlaying) {
          // Auto-play video when modal opens (muted initially for autoplay policy)
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                console.log("Video started playing:", mediaUrl);
              })
              .catch((error) => {
                console.warn("Video autoplay failed (user interaction may be required):", error);
                // Video will play when user clicks play button
                setIsPlaying(false);
              });
          }
        }
      };

      // Try multiple times to ensure video loads
      video.addEventListener("canplay", handleCanPlay, { once: true });
      video.addEventListener("loadeddata", handleCanPlay, { once: true });
      video.addEventListener("canplaythrough", handleCanPlay, { once: true });
      
      // Fallback timeout
      const timer = setTimeout(() => {
        if (video && isOpen && video.readyState >= 2 && !isPlaying) {
          handleCanPlay();
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleCanPlay);
        video.removeEventListener("canplaythrough", handleCanPlay);
      };
    }
  }, [isOpen, mediaType, mediaUrl, isPlaying]);

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
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="fixed top-4 right-4 z-[101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors group"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Navigation Arrows - Left */}
        {totalItems > 1 && onPrevious && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Navigation Arrows - Right */}
        {totalItems > 1 && onNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[101] w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Item Counter */}
        {totalItems > 1 && (
          <div className="fixed top-4 left-4 z-[101] px-2 py-1 sm:px-3 sm:py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium">
            {currentIndex + 1} / {totalItems}
          </div>
        )}

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
            <div className="relative w-full min-w-0 h-full min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center">
              <Image
                src={mediaUrl}
                alt={title || "Gallery image"}
                fill
                className="object-contain rounded-lg"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              />
              {(title || description) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent rounded-b-lg">
                  {title && <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>}
                  {description && <p className="text-white/90 text-sm">{description}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[60vh] sm:min-h-[70vh] bg-black rounded-lg overflow-hidden group">
              {/* Video Error Message */}
              {videoRef.current?.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                  <div className="text-center p-4 sm:p-6 max-w-md mx-auto">
                    <p className="text-white text-base sm:text-lg font-semibold mb-2">Video Error</p>
                    <p className="text-white/80 text-xs sm:text-sm mb-4">
                      {videoRef.current.error.code === videoRef.current.error.MEDIA_ERR_NETWORK
                        ? "Network error. Please check the video URL and CORS settings."
                        : videoRef.current.error.code === videoRef.current.error.MEDIA_ERR_SRC_NOT_SUPPORTED
                        ? "Video format not supported or source not found."
                        : "Unable to play video. Please try again."}
                    </p>
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.load();
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                src={mediaUrl}
                className="w-full h-full object-contain"
                style={{ maxHeight: '90vh' }}
                onPlay={() => {
                  setIsPlaying(true);
                  console.log("Video is playing");
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  handleLoadedMetadata();
                  // Try to play after metadata loads
                  if (videoRef.current && isOpen && !isPlaying) {
                    videoRef.current.play().catch((err) => {
                      console.warn("Auto-play after metadata load failed:", err);
                    });
                  }
                }}
                onLoadedData={() => {
                  // Try to play when data is loaded
                  if (videoRef.current && isOpen && !isPlaying) {
                    videoRef.current.play().catch((err) => {
                      console.warn("Auto-play after data load failed:", err);
                    });
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
                onError={(e) => {
                  const video = e.currentTarget;
                  const error = video.error;
                  if (error) {
                    let errorMsg = "Unknown error";
                    switch (error.code) {
                      case error.MEDIA_ERR_ABORTED:
                        errorMsg = "Video loading aborted";
                        break;
                      case error.MEDIA_ERR_NETWORK:
                        errorMsg = "Network error - check video URL and CORS settings";
                        break;
                      case error.MEDIA_ERR_DECODE:
                        errorMsg = "Video decode error - format may not be supported";
                        break;
                      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMsg = "Video format not supported or source not found";
                        break;
                    }
                    console.error("Video error:", errorMsg, "Code:", error.code, "URL:", mediaUrl);
                  } else {
                    console.error("Video error (unknown):", e, "URL:", mediaUrl);
                  }
                }}
                onCanPlay={() => {
                  // Try to play when video can play
                  if (videoRef.current && isOpen && !isPlaying) {
                    videoRef.current.play().catch((err) => {
                      console.warn("Auto-play on canPlay failed:", err);
                    });
                  }
                }}
                onWaiting={() => {
                  console.log("Video is waiting for data");
                }}
                onStalled={() => {
                  console.warn("Video stalled - network issue?");
                }}
                crossOrigin="anonymous"
                muted={isMuted}
                playsInline
                controls={false}
                preload="auto"
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
