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
  total_modules: 4,
  credits_earned: 2,
  badges: ["Apprenti Scraper", "Analyste Marché"],
  hours_spent: 1.33
};

export const mockTrainingModules: TrainingModule[] = [
  {
    id: 1,
    title: "Comprendre la plateforme",
    objective: "Savoir comment fonctionne l'écosystème du site",
    duration: "10 min",
    completed: true,
    content: [
      "Présentation du site et de ses objectifs",
      "Explication du scraping collaboratif",
      "Analyse des données et API",
      "Principes RGPD et confidentialité"
    ],
    resources: ["PDF Architecture simplifiée", "Page Tendances"],
    quizQuestions: 3,
    creditReward: 0,
    badge: "Apprenti Scraper"
  },
  {
    id: 2,
    title: "Utiliser l'extension navigateur",
    objective: "Apprendre à scraper correctement sans blocage",
    duration: "15 min",
    completed: true,
    content: [
      "Installation de l'extension",
      "Sélectionner un modèle",
      "Lancer un scrap faible et fort",
      "Gérer les captchas et délais",
      "Comprendre les limites et quotas"
    ],
    resources: ["Guide extension PDF", "Tutoriel vidéo"],
    quizQuestions: 5,
    creditReward: 1,
    badge: "Analyste Marché"
  },
  {
    id: 3,
    title: "Participer au scrap communautaire",
    objective: "Contribuer aux données globales",
    duration: "12 min",
    completed: false,
    content: [
      "Comprendre le système de besoins backend",
      "Utiliser le bouton Scrap communautaire",
      "Répartition des shards et récompenses",
      "Conditions d'éligibilité (limites, cooldown)",
      "Éthique du scraping et respect des plateformes"
    ],
    resources: ["Charte communautaire", "FAQ contribution"],
    quizQuestions: 5,
    creditReward: 1,
    badge: "Contributeur Communautaire"
  },
  {
    id: 4,
    title: "Lire et interpréter les données",
    objective: "Exploiter les pages Tendances et Fiche modèle",
    duration: "15 min",
    completed: false,
    content: [
      "Différence prix médian / prix moyen",
      "Variations temporelles et saisonnalité",
      "Corrélations entre volume et prix",
      "Indices de rareté et fair value",
      "Utilisation de l'Estimator",
      "Exercice pratique : analyser une RTX 3070"
    ],
    resources: ["Guide analyse de marché", "Glossaire statistique"],
    quizQuestions: 7,
    creditReward: 2,
    badge: "Expert Hardware"
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
    id: "analyste",
    name: "🧠 Analyste Marché",
    description: "Terminé le module 2",
    icon: "brain",
    earned: true
  },
  {
    id: "contributeur",
    name: "🦾 Contributeur Communautaire",
    description: "Terminé le module 3",
    icon: "users",
    earned: false
  },
  {
    id: "expert",
    name: "🏆 Expert Hardware",
    description: "Terminé le module 4",
    icon: "trophy",
    earned: false
  }
];

export const mockGuides: Guide[] = [
  {
    id: "extension",
    title: "📘 Guide de l'extension navigateur",
    description: "Installation, configuration et utilisation complète",
    icon: "book-open",
    url: "#"
  },
  {
    id: "estimator",
    title: "🧮 Guide de l'Estimator",
    description: "Évaluer le prix de vente de vos composants",
    icon: "calculator",
    url: "/estimator"
  },
  {
    id: "tendances",
    title: "📊 Guide d'analyse de tendances",
    description: "Comprendre et exploiter les graphiques de marché",
    icon: "trending-up",
    url: "/tendances"
  },
  {
    id: "quotas",
    title: "⚙️ Guide des quotas & crédits",
    description: "Système de limites et récompenses",
    icon: "settings",
    url: "#"
  },
  {
    id: "rgpd",
    title: "🔒 Guide RGPD & sécurité",
    description: "Protection des données et confidentialité",
    icon: "shield",
    url: "/rgpd"
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
    answer: "Vous gagnez généralement +1 crédit par mission communautaire complétée. Certains modules de formation offrent des crédits bonus : module 2 (+1), module 3 (+1), module 4 (+2). Le quiz final offre +1 crédit si vous obtenez 8/10 ou plus."
  },
  {
    question: "Où trouver l'extension ?",
    answer: "L'extension navigateur sera disponible prochainement sur le Chrome Web Store et Firefox Add-ons. En attendant, suivez le module 2 pour comprendre son fonctionnement."
  },
  {
    question: "Comment lire un graphique de tendances ?",
    answer: "Le module 4 couvre en détail l'interprétation des graphiques. En résumé : la ligne principale montre le prix médian, la zone grisée représente l'intervalle P25-P75, et les pics de volume indiquent une forte activité sur le marché."
  },
  {
    question: "Pourquoi dois-je résoudre les captchas ?",
    answer: "Le scraping est manuel et nécessite une présence humaine. Les captchas protègent les plateformes contre l'automatisation abusive. Vous devez toujours les résoudre manuellement pour respecter les conditions d'utilisation des sites."
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
