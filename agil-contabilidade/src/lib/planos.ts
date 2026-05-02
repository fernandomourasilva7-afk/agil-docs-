export const PLANOS = {
  free:         { label: 'Free',         limite: 5,    preco: 0      },
  starter:      { label: 'Starter',      limite: 20,   preco: 36.99  },
  profissional: { label: 'Profissional', limite: 50,   preco: 65     },
  escritorio:   { label: 'Escritório',   limite: 9999, preco: 299    },
} as const

export type PlanoKey = keyof typeof PLANOS
