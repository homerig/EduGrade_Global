import "./styles/App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="menu-block">
          <div className="menu-title">Estudiantes</div>
          <a className="menu-item" href="#">
            Consultar
          </a>
          <a className="menu-item" href="#">
            Crear
          </a>
        </div>

        <div className="menu-block">
          <div className="menu-title">Instituciones</div>
          <a className="menu-item" href="#">
            Consultar
          </a>
          <a className="menu-item" href="#">
            Añadir curso
          </a>
          <a className="menu-item" href="#">
            Crear
          </a>
        </div>

        <div className="menu-footer">
          <a className="menu-item" href="#">
            Info
          </a>
        </div>
      </aside>

      <main className="content">
        <h1 className="page-title">Edu Grade Global</h1>
        {/* Acá iría tu contenido */}
      </main>
    </div>
  );
}

export default App;
