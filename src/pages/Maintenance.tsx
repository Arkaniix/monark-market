import { Construction, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Construction className="h-24 w-24 text-primary animate-pulse" />
                <Clock className="h-8 w-8 text-primary absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Maintenance en cours</h1>
              <p className="text-muted-foreground text-lg">
                Le site est actuellement en maintenance. Nous serons de retour bientôt.
              </p>
            </div>

            <div className="pt-4 border-t space-y-4">
              <p className="text-sm text-muted-foreground">
                Merci de votre patience et de votre compréhension.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Connexion administrateur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}