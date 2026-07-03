CREATE POLICY "Staff read exercise media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'exercise-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff upload exercise media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exercise-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update exercise media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'exercise-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete exercise media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'exercise-media' AND public.is_staff(auth.uid()));