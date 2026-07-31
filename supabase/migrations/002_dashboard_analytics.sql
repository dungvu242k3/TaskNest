-- Migration 002: Dashboard Analytics & KPI Summary (DashboardPage.tsx)
-- Compatible with PostgreSQL 15+ & Supabase

-- Function to Aggregate User Dashboard Metrics for FE DashboardPage.tsx
CREATE OR REPLACE FUNCTION public.get_user_dashboard_metrics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_notes INT;
    v_private_notes INT;
    v_shared_notes INT;
    v_high_priority INT;
    v_completed_tasks INT;
    v_total_tasks INT;
    v_task_percent INT;
    v_result JSONB;
BEGIN
    -- 1. Count Notes Categories
    SELECT COUNT(*) INTO v_total_notes
    FROM public.notes
    WHERE owner_id = p_user_id;

    SELECT COUNT(*) INTO v_private_notes
    FROM public.notes
    WHERE owner_id = p_user_id AND is_private = true;

    SELECT COUNT(*) INTO v_shared_notes
    FROM public.notes
    WHERE owner_id = p_user_id AND is_private = false;

    SELECT COUNT(*) INTO v_high_priority
    FROM public.notes
    WHERE owner_id = p_user_id AND priority = 'P1';

    -- 2. Aggregate Checklist Tasks Completion Rate
    SELECT 
        COALESCE(SUM((SELECT COUNT(*) FROM jsonb_array_elements(checklist) elem WHERE (elem->>'completed')::boolean = true)), 0),
        COALESCE(SUM(jsonb_array_length(checklist)), 0)
    INTO v_completed_tasks, v_total_tasks
    FROM public.notes
    WHERE owner_id = p_user_id;

    IF v_total_tasks > 0 THEN
        v_task_percent := ROUND((v_completed_tasks::NUMERIC / v_total_tasks::NUMERIC) * 100);
    ELSE
        v_task_percent := 0;
    END IF;

    -- 3. Construct Final JSON Metric Object matching FE Props
    v_result := jsonb_build_object(
        'total_notes', v_total_notes,
        'private_notes_count', v_private_notes,
        'shared_notes_count', v_shared_notes,
        'high_priority_count', v_high_priority,
        'completed_tasks_count', v_completed_tasks,
        'total_tasks_count', v_total_tasks,
        'overall_task_percent', v_task_percent
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant Execution to Authenticated Users
GRANT EXECUTE ON FUNCTION public.get_user_dashboard_metrics(UUID) TO authenticated;
