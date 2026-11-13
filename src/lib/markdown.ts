const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderEmphasisAndLinks = (value: string): string =>
  escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');

export const renderInlineMarkdown = (source: string): string =>
  source
    .split(/(`[^`]*`)/g)
    .map((part) =>
      part.length > 1 && part.startsWith('`') && part.endsWith('`')
        ? `<code>${escapeHtml(part.slice(1, -1))}</code>`
        : renderEmphasisAndLinks(part),
    )
    .join('');
