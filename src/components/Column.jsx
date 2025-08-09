import { useState, useMemo } from 'react'
import { Card, Input, Button, Typography } from 'antd'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanban } from '../store/kanban.js'
import CardItem from './CardItem.jsx'

const { Text } = Typography

export default function Column({ column }) {
  const { cards, addCard, renameColumn, deleteColumn } = useKanban()
  const [title, setTitle] = useState(column.title)
  const [newCard, setNewCard] = useState('')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id, data: { type: 'column' } })

  const style = useMemo(
    () => ({ transform: CSS.Transform.toString(transform), transition }),
    [transform, transition]
  )

  const count = column.cardIds.length

  return (
    <div
      className={`column-width ${isDragging ? 'dragging-outline' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card
        title={
          <Input
            variant="borderless"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => renameColumn(column.id, (title || '').trim() || 'Untitled')}
          />
        }
        extra={<a onClick={(e) => { e.preventDefault(); deleteColumn(column.id) }}>Delete</a>}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>{count} card{count !== 1 ? 's' : ''}</Text>

        <div style={{ height: 8 }} />

        {/* Dùng div + CSS gap thay vì AntD <Space> để giảm wrapper gây đo lường lệch */}
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {column.cardIds.map((cid) => (
              <CardItem key={cid} card={cards[cid]} columnId={column.id} />
            ))}
          </div>
        </SortableContext>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const t = newCard.trim()
            if (!t) return
            addCard(column.id, t)
            setNewCard('')
          }}
          style={{ marginTop: 12, display: 'flex', gap: 8 }}
        >
          <Input
            placeholder="Add a card…"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
          />
          <Button type="primary" htmlType="submit">Add</Button>
        </form>
      </Card>
    </div>
  )
}
