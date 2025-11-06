import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Activity, Database, Server } from "lucide-react";

export default function AdminHealth() {
  const services = [
    { name: 'Database', status: 'operational', latency: '12ms', icon: Database },
    { name: 'API Backend', status: 'operational', latency: '45ms', icon: Server },
    { name: 'Frontend', status: 'operational', latency: '8ms', icon: Activity },
    { name: 'Auth Service', status: 'operational', latency: '23ms', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Santé système & Observabilité</h2>
        <p className="text-muted-foreground">Monitoring et état des services</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={service.status === 'operational' ? 'default' : 'destructive'}>
                    {service.status === 'operational' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Opérationnel
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Dégradé
                      </>
                    )}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {service.latency}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métriques système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Connexions DB actives</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Requêtes API / min</p>
              <p className="text-2xl font-bold">847</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-2xl font-bold">99.98%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
