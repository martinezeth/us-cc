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

            // Deduplicate messages based on ID
            const uniqueMessages = Array.from(
                new Map(data.map(item => [item.id, item])).values()
            );
            
            setMessages(uniqueMessages);
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
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: filter
            }, (payload) => {
                // Handle real-time updates
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => {
                        // Check if message already exists
                        if (prev.some(msg => msg.id === payload.new.id)) {
                            return prev;
                        }
                        return [...prev, payload.new];
                    });
                }
                // ... handle other event types
            });

        channel.subscribe();

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