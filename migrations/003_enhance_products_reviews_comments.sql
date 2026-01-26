-- Enhance products table
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS quality VARCHAR(50),
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
    ALTER COLUMN community_id DROP NOT NULL;

-- Create reviews table (Polymorphic)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'product', 'store', 'user'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON public.reviews(author_id);
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create comments table (Polymorphic)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'product', 'post', etc
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_target ON public.comments(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
