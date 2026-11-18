## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Visual style

The site is dark only: `ThemeProvider` forces `data-theme='dark'`, so nothing needs to support a light theme. The look is Material-inspired: tonal surfaces, hairline borders, pill controls, no shadows and no gradients.

### Tokens

`src/styles/custom.css` owns the palette. Use the variables instead of raw colours.

- Surfaces: `--zn-surface` for cards, `--zn-surface-raised` for hover, `--zn-surface-deep` for code blocks and insets.
- Accent: `--zn-primary` mint, `--zn-primary-soft` for tinted chips, `--zn-primary-high` for text on those chips, `--zn-on-primary` for text on solid mint buttons.
- Lines: `--zn-hairline`, `--zn-hairline-strong`.
- Motion: `--zn-ease`, `--zn-fast`, always wrapped in a `prefers-reduced-motion` opt-out.

### Radius scale

20 for landing and installation cards, 16 for feature and changelog cards, 14 for diagnostic cards, 12 for the install command row, 10 for code frames and insets, 6 for inline code pills, 999 for buttons, tabs and chips. Inner elements stay 4px or more away from a rounded parent's edge so the inner radius never looks larger than the outer one.

### Patterns

- Card: hairline border on a tonal surface. On hover the background steps up to `--zn-surface-raised` and the border to `--zn-hairline-strong`.
- Chip: 22–24px tall, 12px label, 999 radius, background at 10% of its colour. Status chips (`Latest`, `Error`, `Warning`) add a 5px dot through `::before`.
- Button: 44px tall pill. Primary is solid mint with dark text, secondary is an outlined pill.
- Icons come from `src/components/Icon.astro`, which maps names to Material Symbols paths plus the GitHub mark from Simple Icons. Add new icons there instead of pasting SVG into a page, and keep the stroke weight consistent with the existing set.
- No `›` text markers. `landing.css` used to style a `zn-marker` span; that pattern is gone and new pages should use icons or plain text.
- The footer is a single hairline top border with no card or background. The brand row is centred against the Apache pill, which uses a hairline outline.

### Code frames

Expressive Code variables are set on `:root` and on `.expressive-code[data-theme]`, so an override has to target `.expressive-code` itself and sit later in the cascade. `--ec-brdRad: 9px` renders as a 10px visual radius. Inside cards also set `--ec-codeBg: var(--zn-surface-deep)`, make the copy button background transparent and give it a round hover layer, so it reads as an icon rather than a tile.

### Page widths

Landing sections run in a 78rem container. The changelog list uses 56rem, release pages 48rem, and docs keep the Starlight default. Long prose over 48rem gets too wide to read comfortably, so check line length before widening a page.

### Documentation shell

`src/styles/docs.css` covers the parts Starlight owns: header, search, sidebar, right-hand table of contents, prose, code frames, cards, steps, file tree, tabs, badges, asides and the previous/next links. It is registered in `astro.config.mjs` under `customCss`, so it applies to every page, the landing page and the changelog included.

- Sidebar rows are 13px links with an 8px radius; the current page gets a mint-tinted pill instead of Starlight's solid accent block.
- Search and the mobile table of contents reuse the 36px pill from the site buttons.
- Heading anchor icons are fixed at 20px with a 6px gap, so they do not grow with the heading font size.
- Markdown code blocks sit on `--zn-surface`; inside a card they drop to `--zn-surface-deep` to stay distinct from the card surface.
- Library pages are Starlight `Card` components: 16px radius, 20/22px padding, 17px title and 14px body.

### Checks

Run `bun run build`, then `impeccable detect dist/<page>/index.html`; there is no Chromium here, so scan built HTML instead of a URL. Look at the result in headless Firefox at 320, 390, 768 and 1440. `.impeccable/config.json` holds one file-scoped ignore: code listings inside diagnostic cards repeat identifiers, which the repeated-text rule reads as UI copy.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
