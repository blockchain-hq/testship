import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPrograms, subscribeToEvents } from "@/lib/api";
import { useWorkspace } from "@/store/use-workspace";

export const usePrograms = () => {
  const queryClient = useQueryClient();
  const loadPrograms = useWorkspace((s) => s.loadPrograms);

  const query = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
  });

  useEffect(() => {
    if (query.data) {
      loadPrograms(query.data);
    }
  }, [query.data, loadPrograms]);

  useEffect(() => {
    const unsub = subscribeToEvents(() => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    });
    return unsub;
  }, [queryClient]);

  return query;
};
