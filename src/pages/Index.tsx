import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Atom, Users, Globe, Trophy, LogIn, LogOut, User, 
  ChevronRight, Sparkles, Zap, Target, Bot, BookOpen
} from 'lucide-react';

export default function Index() {
  const { user, profile, signOut, loading } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Atom className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-glow">TUTTI QUANTUM</span>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{profile?.username || t('index.playerFallback')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {t('common.signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    {t('common.signIn')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-display">
                    {t('common.getStarted')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">{t('index.badge')}</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-glow">
            {t('index.heroTitle1')}
            <br />
            <span className="text-primary">{t('index.heroTitle2')}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t('index.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link to="/ai-game">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 font-display group">
                <Bot className="w-5 h-5 mr-2" />
                {t('index.playAi')}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/local-game">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 font-display group">
                <Users className="w-5 h-5 mr-2" />
                {t('index.localMultiplayer')}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/online-game">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 font-display group">
                <Globe className="w-5 h-5 mr-2" />
                {t('index.playOnline')}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="mt-6">
            <Link to="/how-to-play">
              <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-primary">
                <BookOpen className="w-5 h-5 mr-2" />
                {t('index.howToPlay')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 group hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{t('index.feature1.title')}</h3>
              <p className="text-muted-foreground">
                {t('index.feature1.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-accent/20 group hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{t('index.feature2.title')}</h3>
              <p className="text-muted-foreground">
                {t('index.feature2.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-particle-photon/20 group hover:border-particle-photon/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-particle-photon/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-particle-photon" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{t('index.feature3.title')}</h3>
              <p className="text-muted-foreground">
                {t('index.feature3.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('index.features.title')}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('index.features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link to="/ai-game" className="block">
            <Card className="bg-card/80 backdrop-blur-sm border-accent/20 h-full hover:border-accent/50 hover:scale-[1.02] transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{t('index.playAi')}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('index.mode.ai.desc')}
                </p>
                <div className="flex items-center text-accent font-medium text-sm">
                  {t('index.mode.startGame')}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/local-game" className="block">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 h-full hover:border-primary/50 hover:scale-[1.02] transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{t('index.localMultiplayer')}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('index.mode.local.desc')}
                </p>
                <div className="flex items-center text-primary font-medium text-sm">
                  {t('index.mode.playNow')}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/online-game" className="block">
            <Card className="bg-card/80 backdrop-blur-sm border-particle-photon/20 h-full hover:border-particle-photon/50 hover:scale-[1.02] transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-particle-photon/30 to-particle-photon/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-particle-photon" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{t('online.title')}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('index.mode.online.desc')}
                </p>
                <div className="flex items-center text-particle-photon font-medium text-sm">
                  {t('index.playOnline')}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Leaderboard CTA */}
      <section className="relative z-10 container mx-auto px-4 py-16 mb-8">
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-particle-photon/10 border-primary/30 max-w-4xl mx-auto">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {t('index.cta.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('index.cta.desc')}
              </p>
            </div>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="font-display whitespace-nowrap">
                <Trophy className="w-5 h-5 mr-2" />
                {t('index.cta.button')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Atom className="w-4 h-4" />
              <span>{t('index.footer')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('index.footer.credit')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
