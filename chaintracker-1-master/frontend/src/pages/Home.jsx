import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, Search, Network, Brain, ArrowRight, Github, Twitter, Linkedin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParticleCore = () => {
  const particles = Array.from({ length: 80 });
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
      <div className="relative w-40 h-40" style={{ transformStyle: 'preserve-3d' }}>
        {particles.map((_, i) => {
          // Uniform spherical distribution
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const r = 40 + Math.random() * 20; // Radius range
          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.sin(phi) * Math.sin(theta);
          const z = r * Math.cos(phi);
          
          return (
            <motion.div
              key={i}
              animate={{
                opacity: [0.1, 0.6, 0.1],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const FeatureCarousel = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const rotationRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  const features = [
    {
      icon: <Search className="w-10 h-10" />,
      title: "Address Tracing",
      desc: "Deep-dive into transaction histories with multi-hop analysis and attribution.",
    },
    {
      icon: <Network className="w-10 h-10" />,
      title: "Graph Visualization",
      desc: "Interactive transaction graphs to visualize flow of funds and complex networks.",
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "ML Predictions",
      desc: "AI-powered risk scoring to identify potentially illicit entities and activities.",
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Real-time Alerts",
      desc: "Instant notifications for suspicious high-value movements and mixing activity.",
    }
  ];

  useEffect(() => {
    let frameId;
    const animate = (time) => {
      if (!isHovered) {
        const deltaTime = time - lastTimeRef.current;
        rotationRef.current += deltaTime * 0.02; // Slow rotation speed
        setRotation(rotationRef.current);
      }
      lastTimeRef.current = time;
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  const radius = 280; // Distance between cards

  return (
    <div className="relative w-full h-full perspective-2000 flex items-center justify-center py-20">
      {/* 3D Spherical Particle Core */}
      <ParticleCore />

      <div 
        className="relative w-72 h-[400px] transition-transform duration-100 ease-linear"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)` 
        }}
      >
        {features.map((feature, idx) => {
          const angle = (idx * (360 / features.length));
          return (
            <div
              key={idx}
              className="absolute inset-0"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'visible' // Cards behind will not vanish
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.15, 
                  z: 50,
                  rotateY: -5,
                  transition: { type: "spring", stiffness: 300 } 
                }}
                className="relative w-full h-full p-8 rounded-2xl overflow-hidden group cursor-pointer border border-white/10
                  bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/50
                  metallic-shine"
              >
                {/* Metallic Glossy Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-30 group-hover:opacity-60 transition-opacity" />
                <div className="absolute -inset-full top-0 block w-1/2 h-full z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:animate-shine" />
                
                {/* Content - White/Grey text */}
                <div className="relative z-20 h-full flex flex-col justify-between">
                  <div>
                    <div className="mb-6 text-white drop-shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tighter drop-shadow-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 font-medium leading-relaxed drop-shadow-sm">
                      {feature.desc}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-gray-400 font-bold group-hover:text-white transition-colors">
                    Explore <ArrowRight className="ml-2" size={18} />
                  </div>
                </div>

                {/* Reflection Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 mix-blend-overlay" />
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => {
  const containerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const analyticsRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll tracking specifically for the hero section
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: analyticsScrollProgress } = useScroll({
    target: analyticsRef,
    offset: ["start end", "center center"]
  });

  const analyticsScale = useTransform(analyticsScrollProgress, [0, 1], [0.95, 1]);
  const analyticsOpacity = useTransform(analyticsScrollProgress, [0, 1], [0, 1]);
  const analyticsTranslateY = useTransform(analyticsScrollProgress, [0, 1], [50, 0]);

  const smoothHeroProgress = useSpring(heroScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Image sequence logic
  const frameCount = 120;
  
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages = [];
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, '0');
        img.src = `/hero-sequence/ezgif-frame-${frameNumber}.jpg`;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = () => {
            console.error(`Failed to load frame ${frameNumber}`);
            resolve();
          };
        });
        loadedImages.push(img);
      }
      setImages(loadedImages);
      setLoading(false);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const updateCanvas = (progress) => {
      // Explicitly map 0% to frame 1 and 100% to frame 120
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );
      
      const img = images[frameIndex];
      if (img && img.complete && img.naturalHeight !== 0) {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Force full screen coverage without any black spaces (similar to background-size: cover)
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image ratio
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Canvas is taller than image ratio
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        // Use a small scale-up factor to eliminate any potential sub-pixel gaps/black edges
        const scaleBuffer = 1.01; 
        context.drawImage(
          img, 
          offsetX - (drawWidth * (scaleBuffer - 1)) / 2, 
          offsetY - (drawHeight * (scaleBuffer - 1)) / 2, 
          drawWidth * scaleBuffer, 
          drawHeight * scaleBuffer
        );
      }
    };

    const unsubscribe = smoothHeroProgress.on("change", (latest) => {
      updateCanvas(latest);
    });

    // Initial draw
    updateCanvas(0);

    return () => unsubscribe();
  }, [images, smoothHeroProgress]);

  // Transform content opacity based on the 118th frame (approx 98% of progress)
  const contentOpacity = useTransform(smoothHeroProgress, [0.95, 0.983], [1, 0]);
  const contentScale = useTransform(smoothHeroProgress, [0.95, 0.983], [1, 0.9]);
  const scrollIndicatorOpacity = useTransform(smoothHeroProgress, [0, 0.05], [1, 0]);

  // Handle canvas resizing to always be full screen
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-black text-white font-sans overflow-x-hidden" ref={containerRef}>
      {/* Canvas for scroll animation - Fixed background for Hero and Features */}
      <div className="fixed inset-0 w-full h-screen z-0 pointer-events-none overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover opacity-80 grayscale brightness-75 transition-opacity duration-300"
        />
        {/* Subtle overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      {/* SECTION 1: HERO - Shortened height */}
      <section ref={heroSectionRef} className="relative h-[250vh] z-10">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          {/* Overlay Content - Fades out near frame 118 */}
          <motion.div 
            style={{ 
              opacity: contentOpacity,
              scale: contentScale
            }}
            className="relative z-10 text-center px-4 max-w-4xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter"
            >
              CRYPTO<span className="text-gray-500">TRACE</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Advanced blockchain forensics and threat detection platform. 
              Unmasking illicit activities with precision and clarity.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                to="/dashboard"
                className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center group"
              >
                Launch Dashboard
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-8 py-4 border border-gray-700 rounded-full font-semibold hover:bg-white/10 transition-all">
                Learn More
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator - Only visible at start */}
          <motion.div 
            style={{ opacity: scrollIndicatorOpacity }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
          >
            <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-gray-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURES - 3D Rotating Carousel */}
      <section className="relative py-32 bg-transparent z-20 overflow-hidden perspective-1000">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Core Capabilities</h2>
            <div className="h-1 w-20 bg-white mx-auto" />
          </div>
          
          <div className="relative h-[500px] flex items-center justify-center">
            <FeatureCarousel />
          </div>
        </div>
      </section>

      {/* SECTION 3: ANALYTICS PREVIEW */}
      <section ref={analyticsRef} className="py-32 bg-black relative overflow-hidden">
        {/* Subtle grid background consistent with other pages */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
        
        <motion.div 
          style={{ 
            opacity: analyticsOpacity,
            scale: analyticsScale,
            y: analyticsTranslateY
          }}
          className="max-w-7xl mx-auto px-4 relative z-10"
        >
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System Intelligence</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                  Detecting <span className="text-zinc-600 italic">Anomalies</span> in <br />
                  <span className="text-white">Real-Time</span>
                </h2>
              </div>

              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl font-medium">
                Our advanced heuristics engine processes thousands of transactions per second, identifying mixing patterns, peeling chains, and high-risk clusters before they reach the endpoint.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Heuristic Mapping", desc: "Automated identification of 20+ known laundering patterns." },
                  { title: "Entity Clustering", desc: "Grouping disparate addresses into single controlled entities." },
                  { title: "Risk Scoring", desc: "Multidimensional analysis of transaction entropy and history." },
                  { title: "Flow Tracing", desc: "Deep recursion to source or destination across hops." }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2 group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-zinc-700 group-hover:bg-white transition-colors rounded-full" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-6">
                <Link 
                  to="/trace"
                  className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  Launch Address Tracer
                </Link>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active nodes monitored</span>
                  <span className="text-xl font-black tabular-nums">1,248,392</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full h-[500px] relative group">
              <div className="absolute inset-0 bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-700">
                {/* Visual scan animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-80 h-80 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-dashed border-white/10 rounded-full" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-8 border border-dashed border-white/5 rounded-full" 
                    />
                    <div className="absolute inset-20 bg-gradient-to-tr from-white/5 to-transparent rounded-full animate-pulse" />
                    <Shield className="w-20 h-20 text-zinc-500 group-hover:text-white transition-colors duration-1000 z-10" />
                    
                    {/* Floating data points */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.2, 0.5, 0.2],
                          x: [0, Math.cos(i) * 100, 0],
                          y: [0, Math.sin(i) * 100, 0]
                        }}
                        transition={{ duration: 3 + i, repeat: Infinity }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Technical Overlay */}
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <div className="h-0.5 w-12 bg-white/20" />
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">SCAN_CORE: v4.2.1</span>
                </div>
                <div className="absolute bottom-8 right-8 flex flex-col gap-2 text-right">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">THREAT_LEVEL: NOMINAL</span>
                  <div className="h-0.5 w-12 bg-white/20 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4: FOOTER / CTA */}
      <footer className="relative pt-32 pb-16 bg-zinc-950 border-t border-white/5 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Main CTA */}
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Join the protocol</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-10">
              Ready to <span className="text-zinc-600 italic">Secure</span> the <br />
              <span className="text-white">Future?</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto mb-12 font-medium">
              Access professional-grade blockchain forensics tools. Start monitoring and analyzing high-risk activities today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                to="/dashboard" 
                className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.15)]"
              >
                Get Started Now
              </Link>
              <button className="px-12 py-5 border border-white/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 pb-24 border-b border-white/5">
            <div className="col-span-2 lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">CryptoTrace</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">
                The global standard for blockchain intelligence and threat detection. Empowering security teams with real-time forensic clarity.
              </p>
              <div className="flex gap-4">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Platform</h4>
              <ul className="space-y-4">
                {['Dashboard', 'Address Tracer', 'ML Predictions', 'Graph Explorer'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Resources</h4>
              <ul className="space-y-4">
                {['Documentation', 'API Reference', 'Case Studies', 'Security Blog'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">© 2026 CRYPTOTRACE FORENSICS</span>
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ALL RIGHTS RESERVED</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
