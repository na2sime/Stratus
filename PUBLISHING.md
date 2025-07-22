# 🚀 Guide de Publication - @wizecorp/stratusjs

## Prérequis

- Compte npm actif
- Accès en écriture au package (si organisation)
- Node.js ≥ 16.0.0

## 📋 Étapes de Publication

### 1. **Préparation**

```bash
# Vérifier que tout est à jour
git status
git add .
git commit -m "Prepare for publication v0.1.0-beta"

# Nettoyer et rebuilder
rm -rf dist/ cli-dist/
npm run build:all
```

### 2. **Validation Pré-Publication**

```bash
# Linter le code
npm run lint

# Vérifier les fichiers qui seront publiés
npm pack --dry-run

# Tester localement
npm link
cd ../test-directory
npm link stratusjs
```

### 3. **Connexion à npm**

```bash
# Se connecter à npm (première fois)
npm adduser

# Ou se reconnecter
npm login

# Vérifier la connexion
npm whoami
```

### 4. **Publication**

#### Version Beta (Recommandé pour la première fois)
```bash
npm publish --tag beta
```

#### Version Stable
```bash
npm publish
```

#### Publication avec Organisation
```bash
npm publish --access public  # Pour les packages @scope/name
```

### 5. **Vérification Post-Publication**

```bash
# Vérifier que le package est disponible
npm view @wizecorp/stratusjs

# Tester l'installation globale
npm install -g @wizecorp/stratusjs

# Créer un projet test
mkdir test-published && cd test-published
stratusjs create my-test-app
cd my-test-app
npm install
npm run dev
```

## 📦 Structure Publiée

Le package npm inclut :
- `dist/` - Framework compilé (TypeScript → JavaScript)
- `cli-dist/` - CLI compilée  
- `bin/` - Scripts exécutables
- `templates/` - Templates de projets (default, hybrid, ssr)
- Documentation (README.md, LICENSE)

## 🔄 Mise à Jour

### Patch Version (0.1.0 → 0.1.1)
```bash
npm version patch
npm publish
```

### Minor Version (0.1.0 → 0.2.0)
```bash
npm version minor
npm publish
```

### Major Version (0.1.0 → 1.0.0)
```bash
npm version major
npm publish
```

## 🏷️ Gestion des Tags

```bash
# Publier en beta
npm publish --tag beta

# Promouvoir beta vers latest
npm dist-tag add stratusjs@0.1.0-beta latest

# Voir tous les tags
npm dist-tag ls stratusjs
```

## 🔐 Sécurité

- Ne jamais committer de tokens npm
- Utiliser `npm audit` régulièrement
- Activer 2FA sur le compte npm
- Utiliser `--dry-run` pour tester avant publication

## 🐛 Dépannage

### Erreur "403 Forbidden"
```bash
# Vérifier les permissions
npm owner ls stratusjs
npm adduser
```

### Erreur "Package already exists"
```bash
# Changer la version
npm version patch
# Ou changer le nom dans package.json
```

### CLI ne fonctionne pas après installation
```bash
# Vérifier que les fichiers CLI sont inclus
npm pack --dry-run | grep cli-dist

# Reconstruire la CLI
npm run build:cli
```

## 📈 Post-Publication

1. **Mettre à jour la documentation** avec les nouvelles instructions d'installation
2. **Créer un release** sur GitHub avec les notes de version
3. **Tester sur différents OS** (Windows, macOS, Linux)
4. **Partager** avec la communauté (Twitter, Reddit, etc.)

---

## ⚡ Installation pour les Utilisateurs

Après publication, les utilisateurs pourront installer avec :

```bash
# Installation globale de la CLI
npm install -g @wizecorp/stratusjs

# Création d'un nouveau projet
stratusjs create mon-projet

# Dans le projet
npm install  # stratusjs sera installé automatiquement
npm run dev
```

## 🎯 Commandes Disponibles après Installation

```bash
stratusjs create <project-name>    # Créer un nouveau projet
stratusjs dev                      # Démarrer le serveur de dev
stratusjs build                    # Build pour production
stratusjs generate <type> <name>   # Générer pages/services/layouts
stratusjs deploy                   # Déployer vers production
stratusjs info                     # Infos sur le projet
```

## 📝 Notes de Version

### v0.1.0-beta
- ✅ Framework React avec routing file-system
- ✅ CLI complète avec templates (default, hybrid, ssr)
- ✅ Service Container et middleware système
- ✅ Support TypeScript et TailwindCSS
- ✅ Support SSR et génération statique