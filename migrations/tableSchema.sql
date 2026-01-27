--
-- PostgreSQL database dump
--



-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-14 22:14:22 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Extension management removed for Heroku compatibility




--
-- TOC entry 880 (class 1247 OID 16481)
-- Name: profile_visibility; Type: TYPE; Schema: public; Owner: komuna
--

DROP TYPE IF EXISTS public.profile_visibility CASCADE;
CREATE TYPE public.profile_visibility AS ENUM (
    'public',
    'registered',
    'private'
);


ALTER TYPE public.profile_visibility OWNER TO CURRENT_USER;

--
-- TOC entry 883 (class 1247 OID 16488)
-- Name: user_status; Type: TYPE; Schema: public; Owner: komuna
--

DROP TYPE IF EXISTS public.user_status CASCADE;
CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'deleted',
    'pending'
);


ALTER TYPE public.user_status OWNER TO CURRENT_USER;

--
-- TOC entry 255 (class 1255 OID 16534)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: komuna
--

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO CURRENT_USER;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16512)
-- Name: profiles; Type: TABLE; Schema: public; Owner: komuna
--

DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id bigint NOT NULL,
    user_id text NOT NULL,
    username text,
    first_name text,
    last_name text,
    phone text,
    bio text,
    avatar_url text,
    visibility public.profile_visibility DEFAULT 'public'::public.profile_visibility NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles OWNER TO CURRENT_USER;

--
-- TOC entry 217 (class 1259 OID 16511)
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: komuna
--

DROP SEQUENCE IF EXISTS public.profiles_id_seq CASCADE;
CREATE SEQUENCE public.profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO CURRENT_USER;

--
-- TOC entry 3498 (class 0 OID 0)
-- Dependencies: 217
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: komuna
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- TOC entry 216 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: public; Owner: komuna
--

DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    username character varying(90) NOT NULL,
    first_name character varying(90) NOT NULL,
    last_name character varying(90) NOT NULL,
    phone character varying(30) NOT NULL
);


ALTER TABLE public.users OWNER TO CURRENT_USER;

--
-- TOC entry 3320 (class 2604 OID 16515)
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- TOC entry 3491 (class 0 OID 16512)
-- Dependencies: 218
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: komuna
--




--
-- TOC entry 3489 (class 0 OID 16495)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: komuna
--




--
-- TOC entry 3499 (class 0 OID 0)
-- Dependencies: 217
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: komuna
--

SELECT pg_catalog.setval('public.profiles_id_seq', 1, false);


--
-- TOC entry 3338 (class 2606 OID 16522)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 3340 (class 2606 OID 16526)
-- Name: profiles profiles_user_unique; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_user_unique;
ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_unique UNIQUE (user_id);


--
-- TOC entry 3342 (class 2606 OID 16524)
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- TOC entry 3328 (class 2606 OID 16508)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3330 (class 2606 OID 16546)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3332 (class 2606 OID 16553)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3333 (class 1259 OID 16544)
-- Name: idx_profiles_public_username; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_profiles_public_username ON public.profiles USING btree (username) WHERE (visibility = 'public'::public.profile_visibility);


--
-- TOC entry 3334 (class 1259 OID 16543)
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- TOC entry 3335 (class 1259 OID 16532)
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- TOC entry 3336 (class 1259 OID 16533)
-- Name: idx_profiles_visibility; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_profiles_visibility ON public.profiles USING btree (visibility);


--
-- TOC entry 3324 (class 1259 OID 16509)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3325 (class 1259 OID 16542)
-- Name: idx_users_last_login; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_users_last_login ON public.users USING btree (last_login_at DESC) WHERE (is_deleted = false);


--
-- TOC entry 3326 (class 1259 OID 16510)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: komuna
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 3345 (class 2620 OID 16536)
-- Name: profiles trg_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: komuna
--

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3344 (class 2620 OID 16535)
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: komuna
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Communities and Store Tables
--

CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    seller_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON public.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_community_id ON public.products(community_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- Triggers for updated_at
CREATE TRIGGER trg_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--
-- Posts table
--
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_not_deleted ON public.posts(is_deleted) WHERE is_deleted = FALSE;

-- Trigger for posts updated_at
CREATE TRIGGER trg_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION public.set_updated_at();

--
-- TOC entry 3343 (class 2606 OID 16547)
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: komuna
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-14 22:14:23 CST

--
-- PostgreSQL database dump complete
--



