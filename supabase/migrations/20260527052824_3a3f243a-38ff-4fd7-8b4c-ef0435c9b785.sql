
REVOKE EXECUTE ON FUNCTION public.user_video_jobs_today(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_video_jobs_today(UUID) TO authenticated, service_role;
