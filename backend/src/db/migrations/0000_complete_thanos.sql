CREATE TYPE "public"."game_categories" AS ENUM('slots', 'fish', 'table', 'live', 'poker', 'lottery', 'virtual', 'other');--> statement-breakpoint
CREATE TYPE "public"."GameProviderName" AS ENUM('pragmaticplay', 'evoplay', 'netent', 'playngo', 'relaxgaming', 'hacksaw', 'bgaming', 'spribe', 'internal', 'redtiger', 'netgame', 'bigfishgames', 'cqnine', 'nolimit', 'kickass');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethod" AS ENUM('INSTORE_CASH', 'INSTORE_CARD', 'CASH_APP');--> statement-breakpoint
CREATE TYPE "public"."Permission" AS ENUM('read', 'write', 'upload', 'manage_users', 'manage_settings', 'launch_game');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'ADMIN', 'VIP', 'MODERATOR', 'SYSTEM', 'OWNER', 'MEMBER', 'OPERATOR', 'SUPPORT_AGENT');--> statement-breakpoint
CREATE TYPE "public"."SessionStatus" AS ENUM('ACTIVE', 'COMPLETED', 'ABANDONED', 'TIMEOUT');--> statement-breakpoint
CREATE TYPE "public"."TournamentStatus" AS ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."TransactionStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'REJECTED', 'REQUIRES_ACTION', 'ON_HOLD');--> statement-breakpoint
CREATE TYPE "public"."TypeOfJackpot" AS ENUM('MINOR', 'MAJOR', 'GRAND');--> statement-breakpoint
CREATE TYPE "public"."TypeOfTransaction" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'SYSTEM_ADJUSTMENT_CREDIT', 'SYSTEM_ADJUSTMENT_DEBIT', 'TOURNAMENT_BUYIN', 'TOURNAMENT_PRIZE', 'AFFILIATE_COMMISSION', 'REFUND', 'FEE', 'BONUS_AWARD', 'BET_PLACE', 'BET_WIN', 'BET_LOSE', 'BET_REFUND', 'BONUS_WAGER', 'BONUS_CONVERT', 'BONUS_EXPIRED', 'XP_AWARD', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'INTERNAL_TRANSFER', 'PRODUCT_PURCHASE', 'REBATE_PAYOUT', 'JACKPOT_WIN', 'JACKPOT_CONTRIBUTION');--> statement-breakpoint
CREATE TYPE "public"."UpdateType" AS ENUM('BINARY', 'OTA');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN', 'MODERATOR', 'SUPPORT', 'BOT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('ACTIVE', 'COMPLETED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "session_status" DEFAULT 'ACTIVE' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"device_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_games" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"goldsvet_data" jsonb,
	"description" text,
	"category" text NOT NULL,
	"tags" text[] NOT NULL,
	"thumbnail_url" text,
	"banner_url" text,
	"provider_name" text NOT NULL,
	"provider_id" text,
	"total_wagered" integer NOT NULL,
	"total_won" integer NOT NULL,
	"target_rtp" integer,
	"is_featured" boolean NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"operator_id" text,
	"tournament_directives" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_history" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"auth_session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"game_id" text,
	"status" "session_status" DEFAULT 'ACTIVE' NOT NULL,
	"total_wagered" integer DEFAULT 0 NOT NULL,
	"total_won" integer DEFAULT 0 NOT NULL,
	"total_xp_gained" integer DEFAULT 0 NOT NULL,
	"rtp" numeric(5, 2),
	"duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"end_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "game_spins" (
	"id" varchar PRIMARY KEY NOT NULL,
	"player_name" text,
	"game_name" text,
	"game_id" text,
	"spin_data" jsonb,
	"gross_win_amount" double precision NOT NULL,
	"wager_amount" double precision NOT NULL,
	"spin_number" integer NOT NULL,
	"player_avatar" text,
	"currency_id" text,
	"session_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"occurred_at" timestamp (3) NOT NULL,
	"sessionDataId" text
);
--> statement-breakpoint
CREATE TABLE "in_active_wallets" (
	"id" varchar PRIMARY KEY NOT NULL,
	"balance" integer NOT NULL,
	"payment_method" text DEFAULT 'INSTORE_CASH' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean NOT NULL,
	"is_default" boolean NOT NULL,
	"address" text,
	"cashtag" text,
	"user_id" text,
	"operator_id" text NOT NULL,
	"last_used_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "in_active_wallets_address_unique" UNIQUE("address"),
	CONSTRAINT "in_active_wallets_cashtag_unique" UNIQUE("cashtag")
);
--> statement-breakpoint
CREATE TABLE "jackpots" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"current_amount_coins" integer NOT NULL,
	"seed_amount_coins" integer NOT NULL,
	"minimum_bet_coins" integer DEFAULT 1 NOT NULL,
	"contribution_rate_basis_points" integer NOT NULL,
	"probability_per_million" integer NOT NULL,
	"minimum_time_between_wins_minutes" integer NOT NULL,
	"last_won_at" timestamp (3),
	"last_won_by" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jackpot_contributions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"jackpot_id" text NOT NULL,
	"user_id" text,
	"game_spin_id" text NOT NULL,
	"contribution_amount_coins" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jackpot_wins" (
	"id" varchar PRIMARY KEY NOT NULL,
	"jackpot_id" text NOT NULL,
	"winner_id" text NOT NULL,
	"win_amount_coins" integer NOT NULL,
	"game_spin_id" text NOT NULL,
	"transaction_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"session_data_id" text,
	CONSTRAINT "jackpot_wins_game_spin_id_unique" UNIQUE("game_spin_id")
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"operator_secret" text NOT NULL,
	"operator_access" text NOT NULL,
	"callback_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"allowed_ips" text[] NOT NULL,
	"description" text,
	"balance" integer NOT NULL,
	"net-revenue" integer NOT NULL,
	"accepted_payments" text[] NOT NULL,
	"owner_id" text,
	"last_used_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "operators_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text DEFAULT 'default' NOT NULL,
	"product_type" text DEFAULT 'bundle' NOT NULL,
	"bonus_total_in_credits" integer NOT NULL,
	"is_active" boolean,
	"price_in_cents" integer NOT NULL,
	"amount_to_receive_in_credits" integer NOT NULL,
	"best_value" integer NOT NULL,
	"discount_in_cents" integer NOT NULL,
	"bonus_spins" integer NOT NULL,
	"is_promo" boolean,
	"total_discount_in_cents" integer NOT NULL,
	"operator_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_participants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"user_id" text NOT NULL,
	"score" integer NOT NULL,
	"rank" integer,
	"joined_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"processed_at" timestamp (3),
	"wallet_id" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"amount" integer NOT NULL,
	"net_amount" integer,
	"fee_amount" integer,
	"product_id" text,
	"payment_method" text,
	"balance_before" integer,
	"balance_after" integer,
	"bonus_balance_before" integer,
	"bonus_balance_after" integer,
	"bonus_amount" integer,
	"wagering_requirement" integer,
	"wagering_progress" integer,
	"description" text,
	"provider" text,
	"provider_tx_id" text,
	"related_game_id" text,
	"related_round_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"operator_id" text,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password_hash" text,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp (3),
	"refresh_token_expires_at" timestamp (3),
	"current_game_session_data_id" text,
	"current_auth_session_data_id" text,
	"avatar_url" text DEFAULT 'avatar-01',
	"role" text DEFAULT 'USER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp (3),
	"total_xp_gained" integer NOT NULL,
	"active_wallet_id" text,
	"vip_info_id" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_current_game_session_data_id_unique" UNIQUE("current_game_session_data_id"),
	CONSTRAINT "users_current_auth_session_data_id_unique" UNIQUE("current_auth_session_data_id"),
	CONSTRAINT "users_active_wallet_id_unique" UNIQUE("active_wallet_id"),
	CONSTRAINT "users_vip_info_id_unique" UNIQUE("vip_info_id")
);
--> statement-breakpoint
CREATE TABLE "vip_info" (
	"id" varchar PRIMARY KEY NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer NOT NULL,
	"totalXp" integer NOT NULL,
	"userId" text NOT NULL,
	"currentRankid" integer,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "vip_info_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "VipLevel" (
	"level" integer PRIMARY KEY NOT NULL,
	"xpForNext" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vip_level_up_history" (
	"id" varchar PRIMARY KEY NOT NULL,
	"previous_level" integer NOT NULL,
	"new_level" integer NOT NULL,
	"timestamp" timestamp (3) DEFAULT now() NOT NULL,
	"vip_info_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "VipRank" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"minXp" integer NOT NULL,
	"dailyBonusCoinPct" integer NOT NULL,
	"hourlyBonusCoinPct" integer NOT NULL,
	"purchaseBonusCoinPct" integer NOT NULL,
	"levelUpBonusCoinPct" integer NOT NULL,
	"hasConcierge" boolean NOT NULL,
	"hasVipLoungeAccess" boolean NOT NULL,
	"isInvitationOnly" boolean NOT NULL,
	CONSTRAINT "VipRank_name_unique" UNIQUE("name"),
	CONSTRAINT "VipRank_minXp_unique" UNIQUE("minXp")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" varchar PRIMARY KEY NOT NULL,
	"balance" integer NOT NULL,
	"payment_method" text DEFAULT 'INSTORE_CASH' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean NOT NULL,
	"address" text,
	"cashtag" text,
	"user_id" text NOT NULL,
	"operator_id" text NOT NULL,
	"last_used_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_address_unique" UNIQUE("address"),
	CONSTRAINT "wallets_cashtag_unique" UNIQUE("cashtag")
);
--> statement-breakpoint
CREATE TABLE "app_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"version" text NOT NULL,
	"platform" text NOT NULL,
	"update_type" text NOT NULL,
	"download_url" text NOT NULL,
	"changelog" text[] NOT NULL,
	"mandatory" boolean DEFAULT false NOT NULL,
	"release_date" timestamp with time zone NOT NULL,
	"file_size" integer NOT NULL,
	"checksum" text NOT NULL,
	CONSTRAINT "version_unique_idx" UNIQUE("app_id","platform","version")
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_request_custom_data" (
	"id" varchar PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"site_id" text NOT NULL,
	"extras" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_request_user_data" (
	"id" varchar PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"user_id" text NOT NULL,
	"hash" text NOT NULL,
	"affiliate" text NOT NULL,
	"lang" text NOT NULL,
	"channel" text NOT NULL,
	"user_type" text NOT NULL,
	"fingerprint" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_requests" (
	"id" varchar PRIMARY KEY NOT NULL,
	"token" text,
	"session_id" text NOT NULL,
	"play_mode" text NOT NULL,
	"game_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_result_game" (
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_result_id" text NOT NULL,
	"cols" integer NOT NULL,
	"rows" integer NOT NULL,
	"version" text NOT NULL,
	"rtp_default" numeric NOT NULL,
	"volatility_index" numeric NOT NULL,
	"max_multiplier" numeric NOT NULL,
	"game_type" text NOT NULL,
	"has_state" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_result_user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_result_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"country" text NOT NULL,
	"casino" text NOT NULL,
	"token" text NOT NULL,
	"session_id" text NOT NULL,
	"can_gamble" boolean NOT NULL,
	"last_win" numeric NOT NULL,
	"server_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_result_user_balance" (
	"id" varchar PRIMARY KEY NOT NULL,
	"settings_result_user_id" varchar NOT NULL,
	"cash" numeric NOT NULL,
	"free_bets" numeric NOT NULL,
	"session_cash" numeric NOT NULL,
	"session_free_bets" numeric NOT NULL,
	"bonus" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_settings_results" (
	"id" varchar PRIMARY KEY NOT NULL,
	"success" boolean NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_request_custom_data" (
	"id" varchar PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"site_id" text NOT NULL,
	"extras" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_request_user_data" (
	"id" varchar PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"affiliate" text NOT NULL,
	"lang" text NOT NULL,
	"channel" text NOT NULL,
	"user_type" text NOT NULL,
	"fingerprint" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_requests" (
	"id" varchar PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"session_id" text NOT NULL,
	"play_mode" text NOT NULL,
	"game_id" text NOT NULL,
	"stake" integer NOT NULL,
	"bonus_id" text,
	"extras" text,
	"game_mode" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_result_game" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spin_result_id" text NOT NULL,
	"stake" numeric NOT NULL,
	"multiplier" integer NOT NULL,
	"has_state" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_result_game_win" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spin_result_game_id" varchar NOT NULL,
	"lines" numeric NOT NULL,
	"total" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_result_user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spin_result_id" text NOT NULL,
	"can_gamble" boolean NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" text NOT NULL,
	"session_net_position" numeric NOT NULL,
	"token" text NOT NULL,
	"server_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_result_user_balance" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spin_result_user_id" varchar NOT NULL,
	"cash_at_start" numeric NOT NULL,
	"cash_after_bet" numeric NOT NULL,
	"cash_at_end" numeric NOT NULL,
	"free_bets_at_start" numeric NOT NULL,
	"free_bets_after_bet" numeric NOT NULL,
	"free_bets_at_end" numeric NOT NULL,
	"bonus_at_start" numeric NOT NULL,
	"bonus_after_bet" numeric NOT NULL,
	"bonus_at_end" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rtg_spin_results" (
	"id" varchar PRIMARY KEY NOT NULL,
	"success" boolean NOT NULL,
	"error_code" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_games" ADD CONSTRAINT "favorite_games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_games" ADD CONSTRAINT "favorite_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_operator_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "game_history" ADD CONSTRAINT "game_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_history" ADD CONSTRAINT "game_history_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_auth_session_id_auth_sessions_id_fk" FOREIGN KEY ("auth_session_id") REFERENCES "public"."auth_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jackpots" ADD CONSTRAINT "jackpots_lastWinner_fkey" FOREIGN KEY ("last_won_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jackpot_contributions" ADD CONSTRAINT "jackpot_contributions_gameSpin_fkey" FOREIGN KEY ("game_spin_id") REFERENCES "public"."game_spins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jackpot_contributions" ADD CONSTRAINT "jackpot_contributions_jackpot_fkey" FOREIGN KEY ("jackpot_id") REFERENCES "public"."jackpots"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jackpot_wins" ADD CONSTRAINT "jackpot_wins_gameSpin_fkey" FOREIGN KEY ("game_spin_id") REFERENCES "public"."game_spins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jackpot_wins" ADD CONSTRAINT "jackpot_wins_jackpot_fkey" FOREIGN KEY ("jackpot_id") REFERENCES "public"."jackpots"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jackpot_wins" ADD CONSTRAINT "jackpot_wins_winner_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_operator_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_product_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vip_info" ADD CONSTRAINT "vip_info_user_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vip_info" ADD CONSTRAINT "vip_info_currentRank_fkey" FOREIGN KEY ("currentRankid") REFERENCES "public"."VipRank"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vip_level_up_history" ADD CONSTRAINT "vip_level_up_history_vipInfo_fkey" FOREIGN KEY ("vip_info_id") REFERENCES "public"."vip_info"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_settings_request_custom_data" ADD CONSTRAINT "rtg_settings_request_custom_data_request_id_rtg_settings_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."rtg_settings_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_settings_request_user_data" ADD CONSTRAINT "rtg_settings_request_user_data_request_id_rtg_settings_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."rtg_settings_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_settings_result_game" ADD CONSTRAINT "rtg_settings_result_game_settings_result_id_rtg_settings_results_id_fk" FOREIGN KEY ("settings_result_id") REFERENCES "public"."rtg_settings_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_settings_result_user" ADD CONSTRAINT "rtg_settings_result_user_settings_result_id_rtg_settings_results_id_fk" FOREIGN KEY ("settings_result_id") REFERENCES "public"."rtg_settings_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_settings_result_user_balance" ADD CONSTRAINT "rtg_settings_result_user_balance_settings_result_user_id_rtg_settings_result_user_id_fk" FOREIGN KEY ("settings_result_user_id") REFERENCES "public"."rtg_settings_result_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_request_custom_data" ADD CONSTRAINT "rtg_spin_request_custom_data_request_id_rtg_spin_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."rtg_spin_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_request_user_data" ADD CONSTRAINT "rtg_spin_request_user_data_request_id_rtg_spin_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."rtg_spin_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_result_game" ADD CONSTRAINT "rtg_spin_result_game_spin_result_id_rtg_spin_results_id_fk" FOREIGN KEY ("spin_result_id") REFERENCES "public"."rtg_spin_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_result_game_win" ADD CONSTRAINT "rtg_spin_result_game_win_spin_result_game_id_rtg_spin_result_game_id_fk" FOREIGN KEY ("spin_result_game_id") REFERENCES "public"."rtg_spin_result_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_result_user" ADD CONSTRAINT "rtg_spin_result_user_spin_result_id_rtg_spin_results_id_fk" FOREIGN KEY ("spin_result_id") REFERENCES "public"."rtg_spin_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rtg_spin_result_user_balance" ADD CONSTRAINT "rtg_spin_result_user_balance_spin_result_user_id_rtg_spin_result_user_id_fk" FOREIGN KEY ("spin_result_user_id") REFERENCES "public"."rtg_spin_result_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_session_user_idx" ON "auth_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "auth_session_status_idx" ON "auth_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "game_session_auth_session_idx" ON "game_sessions" USING btree ("auth_session_id");--> statement-breakpoint
CREATE INDEX "game_session_user_idx" ON "game_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "JackpotContribution_jackpotId_gameSpinId_key" ON "jackpot_contributions" USING btree ("jackpot_id","game_spin_id");