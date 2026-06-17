import React from 'react';
import { Award, BookOpen, Compass, Target, Cpu, HeartHandshake } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about-foundation" className="py-12 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold font-mono tracking-widest text-[#D4AF37] uppercase">Our Backbone</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 mt-1">
            <span>അബിലിറ്റി ഫൗണ്ടേഷൻ പുളിക്കൽ</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xl">|</span>
            <span className="text-[#006A4E] dark:text-emerald-400 text-lg md:text-xl font-normal">Ability Foundation for the Disabled</span>
          </h2>
          <div className="w-16 h-1 bg-[#006A4E] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Introduction Cards Bento Arrangement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main info card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-[#006A4E] dark:text-emerald-400">
                <HeartHandshake className="w-6 h-6" />
                <h3 className="font-bold text-lg md:text-xl">About the Organization (സംഘടനയെക്കുറിച്ച്)</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                <b>Ability Foundation for the Disabled</b> is headquartered in the beautiful village of Pulikkal, Malappuram district, Kerala. Established with a profound vision to cultivate equal-access learning, the foundation focuses on rehabilitating,educating, and mentoring individuals with physical, visual, auditory, and cognitive challenges. 
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base mt-2">
                ശാരീരികവും ജ്ഞാനപരവുമായ വെല്ലുവിളികൾ നേരിടുന്ന സാധാരണക്കാരായ വിദ്യാർത്ഥികൾക്ക് കരുത്തുപകരാൻ മലപ്പുറം ജില്ലയിലെ പുളിക്കൽ ആസ്ഥാനമായി പ്രവർത്തിക്കുന്ന പ്രശസ്തമായ സ്ഥാപനമാണ് അബിലിറ്റി ഫൗണ്ടേഷൻ. ഭിന്നശേഷിക്കാരായ യുവാക്കൾക്ക് തൊഴിലധിഷ്ഠിത വിദ്യാഭ്യാസവും സർക്കാർ തൊഴിൽ നിയമന മാർഗ്ഗനിർദ്ദേശങ്ങളും നൽകി അവർക്ക് അന്തസ്സും സ്വയംപര്യാപ്തതയും നൽകുക എന്നതാണ് ഫൗണ്ടേഷന്റെ ലക്ഷ്യം.
              </p>
            </div>
            
            {/* Target and PSC coaching */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 dark:bg-emerald-950/40 p-2 rounded-lg text-[#006A4E] dark:text-emerald-400 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">PSC Support (പി.എസ്.സി സപ്പോർട്ട്)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Special audio notes, customized mock test modules, physical coaching assists.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-100 dark:bg-emerald-950/40 p-2 rounded-lg text-[#006A4E] dark:text-emerald-400 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">Computer Training (കമ്പ്യൂട്ടർ പരിശീലനം)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Professional programming, assistive-tech typing courses, and cyber awareness.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vision and Mission Card */}
          <div className="bg-gradient-to-br from-[#006A4E] to-emerald-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-md">
            
            {/* Vision */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-300">
                <Compass className="w-5 h-5" />
                <h3 className="font-mono text-sm tracking-wider uppercase font-bold text-yellow-400">Our Vision (വിഷൻ)</h3>
              </div>
              <p className="text-xs md:text-sm text-emerald-100 leading-relaxed font-sans">
                "To witness a barrier-free Kerala where every individual, regardless of physical disabilities, stands self-reliant and holds equal leadership roles in civil administration and technological sectors."
              </p>
              <p className="text-xs mt-1 text-yellow-100/90 italic">
                "ഭിന്നശേഷി വിമുക്തമായ സാമൂഹിക അന്തരീക്ഷവും, ഭരണ പങ്കാളിത്തവും, സമത്വവുമുള്ള ഒരു വിജ്ഞാന സമൂഹം."
              </p>
            </div>

            {/* Mission */}
            <div className="pt-4 border-t border-emerald-800/60">
              <div className="flex items-center gap-2 mb-2 text-yellow-300">
                <Target className="w-5 h-5" />
                <h3 className="font-mono text-sm tracking-wider uppercase font-bold text-yellow-400">Our Mission (മിഷൻ)</h3>
              </div>
              <ul className="text-xs text-emerald-100 leading-relaxed font-sans space-y-1.5 list-disc pl-4">
                <li>Provide intensive customized coaching for state recruitment examinations.</li>
                <li>Design and employ advanced digital tools paired with AI for inclusive learning libraries.</li>
                <li>Ensure seamless digital accessibility standards across classrooms and mock test networks.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Feature row detailing accomplishments */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
            <span className="block text-xl md:text-2xl font-bold text-[#006A4E] dark:text-emerald-400">850+</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Students Mentored (പരിശീലനം നേടിയവർ)</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
            <span className="block text-xl md:text-2xl font-bold text-[#006A4E] dark:text-emerald-400">14+ Years</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Legacy of Commitment (പാരമ്പര്യം)</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
            <span className="block text-xl md:text-2xl font-bold text-[#006A4E] dark:text-emerald-400">120+</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Govt Postings Achieved (സർക്കാർ ജോലി)</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
            <span className="block text-xl md:text-2xl font-bold text-[#006A4E] dark:text-emerald-400">100% Free</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Education for Disabled (സൗജന്യ വിദ്യാഭ്യാസം)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
