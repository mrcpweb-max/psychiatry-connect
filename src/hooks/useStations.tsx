import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StationCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface StationSubcategory {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
  category?: StationCategory;
}

export interface Station {
  id: string;
  subcategory_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  subcategory?: StationSubcategory;
}

export function useStationCategories() {
  return useQuery({
    queryKey: ["station-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("station_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as StationCategory[];
    },
  });
}

export function useStationSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ["station-subcategories", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("station_subcategories")
        .select("*, category:station_categories(id, name)")
        .order("name");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StationSubcategory[];
    },
    enabled: categoryId ? true : true,
  });
}

export function useStations(subcategoryId?: string) {
  return useQuery({
    queryKey: ["stations", subcategoryId],
    queryFn: async () => {
      let query = supabase
        .from("stations")
        .select("*, subcategory:station_subcategories(id, name, category_id)")
        .eq("is_active", true)
        .order("name");

      if (subcategoryId) {
        query = query.eq("subcategory_id", subcategoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Station[];
    },
  });
}

export function useAllStations() {
  return useQuery({
    queryKey: ["all-stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stations")
        .select(`
          *,
          subcategory:station_subcategories(
            id, 
            name, 
            category_id,
            category:station_categories(id, name)
          )
        `)
        .order("name");

      if (error) throw error;
      return data as Station[];
    },
  });
}
