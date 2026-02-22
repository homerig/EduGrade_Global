import "./styles/App.css";
import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Estudiantes
import ConsultarEstudiantes from "./pages/estudiantes/Consultar";
import CrearEstudiante from "./pages/estudiantes/Crear";

// Instituciones
import ConsultarInstituciones from "./pages/instituciones/Consultar";
import CrearInstitucion from "./pages/instituciones/Crear";

// Materias
import ConsultarMaterias from "./pages/materias/Consultar";
import CrearMateria from "./pages/materias/Crear";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="menu-block">
          <div className="menu-title">Estudiantes</div>
          <Link className="menu-item" to="/estudiantes/consultar">Consultar</Link>
          <Link className="menu-item" to="/estudiantes/crear">Crear</Link>
        </div>

        <div className="menu-block">
          <div className="menu-title">Instituciones</div>
          <Link className="menu-item" to="/instituciones/consultar">Consultar</Link>
          <Link className="menu-item" to="/instituciones/crear">Crear</Link>
        </div>

        <div className="menu-block">
          <div className="menu-title">Materias</div>
          <Link className="menu-item" to="/materias/consultar">Consultar</Link>
          <Link className="menu-item" to="/materias/crear">Crear</Link>
        </div>

        <div className="menu-footer">
          <Link className="menu-item" to="/">Info</Link>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/estudiantes/consultar" element={<ConsultarEstudiantes />} />
          <Route path="/estudiantes/crear" element={<CrearEstudiante />} />

          <Route path="/instituciones/consultar" element={<ConsultarInstituciones />} />
          <Route path="/instituciones/crear" element={<CrearInstitucion />} />

          <Route path="/materias/consultar" element={<ConsultarMaterias />} />
          <Route path="/materias/crear" element={<CrearMateria />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
