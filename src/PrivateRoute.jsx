import { Navigate, useLocation, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const location = useLocation();

  const token = sessionStorage.getItem("authToken");

  return token ? <Outlet /> : <Navigate to={`/login${location.search}`} {...alert("로그인이 필요합니다.")} />;
};

export default PrivateRoute;
