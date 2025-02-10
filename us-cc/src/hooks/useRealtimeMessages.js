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

            console.log('Fetching messages with filter:', filter?.or);
            const { data, error: fetchError } = await query;
            console.log('Fetched messages:', data);

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
                    event: 'INSERT',
                    schema: 'public',
                    table: table
                },
                async (payload) => {
                    console.log('Received INSERT:', payload);
                    await fetchMessages();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: table
                },
                async (payload) => {
                    console.log('Received UPDATE:', payload);
                    await fetchMessages();
                }
            )
            .subscribe(async (status) => {
                console.log(`Channel status for ${channelName}:`, status);
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to message changes');
                    await fetchMessages();
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