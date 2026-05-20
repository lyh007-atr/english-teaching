import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stage from './pages/Stage'
import Lesson from './pages/Lesson'
import Exam from './pages/Exam'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stage/:stageId" element={<Stage />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/exam/:stageId" element={<Exam />} />
      </Routes>
    </Layout>
  )
}
