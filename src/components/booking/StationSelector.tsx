import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStationCategories, useStationSubcategories, useStations } from "@/hooks/useStations";
import { Loader2 } from "lucide-react";

interface StationSelection {
  categoryId: string;
  subcategoryId: string;
  stationId: string;
}

interface StationSelectorProps {
  index: number;
  selection: StationSelection;
  onChange: (selection: StationSelection) => void;
  excludeStationIds?: string[];
}

export function StationSelector({ index, selection, onChange, excludeStationIds = [] }: StationSelectorProps) {
  const { data: categories, isLoading: categoriesLoading } = useStationCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useStationSubcategories(selection.categoryId);
  const { data: stations, isLoading: stationsLoading } = useStations(selection.subcategoryId);

  const handleCategoryChange = (categoryId: string) => {
    onChange({ categoryId, subcategoryId: "", stationId: "" });
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    onChange({ ...selection, subcategoryId, stationId: "" });
  };

  const handleStationChange = (stationId: string) => {
    onChange({ ...selection, stationId });
  };

  // Filter out already selected stations
  const availableStations = stations?.filter(s => !excludeStationIds.includes(s.id) || s.id === selection.stationId);

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
      <Label className="text-sm font-medium">Station {index + 1}</Label>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Category Select */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={selection.categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {categoriesLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Select */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Sub-category</Label>
          <Select
            value={selection.subcategoryId}
            onValueChange={handleSubcategoryChange}
            disabled={!selection.categoryId}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select sub-category" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {subcategoriesLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                subcategories?.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Station Select */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Station</Label>
          <Select
            value={selection.stationId}
            onValueChange={handleStationChange}
            disabled={!selection.subcategoryId}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {stationsLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : availableStations?.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground">No stations available</div>
              ) : (
                availableStations?.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
