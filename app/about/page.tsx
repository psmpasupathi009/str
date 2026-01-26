"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, Users, Heart, Shield, CheckCircle2, Image as ImageIcon, FileCheck, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

// Sample gallery images - replace with actual product images
const galleryImages = [
  { id: 1, src: "/images/gallery/oil-1.jpg", alt: "Premium Cooking Oil", category: "Oil" },
  { id: 2, src: "/images/gallery/idly-1.jpg", alt: "Fresh Idly Products", category: "Idly" },
  { id: 3, src: "/images/gallery/masala-1.jpg", alt: "Authentic Masala Powders", category: "Masala" },
  { id: 4, src: "/images/gallery/ready-to-eat-1.jpg", alt: "Ready to Eat Products", category: "Ready-to-Eat" },
  { id: 5, src: "/images/gallery/oil-2.jpg", alt: "Quality Oil Products", category: "Oil" },
  { id: 6, src: "/images/gallery/idly-2.jpg", alt: "Traditional Idly", category: "Idly" },
  { id: 7, src: "/images/gallery/masala-2.jpg", alt: "Spice Powders", category: "Masala" },
  { id: 8, src: "/images/gallery/ready-to-eat-2.jpg", alt: "Convenient Meals", category: "Ready-to-Eat" },
];

// Sample certificates - replace with actual certificate images
const certificates = [
  { id: 1, title: "FSSAI Certified", description: "Food Safety and Standards Authority of India", image: "/images/certificates/fssai.jpg" },
  { id: 2, title: "ISO 22000", description: "Food Safety Management System", image: "/images/certificates/iso22000.jpg" },
  { id: 3, title: "Organic Certified", description: "100% Organic Products", image: "/images/certificates/organic.jpg" },
  { id: 4, title: "HACCP Certified", description: "Hazard Analysis Critical Control Point", image: "/images/certificates/haccp.jpg" },
];

export default function AboutPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [certErrors, setCertErrors] = useState<Set<string>>(new Set());

  const categories = ["All", "Oil", "Idly", "Masala", "Ready-to-Eat"];
  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-20 sm:pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px]" />
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          {[0, 2, 4].map((delay, i) => (
            <motion.div
              key={i}
              className={`absolute w-96 h-96 bg-${i === 0 ? 'purple' : i === 1 ? 'blue' : 'pink'}-500 rounded-full mix-blend-screen opacity-10 filter blur-3xl`}
              animate={{
                x: [0, i === 1 ? -100 : 100, 0],
                y: [0, 100, i === 2 ? -100 : 100],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                delay,
              }}
              style={{
                left: i === 0 ? '-10%' : i === 1 ? '50%' : '80%',
                top: i === 0 ? '10%' : i === 1 ? '20%' : '60%',
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text"
            style={{ WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%' }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            About STR
          </motion.h1>
          <p className="text-xl sm:text-2xl text-white/70 font-light max-w-3xl mx-auto">
            Premium Quality Food Products - Oil, Idly, Masala Powders & Ready-to-Eat Items
          </p>
        </motion.div>
      </section>

      {/* Section 1: Company Details */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
              Our Story
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              { icon: Award, title: "Premium Quality", desc: "Finest ingredients sourced" },
              { icon: Users, title: "Trusted Brand", desc: "Loved by thousands" },
              { icon: Heart, title: "Healthy Food", desc: "100% natural products" },
              { icon: Shield, title: "Certified Safe", desc: "FSSAI & ISO certified" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative group p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    <item.icon className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{item.title}</h3>
                  <p className="text-white/60 text-sm text-center">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-6 text-lg text-white/80 leading-relaxed"
          >
            <motion.p variants={itemVariants}>
              STR is a premium food products company dedicated to bringing you the finest quality 
              cooking oils, traditional idly products, authentic masala powders, and convenient 
              ready-to-eat items. With a commitment to excellence and health, we ensure every 
              product meets the highest standards of quality and safety.
            </motion.p>
            <motion.p variants={itemVariants}>
              Our journey began with a simple mission: to provide families with healthy, 
              nutritious, and delicious food products that maintain traditional flavors while 
              meeting modern quality standards. We source only the best ingredients and use 
              time-tested recipes passed down through generations.
            </motion.p>
            <motion.p variants={itemVariants}>
              From our premium cooking oils that enhance every dish to our authentic masala 
              powders that bring out the true flavors of Indian cuisine, every product is 
              crafted with care, passion, and an unwavering commitment to your health and 
              satisfaction.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Gallery */}
      <section className="relative py-20 sm:py-28 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
              Product Gallery
            </h2>
            <p className="text-white/60 mb-8">Explore our premium product range</p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredImages.map((image, i) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <div className="relative w-full h-full">
                  {!imageErrors.has(image.src) ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-xl"
                      onError={() => setImageErrors(prev => new Set(prev).add(image.src))}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center rounded-xl">
                      <span className="text-white/60 text-sm font-medium text-center px-2">{image.alt}</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <p className="text-white text-xs font-medium">{image.alt}</p>
                  <p className="text-white/60 text-xs">{image.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-purple-300 transition-colors flex items-center gap-2 z-10"
                >
                  <X className="w-5 h-5" />
                  Close
                </button>
                <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/30 to-blue-500/30">
                  {selectedImage && !imageErrors.has(selectedImage) ? (
                    <Image
                      src={selectedImage}
                      alt="Gallery Image"
                      fill
                      className="object-contain"
                      onError={() => setImageErrors(prev => new Set(prev).add(selectedImage))}
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/60">Image not found. Please add image to public/images/gallery/</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 3: Certificates */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
              Certifications & Quality Assurance
            </h2>
            <p className="text-white/60 mb-2">Our commitment to healthy, safe, and quality food products</p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                variants={itemVariants}
                className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    <FileCheck className="w-10 h-10 text-purple-300" />
                  </div>
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                    {!certErrors.has(cert.image) ? (
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        className="object-contain p-2"
                        onError={() => setCertErrors(prev => new Set(prev).add(cert.image))}
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">{cert.title}</h3>
                  <p className="text-white/60 text-sm text-center">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-3xl mx-auto text-center"
          >
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 backdrop-blur-xl">
              <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-purple-300" />
                Quality Guaranteed
              </h3>
              <p className="text-white/80 leading-relaxed">
                All our products undergo rigorous quality checks and are certified by leading 
                food safety authorities. We ensure that every product meets the highest standards 
                of hygiene, safety, and nutritional value. Your health and satisfaction are our 
                top priorities.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
