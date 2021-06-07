import { Container } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { Skeleton } from '@material-ui/lab';

import CardsHome from "../components/CardsHome";
import NavBar from "../components/Navbar";

import { AuthContext } from '../contexts/AuthContext';

import styles from "../styles/pages/Home.module.css";

export default function Home() {
  const { user, role } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Início / Salon Manager"

    setTimeout(async () => {
      setLoading(false)
    }, 500)

  }, []);


  return (
    <NavBar>
      <Container>
        {(loading) ?
          <>
            <div className={styles.homeHeader}>
              <Skeleton animation="wave" width="25%" height="50px" />
              <Skeleton animation="wave" width="20%" height="25px" />
            </div>
            <div className={styles.modulesContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) =>
                <Skeleton key={n} animation="wave" variant="rect" width="auto" style={{ minHeight: '140px', borderRadius: '5px' }}></Skeleton>
              )}
            </div>
          </>
          :
          <>
            <div className={styles.homeHeader}>
              <h2>Olá, {user.name}! </h2>
              <p>O que deseja fazer hoje?</p>
            </div>

            <div className={styles.modulesContainer}>
              {role === "customer" &&
                <>
                  <CardsHome
                    name="Reserva de Produtos"
                    link="/products/reservation"
                  />
                </>
              }

              {role !== "customer" &&
                <>
                  <CardsHome
                    name="Agenda"
                    link="/schedule"
                  />

                  <CardsHome
                    name="Catálogo de Produtos"
                    link="/products/available"
                  />

                  <CardsHome
                    name="Produtos Reservados"
                    link="/products/reserved"
                  />
                </>
              }

              {role === "manager" &&
                <>
                  <CardsHome
                    name="Fluxo de Caixa"
                    link="/financial/cashflow"
                  />

                  <CardsHome
                    name="Contas a Pagar"
                    link="/financial/accounts/payable"
                  />

                  <CardsHome
                    name="Devedores"
                    link="/"
                  />

                  <CardsHome
                    name="Gerenciar Produtos"
                    link="/create/products"
                  />

                  <CardsHome
                    name="Gerenciar Funções"
                    link="/create/occupation"
                  />
                </>
              }
            </div>
          </>
        }
      </Container>
    </NavBar>
  );
}