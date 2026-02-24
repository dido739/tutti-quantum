import { Link } from 'react-router-dom';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  BookOpen,
  Atom,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  CircleDot,
  Waves,
  Sparkles,
  Circle,
} from 'lucide-react';

export default function HowToPlay() {
  const { t, language } = useI18n();

  const copy = language === 'bg'
    ? {
        welcomeTitle: 'Добре дошли в Tutti Quantum',
        intro:
          'Tutti Quantum е стратегическа игра с карти, вдъхновена от диаграмите на Файнман. Комбинирай частици и изграждай валидни взаимодействия, за да печелиш точки.',
        goalTitle: 'Цел',
        goalText:
          'Изгради най-добрата диаграма, като свързваш карти и създаваш валидни върхове според правилата на физиката.',
        winTitle: 'Как се печели',
        winText:
          'Печелиш точки за валидни комбинации от 3 частици. Невалидните комбинации отнемат точки.',
        flowTitle: 'Ход на играта',
        flowSteps: [
          'В началото на всеки рунд в центъра се отварят карти, от които всички играчи избират.',
          'В своя ход избери карта и я завърти, ако е нужно.',
          'Постави картата до вече поставените карти в твоята диаграма.',
          'Когато три линии се срещнат в една точка, се образува връх.',
          'След последния рунд печели играчът с най-много точки.',
        ],
        particlesTitle: 'Петте типа частици',
        particlesIntro:
          'Всеки тип частица има различна честота и роля в комбинациите за точки.',
        particles: [
          {
            name: 'Кварки (q)',
            count: '13 карти в тестето',
            text: 'Частици на материята. Участват в силни и електромагнитни взаимодействия.',
            color: 'particle-quark',
            icon: 'quark',
          },
          {
            name: 'Електрони (e⁻)',
            count: '8 карти в тестето',
            text: 'Лептони, които взаимодействат основно чрез фотони и могат да се свържат с Хигс.',
            color: 'particle-electron',
            icon: 'electron',
          },
          {
            name: 'Фотони (γ)',
            count: '7 карти в тестето',
            text: 'Преносители на електромагнитната сила. Свързват заредени частици.',
            color: 'particle-photon',
            icon: 'photon',
          },
          {
            name: 'Глуони (g)',
            count: '12 карти в тестето',
            text: 'Преносители на силната ядрена сила. Могат да взаимодействат и помежду си.',
            color: 'particle-gluon',
            icon: 'gluon',
          },
          {
            name: 'Хигс бозон (H)',
            count: '4 карти в тестето (редки)',
            text: 'Рядка частица с висока стойност за точки в специфични комбинации.',
            color: 'particle-higgs',
            icon: 'higgs',
          },
        ],
        verticesTitle: 'Валидни върхове',
        verticesIntro:
          'Връх се получава, когато точно 3 линии частици се срещнат в една точка.',
        commonTitle: 'Чести върхове (2 точки)',
        common: ['Quark + Quark + Gluon', 'Electron + Electron + Photon', 'Quark + Antiquark + Photon'],
        rareTitle: 'Редки върхове (3 точки)',
        rare: ['Gluon + Gluon + Gluon', 'Quark + Antiquark + Gluon'],
        higgsTitle: 'Хигс върхове (4 точки)',
        higgs: ['Quark + Antiquark + Higgs', 'Electron + Positron + Higgs'],
        legendaryTitle: 'Легендарен връх (6 точки)',
        legendary: 'Higgs + Higgs + Higgs',
        invalidTitle: '⚠️ Невалиден връх (-1 точка)',
        invalidText:
          'Всяка комбинация от 3 частици извън валидните списъци е невалидна и отнема 1 точка.',
        scoringTitle: 'Система за точки',
        scoringValid: 'Валидни върхове',
        scoringValidText: 'Точки според рядкостта на комбинацията (+2 до +6).',
        scoringInvalid: 'Невалидни върхове',
        scoringInvalidText: 'Наказание от -1 точка за физически невъзможни комбинации.',
        scoringLoops: 'Затворени цикли',
        scoringLoopsText: 'Бонус за затворени връзки в диаграмата.',
        scoringSecret: 'Тайна карта',
        scoringSecretText: 'В края всеки играч добавя тайната си карта за финални точки.',
        playerVariants: 'Варианти според броя играчи',
        players2: '2 играчи · 3 карти/рунд · 14 рунда',
        players3: '3 играчи · 4 карти/рунд · 9 рунда',
        players4: '4 играчи · 5 карти/рунд · 8 рунда',
        cta: 'Готов ли си за игра?',
      }
    : {
        welcomeTitle: 'Welcome to Tutti Quantum',
        intro:
          'Tutti Quantum is a strategic card game inspired by Feynman diagrams. Combine particles and build valid interactions to score points.',
        goalTitle: 'Goal',
        goalText:
          'Build the strongest diagram by connecting cards and creating valid vertices based on physics rules.',
        winTitle: 'How to Win',
        winText:
          'Score points for valid 3-particle combinations. Invalid combinations reduce your score.',
        flowTitle: 'Game Flow',
        flowSteps: [
          'At the start of each round, cards appear in the center for all players to choose from.',
          'On your turn, choose a card and rotate it if needed.',
          'Place the card adjacent to your existing diagram.',
          'When three lines meet at one point, a vertex is formed.',
          'After the last round, the highest score wins.',
        ],
        particlesTitle: 'The Five Particle Types',
        particlesIntro: 'Each particle type has a different frequency and role in scoring combinations.',
        particles: [
          {
            name: 'Quarks (q)',
            count: '13 cards in deck',
            text: 'Matter particles used in strong and electromagnetic interactions.',
            color: 'particle-quark',
            icon: 'quark',
          },
          {
            name: 'Electrons (e⁻)',
            count: '8 cards in deck',
            text: 'Leptons that interact mainly via photons and can couple to Higgs.',
            color: 'particle-electron',
            icon: 'electron',
          },
          {
            name: 'Photons (γ)',
            count: '7 cards in deck',
            text: 'Carriers of the electromagnetic force connecting charged particles.',
            color: 'particle-photon',
            icon: 'photon',
          },
          {
            name: 'Gluons (g)',
            count: '12 cards in deck',
            text: 'Carriers of the strong force that can also interact with each other.',
            color: 'particle-gluon',
            icon: 'gluon',
          },
          {
            name: 'Higgs Boson (H)',
            count: '4 cards in deck (rare)',
            text: 'Rare particle with high-value scoring combinations.',
            color: 'particle-higgs',
            icon: 'higgs',
          },
        ],
        verticesTitle: 'Valid Vertex Combinations',
        verticesIntro: 'A vertex forms when exactly 3 particle lines meet at one point.',
        commonTitle: 'Common Vertices (2 points)',
        common: ['Quark + Quark + Gluon', 'Electron + Electron + Photon', 'Quark + Antiquark + Photon'],
        rareTitle: 'Rare Vertices (3 points)',
        rare: ['Gluon + Gluon + Gluon', 'Quark + Antiquark + Gluon'],
        higgsTitle: 'Higgs Vertices (4 points)',
        higgs: ['Quark + Antiquark + Higgs', 'Electron + Positron + Higgs'],
        legendaryTitle: 'Legendary Vertex (6 points)',
        legendary: 'Higgs + Higgs + Higgs',
        invalidTitle: '⚠️ Invalid Vertex (-1 point)',
        invalidText:
          'Any 3-particle combination outside the valid lists is invalid and subtracts 1 point.',
        scoringTitle: 'Scoring System',
        scoringValid: 'Valid Vertices',
        scoringValidText: 'Points based on combination rarity (+2 to +6).',
        scoringInvalid: 'Invalid Vertices',
        scoringInvalidText: 'Penalty of -1 point for impossible combinations.',
        scoringLoops: 'Closed Loops',
        scoringLoopsText: 'Bonus for closed paths in your diagram.',
        scoringSecret: 'Secret Card',
        scoringSecretText: 'At the end, each player adds their secret card for final points.',
        playerVariants: 'Player Count Variations',
        players2: '2 players · 3 cards/round · 14 rounds',
        players3: '3 players · 4 cards/round · 9 rounds',
        players4: '4 players · 5 cards/round · 8 rounds',
        cta: 'Ready to Play?',
      };

  const renderParticleIcon = (icon: string, colorClass: string) => {
    if (icon === 'quark') return <CircleDot className={`w-6 h-6 ${colorClass}`} />;
    if (icon === 'electron') return <Circle className={`w-6 h-6 ${colorClass}`} />;
    if (icon === 'photon') return <Waves className={`w-6 h-6 ${colorClass}`} />;
    if (icon === 'gluon') return <Zap className={`w-6 h-6 ${colorClass}`} />;
    return <Sparkles className={`w-6 h-6 ${colorClass}`} />;
  };

  const particleClasses = {
    'particle-quark': {
      box: 'border-particle-quark/30 bg-particle-quark/5',
      iconWrap: 'bg-particle-quark/20',
      text: 'text-particle-quark',
    },
    'particle-electron': {
      box: 'border-particle-electron/30 bg-particle-electron/5',
      iconWrap: 'bg-particle-electron/20',
      text: 'text-particle-electron',
    },
    'particle-photon': {
      box: 'border-particle-photon/30 bg-particle-photon/5',
      iconWrap: 'bg-particle-photon/20',
      text: 'text-particle-photon',
    },
    'particle-gluon': {
      box: 'border-particle-gluon/30 bg-particle-gluon/5',
      iconWrap: 'bg-particle-gluon/20',
      text: 'text-particle-gluon',
    },
    'particle-higgs': {
      box: 'border-particle-higgs/30 bg-particle-higgs/5',
      iconWrap: 'bg-particle-higgs/20',
      text: 'text-particle-higgs',
    },
  } as const;

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('howToPlay.backHome')}
              </Button>
            </Link>
            <h1 className="font-display text-xl text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('howToPlay.title')}
            </h1>
            <div className="w-24" />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Tabs defaultValue="basics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="basics">{t('howToPlay.tab.basics')}</TabsTrigger>
              <TabsTrigger value="particles">{t('howToPlay.tab.particles')}</TabsTrigger>
              <TabsTrigger value="vertices">{t('howToPlay.tab.vertices')}</TabsTrigger>
              <TabsTrigger value="scoring">{t('howToPlay.tab.scoring')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Atom className="w-8 h-8 text-primary" />
                    {copy.welcomeTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg text-muted-foreground">{copy.intro}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {copy.goalTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">{copy.goalText}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        {copy.winTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">{copy.winText}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-xl font-bold">{copy.flowTitle}</h3>
                    <div className="space-y-3">
                      {copy.flowSteps.map((text, index) => (
                        <div key={index + 1} className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-muted-foreground pt-1">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="particles" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                    {copy.particlesTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{copy.particlesIntro}</p>

                  <div className="grid gap-4">
                    {copy.particles.map((particle) => {
                      const colorKey = particle.color as keyof typeof particleClasses;
                      return (
                      <div key={particle.name} className={`p-4 rounded-lg border-2 ${particleClasses[colorKey].box}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 rounded-full ${particleClasses[colorKey].iconWrap} flex items-center justify-center`}>
                            {renderParticleIcon(particle.icon, particleClasses[colorKey].text)}
                          </div>
                          <div>
                            <h3 className={`font-display font-bold ${particleClasses[colorKey].text}`}>{particle.name}</h3>
                            <p className="text-sm text-muted-foreground">{particle.count}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{particle.text}</p>
                      </div>
                    )})}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vertices" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <ArrowRight className="w-8 h-8 text-primary" />
                    {copy.verticesTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{copy.verticesIntro}</p>

                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-green-400">{copy.commonTitle}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {copy.common.map((item) => (
                        <div key={item} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="font-mono text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-yellow-400">{copy.rareTitle}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {copy.rare.map((item) => (
                        <div key={item} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <p className="font-mono text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-purple-400">{copy.higgsTitle}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {copy.higgs.map((item) => (
                        <div key={item} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <p className="font-mono text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-particle-higgs">{copy.legendaryTitle}</h3>
                    <div className="p-3 rounded-lg bg-particle-higgs/10 border border-particle-higgs/20">
                      <p className="font-mono text-sm">{copy.legendary}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h3 className="font-display font-bold text-red-400 mb-2">{copy.invalidTitle}</h3>
                    <p className="text-sm text-muted-foreground">{copy.invalidText}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scoring" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-primary" />
                    {copy.scoringTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <h3 className="font-display font-bold text-green-400 text-2xl mb-2">+2 to +6</h3>
                      <p className="font-bold">{copy.scoringValid}</p>
                      <p className="text-sm text-muted-foreground mt-1">{copy.scoringValidText}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <h3 className="font-display font-bold text-red-400 text-2xl mb-2">-1</h3>
                      <p className="font-bold">{copy.scoringInvalid}</p>
                      <p className="text-sm text-muted-foreground mt-1">{copy.scoringInvalidText}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <h3 className="font-display font-bold text-primary text-2xl mb-2">+2</h3>
                      <p className="font-bold">{copy.scoringLoops}</p>
                      <p className="text-sm text-muted-foreground mt-1">{copy.scoringLoopsText}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <h3 className="font-display font-bold text-accent text-2xl mb-2">{copy.scoringSecret}</h3>
                      <p className="font-bold">{copy.scoringSecret}</p>
                      <p className="text-sm text-muted-foreground mt-1">{copy.scoringSecretText}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h3 className="font-display font-bold mb-3">{copy.playerVariants}</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{copy.players2}</p>
                      <p>{copy.players3}</p>
                      <p>{copy.players4}</p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Link to="/local-game">
                      <Button size="lg" className="font-display">
                        {copy.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
