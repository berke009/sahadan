-- ============ Users Table ============
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_tl DECIMAL(12,2) NOT NULL DEFAULT 1000.00,
  total_bets INTEGER NOT NULL DEFAULT 0,
  total_won INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Chat Sessions ============
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============ Messages ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL DEFAULT '',
  widget_type TEXT,
  widget_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages" ON public.messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_session ON public.messages(session_id, created_at);

-- ============ Coupons ============
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stake DECIMAL(12,2) NOT NULL,
  total_odds DECIMAL(10,2) NOT NULL,
  potential_return DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  selections JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own coupons" ON public.coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons" ON public.coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ Balance History ============
CREATE TABLE public.balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bet', 'win', 'deposit')),
  coupon_id UUID REFERENCES public.coupons(id),
  balance_after DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history" ON public.balance_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_balance_history_user ON public.balance_history(user_id, created_at);

-- ============ Community Predictions ============
CREATE TABLE public.community_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prediction TEXT NOT NULL CHECK (prediction IN ('1', 'X', '2')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.community_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all predictions" ON public.community_predictions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own predictions" ON public.community_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ Place Bet Function ============
CREATE OR REPLACE FUNCTION public.place_bet(
  p_selections JSONB,
  p_stake DECIMAL,
  p_total_odds DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_balance DECIMAL;
  v_potential_return DECIMAL;
  v_coupon_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT balance_tl INTO v_balance FROM public.users WHERE id = v_user_id FOR UPDATE;

  IF v_balance < p_stake THEN
    RAISE EXCEPTION 'Yetersiz bakiye. Mevcut: % TL', v_balance;
  END IF;

  v_potential_return := ROUND(p_stake * p_total_odds, 2);

  INSERT INTO public.coupons (user_id, stake, total_odds, potential_return, selections)
  VALUES (v_user_id, p_stake, p_total_odds, v_potential_return, p_selections)
  RETURNING id INTO v_coupon_id;

  UPDATE public.users
  SET balance_tl = balance_tl - p_stake,
      total_bets = total_bets + 1
  WHERE id = v_user_id;

  INSERT INTO public.balance_history (user_id, amount, type, coupon_id, balance_after)
  VALUES (v_user_id, -p_stake, 'bet', v_coupon_id, v_balance - p_stake);

  RETURN v_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
