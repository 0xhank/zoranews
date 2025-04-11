import { trpc } from "../utils/trpc";

export const useNews = () => {
  const allNewsQuery = trpc.news.getAll.useQuery();

  const getNewsById = (id: string) => {
    return trpc.news.getById.useQuery({ id });
  };

  const searchNews = (query: string) => {
    return trpc.news.search.useQuery({ query });
  };

  return {
    allNews: allNewsQuery.data ?? [],
    isLoading: allNewsQuery.isLoading,
    error: allNewsQuery.error,
    getNewsById,
    searchNews,
  };
};
