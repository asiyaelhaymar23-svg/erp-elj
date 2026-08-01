import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Hook générique : un seul fichier de pattern à dupliquer pour chaque
// module (fournisseurs, commandes, DA, entrées, sorties, dépenses...).
// Remplacer `resource` par le nom du endpoint REST correspondant.
export function useCrud<T = any>(resource: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resource] });

  const list = (params: Record<string, any> = {}) =>
    useQuery({
      queryKey: [resource, params],
      queryFn: async () => (await api.get(`/${resource}`, { params })).data,
    });

  const detail = (id: number | null) =>
    useQuery({
      queryKey: [resource, id],
      queryFn: async () => (await api.get(`/${resource}/${id}`)).data,
      enabled: id != null,
    });

  const create = useMutation({
    mutationFn: (data: Partial<T>) => api.post(`/${resource}`, data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<T> }) => api.patch(`/${resource}/${id}`, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/${resource}/${id}`),
    onSuccess: invalidate,
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => api.post(`/${resource}/${id}/duplicate`),
    onSuccess: invalidate,
  });

  return { list, detail, create, update, remove, duplicate };
}
