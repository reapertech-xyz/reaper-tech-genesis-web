interface ThiingsIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ThiingsIcon = ({ name, className = "", size = 24 }: ThiingsIconProps) => {
  const iconMap: Record<string, string> = {
    // Existing icons
    reaperHood: "/lovable-uploads/1d232681-b4f3-4e00-8fa3-93aeb478dee6.png",
    bolt: "/lovable-uploads/74a314ec-2755-4636-a063-5d1e955d796e.png",
    wallAdapter: "/lovable-uploads/4687d604-305c-408c-9bfc-1901697c58c3.png",
    datacenter: "/lovable-uploads/15c896f9-a037-42e5-92f1-0ef090c3b823.png",
    blockchain: "/lovable-uploads/7e97b17f-51ec-4e6e-a38a-155d4e9f8d7e.png",
    phoneGradient: "/lovable-uploads/126b1c87-1012-499e-844e-2728aa50c1a4.png",
    foldablePhone: "/lovable-uploads/f6f26f26-8f46-4e86-8d8b-6526bafc9c7f.png",
    wifi: "/lovable-uploads/8c78d661-e33d-4284-93c9-3e1df8015e54.png",
    delivery: "/lovable-uploads/82638358-fa89-4121-9e3d-b6a0778be47d.png",
    laptop: "/lovable-uploads/3470e7ce-e63c-44cd-8fc3-ff741c77075a.png",

    // New icons from latest upload
    serverRack: "/lovable-uploads/59e25f0a-2853-4447-bce5-3f4c193b0af1.png",
    hardDrive: "/lovable-uploads/d58b2aad-a3c0-4c35-bf62-b7b7b9632189.png",
    gameController: "/lovable-uploads/bd222062-3e34-4686-9281-e8f428f4c6df.png",
    circuit: "/lovable-uploads/737fa37e-72d2-4527-a59a-a57c7928eb10.png",
    robotHead: "/lovable-uploads/f9eca089-3b42-4b20-9bc1-903799fff348.png",
    database: "/lovable-uploads/6d3954e7-3b6f-464c-8fcf-c4450ff557d1.png",
    usb: "/lovable-uploads/48dde519-2a04-4985-9566-601400e3281a.png",
    smartphone: "/lovable-uploads/c2e7c1bd-822f-4754-b337-61ecdeb81288.png",
    tablet: "/lovable-uploads/586974d3-9173-427d-9ae7-17e13e0378fe.png",
    networkCard: "/lovable-uploads/31e6b38f-96a0-4276-b51c-1bf8efe11f45.png"
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
