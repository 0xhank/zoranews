import { trpc } from "../utils/trpc";

export const useMemecoin = () => {
  const allMemecoinsQuery = trpc.memecoin.getAll.useQuery();

  const getMemecoinsById = (id: string) => {
    return trpc.memecoin.getById.useQuery({ id });
  };

  const generateMemecoin = () => {
    const mutation = trpc.memecoin.generateFromNews.useMutation();

    return {
      mutate: mutation.mutate,
      isLoading: mutation.isPending,
      error: mutation.error,
      data: mutation.data,
    };
  };

  return {
    allMemecoins: allMemecoinsQuery.data ?? [],
    isLoading: allMemecoinsQuery.isLoading,
    error: allMemecoinsQuery.error,
    getMemecoinsById,
    generateMemecoin,
  };
};
