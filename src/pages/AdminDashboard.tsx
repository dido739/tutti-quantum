import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { ParticleBackground } from '@/components/ParticleBackground';
import { UserBadge, badgeConfig, normalizeBadgeTypes, type BadgeType } from '@/components/UserBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Shield, Search, Trash2, Ban, CheckCircle2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminProfile = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  badge_type: BadgeType | null;
  badge_types: BadgeType[];
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
  updated_at: string;
  total_games_played: number;
  total_wins: number;
  highest_score: number;
};

const badgeOptions: Array<{ value: BadgeType; label: string }> = Object.entries(badgeConfig).map(([value, config]) => ({
  value: value as BadgeType,
  label: config.label,
}));

const hasAdminBadge = (badgeTypes: BadgeType[]) => badgeTypes.some((badge) => badge === 'admin' || badge === 'dev');

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = hasAdminBadge(normalizeBadgeTypes(profile?.badge_type, profile?.badge_types));
  const profileLoading = Boolean(user && profile === null);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, username, avatar_url, badge_type, badge_types, is_banned, banned_reason, banned_at, created_at, updated_at, total_games_played, total_wins, highest_score')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      const normalized = ((data ?? []) as Array<AdminProfile & { badge_types: string[] | null }>).map((entry) => {
        const badges = normalizeBadgeTypes(entry.badge_type, entry.badge_types);
        return {
          ...entry,
          badge_type: badges[0] ?? null,
          badge_types: badges,
        };
      });
      setProfiles(normalized as AdminProfile[]);
    }

    setLoadingProfiles(false);
  };

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user || !isAdmin) {
      setLoadingProfiles(false);
      return;
    }

    void loadProfiles();
  }, [authLoading, profileLoading, user, isAdmin]);

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return profiles;

    return profiles.filter((entry) => {
      return (
        entry.username.toLowerCase().includes(term) ||
        entry.user_id.toLowerCase().includes(term) ||
        entry.badge_types.join(', ').toLowerCase().includes(term) ||
        (entry.banned_reason ?? '').toLowerCase().includes(term)
      );
    });
  }, [profiles, search]);

  const adminStats = useMemo(() => {
    return {
      total: profiles.length,
      banned: profiles.filter((entry) => entry.is_banned).length,
      admins: profiles.filter((entry) => hasAdminBadge(entry.badge_types)).length,
    };
  }, [profiles]);

  const runAction = async (userId: string, action: () => Promise<{ error?: Error | null } | void>) => {
    setActionLoading(userId);
    try {
      await action();
      await loadProfiles();
    } finally {
      setActionLoading(null);
    }
  };

  const setBadges = async (userId: string, badgeTypes: BadgeType[]) => {
    await runAction(userId, async () => {
      const { error } = await supabase.rpc('admin_set_profile_badges', {
        p_user_id: userId,
        p_badge_types: badgeTypes,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Badge updated.');
      return { error: null };
    });
  };

  const toggleBan = async (entry: AdminProfile) => {
    if (entry.user_id === user?.id) {
      toast.error('You cannot ban your own account here.');
      return;
    }

    if (!entry.is_banned) {
      const reason = window.prompt(`Ban ${entry.username} for what reason?`, entry.banned_reason ?? '')?.trim() || null;

      await runAction(entry.user_id, async () => {
        const { error } = await supabase.rpc('admin_set_user_ban', {
          p_user_id: entry.user_id,
          p_is_banned: true,
          p_reason: reason,
        });

        if (error) {
          toast.error(error.message);
          return { error };
        }

        toast.success(`${entry.username} has been banned.`);
        return { error: null };
      });

      return;
    }

    await runAction(entry.user_id, async () => {
      const { error } = await supabase.rpc('admin_set_user_ban', {
        p_user_id: entry.user_id,
        p_is_banned: false,
        p_reason: null,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success(`${entry.username} has been unbanned.`);
      return { error: null };
    });
  };

  const deleteUser = async (entry: AdminProfile) => {
    if (entry.user_id === user?.id) {
      toast.error('You cannot delete your own account here.');
      return;
    }

    const confirmed = window.confirm(`Delete ${entry.username} permanently? This removes their auth account and profile.`);
    if (!confirmed) return;

    await runAction(entry.user_id, async () => {
      const { error } = await supabase.rpc('admin_delete_user', {
        p_user_id: entry.user_id,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success(`${entry.username} has been deleted.`);
      return { error: null };
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <ParticleBackground />
        <Card className="relative z-10 w-full max-w-lg border-primary/20 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Admin access required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Sign in with an admin account to manage users.</p>
            <Link to="/login">
              <Button className="w-full">Go to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <ParticleBackground />
        <Card className="relative z-10 w-full max-w-lg border-primary/20 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Forbidden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Your account does not have admin permissions.</p>
            <Link to="/">
              <Button variant="outline" className="w-full">Back to home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-glow">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage badges, bans, and user accounts.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{adminStats.total}</div>
                <div className="text-xs text-muted-foreground">Users</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{adminStats.banned}</div>
                <div className="text-xs text-muted-foreground">Banned</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{adminStats.admins}</div>
                <div className="text-xs text-muted-foreground">Admins</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username, user id, badge, or ban reason"
                className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        {loadingProfiles ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProfiles.map((entry) => {
              const isCurrentUser = entry.user_id === user.id;

              return (
                <Card key={entry.user_id} className={cn('border-primary/20 bg-card/80 backdrop-blur-sm', entry.is_banned && 'border-destructive/40')}>
                  <CardContent className="p-4 md:p-5 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-lg font-bold truncate">{entry.username}</h2>
                          <UserBadge badgeType={entry.badge_type} badgeTypes={entry.badge_types} size="sm" />
                          {entry.is_banned && <Badge variant="destructive">Banned</Badge>}
                          {isCurrentUser && <Badge variant="outline">You</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground break-all">{entry.user_id}</div>
                        {entry.is_banned && entry.banned_reason && (
                          <p className="text-sm text-muted-foreground">Reason: {entry.banned_reason}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={entry.is_banned ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => toggleBan(entry)}
                          disabled={actionLoading === entry.user_id || isCurrentUser}
                        >
                          {entry.is_banned ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                          {entry.is_banned ? 'Unban' : 'Ban'}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(entry)}
                          disabled={actionLoading === entry.user_id || isCurrentUser}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr,220px] md:items-center">
                      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground sm:grid-cols-3 md:grid-cols-3">
                        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                          <div className="font-semibold text-foreground">{entry.total_games_played}</div>
                          <div>Games</div>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                          <div className="font-semibold text-foreground">{entry.total_wins}</div>
                          <div>Wins</div>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                          <div className="font-semibold text-foreground">{entry.highest_score}</div>
                          <div>Best score</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`badges-${entry.user_id}`} className="text-xs font-medium text-muted-foreground">Badges</label>
                        <select
                          id={`badges-${entry.user_id}`}
                          className="h-28 w-full rounded-md border border-border/50 bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                          value={entry.badge_types}
                          disabled={actionLoading === entry.user_id || isCurrentUser}
                          multiple
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map((option) => option.value as BadgeType);
                            setBadges(entry.user_id, selected);
                          }}
                        >
                          {badgeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Hold Ctrl/Cmd to select multiple badges</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setBadges(entry.user_id, [])}
                            disabled={actionLoading === entry.user_id || isCurrentUser || entry.badge_types.length === 0}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredProfiles.length === 0 && (
              <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No users match your search.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
