import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useStationCategories, useStationSubcategories, useAllStations } from "@/hooks/useStations";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
  useCreateStation,
  useUpdateStation,
  useDeleteStation,
  useToggleStationActive,
} from "@/hooks/useStationsCRUD";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FolderTree, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export function StationsManagement() {
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useStationCategories();
  const { data: subcategories } = useStationSubcategories();
  const { data: stations, isLoading: stationsLoading } = useAllStations();

  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Subcategory state
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string; name: string; categoryId: string } | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");

  // Station state
  const [stationDialogOpen, setStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<{ id: string; name: string; subcategoryId: string } | null>(null);
  const [stationName, setStationName] = useState("");
  const [stationSubcategoryId, setStationSubcategoryId] = useState("");

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();
  const deleteStation = useDeleteStation();
  const toggleStationActive = useToggleStationActive();

  // Category handlers
  const openCategoryDialog = (category?: { id: string; name: string }) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, name: categoryName });
        toast({ title: "Category updated" });
      } else {
        await createCategory.mutateAsync(categoryName);
        toast({ title: "Category created" });
      }
      setCategoryDialogOpen(false);
      setCategoryName("");
      setEditingCategory(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Category deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Subcategory handlers
  const openSubcategoryDialog = (subcategory?: { id: string; name: string; category_id: string }) => {
    if (subcategory) {
      setEditingSubcategory({ id: subcategory.id, name: subcategory.name, categoryId: subcategory.category_id });
      setSubcategoryName(subcategory.name);
      setSubcategoryCategoryId(subcategory.category_id);
    } else {
      setEditingSubcategory(null);
      setSubcategoryName("");
      setSubcategoryCategoryId("");
    }
    setSubcategoryDialogOpen(true);
  };

  const handleSaveSubcategory = async () => {
    try {
      if (editingSubcategory) {
        await updateSubcategory.mutateAsync({ 
          id: editingSubcategory.id, 
          name: subcategoryName, 
          categoryId: subcategoryCategoryId 
        });
        toast({ title: "Subcategory updated" });
      } else {
        await createSubcategory.mutateAsync({ categoryId: subcategoryCategoryId, name: subcategoryName });
        toast({ title: "Subcategory created" });
      }
      setSubcategoryDialogOpen(false);
      setSubcategoryName("");
      setSubcategoryCategoryId("");
      setEditingSubcategory(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await deleteSubcategory.mutateAsync(id);
      toast({ title: "Subcategory deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Station handlers
  const openStationDialog = (station?: { id: string; name: string; subcategory_id: string }) => {
    if (station) {
      setEditingStation({ id: station.id, name: station.name, subcategoryId: station.subcategory_id });
      setStationName(station.name);
      setStationSubcategoryId(station.subcategory_id);
    } else {
      setEditingStation(null);
      setStationName("");
      setStationSubcategoryId("");
    }
    setStationDialogOpen(true);
  };

  const handleSaveStation = async () => {
    try {
      if (editingStation) {
        await updateStation.mutateAsync({ 
          id: editingStation.id, 
          name: stationName, 
          subcategoryId: stationSubcategoryId 
        });
        toast({ title: "Station updated" });
      } else {
        await createStation.mutateAsync({ subcategoryId: stationSubcategoryId, name: stationName });
        toast({ title: "Station created" });
      }
      setStationDialogOpen(false);
      setStationName("");
      setStationSubcategoryId("");
      setEditingStation(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteStation = async (id: string) => {
    try {
      await deleteStation.mutateAsync(id);
      toast({ title: "Station deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStation = async (id: string, isActive: boolean) => {
    try {
      await toggleStationActive.mutateAsync({ id, isActive });
      toast({ title: isActive ? "Station disabled" : "Station enabled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6">
      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Station Categories
            </CardTitle>
            <CardDescription>Manage exam station categories</CardDescription>
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openCategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., History Taking"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCategory} disabled={!categoryName || createCategory.isPending || updateCategory.isPending}>
                  {(createCategory.isPending || updateCategory.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {subcategories
                        ?.filter((sub: any) => sub.category_id === cat.id)
                        .map((sub: any) => (
                          <Badge key={sub.id} variant="secondary" className="text-xs">
                            {sub.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openCategoryDialog(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the category and all its subcategories and stations. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {!categories?.length && <p className="text-center py-4 text-muted-foreground">No categories yet</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>Manage station subcategories</CardDescription>
          </div>
          <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openSubcategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Subcategory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Parent Category</Label>
                  <Select value={subcategoryCategoryId} onValueChange={setSubcategoryCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory Name</Label>
                  <Input
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    placeholder="e.g., Depression History"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSaveSubcategory} 
                  disabled={!subcategoryName || !subcategoryCategoryId || createSubcategory.isPending || updateSubcategory.isPending}
                >
                  {(createSubcategory.isPending || updateSubcategory.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategory</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories?.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.category?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openSubcategoryDialog(sub)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the subcategory and all its stations. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSubcategory(sub.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Stations</CardTitle>
            <CardDescription>Manage individual stations</CardDescription>
          </div>
          <Dialog open={stationDialogOpen} onOpenChange={setStationDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => openStationDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Station
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStation ? "Edit Station" : "Add Station"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subcategory</Label>
                  <Select value={stationSubcategoryId} onValueChange={setStationSubcategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories?.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.category?.name} → {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Station Name</Label>
                  <Input
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    placeholder="e.g., Major Depressive Disorder"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStationDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSaveStation} 
                  disabled={!stationName || !stationSubcategoryId || createStation.isPending || updateStation.isPending}
                >
                  {(createStation.isPending || updateStation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {stationsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations?.map((station: any) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>{station.subcategory?.category?.name || "—"}</TableCell>
                    <TableCell>{station.subcategory?.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={station.is_active}
                          onCheckedChange={() => handleToggleStation(station.id, station.is_active)}
                        />
                        <span className="text-sm">{station.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openStationDialog(station)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Station?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this station. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStation(station.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}