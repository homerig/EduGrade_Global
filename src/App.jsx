import "./styles/App.css";
import { Link, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ConsultarEstudiantes from "./pages/ConsultarEstudiantes";
import CrearEstudiante from "./pages/CrearEstudiante";
import ConsultarInstituciones from "./pages/ConsultarInstituciones";
import CrearInstitucion from "./pages/CrearInstitucion";
import AnadirCurso from "./pages/AnadirCurso";

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
          <Link className="menu-item" to="/instituciones/anadir-curso">Añadir curso</Link>
          <Link className="menu-item" to="/instituciones/crear">Crear</Link>
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
          <Route path="/instituciones/anadir-curso" element={<AnadirCurso />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
