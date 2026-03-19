import styles from './App.module.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import MassSchedule from './components/MassSchedule/MassSchedule'
import Ministries from './components/Ministries/Ministries'
import Events from './components/Events/Events'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
      <About />
      <MassSchedule />
      <Ministries />
      <Events />
      <Contact />
      <Footer />
    </div>
  )
}
export default App
