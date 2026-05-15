import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaPlus, FaTrash, FaHome, FaChartBar } from 'react-icons/fa'

function Imoveis({ usuario }) {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({
    endereco: '', tipo: 'Selecione', valor: '', ano: '', area: '', data: ''
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (usuario) carregarImoveis()
  }, [usuario])

  const carregarImoveis = async () => {
    if (!usuario) return
    try {
      const q = query(collection(db, "imoveis"), where("userId", "==", usuario.uid))
      const snap = await getDocs(q)
      setLista(snap.docs.map(doc => ({ id: doc.id,...doc.data() })))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    }
  }

  const adicionarImovel = async () => {
    if (!usuario) return alert('Faz login primeiro')
    if (!form.endereco ||!form.valor || form.tipo === 'Selecione') return alert('Preenche endereço, valor e tipo')

    try {
      await addDoc(collection(db, "imoveis"), {
        userId: usuario.uid,
        endereco: form.endereco,
        tipo: form.tipo,
        valor: Number(form.valor) || 0,
        ano: Number(form.ano) || 0,
        area: Number(form.area) || 0,
        data: form.data || new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      })

      setForm({ endereco: '', tipo: 'Selecione', valor: '', ano: '', area: '', data: '' })
      await carregarImoveis()

    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const deletar = async (id) => {
    if (!usuario) return
    try {
      await deleteDoc(doc(db, "imoveis", id))
      await carregarImoveis()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const totalPatrimonio = lista.reduce((a,b) => a + Number(b.valor || 0), 0)
  const mediaValor = lista.length > 0? totalPatrimonio / lista.length : 0
  const areaTotal = lista.reduce((a,b) => a + Number(b.area || 0), 0)

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Sem data'
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const iconeTipo = {
    casa: '',
    apartamento: '',
    comercial: '',
    lote: ''
  }

  return (
    <div className="property-container">
      <div className="property-form-section">
        <h3>Adicionar Novo Imóvel</h3>
        <div className="form-grid">
          <input placeholder="Endereço" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
            <option value="Selecione">Selecione...</option>
            <option value="casa"> Casa</option>
            <option value="apartamento"> Apartamento</option>
            <option value="comercial"> Comercial</option>
            <option value="lote"> Lote</option>
          </select>
          <input type="number" placeholder="Valor R$" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
          <input type="number" placeholder="Ano" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} />
          <input type="number" placeholder="Área m²" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
          <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
        </div>
        <button className="btn-invest" onClick={adicionarImovel}>
          <FaPlus /> Adicionar Imóvel
        </button>
      </div>

      <div className="invest-list-container">
        <h3>Resumo do Patrimônio</h3>

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
              <FaHome style={{ fontSize: '1.2rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>Patrimônio Total</p>
            </div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem' }}>
              R$ {totalPatrimonio.toFixed(2)}
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaChartBar style={{ fontSize: '1.2rem', color: 'var(--success)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Valor Médio</p>
            </div>
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Área Total
            </p>
            <h2 style={{ color: 'var(--clara-color)', margin: 0, fontSize: '1.8rem' }}>
              {areaTotal.toFixed(0)} m²
            </h2>
          </div>

          <div style={{
            background: 'var(--intermediaria-color)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Imóveis
            </p>
            <h2 style={{ color: 'var(--clara-color)', margin: 0, fontSize: '1.8rem' }}>
              {lista.length}
            </h2>
          </div>
        </div>

        <h3 style={{ marginTop: '10px' }}>Imóveis Registrados</h3>
        <div className="grid-results">
          {lista.length === 0? <p>Nenhum imóvel registrado.</p> :
            lista.map(im => (
              <div key={im.id} className="card-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{iconeTipo[im.tipo] || '🏠'}</span>
                    <h4 style={{ margin: 0 }}>{im.tipo || 'Imóvel'}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    {im.endereco || 'Sem endereço'}
                  </p>
                  <div style={{ margin: '12px 0' }}>
                    <p>Valor: <strong style={{ color: 'var(--success)' }}>R$ {Number(im.valor || 0).toFixed(2)}</strong></p>
                    <p>Área: <strong>{im.area || 0} m²</strong></p>
                    <p>Ano: <strong>{im.ano || 'N/A'}</strong></p>
                    <p>Cadastrado: <strong>{formatarData(im.data)}</strong></p>
                  </div>
                </div>
                <button onClick={() => deletar(im.id)}>
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

export default Imoveis