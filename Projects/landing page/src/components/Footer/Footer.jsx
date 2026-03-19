import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span>✝</span>
          <span>Kiamiko Catholic Church</span>
        </div>
        <div className={styles.socials}>
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="YouTube">YouTube</a>
          <a href="#" aria-label="WhatsApp">WhatsApp</a>
        </div>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Kiamiko Catholic Church. All rights reserved.</p>
      </div>
    </footer>
  )
}
