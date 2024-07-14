import { useQuery } from "@tanstack/react-query";

export const useFetchImage = (url: string) => {
  return useQuery({
    queryKey: ["image", url],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
  });
};
