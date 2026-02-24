import { Trophy, Target, AlertTriangle, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  validVertices: number;
  invalidVertices: number;
  loops?: number;
  className?: string;
  variant?: 'compact' | 'full';
}

export function ScoreDisplay({
  score,
  validVertices,
  invalidVertices,
  loops = 0,
  className,
  variant = 'full',
}: ScoreDisplayProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Trophy className="w-4 h-4 text-primary" />
        <span className="font-display font-bold text-lg">{score}</span>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      <div className="bg-primary/10 rounded-lg p-3 flex items-center gap-3">
        <Trophy className="w-6 h-6 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Total Score</p>
          <p className="font-display font-bold text-2xl text-primary">{score}</p>
        </div>
      </div>
      
      <div className="bg-particle-higgs/10 rounded-lg p-3 flex items-center gap-3">
        <Target className="w-6 h-6 text-particle-higgs" />
        <div>
          <p className="text-xs text-muted-foreground">Valid Vertices</p>
          <p className="font-display font-bold text-2xl text-particle-higgs">{validVertices}</p>
        </div>
      </div>
      
      <div className="bg-destructive/10 rounded-lg p-3 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <div>
          <p className="text-xs text-muted-foreground">Invalid Vertices</p>
          <p className="font-display font-bold text-2xl text-destructive">{invalidVertices}</p>
        </div>
      </div>
      
      <div className="bg-particle-photon/10 rounded-lg p-3 flex items-center gap-3">
        <Repeat className="w-6 h-6 text-particle-photon" />
        <div>
          <p className="text-xs text-muted-foreground">Loops (+2 each)</p>
          <p className="font-display font-bold text-2xl text-particle-photon">{loops}</p>
        </div>
      </div>
    </div>
  );
}
