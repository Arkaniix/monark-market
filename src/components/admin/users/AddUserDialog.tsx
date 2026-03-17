import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { adminApiFetch } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { toast } from "sonner";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function AddUserDialog({ open, onOpenChange, onUserCreated }: AddUserDialogProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setDisplayName("");
    setPassword("");
    setPlan("free");
  };

  const handleCreate = async () => {
    if (!email || !password) {
      toast.error("Email et mot de passe sont requis");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      await adminApiFetch(ADMIN.CREATE_USER, {
        method: "POST",
        body: JSON.stringify({
          email,
          display_name: displayName || undefined,
          password,
          current_plan: plan,
        }),
      });
      toast.success("Utilisateur créé");
      resetForm();
      onOpenChange(false);
      onUserCreated();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <Label>Nom d'affichage</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jean Dupont" />
          </div>
          <div>
            <Label>Mot de passe * (min. 8 caractères)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <Label>Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free (10 crédits/mois)</SelectItem>
                <SelectItem value="standard">Standard (180 crédits/mois)</SelectItem>
                <SelectItem value="pro">Pro (600 crédits/mois)</SelectItem>
                <SelectItem value="admin">Admin (crédits illimités)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleCreate} disabled={loading || !email || !password}>
            {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Création...</> : "Créer l'utilisateur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
