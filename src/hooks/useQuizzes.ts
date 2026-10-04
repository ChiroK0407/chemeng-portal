import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface QuizFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
}

export function useQuizzes(filters: QuizFilters = {}) {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: async () => (await api.get('/quizzes', { params: filters })).data,
    placeholderData: (previousData) => previousData,
  });
}

export function useQuiz(slug: string) {
  return useQuery({
    queryKey: ['quiz', slug],
    queryFn: async () => (await api.get(`/quizzes/${slug}`)).data?.data,
    enabled: !!slug,
  });
}
