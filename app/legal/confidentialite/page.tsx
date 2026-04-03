import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Webgenx",
  description: "Comment Webgenx collecte, utilise et protège vos données personnelles.",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}>
      <header
        className="px-6 h-14 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <Link href="/" className="font-bold text-xl" style={{ color: "var(--wg-green)" }}>
          Webgenx
        </Link>
        <Link href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--wg-text-2)" }}>
          ← Retour
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-sm mb-10" style={{ color: "var(--wg-text-3)" }}>Dernière mise à jour : mars 2026</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed" style={{ color: "var(--wg-text-2)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>1. Qui sommes-nous ?</h2>
            <p>Webgenx est un outil de création de sites web propulsé par l&apos;intelligence artificielle. Le service est opéré par Samuel Yevi. Pour toute question relative à vos données, contactez-nous à l&apos;adresse indiquée en bas de page.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>2. Données collectées</h2>
            <p className="mb-3">Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
            <ul className="list-disc list-inside flex flex-col gap-2 ml-2">
              <li><strong>Données de compte :</strong> nom, adresse e-mail, mot de passe haché (nous ne stockons jamais votre mot de passe en clair).</li>
              <li><strong>Contenu de vos sites :</strong> textes, images et configurations générés ou uploadés via Webgenx.</li>
              <li><strong>Données d&apos;usage :</strong> logs de connexion, pages visitées — à des fins de sécurité et d&apos;amélioration du service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>3. Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc list-inside flex flex-col gap-2 ml-2 mt-2">
              <li>Fournir et améliorer le service Webgenx</li>
              <li>Authentifier votre compte et sécuriser votre accès</li>
              <li>Stocker et publier vos sites web</li>
            </ul>
            <p className="mt-3">Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>4. Stockage et sécurité</h2>
            <p>Vos données sont stockées sur des serveurs Supabase (infrastructure PostgreSQL sécurisée). Les mots de passe sont hachés avec bcrypt. Les communications sont chiffrées via HTTPS. Nous appliquons le principe de moindre privilège sur tous nos accès base de données.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>5. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside flex flex-col gap-2 ml-2 mt-2">
              <li><strong>Accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Rectification :</strong> corriger des données inexactes</li>
              <li><strong>Suppression :</strong> demander l&apos;effacement de votre compte et de toutes vos données</li>
              <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
            </ul>
            <p className="mt-3">Pour exercer ces droits, contactez-nous par e-mail.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>6. Cookies</h2>
            <p>Webgenx utilise un cookie de session sécurisé (<code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "var(--wg-bg-3)" }}>webgenx-token</code>) pour maintenir votre connexion. Ce cookie est HTTP-only, ne peut pas être lu par JavaScript, et expire après 30 jours. Aucun cookie de tracking tiers n&apos;est utilisé.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>7. Contact</h2>
            <p>Pour toute question relative à cette politique ou à vos données personnelles, écrivez-nous à : <strong>contact@webgenx.app</strong></p>
          </section>

        </div>
      </main>
    </div>
  );
}
