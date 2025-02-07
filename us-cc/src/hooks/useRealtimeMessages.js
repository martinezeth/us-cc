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

            // Apply filter if provided
            if (filter) {
                Object.entries(filter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
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

        // Create unique channel name based on filter
        const channelName = `${table}_${Object.values(filter || {}).join('_')}`;
        
        // Set up realtime subscription
        const channel = supabase.channel(channelName, {
            config: {
                broadcast: { self: true },
                presence: { key: 'user_id' },
            },
        });

        // Handle broadcast messages if enabled
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
                    ...filter && { filter: Object.entries(filter)
                        .map(([key, value]) => `${key}=eq.${value}`)
                        .join(',') }
                },
                async (payload) => {
                    console.log('Received postgres change:', payload);
                    await fetchMessages(); // Refresh all messages
                }
            )
            .subscribe(async (status) => {
                console.log(`Channel status for ${channelName}:`, status);
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