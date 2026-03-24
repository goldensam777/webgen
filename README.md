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
| IA | Claude Sonnet 4.6 (Anthropic API) |
| State | Zustand 5 + persist (localStorage) |
| Styles | Tailwind CSS 4 + CSS Custom Properties |
| Auth | JWT (jose) + bcryptjs |
| Language | TypeScript 5 |

## Architecture

```
webgen/
├── app/
│   ├── api/
│   │   ├── generate/route.ts        # Claude API → SiteConfig multi-pages
│   │   ├── publish/route.ts         # Sauvegarde data/sites/[slug].json
│   │   ├── auth/login|register/     # JWT auth (jose + bcryptjs)
│   │   └── dashboard/sites/         # Liste des sites de l'utilisateur
│   ├── s/[slug]/page.tsx            # SSR page d'accueil du site publié
│   ├── s/[slug]/[page]/page.tsx     # SSR sous-pages
│   ├── auth/page.tsx                # Login / Register
│   ├── dashboard/page.tsx           # Dashboard utilisateur
│   ├── create/page.tsx              # Formulaire de génération + éditeur
│   ├── store/
│   │   ├── siteStore.ts             # Zustand multi-pages + persist
│   │   └── authStore.ts             # Auth state (user, token)
│   └── page.tsx                     # Landing page (marketing)
├── components/
│   ├── editor/
│   │   ├── EditorLayout.tsx         # Split-view sidebar + preview
│   │   ├── SectionWrapper.tsx       # Sélection, toolbar, resize par section
│   │   ├── EditableContext.tsx      # Context isEditing + fieldStyles
│   │   ├── EditableText.tsx         # Texte cliquable → contentEditable
│   │   ├── FloatingToolbar.tsx      # Bulle flottante (taille police, gras)
│   │   ├── SectionPanel.tsx         # Gestion des sections (drag & drop)
│   │   ├── StylePanel.tsx           # 7 color pickers temps réel
│   │   ├── ContentPanel.tsx         # Édition champ par champ
│   │   └── PublishModal.tsx         # Modal de publication avec slug
│   ├── sections/                    # 10 sections (Premier.js + EditableText)
│   └── ui/                          # 23 composants primitifs (Premier.js)
├── data/
│   ├── sites/[slug].json            # Sites publiés
│   └── users.json                   # Utilisateurs
└── middleware.ts                    # Routage *.webgen.app → /s/[slug]
```

## Système multi-pages

Chaque site est structuré en pages indépendantes :

```typescript
interface SiteConfig {
  pages: SitePage[];   // tableau de pages
  theme: SiteTheme;    // 7 couleurs partagées
}

interface SitePage {
  id: string;
  name: string;        // ex: "Services"
  slug: string;        // ex: "services" (vide = page d'accueil)
  sections: string[];  // ordre des sections
  data: Record<string, Record<string, unknown>>;
}
```

## Éditeur visuel — édition inline (style Canva)

### Sélection d'une section
Cliquer sur une section dans le preview la sélectionne (bordure verte). Un toolbar flottant apparaît en haut à droite avec ↑ ↓ / ✏️ / 🗑.

### Édition inline des textes
Quand une section est sélectionnée, tous ses champs texte affichent un contour vert pointillé. Cliquer sur n'importe quel texte l'active en `contentEditable` :
- **Enter** ou blur → sauvegarde dans le store
- **Escape** → annule

### Toolbar flottante (FloatingToolbar)
En focus sur un texte, une bulle apparaît au-dessus avec :
- Nom du champ (Titre, Sous-titre, Bouton…)
- Taille de police **A−** / `32px` / **A+** (par pas de 2px, min 10 max 120)
- Toggle **Gras**

Les styles sont stockés dans `section.data._styles[field]` et persistés.

### Redimensionnement des sections
Un handle `↕ Redimensionner` apparaît en bas de la section sélectionnée. Glisser vers le bas/haut ajuste le padding vertical. Un indicateur `+Npx` s'affiche en temps réel.

### Clés privées de l'éditeur
Les clés `_*` dans `section.data` sont filtrées avant d'être passées aux composants :
- `_styles` — styles par champ (fontSize, fontWeight)
- `_paddingY` — padding vertical additionnel

## Système de thème

7 CSS Custom Properties injectées sur le wrapper preview :

```css
--color-primary    --color-secondary   --color-background
--color-surface    --color-text        --color-text-muted
--color-border
```

Mise à jour en temps réel via StylePanel sans recompilation Tailwind.

## Auth

```
POST /api/auth/register  →  { user, token }
POST /api/auth/login     →  { user, token }
```

JWT 30 jours signé avec `jose` (HS256). Passwords hashés bcryptjs (10 rounds). Token envoyé en header `Authorization: Bearer <token>` sur publish et dashboard.

## Publication

```
Utilisateur choisit un slug → POST /api/publish
→ data/sites/[slug].json  { slug, config, userId, publishedAt }
→ accessible sur https://[slug].webgen.app
```

DNS wildcard `*.webgen.app` → serveur. Middleware Next.js extrait le sous-domaine et rewrite vers `/s/[slug]`.

## Développement

```bash
cp .env.local.example .env.local
# ANTHROPIC_API_KEY=sk-ant-...
# JWT_SECRET=change-in-prod

npm install
npm run dev        # http://localhost:3000
                   # Sites publiés : http://localhost:3000/s/[slug]
```

## Premier.js

Webgen est construit sur **Premier.js**, un framework de composants React/Next.js écrit entièrement à la main. Il fournit 23 composants UI primitifs, 10 sections de page avec édition inline, un système de thème via CSS Custom Properties et un système d'édition inline (EditableText + FloatingToolbar).

→ [`../OFFMODE/premierjs_frmwrk`](../OFFMODE/premierjs_frmwrk)
