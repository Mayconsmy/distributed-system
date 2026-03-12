import './App.css';

function App() {
  // Uma lista (Array) contendo as nossas curiosidades
  const curiosidades = [
    {
      id: 1,
      titulo: "Construtores das Pirâmides",
      texto: "Ao contrário da crença popular, as pirâmides não foram construídas por escravos, mas sim por trabalhadores assalariados, bem alimentados e muito respeitados na sociedade egípcia."
    },
    {
      id: 2,
      titulo: "A Origem de Cleópatra",
      texto: "A famosa rainha Cleópatra não era etnicamente egípcia. Ela era de origem grega macedônia, descendente de um dos generais de Alexandre, o Grande."
    },
    {
      id: 3,
      titulo: "Invenção da Pasta de Dente",
      texto: "Os egípcios eram muito preocupados com a higiene bucal e inventaram a primeira pasta de dente, feita com cascas de ovos queimadas, pó de pedra-pomes e cinzas."
    },
    {
      id: 4,
      titulo: "O Luto pelos Gatos",
      texto: "Os gatos eram reverenciados e considerados sagrados. Quando um gato de estimação morria, a família inteira raspava as sobrancelhas em sinal de luto profundo."
    }
  ];

  return (
    <div className="egypt-container">
      <header className="egypt-header">
        <h1>Curiosidades do Antigo Egito</h1>
        <div className="hieroglyphs">
          <span>𓀀</span><span>𓀁</span><span>𓀂</span><span>𓀃</span>
        </div>
      </header>

      {/* Grid onde os cartões vão aparecer */}
      <main className="curiosities-grid">
        {curiosidades.map((item) => (
          <div key={item.id} className="curiosity-card">
            <h2>{item.titulo}</h2>
            <p>{item.texto}</p>
          </div>
        ))}
      </main>

      <footer className="egypt-footer">
        <p>Explorando os mistérios do deserto</p>
      </footer>
    </div>
  );
}

export default App;