import { trpc } from "../utils/trpc";

export const useNews = () => {
  const allNewsQuery = trpc.newsRouter.getAll.useQuery();

  const getNewsById = (id: string) => {
    return trpc.newsRouter.getById.useQuery({ id });
  };

  const searchNews = (query: string) => {
    return trpc.newsRouter.search.useQuery({ query });
  };

  return {
    allNews: allNewsQuery.data ?? [],
    isLoading: allNewsQuery.isLoading,
    error: allNewsQuery.error,
    getNewsById,
    searchNews,
  };
};
