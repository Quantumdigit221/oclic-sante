// Type declarations for Supabase Edge Functions
// This file helps IDE understand Deno and Edge Function types

declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, options?: any): any;
}

export {};
