export interface UserProgress {
  modules_completed: number[];
  total_modules: number;
  credits_earned: number;
  badges: string[];
  hours_spent: number;
}

export interface TrainingModule {
  id: number;
  title: string;
  objective: string;
  duration: string;
  completed: boolean;
  videoUrl?: string;
  content: string[];
  resources: string[];
  quizQuestions: number;
  creditReward: number;
  badge?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface QuizResult {
  questions_total: number;
  correct: number;
  score_pct: number;
  credits_awarded: number;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

export const mockUserProgress: UserProgress = {
  modules_completed: [1, 2],
  total_modules: 6,
  credits_earned: 3,
  badges: ["Apprenti Scraper", "Maître Scraper"],
  hours_spent: 2.5
};

export const mockTrainingModules: TrainingModule[] = [
  {
    id: 1,
    title: "Comprendre la plateforme",
    objective: "Maîtriser l'écosystème et les principes du site",
    duration: "12 min",
    completed: true,
    content: [
      "Présentation du site et de ses objectifs",
      "Explication du scraping collaboratif et éthique",
      "Architecture des données et API",
      "Principes RGPD et confidentialité",
      "Système de crédits et quotas",
      "Navigation dans l'interface"
    ],
    resources: ["PDF Architecture simplifiée", "Page Tendances", "Politique RGPD"],
    quizQuestions: 5,
    creditReward: 0,
    badge: "Apprenti Scraper"
  },
  {
    id: 2,
    title: "Maîtriser le scraping",
    objective: "Utiliser l'extension et contribuer à la communauté",
    duration: "20 min",
    completed: true,
    content: [
      "Installation et configuration de l'extension",
      "Sélectionner un modèle et lancer un scrap",
      "Différence entre scrap faible et fort",
      "Gérer les captchas et délais anti-blocage",
      "Participer au scrap communautaire",
      "Système de récompenses et shards",
      "Conditions d'éligibilité et cooldowns",
      "Comprendre les limites et quotas"
    ],
    resources: ["Guide extension complet", "Tutoriel vidéo", "Charte communautaire"],
    quizQuestions: 8,
    creditReward: 1,
    badge: "Maître Scraper"
  },
  {
    id: 3,
    title: "Analyser le marché hardware",
    objective: "Interpréter les données et exploiter les outils d'analyse",
    duration: "18 min",
    completed: false,
    content: [
      "Différence prix médian vs prix moyen",
      "Variations temporelles et saisonnalité",
      "Corrélations entre volume et prix",
      "Indices de rareté et fair value",
      "Utiliser l'Estimator pour évaluer un composant",
      "Lire les graphiques de tendances",
      "Exploiter les fiches modèles",
      "Exercice : analyser une RTX 3070"
    ],
    resources: ["Guide analyse de marché", "Guide Estimator", "Glossaire statistique"],
    quizQuestions: 7,
    creditReward: 1,
    badge: "Analyste Expert"
  },
  {
    id: 4,
    title: "Acheter au bon moment",
    objective: "Identifier les opportunités et optimiser le timing d'achat",
    duration: "15 min",
    completed: false,
    content: [
      "Comprendre les cycles de marché hardware",
      "Saisonnalité : Black Friday, soldes, rentrée",
      "Impact des sorties de nouvelles générations",
      "Détecter les bonnes affaires automatiquement",
      "Utiliser les alertes et la watchlist",
      "Analyser le score marché d'une annonce",
      "Timing d'achat selon le composant",
      "Exercice : planifier un achat GPU"
    ],
    resources: ["Calendrier saisonnier", "Guide des alertes", "Historique sorties GPU/CPU"],
    quizQuestions: 6,
    creditReward: 1,
    badge: "Acheteur Stratégique"
  },
  {
    id: 5,
    title: "Estimer et revendre",
    objective: "Calculer sa marge et optimiser le prix de revente",
    duration: "16 min",
    completed: false,
    content: [
      "Utiliser l'Estimator pour fixer un prix de vente",
      "Calculer sa marge nette (achat, frais, revente)",
      "Comprendre les frais de plateforme et livraison",
      "Estimer la décote selon l'état du composant",
      "Optimiser le prix pour vendre rapidement",
      "Créer une annonce attractive",
      "Photographier et décrire efficacement",
      "Exercice : estimer la marge sur un PC complet"
    ],
    resources: ["Guide Estimator avancé", "Template d'annonce", "Calculateur de marge"],
    quizQuestions: 7,
    creditReward: 2,
    badge: "Vendeur Pro"
  },
  {
    id: 6,
    title: "Sécuriser ses transactions",
    objective: "Négocier, payer et livrer en toute sécurité",
    duration: "14 min",
    completed: false,
    content: [
      "Techniques de négociation efficaces",
      "Vérifier la fiabilité d'un vendeur",
      "Méthodes de paiement sécurisées",
      "Remise en main propre : bonnes pratiques",
      "Livraison : assurance et protection",
      "Reconnaître et éviter les arnaques",
      "Que faire en cas de litige",
      "Exercice : analyser des situations à risque"
    ],
    resources: ["Guide sécurité transactions", "Liste des arnaques courantes", "FAQ litiges"],
    quizQuestions: 8,
    creditReward: 1,
    badge: "Trader Sécurisé"
  }
];

export const mockBadges: Badge[] = [
  {
    id: "apprenti",
    name: "🧩 Apprenti Scraper",
    description: "Terminé le module 1",
    icon: "puzzle",
    earned: true
  },
  {
    id: "maitre_scraper",
    name: "🦾 Maître Scraper",
    description: "Terminé le module 2",
    icon: "zap",
    earned: true
  },
  {
    id: "analyste",
    name: "🧠 Analyste Expert",
    description: "Terminé le module 3",
    icon: "brain",
    earned: false
  },
  {
    id: "acheteur",
    name: "🎯 Acheteur Stratégique",
    description: "Terminé le module 4",
    icon: "target",
    earned: false
  },
  {
    id: "vendeur",
    name: "💰 Vendeur Pro",
    description: "Terminé le module 5",
    icon: "dollar-sign",
    earned: false
  },
  {
    id: "trader",
    name: "🔒 Trader Sécurisé",
    description: "Terminé le module 6",
    icon: "shield",
    earned: false
  }
];


export const mockQuizResult: QuizResult = {
  questions_total: 10,
  correct: 8,
  score_pct: 80,
  credits_awarded: 1
};

export const mockFAQ = [
  {
    question: "Pourquoi le bouton scrap ne marche pas ?",
    answer: "Le bouton scrap communautaire n'est actif que lorsque le backend a un besoin urgent de données ET que vous n'avez pas atteint votre limite quotidienne. Vérifiez également que le cooldown entre deux scraps est respecté."
  },
  {
    question: "Combien de crédits je gagne ?",
    answer: "Vous gagnez +1 crédit par module complété (sauf le module 1), et +2 crédits pour le module 5. Le quiz final offre +1 crédit si vous obtenez 8/10 ou plus. Les contributions communautaires offrent également des crédits bonus."
  },
  {
    question: "Où trouver l'extension ?",
    answer: "L'extension navigateur sera disponible prochainement sur le Chrome Web Store et Firefox Add-ons. En attendant, suivez le module 2 pour comprendre son fonctionnement."
  },
  {
    question: "Comment estimer la marge sur un achat-revente ?",
    answer: "Le module 5 couvre en détail l'estimation de marge. Utilisez l'Estimator pour obtenir un prix de revente réaliste, soustrayez le prix d'achat, les frais de plateforme (~5-10%), et les frais de livraison éventuels. Prévoyez une décote selon l'état du composant."
  },
  {
    question: "Quel est le meilleur moment pour acheter ?",
    answer: "Le module 4 explique le timing d'achat. En général : Black Friday/Cyber Monday, sorties de nouvelles générations (décote de l'ancienne), et période post-rentrée. Utilisez les alertes pour être notifié des bonnes affaires."
  },
  {
    question: "Comment éviter les arnaques ?",
    answer: "Le module 6 couvre la sécurité des transactions. Privilégiez le paiement sécurisé, vérifiez la réputation du vendeur, préférez la remise en main propre pour les gros montants, et méfiez-vous des prix trop bas. Ne payez jamais par virement avant d'avoir vu le produit."
  }
];

export const bestPractices = [
  {
    title: "Respect des plateformes",
    description: "Le scraping est manuel et non invasif",
    icon: "hand",
    type: "good" as const
  },
  {
    title: "Confidentialité",
    description: "Les données collectées sont anonymisées",
    icon: "shield-check",
    type: "good" as const
  },
  {
    title: "Captcha",
    description: "Toujours résoudre manuellement",
    icon: "check-circle",
    type: "good" as const
  },
  {
    title: "Cooldown",
    description: "Ne jamais relancer un scrap immédiatement",
    icon: "clock",
    type: "good" as const
  },
  {
    title: "Sécurité",
    description: "L'extension ne lit ni n'envoie d'informations personnelles",
    icon: "lock",
    type: "good" as const
  }
];

export const forbiddenPractices = [
  {
    title: "🚫 Automatiser",
    description: "Risque de bannissement définitif"
  },
  {
    title: "🚫 Partager son compte",
    description: "Strictement interdit"
  },
  {
    title: "🚫 Modifier l'extension",
    description: "Entraîne une suspension immédiate"
  }
];
