
interface ThiingsIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ThiingsIcon = ({ name, className = "", size = 20 }: ThiingsIconProps) => {
  const iconMap: Record<string, string> = {
    // Original icons
    reaper: "/lovable-uploads/a0d7e7f6-cde9-4c37-a6ea-7844c56f8ce4.png",
    lightning: "/lovable-uploads/7b614084-86fa-48ff-b6c9-22eff3488b7c.png",
    cable: "/lovable-uploads/1c1522fb-317f-40b7-9b0e-f072b5a2fe2b.png",
    router: "/lovable-uploads/0788c7eb-eefc-478d-8776-1dfc1ba26ecd.png",
    server: "/lovable-uploads/453ac9ad-2606-40ba-af65-7ada63126bf7.png",
    phoneCase: "/lovable-uploads/fad99734-1e49-4610-b186-c3c6679fae12.png",
    foldPhone: "/lovable-uploads/a9d0cb77-49df-4537-a7c6-30920ba92b19.png",
    network: "/lovable-uploads/a9dbdf73-4b35-4c9f-b28d-4cd07494f0af.png",
    shipping: "/lovable-uploads/bc41d660-9241-4a82-896c-8678ab5f6bf2.png",
    charger: "/lovable-uploads/c812c68b-0bba-4fc4-a788-34967ef22ed6.png",
    
    // New icons from your upload
    wallAdapter: "/lovable-uploads/7e97b17f-51ec-4e6e-a38a-155d4e9f8d7e.png",
    phoneGradient: "/lovable-uploads/82638358-fa89-4121-9e3d-b6a0778be47d.png",
    foldablePhone: "/lovable-uploads/3470e7ce-e63c-44cd-8fc3-ff741c77075a.png",
    bolt: "/lovable-uploads/1d232681-b4f3-4e00-8fa3-93aeb478dee6.png",
    reaperHood: "/lovable-uploads/126b1c87-1012-499e-844e-2728aa50c1a4.png",
    usbCable: "/lovable-uploads/74a314ec-2755-4636-a063-5d1e955d796e.png",
    blockchain: "/lovable-uploads/4687d604-305c-408c-9bfc-1901697c58c3.png",
    delivery: "/lovable-uploads/15c896f9-a037-42e5-92f1-0ef090c3b823.png",
    datacenter: "/lovable-uploads/f6f26f26-8f46-4e86-8d8b-6526bafc9c7f.png",
    wifi: "/lovable-uploads/8c78d661-e33d-4284-93c9-3e1df8015e54.png"
  };

  const iconSrc = iconMap[name];
  
  if (!iconSrc) {
    console.warn(`ThiingsIcon: Icon "${name}" not found`);
    return null;
  }

  return (
    <img 
      src={iconSrc} 
      alt={name}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default ThiingsIcon;
