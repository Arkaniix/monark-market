export interface UserProgress {
  modules_completed: number[];
  total_modules: number;
  hours_spent: number;
}

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  lessons: string[];
  icon: string;
}


export interface QuizResult {
  questions_total: number;
  correct: number;
  score_pct: number;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}


export const mockTrainingModules: TrainingModule[] = [
  {
    id: 0,
    title: "Premiers pas sur Monark",
    description: "Découvre l'interface, les fonctionnalités clés et comment tirer le meilleur parti de la plateforme.",
    duration: "5 min",
    lessons: [
      "Présentation de l'interface et navigation",
      "Comprendre ton tableau de bord personnel",
      "Comment lancer ton premier scan",
      "Utiliser le catalogue pour explorer les modèles",
      "L'Estimator : ton outil d'analyse rapide",
      "Configurer tes premières alertes",
      "Les crédits : comment ça marche ?"
    ],
    icon: "🚀",
    completed: false
  },
  {
    id: 1,
    title: "Comprendre le marché et les opportunités",
    description: "Apprends à 'lire' le marché avant d'agir : cycles de prix, rareté, saisonnalité et indices de tension.",
    duration: "8 min",
    lessons: [
      "Comment fonctionne le marché du hardware d'occasion",
      "Différence entre prix moyen et prix médian",
      "Indices de tension : volume, rareté, vitesse de vente",
      "Repérer les hausses et chutes avant les autres",
      "Étude de cas : baisse des RTX 3070 après sortie des 4070",
      "Lecture pratique d'une fiche modèle (prix, score, tendance)",
      "Savoir quand acheter et quand attendre"
    ],
    icon: "📊",
    completed: false
  },
  {
    id: 2,
    title: "Chercher, évaluer et scraper intelligemment",
    description: "Récolte des données utiles et fiables sans te faire bloquer : filtres, types de scraps, bonnes pratiques.",
    duration: "10 min",
    lessons: [
      "Utiliser la page Catalogue et les filtres (prix, état, région)",
      "Reconnaître une bonne affaire vs un piège",
      "Scrap faible : vue générale rapide",
      "Scrap fort : recherche filtrée précise",
      "Scrap communautaire : contribution récompensée",
      "Bonnes pratiques : rythme, gestion des crédits",
      "Impact collectif de chaque scrap"
    ],
    icon: "🔍",
    completed: true
  },
  {
    id: 3,
    title: "Analyser une annonce et calculer la rentabilité",
    description: "Distingue une opportunité réelle d'un simple bon prix grâce à l'analyse détaillée et l'Estimator.",
    duration: "12 min",
    lessons: [
      "Lire une annonce comme un pro (cohérence, mots-clés suspects)",
      "Utiliser l'Estimator pour simuler achat et revente",
      "Comprendre la marge nette après frais",
      "Identifier le niveau de risque (volume, stabilité)",
      "Éviter les faux deals et anomalies techniques",
      "Étude de cas : 2 annonces RTX 4060 comparées"
    ],
    icon: "💰",
    completed: false
  },
  {
    id: 4,
    title: "Acheter malin et négocier comme un pro",
    description: "Optimise le moment, le lieu et la méthode d'achat. Négocie efficacement et évite les arnaques.",
    duration: "10 min",
    lessons: [
      "Quand acheter : périodes calmes, sortie de nouvelles gammes",
      "Zones géographiques où les prix sont plus bas",
      "Comment contacter un vendeur efficacement",
      "Stratégies de négociation : offre crédible, créer la confiance",
      "Gérer un refus intelligemment",
      "Signes d'arnaques à éviter"
    ],
    icon: "💬",
    completed: false
  },
  {
    id: 5,
    title: "Bien revendre et maximiser ses profits",
    description: "Présente une annonce qui inspire confiance et se vend vite : photos, prix, description, réactivité.",
    duration: "10 min",
    lessons: [
      "Optimiser ses photos : nettes, fond neutre, lumière naturelle",
      "Titre clair sans surenchère",
      "Description précise et rassurante avec mots-clés",
      "Fixer le bon prix (5-10% au-dessus pour négociation)",
      "Réagir vite : répondre dans l'heure",
      "Gérer son compte vendeur : profil cohérent, constance"
    ],
    icon: "📸",
    completed: false
  },
  {
    id: 6,
    title: "Devenir rentable sur la durée",
    description: "Transforme l'achat-revente en routine maîtrisée avec une méthode cohérente et des performances suivies.",
    duration: "8 min",
    lessons: [
      "Routine type : analyse / achat / revente",
      "1 scrap communautaire par jour pour garder ses crédits",
      "Veille hebdo sur la page Tendances",
      "Suivre ses performances : marges, volume, rotation",
      "Mentalité du vendeur pro : cohérence > volume",
      "Bonus communautaire : classement et crédits via scraps"
    ],
    icon: "💡",
    completed: false
  }
];

export const mockUserProgress: UserProgress = {
  modules_completed: [],
  total_modules: mockTrainingModules.length,
  hours_spent: 0
};


export const mockQuizResult: QuizResult = {
  questions_total: 10,
  correct: 8,
  score_pct: 80
};

export const mockFAQ = [
  {
    question: "Quelle est la différence entre scrap faible et scrap fort ?",
    answer: "Le scrap faible offre une vue générale rapide d'un composant (moins de crédits). Le scrap fort permet une recherche filtrée et précise (plus coûteux en crédits mais plus pertinent pour cibler des opportunités)."
  },
  {
    question: "Comment utiliser l'Estimator pour calculer ma rentabilité ?",
    answer: "L'Estimator simule le prix d'achat idéal et la revente potentielle d'un composant. Il calcule ta marge nette après frais et déplacement, et t'indique le niveau de risque basé sur le volume et la stabilité du marché."
  },
  {
    question: "Quand est-ce le meilleur moment pour acheter ?",
    answer: "Les périodes calmes (hors fêtes/rentrée) et les sorties de nouvelles gammes sont idéales. Les prix baissent généralement quand de nouveaux modèles arrivent et que les vendeurs veulent écouler l'ancien stock."
  },
  {
    question: "Comment repérer une arnaque sur une annonce ?",
    answer: "Méfie-toi des vendeurs agressifs, prix incohérents (trop bas), photos floues/copiées, descriptions vagues avec mots suspects ('bug léger', 'marche parfois'), et demandes de paiement non sécurisé."
  },
  {
    question: "Comment optimiser mes annonces de revente ?",
    answer: "Utilise des photos nettes avec fond neutre et lumière naturelle, un titre clair sans surenchère, une description précise avec mots-clés, et fixe ton prix 5-10% au-dessus de ta cible pour avoir une marge de négociation."
  },
  {
    question: "Qu'est-ce que le scrap communautaire et pourquoi contribuer ?",
    answer: "Le scrap communautaire enrichit les données pour tous les utilisateurs. En contribuant, tu gagnes des crédits et tu améliores la qualité des analyses de marché pour l'ensemble de la communauté."
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
