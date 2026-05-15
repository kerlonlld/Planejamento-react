import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { doc, setDoc, onSnapshot, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { FaSave, FaTrash, FaHistory } from 'react-icons/fa'

Chart.register(...registerables)

function Financas({ usuario }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const [dados, setDados] = useState({
    salario: '', extra: '', investimentos: '', aluguel_recebido: '', vendas: '', comissao: '', bonus: '', pensao: '', dividendos: '', outros_entrada: '',
    aluguel: '', mercado: '', transporte: '', lazer: '', saude: '', educacao: '', cartao: '', internet: '', luz: '', agua: '', telefone: '', academia: '', assinaturas: '', impostos: '', outros_saida: ''
  })

  const [historico, setHistorico] = useState([])
  const [mostrarHistorico, setMostrarHistorico] = useState(false)
  const [tipoGrafico, setTipoGrafico] = useState('bar')
  const [salvo, setSalvo] = useState(false)

  // Carrega último registro
  useEffect(() => {
    if (!usuario) return
    const docRef = doc(db, 'financas', usuario.uid)
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const dadosFormatados = {}
        Object.keys(dados).forEach(key => {
          if (key!== 'dataAtualizacao') {
            dadosFormatados[key] = data[key] === 0? '' : data[key]
          }
        })
        setDados(prev => ({...prev,...dadosFormatados }))
      }
    })
    return () => unsub()
  }, [usuario])

  // Carrega histórico
  const carregarHistorico = async () => {
    if (!usuario) return
    try {
      const q = query(
        collection(db, 'financas', usuario.uid, 'historico'),
        orderBy('data', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const lista = []
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id,...doc.data() })
      })
      setHistorico(lista)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  useEffect(() => {
    if (usuario && mostrarHistorico) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      carregarHistorico()
    }
  }, [usuario, mostrarHistorico])

  const handleInput = (campo, valor) => {
    setDados({...dados, [campo]: valor })
    setSalvo(false)
  }

  const handleFocus = (campo) => {
    if (dados[campo] === 0 || dados[campo] === '0') {
      setDados({...dados, [campo]: '' })
    }
  }

  const toNum = (val) => parseFloat(val) || 0

  const totalEntrada = toNum(dados.salario) + toNum(dados.extra) + toNum(dados.investimentos) +
    toNum(dados.aluguel_recebido) + toNum(dados.vendas) + toNum(dados.comissao) +
    toNum(dados.bonus) + toNum(dados.pensao) + toNum(dados.dividendos) + toNum(dados.outros_entrada)

  const totalSaida = toNum(dados.aluguel) + toNum(dados.mercado) + toNum(dados.transporte) +
    toNum(dados.lazer) + toNum(dados.saude) + toNum(dados.educacao) + toNum(dados.cartao) +
    toNum(dados.internet) + toNum(dados.luz) + toNum(dados.agua) + toNum(dados.telefone) +
    toNum(dados.academia) + toNum(dados.assinaturas) + toNum(dados.impostos) + toNum(dados.outros_saida)

  const saldo = totalEntrada - totalSaida

  const salvarFinancas = async () => {
    if (!usuario) {
      alert('Faça login primeiro pra salvar')
      return
    }

    try {
      const dadosParaSalvar = {}
      Object.keys(dados).forEach(key => {
        dadosParaSalvar[key] = dados[key] === ''? 0 : parseFloat(dados[key]) || 0
      })
      dadosParaSalvar.dataAtualizacao = new Date()

      await setDoc(doc(db, 'financas', usuario.uid), dadosParaSalvar)

      await addDoc(collection(db, 'financas', usuario.uid, 'historico'), {
       ...dadosParaSalvar,
        data: new Date(),
        totalEntrada,
        totalSaida,
        saldo
      })

      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
      await carregarHistorico()

    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error.message}`)
    }
  }

  const deletarHistorico = async (id) => {
    if (!usuario) return
    try {
      await deleteDoc(doc(db, 'financas', usuario.uid, 'historico', id))
      await carregarHistorico()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar registro')
    }
  }

  // Gráfico
  useEffect(() => {
    if (!chartRef.current) return
    const ctx = chartRef.current.getContext('2d')
    if (chartInstance.current) chartInstance.current.destroy()

    chartInstance.current = new Chart(ctx, {
      type: tipoGrafico,
      data: {
        labels: ['Entradas', 'Saídas', 'Saldo'],
        datasets: [{
          label: 'R$',
          data: [totalEntrada, totalSaida, saldo],
          backgroundColor: [
            'rgba(0, 255, 136, 0.6)',
            'rgba(255, 68, 68, 0.6)',
            saldo >= 0? 'rgba(0, 163, 255, 0.6)' : 'rgba(255, 68, 68, 0.6)'
          ],
          borderColor: ['#00FF88', '#FF4444', saldo >= 0? '#00A3FF' : '#FF4444'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `R$ ${ctx.raw.toFixed(2)}` } }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#B0B0B0', callback: (v) => 'R$ ' + v },
            grid: { color: '#2A2A2A' }
          },
          x: { ticks: { color: '#B0B0B0' }, grid: { display: false } }
        }
      }
    })
  }, [dados, tipoGrafico, totalEntrada, totalSaida, saldo])

  const resetar = () => {
    const zerado = Object.keys(dados).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
    setDados(zerado)
    setSalvo(false)
  }

  return (
    <section data-aos="fade-up">
      <h2>Controle Financeiro</h2>
      <div>
        <button className="button321" onClick={() => setMostrarHistorico(!mostrarHistorico)}>
          <FaHistory /> {mostrarHistorico? 'Ocultar' : 'Ver'} Histórico
        </button>
      </div>

      {mostrarHistorico && (
        <div className="invest-list-container" style={{ marginBottom: '30px' }}>
          <h3>Histórico de Registros</h3>
          <div className="invest-grid-results">
            {historico.length === 0? (
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum registro salvo ainda</p>
            ) : (
              historico.map((item) => (
                <div key={item.id} className="invest-card-item">
                  <h4>{item.data?.toDate? new Date(item.data.toDate()).toLocaleDateString('pt-BR') : 'Data inválida'}</h4>
                  <p>Entradas: <strong style={{ color: '#00FF88' }}>R$ {item.totalEntrada?.toFixed(2)}</strong></p>
                  <p>Saídas: <strong style={{ color: '#FF4444' }}>R$ {item.totalSaida?.toFixed(2)}</strong></p>
                  <p>Saldo: <strong style={{ color: item.saldo >= 0? '#00A3FF' : '#FF4444' }}>
                    R$ {item.saldo?.toFixed(2)}
                  </strong></p>
                  <button onClick={() => deletarHistorico(item.id)} className="button321" style={{ marginTop: '10px' }}>
                    <FaTrash /> Deletar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="dashboard-financeiro">
        {/* ENTRADAS */}
        <div className="coluna-financas">
          <h3>Entradas</h3>
          <label>Salário</label>
          <input type="number" value={dados.salario} onChange={(e) => handleInput('salario', e.target.value)} onFocus={() => handleFocus('salario')} placeholder="R$ 0,00" />
          <label>Renda Extra</label>
          <input type="number" value={dados.extra} onChange={(e) => handleInput('extra', e.target.value)} onFocus={() => handleFocus('extra')} placeholder="R$ 0,00" />
          <label>Investimentos</label>
          <input type="number" value={dados.investimentos} onChange={(e) => handleInput('investimentos', e.target.value)} onFocus={() => handleFocus('investimentos')} placeholder="R$ 0,00" />
          <label>Aluguel Recebido</label>
          <input type="number" value={dados.aluguel_recebido} onChange={(e) => handleInput('aluguel_recebido', e.target.value)} onFocus={() => handleFocus('aluguel_recebido')} placeholder="R$ 0,00" />
          <label>Vendas</label>
          <input type="number" value={dados.vendas} onChange={(e) => handleInput('vendas', e.target.value)} onFocus={() => handleFocus('vendas')} placeholder="R$ 0,00" />
          <label>Comissão</label>
          <input type="number" value={dados.comissao} onChange={(e) => handleInput('comissao', e.target.value)} onFocus={() => handleFocus('comissao')} placeholder="R$ 0,00" />
          <label>Bônus/13º</label>
          <input type="number" value={dados.bonus} onChange={(e) => handleInput('bonus', e.target.value)} onFocus={() => handleFocus('bonus')} placeholder="R$ 0,00" />
          <label>Pensão/Aposentadoria</label>
          <input type="number" value={dados.pensao} onChange={(e) => handleInput('pensao', e.target.value)} onFocus={() => handleFocus('pensao')} placeholder="R$ 0,00" />
          <label>Dividendos</label>
          <input type="number" value={dados.dividendos} onChange={(e) => handleInput('dividendos', e.target.value)} onFocus={() => handleFocus('dividendos')} placeholder="R$ 0,00" />
          <label>Outros</label>
          <input type="number" value={dados.outros_entrada} onChange={(e) => handleInput('outros_entrada', e.target.value)} onFocus={() => handleFocus('outros_entrada')} placeholder="R$ 0,00" />
          <div className="mini-status">Total: R$ {totalEntrada.toFixed(2)}</div>
        </div>

        {/* GRÁFICO */}
        <div className="coluna-financas chart-box">
          <h3>📊 Análise</h3>
          <div className="controles-grafico">
            <button onClick={() => setTipoGrafico('bar')}>Barras</button>
            <button onClick={() => setTipoGrafico('line')}>Linha</button>
            <button onClick={() => setTipoGrafico('doughnut')}>Pizza</button>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="valor_finalS">
            <h2>Saldo Mensal</h2>
            <p id="valor-final-texto" style={{ color: saldo >= 0? '#00FF88' : '#FF4444' }}>
              R$ {saldo.toFixed(2)}
            </p>
            <button className="button321" onClick={salvarFinancas}>
              <FaSave /> {salvo? 'Salvo!' : 'Salvar'} </button>
            <button id="btn-reset" onClick={resetar}>Limpar Campos</button>
          </div>
        </div>

        {/* SAÍDAS */}
        <div className="coluna-financas">
          <h3>Saídas</h3>
          <label>Aluguel/Financiamento</label>
          <input type="number" value={dados.aluguel} onChange={(e) => handleInput('aluguel', e.target.value)} onFocus={() => handleFocus('aluguel')} placeholder="R$ 0,00" />
          <label>Mercado</label>
          <input type="number" value={dados.mercado} onChange={(e) => handleInput('mercado', e.target.value)} onFocus={() => handleFocus('mercado')} placeholder="R$ 0,00" />
          <label>Transporte</label>
          <input type="number" value={dados.transporte} onChange={(e) => handleInput('transporte', e.target.value)} onFocus={() => handleFocus('transporte')} placeholder="R$ 0,00" />
          <label>Lazer</label>
          <input type="number" value={dados.lazer} onChange={(e) => handleInput('lazer', e.target.value)} onFocus={() => handleFocus('lazer')} placeholder="R$ 0,00" />
          <label>Saúde</label>
          <input type="number" value={dados.saude} onChange={(e) => handleInput('saude', e.target.value)} onFocus={() => handleFocus('saude')} placeholder="R$ 0,00" />
          <label>Educação</label>
          <input type="number" value={dados.educacao} onChange={(e) => handleInput('educacao', e.target.value)} onFocus={() => handleFocus('educacao')} placeholder="R$ 0,00" />
          <label>Cartão de Crédito</label>
          <input type="number" value={dados.cartao} onChange={(e) => handleInput('cartao', e.target.value)} onFocus={() => handleFocus('cartao')} placeholder="R$ 0,00" />
          <label>Internet</label>
          <input type="number" value={dados.internet} onChange={(e) => handleInput('internet', e.target.value)} onFocus={() => handleFocus('internet')} placeholder="R$ 0,00" />
          <label>Luz/Energia</label>
          <input type="number" value={dados.luz} onChange={(e) => handleInput('luz', e.target.value)} onFocus={() => handleFocus('luz')} placeholder="R$ 0,00" />
          <label>Água</label>
          <input type="number" value={dados.agua} onChange={(e) => handleInput('agua', e.target.value)} onFocus={() => handleFocus('agua')} placeholder="R$ 0,00" />
          <label>Telefone/Celular</label>
          <input type="number" value={dados.telefone} onChange={(e) => handleInput('telefone', e.target.value)} onFocus={() => handleFocus('telefone')} placeholder="R$ 0,00" />
          <label>Academia</label>
          <input type="number" value={dados.academia} onChange={(e) => handleInput('academia', e.target.value)} onFocus={() => handleFocus('academia')} placeholder="R$ 0,00" />
          <label>Assinaturas/Streaming</label>
          <input type="number" value={dados.assinaturas} onChange={(e) => handleInput('assinaturas', e.target.value)} onFocus={() => handleFocus('assinaturas')} placeholder="R$ 0,00" />
          <label>Impostos</label>
          <input type="number" value={dados.impostos} onChange={(e) => handleInput('impostos', e.target.value)} onFocus={() => handleFocus('impostos')} placeholder="R$ 0,00" />
          <label>Outros</label>
          <input type="number" value={dados.outros_saida} onChange={(e) => handleInput('outros_saida', e.target.value)} onFocus={() => handleFocus('outros_saida')} placeholder="R$ 0,00" />
          <div className="mini-status2">Total: R$ {totalSaida.toFixed(2)}</div>
        </div>
      </div>
    </section>
  )
}

export default Financas