import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Send, User, Shield } from "lucide-react";
import { 
  useSupportTicketDetail, 
  useUpdateTicketStatus, 
  useAddTicketMessage,
  useUpdateTicketPriority 
} from "@/hooks/useSupport";

interface TicketDetailModalProps {
  ticketId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TicketDetailModal({ ticketId, open, onOpenChange }: TicketDetailModalProps) {
  const { data: ticket, isLoading } = useSupportTicketDetail(ticketId);
  const updateStatus = useUpdateTicketStatus();
  const updatePriority = useUpdateTicketPriority();
  const addMessage = useAddTicketMessage();
  
  const [newMessage, setNewMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

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
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    
    await addMessage.mutateAsync({
      ticketId,
      message: newMessage,
      isAdmin: true,
    });
    setNewMessage("");
  };

  const handleStatusChange = async (status: 'open' | 'pending' | 'resolved' | 'closed') => {
    if (!ticketId) return;
    await updateStatus.mutateAsync({ ticketId, status, adminNotes: adminNotes || undefined });
  };

  const handlePriorityChange = async (priority: 'low' | 'medium' | 'high') => {
    if (!ticketId) return;
    await updatePriority.mutateAsync({ ticketId, priority });
  };

  if (!ticketId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket #{ticketId}
            {ticket && (
              <>
                <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : ticket ? (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID Utilisateur:</span>{" "}
                <span className="font-medium font-mono text-xs">{ticket.user_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Créé le:</span>{" "}
                <span className="font-medium">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Sujet</h4>
              <p className="text-sm bg-muted p-2 rounded">{ticket.subject}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Message initial</h4>
              <p className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">{ticket.message}</p>
            </div>

            <Separator />

            {/* Conversation */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="font-semibold mb-2">Conversation ({ticket.messages?.length || 0})</h4>
              <ScrollArea className="flex-1 max-h-[200px] border rounded p-2">
                {ticket.messages?.length > 0 ? (
                  <div className="space-y-3">
                    {ticket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.is_admin ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`p-2 rounded-lg max-w-[80%] ${
                          msg.is_admin 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                            {msg.is_admin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            {msg.is_admin ? 'Admin' : 'Utilisateur'}
                            <span className="ml-2">
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun message dans la conversation
                  </p>
                )}
              </ScrollArea>

              {/* Reply */}
              <div className="flex gap-2 mt-2">
                <Textarea
                  placeholder="Répondre au ticket..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-[60px]"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || addMessage.isPending}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Admin Actions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={ticket.status} 
                  onValueChange={(v) => handleStatusChange(v as 'open' | 'pending' | 'resolved' | 'closed')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select 
                  value={ticket.priority} 
                  onValueChange={(v) => handlePriorityChange(v as 'low' | 'medium' | 'high')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label>Notes admin (internes)</Label>
              <Textarea
                placeholder="Notes internes pour les admins..."
                value={adminNotes || ticket.admin_notes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Ticket non trouvé</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
