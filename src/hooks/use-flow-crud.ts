import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FlowTree } from "@/lib/flow-engine/types";
import type { Json } from "@/integrations/supabase/types";

export interface FlowRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: "draft" | "published" | "archived";
  current_version: number | null;
  updated_at: string;
}

export function useFlows() {
  return useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flows")
        .select("id, name, description, category, status, current_version, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as FlowRow[];
    },
  });
}

export function useFlowVersion(flowId: string | undefined) {
  return useQuery({
    queryKey: ["flow-version", flowId],
    enabled: !!flowId,
    queryFn: async () => {
      // Get latest version for this flow
      const { data, error } = await supabase
        .from("flow_versions")
        .select("*")
        .eq("flow_id", flowId!)
        .order("version", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFlow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; description: string; category: string }) => {
      const { data: flow, error: flowErr } = await supabase
        .from("flows")
        .insert({
          name: input.name,
          description: input.description,
          category: input.category,
          status: "draft",
          current_version: 1,
          created_by: user?.id,
        })
        .select()
        .single();
      if (flowErr) throw flowErr;
      return flow;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flows"] }),
  });
}

export function useSaveFlowVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ flowId, tree, version }: { flowId: string; tree: FlowTree; version: number }) => {
      // Update flow metadata
      await supabase
        .from("flows")
        .update({
          name: tree.flow.name,
          description: tree.flow.description,
          category: tree.flow.category,
          current_version: version,
        })
        .eq("id", flowId);

      // Check if this version already exists
      const { data: existing } = await supabase
        .from("flow_versions")
        .select("id")
        .eq("flow_id", flowId)
        .eq("version", version)
        .maybeSingle();

      if (existing) {
        // Update existing version
        const { error } = await supabase
          .from("flow_versions")
          .update({ tree_json: tree as unknown as Json })
          .eq("id", existing.id);
        if (error) throw error;
        return existing;
      } else {
        // Insert new version
        const { data, error } = await supabase
          .from("flow_versions")
          .insert({
            flow_id: flowId,
            version,
            tree_json: tree as unknown as Json,
            status: "draft",
            created_by: user?.id,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-version", vars.flowId] });
    },
  });
}
