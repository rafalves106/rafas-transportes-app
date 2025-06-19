import { Outlet } from "react-router-dom";
import { GlobalStyle } from "./styles/GlobalStyle";

function App() {
  return (
    <>
      <GlobalStyle />
      <div className="app-container">
        <aside>
          <p>Menu Lateral</p>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
