import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-privacy-title">Politique de confidentialité</h1>
          <p className="text-muted-foreground">Dernière mise à jour : 10 février 2026</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
          <div className="space-y-6" data-testid="privacy-content">

            <section>
              <h2 className="text-lg font-semibold mb-2">1. Responsable du traitement</h2>
              <p className="text-muted-foreground">
                Le responsable du traitement des données personnelles collectées via la plateforme Mam Connect est la société Innov Studio.
                Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l'adresse : <strong>contact@mamconnect.fr</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Données collectées</h2>
              <div className="text-muted-foreground space-y-3">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Pour les Maisons d'Assistantes Maternelles (MAM) :</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nom de la structure</li>
                    <li>Adresse email et numéro de téléphone</li>
                    <li>Adresse postale (rue, ville, code postal)</li>
                    <li>Coordonnées GPS (calculées automatiquement à partir de l'adresse)</li>
                    <li>Capacité d'accueil, tranches d'âge acceptées, horaires d'ouverture</li>
                    <li>Description de la structure et du projet pédagogique</li>
                    <li>Services proposés</li>
                    <li>Photos de la structure</li>
                    <li>Informations sur les membres de l'équipe (nom, rôle, photo, description)</li>
                    <li>Places disponibles (date, nombre, notes)</li>
                    <li>Mot de passe (stocké sous forme chiffrée)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Pour les parents :</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prénom et nom</li>
                    <li>Adresse email et numéro de téléphone</li>
                    <li>Adresse postale (rue, ville, code postal)</li>
                    <li>Coordonnées GPS (calculées automatiquement à partir de l'adresse via l'API Adresse du gouvernement français)</li>
                    <li>Date de naissance de l'enfant</li>
                    <li>Date d'accueil souhaitée</li>
                    <li>Notes complémentaires</li>
                    <li>Préférences de notification et de recherche</li>
                    <li>Mot de passe (stocké sous forme chiffrée)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. Finalités du traitement</h2>
              <p className="text-muted-foreground">Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Publication et gestion de votre profil MAM dans l'annuaire (pour les MAM)</li>
                <li>Recherche de places disponibles à proximité de votre domicile (pour les parents)</li>
                <li>Envoi de notifications par email lorsqu'une place se libère dans un rayon de 30 km de votre adresse (pour les parents ayant activé cette option)</li>
                <li>Gestion des demandes de support et communication avec les utilisateurs</li>
                <li>Validation et modération des inscriptions par l'administration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Base légale du traitement</h2>
              <p className="text-muted-foreground">
                Le traitement de vos données repose sur votre <strong>consentement</strong> (article 6.1.a du RGPD), que vous exprimez lors de votre inscription en acceptant la présente politique de confidentialité. Vous pouvez retirer votre consentement à tout moment en nous contactant.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Géolocalisation</h2>
              <p className="text-muted-foreground">
                L'adresse postale que vous fournissez est convertie en coordonnées GPS via l'API Adresse du gouvernement français (<strong>api-adresse.data.gouv.fr</strong>). Ces coordonnées sont utilisées uniquement pour calculer la distance entre les parents et les MAM afin de proposer des résultats de recherche pertinents et d'envoyer des notifications de places disponibles dans un rayon de 30 km. Aucune géolocalisation en temps réel n'est effectuée.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Destinataires des données</h2>
              <p className="text-muted-foreground">Vos données personnelles peuvent être accessibles par :</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
                <li><strong>Les administrateurs de la plateforme</strong> : pour la validation des inscriptions et la gestion du support</li>
                <li><strong>Les utilisateurs publics</strong> : seules les informations publiées sur les profils MAM approuvés sont visibles (nom, description, adresse, capacité, photos, équipe, services)</li>
                <li><strong>Resend</strong> (service d'envoi d'emails) : pour l'envoi des notifications par email</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Vos données ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Durée de conservation</h2>
              <p className="text-muted-foreground">
                Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données seront effacées dans un délai de 30 jours. Les données liées aux tickets de support sont conservées pendant 1 an après leur clôture.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Sécurité des données</h2>
              <p className="text-muted-foreground">
                Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
                <li>Les mots de passe sont chiffrés avec l'algorithme <strong>bcrypt</strong> et ne sont jamais stockés en clair</li>
                <li>L'authentification utilise des jetons sécurisés avec une expiration de 24 heures</li>
                <li>Les communications sont chiffrées via HTTPS</li>
                <li>L'accès aux données est restreint aux seules personnes autorisées</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">9. Vos droits</h2>
              <p className="text-muted-foreground">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : corriger vos données directement depuis votre espace personnel</li>
                <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Droit à la limitation du traitement</strong> : restreindre l'utilisation de vos données</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Pour exercer ces droits, contactez-nous à <strong>contact@mamconnect.fr</strong>.
                Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">10. Cookies</h2>
              <p className="text-muted-foreground">
                La plateforme Mam Connect utilise le stockage local du navigateur (localStorage) uniquement pour maintenir votre session de connexion. Aucun cookie publicitaire ou de suivi n'est utilisé. Aucun outil d'analyse tiers (Google Analytics, etc.) n'est intégré.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">11. Modifications</h2>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. En cas de modification substantielle, vous serez informé par email ou via une notification sur la plateforme. La date de dernière mise à jour est indiquée en haut de cette page.
              </p>
            </section>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
