import { useMemo, useState } from 'react'
import { Input, Button, Typography } from 'antd'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { useKanban } from '../store/kanban.js'
import Column from '../components/Column.jsx'
import CardItem from '../components/CardItem.jsx'

const { Title } = Typography

export default function BoardPage() {
  const { columns, reorderColumns, moveCardSameColumn, moveCardAcrossColumns, addColumn, cards } = useKanban()
  const [newCol, setNewCol] = useState('')
  const [activeItem, setActiveItem] = useState(null) // {type:'card'|'column', id, columnId?}

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Board</Title>
        <Input
          placeholder="Add a column…"
          value={newCol}
          onChange={(e) => setNewCol(e.target.value)}
          onPressEnter={() => {
            const t = newCol.trim()
            if (!t) return
            addColumn(t)
            setNewCol('')
          }}
          style={{ maxWidth: 280 }}
        />
        <Button
          type="primary"
          onClick={() => {
            const t = newCol.trim()
            if (!t) return
            addColumn(t)
            setNewCol('')
          }}
        >
          Add Column
        </Button>
      </div>

      <div className="kanban-scroll">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={(e) => {
            const { active } = e
            const type = active.data.current?.type
            if (type === 'card') {
              setActiveItem({ type, id: String(active.id), columnId: active.data.current?.columnId })
            } else if (type === 'column') {
              setActiveItem({ type, id: String(active.id) })
            } else {
              setActiveItem(null)
            }
          }}
          onDragEnd={(e) => {
            const { active, over } = e
            setActiveItem(null)
            if (!over) return

            const activeType = active.data.current?.type
            const overType = over.data.current?.type

            if (activeType === 'column') {
              const activeId = String(active.id)
              const overId = String(over.id)
              if (activeId !== overId) reorderColumns(activeId, overId)
              return
            }

            if (activeType === 'card') {
              const activeId = String(active.id)
              const fromColId = active.data.current?.columnId
              let toColId = null
              let overCardId = null

              if (overType === 'card') {
                toColId = over.data.current?.columnId
                overCardId = String(over.id)
              } else if (overType === 'column') {
                toColId = String(over.id)
              } else {
                toColId = String(over.id)
              }

              if (!fromColId || !toColId) return
              if (fromColId === toColId && overCardId) {
                moveCardSameColumn(toColId, activeId, overCardId)
              } else {
                moveCardAcrossColumns(fromColId, toColId, activeId, overCardId || undefined)
              }
            }
          }}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div className="kanban-columns">
              {columns.map((col) => (
                <Column key={col.id} column={{ ...col }} />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay: render phần tử đang kéo “bay” trên cùng, tránh giật layout */}
          {createPortal(
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              {activeItem?.type === 'card' && (
                <CardItem
                  asOverlay
                  card={cards[activeItem.id]}
                  columnId={activeItem.columnId}
                />
              )}
              {/* Nếu muốn overlay cho cột, có thể vẽ một snapshot gọn hơn */}
              {activeItem?.type === 'column' && (
                <div style={{ width: 320 }}>
                  <div style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,.1)'
                  }}>
                    Dragging column…
                  </div>
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  )
}
