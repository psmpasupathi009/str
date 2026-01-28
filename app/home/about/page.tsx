"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Play,
  Heart,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import MediaModal from "@/components/shared/media-modal";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS_PER_PAGE = 6;

const FEATURES: { icon: LucideIcon; title: string; desc: string; color: string }[] = [
  { 
    icon: Award, 
    title: "Premium Quality", 
    desc: "Finest ingredients sourced from trusted suppliers",
    color: "from-amber-400 to-amber-600"
  },
  { 
    icon: Users, 
    title: "Trusted Brand", 
    desc: "Loved by thousands of satisfied customers",
    color: "from-green-400 to-green-600"
  },
  { 
    icon: Heart, 
    title: "Made with Love", 
    desc: "Traditional recipes passed down through generations",
    color: "from-pink-400 to-pink-600"
  },
  { 
    icon: CheckCircle2, 
    title: "100% Natural", 
    desc: "No artificial preservatives or additives",
    color: "from-blue-400 to-blue-600"
  },
];

interface GalleryItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  order: number;
}

async function fetchGallery(): Promise<GalleryItem[]> {
  try {
    const res = await fetch("/api/gallery", { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Gallery API error:", res.status, errorData);
      return [];
    }
    
    const data = await res.json();
    console.log("Gallery API response:", data);
    
    // Handle different response structures
    let items: GalleryItem[] = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data.gallery && Array.isArray(data.gallery)) {
      items = data.gallery;
    } else if (data.items && Array.isArray(data.items)) {
      items = data.items;
    }
    
    // Validate and filter items
    items = items
      .filter((item: any) => {
        // Ensure item has required fields
        return item && 
               item.id && 
               item.url && 
               (item.type === "IMAGE" || item.type === "VIDEO");
      })
      .map((item: any) => ({
        id: String(item.id),
        url: String(item.url),
        type: item.type as "IMAGE" | "VIDEO",
        title: item.title || null,
        description: item.description || null,
        order: typeof item.order === 'number' ? item.order : (item.order ? parseInt(item.order) : 0),
      }));
    
    // Sort by order
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    
    console.log(`Loaded ${items.length} gallery items`);
    return items;
  } catch (error: any) {
    console.error("Error fetching gallery:", error);
    console.error("Error details:", error.message, error.stack);
    return [];
  }
}

export default function AboutPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadGallery = async () => {
      try {
        const items = await fetchGallery();
        if (mounted) {
          setGallery(items);
          console.log("Gallery state updated with", items.length, "items");
        }
      } catch (error) {
        console.error("Failed to load gallery:", error);
        if (mounted) {
          setGallery([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadGallery();
    
    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(gallery.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(
    () => gallery.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE),
    [gallery, page]
  );

  const goNext = useCallback(() => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  }, [totalPages]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const openMedia = useCallback(
    (item: GalleryItem) => {
      const index = gallery.findIndex((g) => g.id === item.id);
      if (index !== -1) {
        console.log("Opening media modal for:", item, "at index:", index);
        setSelectedMediaIndex(index);
      }
    },
    [gallery]
  );

  const currentMedia = useMemo(() => {
    if (selectedMediaIndex === null || selectedMediaIndex < 0 || selectedMediaIndex >= gallery.length) {
      return null;
    }
    const item = gallery[selectedMediaIndex];
    return {
      url: item.url,
      type: item.type,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
    };
  }, [selectedMediaIndex, gallery]);

  const navigateToPrevious = useCallback(() => {
    if (selectedMediaIndex === null) return;
    const newIndex = selectedMediaIndex > 0 ? selectedMediaIndex - 1 : gallery.length - 1;
    setSelectedMediaIndex(newIndex);
  }, [selectedMediaIndex, gallery.length]);

  const navigateToNext = useCallback(() => {
    if (selectedMediaIndex === null) return;
    const newIndex = selectedMediaIndex < gallery.length - 1 ? selectedMediaIndex + 1 : 0;
    setSelectedMediaIndex(newIndex);
  }, [selectedMediaIndex, gallery.length]);

  const closeMedia = useCallback(() => {
    setSelectedMediaIndex(null);
  }, []);

  const onImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 text-slate-900 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-12">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-transparent to-green-50/30" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 backdrop-blur-sm rounded-full mb-6 border border-green-200"
          >
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Premium Quality Products</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
            About STN Golden Healthy Foods
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
            Premium quality food products — oils, idly, masala powders & ready-to-eat items crafted with traditional recipes and trusted ingredients.
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Choose Us
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl group">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}
                    >
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Story
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 text-slate-700 leading-relaxed"
          >
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50/30">
              <CardContent className="p-6 sm:p-8">
                <p className="text-base sm:text-lg md:text-xl mb-4">
                  <span className="text-2xl font-bold text-green-600 mr-2">STN Golden Healthy Foods</span>
                  delivers premium cooking oils, idly mixes, masala powders, and ready-to-eat products. We focus on quality, taste, and trust in every pack.
                </p>
                <p className="text-base sm:text-lg text-slate-600">
                  We bring traditional recipes and trusted ingredients together so you can cook with confidence. Our range fits home kitchens and modern lifestyles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50/30 to-white">
              <CardContent className="p-6 sm:p-8">
                <p className="text-base sm:text-lg text-slate-700">
                  Explore our oils, masalas, and ready-to-eat options—crafted for flavour, consistency, and everyday goodness. Every product is made with care, ensuring you get the best quality for your family.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Product Gallery
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">Explore our product range and see what makes us special</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mt-4" />
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mb-4"
              />
              <p className="text-slate-600 text-sm">Loading gallery...</p>
            </div>
          ) : gallery.length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No gallery items yet.</p>
                <p className="text-slate-400 text-sm mt-2">Add them from the admin dashboard.</p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-xs text-slate-600 font-mono">
                      Debug Info:<br/>
                      Gallery items: {gallery.length}<br/>
                      Loading: {loading ? 'Yes' : 'No'}<br/>
                      Check browser console for API response
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-6 sm:mb-8 md:mb-10"
                >
                  {currentItems.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-slate-500">No items on this page</p>
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-slate-400 mt-2">
                          Total items: {gallery.length}, Page: {page + 1}, Items per page: {ITEMS_PER_PAGE}
                        </p>
                      )}
                    </div>
                  ) : (
                    currentItems.map((item, index) => {
                      // Validate item before rendering
                      if (!item || !item.id || !item.url) {
                        console.warn("Invalid gallery item:", item);
                        return null;
                      }
                      return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-green-200 shadow-md hover:shadow-2xl hover:border-green-400 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] w-full min-h-[150px] sm:min-h-[200px]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Opening media:", item);
                        openMedia(item);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openMedia(item);
                        }
                      }}
                    >
                      {item.type === "IMAGE" ? (
                        imageErrors.has(item.url) ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-slate-400" />
                          </div>
                        ) : (
                          <Image
                            src={item.url}
                            alt={item.title ?? "Gallery image"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            onError={() => {
                              console.error("Image failed to load:", item.url);
                              onImageError(item.url);
                            }}
                            unoptimized={item.url.startsWith('http') && !item.url.includes('cloudinary')}
                          />
                        )
                      ) : (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={item.url}
                            className="absolute inset-0 w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            loop
                            controls={false}
                            onMouseEnter={(e) => {
                              const video = e.currentTarget;
                              video.play().catch((err) => {
                                console.warn("Video autoplay failed:", err);
                              });
                            }}
                            onMouseLeave={(e) => {
                              const video = e.currentTarget;
                              video.pause();
                              video.currentTime = 0;
                            }}
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                            <motion.div 
                              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all ${hoveredItem === item.id ? 'scale-125' : 'scale-100'}`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 1.1 }}
                            >
                              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 ml-1" fill="currentColor" />
                            </motion.div>
                          </div>
                          {/* Video indicator badge */}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600/90 backdrop-blur-md rounded-full text-[10px] sm:text-xs text-white font-bold flex items-center gap-1 shadow-lg">
                            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">VIDEO</span>
                          </div>
                        </div>
                      )}

                      {/* Overlay with title/description - shows on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                          {item.title && (
                            <h3 className="text-white font-bold text-xs sm:text-sm md:text-base mb-1 line-clamp-1">
                              {item.title}
                            </h3>
                          )}
                          {item.description && (
                            <p className="text-white/90 text-[10px] sm:text-xs md:text-sm line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Type indicator for images */}
                      {item.type === "IMAGE" && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-md transition-all bg-green-600/90 text-white shadow-lg ${hoveredItem === item.id ? 'scale-110' : 'scale-100'}`}>
                          <ImageIcon className="w-3 h-3 inline mr-1" />
                          <span className="hidden sm:inline">IMAGE</span>
                        </div>
                      )}
                    </motion.div>
                      );
                    })
                    .filter(Boolean) // Remove any null items
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Enhanced Navigation */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* Page Indicators */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          page === i
                            ? "bg-green-600 w-8"
                            : "bg-green-300 hover:bg-green-400"
                        }`}
                        aria-label={`Go to page ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={totalPages <= 1}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>
                    
                    <span className="text-slate-600 text-sm font-medium px-4 py-2 bg-white rounded-lg border border-green-200">
                      Page {page + 1} of {totalPages}
                    </span>
                    
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={totalPages <= 1}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Media Modal */}
      {currentMedia && (
        <MediaModal
          isOpen={selectedMediaIndex !== null}
          onClose={closeMedia}
          mediaUrl={currentMedia.url}
          mediaType={currentMedia.type}
          title={currentMedia.title}
          description={currentMedia.description}
          currentIndex={selectedMediaIndex ?? 0}
          totalItems={gallery.length}
          onPrevious={gallery.length > 1 ? navigateToPrevious : undefined}
          onNext={gallery.length > 1 ? navigateToNext : undefined}
        />
      )}
    </main>
  );
}
