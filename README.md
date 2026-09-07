# Sweden, in the glass

A scroll-driven visual history of Sweden's recorded alcohol sales, 1861–2006.

The original graph and causal analysis are kept in this directory. The web app lives in `app/`.

## Run locally

```sh
cd app
npm ci
npm run dev
```

Open the localhost address printed by the server.

## GitHub Pages

The root `.github/workflows/pages.yml` builds the app in `app/` and publishes `app/dist/client/`. In the GitHub repository, select **Settings → Pages → Source → GitHub Actions**. Every push to `main` deploys; the workflow can also be run manually.

The workflow automatically uses the configured Pages URL prefix. No additional secrets are required.

To generate the static files locally for this repository:

```sh
cd app
npm run build:pages -- /sweden-alcohol
```

For a custom domain hosted at its root, replace `/sweden-alcohol` with `/`.

## Publish updates

Run these from this directory:

```sh
git add .
git commit -m "Update the story"
git push
```

The origin uses the personal SSH alias `github.com-armin-personal` and points to `acatovic/sweden-alcohol`.

See `app/README.md` for the methodology, dependency notes, and static-export details. Approximate values were traced from the supplied PNG; they are not the original CAN annual observations.
