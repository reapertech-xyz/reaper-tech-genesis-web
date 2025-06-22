
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Shop = () => {
  const products = [
    {
      title: "⚡ USB-C to USB-C Cable",
      prices: "$6 / $8 / $10",
      subtitle: "3ft / 6ft / 10ft",
      style: "Braided, Durable, PD-Ready",
      description: "For when power meets purpose. Charge your Android, iPad, MacBook, Steam Deck, or future-self with this high-speed link. Braided to survive life's tangles — fast enough to keep up with yours.",
      images: []
    },
    {
      title: "⚙️ USB-C to USB-A Cable",
      prices: "$5 / $7 / $9",
      subtitle: "3ft / 6ft / 10ft",
      style: "Classic Sync & Charge",
      description: "Because not everything old is obsolete. Bridge the past and present with this classic combo — your USB-A chargers still have work to do, and this cord makes sure they're still invited to the party.",
      images: []
    },
    {
      title: "🍎 USB-C to Lightning Cable",
      prices: "$8 / $10 / $12",
      subtitle: "3ft / 6ft / 10ft",
      style: "Apple MFi Certified",
      description: "A cord for the Apple-inclined. Whether you're juicing up your iPhone, AirPods, or memories — this one does it fast, clean, and with reverence for the cult of Cupertino.",
      images: []
    },
    {
      title: "🔋 20W USB-A + USB-C Wall Adapter",
      prices: "$10",
      subtitle: "Dual Output: 1x USB-C PD + 1x USB-A QC",
      style: "Perfect power, twin-born.",
      description: "One port for the future, one for the friends you haven't upgraded yet. Compact. Travel-proof. Non-negotiably useful.",
      images: [
        "/lovable-uploads/b24398d9-0184-4d4a-8ead-a10fa7788145.png",
        "/lovable-uploads/a8c41a43-a495-4da5-97e0-bf38f797a9b5.png",
        "/lovable-uploads/40b46ec3-f94b-4929-b158-e4c5a4a20634.png",
        "/lovable-uploads/9be0c8a6-4ae6-4101-83da-17633e0cae12.png",
        "/lovable-uploads/e7bf68fa-5661-4824-8c2b-9d68ddb391c6.png"
      ]
    },
    {
      title: "💻 65W USB-C Laptop Charger Block",
      prices: "$18",
      subtitle: "Single Port: USB-C PD 3.0",
      style: "For your MacBook, iPad Pro, Chromebook, Steam Deck, or anything else that breathes in watts.",
      description: "This is the block that doesn't break — small enough to pocket, powerful enough to resurrect.",
      images: []
    },
    {
      title: "🌐 100W 4-Port USB Hub Charger",
      prices: "$25",
      subtitle: "Ports: 2x USB-C + 2x USB-A",
      style: "Charge your world. All at once.",
      description: "Designed for desks, co-working rituals, or traveling shamans. Share the current with up to four devices — fast, safe, and without judgment.",
      images: [
        "/lovable-uploads/586974d3-9173-427d-9ae7-17e13e0378fe.png",
        "/lovable-uploads/31e6b38f-96a0-4276-b51c-1bf8efe11f45.png",
        "/lovable-uploads/6d3954e7-3b6f-464c-8fcf-c4450ff557d1.png",
        "/lovable-uploads/48dde519-2a04-4985-9566-601400e3281a.png",
        "/lovable-uploads/c2e7c1bd-822f-4754-b337-61ecdeb81288.png"
      ]
    }
  ];

  const handleAddToCart = (productTitle: string) => {
    console.log("Adding to cart:", productTitle);
    // Navigate to cart page for now
    window.location.href = '/cart';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="The Reaper's Cache" />
      
      <main className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8">
            🛒 The Reaper's Cache
          </h1>
          <p className="text-xl text-gray-300 mb-4">Where every connection matters.</p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            These tools aren't just cables or chargers — they're lifelines for creators, travelers, late-night coders, and the broken-but-building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product, index) => (
            <Card key={index} className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono text-lg">
                  {product.title}
                </CardTitle>
                <CardDescription className="text-orange-500 font-bold text-lg">
                  {product.prices}
                </CardDescription>
                <p className="text-gray-400 text-sm">{product.subtitle}</p>
                <p className="text-cyan-300 font-mono text-sm italic">{product.style}</p>
              </CardHeader>
              <CardContent>
                {product.images.length > 0 && (
                  <div className="mb-4">
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="w-full h-48 object-contain bg-white rounded-lg mb-2"
                    />
                    {product.images.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {product.images.slice(1).map((image, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={image} 
                            alt={`${product.title} - ${imgIndex + 2}`}
                            className="w-16 h-16 object-contain bg-white rounded flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-gray-300 leading-relaxed mb-4">
                  {product.description}
                </p>
                <Button 
                  onClick={() => handleAddToCart(product.title)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-12">
          <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 text-center">
            🛠️ Warranty, Vibes, & Pi
          </h2>
          
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <p className="text-lg mb-6">Every item is:</p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <span className="text-cyan-400">🔄</span>
                <span>Backed by a 30-day No-Bull Warranty</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-cyan-400">💰</span>
                <span>Accepting cash, card, and Pi Network Coin</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-cyan-400">🖤</span>
                <span>Packed with intention and handled with care</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400">
              📦 Shipping available locally or via drop. Message to barter, bundle, or ask if the spirits recommend USB-C today.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
