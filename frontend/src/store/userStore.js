import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // User state
      sessionId: null,
      language: 'en',
      stateName: null,
      district: null,
      constituency: null,
      isFirstTimeVoter: false,
      isOnboarded: false,

      // Chat state
      messages: [],

      // Actions
      setLanguage: (lang) => set({ language: lang }),
      setLocation: (stateName, district, constituency) =>
        set({ stateName, district, constituency }),
      setFirstTimeVoter: (val) => set({ isFirstTimeVoter: val }),
      setSessionId: (id) => set({ sessionId: id }),
      completeOnboarding: () => set({ isOnboarded: true }),

      addMessage: (role, content) =>
        set((state) => ({
          messages: [...state.messages, { role, content, timestamp: Date.now() }],
        })),

      clearMessages: () => set({ messages: [] }),

      reset: () =>
        set({
          sessionId: null,
          language: 'en',
          stateName: null,
          district: null,
          constituency: null,
          isFirstTimeVoter: false,
          isOnboarded: false,
          messages: [],
        }),
    }),
    {
      name: 'pollaris-user-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist basic settings, not the session or chat state
      partialize: (state) => ({ 
        language: state.language,
        stateName: state.stateName,
        district: state.district,
        constituency: state.constituency,
        isFirstTimeVoter: state.isFirstTimeVoter
      }),
    }
  )
);

export default useUserStore;
