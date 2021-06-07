import { Link } from "react-router-dom";

import styles from '../styles/components/CardsHome.module.css';

export default function CardsHome({...props}) {
  return (
    <div className={styles.container}>
      <Link to={props.link}>
        <div className={styles.module}>
          <h4>{props.name}</h4>
        </div>
      </Link>
    </div>
  )
}