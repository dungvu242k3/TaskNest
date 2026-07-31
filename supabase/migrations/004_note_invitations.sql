-- Migration 004: Note-level Invitations & RLS Policies

-- 1. Ensure team_invitations table exists
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    email TEXT,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL DEFAULT 'edit',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if team_invitations table already existed
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS permission TEXT DEFAULT 'edit',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their email or created by them" ON public.team_invitations;
CREATE POLICY "Users can view invitations for their email or created by them"
ON public.team_invitations FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() OR status = 'pending' OR (email IS NOT NULL AND email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Authenticated users can send invitations" ON public.team_invitations;
CREATE POLICY "Authenticated users can send invitations"
ON public.team_invitations FOR INSERT
TO authenticated
WITH CHECK (invited_by = auth.uid());

DROP POLICY IF EXISTS "Invited users or creators can update invitation status" ON public.team_invitations;
CREATE POLICY "Invited users or creators can update invitation status"
ON public.team_invitations FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Creators can delete invitations" ON public.team_invitations;
CREATE POLICY "Creators can delete invitations"
ON public.team_invitations FOR DELETE
TO authenticated
USING (invited_by = auth.uid());

-- 3. Column to store provider_type on team_invitations
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'email';

-- 4. Stored Procedure: Invite Member & Check Auth Provider (Google OAuth vs Email/Password vs Unregistered)
CREATE OR REPLACE FUNCTION public.invite_and_check_auth_provider(
    p_email TEXT,
    p_permission TEXT DEFAULT 'edit',
    p_note_id UUID DEFAULT NULL,
    p_team_id UUID DEFAULT NULL
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
        team_id,
        invited_by,
        permission,
        status,
        provider_type
    ) VALUES (
        LOWER(p_email),
        p_note_id,
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
        'created_at', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.invite_and_check_auth_provider(TEXT, TEXT, UUID, UUID) TO authenticated;
