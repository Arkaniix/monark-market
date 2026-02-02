import { useState } from "react";
import { useUserSettings, useUpdateUserSettings, defaultUserSettings } from "@/hooks/useUserSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Palette, Grid, Save, Loader2 } from "lucide-react";
import type { UpdateUserSettingsPayload } from "@/types/userSettings";

export function UserSettingsPanel() {
  const { data: settings, isLoading, error } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { toast } = useToast();
  
  // Local state for form
  const [localSettings, setLocalSettings] = useState<UpdateUserSettingsPayload>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const currentSettings = { ...defaultUserSettings, ...settings, ...localSettings };
  
  const handleChange = <K extends keyof UpdateUserSettingsPayload>(
    key: K, 
    value: UpdateUserSettingsPayload[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      await updateSettings.mutateAsync(localSettings);
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
      setLocalSettings({});
      setHasChanges(false);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>Impossible de charger les paramètres</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Theme & Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Affichage
          </CardTitle>
          <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Thème</Label>
            <Select
              value={currentSettings.theme}
              onValueChange={(v) => handleChange('theme', v as 'light' | 'dark' | 'system')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Système</SelectItem>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="locale">Langue</Label>
            <Select
              value={currentSettings.locale}
              onValueChange={(v) => handleChange('locale', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="items_per_page">Éléments par page</Label>
            <Select
              value={String(currentSettings.items_per_page)}
              onValueChange={(v) => handleChange('items_per_page', parseInt(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Gérez vos préférences de notification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications Email</Label>
              <p className="text-sm text-muted-foreground">
                Recevez les alertes par email
              </p>
            </div>
            <Switch
              checked={currentSettings.notify_email}
              onCheckedChange={(v) => handleChange('notify_email', v)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications Push</Label>
              <p className="text-sm text-muted-foreground">
                Recevez les notifications dans le navigateur
              </p>
            </div>
            <Switch
              checked={currentSettings.notify_push}
              onCheckedChange={(v) => handleChange('notify_push', v)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications Discord</Label>
              <p className="text-sm text-muted-foreground">
                Recevez les alertes via Discord
              </p>
            </div>
            <Switch
              checked={currentSettings.notify_discord}
              onCheckedChange={(v) => handleChange('notify_discord', v)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Alert Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres des alertes
          </CardTitle>
          <CardDescription>Configurez les valeurs par défaut pour vos alertes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Délai entre alertes (heures)</Label>
              <p className="text-sm text-muted-foreground">
                Temps minimum entre deux notifications
              </p>
            </div>
            <Select
              value={String(currentSettings.alert_default_cooldown_hours)}
              onValueChange={(v) => handleChange('alert_default_cooldown_hours', parseInt(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 heure</SelectItem>
                <SelectItem value="6">6 heures</SelectItem>
                <SelectItem value="12">12 heures</SelectItem>
                <SelectItem value="24">24 heures</SelectItem>
                <SelectItem value="48">48 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder les modifications
          </Button>
        </div>
      )}
    </div>
  );
}
