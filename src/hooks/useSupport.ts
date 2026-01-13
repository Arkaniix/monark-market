import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SupportTicket {
  id: number;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  user_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

export interface SupportTicketWithMessages extends SupportTicket {
  messages: SupportMessage[];
}

// Fetch all tickets (admin view)
export function useAdminSupportTickets() {
  return useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

// Fetch single ticket with messages
export function useSupportTicketDetail(ticketId: number | null) {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;

      const [ticketResult, messagesResult] = await Promise.all([
        supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single(),
        supabase
          .from('support_messages')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })
      ]);

      if (ticketResult.error) throw ticketResult.error;
      if (messagesResult.error) throw messagesResult.error;

      return {
        ...ticketResult.data,
        messages: messagesResult.data
      } as SupportTicketWithMessages;
    },
    enabled: !!ticketId,
    staleTime: 10000,
  });
}

// Update ticket status
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status, adminNotes }: { 
      ticketId: number; 
      status: 'open' | 'pending' | 'resolved' | 'closed';
      adminNotes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      toast.success('Ticket mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
}

// Add message to ticket
export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, message, isAdmin }: { 
      ticketId: number; 
      message: string;
      isAdmin: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin: isAdmin,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      toast.success('Message envoyé');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });
}

// Update ticket priority
export function useUpdateTicketPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, priority }: { 
      ticketId: number; 
      priority: 'low' | 'medium' | 'high';
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket'] });
      toast.success('Priorité mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });
}
