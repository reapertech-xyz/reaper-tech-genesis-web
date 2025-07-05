import { iconMappings } from './iconMappings';

interface ThiingsIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ThiingsIcon = ({ name, className = "", size = 24 }: ThiingsIconProps) => {
  const iconSrc = iconMappings[name];
  
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