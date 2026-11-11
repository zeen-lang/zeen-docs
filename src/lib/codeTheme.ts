import kanagawaWave from '@shikijs/themes/kanagawa-wave';

import zeenTheme from '../assets/zeen-theme.json';

type ThemeCandidate = {
	name?: string;
	colors?: Record<string, string>;
	tokenColors?: unknown[];
};

const isUsableTheme = (theme: ThemeCandidate | undefined): boolean =>
	Boolean(
		theme &&
			typeof theme.name === 'string' &&
			theme.name.length > 0 &&
			theme.colors &&
			Object.keys(theme.colors).length > 0 &&
			Array.isArray(theme.tokenColors) &&
			theme.tokenColors.length > 0,
	);

export const zeenCodeTheme = isUsableTheme(zeenTheme as ThemeCandidate) ? zeenTheme : kanagawaWave;

export const zeenCodeThemeName = zeenCodeTheme.name;
