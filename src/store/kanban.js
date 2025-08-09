import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

const newId = () => nanoid(10)

const seed = () => {
  const c1 = { id: newId(), title: 'Todo',  cardIds: [] }
  const c2 = { id: newId(), title: 'Doing', cardIds: [] }
  const c3 = { id: newId(), title: 'Done',  cardIds: [] }

  const cards = {}
  const mk = (t) => {
    const id = newId()
    cards[id] = { id, title: t, createdAt: Date.now() }
    return id
  }
  c1.cardIds.push(mk('Set up project'), mk('Design schema'))
  c2.cardIds.push(mk('Implement DnD'))
  c3.cardIds.push(mk('Write README'))

  return { columns: [c1, c2, c3], cards }
}

function arrayMove(arr, fromIndex, toIndex) {
  const a = arr.slice()
  const [item] = a.splice(fromIndex, 1)
  a.splice(toIndex, 0, item)
  return a
}

export const useKanban = create(
  persist(
    (set, get) => ({
      ...seed(),

      addColumn: (title) =>
        set((s) => ({ columns: [...s.columns, { id: newId(), title, cardIds: [] }] })),

      renameColumn: (columnId, title) =>
        set((s) => ({
          columns: s.columns.map((c) => (c.id === columnId ? { ...c, title } : c)),
        })),

      deleteColumn: (columnId) =>
        set((s) => {
          const col = s.columns.find((c) => c.id === columnId)
          const cards = { ...s.cards }
          col?.cardIds.forEach((id) => delete cards[id])
          return { columns: s.columns.filter((c) => c.id !== columnId), cards }
        }),

      reorderColumns: (activeId, overId) =>
        set((s) => {
          const from = s.columns.findIndex((c) => c.id === activeId)
          const to = s.columns.findIndex((c) => c.id === overId)
          if (from < 0 || to < 0) return {}
          return { columns: arrayMove(s.columns, from, to) }
        }),

      addCard: (columnId, title) =>
        set((s) => {
          const id = newId()
          const card = { id, title, createdAt: Date.now() }
          const columns = s.columns.map((c) =>
            c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c
          )
          return { cards: { ...s.cards, [id]: card }, columns }
        }),

      renameCard: (cardId, title) =>
        set((s) => ({ cards: { ...s.cards, [cardId]: { ...s.cards[cardId], title } } })),

      deleteCard: (columnId, cardId) =>
        set((s) => {
          const columns = s.columns.map((c) =>
            c.id === columnId ? { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) } : c
          )
          const cards = { ...s.cards }
          delete cards[cardId]
          return { columns, cards }
        }),

      moveCardSameColumn: (columnId, activeId, overId) =>
        set((s) => {
          const col = s.columns.find((c) => c.id === columnId)
          if (!col) return {}
          const from = col.cardIds.indexOf(activeId)
          const to = col.cardIds.indexOf(overId)
          if (from < 0 || to < 0) return {}
          const newIds = arrayMove(col.cardIds, from, to)
          return {
            columns: s.columns.map((c) => (c.id === columnId ? { ...c, cardIds: newIds } : c)),
          }
        }),

      moveCardAcrossColumns: (fromColId, toColId, cardId, overCardId) =>
        set((s) => {
          if (fromColId === toColId) return {}
          const columns = s.columns.map((c) => ({ ...c }))
          const fromCol = columns.find((c) => c.id === fromColId)
          const toCol = columns.find((c) => c.id === toColId)
          if (!fromCol || !toCol) return {}

          fromCol.cardIds = fromCol.cardIds.filter((id) => id !== cardId)
          if (overCardId) {
            const at = toCol.cardIds.indexOf(overCardId)
            toCol.cardIds.splice(at, 0, cardId)
          } else {
            toCol.cardIds.push(cardId)
          }
          return { columns }
        }),
    }),
    { name: 'kanban-antd-state' }
  )
)
