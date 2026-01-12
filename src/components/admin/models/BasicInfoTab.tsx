import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, ModelFormData } from "./types";

interface BasicInfoTabProps {
  formData: ModelFormData;
  categories: Category[];
  onChange: (field: keyof ModelFormData, value: string | boolean) => void;
}

export function BasicInfoTab({ formData, categories, onChange }: BasicInfoTabProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom du modèle *</Label>
        <Input 
          id="name" 
          placeholder="ex: RTX 4090 Gaming X Trio"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="brand">Marque (AIB) *</Label>
          <Input 
            id="brand" 
            placeholder="ex: MSI, ASUS, Gigabyte"
            value={formData.brand}
            onChange={(e) => onChange('brand', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="manufacturer">Fabricant (Chip) *</Label>
          <Select 
            value={formData.manufacturer} 
            onValueChange={(value) => onChange('manufacturer', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NVIDIA">NVIDIA</SelectItem>
              <SelectItem value="AMD">AMD</SelectItem>
              <SelectItem value="Intel">Intel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={(value) => onChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="family">Famille / Gamme</Label>
          <Input 
            id="family" 
            placeholder="ex: RTX 40, Ryzen 7000"
            value={formData.family}
            onChange={(e) => onChange('family', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="aliases">Alias (séparés par virgules)</Label>
        <Input 
          id="aliases" 
          placeholder="ex: 4090, GeForce RTX 4090"
          value={formData.aliases}
          onChange={(e) => onChange('aliases', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Noms alternatifs utilisés pour matcher les annonces
        </p>
      </div>
    </div>
  );
}
