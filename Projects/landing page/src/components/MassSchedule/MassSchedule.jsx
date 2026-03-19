import styles from './MassSchedule.module.css'

const masses = [
  { day: 'Sunday / Jumapili', time: '7:00 AM', language: 'Swahili', highlight: true },
  { day: 'Sunday / Jumapili', time: '9:30 AM', language: 'English', highlight: true },
  { day: 'Sunday / Jumapili', time: '12:00 PM', language: 'Swahili', highlight: true },
  { day: 'Monday – Friday / Jumatatu – Ijumaa', time: '6:30 AM', language: 'Swahili', highlight: false },
  { day: 'Saturday / Jumamosi', time: '8:00 AM', language: 'English', highlight: false },
]

export default function MassSchedule() {
  return (
    <section id="mass-schedule" className={styles.section}>
      <div className={styles.container}>
        <p className="sectionLabel centered">Mass Times — Nyakati za Misa</p>
        <h2 className={`${styles.title} centered`}>Join Us in Worship</h2>
        <div className={`glass ${styles.card}`}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Day / Siku</th>
                  <th>Time / Saa</th>
                  <th>Language / Lugha</th>
                </tr>
              </thead>
              <tbody>
                {masses.map((m, i) => (
                  <tr key={i} className={m.highlight ? styles.highlight : ''}>
                    <td>{m.day}</td>
                    <td>{m.time}</td>
                    <td>{m.language}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
