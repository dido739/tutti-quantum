import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useI18n } from '@/contexts/I18nContext';
import { Atom, ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const registerSchema = z.object({
    username: z.string()
      .min(3, t('register.error.usernameMin'))
      .max(20, t('register.error.usernameMax'))
      .regex(/^[a-zA-Z0-9_]+$/, t('register.error.usernamePattern')),
    email: z.string().email(t('register.error.invalidEmail')),
    password: z.string().min(6, t('register.error.passwordMin')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.error.passwordMatch'),
    path: ['confirmPassword'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    const result = registerSchema.safeParse({ username, email, password, confirmPassword });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('register.success'));
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ParticleBackground />
      
      <div className="absolute top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse-glow">
            <Atom className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl text-glow">{t('register.title')}</CardTitle>
          <CardDescription>{t('register.subtitle')}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('register.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('register.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background/50"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background/50"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full font-display"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t('register.creating')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t('register.createAccount')}
                </span>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              {t('register.haveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('register.signIn')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
