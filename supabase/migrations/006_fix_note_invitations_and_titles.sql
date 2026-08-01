-- Migration 006: Add note_title column to team_invitations, update RPC and RLS policies

-- 1. Add note_title column to team_invitations if not exists
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS note_title TEXT;

-- 2. Update stored procedure: invite_and_check_auth_provider to handle p_note_title
CREATE OR REPLACE FUNCTION public.invite_and_check_auth_provider(
    p_email TEXT,
    p_permission TEXT DEFAULT 'edit',
    p_note_id UUID DEFAULT NULL,
    p_team_id UUID DEFAULT NULL,
    p_note_title TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_target_user RECORD;
    v_provider_type TEXT := 'unregistered';
    v_invitation_id UUID;
    v_result JSONB;
BEGIN
    -- Search for existing user in auth.users by email
    SELECT id, raw_app_meta_data, raw_user_meta_data
    INTO v_target_user
    FROM auth.users
    WHERE LOWER(email) = LOWER(p_email)
    LIMIT 1;

    IF v_target_user.id IS NOT NULL THEN
        -- Inspect auth provider from app metadata or user metadata
        IF COALESCE(v_target_user.raw_app_meta_data->>'provider', '') = 'google'
           OR COALESCE(v_target_user.raw_user_meta_data->>'iss', '') LIKE '%google%' THEN
            v_provider_type := 'google';
        ELSE
            v_provider_type := 'email';
        END IF;
    ELSE
        -- Default heuristic for unregistered @gmail.com vs standard domain
        IF LOWER(p_email) LIKE '%@gmail.com' THEN
            v_provider_type := 'google';
        ELSE
            v_provider_type := 'email';
        END IF;
    END IF;

    -- Insert invitation record into public.team_invitations
    INSERT INTO public.team_invitations (
        email,
        note_id,
        note_title,
        team_id,
        invited_by,
        permission,
        status,
        provider_type
    ) VALUES (
        LOWER(p_email),
        p_note_id,
        p_note_title,
        p_team_id,
        auth.uid(),
        p_permission,
        'pending',
        v_provider_type
    )
    RETURNING id INTO v_invitation_id;

    v_result := jsonb_build_object(
        'id', v_invitation_id,
        'email', LOWER(p_email),
        'permission', p_permission,
        'status', 'pending',
        'provider_type', v_provider_type,
        'note_id', p_note_id,
        'note_title', p_note_title,
        'created_at', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.invite_and_check_auth_provider(TEXT, TEXT, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_and_check_auth_provider(TEXT, TEXT, UUID, UUID) TO authenticated;

-- 3. Robust RLS Policies for team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their email or created by them" ON public.team_invitations;
CREATE POLICY "Users can view invitations for their email or created by them"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() 
  OR status = 'pending' 
  OR (email IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Authenticated users can send invitations" ON public.team_invitations;
CREATE POLICY "Authenticated users can send invitations"
ON public.team_invitations FOR INSERT
TO authenticated
WITH CHECK (invited_by = auth.uid());
