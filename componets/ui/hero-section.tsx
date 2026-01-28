"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Floating animation for logo
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };

    // Initialize particles
    if (typeof window !== "undefined") {
      setParticles(
        Array.from({ length: 6 }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }))
      );
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Text reveal animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        {/* Green base background */}
        <div className="absolute inset-0 bg-linear-to-br from-green-600 via-green-700 to-emerald-800">
          <Image
            src="/images/favpng_4e520959091f8551d137977200997266.png"
            alt="Traditional Heritage Background"
            fill
            priority
            className="object-cover object-center opacity-25 mix-blend-overlay"
            quality={90}
            sizes="100vw"
          />
        </div>
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-b from-green-900/60 via-green-800/50 to-green-900/70" />
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-green-600/10 via-transparent to-emerald-600/10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
      </motion.div>

      {/* Animated Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(34, 197, 94, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "40px 40px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Particles Effect */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-500/40 rounded-full blur-sm"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0.4,
          }}
          animate={{
            y: particle.y + (Math.random() - 0.5) * 200,
            x: particle.x + (Math.random() - 0.5) * 200,
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      ))}

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 md:py-20"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8"
        >
          {/* Brand Name with enhanced styling */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight"
          >
            <span className="block bg-linear-to-r from-white via-green-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
              STN GOLDEN
            </span>
            <span className="block mt-2 bg-linear-to-r from-white via-green-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              HEALTHY FOODS
            </span>
          </motion.h1>

          {/* Logo with floating effect */}
          <motion.div
            variants={itemVariants}
            style={{
              x: mousePosition.x * 20,
              y: mousePosition.y * 20,
            }}
            className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] aspect-[1.4] mx-auto"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full"
            >
              <Image
                src="/images/ghf.jpg"
                alt="STN Golden Healthy Foods"
                fill
                priority
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
                className="object-contain drop-shadow-2xl"
              />
              {/* Glow effect around logo */}
              <div className="absolute inset-0 bg-green-500/30 blur-3xl -z-10 rounded-full" />
            </motion.div>
          </motion.div>

          {/* Tagline with enhanced styling */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 font-light tracking-wide max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
          >
            Premium Quality Natural & Healthy Food Products
          </motion.p>

          {/* Decorative Sparkles */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-white/80"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-light tracking-widest uppercase">
              Pure • Natural • Authentic
            </span>
            <Sparkles className="w-4 h-4" />
          </motion.div>

          {/* CTA Button with enhanced animations */}
          <motion.div
            variants={itemVariants}
            className="pt-4 sm:pt-6"
          >
            <Link href="/home/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-base sm:text-lg tracking-wide shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-green-400 via-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"
                />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-6 h-10 border-2 border-green-700/40 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1.5 h-3 bg-green-700/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
