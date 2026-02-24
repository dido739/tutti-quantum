import { ParticleCard as ParticleCardType, getParticleInfo } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

import electronImg from '@/assets/particles/electron.svg';
import gluonImg from '@/assets/particles/gluon.svg';
import higgsImg from '@/assets/particles/higgs.svg';
import photonImg from '@/assets/particles/photon.svg';
import quarkImg from '@/assets/particles/quark.svg';

const particleTextures: Record<string, string> = {
  quark: quarkImg,
  antiquark: quarkImg,
  electron: electronImg,
  positron: electronImg,
  photon: photonImg,
  gluon: gluonImg,
  higgs: higgsImg,
};

const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

interface ParticleCardProps {
  card: ParticleCardType;
  onClick?: () => void;
  onRotate?: (degrees: number) => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRotateButton?: boolean;
}

export function ParticleCard({
  card,
  onClick,
  onRotate,
  selected = false,
  disabled = false,
  size = 'lg',
  showRotateButton = false,
}: ParticleCardProps) {
  const info = getParticleInfo(card.type);
  const texture = particleTextures[card.type];

  // Match GameBoard cell dimensions exactly
  const dims = {
    sm: { w: 72, h: 62 },
    md: { w: 112, h: 97 },
    lg: { w: 150, h: 130 },
    xl: { w: 170, h: 147 },
  };
  const { w, h } = dims[size];

  return (
    <div className="relative group" style={{ width: w, height: h }}>
      {selected && (
        <div
          className="absolute -inset-1 bg-primary/40 animate-pulse z-0"
          style={{ clipPath: HEX_CLIP }}
        />
      )}

      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative w-full h-full overflow-hidden transition-all duration-200',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110',
        )}
        style={{
          clipPath: HEX_CLIP,
          transform: `rotate(${card.rotation}deg)`,
        }}
      >
        <img
          src={texture}
          alt={info.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </button>

      {showRotateButton && onRotate && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRotate(60);
          }}
          className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 p-1 rounded-full',
            'bg-card border border-border',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-muted z-10'
          )}
        >
          <RotateCw className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
