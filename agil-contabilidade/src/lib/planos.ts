export const PLANOS = {
  free:         { label: 'Free',         limite: 10,   preco: 0   },
  starter:      { label: 'Starter',      limite: 50,   preco: 79  },
  profissional: { label: 'Profissional', limite: 200,  preco: 199 },
  escritorio:   { label: 'Escritório',   limite: 9999, preco: 399 },
} as const

export type PlanoKey = keyof typeof PLANOS
