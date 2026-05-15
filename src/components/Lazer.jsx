import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaCheck, FaTrash, FaWallet, FaArrowTrendUp } from 'react-icons/fa6'

function Lazer({ usuario }) {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    atividade: 'Selecione', pagamento: 'Dinheiro', custo: '', data: '', nota: ''
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (usuario) carregarLazer()
  }, [usuario])

  const carregarLazer = async () => {
    if (!usuario) return
    try {
      const q = query(collection(db, "lazer"), where("userId", "==", usuario.uid))
      const snap = await getDocs(q)
      setLista(snap.docs.map(doc => ({ id: doc.id,...doc.data() })))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    }
  }

  const adicionarLazer = async () => {
    if (!usuario) return alert('Faz login primeiro')
    if (form.atividade === 'Selecione' ||!form.custo) return alert('Preenche atividade e custo')

    try {
      await addDoc(collection(db, "lazer"), {
        userId: usuario.uid,
        atividade: form.atividade,
        pagamento: form.pagamento,
        custo: Number(form.custo) || 0,
        data: form.data || new Date().toISOString().split('T')[0],
        nota: form.nota || '',
        timestamp: Date.now()
      })

      setForm({ atividade: 'Selecione', pagamento: 'Dinheiro', custo: '', data: '', nota: '' })
      await carregarLazer()

    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const deletar = async (id) => {
    if (!usuario) return
    try {
      await deleteDoc(doc(db, "lazer", id))
      await carregarLazer()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const total = lista.reduce((a,b) => a + Number(b.custo || 0), 0)
  const media = lista.length > 0? total / lista.length : 0

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Sem data'
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const iconeAtividade = {
    viagem: '',
    cinema: '',
    restaurante: '',
    bar: '',
    show: '',
    outros: ''
  }

  return (
    <div className="lazer-dashboard-container">
      <div className="lazer-form-small">
        <h3>Novo Registro</h3>
        <select value={form.atividade} onChange={e => setForm({...form, atividade: e.target.value})}>
          <option value="Selecione">Selecione...</option>
          <option value="viagem"> Viagem</option>
          <option value="cinema"> Cinema</option>
          <option value="restaurante"> Restaurante</option>
          <option value="bar"> Bar</option>
          <option value="show"> Shows</option>
          <option value="outros"> Outros</option>
        </select>
        <select value={form.pagamento} onChange={e => setForm({...form, pagamento: e.target.value})}>
          <option value="Dinheiro"> Dinheiro</option>
          <option value="Pix"> Pix</option>
          <option value="Cartão de Crédito"> Cartão de Crédito</option>
          <option value="Cartão de Débito"> Cartão de Débito</option>
        </select>
        <input type="number" placeholder="Custo R$" value={form.custo} onChange={e => setForm({...form, custo: e.target.value})} />
        <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
        <input placeholder="Nota" value={form.nota} onChange={e => setForm({...form, nota: e.target.value})} />
        <button onClick={adicionarLazer}><FaCheck /> Salvar</button>
      </div>

      <div className="lazer-history-left">
        <h3>Resumo de Gastos</h3>

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
              <FaWallet style={{ fontSize: '1.2rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>Total Gasto</p>
            </div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>
              R$ {total.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaArrowTrendUp style={{ fontSize: '1.2rem', color: 'var(--success)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Média por Atividade</p>
            </div>
            <h2 style={{ color: 'var(--success)', margin: 0, fontSize: '1.8rem' }}>
              R$ {media.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Total de Registros
            </p>
            <h2 style={{ color: 'var(--clara-color)', margin: 0, fontSize: '1.8rem' }}>
              {lista.length}
            </h2>
          </div>
        </div>

        <h3 style={{ marginTop: '10px' }}>Histórico</h3>
        <div className="grid-results">
          {lista.length === 0? <p>Nenhum registro ainda.</p> :
            lista.map(l => (
              <div key={l.id} className="card-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{iconeAtividade[l.atividade] || '✨'}</span>
                    <h4 style={{ margin: 0 }}>{l.atividade || 'Sem nome'}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {l.pagamento || 'Dinheiro'} • {formatarData(l.data)}
                  </p>
                  <div style={{ margin: '12px 0' }}>
                    <p>Custo: <strong style={{ color: 'var(--danger)' }}>R$ {Number(l.custo || 0).toFixed(2)}</strong></p>
                    {l.nota && <p>Nota: <strong>{l.nota}</strong></p>}
                  </div>
                </div>
                <button onClick={() => deletar(l.id)}>
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

export default Lazer