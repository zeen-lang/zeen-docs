import { createHighlighter, type Highlighter } from 'shiki';

import zeenGrammar from '../assets/zeen.tmLanguage.json';
import zeenTheme from '../assets/zeen-theme.json';

export interface ZeenToken {
	content: string;
	style: string;
}

export type ZeenLine = ZeenToken[];

let highlighterPromise: Promise<Highlighter> | undefined;

const getHighlighter = () => {
	highlighterPromise ??= createHighlighter({
		themes: [zeenTheme],
		langs: [{ ...zeenGrammar, aliases: ['zeen', 'zn'] }],
	});
	return highlighterPromise;
};

export const highlightZeen = async (code: string): Promise<ZeenLine[]> => {
	const highlighter = await getHighlighter();
	const { tokens } = highlighter.codeToTokens(code, { lang: 'zeen', theme: zeenTheme.name });

	return tokens.map((line) =>
		line.map((token) => {
			const style = [
				token.color ? `color:${token.color}` : '',
				token.fontStyle && token.fontStyle & 1 ? 'font-style:italic' : '',
			]
				.filter(Boolean)
				.join(';');

			return { content: token.content, style };
		}),
	);
};
