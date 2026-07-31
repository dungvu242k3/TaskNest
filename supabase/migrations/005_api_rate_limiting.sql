-- Migration 005: API Rate Limiting & Abuse Prevention Schema
-- Compatible with PostgreSQL 15+ & Supabase

-- Rate Limit Bucket Table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'create_note' | 'invite_member' | 'update_settings'
    request_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Fast Rate Limit Checking
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.api_rate_limits(user_id, action_type, window_start);

-- Stored Procedure: Sliding Window Rate Limit Enforcer
CREATE OR REPLACE FUNCTION public.check_user_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_allowed INT DEFAULT 30, -- Max requests per window
    p_window_seconds INT DEFAULT 60 -- Window duration in seconds
) RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INT;
BEGIN
    v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

    -- Clean up old rate limit records
    DELETE FROM public.api_rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';

    -- Count requests in current sliding window
    SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
    FROM public.api_rate_limits
    WHERE user_id = p_user_id 
      AND action_type = p_action 
      AND window_start >= v_window_start;

    IF v_current_count >= p_max_allowed THEN
        RETURN FALSE; -- Rate limit exceeded
    END IF;

    -- Record current request
    INSERT INTO public.api_rate_limits (user_id, action_type, request_count, window_start)
    VALUES (p_user_id, p_action, 1, NOW());

    RETURN TRUE; -- Allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant Execution to Authenticated Users
GRANT EXECUTE ON FUNCTION public.check_user_rate_limit(UUID, TEXT, INT, INT) TO authenticated;

-- RLS Policy for Rate Limits Table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.api_rate_limits;
CREATE POLICY "Users can view their own rate limits"
ON public.api_rate_limits FOR SELECT TO authenticated
USING (user_id = auth.uid());
