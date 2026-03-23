# Webgen

Plateforme SaaS de génération de sites web propulsée par l'IA, construite sur **Premier.js** — le framework de composants React écrit à la main.

---

## Ce que c'est

L'utilisateur décrit son site en langage naturel → Claude génère le contenu et les couleurs → un éditeur visuel permet de tout personnaliser → le site est publié sur `slug.webgen.app` en un clic.

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | Premier.js (composants propriétaires) |
| IA | Claude Sonnet 4 (Anthropic API) |
| State | Zustand 5 + persist (localStorage) |
| Styles | Tailwind CSS 4 + CSS Custom Properties |
| Language | TypeScript 5 |

## Architecture

```
webgen/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Claude API → SiteConfig JSON + thème
│   │   └── publish/route.ts    # Sauvegarde le site (data/sites/[slug].json)
│   ├── s/[slug]/page.tsx       # Rendu SSR du site publié
│   ├── store/siteStore.ts      # Zustand store + persistance localStorage
│   └── page.tsx                # Formulaire de génération + éditeur
├── components/
│   ├── editor/
│   │   ├── EditorLayout.tsx    # Split-view sidebar + preview
│   │   ├── SectionWrapper.tsx  # Hover / sélection / toolbar par section
│   │   ├── SectionPanel.tsx    # Gestion des sections (drag & drop)
│   │   ├── StylePanel.tsx      # 7 color pickers temps réel
│   │   ├── ContentPanel.tsx    # Édition du contenu par section
│   │   └── PublishModal.tsx    # Modal de publication avec slug
│   ├── sections/               # Sections de page (Premier.js)
│   └── ui/                     # Composants primitifs (Premier.js)
├── data/sites/                 # Sites publiés stockés en JSON
└── middleware.ts               # Routage *.webgen.app → /s/[slug]
```

## Système de thème

Les couleurs sont injectées comme CSS Custom Properties sur le wrapper du preview, et lues par tous les composants via `style` props — mise à jour temps réel sans recompilation Tailwind.

```css
--color-primary    --color-secondary   --color-background
--color-surface    --color-text        --color-text-muted
--color-border
```

## Éditeur visuel

- **Hover** sur une section → bordure bleue + toolbar flottante
- **Toolbar** : ↑ ↓ monter/descendre · ✏️ éditer le contenu · 🗑 supprimer
- **Drag & drop** dans le preview pour réordonner
- **Onglet Sections** : ajouter / supprimer des sections
- **Onglet Styles** : 7 color pickers avec mise à jour instantanée
- **ContentPanel** : édition champ par champ (texte, textarea, select, arrays)

## Génération IA

Claude Sonnet 4 reçoit la description utilisateur et retourne un JSON avec le contenu de chaque section **et** un objet `theme` avec 7 couleurs cohérentes avec le secteur décrit.

## Publication

```
Utilisateur choisit un slug → POST /api/publish
→ sauvegardé dans data/sites/[slug].json
→ accessible sur https://[slug].webgen.app
```

DNS wildcard `*.webgen.app` → serveur. Middleware Next.js extrait le sous-domaine et rewrite vers `/s/[slug]`.

## Développement

```bash
cp .env.local.example .env.local
# ANTHROPIC_API_KEY=sk-ant-...

npm install
npm run dev        # http://localhost:3000
                   # Sites publiés : http://localhost:3000/s/[slug]
```

## Premier.js

Webgen est construit sur **Premier.js**, un framework de composants React/Next.js écrit entièrement à la main. Il fournit 23 composants UI primitifs, 13 sections de page, un système de thème via CSS Custom Properties et un système de notifications Toast global.

→ [`../OFFMODE/premierjs_frmwrk`](../OFFMODE/premierjs_frmwrk)

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
