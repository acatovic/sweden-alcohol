# Sweden, in the glass

A responsive React/Vinext scrollytelling app based on the supplied graph and causal analysis. The original source assets remain untouched in the parent directory and are copied into `public/` for readers.

## Run

```sh
npm install
npm run dev
```

Production: `npm run build`.

## Dependency versions

The starter's transitive dependencies are pinned with npm overrides to `minimizer-webpack-plugin@5.8.0` and `jose@6.2.10`, at the user's request. Both satisfy their dependents' declared ranges. Installation passes Socket checks without changing the security policy. The lockfile preserves the installed versions; use `npm ci` for repeatable installation.

`npm audit` currently reports 11 findings (8 high, 2 moderate, 1 low) elsewhere in the starter dependency tree, including development tooling and React server components. Neither overridden package is flagged. Broad dependency upgrades have not been applied as part of this targeted compatibility fix.

## Experience

Seven scroll-linked chart states: overview, spirits culture, wartime collapse, rationing, changes in access, wine's rise, and the causal interpretation. SVG domains animate between periods. Series can be highlighted with the legend; pointer inspection and left/right keyboard arrows read approximate values. Small screens place the chart above the narrative. Reduced-motion preferences disable animation. Source notes include the original PNG and downloadable analysis.

## Data provenance

`app/data.json` contains approximate traces extracted from colored pixels in `public/graph.png`. Chart bounds are calibrated manually; missing pixel positions are interpolated. These are not original CAN annual observations, and neither exact causal estimates nor total consumption measures. The UI makes that distinction explicit.

Regenerate using a Python environment with Pillow:

```sh
python scripts/trace-chart.py
```

The optional, feature-detected WebMCP tool reads the same approximate chart rows. It does not mutate the page or fetch external data.

## Verification so far

TSX and CSS syntax/transformation checks pass with an already available esbuild. The trace data contain 146 contiguous years (1861–2006) and four bounded, finite series. The read-only WebMCP tool was checked with a mock registry for valid and invalid inputs and cleanup; a live WebMCP context was unavailable. TypeScript checking and the production build pass. The development route returns HTTP 200. Browser interaction testing has not been requested or run.

## GitHub Pages

This app also supports a standalone static export. It needs no server, API keys, or Sites account to run on GitHub Pages. The export contains the chart data, JavaScript, CSS, original graph and Markdown download.

### Recommended: deploy with GitHub Actions

This app lives in the `app/` subdirectory of the `acatovic/sweden-alcohol` repository. The workflow is at the repository root: `.github/workflows/pages.yml`.

1. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push to `main`, or run **Actions → Deploy to GitHub Pages → Run workflow**.

The workflow builds from `app/`, reads the Pages URL configuration automatically, installs the locked dependencies, and deploys only `app/dist/client`.

### Build a package yourself

For `https://USERNAME.github.io/sweden-alcohol/`:

```sh
npm ci
npm run build:pages -- /sweden-alcohol
```

Replace `/sweden-alcohol` with your repository name. For a `USERNAME.github.io` repository or a custom domain at its root, use:

```sh
npm run build:pages -- /
```

The deployable files are in `dist/client/`. Upload **the contents** of that directory, including `.nojekyll`. Never upload the server build or `node_modules`. A repository-prefixed export is specific to that URL prefix; rebuild if the repository name or hosting path changes.

You can alternatively commit the exported files into a `docs/` directory of a deployment repository and choose **Deploy from a branch → main → /docs** in Pages settings. If using this method, disable/remove the GitHub Actions workflow to avoid having two competing deployment methods. Unzip a prepared static archive before committing; GitHub Pages does not serve the contents of a ZIP automatically.

The normal `npm run build` remains the Sites/Cloudflare build. Both build commands replace `dist`, so run the correct command immediately before publishing.

### Local preview of the static package

For the root export (`npm run build:pages -- /`), run:

```sh
python3 -m http.server 8080 --directory dist/client
```

Then open `http://localhost:8080`. Use an HTTP server rather than double-clicking `index.html`.
