export interface CourseLesson {
  id: string;
  title: string;
  theme: string;
  category: string;
  embedUrl: string;
  order?: number;
  isSequential?: boolean;
}

export const COURSE_CATALOG: CourseLesson[] = [
  {
    id: 'first-step-sumario',
    title: 'First Step Lesson 00 - Summary',
    theme: 'Visão Geral do Curso: Fonética, Pronomes, Verbos, Substantivos e Vocabulário',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVCL-a8s/VRbOdk1IUCfx5OoSM72kUg/view?embed',
    order: 1,
    isSequential: true,
  },
  {
    id: 'first-step-01',
    title: 'First Step Lesson 01',
    theme: 'Pronomes e Verb To Be (Afirmativo)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHXiV-R8Sg/h7p9DKTfDGNmzgK2He6UOg/view?embed',
    order: 2,
    isSequential: true,
  },
  {
    id: 'first-step-02',
    title: 'First Step Lesson 02',
    theme: 'Verb To Be (Negativo) + Countries and Nationalities',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVHmV3II/jVaSuGl6TzticPCBJb29Qg/view?embed',
    order: 3,
    isSequential: true,
  },
  {
    id: 'first-step-03-0',
    title: 'First Step Lesson 03.0',
    theme: 'Verb To Be (Questions) + Days of the Week & Prepositions',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVI568RY/FYcfZPfMvZUO3d7V-XeGUg/view?embed',
    order: 4,
    isSequential: true,
  },
  {
    id: 'first-step-03-1',
    title: 'First Step Lesson 03.1',
    theme: 'Verb To Be + Professions (Profissões)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVGonABw/D9c17KyQxKr17-bJlhXxnA/view?embed',
    order: 5,
    isSequential: true,
  },
  {
    id: 'first-step-03-2',
    title: 'First Step Lesson 03.2',
    theme: 'Verb To Be + Feelings (Sentimentos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVIuwBIw/CxfVsn3RgfCi5YoXn71LOw/view?embed',
    order: 6,
    isSequential: true,
  },
  {
    id: 'first-step-03-3',
    title: 'First Step Lesson 03.3',
    theme: 'Verb To Be + Marital Status (Estado Civil)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVBuk6xU/1JFzkp-TWnEtPx-uVxc4Lg/view?embed',
    order: 7,
    isSequential: true,
  },
  {
    id: 'first-step-03-4',
    title: 'First Step Lesson 03.4',
    theme: 'Verb To Be + Name & Common Adjectives',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVDURhrk/JfFGK_MRXvJBzbH3Wc8iSw/view?embed',
    order: 8,
    isSequential: true,
  },
  {
    id: 'first-step-03-5',
    title: 'First Step Lesson 03.5',
    theme: 'Verb To Be + Age & Numbers (1 a 90)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVBTtAE0/P09q6ggKz7gnZvOn3wWt5w/view?embed',
    order: 9,
    isSequential: true,
  },
  {
    id: 'first-step-03-6',
    title: 'First Step Lesson 03.6',
    theme: 'Verb To Be + State of Being & Demonstratives (This/That/These/Those)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVMmWLFQ/jayYYFWj7kTnxnSsvrhA0g/view?embed',
    order: 10,
    isSequential: true,
  },
  {
    id: 'first-step-04-0',
    title: 'First Step Lesson 04.0',
    theme: 'Action Verbs & Simple Present (Introdução: S, ES, IES)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVNJgKKw/AuGZD_PPaxnEyQdl982tAQ/view?embed',
    order: 11,
    isSequential: true,
  },
  {
    id: 'first-step-04-1',
    title: 'First Step Lesson 04.1',
    theme: 'Simple Present (Afirmativo e Verbos de Ação)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVCptfiY/axkjJ6Ys5ODdul7h7FbHPQ/view?embed',
    order: 12,
    isSequential: true,
  },
  {
    id: 'first-step-04-2',
    title: 'First Step Lesson 04.2',
    theme: "Simple Present (Negativo: Don't e Doesn't)",
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVDS1wPg/hgmi98QX4hfqA5k8iWQKGg/view?embed',
    order: 13,
    isSequential: true,
  },
  {
    id: 'first-step-04-3',
    title: 'First Step Lesson 04.3',
    theme: 'Simple Present (Interrogativo e Inversão)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVHPvLEE/cwi9Gjxw0DQLQ4jcL5Unsw/view?embed',
    order: 14,
    isSequential: true,
  },
  {
    id: 'first-step-05',
    title: 'First Step Lesson 05',
    theme: 'Adverbs of Frequency (Advérbios de Frequência)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVC-cJdQ/mgINO022wrxB2Ejf7h1YIg/view?embed',
    order: 15,
    isSequential: true,
  },
  {
    id: 'first-step-06-0',
    title: 'First Step Lesson 06.0',
    theme: 'Nouns: Concrete Nouns, Artigos e Preposições',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVNoToWo/qe5mUrByvfy8qgyq1DIeKQ/view?embed',
    order: 16,
    isSequential: true,
  },
  {
    id: 'first-step-06-1',
    title: 'First Step Lesson 06.1',
    theme: 'Nouns: Abstract Nouns (Substantivos Abstratos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVHqKnK4/mRjbSOm5ADv96l4Y0NE1Yw/view?embed',
    order: 17,
    isSequential: true,
  },
  {
    id: 'first-step-06-2',
    title: 'First Step Lesson 06.2',
    theme: 'Nouns: Countable and Uncountable (Contáveis e Incontáveis)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVJdg7-Y/F03WqVx2fij4v-uRNPFE1Q/view?embed',
    order: 18,
    isSequential: true,
  },
  {
    id: 'first-step-06-3',
    title: 'First Step Lesson 06.3',
    theme: 'Nouns: Singular and Plural (Singular e Plural)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVCM0RWM/2jHNUEeGsR9xZr4-xPugAA/view?embed',
    order: 19,
    isSequential: true,
  },
  {
    id: 'first-step-06-4',
    title: 'First Step Lesson 06.4',
    theme: 'Review: Nouns (Revisão Geral de Substantivos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVClBetU/C2kzH-v-KU-LpG9YvM7FoQ/view?embed',
    order: 20,
    isSequential: true,
  },
  {
    id: 'first-step-07-0',
    title: 'First Step Lesson 07.0',
    theme: 'Prepositions (TO x FOR) & Cardinal/Ordinal Numbers',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVIPVqrU/xyTxXTdjFUtED4pZydLglQ/view?embed',
    order: 21,
    isSequential: true,
  },
  {
    id: 'first-step-07-1',
    title: 'First Step Lesson 07.1',
    theme: 'Numbers & Basic Math (Números e Operações Básicas)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVCqm2Sk/8fZbLTwSK1rXz_H4n9-Wnw/view?embed',
    order: 22,
    isSequential: true,
  },
  {
    id: 'first-step-08',
    title: 'First Step Lesson 08',
    theme: 'Parts of the Body + Possessive Adjectives',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVAeZoAU/Z30_Rrzv6DLLs6hrzKSZww/view?embed',
    order: 23,
    isSequential: true,
  },
  {
    id: 'first-step-09-0',
    title: 'First Step Lesson 09.0',
    theme: 'Alphabet & Articles (Alfabeto, Fonética e Artigos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVMtXFqo/QWiPaFHk4Lpp_oBvab1hpw/view?embed',
    order: 24,
    isSequential: true,
  },
  {
    id: 'first-step-09-1',
    title: 'First Step Lesson 09.1',
    theme: 'Articles & Spelling Practice (Artigos e Soletração)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVDje5ek/36PRiNbxDi62gJsMGJOicQ/view?embed',
    order: 25,
    isSequential: true,
  },
  {
    id: 'first-step-10',
    title: 'First Step Lesson 10',
    theme: 'Hours & Telling the Time (Horas em Inglês)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVJgYjV0/uZJe6lp1jhxFm9CX12nadg/view?embed',
    order: 26,
    isSequential: true,
  },
  {
    id: 'first-step-11',
    title: 'First Step Lesson 11',
    theme: 'Simple Past: Verb To Be (Passado do Verbo To Be)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVMS2_Bk/2W0KdKuSjO3WvoH0ONXa3w/view?embed',
    order: 27,
    isSequential: true,
  },
  {
    id: 'first-step-11-0-review',
    title: 'First Step Lesson 11.0 Review',
    theme: 'Review: Verb To Be, Simple Present & Vocabulário Geral',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVO-R6Sc/WpYSAgJEbG5XoEHCp0vwjg/view?embed',
    order: 28,
    isSequential: true,
  },
  {
    id: 'first-step-11-1',
    title: 'First Step Lesson 11.1',
    theme: 'Simple Past: Signal Words (Presente x Passado)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVPBC22Y/htvHoI68bPpONd1ytD-6nA/view?embed',
    order: 29,
    isSequential: true,
  },
  {
    id: 'first-step-12-0',
    title: 'First Step Lesson 12.0',
    theme: 'Simple Past: Introdução (Ações Regulares e Irregulares)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVOWzJt4/8A0-EEfcMkVBdYbHcJcCig/view?embed',
    order: 30,
    isSequential: true,
  },
  {
    id: 'first-step-12-1',
    title: 'First Step Lesson 12.1',
    theme: 'Simple Past: Regular Verbs (-D, -ED, -IED e Pronúncia)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVNL2474/VUQXzQDykfjnonqVFw3_DQ/view?embed',
    order: 31,
    isSequential: true,
  },
  {
    id: 'first-step-12-2',
    title: 'First Step Lesson 12.2',
    theme: 'Simple Past: Irregular Verbs (Verbos Irregulares)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVDhIKWg/Jld5Fza5nGEv3Ig0PKkNcA/view?embed',
    order: 32,
    isSequential: true,
  },
  {
    id: 'first-step-12-3',
    title: 'First Step Lesson 12.3',
    theme: 'Simple Past: Prática de Estruturas e Substituição',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVKhjZLM/kK86cgssJ2aXDWWeGaSwyg/view?embed',
    order: 33,
    isSequential: true,
  },
  {
    id: 'first-step-13',
    title: 'First Step Lesson 13',
    theme: 'Present Continuous (Introdução e Places in the City)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVJAxm-I/CKbAsyJsPigJK6-GdVOJSA/view?embed',
    order: 34,
    isSequential: true,
  },
  {
    id: 'first-step-13-1',
    title: 'First Step Lesson 13.1',
    theme: 'Present Continuous: Regras do -ING & Places in the City (Parte 2)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVNQfzLA/qiLumydiJ_sux98LLL3aMg/view?embed',
    order: 35,
    isSequential: true,
  },
  {
    id: 'first-step-14-0',
    title: 'First Step Lesson 14.0',
    theme: 'Modal Verb CAN & Food and Meals (Introdução)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVEBd2t8/s397Pc8yAFc43IuDoY_4MQ/view?embed',
    order: 36,
    isSequential: true,
  },
  {
    id: 'first-step-14-1',
    title: 'First Step Lesson 14.1',
    theme: 'Food and Meals: Vocabulário e Pedidos com CAN',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVGtnd14/74WRpR66YfQdhFoW94OqIw/view?embed',
    order: 37,
    isSequential: true,
  },
  {
    id: 'first-step-14-2',
    title: 'First Step Lesson 14.2',
    theme: 'Revisão de Tempos Verbais (To Be, Simple Present, Past & Continuous)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVDbKa7k/Q0CvBhlRCjSs7NRuHaVCqw/view?embed',
    order: 38,
    isSequential: true,
  },
  {
    id: 'first-step-15-0',
    title: 'First Step Lesson 15.0',
    theme: 'Future with WILL (Decisões Espontâneas)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVFTJQXo/fYkXP3PJZ-hNFH3XKMbHXg/view?embed',
    order: 39,
    isSequential: true,
  },
  {
    id: 'first-step-15-1',
    title: 'First Step Lesson 15.1',
    theme: 'Future with BE GOING TO (Planos e Intenções)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVC4SN80/6FvToXZs14A0yDH67Xt_mw/view?embed',
    order: 40,
    isSequential: true,
  },
  {
    id: 'first-step-15-2',
    title: 'First Step Lesson 15.2',
    theme: 'Future: WILL x BE GOING TO & Signal Words',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVGOWEII/8dMy_bQ60DsQUejJe6ALrQ/view?embed',
    order: 41,
    isSequential: true,
  },
  {
    id: 'first-step-16',
    title: 'First Step Lesson 16',
    theme: 'WH Questions (Perguntas com Pronomes Interrogativos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVEwHnIg/7qRrpzqBWiaW0Keniqr-fA/view?embed',
    order: 42,
    isSequential: true,
  },
  {
    id: 'first-step-17',
    title: 'First Step Lesson 17',
    theme: 'Indefinite Pronouns (Pronomes Indefinidos)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVG7j324/W6QN6pUxlMnMtGE6p9pnOQ/view?embed',
    order: 43,
    isSequential: true,
  },
  {
    id: 'first-step-18-0',
    title: 'First Step Lesson 18.0',
    theme: 'Vocabulário Complementar & Prática Guiada (Parte 1)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVJ5_io0/16-5JgSbDKXEVji_AdiKGg/view?embed',
    order: 44,
    isSequential: true,
  },
  {
    id: 'first-step-18-1',
    title: 'First Step Lesson 18.1',
    theme: 'Vocabulário Complementar & Prática Guiada (Parte 2)',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVL0g9qk/a2JQ3lOGeE6Jx7Ncguv7Kg/view?embed',
    order: 45,
    isSequential: true,
  },
  {
    id: 'first-step-19',
    title: 'First Step Lesson 19',
    theme: 'Revisão Geral do Módulo First Step',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVAk3wnE/xMbvXKeIawaEjzMRDzmfgA/view?embed',
    order: 46,
    isSequential: true,
  },
  {
    id: 'first-step-20',
    title: 'First Step Lesson 20',
    theme: 'Consolidação e Preparação para Avaliação Final',
    category: 'Módulo 1: First Step',
    embedUrl: 'https://www.canva.com/design/DAHQVNeu7Uk/Wl4ymnrFtVxCoqdzHrrNDw/view?embed',
    order: 47,
    isSequential: true,
  },
  {
    id: 'CELPIP Canada - Writing',
    title: 'CELPIP Canada - Writing',
    theme: 'Writing',
    category: 'E-books',
    embedUrl: 'https://canva.link/qj6w83u3716v3gg/view?embed',
    isSequential: false,
  },
];

function getSortedModuleLessons(category: string): CourseLesson[] {
  return COURSE_CATALOG.filter(
    (item) => item.category === category && item.isSequential
  ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getLessonAccessInfo(
  lesson: CourseLesson,
  completedIds: string[]
): { isLocked: boolean; prerequisiteTitle?: string } {
  if (!lesson.isSequential) {
    return { isLocked: false };
  }

  const moduleLessons = getSortedModuleLessons(lesson.category);
  const currentIndex = moduleLessons.findIndex((item) => item.id === lesson.id);

  if (currentIndex <= 0) {
    return { isLocked: false };
  }

  const previousLesson = moduleLessons[currentIndex - 1];
  const hasCompletedPrevious = completedIds.includes(previousLesson.id);

  return {
    isLocked: !hasCompletedPrevious,
    prerequisiteTitle: previousLesson.title,
  };
}

export function getNextSequentialLesson(currentLesson: CourseLesson): CourseLesson | null {
  if (!currentLesson.isSequential) {
    return null;
  }

  const moduleLessons = getSortedModuleLessons(currentLesson.category);
  const currentIndex = moduleLessons.findIndex((item) => item.id === currentLesson.id);

  if (currentIndex >= 0 && currentIndex < moduleLessons.length - 1) {
    return moduleLessons[currentIndex + 1];
  }

  return null;
}
export interface CourseProgressSummary {
  totalLessons: number;
  completedCount: number;
  percentage: number;
  nextLesson: CourseLesson | null;
  isCourseCompleted: boolean;
}

export function getCourseProgressSummary(completedIds: string[]): CourseProgressSummary {
  const sequentialLessons = COURSE_CATALOG.filter((item) => item.isSequential).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const totalLessons = sequentialLessons.length;
  const completedSet = new Set(completedIds);

  const completedCount = sequentialLessons.filter((lesson) =>
    completedSet.has(lesson.id)
  ).length;

  const percentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const nextLesson =
    sequentialLessons.find((lesson) => !completedSet.has(lesson.id)) ?? null;

  return {
    totalLessons,
    completedCount,
    percentage,
    nextLesson,
    isCourseCompleted: totalLessons > 0 && completedCount === totalLessons,
  };
}