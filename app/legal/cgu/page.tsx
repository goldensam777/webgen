import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Webgenx",
  description: "Les conditions d'utilisation du service Webgenx.",
  robots: { index: true, follow: true },
};

export default function CGUPage() {
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
        <h1 className="text-3xl font-bold mb-2">Conditions Générales d&apos;Utilisation</h1>
        <p className="text-sm mb-10" style={{ color: "var(--wg-text-3)" }}>Dernière mise à jour : mars 2026</p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed" style={{ color: "var(--wg-text-2)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>1. Objet</h2>
            <p>Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service Webgenx, plateforme de création de sites web par intelligence artificielle. En créant un compte ou en utilisant le service, vous acceptez ces CGU dans leur intégralité.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>2. Description du service</h2>
            <p>Webgenx permet de générer, personnaliser et publier des sites web en décrivant son projet en langage naturel. Le service est fourni &quot;tel quel&quot; et peut être modifié ou interrompu à tout moment, avec un préavis raisonnable.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>3. Création de compte</h2>
            <p>Pour accéder aux fonctionnalités du service, vous devez créer un compte avec une adresse e-mail valide et un mot de passe. Vous êtes responsable de la confidentialité de vos identifiants. Toute activité réalisée depuis votre compte vous est imputée.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>4. Utilisation acceptable</h2>
            <p className="mb-3">Vous vous engagez à ne pas utiliser Webgenx pour :</p>
            <ul className="list-disc list-inside flex flex-col gap-2 ml-2">
              <li>Créer des contenus illégaux, diffamatoires, frauduleux ou portant atteinte à des droits tiers</li>
              <li>Distribuer des logiciels malveillants ou du spam</li>
              <li>Tenter de compromettre la sécurité du service ou d&apos;autres utilisateurs</li>
              <li>Reproduire ou revendre le service sans autorisation écrite</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>5. Propriété intellectuelle</h2>
            <p>Les sites et contenus que vous créez via Webgenx vous appartiennent. Vous conservez tous les droits sur vos textes, images et données. En utilisant le service, vous accordez à Webgenx une licence limitée pour stocker et afficher votre contenu dans le cadre du service.</p>
            <p className="mt-2">Le code source de Webgenx, ses interfaces et son infrastructure restent la propriété exclusive de leurs auteurs.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>6. Limitation de responsabilité</h2>
            <p>Webgenx ne peut être tenu responsable des dommages indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service. La responsabilité totale de Webgenx est limitée au montant payé par l&apos;utilisateur au cours des 12 derniers mois.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>7. Résiliation</h2>
            <p>Vous pouvez supprimer votre compte à tout moment depuis votre tableau de bord. Webgenx se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>8. Modification des CGU</h2>
            <p>Ces CGU peuvent être mises à jour. En cas de modification substantielle, vous serez notifié par e-mail ou via une bannière sur le service. La poursuite de l&apos;utilisation du service après notification vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>9. Droit applicable</h2>
            <p>Ces CGU sont régies par le droit français. Tout litige sera soumis à la juridiction des tribunaux compétents.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--wg-text)" }}>10. Contact</h2>
            <p>Pour toute question relative aux présentes CGU : <strong>contact@webgenx.app</strong></p>
          </section>

        </div>
      </main>
    </div>
  );
}
