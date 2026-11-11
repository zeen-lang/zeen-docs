const fallbackRelease = 'v0.4.0';

const fetchLatestRelease = async () => {
	try {
		const response = await fetch('https://api.github.com/repos/zeen-lang/zeen/releases/latest', {
			headers: { accept: 'application/vnd.github+json' },
			signal: AbortSignal.timeout(4000),
		});

		if (!response.ok) return fallbackRelease;

		const data = (await response.json()) as { tag_name?: string };
		return data.tag_name || fallbackRelease;
	} catch {
		return fallbackRelease;
	}
};

let release: Promise<string> | undefined;

export const latestRelease = () => (release ??= fetchLatestRelease());
