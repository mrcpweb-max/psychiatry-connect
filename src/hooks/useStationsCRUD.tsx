import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Category CRUD
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("station_categories")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("station_categories")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("station_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-categories"] });
      queryClient.invalidateQueries({ queryKey: ["station-subcategories"] });
    },
  });
}

// Subcategory CRUD
export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, name }: { categoryId: string; name: string }) => {
      const { data, error } = await supabase
        .from("station_subcategories")
        .insert({ category_id: categoryId, name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-subcategories"] });
    },
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, categoryId }: { id: string; name: string; categoryId?: string }) => {
      const updates: any = { name };
      if (categoryId) updates.category_id = categoryId;
      
      const { data, error } = await supabase
        .from("station_subcategories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-subcategories"] });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("station_subcategories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["station-subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["all-stations"] });
    },
  });
}

// Station CRUD
export function useCreateStation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subcategoryId, name }: { subcategoryId: string; name: string }) => {
      const { data, error } = await supabase
        .from("stations")
        .insert({ subcategory_id: subcategoryId, name, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, subcategoryId, isActive }: { id: string; name?: string; subcategoryId?: string; isActive?: boolean }) => {
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (subcategoryId !== undefined) updates.subcategory_id = subcategoryId;
      if (isActive !== undefined) updates.is_active = isActive;
      
      const { data, error } = await supabase
        .from("stations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}

export function useToggleStationActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("stations")
        .update({ is_active: !isActive })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}