import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Award, Users, TrendingUp, Target, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard, useCommunityStats } from "@/hooks/useCommunity";
import { LeaderboardSkeleton, CommunityStatsSkeleton } from "@/components/community/CommunitySkeleton";

export default function CommunityLeaderboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'30d' | 'all'>('30d');
  
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useLeaderboard(period);
  const { data: statsData, isLoading: loadingStats } = useCommunityStats();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50";
      case 3: return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50";
      default: return "";
    }
  };

  const getBadgeVariant = (badge: string | null) => {
    switch (badge) {
      case "Top Contributeur": return "default";
      case "Élite": return "secondary";
      default: return "outline";
    }
  };

  const top3 = leaderboardData?.entries.slice(0, 3) ?? [];
  const rest = leaderboardData?.entries.slice(3) ?? [];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/community")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la Communauté
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Classement</h1>
              <p className="text-muted-foreground">
                Les meilleurs contributeurs de la communauté
              </p>
            </div>
          </div>
        </motion.div>

        {/* Community Stats */}
        {loadingStats ? (
          <div className="mb-8">
            <CommunityStatsSkeleton />
          </div>
        ) : statsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contributeurs</p>
                  <p className="text-xl font-bold">{statsData.total_contributors}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missions (30j)</p>
                  <p className="text-xl font-bold">{statsData.total_missions_30d}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pages (30j)</p>
                  <p className="text-xl font-bold">{statsData.total_pages_30d}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crédits (30j)</p>
                  <p className="text-xl font-bold">{statsData.total_credits_30d}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Your Rank */}
        {statsData && statsData.your_rank > 0 && (
          <Card className="mb-8 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">#{statsData.your_rank}</span>
                  </div>
                  <div>
                    <p className="font-semibold">Ta position</p>
                    <p className="text-sm text-muted-foreground">
                      Top {statsData.your_percentile}% des contributeurs
                    </p>
                  </div>
                </div>
                <Progress value={100 - statsData.your_percentile} className="w-32" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Period Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tableau des scores</CardTitle>
            <CardDescription>Classement basé sur les crédits gagnés</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as '30d' | 'all')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="30d">30 derniers jours</TabsTrigger>
                <TabsTrigger value="all">Depuis toujours</TabsTrigger>
              </TabsList>

              <TabsContent value={period}>
                {loadingLeaderboard ? (
                  <LeaderboardSkeleton />
                ) : leaderboardData?.entries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune donnée disponible.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Top 3 Podium */}
                    {top3.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {top3.map((entry) => (
                          <motion.div
                            key={entry.rank}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: entry.rank * 0.1 }}
                          >
                            <Card className={`p-4 border-2 ${getRankBg(entry.rank)}`}>
                              <div className="flex flex-col items-center text-center">
                                <div className="mb-2">
                                  {getRankIcon(entry.rank)}
                                </div>
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                                  <span className="text-2xl font-bold">#{entry.rank}</span>
                                </div>
                                <p className="font-bold text-lg mb-1">{entry.user_display}</p>
                                {entry.badge && (
                                  <Badge variant={getBadgeVariant(entry.badge)} className="mb-3">
                                    {entry.badge}
                                  </Badge>
                                )}
                                <div className="grid grid-cols-2 gap-4 w-full text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Crédits</p>
                                    <p className="font-bold text-green-600">{entry.credits}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Missions</p>
                                    <p className="font-bold">{entry.missions}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Pages</p>
                                    <p className="font-bold">{entry.pages}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Qualité</p>
                                    <p className="font-bold">{((entry.quality_score || entry.quality) * 100).toFixed(0)}%</p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Rest of leaderboard */}
                    {rest.length > 0 && (
                      <div className="space-y-2">
                        {rest.map((entry) => (
                          <div
                            key={entry.rank}
                            className="p-4 border rounded-lg hover:border-primary transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-muted-foreground w-8">
                                  #{entry.rank}
                                </span>
                                <div>
                                  <p className="font-semibold">{entry.user_display}</p>
                                  {entry.badge && (
                                    <Badge variant={getBadgeVariant(entry.badge)} className="text-xs mt-1">
                                      {entry.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <p className="text-muted-foreground">Crédits</p>
                                  <p className="font-bold text-green-600">{entry.credits}</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <p className="text-muted-foreground">Missions</p>
                                  <p className="font-bold">{entry.missions}</p>
                                </div>
                                <div className="text-center hidden md:block">
                                  <p className="text-muted-foreground">Pages</p>
                                  <p className="font-bold">{entry.pages}</p>
                                </div>
                                <div className="text-center hidden md:block">
                                  <p className="text-muted-foreground">Qualité</p>
                                  <p className="font-bold">{((entry.quality_score || entry.quality) * 100).toFixed(0)}%</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
