
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Terms & Privacy" />
      
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <div className="space-y-16">
          {/* Terms of Service Section */}
          <section>
            <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 text-center">
              📜 Terms of Service
            </h1>
            
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 mb-8">
              <p className="text-gray-300 mb-2">
                <strong>Effective Date:</strong> June 22, 2025
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Website:</strong> <span className="text-cyan-400">https://reapertech.xyz</span>
              </p>
              <p className="text-gray-300">
                <strong>Operator:</strong> ReaperTech — Sole Proprietorship, founded by Cameron Joshua Nelms
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using ReaperTech's website, products, digital tools, shortcuts, or services ("Services"), you agree to be bound by these Terms. If you do not agree, you may not access the site or use any services provided by ReaperTech.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">2. Purpose</h2>
                <p className="text-gray-300 leading-relaxed">
                  ReaperTech exists to empower individuals through automation, AI co-pilots, cryptocurrency tools, and privacy-centric infrastructure. We create solutions that walk the edge of possibility: poetic, technical, and transformational.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">3. User Responsibilities</h2>
                <p className="text-gray-300 leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Use our tools to violate laws, exploit systems, or harm others</li>
                  <li>Resell or repackage digital works without explicit permission</li>
                  <li>Attempt unauthorized access to the site, tools, or users' data</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Use of our tools requires discernment. Use them wisely and with intention.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">4. Intellectual Property</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  All content on this site — including logos, tools, text, code, visuals, and branded materials — are property of ReaperTech unless otherwise noted.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Shortcuts, scripts, and open-source tools may be used, shared, or modified for personal or educational purposes. Commercial use requires written consent.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">5. Tools, Products, and Payments</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li><strong>Digital Tools (Shortcuts, Scripts):</strong> Provided "as-is", with no guarantee of functionality across all iOS/macOS versions.</li>
                  <li><strong>Physical Products (e.g. cables, adapters):</strong> Come with a 30-day Reaper's Warranty covering manufacturer defects.</li>
                  <li><strong>Crypto Payments:</strong> Pi Network transactions are final and irreversible unless agreed upon prior to exchange.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed">
                  ReaperTech shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the website or its tools — digital or physical. You assume full responsibility for how you engage with our Services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">7. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may revise these Terms over time. Major updates will be posted on the site. Continued use after changes implies acceptance.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">8. Final Note</h2>
                <p className="text-gray-300 leading-relaxed">
                  This isn't just tech. This is legacy design, and we treat your time and trust as sacred. You're not just a user — you're a traveler. Walk with care. We do, too.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section className="border-t border-gray-700 pt-16">
            <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 text-center">
              🔐 Privacy Policy
            </h1>
            
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 mb-8">
              <p className="text-gray-300 mb-2">
                <strong>Effective Date:</strong> June 22, 2025
              </p>
              <p className="text-orange-500 italic font-mono">
                We don't track shadows. We honor your light.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">1. What We Collect</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Minimal, purpose-driven data only.</strong>
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">We collect:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Contact information if you email or message us</li>
                  <li>Order/shipping info for physical products</li>
                  <li>Site usage data via privacy-first analytics (e.g., Plausible or local log files)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">2. What We Never Do</h2>
                <p className="text-gray-300 leading-relaxed mb-4">We never:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Sell your data</li>
                  <li>Track you across the web</li>
                  <li>Use invasive advertising pixels (like Meta or Google trackers)</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  We protect your digital presence the way we wish ours was protected.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">3. Payment Information</h2>
                <p className="text-gray-300 leading-relaxed">
                  All payments are handled by trusted third-party processors. We do not store full payment details on our servers. Pi Network wallet transactions are peer-to-peer and fully user-controlled.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">4. Cookies & Analytics</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use minimal, privacy-conscious methods to understand site activity:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Anonymous page visit counts</li>
                  <li>Local caching for session performance</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  No third-party cookies. No dark patterns.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">5. Your Rights</h2>
                <p className="text-gray-300 leading-relaxed mb-4">You may:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Request to see any data we hold about you</li>
                  <li>Request correction or deletion</li>
                  <li>Request full deletion of your account if applicable</li>
                  <li>Opt out of non-essential communications at any time</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  Email: <span className="text-cyan-400">admin@reapertech.xyz</span>
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">6. Security Measures</h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement encryption, access controls, and mindful design to ensure your data — and your presence — are treated with care and respect.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">7. Updates</h2>
                <p className="text-gray-300 leading-relaxed">
                  This policy may evolve. We'll post updates here. You'll always have the right to know what changes and why.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-4">8. Final Words</h2>
                <div className="text-center space-y-2 text-gray-300 leading-relaxed">
                  <p>At ReaperTech, we don't just build tools.</p>
                  <p>We craft lanterns for the journey.</p>
                  <p>And we don't follow your steps — we protect the path ahead.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
