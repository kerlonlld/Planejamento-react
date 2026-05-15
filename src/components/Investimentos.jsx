import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaPlus, FaTrash, FaChartLine } from 'react-icons/fa'

function Investimentos({ usuario }) {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    nome: '', valor: '', tipo: 'Selecione', rendimento: '', prazo: '', risco: 'baixo', data: ''
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (usuario) carregarInvestimentos()
  }, [usuario])

  const carregarInvestimentos = async () => {
    if (!usuario) return
    try {
      const q = query(collection(db, "investimentos"), where("userId", "==", usuario.uid))
      const snap = await getDocs(q)
      setLista(snap.docs.map(doc => ({ id: doc.id,...doc.data() })))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    }
  }

  const adicionarInvestimento = async () => {
    if (!usuario) return alert('Faz login primeiro')
    if (!form.nome ||!form.valor) return alert('Preenche nome e valor')

    try {
      await addDoc(collection(db, "investimentos"), {
        userId: usuario.uid,
        nome: form.nome,
        valor: Number(form.valor),
        tipo: form.tipo === 'Selecione'? 'Outro' : form.tipo,
        rendimento: Number(form.rendimento) || 0,
        prazo: Number(form.prazo) || 0,
        risco: form.risco,
        data: form.data || new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      })

      setForm({ nome: '', valor: '', tipo: 'Selecione', rendimento: '', prazo: '', risco: 'baixo', data: '' })
      await carregarInvestimentos()

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const deletar = async (id) => {
    if (!usuario) return
    try {
      await deleteDoc(doc(db, "investimentos", id))
      await carregarInvestimentos()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar: ' + error.message)
    }
  }

  const calcularRetorno = (valor, rendimento, prazo) => {
    const v = Number(valor) || 0
    const r = Number(rendimento) || 0
    const p = Number(prazo) || 0
    if (!v ||!r ||!p) return 0
    return v * Math.pow(1 + r / 100, p / 12) - v
  }

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Sem data'
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const totalInvestido = lista.reduce((acc, inv) => acc + (Number(inv.valor) || 0), 0)
  const totalProjetado = lista.reduce((acc, inv) => {
    return acc + (Number(inv.valor) || 0) + calcularRetorno(inv.valor, inv.rendimento, inv.prazo)
  }, 0)

  const corRisco = {
    baixo: '#00FF88',
    médio: '#FFAA00',
    alto: '#FF4444'
  }

  return (
    <div className="invest-container">
      <div className="invest-card">
        <h3>Adicionar Investimento</h3>
        <div className="form-grid">
          <input placeholder="Nome do Ativo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input type="number" placeholder="Valor R$" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
            <option value="Selecione">Selecione</option>
            <option value="poupança">Poupança</option>
            <option value="ações">Ações</option>
            <option value="fundos imobiliários">FIIs</option>
            <option value="tesouro direto">Tesouro Direto</option>
            <option value="cripto moedas">Criptomoedas</option>
            <option value="Outro">Outro</option>
          </select>
          <input type="number" placeholder="Rendimento % a.a" value={form.rendimento} onChange={e => setForm({...form, rendimento: e.target.value})} />
          <input type="number" placeholder="Prazo Meses" value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} />
          <select value={form.risco} onChange={e => setForm({...form, risco: e.target.value})}>
            <option value="baixo">Baixo</option>
            <option value="médio">Médio</option>
            <option value="alto">Alto</option>
          </select>
          <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
        </div>
        <button className="btn-invest" onClick={adicionarInvestimento}>
          <FaPlus /> Adicionar à Carteira
        </button>
      </div>

      {lista.length > 0 && (
        <div className="invest-card" style={{ marginTop: '20px' }}>
          <h3><FaChartLine /> Resumo da Carteira</h3>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Investido</p>
              <h2 style={{ color: '#00A3FF', margin: '5px 0' }}>R$ {totalInvestido.toFixed(2)}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Valor Projetado</p>
              <h2 style={{ color: '#00FF88', margin: '5px 0' }}>R$ {totalProjetado.toFixed(2)}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lucro Estimado</p>
              <h2 style={{ color: '#FFAA00', margin: '5px 0' }}>R$ {(totalProjetado - totalInvestido).toFixed(2)}</h2>
            </div>
          </div>
        </div>
      )}

      <div className="invest-list-container">
        <h3>Ativos na Carteira</h3>
        <div className="invest-grid-results">
          {lista.length === 0? <p>Nenhum investimento registrado.</p> :
            lista.map(inv => {
              const retorno = calcularRetorno(inv.valor, inv.rendimento, inv.prazo)
              const valorFinal = Number(inv.valor) + retorno

              return (
                <div
                  key={inv.id}
                  className="invest-card-item"
                  style={{ borderLeft: `4px solid ${corRisco[inv.risco]}` }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0 }}>{inv.nome || 'Sem nome'}</h4>
                      <span style={{
                        background: corRisco[inv.risco] || '#00FF88',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {(inv.risco || 'baixo').toUpperCase()}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0' }}>
                      {inv.tipo || 'Outro'} • {formatarData(inv.data)}
                    </p>

                    <div style={{ margin: '12px 0' }}>
                      <p style={{ margin: '4px 0' }}>Investido: <strong>R$ {Number(inv.valor || 0).toFixed(2)}</strong></p>
                      <p style={{ margin: '4px 0' }}>Rendimento: <strong>{inv.rendimento || 0}% a.a</strong> • Prazo: <strong>{inv.prazo || 0}m</strong></p>
                      <p style={{ color: '#00FF88', marginTop: '8px' }}>
                        Projeção: <strong>R$ {valorFinal.toFixed(2)}</strong>
                        <span style={{ fontSize: '0.85rem' }}> (+R$ {retorno.toFixed(2)})</span>
                      </p>
                    </div> 
                  </div>

                  <button onClick={() => deletar(inv.id)}>
                    <FaTrash /> Remover
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default Investimentos