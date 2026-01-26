-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    phone VARCHAR(30),
    email VARCHAR(255),
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to users (owner_id) if not implicitly handled by string id
-- In previous schema user IDs are text (Firebase UIDs).

-- Add index on owner_id
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);

-- Trigger for updated_at
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add store_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- Add index on store_id in products
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
