import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, MapPin, Users, Activity, Award, Medal, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const topContributors = [
  { rank: 1, pseudo: "TechHunter42", scans: 847, credits: 12450, badge: "Légende", avatar: "TH", region: "Île-de-France" },
  { rank: 2, pseudo: "DealMaster", scans: 723, credits: 10890, badge: "Expert", avatar: "DM", region: "Auvergne-Rhône-Alpes" },
  { rank: 3, pseudo: "GPU_Finder", scans: 651, credits: 9765, badge: "Expert", avatar: "GF", region: "Occitanie" },
  { rank: 4, pseudo: "BargainKing", scans: 589, credits: 8835, badge: "Pro", avatar: "BK", region: "Nouvelle-Aquitaine" },
  { rank: 5, pseudo: "HardwareScout", scans: 534, credits: 8010, badge: "Pro", avatar: "HS", region: "Hauts-de-France" },
  { rank: 6, pseudo: "PriceWatcher", scans: 478, credits: 7170, badge: "Pro", avatar: "PW", region: "Grand Est" },
  { rank: 7, pseudo: "ComponentPro", scans: 423, credits: 6345, badge: "Confirmé", avatar: "CP", region: "Provence-Alpes-Côte d'Azur" },
  { rank: 8, pseudo: "DealSeeker88", scans: 391, credits: 5865, badge: "Confirmé", avatar: "DS", region: "Bretagne" },
  { rank: 9, pseudo: "SmartBuyer", scans: 356, credits: 5340, badge: "Confirmé", avatar: "SB", region: "Pays de la Loire" },
  { rank: 10, pseudo: "TechSavvy", scans: 312, credits: 4680, badge: "Actif", avatar: "TS", region: "Normandie" },
];

const recentActivity = [
  { user: "TechHunter42", action: "a scanné une RTX 4080", time: "Il y a 2 min", credits: 15 },
  { user: "DealMaster", action: "a trouvé un deal RTX 4070", time: "Il y a 8 min", credits: 25 },
  { user: "GPU_Finder", action: "a scanné un Ryzen 7800X3D", time: "Il y a 15 min", credits: 15 },
  { user: "BargainKing", action: "a ajouté une annonce à sa watchlist", time: "Il y a 23 min", credits: 5 },
  { user: "HardwareScout", action: "a scanné une RTX 4060 Ti", time: "Il y a 31 min", credits: 15 },
  { user: "PriceWatcher", action: "a trouvé un deal i7-14700K", time: "Il y a 45 min", credits: 25 },
];

const regionStats = [
  { region: "Île-de-France", scans: 2847, users: 1243, deals: 456, color: "hsl(var(--primary))" },
  { region: "Auvergne-Rhône-Alpes", scans: 1923, users: 892, deals: 312, color: "hsl(var(--chart-2))" },
  { region: "Occitanie", scans: 1456, users: 673, deals: 234, color: "hsl(var(--chart-3))" },
  { region: "Nouvelle-Aquitaine", scans: 1234, users: 567, deals: 198, color: "hsl(var(--chart-4))" },
  { region: "Provence-Alpes-Côte d'Azur", scans: 1189, users: 534, deals: 187, color: "hsl(var(--chart-5))" },
  { region: "Hauts-de-France", scans: 1098, users: 498, deals: 165, color: "hsl(var(--chart-1))" },
  { region: "Grand Est", scans: 987, users: 445, deals: 143, color: "hsl(var(--chart-2))" },
  { region: "Bretagne", scans: 876, users: 389, deals: 128, color: "hsl(var(--chart-3))" },
  { region: "Pays de la Loire", scans: 798, users: 356, deals: 115, color: "hsl(var(--chart-4))" },
  { region: "Normandie", scans: 654, users: 298, deals: 94, color: "hsl(var(--chart-5))" },
];

const globalStats = [
  { label: "Total Scans", value: "13,062", icon: Activity, trend: "+12.5%", color: "text-primary" },
  { label: "Annonces Actives", value: "8,934", icon: TrendingUp, trend: "+8.3%", color: "text-chart-2" },
  { label: "Membres Actifs", value: "5,895", icon: Users, trend: "+15.7%", color: "text-chart-3" },
  { label: "Deals Trouvés", value: "2,032", icon: Award, trend: "+23.4%", color: "text-chart-4" },
];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Légende": return "default";
    case "Expert": return "secondary";
    case "Pro": return "outline";
    default: return "outline";
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2: return <Medal className="h-6 w-6 text-gray-400" />;
    case 3: return <Medal className="h-6 w-6 text-amber-700" />;
    default: return <Star className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function Community() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Communauté HardwareDeals</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de chasseurs de deals actifs en France
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalStats.map((stat, index) => (
            <Card key={index} className="hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top 10 Contributeurs
              </CardTitle>
              <CardDescription>
                Les chasseurs de deals les plus actifs ce mois-ci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContributors.map((contributor) => (
                  <div
                    key={contributor.rank}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(contributor.rank)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {contributor.avatar}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{contributor.pseudo}</p>
                        <Badge variant={getBadgeVariant(contributor.badge)} className="text-xs">
                          {contributor.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {contributor.region}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-primary">{contributor.scans}</p>
                      <p className="text-xs text-muted-foreground">scans</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-chart-3">{contributor.credits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">crédits</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-chart-2" />
                Activité Récente
              </CardTitle>
              <CardDescription>
                Dernières actions de la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <Badge variant="outline" className="text-xs">
                          +{activity.credits} crédits
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-chart-4" />
              Statistiques par Région
            </CardTitle>
            <CardDescription>
              Activité de la communauté à travers la France
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {regionStats.map((region, index) => (
                <div key={index} className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{region.region}</h3>
                    <Badge variant="secondary">{region.users} membres</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scans</span>
                      <span className="font-medium">{region.scans.toLocaleString()}</span>
                    </div>
                    <Progress value={(region.scans / 2847) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-2 rounded-md bg-muted/50">
                      <p className="text-lg font-bold text-primary">{region.deals}</p>
                      <p className="text-xs text-muted-foreground">Deals trouvés</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-muted/50">
                      <p className="text-lg font-bold text-chart-3">{Math.round(region.scans / region.users)}</p>
                      <p className="text-xs text-muted-foreground">Scans/membre</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
