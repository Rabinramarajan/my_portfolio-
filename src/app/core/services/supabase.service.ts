import { Injectable, PLATFORM_ID, Signal, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface SupabaseQueryOptions {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
}

export interface SupabaseError {
  code: string;
  message: string;
  details?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Signals-first Supabase service for Angular 22.
 * Provides reactive data bindings, auth state management, and SSR-safe operations.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private supabaseClient: SupabaseClient | null = null;
  private readonly inMemoryCache = new Map<string, unknown>();

  // ── Auth State ──────────────────────────────────────
  private readonly authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  readonly auth = computed(() => this.authState());
  readonly user = computed(() => this.authState().user);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isLoading = computed(() => this.authState().isLoading);

  constructor() {
    if (this.isBrowser) {
      this.initClient();
      this.initAuthListener();
    }
  }

  /**
   * Initialize Supabase client.
   */
  private initClient(): void {
    if (this.supabaseClient) return;
    this.supabaseClient = createClient(environment.supabase.url, environment.supabase.key);
  }

  /**
   * Listen to auth state changes.
   */
  private initAuthListener(): void {
    if (!this.supabaseClient) return;

    // Get initial session
    this.supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        this.authState.set({
          user: data.session.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        this.authState.set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    // Subscribe to auth changes
    this.supabaseClient.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      this.authState.set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });
  }

  /**
   * Get the Supabase client (browser only).
   */
  private getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not available (SSR context)');
    }
    return this.supabaseClient;
  }

  /**
   * Create a reactive signal that syncs with a Supabase table.
   * Returns a readonly signal + methods to refetch/update.
   */
  table<T extends Record<string, any>>(
    tableName: string,
    options?: SupabaseQueryOptions,
  ): {
    data: Signal<T[]>;
    loading: Signal<boolean>;
    error: Signal<SupabaseError | null>;
    refetch: () => Promise<void>;
  } {
    const dataSignal = signal<T[]>([]);
    const loadingSignal = signal(true);
    const errorSignal = signal<SupabaseError | null>(null);

    const fetchData = async () => {
      if (!this.isBrowser) return;

      const cacheKey = `table:${tableName}:${JSON.stringify(options)}`;
      const cached = this.inMemoryCache.get(cacheKey) as T[] | undefined;

      if (cached) {
        dataSignal.set(cached);
        loadingSignal.set(false);
        return;
      }

      try {
        loadingSignal.set(true);
        errorSignal.set(null);

        let query = this.getClient().from(tableName).select('*');

        if (options?.limit) {
          query = query.limit(options.limit);
        }
        if (options?.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
        if (options?.order) {
          query = query.order(options.order, {
            ascending: options.ascending ?? true,
          });
        }

        const { data, error } = await query;

        if (error) {
          errorSignal.set({
            code: error.code || 'UNKNOWN',
            message: error.message,
            details: error.details,
          });
        } else if (data) {
          dataSignal.set(data as T[]);
          this.inMemoryCache.set(cacheKey, data);
        }
      } finally {
        loadingSignal.set(false);
      }
    };

    void fetchData();

    return {
      data: dataSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      refetch: fetchData,
    };
  }

  /**
   * Fetch a single record by ID.
   */
  async fetchById<T extends Record<string, any>>(
    tableName: string,
    id: string | number,
  ): Promise<T | null> {
    if (!this.isBrowser) {
      return null;
    }

    const cacheKey = `fetch:${tableName}:${id}`;
    const cached = this.inMemoryCache.get(cacheKey) as T | undefined;
    if (cached) return cached;

    try {
      const { data, error } = await this.getClient()
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Supabase fetch error:`, error);
        return null;
      }

      if (data) {
        this.inMemoryCache.set(cacheKey, data);
      }
      return (data as T) || null;
    } catch (err) {
      console.error(`Supabase fetch exception:`, err);
      return null;
    }
  }

  /**
   * Query records with filters.
   */
  async query<T extends Record<string, any>>(
    tableName: string,
    filters: Record<string, any>,
    options?: SupabaseQueryOptions,
  ): Promise<T[]> {
    if (!this.isBrowser) {
      return [];
    }

    try {
      let query = this.getClient().from(tableName).select('*');

      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      if (options?.order) {
        query = query.order(options.order, {
          ascending: options.ascending ?? true,
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Supabase query error:`, error);
        return [];
      }

      return (data as T[]) || [];
    } catch (err) {
      console.error(`Supabase query exception:`, err);
      return [];
    }
  }

  /**
   * Insert a single record.
   */
  async insert<T extends Record<string, any>>(
    tableName: string,
    record: Omit<T, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<T | null> {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const { data, error } = await this.getClient()
        .from(tableName)
        .insert([record as any])
        .select()
        .single();

      if (error) {
        console.error(`Supabase insert error:`, error);
        return null;
      }

      this.clearTableCache(tableName);
      return (data as T) || null;
    } catch (err) {
      console.error(`Supabase insert exception:`, err);
      return null;
    }
  }

  /**
   * Update a record by ID.
   */
  async update<T extends Record<string, any>>(
    tableName: string,
    id: string | number,
    updates: Partial<Omit<T, 'id' | 'created_at'>>,
  ): Promise<T | null> {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const { data, error } = await this.getClient()
        .from(tableName)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Supabase update error:`, error);
        return null;
      }

      this.clearTableCache(tableName);
      return (data as T) || null;
    } catch (err) {
      console.error(`Supabase update exception:`, err);
      return null;
    }
  }

  /**
   * Delete a record by ID.
   */
  async delete(tableName: string, id: string | number): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    try {
      const { error } = await this.getClient().from(tableName).delete().eq('id', id);

      if (error) {
        console.error(`Supabase delete error:`, error);
        return false;
      }

      this.clearTableCache(tableName);
      return true;
    } catch (err) {
      console.error(`Supabase delete exception:`, err);
      return false;
    }
  }

  /**
   * Sign up with email and password.
   */
  async signUp(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: SupabaseError | null }> {
    if (!this.isBrowser) {
      return { user: null, error: { code: 'SSR', message: 'Auth unavailable on server' } };
    }

    try {
      const { data, error } = await this.getClient().auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          user: null,
          error: { code: error.code || 'UNKNOWN', message: error.message },
        };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return {
        user: null,
        error: {
          code: 'EXCEPTION',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Sign in with email and password.
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: SupabaseError | null }> {
    if (!this.isBrowser) {
      return { user: null, error: { code: 'SSR', message: 'Auth unavailable on server' } };
    }

    try {
      const { data, error } = await this.getClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          user: null,
          error: { code: error.code || 'UNKNOWN', message: error.message },
        };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return {
        user: null,
        error: {
          code: 'EXCEPTION',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Sign out.
   */
  async signOut(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    try {
      const { error } = await this.getClient().auth.signOut();
      return !error;
    } catch (err) {
      console.error('Sign out error:', err);
      return false;
    }
  }

  /**
   * Clear cache for a specific table.
   */
  private clearTableCache(tableName: string): void {
    const keysToDelete = Array.from(this.inMemoryCache.keys()).filter(
      (key) => key.startsWith(`table:${tableName}:`) || key.startsWith(`fetch:${tableName}:`),
    );
    keysToDelete.forEach((key) => this.inMemoryCache.delete(key));
  }

  /**
   * Clear all caches.
   */
  clearCache(): void {
    this.inMemoryCache.clear();
  }

  from(table: string) {
    return this.getClient().from(table);
  }
}
