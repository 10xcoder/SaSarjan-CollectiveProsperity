import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { AuthState, AuthSession, User, AuthEvent, AuthEventHandler } from '../types'
import { AuthService } from '../core/auth-service'

interface AuthStore extends AuthState {
  // Actions
  setSession: (session: AuthSession | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAuth: () => void
  
  // Event handlers
  eventHandlers: Set<AuthEventHandler>
  addEventListener: (handler: AuthEventHandler) => () => void
  removeEventListener: (handler: AuthEventHandler) => void
  emitEvent: (event: AuthEvent) => void
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        eventHandlers: new Set(),

        // Actions
        setSession: (session) => {
          set({ 
            session, 
            user: session?.user || null,
            isAuthenticated: !!session,
            error: null 
          })
          
          // Emit event for cross-app communication
          if (session) {
            get().emitEvent({ type: 'SIGN_IN', payload: session })
          } else {
            get().emitEvent({ type: 'SIGN_OUT', payload: null })
          }
        },

        setUser: (user) => {
          set({ user, isAuthenticated: !!user })
          if (user) {
            get().emitEvent({ type: 'USER_UPDATED', payload: user })
          }
        },

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearAuth: () => {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null
          })
          get().emitEvent({ type: 'SIGN_OUT', payload: null })
        },

        // Event system for cross-app communication
        addEventListener: (handler) => {
          const { eventHandlers } = get()
          eventHandlers.add(handler)
          
          // Return cleanup function
          return () => {
            eventHandlers.delete(handler)
          }
        },

        removeEventListener: (handler) => {
          const { eventHandlers } = get()
          eventHandlers.delete(handler)
        },

        emitEvent: (event) => {
          const { eventHandlers } = get()
          eventHandlers.forEach(handler => {
            try {
              handler(event)
            } catch (error) {
              console.error('Error in auth event handler:', error)
            }
          })
          
          // Also broadcast to other windows/tabs
          broadcastAuthEvent(event)
        }
      }),
      {
        name: 'sasarjan-auth-store',
        partialize: (state) => ({
          user: state.user,
          session: state.session,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
)

// Cross-window/tab communication
function broadcastAuthEvent(event: AuthEvent) {
  if (typeof window === 'undefined') return
  
  try {
    // Use BroadcastChannel for same-origin communication
    const channel = new BroadcastChannel('sasarjan-auth')
    channel.postMessage({
      type: 'AUTH_EVENT',
      event,
      timestamp: Date.now()
    })
  } catch (error) {
    // Fallback to localStorage events
    try {
      localStorage.setItem('sasarjan-auth-event', JSON.stringify({
        event,
        timestamp: Date.now()
      }))
      localStorage.removeItem('sasarjan-auth-event')
    } catch (err) {
      console.warn('Unable to broadcast auth event:', err)
    }
  }
}

// Listen for auth events from other windows/tabs
if (typeof window !== 'undefined') {
  try {
    const channel = new BroadcastChannel('sasarjan-auth')
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'AUTH_EVENT') {
        const store = useAuthStore.getState()
        store.eventHandlers.forEach(handler => {
          try {
            handler(event.data.event)
          } catch (error) {
            console.error('Error handling broadcasted auth event:', error)
          }
        })
      }
    })
  } catch (error) {
    // BroadcastChannel not supported, fallback to storage events
    window.addEventListener('storage', (event) => {
      if (event.key === 'sasarjan-auth-event' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          const store = useAuthStore.getState()
          store.eventHandlers.forEach(handler => {
            try {
              handler(data.event)
            } catch (error) {
              console.error('Error handling storage auth event:', error)
            }
          })
        } catch (err) {
          console.warn('Error parsing auth event from storage:', err)
        }
      }
    })
  }
}

// Helper hooks for common auth operations
export const useAuth = () => {
  const state = useAuthStore()
  return {
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error
  }
}

export const useAuthActions = () => {
  const {
    setSession,
    setUser,
    setLoading,
    setError,
    clearAuth,
    addEventListener,
    removeEventListener
  } = useAuthStore()

  return {
    setSession,
    setUser,
    setLoading,
    setError,
    clearAuth,
    addEventListener,
    removeEventListener
  }
}