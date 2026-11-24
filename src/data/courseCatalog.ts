export interface CourseLesson {
  id: string;
  title: string;
  theme: string;
  category: string;
  embedUrl: string;
  order?: number;         // Define a ordem dentro do módulo (ex: 1, 2, 3...)
  isSequential?: boolean; // true = exige concluir o item anterior; false/undefined = acesso livre
}

export const COURSE_CATALOG: CourseLesson[] = [
  {
    id: 'Sumário',
    title: 'Sumário — First Step',
    theme: 'Visão Geral e Cronograma do Módulo 1',
    category: 'Sumário',
    embedUrl: 'https://www.canva.com/design/DAHQVCL-a8s/VRbOdk1IUCfx5OoSM72kUg/view?embed',
    order: 1,
    isSequential: true,
  },
  {
    id: 'first-step-01',
    title: 'First Step Lesson 01#',
    theme: 'Introdução e Alfabeto',
    category: 'Módulo 1: Básico',
    embedUrl: 'https://www.canva.com/design/DAHXiV-R8Sg/h7p9DKTfDGNmzgK2He6UOg/view?embed',
    order: 2,
    isSequential: true,
  },
  {
    id: 'first-step-02',
    title: 'First Step Lesson 02#',
    theme: 'Verbo To Be e Cumprimentos',
    category: 'Módulo 1: Básico',
    embedUrl: 'https://www.canva.com/design/DAHQVHmV3II/jVaSuGl6TzticPCBJb29Qg/view?embed',
    order: 3,
    isSequential: true,
  },
  {
    id: 'CELPIP Canada Writing',
    title: 'CELPIP Canada Writing',
    theme: 'Writing',
    category: 'E-books',
    embedUrl: 'https://canva.link/qj6w83u3716v3gg/view?embed',
    isSequential: false, // E-books continuam com acesso livre
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