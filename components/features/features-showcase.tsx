"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Check, 
  Search, 
  WandSparkles, 
  FileText, 
  Palette, 
  Image as ImageIcon, 
  Settings, 
  Plus,
  Crop,
  Monitor,
  Smartphone,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Menu,
  Layers,
  SmartphoneNfc
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0
  }
};

export function FeaturesShowcase() {
  return (
    <section className="w-full py-10 bg-white">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-[1280px] mx-auto px-6 md:px-12 text-center space-y-3 mb-16"
      >
        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          All the Tools You Need in One Platform
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-500 text-base max-w-2xl mx-auto">
          Wixvora provides a complete set of features to help you create professional websites faster and easier with AI.
        </motion.p>
      </motion.div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        
        {/* FEATURE SHOWCASE 1: AI Website Generation */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          
          {/* Left Text Column */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AI Website Generation
            </h3>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Generate a complete website in seconds with AI. Just tell us what you need, and Wixvora will build it for you.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>AI generates content & images</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Smart layout & structure</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Save time and focus on your business</span>
              </li>
            </ul>
          </motion.div>

          {/* Right Visual UI Mockup */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M4 8L10 24L16 12L22 24L28 8" stroke="url(#m1_logo)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="m1_logo" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6"/>
                        <stop offset="1" stopColor="#4F46E5"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-xs font-black tracking-tight text-slate-900">WIXVORA</span>
                </div>
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch min-h-[300px]">
                
                <div className="md:col-span-3 border-r border-slate-100 pr-3 space-y-1 text-[11px] font-medium text-slate-600">
                  <div className="px-2.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-2">
                    <WandSparkles className="w-3.5 h-3.5" />
                    <span>AI Website</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pages</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>Design</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Media</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>AI Tools</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-3 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">Tell us about your website</h4>
                    <p className="text-[10px] text-slate-400">Describe your business or website you want to create.</p>
                    
                    <div className="p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-slate-50/50 leading-relaxed">
                      A modern website for a digital marketing agency with services, case studies, and contact form.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 block">Choose style</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="h-10 rounded border-2 border-indigo-600 bg-indigo-50/40 p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-indigo-200/60 rounded-[2px]"></div>
                      </div>
                      <div className="h-10 rounded border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-200/60 rounded-[2px]"></div>
                      </div>
                      <div className="h-10 rounded border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-indigo-100 rounded-[2px]"></div>
                      </div>
                      <div className="h-10 rounded border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-200/60 rounded-[2px]"></div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition">
                    Generate Website
                  </button>
                </div>

                <div className="md:col-span-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 border-b border-slate-200/60 pb-1.5">
                    <span>Digital Marketing</span>
                    <Crop className="w-3 h-3" />
                  </div>
                  <div className="my-auto space-y-2 z-10">
                    <h5 className="text-xs font-black text-slate-900 leading-snug">
                      Digital Marketing<br/>
                      <span className="text-indigo-600">Grow Your Brand</span><br/>
                      with Strategy That Works
                    </h5>
                    <button className="px-3 py-1 rounded bg-indigo-600 text-white text-[9px] font-semibold">
                      Get Started
                    </button>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-200/50 rounded-full blur-xl pointer-events-none"></div>
                </div>

              </div>

            </div>
          </motion.div>

        </motion.div>

        {/* FEATURE SHOWCASE 2: Drag & Drop Builder */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8"
        >
          
          <motion.div variants={itemVariants} className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 sm:p-5 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path d="M4 8L10 24L16 12L22 24L28 8" stroke="url(#m2_logo)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="m2_logo" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6"/>
                        <stop offset="1" stopColor="#4F46E5"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-xs font-black tracking-tight text-slate-900">WIXVORA</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center">
                    <Monitor className="w-3 h-3" />
                  </div>
                  <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center">
                    <Smartphone className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Preview</span>
                  <button className="px-3 py-1 rounded-md bg-indigo-600 text-white font-semibold text-[10px]">
                    Publish
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch min-h-[300px]">
                
                <div className="md:col-span-2 border-r border-slate-100 pr-2 space-y-1 text-[10px] font-medium text-slate-600">
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add</span>
                  </div>
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pages</span>
                  </div>
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>Design</span>
                  </div>
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Media</span>
                  </div>
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>AI Tools</span>
                  </div>
                  <div className="px-2 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
                  </div>
                </div>

                <div className="md:col-span-6 bg-slate-50/60 rounded-xl p-4 border border-slate-100 flex flex-col justify-center space-y-3 relative">
                  
                  <div className="builder-selection-box bg-white p-3 rounded-lg shadow-sm space-y-2">
                    <div className="builder-handle -top-1 -left-1"></div>
                    <div className="builder-handle -top-1 -right-1"></div>
                    <div className="builder-handle -bottom-1 -left-1"></div>
                    <div className="builder-handle -bottom-1 -right-1"></div>

                    <h4 className="text-xl font-black text-slate-900 leading-tight">
                      Create your <span className="text-indigo-600">success</span> online
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      We build websites that help your business grow faster and bigger.
                    </p>
                    <button className="px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold text-[10px]">
                      Get Started
                    </button>
                  </div>

                </div>

                <div className="md:col-span-4 bg-white rounded-xl p-3 border border-slate-200/80 space-y-3 text-[10px]">
                  <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">Edit Text</h5>
                  
                  <div className="flex items-center border-b border-slate-100 text-slate-400 font-semibold pb-1">
                    <span className="text-indigo-600 border-b-2 border-indigo-600 pb-1 -mb-1 px-1">Content</span>
                    <span className="px-3">Style</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-medium">Font</span>
                    <div className="p-1.5 border border-slate-200 rounded font-semibold text-slate-800 flex justify-between items-center">
                      <span>Heading 1</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-medium">Weight</span>
                      <div className="p-1.5 border border-slate-200 rounded font-semibold text-slate-800 flex justify-between items-center">
                        <span>Bold</span>
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block font-medium">Size</span>
                      <div className="p-1.5 border border-slate-200 rounded font-semibold text-slate-800 flex justify-between items-center">
                        <span>64</span>
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-medium">Color</span>
                    <div className="flex items-center gap-2 border border-slate-200 rounded p-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border"></div>
                      <span className="font-mono text-slate-700">#111827</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
                    <AlignLeft className="w-3.5 h-3.5 text-indigo-600" />
                    <AlignCenter className="w-3.5 h-3.5" />
                    <AlignRight className="w-3.5 h-3.5" />
                    <AlignJustify className="w-3.5 h-3.5" />
                  </div>

                  <span className="text-indigo-600 font-semibold block pt-1 cursor-pointer">More settings</span>
                </div>

              </div>

            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Layers className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Drag & Drop Builder
            </h3>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Build your website visually with an intuitive drag & drop builder. No coding required.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Drag & drop any element</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Fully customizable</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Real-time editing</span>
              </li>
            </ul>
          </motion.div>

        </motion.div>

        {/* FEATURE SHOWCASE 3: Fully Responsive Design */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8"
        >
          
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <SmartphoneNfc className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Fully Responsive Design
            </h3>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Your website will look perfect on any device. Wixvora automatically optimizes your site for desktop, tablet, and mobile.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Mobile-first approach</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Auto responsive layout</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <span>Preview on all devices</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              
              <div className="absolute left-0 top-2 w-[82%] bg-white rounded-2xl shadow-card border border-slate-200/90 overflow-hidden z-10 p-3 sm:p-4">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-800">NEIKORA</span>
                    <span>Home</span>
                    <span>About</span>
                    <span>Services</span>
                    <span>Portfolio</span>
                    <span>Contact</span>
                  </div>
                </div>

                <div className="py-6 px-4 space-y-3 max-w-sm">
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    We build digital products that drive results
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Strategic digital solutions for ambitious brands and growing businesses.
                  </p>
                  <button className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-semibold">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="absolute right-12 top-10 w-[45%] sm:w-[48%] bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden z-20 p-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[9px] font-black text-slate-800">NEIKORA</span>
                  <Menu className="w-3 h-3 text-slate-400" />
                </div>

                <div className="py-4 space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 leading-tight">
                    We build digital products that drive results
                  </h5>
                  <p className="text-[8px] text-slate-400 leading-tight">
                    Strategic digital solutions for ambitious brands.
                  </p>
                  <button className="px-3 py-1 rounded bg-indigo-600 text-white text-[8px] font-semibold">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="absolute right-2 bottom-2 w-[28%] sm:w-[30%] bg-slate-900 rounded-[22px] p-2 shadow-2xl border border-slate-800 z-30">
                <div className="bg-white rounded-[16px] p-2.5 text-slate-900 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-[8px] font-black">NEIKORA</span>
                    <Menu className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                  <h6 className="text-[9px] font-bold leading-tight">
                    We build digital products that drive results
                  </h6>
                  <p className="text-[7px] text-slate-400 leading-tight">
                    Strategic digital solutions.
                  </p>
                  <button className="w-full py-1 rounded bg-indigo-600 text-white text-[7px] font-semibold">
                    Learn More
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
