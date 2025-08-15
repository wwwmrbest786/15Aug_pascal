-- Pascal Betting App Database Schema
-- Create all necessary tables for the group betting platform

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  credits INTEGER DEFAULT 1000,
  jurisdiction_attested BOOLEAN DEFAULT FALSE,
  jurisdiction TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  originator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  originator_stake INTEGER NOT NULL,
  min_counter_stake INTEGER NOT NULL,
  bid_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  resolution_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  state TEXT DEFAULT 'open' CHECK (state IN ('open', 'matched', 'active', 'resolved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'leading', 'outbid', 'matched')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bet_id, bidder_id)
);

-- Matches table (when a bet is accepted)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE,
  originator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  counterparty_id UUID REFERENCES users(id) ON DELETE CASCADE,
  originator_amount INTEGER NOT NULL,
  counterparty_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outcome submissions
CREATE TABLE IF NOT EXISTS outcome_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  value BOOLEAN NOT NULL, -- TRUE if originator wins, FALSE if counterparty wins
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Positive for credits received, negative for credits spent
  type TEXT NOT NULL CHECK (type IN ('escrow_hold', 'escrow_release', 'payout', 'refund', 'adjustment')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_bets_group_id ON bets(group_id);
CREATE INDEX IF NOT EXISTS idx_bets_originator_id ON bets(originator_id);
CREATE INDEX IF NOT EXISTS idx_bets_state ON bets(state);
CREATE INDEX IF NOT EXISTS idx_bids_bet_id ON bids(bet_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for groups table
CREATE POLICY "Users can view groups they're members of" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = groups.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = groups.id 
      AND user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- RLS Policies for group_memberships table
CREATE POLICY "Users can view memberships in their groups" ON group_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_memberships gm2 
      WHERE gm2.group_id = group_memberships.group_id 
      AND gm2.user_id = auth.uid() 
      AND gm2.status = 'active'
    )
  );

CREATE POLICY "Users can join groups" ON group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bets table
CREATE POLICY "Users can view bets in their groups" ON bets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = bets.group_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Group members can create bets" ON bets
  FOR INSERT WITH CHECK (
    auth.uid() = originator_id AND
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = bets.group_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- RLS Policies for bids table
CREATE POLICY "Users can view bids on accessible bets" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bets b
      JOIN group_memberships gm ON b.group_id = gm.group_id
      WHERE b.id = bids.bet_id 
      AND gm.user_id = auth.uid() 
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Users can create bids" ON bids
  FOR INSERT WITH CHECK (
    auth.uid() = bidder_id AND
    EXISTS (
      SELECT 1 FROM bets b
      JOIN group_memberships gm ON b.group_id = gm.group_id
      WHERE b.id = bids.bet_id 
      AND gm.user_id = auth.uid() 
      AND gm.status = 'active'
      AND b.originator_id != auth.uid() -- Can't bid on own bet
    )
  );

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true); -- Allow system to create transactions

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
