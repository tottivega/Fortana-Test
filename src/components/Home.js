import React from 'react';
import styles from '../styles/Home.module.css'
import logo from '../img/logo-brigada.svg'

function Home(){
  return (
    <div className={styles.parent}>
      <div className={styles.child}>
        <img src={logo} className={styles.logo} alt={'brigada logo'}/>
        <p className={styles.landingText}> Welcome to Brigada's MapApp, go ahead and look for an org by typing its ID next to a / on this page's link
         <br/> (example: localhost:3000/4)
        </p>
      </div>
    </div>
  )
}

export default Home;
