import { useMemo, useState } from 'react'
import { Card, Input, Space } from 'antd'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanban } from '../store/kanban.js'

export default function CardItem({ card, columnId, asOverlay = false }) {
  const { renameCard, deleteCard } = useKanban()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)

  // Khi render trong DragOverlay thì KHÔNG dùng useSortable
  const sortable = asOverlay
    ? null
    : useSortable({ id: card.id, data: { type: 'card', columnId } })

  const transform = sortable?.transform
  const transition = sortable?.transition
  const isDragging = sortable?.isDragging

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition
    }),
    [transform, transition]
  )

  const body = editing ? (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onPressEnter={() => {
          const t = title.trim()
          if (t) renameCard(card.id, t)
          setEditing(false)
        }}
        onBlur={() => {
          const t = title.trim()
          if (t) renameCard(card.id, t)
          setEditing(false)
        }}
      />
    </Space.Compact>
  ) : (
    <div style={{ fontSize: 14 }}>{card.title}</div>
  )

  const content = (
    <Card
      size="small"
      className={`card ${isDragging ? 'dragging-outline' : ''}`}
      bodyStyle={{ padding: 12 }}
      extra={
        !asOverlay && (
          <a
            onClick={(e) => {
              e.preventDefault()
              deleteCard(columnId, card.id)
            }}
          >
            Delete
          </a>
        )
      }
      onDoubleClick={() => {
        if (asOverlay) return
        setEditing(true)
        setTitle(card.title)
      }}
    >
      {body}
    </Card>
  )

  // Nếu là overlay → chỉ render Card “bay”, không attach sortable props
  if (asOverlay) return content

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
    >
      {content}
    </div>
  )
}
