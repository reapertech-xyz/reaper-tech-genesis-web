
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThiingsIcon from "@/components/ThiingsIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Shortcuts = () => {
  const shortcuts = [
    {
      title: <><ThiingsIcon name="reaperHood" size={16} className="mr-2" />TiD-BiT <ThiingsIcon name="datacenter" size={16} className="ml-2" /></>,
      subtitle: "Tiny Dissertations, Big Thinking",
      description: "An AI-powered shortcut that lets you generate bite-sized essays, reflections, or intellectual explorations on any subject. Ideal for students, researchers, creatives, or thinkers in a rush. Powered by ChatGPT, styled by Reaper.",
      action: "→ Tap to Converse. Tap again to Conquer."
    },
    {
      title: <><ThiingsIcon name="phoneGradient" size={16} className="mr-2" />White Steg (White-Space Steganographer)</>,
      subtitle: "Say more with nothing at all",
      description: "Encode or decode hidden messages inside white space — for use in plaintext, email, or social media captions. It's privacy without paranoia. Subtle as a whisper. Sharp as a dagger.",
      action: "→ Supports Unicode, zero-width, and whitespace-based layers."
    },
    {
      title: <><ThiingsIcon name="blockchain" size={16} className="mr-2" />Slice of Pi</>,
      subtitle: "A Piece of the Future in Your Pocket",
      description: "Currently in development: a full-featured Pi Network wallet, shortcut-accessible, offering: Balance checks, Transaction history, QR code payments, Offline caching, Voice-integrated commands",
      action: "→ Coming Soon for iPhone + iPad\nYour slice is almost served.",
      isComingSoon: true
    },
    {
      title: <><ThiingsIcon name="foldablePhone" size={16} className="mr-2" />MemeEDU Generator</>,
      subtitle: "Memes with Meaning. AI with Edge.",
      description: "This shortcut generates educational memes or image macros with real-world facts, theories, or arguments embedded into meme templates. Meme responsibly. Learn irreverently.",
      action: "→ Perfect for TikTok teachers, Discord rebels, and brainy trolls."
    }
  ];

  const otherShortcuts = [
    "Bill Pay Walkthrough", "Run Pythonista Script", "Resolve Web3 Domains", "Run JavaScript on Page", 
    "Send to PC", "HMAC SHA256 Utility", "Sweeper's Toolbox", "Watch Vsauce on YouTube", 
    "Find Cameron's Wallet (Tile Integration)", "Ask ChatGPT + Subject-to-ChatGPT Pipelines"
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="iOS Shortcuts Gallery" />
      
      <main className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
            <ThiingsIcon name="foldablePhone" size={32} className="mr-3" />
            Reaper Tech iOS Shortcuts Gallery
          </h1>
          <div className="space-y-4 text-lg">
            <p className="text-orange-500 font-bold">Lightweight. Lethal. Lantern-born.</p>
            <p className="text-gray-300">Built to bend your Apple device to your will.</p>
            <p className="text-gray-400">Automations that aren't just smart — they're soulful.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {shortcuts.map((shortcut, index) => (
            <Card key={index} className={`bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors ${shortcut.isComingSoon ? 'border-orange-500' : ''}`}>
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono text-xl">
                  {shortcut.title}
                </CardTitle>
                <CardDescription className="text-orange-500 font-bold text-lg italic">
                  "{shortcut.subtitle}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  {shortcut.description}
                </p>
                <p className="text-cyan-300 font-mono text-sm whitespace-pre-line">
                  {shortcut.action}
                </p>
                <Button className={`w-full font-mono ${shortcut.isComingSoon ? 'bg-orange-500 hover:bg-orange-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-black`} disabled={shortcut.isComingSoon}>
                  {shortcut.isComingSoon ? 'Coming Soon' : 'Download Shortcut'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-12">
          <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
            <ThiingsIcon name="wifi" size={24} className="mr-3" />
            Also Available in the Gallery:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {otherShortcuts.map((shortcut, index) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
                <p className="text-gray-300 font-mono">{shortcut}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-12 text-center">
          <p className="text-lg text-gray-300 mb-4 flex items-center justify-center">
            <ThiingsIcon name="bolt" size={16} className="mr-2" />
            All shortcuts run on macOS + iOS. Many support Share Sheet, Quick Actions, and Home Screen integrations.
          </p>
          
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 mt-8">
            <h3 className="text-2xl font-bold font-mono text-cyan-400 mb-4 flex items-center justify-center">
              <ThiingsIcon name="reaperHood" size={20} className="mr-2" />
              Reaper Tech Shortcuts
            </h3>
            <p className="text-lg text-orange-500 mb-2">Shareable. Hackable. Ritual-ready.</p>
            <p className="text-gray-400 italic flex items-center justify-center">
              <ThiingsIcon name="datacenter" size={16} className="mr-2" />
              "Smarter not just by function — but by feeling."
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shortcuts;
