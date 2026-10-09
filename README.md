# fabricetoyi.dev

Portfolio de Toyi Fabrice (developpeurtaf). Basé sur le template [AstroZen](https://github.com/immois/astro-zen) : Astro 6, Tailwind CSS 4, site 100 % statique déployé sur Vercel.

| Commande       | Action                                         |
| :------------- | :--------------------------------------------- |
| `pnpm install` | Installe les dépendances                       |
| `pnpm dev`     | Serveur de dev sur `localhost:4321`            |
| `pnpm build`   | Vérifie les types puis génère le site (`dist/`) |
| `pnpm preview` | Prévisualise le build                          |

## Structure

```
public/admin/          Interface d'administration (Sveltia CMS) : index.html + config.yml
public/uploads/        Images envoyées depuis l'admin
src/data/settings.json Réglages communs : nom, email, WhatsApp, devise, abonnés YouTube, réseaux
src/data/fr/*.json     Contenu en français (un fichier par section)
src/data/en/*.json     Contenu en anglais (mêmes fichiers)
src/i18n/index.ts      Chargement du contenu par langue
src/i18n/ui.ts         Libellés fixes de l'interface (menu, boutons, formulaire) FR/EN
src/lib/youtube.ts     Récupération des 3 dernières vidéos (flux RSS, sans clé API)
src/lib/format.ts      Prix, nombres, dates, liens WhatsApp
src/components/        Sections (Hero, Services, Resources, YouTube, Contact…)
src/pages/index.astro  Page FR (/)  —  src/pages/en/index.astro : page EN (/en/)
```

## Mettre à jour le contenu : l'admin `/admin`

Rendez-vous sur **https://fabricetoyi.dev/admin/**. Chaque enregistrement crée un commit sur GitHub, puis Vercel redéploie le site en 1 minute environ.

- **Réglages** : email, téléphone, numéro WhatsApp, devise, **nombre d'abonnés YouTube**, réseaux sociaux.
- **Contenu du site** : chaque section a ses versions FR et EN, éditables côte à côte.
  - Les **prix**, images et liens se saisissent en FR et sont recopiés automatiquement en EN.
  - Pour ajouter, retirer ou réordonner un service ou une offre, le faire dans la version FR.

### Connexion

1. **Avec un jeton (le plus simple)** : sur l'écran de connexion, choisir *« Se connecter avec un jeton d'accès »*. Suivre le lien proposé pour générer un token GitHub. Il doit avoir accès au dépôt `EtudiantFabre/astro-zen` avec la permission *Contents: Read and write*. Le token reste stocké dans ton navigateur.
2. **En local, sans connexion** : lancer `pnpm dev`, puis ouvrir `http://localhost:4321/admin/index.html` dans Chrome ou Edge. Choisir *« Travailler avec un dépôt local »* et sélectionner le dossier du projet. Les modifications sont écrites directement dans les fichiers ; il reste à commit et push.
3. **Bouton « Se connecter avec GitHub »** (optionnel) : déployer [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) sur Cloudflare Workers (gratuit). Renseigner ensuite son URL dans `base_url` de `public/admin/config.yml`.

### Variables dans les textes

Dans les textes des projets et de « À propos », `{subscribers}` est remplacé par le nombre d'abonnés défini dans les Réglages, par exemple « 3 100+ ».

### Tarifs

Le prix se saisit sans devise ; la devise vient des Réglages.

| Valeur saisie | Affichage    |
| :------------ | :----------- |
| vide          | « Sur devis » |
| `0`           | « Gratuit »  |

Options :
- « À partir de » : case à cocher.
- Suffixe : par exemple « / heure ».
- « Mettre en avant » : la carte reçoit le badge *Le plus demandé*.

### Formations & ressources

| Statut               | Bouton                                                       |
| :------------------- | :----------------------------------------------------------- |
| « Bientôt disponible » | Ouvre WhatsApp avec un message « préviens-moi » (liste d'attente) |
| « Disponible »       | Mène au lien de paiement ou de détail ; le prix s'affiche    |

## Vidéos YouTube

Les 3 dernières vidéos (Shorts exclus) sont lues dans le flux RSS public de la chaîne, au moment du build. **Aucune clé API n'est nécessaire.** L'ID de la chaîne se règle dans *Réglages → Chaîne YouTube*.

Si le flux est indisponible, le build réussit quand même et la section affiche un lien vers la chaîne.

Comme le site est statique, les vidéos se mettent à jour à chaque déploiement. Pour un rafraîchissement quotidien automatique :

1. Vercel → projet → *Settings → Git → Deploy Hooks* : créer un hook sur la branche `main` et copier l'URL.
2. GitHub → dépôt → *Settings → Secrets and variables → Actions* : créer le secret `VERCEL_DEPLOY_HOOK_URL` avec cette URL.

Le workflow `.github/workflows/daily-rebuild.yml` déclenche alors un déploiement chaque jour à 6h.

## Langues

- Français par défaut sur `/`, anglais sur `/en/`. Le sélecteur FR | EN est dans le header.
- Les balises `hreflang`, `canonical` et le `sitemap.xml` sont générés automatiquement.
- Pour modifier un libellé d'interface (menu, boutons, formulaire) : `src/i18n/ui.ts`.

## Formulaire de contact

Le site n'a pas de backend. Le formulaire compose un message pré-rempli et l'ouvre dans WhatsApp ou dans la messagerie du visiteur.
