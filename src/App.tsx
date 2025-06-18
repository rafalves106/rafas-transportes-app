import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app-container">
      <aside>
        <p>Menu Lateral</p>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
