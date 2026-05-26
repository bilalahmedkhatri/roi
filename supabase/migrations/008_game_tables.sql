-- Game Rounds Table
CREATE TABLE IF NOT EXISTS public.game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_seed VARCHAR(64) NOT NULL,
  seed_hash VARCHAR(64) NOT NULL,
  client_seed VARCHAR(64) NOT NULL,
  nonce INT NOT NULL,
  crash_multiplier NUMERIC(8,2) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game rounds"
  ON public.game_rounds FOR SELECT
  USING (true);

-- Game Bets Table
CREATE TABLE IF NOT EXISTS public.game_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(auth_id),
  round_id UUID NOT NULL REFERENCES public.game_rounds(id),
  wager_amount NUMERIC(15,4) NOT NULL,
  balance_type VARCHAR(10) NOT NULL CHECK (balance_type IN ('real', 'bonus')),
  auto_cashout_at NUMERIC(8,2),
  cashout_multiplier NUMERIC(8,2),
  payout_amount NUMERIC(15,4) DEFAULT 0.0000,
  status VARCHAR(15) NOT NULL CHECK (status IN ('placed', 'cashed', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.game_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bets"
  ON public.game_bets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bets"
  ON public.game_bets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bets"
  ON public.game_bets FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX idx_game_bets_user_id ON public.game_bets(user_id);
CREATE INDEX idx_game_bets_round_id ON public.game_bets(round_id);
CREATE INDEX idx_game_rounds_created_at ON public.game_rounds(created_at DESC);
