import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSupport() {
  const mockTickets = [
    {
      id: 1,
      user: 'Jean Dupont',
      subject: 'Problème de scraping',
      priority: 'high',
      status: 'open',
      created: '2024-01-15T10:30:00',
      messages: 3
    },
    {
      id: 2,
      user: 'Marie Martin',
      subject: 'Question sur les crédits',
      priority: 'low',
      status: 'pending',
      created: '2024-01-15T09:15:00',
      messages: 1
    },
    {
      id: 3,
      user: 'Pierre Bernard',
      subject: 'Bug affichage annonces',
      priority: 'medium',
      status: 'resolved',
      created: '2024-01-14T16:45:00',
      messages: 5
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'pending': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const stats = {
    open: mockTickets.filter(t => t.status === 'open').length,
    pending: mockTickets.filter(t => t.status === 'pending').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Support & Tickets</h2>
        <p className="text-muted-foreground">Gestion des demandes utilisateurs</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.open}</div>
                <p className="text-xs text-muted-foreground">Tickets ouverts</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Résolus</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono">#{ticket.id}</TableCell>
                  <TableCell className="font-medium">{ticket.user}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {ticket.messages}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(ticket.created).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Ouvrir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
