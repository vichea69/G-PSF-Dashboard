import { useRegisterActions } from 'kbar';
import { useTheme } from 'next-themes';
import { useTranslate } from '@/hooks/use-translate';

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslate();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeAction = [
    {
      id: 'toggleTheme',
      name: t('commandBar.theme.toggleTheme'),
      shortcut: ['t', 't'],
      section: t('commandBar.sections.theme'),
      subtitle: t('commandBar.theme.toggleThemeDescription'),
      perform: toggleTheme
    },
    {
      id: 'setLightTheme',
      name: t('commandBar.theme.setLightTheme'),
      section: t('commandBar.sections.theme'),
      subtitle: t('commandBar.theme.setLightThemeDescription'),
      perform: () => setTheme('light')
    },
    {
      id: 'setDarkTheme',
      name: t('commandBar.theme.setDarkTheme'),
      section: t('commandBar.sections.theme'),
      subtitle: t('commandBar.theme.setDarkThemeDescription'),
      perform: () => setTheme('dark')
    }
  ];

  useRegisterActions(themeAction, [theme, t]);
};

export default useThemeSwitching;
