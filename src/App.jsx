import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from './firebase/config'
import Header from './components/Header'
import Financas from './components/Financas'
import Investimentos from './components/Investimentos'
import Lazer from './components/Lazer'
import Imoveis from './components/Imoveis'
import Automoveis from './components/Automoveis'
import Calculadora from './components/Calculadora'
import './index.css'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [secao, setSecao] = useState('inicio')
  const [loading, setLoading] = useState(true)
  const [mostrarCalc, setMostrarCalc] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUsuario(user)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error(error)
    }
  }

  const logout = () => signOut(auth)

  if (loading) {
    return (
      <div id="loader-container">
        <div className="loader"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <Header
        usuario={usuario}
        login={login}
        logout={logout}
        setSecao={setSecao}
        toggleCalc={() => setMostrarCalc(!mostrarCalc)}
      />

      <main>
        {secao === 'inicio' && (
          <>
            <section className="inicio" data-aos="fade-up">
              <div className="inicio-content">
                <h1 className="titulo-inicio">Gerencie sua vida financeira</h1>
                <p className="texto-inicio">
                  Controle suas finanças, investimentos, imóveis e lazer em um só lugar.
                  Dashboard completo com gráficos em tempo real.
                </p>
                {!usuario && (
                  <button className="button321" onClick={login}>
                    Começar agora
                  </button>
                )}
              </div>
            </section>

            <section className="features" data-aos="fade-up">
              <div className="feature-card">
                <img src="/financia.jpeg" alt="Finanças" className="feature-img" />
                <h3>Finanças</h3>
                <p>Controle completo de receitas e despesas</p>
              </div>
              <div className="feature-card">
                <img src="/investimento.webp" alt="Investimentos" className="feature-img" />
                <h3>Investimentos</h3>
                <p>Gerencie sua carteira de ativos</p>
              </div>
              <div className="feature-card">
                <img src="/casa.webp" alt="Imóveis" className="feature-img" />
                <h3>Imóveis</h3>
                <p>Cadastre e gerencie todos seus imóveis</p>
              </div>
            </section>
          </>
        )}
        {secao === 'financas' && <Financas usuario={usuario} />}
        {secao === 'investimentos' && <Investimentos usuario={usuario} />}
        {secao === 'lazer' && <Lazer usuario={usuario} />}
        {secao === 'imoveis' && <Imoveis usuario={usuario} />}
        {secao === 'automoveis' && <Automoveis usuario={usuario} />}
      </main>

      {mostrarCalc && <Calculadora onClose={() => setMostrarCalc(false)} />}
    </>
  )
}

export default App