import { Routes, Route, Navigate } from "react-router-dom";
import GlobalStyle from "./GlobalStyle";
import PrivateRoute from "./PrivateRoute";
import Header from "./components/Header";
import Main from "./pages/Main";
import Page404 from "./components/ErrorPage/Page404";
import "../src/fonts/Pretendard-GOV/font.css";

function App() {
  return (
    <div className="App">
      <GlobalStyle />
      <Header />
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}

        <Route path="/" element={<Navigate replace to="/main" />} />

        {/* <Route element={<PrivateRoute />}> */}
        <Route path="/main" element={<Main />} />

        <Route path="*" element={<Page404 />} />
        {/* </Route> */}
      </Routes>
    </div>
  );
}

export default App;
