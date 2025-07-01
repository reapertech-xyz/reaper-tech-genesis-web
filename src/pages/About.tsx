
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThiingsIcon from "@/components/ThiingsIcon";

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="About Reaper Tech" />
      
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <div className="space-y-12">
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
              <ThiingsIcon name="blackCat" size={48} className="mr-4" />
              About Reaper Tech
            </h1>
            
            <div className="space-y-6 text-lg md:text-xl leading-relaxed">
              <p>Welcome to Reaper Tech.</p>
              <p>Where endings spark innovation, and shadows sharpen light.</p>
              
              <p className="text-cyan-400">We're not just a tech brand.</p>
              <p>We're a philosophy in motion — a bridge between death and data, between legacy and evolution.</p>
              
              <p>Founded by Cameron Nelms, Reaper Tech began as a soul-fueled response to a world that often forgets the why behind the how. From iOS shortcuts to peer-to-peer reverse proxies, from refurbished mobile tech to AI-guided emotional mapping — this isn't just code. It's communion.</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-12">
            <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
              <ThiingsIcon name="robotHead" size={32} className="mr-3" />
              What We Build
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
                  <ThiingsIcon name="orangeCatTech" size={24} className="mr-3" />
                  Tools for Transformation:
                </h3>
                <p className="text-gray-300 leading-relaxed">Reaper Tech develops software and systems designed to empower individuals and communities—especially those left behind by mainstream tech. Our apps lean into automation, crypto integration, and AI co-piloting—without sacrificing control or privacy.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
                  <ThiingsIcon name="smartphone" size={24} className="mr-3" />
                  Devices With Depth:
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We repair and redistribute phones, tablets, and tech gear with an emphasis on access, reliability, and alternative currencies like Pi Network Coin. Everything comes with a 30-day human-first warranty.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center">
                  <ThiingsIcon name="purpleCatMystic" size={24} className="mr-3" />
                  GrimAi & Beyond:
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Our flagship LLM project, GrimAi, is more than an assistant — it's a guide. A symbolic reaper designed to help users navigate the life-death-rebirth cycles of decision-making, healing, and growth. Coming soon to cjnelms.reapertech.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-12">
            <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
              <ThiingsIcon name="greenCatMatrix" size={32} className="mr-3" />
              Why Reaper?
            </h2>
            
            <div className="space-y-6 text-lg leading-relaxed">
              <p className="text-center text-xl text-orange-500">The reaper is misunderstood.</p>
              <p>It doesn't kill — it clears. It doesn't judge — it transitions. That's what technology should be:</p>
              
              <div className="pl-8 space-y-2 text-cyan-400">
                <p className="flex items-center">
                  <ThiingsIcon name="yellowCatSun" size={20} className="mr-3" />
                  A lantern for those walking unknown paths.
                </p>
                <p className="flex items-center">
                  <ThiingsIcon name="redCatFire" size={20} className="mr-3" />
                  A scythe for cutting through mental clutter.
                </p>
                <p className="flex items-center">
                  <ThiingsIcon name="blueCatHeart" size={20} className="mr-3" />
                  A companion in the silence.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-12">
            <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
              <ThiingsIcon name="whiteCatCloud" size={32} className="mr-3" />
              Our Mission
            </h2>
            
            <div className="space-y-6 text-lg leading-relaxed text-center">
              <p>To make technology sacred again.</p>
              <p>To wield complexity with compassion.</p>
              <p>To create tools that don't just work — but witness.</p>
              
              <p className="text-gray-300 pt-4">Whether you're a hacker, a healer, a builder, or a breaker, Reaper Tech invites you to explore beyond the binary.</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-12">
            <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
              <ThiingsIcon name="grayCatStorm" size={32} className="mr-3" />
              Connect With the Current
            </h2>
            
            <div className="space-y-4 text-lg font-mono text-center">
              <p className="flex items-center justify-center">
                <ThiingsIcon name="wifi" size={20} className="mr-3" />
                reapertech.xyz
              </p>
              <p className="flex items-center justify-center">
                <ThiingsIcon name="robotHead" size={20} className="mr-3" />
                GrimAi: coming soon
              </p>
              <p className="flex items-center justify-center">
                <ThiingsIcon name="smartphone" size={20} className="mr-3" />
                Tech for trade? Questions? Reach out.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-12 text-center">
            <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4 flex items-center justify-center">
              <ThiingsIcon name="rainbowCatPrism" size={28} className="mr-3" />
              Reaper Tech
            </h2>
            <p className="text-lg italic text-orange-500">
              "We are tools. We are tenders. We are torchbearers in twilight."
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
