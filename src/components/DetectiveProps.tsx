import React from "react";
import { motion } from "motion/react";
import { Skull, Shield, Search, Heart, Syringe, Clipboard, Eye, RefreshCcw, FileText, Compass, MapPin } from "lucide-react";

// 1. Realistic Spiral Notebook Binder decoration (RTL - right placed)
export const NotebookSpiralBinder: React.FC = () => {
  return (
    <div className="absolute right-[-14px] top-8 bottom-8 flex flex-col justify-between w-6 pointer-events-none z-30 select-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="flex items-center">
          {/* Combined spiral loop ring */}
          <span className="w-8 h-3.5 bg-gradient-to-l from-zinc-500 via-zinc-200 to-zinc-400 rounded-full shadow-md border border-zinc-600/20 transform -rotate-12 block" />
          {/* Black punched hole in the notebook page */}
          <span className="w-2.5 h-2.5 bg-neutral-900 rounded-full mr-[-6px] z-10 shadow-inner block" />
        </span>
      ))}
    </div>
  );
};

// 2. High-fidelity Pure CSS Knife / Dagger
export const DaggerProp: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* Knife tip */}
      <div className="w-1.5 h-6 bg-gradient-to-r from-zinc-300 to-zinc-400 rounded-t-full shadow-inner" />
      {/* Knife Blade with realistic metallic silver reflection line */}
      <div className="relative w-4 h-24 bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 border-l border-zinc-400/40 rounded-b-md flex justify-center shadow-lg">
        {/* Blood stain detail */}
        <div className="absolute bottom-4 left-0.5 w-2 h-8 bg-red-800/80 rounded-full blur-[1px] rotate-12" />
        {/* Blade fuller groove */}
        <div className="w-[2px] h-16 bg-zinc-500/50 mt-2 rounded" />
      </div>
      {/* Knife Guard / Crossguard (metal guard protecting the hand) */}
      <div className="w-12 h-3.5 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-800 rounded-lg shadow border border-yellow-900/30 -mt-0.5 z-10" />
      {/* Knife Hilt / Handle (dark leather-wrapped realistic texture) */}
      <div className="w-5 h-12 bg-neutral-800 border-l border-r border-neutral-700 shadow-md rounded-b flex flex-col justify-between p-0.5">
        <div className="h-2 w-full bg-neutral-900/60 rounded-xs" />
        <div className="h-2 w-full bg-neutral-900/40 rounded-xs" />
        <div className="h-2 w-full bg-neutral-900/60 rounded-xs" />
        <div className="h-2 w-full bg-neutral-900/40 rounded-xs" />
      </div>
      {/* Knife Pommel (gold bottom cap) */}
      <div className="w-6 h-3 bg-gradient-to-r from-yellow-700 to-yellow-500 rounded-full shadow border-t border-yellow-900/20" />
    </div>
  );
};

// 3. High-fidelity Pure CSS Classic Detective Pistol/Revolver
export const RevolverProp: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <div className="relative w-36 h-20 transform scale-110">
        {/* Barrel (فوهة المسدس) */}
        <div className="absolute top-1 right-12 w-20 h-4.5 bg-gradient-to-b from-neutral-600 via-neutral-500 to-neutral-700 border border-neutral-800/30 rounded-r shadow-md" />
        
        {/* Underbarrel lug / ejection rod */}
        <div className="absolute top-5 right-14 w-12 h-2 bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-r-sm" />
        
        {/* Front sight pin */}
        <div className="absolute -top-1 right-13 w-2 h-2 bg-neutral-800 rounded-tl-full" />
        
        {/* Cylinder (بيت الرصاص الدوار) with detailed chambers */}
        <div className="absolute top-0 right-3.5 w-11 h-10.5 bg-gradient-to-b from-neutral-700 via-neutral-600 to-neutral-800 border-y border-neutral-900/40 rounded shadow-lg z-10 flex flex-col justify-around p-0.5">
          <div className="h-1 bg-neutral-900/50 rounded-sm" />
          <div className="h-1 bg-neutral-900/50 rounded-sm" />
          <div className="h-1 bg-neutral-900/50 rounded-sm" />
        </div>
        
        {/* Frame / Receiver */}
        <div className="absolute top-0 left-4 w-13 h-10 bg-gradient-to-b from-neutral-600 to-neutral-800 rounded-l shadow" />
        
        {/* Hammer (المطرقة الخلفية) */}
        <div className="absolute -top-3.5 left-2 w-2.5 h-6 bg-neutral-700 rounded-t-lg -rotate-45 origin-bottom shadow-sm" />
        
        {/* Trigger Guard (واقي الزناد) */}
        <div className="absolute top-9 left-6 w-9 h-6.5 border-2 border-neutral-700 rounded-full bg-transparent flex items-center justify-center">
          {/* Trigger (الزناد) */}
          <div className="w-1.5 h-4.5 bg-neutral-400 rounded-l-md rotate-12 -mr-1" />
        </div>
        
        {/* Walnut Antique Wooden Grip (المقبض الخشبي الفاخر للتحقيق) */}
        <div className="absolute top-6 left-1 w-7 h-15 bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-b-3xl rounded-tl-xl border-l-2 border-amber-950 shadow-xl origin-top rotate-12">
          {/* Grip cross-hatch texture pattern */}
          <div className="w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
        </div>
        
        {/* Cylinder release switch */}
        <div className="absolute top-1.5 left-7 w-2 h-2 bg-neutral-900 rounded-full" />
      </div>
    </div>
  );
};

// 3.5. High-fidelity Pure CSS Matte-Black Glock-Style Gun (matches the user's uploaded image)
export const GlockProp: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative select-none pointer-events-none drop-shadow-[4px_10px_8px_rgba(0,0,0,0.6)] ${className}`}>
      <div className="relative w-44 h-28 transform">
        {/* Glock Slide (Partially textured top) with serrations */}
        <div className="absolute top-0 right-10 w-32 h-9 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 border border-neutral-900/60 rounded-r shadow-md">
          {/* Slide serrations (خطوط سحب الأقسام الخلفية) */}
          <div className="absolute left-2 top-1 bottom-1 w-6 flex justify-between px-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[1.5px] h-full bg-neutral-800/90" />
            ))}
          </div>
          {/* Barrel exit gap on front slide */}
          <div className="absolute right-0 top-1 w-2 h-3 bg-neutral-950 rounded-l" />
          {/* Ejection Port (منفذ خروج المغلفات الفارغة) */}
          <div className="absolute right-10 top-0.5 w-6 h-3 bg-neutral-950 border border-neutral-900 rounded-xs" />
        </div>

        {/* Outer Steel barrel sticking out slightly */}
        <div className="absolute top-3.5 right-8 w-2.5 h-3 bg-neutral-700 rounded-r-xs shadow" />

        {/* Glock Frame (Lower polymer frame containing dust cover) */}
        <div className="absolute top-9 right-11 w-30 h-4.5 bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-r-sm" />
        
        {/* Trigger Guard Loop */}
        <div className="absolute top-8 left-14 w-10 h-8 border-[2.5px] border-neutral-900 rounded-br-2xl rounded-bl-lg bg-transparent flex items-center justify-center">
          {/* Glock SafeAction Trigger & central safety lever (الزناد) */}
          <div className="relative w-3 h-5 -mt-1 -mr-2 bg-neutral-800 rounded-l-md rotate-12">
            <div className="absolute left-0.5 top-1.5 w-1 h-3 bg-red-605 rounded-l" /> {/* safety insert pin */}
          </div>
        </div>

        {/* Glock Polymer Grip with checkered texture scale layout */}
        <div className="absolute top-8 left-5 w-10 h-18 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 rounded-b-xl rounded-tr-md border-l border-neutral-800/40 shadow-inner origin-top rotate-[18deg]">
          {/* Grip Texture Grid */}
          <div className="absolute inset-2 bg-neutral-950/80 rounded border border-neutral-800/20 [background-image:linear-gradient(45deg,#111_25%,transparent_25%),linear-gradient(-45deg,#111_25%,transparent_25%)] [background-size:3px_3px] opacity-40" />
          {/* Finger grooved front profile design */}
          <div className="absolute right-[-2.5px] top-2 bottom-2 w-1.5 flex flex-col justify-around">
            <div className={`w-1.5 h-3 bg-neutral-900 rounded-l-sm`} />
            <div className={`w-1.5 h-3 bg-neutral-900 rounded-l-sm`} />
            <div className={`w-1.5 h-3 bg-neutral-900 rounded-l-sm`} />
          </div>
          {/* Lanyard ring cutout placeholder */}
          <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-neutral-900 rounded-full" />
        </div>

        {/* Takedown lever & Slide stop controls */}
        <div className="absolute top-8.5 right-16 w-3 h-1.5 bg-neutral-800 rounded-sm" />
        <div className="absolute top-7 left-14 w-4 h-1.5 bg-neutral-800 rounded-sm" />
      </div>
    </div>
  );
};

// 3.6. High-fidelity Pure CSS Olive-Green Survival-style Folding Knife (matches user's uploaded image left element)
export const OliveTacticalKnifeProp: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative select-none pointer-events-none drop-shadow-[4px_10px_8px_rgba(0,0,0,0.6)] ${className}`}>
      <div className="relative w-12 h-52 flex flex-col items-center">
        {/* Knife Blade (Black powder coated, pointed down slightly like the image) */}
        <div className="relative w-3.5 h-26 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-950 rounded-b-[40px] rounded-t-sm shadow-md flex justify-center border-r border-neutral-800/40">
          {/* Sharp grind blade edge line */}
          <div className="absolute inset-y-0 right-0 w-[1.5px] bg-neutral-600 opacity-60" />
          {/* Swedge recurve back styling */}
          <div className="absolute bottom-4 left-0 w-1.5 h-12 bg-neutral-900/80 rounded-br-full" />
          {/* Blood groove or fuller hole */}
          <div className="w-[1.5px] h-14 bg-neutral-950 mt-4 rounded" />
        </div>

        {/* Pivot/hinge screw circle point */}
        <div className="relative w-6 h-6 bg-zinc-800 border-2 border-neutral-950 rounded-full z-20 shadow-md -mt-1 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-full shadow-inner" />
        </div>

        {/* Olive Green/Khaki scale folded frame grip handles */}
        <div className="relative w-5 h-24 bg-gradient-to-r from-emerald-850 via-emerald-800 to-emerald-900 rounded-2xl shadow-xl border border-emerald-950/40 -mt-2 z-10 flex flex-col justify-between py-4 px-0.5">
          {/* Hex screw details */}
          <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full mx-auto opacity-80 shadow-xs" />
          
          {/* Tactical grip slots / grooves */}
          <div className="space-y-1 mx-auto">
            <div className="w-3 h-1 bg-emerald-950/60 rounded" />
            <div className="w-3 h-1 bg-emerald-950/60 rounded" />
            <div className="w-3 h-1 bg-emerald-950/60 rounded" />
            <div className="w-3 h-1 bg-emerald-950/60 rounded" />
          </div>

          <div className="w-1.5 h-1.5 bg-zinc-450 rounded-full mx-auto opacity-80" />
        </div>

        {/* Metal Pocket Clip structure */}
        <div className="w-2 h-14 bg-gradient-to-b from-neutral-500 to-neutral-700 rounded-b border border-neutral-800 shadow -mt-16 z-20 self-center" />
      </div>
    </div>
  );
};

// 4. Night action ambient floating particles ("شظايا ليلية")
export const NightParticles: React.FC = () => {
  // Generate a list of randomized particles
  const particles = React.useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 3}px`,
      delay: `${Math.random() * 15}s`,
      duration: `${Math.random() * 10 + 8}s`,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {particles.map(p => (
        <span
          key={p.id}
          className="shrapnel-particle block"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `night-glowing-float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

// 5. Mafia Weapon elements on screen sides
export const MafiaPropsLeftRight: React.FC = () => {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none select-none z-0 overflow-hidden hidden md:block">
      {/* Left side gun */}
      <div className="absolute left-6 top-1/4 prop-floating-left flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-red-500 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded shadow-sm">
          مسدس الكاتم
        </p>
        <RevolverProp className="transform -rotate-12 opacity-80" />
      </div>

      {/* Right side knife */}
      <div className="absolute right-6 top-1/3 prop-floating-right flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-red-500 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded shadow-sm">
          صلب الدوسة
        </p>
        <DaggerProp className="transform rotate-12 opacity-80" />
      </div>

      {/* Corner "Investigator Target Log" pocketbook mockup (دفتر التصفية بالزاوية) */}
      <div className="absolute bottom-4 left-6 w-32 h-20 bg-neutral-900 border border-neutral-800 rounded-lg p-2 shadow-2xl opacity-60 flex flex-col justify-between leading-tight rotate-6">
        <p className="text-[9px] font-bold text-red-500 border-b border-red-500/20 pb-0.5">دفتر الاغتيالات 📓</p>
        <span className="text-[8px] text-zinc-400 block font-mono">طاقم المافيا نشط...</span>
        <span className="text-[8px] text-zinc-500 block">كتم الصوت متاح الليلة</span>
      </div>
    </div>
  );
};

// 6. Doctor props (Medicines, first aid & Syringes)
export const DoctorPropsLeftRight: React.FC = () => {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none select-none z-0 overflow-hidden hidden md:block">
      {/* Left side syringe setup */}
      <div className="absolute left-8 top-1/3 prop-floating-left flex flex-col items-center gap-2">
        <div className="relative w-10 h-32 bg-stone-900/30 border border-emerald-500/20 p-2 rounded-2xl flex flex-col items-center justify-center">
          {/* Syringe shape */}
          <div className="relative w-6 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded shadow-inner flex flex-col justify-between p-1">
            <div className="w-full h-1 bg-emerald-400/80 rounded" />
            <div className="w-full h-4 bg-emerald-500/40 rounded-sm" />
            <div className="w-full h-1 bg-emerald-400/80 rounded" />
          </div>
          {/* Syringe needle */}
          <div className="w-[1.5px] h-6 bg-zinc-400" />
        </div>
        <p className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded shadow">
          مصل المقاومة 💉
        </p>
      </div>

      {/* Right side pharmacy/medicine pills */}
      <div className="absolute right-8 top-1/4 prop-floating-right flex flex-col items-center gap-2">
        <div className="relative w-14 h-24 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg shadow-xl border border-zinc-700/50 p-2 flex flex-col justify-between">
          <div className="w-full h-5 bg-emerald-600/90 rounded-t-sm flex items-center justify-center text-[7px] text-white font-bold font-mono">
            MEDICAL
          </div>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-5 bg-red-400 rounded-full" />
            <div className="w-2 h-5 bg-white rounded-full border border-zinc-300" />
            <div className="w-2 h-5 bg-red-400 rounded-full" />
          </div>
          <p className="text-[6px] text-zinc-500 text-center font-mono leading-none">ANTIDOTE PILLS</p>
        </div>
        <p className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded shadow">
          مسكنات الترياق 💊
        </p>
      </div>
    </div>
  );
};

// 7. Old man / Detective props (Investigation tools floating)
export const OldManPropsLeftRight: React.FC = () => {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none select-none z-0 overflow-hidden hidden md:block">
      {/* Left side interactive classic Magnifying glass */}
      <div className="absolute left-8 top-1/3 prop-floating-left flex flex-col items-center gap-2">
        <div className="relative flex flex-col items-center">
          {/* Glass Rim */}
          <div className="w-16 h-16 rounded-full border-4 border-yellow-600 bg-blue-300/10 shadow-lg relative flex items-center justify-center">
            {/* Glossy reflection */}
            <div className="absolute top-1 left-2 w-8 h-4 bg-white/20 rounded-full filter blur-[1px] transform -rotate-12" />
            <Search className="text-zinc-400/30" size={24} />
          </div>
          {/* Handle */}
          <div className="w-3.5 h-12 bg-amber-900 border border-amber-950 rounded-b shadow-md -mt-1" />
        </div>
        <p className="text-[10px] font-bold text-blue-400 bg-blue-950/50 border border-blue-500/20 px-2 py-0.5 rounded shadow">
          عدسة التحقيق 🔍
        </p>
      </div>

      {/* Right side floating Case Files and Fingerprint */}
      <div className="absolute right-8 top-1/4 prop-floating-right flex flex-col items-center gap-2">
        <div className="relative w-16 h-20 bg-[#f4edd9] border border-zinc-450 rounded shadow-md p-2 flex flex-col justify-between transform -rotate-6">
          <p className="text-[8px] font-black text-zinc-800 border-b border-zinc-400 pb-0.5">ملف القضية</p>
          {/* Mock fingerprint drawing */}
          <div className="w-10 h-10 mx-auto opacity-70 bg-[radial-gradient(circle_at_center,transparent_4px,#4b5563_5px)] [background-size:8px_8px] rounded-full" />
          <span className="text-[6px] text-red-700 font-bold block text-center">مشتبه به رئيسي</span>
        </div>
        <p className="text-[10px] font-bold text-blue-400 bg-blue-950/50 border border-blue-500/20 px-2 py-0.5 rounded shadow">
          البصمات والمستندات 📑
        </p>
      </div>
    </div>
  );
};

// 8. Results Vintage Magazine Screen layout decorative overlay
export const ResultsMagazineOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* Burned / Dirty sepia edges on corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_left,rgba(90,40,15,0.7)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_bottom_right,rgba(40,20,5,0.7)_0%,transparent_70%)]" />

      {/* Real Revolver laying on top of the newspaper - positioned top right */}
      <div className="absolute right-[-10px] top-6 transform rotate-[35deg] scale-90 opacity-95 drop-shadow-[5px_15px_10px_rgba(0,0,0,0.65)] hidden lg:block">
        <RevolverProp />
      </div>

      {/* Real bloodstained Dagger laying on top of the newspaper - positioned bottom left */}
      <div className="absolute left-6 bottom-4 transform -rotate-[45deg] scale-90 opacity-95 drop-shadow-[5px_15px_10px_rgba(0,0,0,0.65)] hidden lg:block">
        <DaggerProp />
      </div>
    </div>
  );
};
