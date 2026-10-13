DROP POLICY IF EXISTS "Edge functions update subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Edge functions insert subscriptions" ON public.subscribers;

CREATE POLICY "Self or admin update subscription" ON public.subscribers
  FOR UPDATE USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Self or admin insert subscription" ON public.subscribers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );