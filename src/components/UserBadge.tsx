import { Badge } from './ui/badge';
import { 
  Crown, 
  Zap, 
  Heart, 
  BookOpen, 
  Users, 
  Wrench, 
  Shield, 
  Sparkles,
  LucideIcon 
} from 'lucide-react';

export type BadgeType = 'og' | 'pro' | 'supporter' | 'student' | 'teacher' | 'dev' | 'moderator' | 'admin';

interface BadgeConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const badgeConfig: Record<BadgeType, BadgeConfig> = {
  og: {
    variant: 'default',
    label: 'OG',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  pro: {
    variant: 'default',
    label: 'Pro',
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  supporter: {
    variant: 'secondary',
    label: 'Supporter',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  student: {
    variant: 'secondary',
    label: 'Student',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  teacher: {
    variant: 'secondary',
    label: 'Teacher',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  dev: {
    variant: 'default',
    label: 'Dev',
    icon: Wrench,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
  moderator: {
    variant: 'destructive',
    label: 'Moderator',
    icon: Shield,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  admin: {
    variant: 'destructive',
    label: 'Admin',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
};

interface UserBadgeProps {
  badgeType: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function UserBadge({ badgeType, size = 'md', showIcon = true }: UserBadgeProps) {
  if (!badgeType || !Object.keys(badgeConfig).includes(badgeType)) {
    return null;
  }

  const config = badgeConfig[badgeType as BadgeType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-0.5',
    md: 'px-2 py-0.5 text-xs gap-1',
    lg: 'px-2.5 py-1 text-sm gap-1',
  };

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={`w-3 h-3 ${config.color}`} />}
      <span className="font-semibold">{config.label}</span>
    </Badge>
  );
}

export function UserWithBadge({ 
  username, 
  badgeType, 
  badgeSize = 'md',
  className = '' 
}: { 
  username: string; 
  badgeType: string | null | undefined;
  badgeSize?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="truncate">{username}</span>
      <UserBadge badgeType={badgeType} size={badgeSize} />
    </div>
  );
}
