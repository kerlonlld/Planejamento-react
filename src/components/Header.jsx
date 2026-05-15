import { useState } from 'react'
import { FaCalculator, FaBars, FaTimes } from 'react-icons/fa'

function Header({ usuario, login, logout, setSecao, toggleCalc }) {
  const [menuAberto, setMenuAberto] = useState(false)

  const trocaSecao = (sec) => {
    setSecao(sec)
    setMenuAberto(false)
  }

  return (
    <header className="header">
      <div className="logo-container" onClick={() => trocaSecao('inicio')}>
        <h1 className="logo" data-text="KLLD">KLLD</h1>
        <span className="subtitle">TECHNOLOGY</span>
      </div>

      <button className="menu-toggle" onClick={() => setMenuAberto(!menuAberto)}>
        {menuAberto? <FaTimes /> : <FaBars />}
      </button>

      <nav className={`navegacao ${menuAberto? 'ativo' : ''}`}>
        <ul className="menu">
          <li><a className="link_menu" onClick={() => trocaSecao('inicio')}>início</a></li>
          <li><a className="link_menu" onClick={() => trocaSecao('financas')}>finanças</a></li>
          <li><a className="link_menu" onClick={() => trocaSecao('investimentos')}>investimentos</a></li>
          <li><a className="link_menu" onClick={() => trocaSecao('lazer')}>lazer</a></li>
          <li><a className="link_menu" onClick={() => trocaSecao('imoveis')}>imóveis</a></li>
          <li><a className="link_menu" onClick={() => trocaSecao('automoveis')}>automóveis</a></li>
          <li>
            <a className="link_menu" onClick={() => {toggleCalc(); setMenuAberto(false)}}>
              <FaCalculator /> calculadora
            </a>
          </li>
        </ul>
      </nav>

      <div className="header2">
        {usuario? (
          <>
            <span className="user-name">Olá, {usuario.displayName?.split(' ')[0]}</span>
            <button className="button321" onClick={logout}>Sair</button>
          </>
        ) : (
          <button className="button321" onClick={login}>Login</button>
        )}
      </div>
    </header>
  )
}

export default Header