
-- Storage policies for student-files bucket
CREATE POLICY "Staff can view student files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'student-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can upload student files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update student files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'student-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete student files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'student-files' AND public.is_staff(auth.uid()));
