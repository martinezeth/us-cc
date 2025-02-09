import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useRealtimeMessages = ({
    table,
    filter,
    select,
    orderBy = { column: 'sent_at', ascending: true },
    broadcastEnabled = true,
    enabled = true
}) => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        if (!enabled) return;

        try {
            let query = supabase
                .from(table)
                .select(select)
                .order(orderBy.column, { ascending: orderBy.ascending });

            // Apply any filters
            if (filter) {
                const filterStr = typeof filter === 'string' ? filter : filter.or;
                if (filterStr) {
                    query = query.or(filterStr);
                }
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setMessages(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        fetchMessages();

        // Create a unique channel name based on the filter
        const channelName = `messages_${JSON.stringify(filter)}`;

        // Set up realtime subscription
        const channel = supabase.channel(channelName, {
            config: {
                broadcast: { self: true },
                presence: { key: 'user_id' },
            },
        });

        // Handle broadcast messages
        if (broadcastEnabled) {
            channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
                console.log('Received broadcast message:', payload);
                setMessages(prev => [...prev, payload.message]);
            });
        }

        // Handle postgres changes
        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: filter?.or || undefined
                },
                async (payload) => {
                    console.log('Received postgres change:', payload);
                    // Refresh messages to ensure consistency
                    await fetchMessages();
                }
            )
            .subscribe(async (status) => {
                console.log(`Channel status for ${channelName}:`, status);
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to message changes');
                }
            });

        return () => {
            console.log(`Unsubscribing from channel ${channelName}`);
            supabase.removeChannel(channel);
        };
    }, [table, JSON.stringify(filter), select, enabled]);

    return {
        messages,
        error,
        loading,
        refreshMessages: fetchMessages
    };
};