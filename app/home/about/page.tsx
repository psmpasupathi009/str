"use client";

import { motion } from "framer-motion";
import {
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import MediaModal from "@/componets/ui/media-modal";

const ITEMS_PER_PAGE = 8;

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Award, title: "Premium Quality", desc: "Finest ingredients sourced" },
  { icon: Users, title: "Trusted Brand", desc: "Loved by thousands" },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface GalleryItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  order: number;
}

async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch("/api/gallery");
  if (!res.ok) return [];
  const data = await res.json();
  const items = (data.gallery ?? []) as GalleryItem[];
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export default function AboutPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "IMAGE" | "VIDEO";
    title?: string;
    description?: string;
  } | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGallery()
      .then(setGallery)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(gallery.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(
    () => gallery.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE),
    [gallery, page]
  );

  const goNext = useCallback(
    () => setPage((p) => (p < totalPages - 1 ? p + 1 : 0)),
    [totalPages]
  );
  const goPrev = useCallback(
    () => setPage((p) => (p > 0 ? p - 1 : totalPages - 1)),
    [totalPages]
  );

  const openMedia = useCallback(
    (item: GalleryItem) =>
      setSelectedMedia({
        url: item.url,
        type: item.type,
        title: item.title ?? undefined,
        description: item.description ?? undefined,
      }),
    []
  );

  const onImageError = useCallback((url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      {/* Hero */}
      <section className="relative py-14 sm:py-20 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(14,165,233,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(14,165,233,0.03) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <motion.div
          {...fadeIn}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-4 sm:mb-6 text-slate-900">
            ABOUT STN GOLDEN HEALTHY FOODS
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Premium quality food products — oils, idly, masala powders & ready-to-eat items.
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-slate-900 mb-3">
              Our Story
            </h2>
            <div className="w-16 h-0.5 bg-linear-to-r from-green-500 to-green-400 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14 max-w-2xl mx-auto"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-green-200/80 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">{title}</h3>
                <p className="text-slate-600 text-sm text-center">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-5 text-slate-700 leading-relaxed"
          >
            {[
              "STN Golden Healthy Foods delivers premium cooking oils, idly mixes, masala powders, and ready-to-eat products. We focus on quality, taste, and trust in every pack.",
              "We bring traditional recipes and trusted ingredients together so you can cook with confidence. Our range fits home kitchens and modern lifestyles.",
              "Explore our oils, masalas, and ready-to-eat options—crafted for flavour, consistency, and everyday goodness.",
            ].map((paragraph, i) => (
              <motion.p
                key={i}
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                className="text-base sm:text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-white/50 border-t border-green-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-slate-900 mb-2">
              Product Gallery
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">Explore our product range</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"
                aria-hidden
              />
            </div>
          ) : gallery.length === 0 ? (
            <p className="text-center text-slate-500 py-16">
              No gallery items yet. Add them from the admin dashboard.
            </p>
          ) : (
            <>
              <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
              >
                {currentItems.map((item) => (
                  <motion.div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-green-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    onClick={() => openMedia(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openMedia(item);
                      }
                    }}
                  >
                    {item.type === "IMAGE" ? (
                      imageErrors.has(item.url) ? (
                        <div className="absolute inset-0 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-slate-400" aria-hidden />
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.title ?? "Gallery image"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={() => onImageError(item.url)}
                        />
                      )
                    ) : (
                      <video
                        src={item.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {(item.title || item.description) && (
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {item.title && (
                          <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        )}
                        {item.description && (
                          <p className="text-white/90 text-xs line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-md pointer-events-none ${
                        item.type === "IMAGE" ? "bg-green-600/90 text-white" : "bg-slate-700/90 text-white"
                      }`}
                    >
                      {item.type === "IMAGE" ? "Image" : "Video"}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <nav
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                  aria-label="Gallery pagination"
                >
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden /> Prev
                  </button>
                  <span className="text-slate-600 text-sm">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600"
                  >
                    Next <ChevronRight className="w-4 h-4" aria-hidden />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <MediaModal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        mediaUrl={selectedMedia?.url ?? ""}
        mediaType={selectedMedia?.type ?? "IMAGE"}
        title={selectedMedia?.title}
        description={selectedMedia?.description}
      />
    </main>
  );
}
