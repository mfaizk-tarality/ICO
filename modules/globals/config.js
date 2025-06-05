import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();
export const invalidateQuery = () => {
  return (keys = []) => {
    return queryClient.invalidateQueries({ queryKey: [...keys] });
  };
};
