import { Layout, Typography, theme } from 'antd'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
import BoardPage from './pages/BoardPage.jsx'

const { Header, Content } = Layout
const { Text } = Typography

export default function App() {
  const { token } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: `1px solid ${token.colorSplit}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 16,
        }}
      >
        <Link to="/" style={{ fontWeight: 600, fontSize: 18, color: token.colorText }}>
          Kanban
        </Link>
        <Text type="secondary">React + Ant Design + DnD Kit + Zustand</Text>
      </Header>

      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  )
}
