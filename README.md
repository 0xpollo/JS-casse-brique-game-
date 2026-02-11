# 🎮 Casse-Brique Premium

Un jeu de casse-brique moderne avec des effets visuels premium, un système d'items et 2 niveaux de difficulté.

![Gameplay](https://img.shields.io/badge/Status-Jouable-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0-blue)

## ✨ Fonctionnalités

### 🎨 Design Visuel Premium
- **Briques colorées arc-en-ciel** avec gradients dégradés
- **Effets 3D** sur la balle, la raquette et les briques
- **Particules colorées** lors de la destruction des briques
- **Trail lumineux** sur la balle
- **Interface moderne** avec animations CSS et effets glassmorphisme
- **Fond animé** avec dégradés multicolores

### 🎁 Système d'Items (30% de chance)
Les briques peuvent lâcher des power-ups qui tombent :
- 🟢 **⇔ Agrandir** - Raquette plus large (10 secondes)
- 🔴 **⇒⇐ Rétrécir** - Raquette plus petite (8 secondes)
- 🔵 **▼ Ralentir** - Balle plus lente (8 secondes)
- 🟣 **▲ Accélérer** - Balle plus rapide (6 secondes)
- 🟡 **♥ Vie+** - Ajoute une vie (max 3)

### 📊 Système de Niveaux
- **Niveau 1** : 5 rangées × 7 colonnes (35 briques)
- **Niveau 2** : 6 rangées × 7 colonnes (42 briques)
  - Balle plus rapide
  - Nouvelles couleurs de briques
  - Progression automatique

### 🎯 Gameplay Optimisé
- **Collision précise** entre la balle et la raquette
- **3 vies** pour terminer les 2 niveaux
- **Score en temps réel** avec affichage du niveau
- **Performance optimisée** pour un gameplay fluide

## 🚀 Démarrage Rapide

1. **Cloner le projet**
```bash
git clone https://github.com/0xpollo/JS-casse-brique-game-.git
cd JS-casse-brique-game-
```

2. **Ouvrir le jeu**
```bash
open index.html
# ou double-cliquer sur index.html
```

Pas de dépendances, pas de build, juste ouvrir et jouer !

## 🎮 Contrôles

- **←** Flèche Gauche : Déplacer la raquette à gauche
- **→** Flèche Droite : Déplacer la raquette à droite

## 🛠️ Technologies

- **HTML5 Canvas** - Rendu graphique
- **JavaScript (ES6+)** - Logique de jeu
- **CSS3** - Animations et effets visuels

## 📁 Structure du Projet

```
JS-casse-brique-game-/
├── index.html          # Page principale
├── script.js           # Logique du jeu
├── style.css           # Styles et animations
├── images/             # Assets graphiques
│   ├── heart.png
│   ├── game-over.png
│   └── big-win.png
└── README.md
```

## 🎯 Fonctionnalités Techniques

### Classes JavaScript
- **Particle** - Système de particules pour les effets visuels
- **Item** - Gestion des power-ups tombants

### Optimisations
- Utilisation de `requestAnimationFrame` via `setInterval` optimisé
- Particules limitées (12 par brique)
- Trail de balle réduit (4 points)
- Suppression efficace des objets inactifs

### Effets Visuels
- Gradients radiaux et linéaires
- Coins arrondis avec polyfill `roundRect`
- Transparence et ombres optimisées
- Animations CSS fluides

## 🐛 Debug

Si le jeu ne se lance pas :
1. Vérifier la console du navigateur (F12)
2. S'assurer que les chemins des images sont corrects
3. Utiliser un navigateur récent (Chrome, Firefox, Safari)

## 📝 Améliorations Futures

- [ ] Mode multi-balles
- [ ] Niveaux supplémentaires
- [ ] Tableau des scores
- [ ] Effets sonores
- [ ] Mode difficile avec briques résistantes
- [ ] Power-ups supplémentaires

## 👤 Auteur

Développé avec ❤️ par **Mathieu**

Co-développé avec l'aide de **Claude Sonnet 4.5**

## 📄 Licence

Ce projet est libre d'utilisation pour l'apprentissage et le développement personnel.

---

🎮 **Amusez-vous bien !**
