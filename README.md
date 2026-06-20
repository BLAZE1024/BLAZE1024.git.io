# World of Cdramas

This is a small static site demo about C-dramas and learning web development.

## Make it public (GitHub Pages)

1. Create a repository on GitHub and push this project:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

2. On GitHub: go to the repository → Settings → Pages → select branch `main` and `/ (root)` → Save. The site will be available at `https://<your-username>.github.io/<repo>/`.

## SEO Tips

- The site URL will be: `https://BLAZE1024.github.io/world-of-cdramas/`.
- Keep descriptive `title` and `meta description` in `index.html`.
- Use meaningful `alt` attributes for images (already present).
- Submit the `sitemap.xml` to Google Search Console for faster indexing.

## Quick local preview

```bash
python -m http.server 8000
# then open http://localhost:8000
```
