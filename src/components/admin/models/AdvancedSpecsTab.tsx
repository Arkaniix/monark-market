import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelFormData } from "./types";

interface AdvancedSpecsTabProps {
  formData: ModelFormData;
  onChange: (field: keyof ModelFormData, value: string | boolean) => void;
}

export function AdvancedSpecsTab({ formData, onChange }: AdvancedSpecsTabProps) {
  return (
    <div className="grid gap-4">
      <h4 className="font-medium text-sm text-muted-foreground">Fréquences</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="base_clock_mhz">Fréquence de base (MHz)</Label>
          <Input 
            id="base_clock_mhz" 
            type="number"
            placeholder="ex: 2235"
            value={formData.base_clock_mhz}
            onChange={(e) => onChange('base_clock_mhz', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="boost_clock_mhz">Fréquence boost (MHz)</Label>
          <Input 
            id="boost_clock_mhz" 
            type="number"
            placeholder="ex: 2520"
            value={formData.boost_clock_mhz}
            onChange={(e) => onChange('boost_clock_mhz', e.target.value)}
          />
        </div>
      </div>
      
      <h4 className="font-medium text-sm text-muted-foreground mt-2">Performance</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="memory_bandwidth_gbps">Bande passante (Go/s)</Label>
          <Input 
            id="memory_bandwidth_gbps" 
            type="number"
            placeholder="ex: 1008"
            value={formData.memory_bandwidth_gbps}
            onChange={(e) => onChange('memory_bandwidth_gbps', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cuda_cores">CUDA Cores</Label>
          <Input 
            id="cuda_cores" 
            type="number"
            placeholder="ex: 16384"
            value={formData.cuda_cores}
            onChange={(e) => onChange('cuda_cores', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stream_processors">Stream Processors</Label>
          <Input 
            id="stream_processors" 
            type="number"
            placeholder="ex: 6144 (AMD)"
            value={formData.stream_processors}
            onChange={(e) => onChange('stream_processors', e.target.value)}
          />
        </div>
      </div>
      
      <h4 className="font-medium text-sm text-muted-foreground mt-2">Technologies</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="ray_tracing">Ray Tracing</Label>
          <Switch 
            id="ray_tracing"
            checked={formData.ray_tracing}
            onCheckedChange={(checked) => onChange('ray_tracing', checked)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dlss_fsr">DLSS / FSR</Label>
          <Select 
            value={formData.dlss_fsr} 
            onValueChange={(value) => onChange('dlss_fsr', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DLSS 3">DLSS 3</SelectItem>
              <SelectItem value="DLSS 2">DLSS 2</SelectItem>
              <SelectItem value="FSR 3">FSR 3</SelectItem>
              <SelectItem value="FSR 2">FSR 2</SelectItem>
              <SelectItem value="XeSS">XeSS</SelectItem>
              <SelectItem value="none">Aucun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <h4 className="font-medium text-sm text-muted-foreground mt-2">Alimentation & Connectique</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pcie_version">Version PCIe</Label>
          <Select 
            value={formData.pcie_version} 
            onValueChange={(value) => onChange('pcie_version', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PCIe 5.0 x16">PCIe 5.0 x16</SelectItem>
              <SelectItem value="PCIe 4.0 x16">PCIe 4.0 x16</SelectItem>
              <SelectItem value="PCIe 3.0 x16">PCIe 3.0 x16</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="power_connector">Connecteur alim.</Label>
          <Input 
            id="power_connector" 
            placeholder="ex: 1x 16-pin, 3x 8-pin"
            value={formData.power_connector}
            onChange={(e) => onChange('power_connector', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="recommended_psu_w">Alim. recommandée (W)</Label>
          <Input 
            id="recommended_psu_w" 
            type="number"
            placeholder="ex: 850"
            value={formData.recommended_psu_w}
            onChange={(e) => onChange('recommended_psu_w', e.target.value)}
          />
        </div>
      </div>
      
      <h4 className="font-medium text-sm text-muted-foreground mt-2">Dimensions</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="length_mm">Longueur (mm)</Label>
          <Input 
            id="length_mm" 
            type="number"
            placeholder="ex: 336"
            value={formData.length_mm}
            onChange={(e) => onChange('length_mm', e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slots">Slots occupés</Label>
          <Input 
            id="slots" 
            placeholder="ex: 3.5"
            value={formData.slots}
            onChange={(e) => onChange('slots', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
