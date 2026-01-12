import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelFormData } from "./types";

interface SpecsTabProps {
  formData: ModelFormData;
  onChange: (field: keyof ModelFormData, value: string | boolean) => void;
}

export function SpecsTab({ formData, onChange }: SpecsTabProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="chip">Puce / GPU</Label>
          <Input 
            id="chip" 
            placeholder="ex: AD102, Navi 31"
            value={formData.chip}
            onChange={(e) => onChange('chip', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="release_date">Date de sortie</Label>
          <Input 
            id="release_date" 
            type="date"
            value={formData.release_date}
            onChange={(e) => onChange('release_date', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="vram_gb">VRAM (Go)</Label>
          <Input 
            id="vram_gb" 
            type="number"
            placeholder="ex: 24"
            value={formData.vram_gb}
            onChange={(e) => onChange('vram_gb', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="memory_type">Type mémoire</Label>
          <Select 
            value={formData.memory_type} 
            onValueChange={(value) => onChange('memory_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GDDR6X">GDDR6X</SelectItem>
              <SelectItem value="GDDR6">GDDR6</SelectItem>
              <SelectItem value="GDDR5X">GDDR5X</SelectItem>
              <SelectItem value="GDDR5">GDDR5</SelectItem>
              <SelectItem value="HBM2">HBM2</SelectItem>
              <SelectItem value="HBM2e">HBM2e</SelectItem>
              <SelectItem value="HBM3">HBM3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bus_width_bit">Bus (bits)</Label>
          <Input 
            id="bus_width_bit" 
            type="number"
            placeholder="ex: 384"
            value={formData.bus_width_bit}
            onChange={(e) => onChange('bus_width_bit', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tdp_w">TDP (W)</Label>
          <Input 
            id="tdp_w" 
            type="number"
            placeholder="ex: 450"
            value={formData.tdp_w}
            onChange={(e) => onChange('tdp_w', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="outputs_count">Sorties vidéo</Label>
          <Input 
            id="outputs_count" 
            type="number"
            placeholder="ex: 4"
            value={formData.outputs_count}
            onChange={(e) => onChange('outputs_count', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
