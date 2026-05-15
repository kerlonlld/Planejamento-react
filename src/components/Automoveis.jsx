import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaPlus, FaTrash, FaCar, FaGasPump } from 'react-icons/fa'

function Automoveis({ usuario }) {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    tipo: 'Selecione', modelo: '', ano: '', valor: '', combustivel: 'Selecione', manutencao: 'Selecione', seguro: 'Selecione', gastoCombustivel: ''
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (usuario) carregarAutomoveis()
  }, [usuario])

  const carregarAutomoveis = async () => {
    if (!usuario) return
    try {
      const q = query(collection(db, "automoveis"), where("userId", "==", usuario.uid))
      const snap = await getDocs(q)
      setLista(snap.docs.map(doc => ({ id: doc.id,...doc.data() })))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    }
  }

  const adicionarAutomovel = async () => {
    if (!usuario) return alert('Faz login primeiro')
    if (form.tipo === 'Selecione' ||!form.modelo ||!form.valor) return alert('Preenche tipo, modelo e valor')

    try {
      await addDoc(collection(db, "automoveis"), {
        userId: usuario.uid,
        tipo: form.tipo,
        modelo: form.modelo,
        ano: Number(form.ano) || 0,
        valor: Number(form.valor) || 0,
        combustivel: form.combustivel,
        manutencao: form.manutencao,
        seguro: form.seguro,
        gastoCombustivel: Number(form.gastoCombustivel) || 0,
        timestamp: Date.now()
      })

      setForm({ tipo: 'Selecione', modelo: '', ano: '', valor: '', combustivel: 'Selecione', manutencao: 'Selecione', seguro: 'Selecione', gastoCombustivel: '' })
      await carregarAutomoveis()

    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const deletar = async (id) => {
    if (!usuario) return
    try {
      await deleteDoc(doc(db, "automoveis", id))
      await carregarAutomoveis()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const totalFrota = lista.reduce((a,b) => a + Number(b.valor || 0), 0)
  const mediaValor = lista.length > 0? totalFrota / lista.length : 0
  const totalCombustivel = lista.reduce((a,b) => a + Number(b.gastoCombustivel || 0), 0)

  const iconeTipo = {
    carro: '',
    moto: '',
    caminhão: ''
  }

  return (
    <div className="car-container">
      <div className="car-form-section">
        <h3>Adicionar Novo Automóvel</h3>
        <div className="form-grid">
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
            <option value="Selecione">Selecione...</option>
            <option value="carro"> Carro</option>
            <option value="moto"> Moto</option>
            <option value="caminhão"> Caminhão</option>
          </select>
          <input placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
          <input type="number" placeholder="Ano" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} />
          <input type="number" placeholder="Valor R$" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
          <select value={form.combustivel} onChange={e => setForm({...form, combustivel: e.target.value})}>
            <option value="Selecione">Combustível</option>
            <option value="gasolina"> Gasolina</option>
            <option value="alcool">Álcool</option>
            <option value="diesel">Diesel</option>
            <option value="eletrico"> Elétrico</option>
          </select>
          <select value={form.manutencao} onChange={e => setForm({...form, manutencao: e.target.value})}>
            <option value="Selecione">Manutenção</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
          <select value={form.seguro} onChange={e => setForm({...form, seguro: e.target.value})}>
            <option value="Selecione">Seguro</option>
            <option value="básico">Básico</option>
            <option value="completo">Completo</option>
            <option value="premium">Premium</option>
          </select>
          <input type="number" placeholder="Gasto Combustível R$" value={form.gastoCombustivel} onChange={e => setForm({...form, gastoCombustivel: e.target.value})} />
        </div>
        <button className="btn-invest" onClick={adicionarAutomovel}>
          <FaPlus /> Adicionar Automóvel
        </button>
      </div>

      <div className="invest-list-container">
        <h3>Resumo da Frota</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #00A3FF, #0066CC)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaCar style={{ fontSize: '1.2rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>Valor Total Frota</p>
            </div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>
              R$ {totalFrota.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Valor Médio
            </p>
            <h2 style={{ color: 'var(--success)', margin: 0, fontSize: '1.8rem' }}>
              R$ {mediaValor.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaGasPump style={{ fontSize: '1.2rem', color: 'var(--danger)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Gasto Combustível</p>
            </div>
            <h2 style={{ color: 'var(--danger)', margin: 0, fontSize: '1.8rem' }}>
              R$ {totalCombustivel.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Veículos
            </p>
            <h2 style={{ color: 'var(--clara-color)', margin: 0, fontSize: '1.8rem' }}>
              {lista.length}
            </h2>
          </div>
        </div>

        <h3 style={{ marginTop: '10px' }}>Automóveis Registrados</h3>
        <div className="grid-results">
          {lista.length === 0? <p>Nenhum automóvel registrado.</p> :
            lista.map(auto => (
              <div key={auto.id} className="card-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{iconeTipo[auto.tipo] || '🚗'}</span>
                    <h4 style={{ margin: 0 }}>{auto.modelo || 'Sem modelo'}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    {auto.tipo || 'N/A'} • {auto.ano || 'N/A'}
                  </p>
                  <div style={{ margin: '12px 0' }}>
                    <p>Valor: <strong style={{ color: 'var(--success)' }}>R$ {Number(auto.valor || 0).toFixed(2)}</strong></p>
                    <p>Combustível: <strong>{auto.combustivel || 'N/A'}</strong></p>
                    <p>Manutenção: <strong>{auto.manutencao || 'N/A'}</strong></p>
                    <p>Seguro: <strong>{auto.seguro || 'N/A'}</strong></p>
                    {auto.gastoCombustivel > 0 && (
                      <p>Gasto Combustível: <strong style={{ color: 'var(--danger)' }}>R$ {Number(auto.gastoCombustivel).toFixed(2)}</strong></p>
                    )}
                  </div>
                </div>
                <button onClick={() => deletar(auto.id)}>
                  <FaTrash /> Remover
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Automoveis