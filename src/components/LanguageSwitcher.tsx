import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="fixed right-4 top-4 z-[60] flex items-center gap-1 rounded-full border border-border/50 bg-background/80 p-1 backdrop-blur-sm">
      <Languages className="w-4 h-4 text-muted-foreground ml-1" />
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-2"
        onClick={() => setLanguage('en')}
      >
        {t('lang.en')}
      </Button>
      <Button
        variant={language === 'bg' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-2"
        onClick={() => setLanguage('bg')}
      >
        {t('lang.bg')}
      </Button>
    </div>
  );
}
