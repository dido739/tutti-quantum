import { ParticleCard as ParticleCardType } from '@/lib/gameLogic';
import { ParticleCard } from './ParticleCard';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  cards: ParticleCardType[];
  selectedCard?: ParticleCardType | null;
  onSelectCard?: (card: ParticleCardType) => void;
  onRotateCard?: (card: ParticleCardType, degrees: number) => void;
  disabled?: boolean;
  isCurrentPlayer?: boolean;
}

export function PlayerHand({
  cards,
  selectedCard,
  onSelectCard,
  onRotateCard,
  disabled = false,
  isCurrentPlayer = false,
}: PlayerHandProps) {
  return (
    <div className={cn(
      'p-4 rounded-xl',
      isCurrentPlayer ? 'bg-primary/10 border border-primary/30' : 'bg-card/50 border border-border/30'
    )}>
      <h3 className={cn(
        'text-sm font-semibold mb-3',
        isCurrentPlayer ? 'text-primary' : 'text-muted-foreground'
      )}>
        {isCurrentPlayer ? 'Your Hand' : 'Hand'}
      </h3>
      
      <div className="flex gap-3 flex-wrap justify-center">
        {cards.map((card) => (
          <ParticleCard
            key={card.id}
            card={card}
            onClick={() => onSelectCard?.(card)}
            onRotate={(degrees) => onRotateCard?.(card, degrees)}
            selected={selectedCard?.id === card.id}
            disabled={disabled}
            size="xl"
            showRotateButton={!disabled && selectedCard?.id === card.id}
          />
        ))}
        
        {cards.length === 0 && (
          <p className="text-muted-foreground text-sm py-8">No cards in hand</p>
        )}
      </div>
    </div>
  );
}
