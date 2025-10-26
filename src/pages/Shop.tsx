import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThiingsIcon from "@/components/ThiingsIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Shield, ShoppingCart } from "lucide-react";
import CreateEscrowForm from "@/components/escrow/CreateEscrowForm";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const Shop = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [escrowDialogOpen, setEscrowDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const { user, profile } = useUnifiedAuth();
  
  const products = [
    {
      id: "usb-c-to-usb-c",
      title: <><ThiingsIcon name="usbCable" size={16} className="mr-2" />USB-C to USB-C Cable</>,
      prices: "$6 / $8 / $10",
      subtitle: "3ft / 6ft / 10ft",
      style: "Braided, Durable, PD-Ready",
      description: "For when power meets purpose. Charge your Android, iPad, MacBook, Steam Deck, or future-self with this high-speed link. Braided to survive life's tangles — fast enough to keep up with yours.",
      images: [],
      price: 8
    },
    {
      id: "usb-c-to-usb-a",
      title: <><ThiingsIcon name="cable" size={16} className="mr-2" />USB-C to USB-A Cable</>,
      prices: "$5 / $7 / $9",
      subtitle: "3ft / 6ft / 10ft",
      style: "Classic Sync & Charge",
      description: "Because not everything old is obsolete. Bridge the past and present with this classic combo — your USB-A chargers still have work to do, and this cord makes sure they're still invited to the party.",
      images: [],
      price: 7
    },
    {
      id: "usb-c-to-lightning",
      title: <><ThiingsIcon name="smartphone3D" size={16} className="mr-2" />USB-C to Lightning Cable</>,
      prices: "$8 / $10 / $12",
      subtitle: "3ft / 6ft / 10ft",
      style: "Apple MFi Certified",
      description: "A cord for the Apple-inclined. Whether you're juicing up your iPhone, AirPods, or memories — this one does it fast, clean, and with reverence for the cult of Cupertino.",
      images: [],
      price: 10
    },
    {
      id: "20w-dual-adapter",
      title: <><ThiingsIcon name="plug3D" size={16} className="mr-2" />20W USB-A + USB-C Wall Adapter</>,
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
      ],
      price: 10
    },
    {
      id: "65w-laptop-charger",
      title: <><ThiingsIcon name="charger" size={16} className="mr-2" />65W USB-C Laptop Charger Block</>,
      prices: "$32.50",
      subtitle: "Single Port: USB-C PD 3.0",
      style: "For your MacBook, iPad Pro, Chromebook, Steam Deck, or anything else that breathes in watts.",
      description: "This is the block that doesn't break — small enough to pocket, powerful enough to resurrect.",
      images: [
        "/lovable-uploads/41e8d866-fd9d-4929-8109-4e9bc706e4c8.png",
        "/lovable-uploads/028243a6-798c-4bd8-90b7-13cf369f9000.png",
        "/lovable-uploads/156a0073-2383-4ec7-996c-d06fd8590f93.png",
        "/lovable-uploads/b8562a26-74d6-41f4-8731-1c61a8e62388.png",
        "/lovable-uploads/665b952b-a25d-4caa-93e5-a69adea20e60.png"
      ],
      price: 32.50
    },
    {
      id: "100w-hub-charger",
      title: <><ThiingsIcon name="network" size={16} className="mr-2" />100W 4-Port USB Hub Charger</>,
      prices: "$50.00",
      subtitle: "Ports: 3x USB-C + 1x USB-A",
      style: "Charge your world. All at once.",
      description: "Designed for desks, co-working rituals, or traveling shamans. Share the current with up to four devices — fast, safe, and without judgment.",
      images: [
        "/lovable-uploads/586974d3-9173-427d-9ae7-17e13e0378fe.png",
        "/lovable-uploads/31e6b38f-96a0-4276-b51c-1bf8efe11f45.png",
        "/lovable-uploads/6d3954e7-3b6f-464c-8fcf-c4450ff557d1.png",
        "/lovable-uploads/48dde519-2a04-4985-9566-601400e3281a.png",
        "/lovable-uploads/c2e7c1bd-822f-4754-b337-61ecdeb81288.png"
      ],
      price: 50.00
    }
  ];

  const addToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        name: typeof product.title === 'string' ? product.title : product.id,
        price: product.price,
        qty: 1
      }];
    });
  };

  const handleAddToCart = (product: typeof products[0]) => {
    console.log("Adding to cart:", product.title);
    addToCart(product);
    // Store cart in localStorage for persistence
    const updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex(item => item.id === product.id);
    if (existingItemIndex >= 0) {
      updatedCart[existingItemIndex].qty += 1;
    } else {
      updatedCart.push({
        id: product.id,
        name: typeof product.title === 'string' ? product.title : product.id,
        price: product.price,
        qty: 1
      });
    }
    localStorage.setItem('reaper-cart', JSON.stringify(updatedCart));
  };

  const handleGoToCart = () => {
    // Store current cart in localStorage before navigating
    localStorage.setItem('reaper-cart', JSON.stringify(cart));
    window.location.href = '/cart';
  };

  const handleBuyWithEscrow = (product: typeof products[0]) => {
    if (!user && !profile) {
      window.location.href = '/auth';
      return;
    }
    setSelectedProduct(product);
    setEscrowDialogOpen(true);
  };

  const ImageGallery = ({ images, title }: { images: string[], title: string }) => {
    if (images.length === 0) return null;

    return (
      <div className="mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <img 
              src={images[0]} 
              alt={title}
              className="w-full h-48 object-contain bg-white rounded-lg mb-2 cursor-pointer hover:scale-105 transition-transform duration-200"
            />
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-auto object-contain bg-white rounded-lg"
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
        
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto">
            {images.slice(1).map((image, imgIndex) => (
              <Dialog key={imgIndex}>
                <DialogTrigger asChild>
                  <img 
                    src={image} 
                    alt={`${title} - ${imgIndex + 2}`}
                    className="w-16 h-16 object-contain bg-white rounded flex-shrink-0 cursor-pointer hover:scale-110 transition-transform duration-200"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <img 
                    src={image} 
                    alt={`${title} - Image ${imgIndex + 2}`}
                    className="w-full h-auto object-contain bg-white rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="The Reaper's Cache" />
      
      <main className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-8 flex items-center justify-center">
            <ThiingsIcon name="skull3D" size={32} className="mr-3" />
            The Reaper's Cache
          </h1>
          <p className="text-xl text-gray-300 mb-4 flex items-center justify-center">
            <ThiingsIcon name="gem3D" size={20} className="mr-2" />
            Where every connection matters.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            These tools aren't just cables or chargers — they're lifelines for creators, travelers, late-night coders, and the broken-but-building.
          </p>
          
          {cart.length > 0 && (
            <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-cyan-500">
              <p className="text-cyan-400 font-mono mb-2 flex items-center justify-center">
                <ThiingsIcon name="box3D" size={20} className="mr-2" />
                Cart: {cart.reduce((total, item) => total + item.qty, 0)} items
              </p>
              <Button 
                onClick={handleGoToCart}
                className="bg-orange-500 hover:bg-orange-600 text-white font-mono"
              >
                View Cart & Checkout
              </Button>
            </div>
          )}
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
                <ImageGallery images={product.images} title={typeof product.title === 'string' ? product.title : 'Product'} />
                <p className="text-gray-300 leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={() => handleBuyWithEscrow(product)}
                    variant="outline"
                    className="w-full border-gray-700 bg-green-500 text-white hover:bg-green-600 font-mono"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Buy with Escrow Protection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-12">
          <h2 className="text-3xl font-bold font-mono text-cyan-400 mb-8 text-center flex items-center justify-center">
            <ThiingsIcon name="shield3D" size={24} className="mr-3" />
            Warranty, Vibes, & Pi
          </h2>
          
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <p className="text-lg mb-6 flex items-center">
              <ThiingsIcon name="crown3D" size={20} className="mr-2" />
              Every item is:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <ThiingsIcon name="shield3D" size={16} />
                <span>Backed by a 30-day No-Bull Warranty</span>
              </li>
              <li className="flex items-center space-x-3">
                <ThiingsIcon name="coin3D" size={16} />
                <span>Accepting cash, card, and Pi Network Coin</span>
              </li>
              <li className="flex items-center space-x-3">
                <ThiingsIcon name="lightning3D" size={16} />
                <span>Packed with intention and handled with care</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400 flex items-center justify-center">
              <ThiingsIcon name="truck3D" size={16} className="mr-2" />
              Shipping available locally or via drop. Message to barter, bundle, or ask if the spirits recommend USB-C today.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Escrow Purchase Dialog */}
      <Dialog open={escrowDialogOpen} onOpenChange={setEscrowDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buy with Escrow Protection</DialogTitle>
            <DialogDescription>
              Secure your purchase with escrow - funds are held until you confirm receipt
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <CreateEscrowForm
              onSuccess={() => {
                setEscrowDialogOpen(false);
                setSelectedProduct(null);
              }}
              prefillData={{
                amount: selectedProduct.price,
                description: `Purchase: ${typeof selectedProduct.title === 'string' ? selectedProduct.title : selectedProduct.id}`,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
