import { TbError404 } from "react-icons/tb";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Page404 = () => {
  return (
    <Page404Box>
      <TbError404 className="icon" />
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>페이지의 주소가 잘못되었거나 변경되어 요청한 페이지를 찾을 수 없습니다.</p>
      <p>문제가 있을 시 담당자에게 연락 부탁드립니다.</p>
      <Link to="/main">&#62; 메인 페이지로 이동 &#60;</Link>
    </Page404Box>
  );
};

const Page404Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: black;
  color: white;

  .icon {
    font-size: 150px;
  }

  h1 {
    margin-top: 0;
    margin-bottom: 50px;
  }

  p {
    margin: 10px 0;
  }

  a {
    margin-top: 50px;
    font-size: 20px;
    color: #8888db;
  }
`;

export default Page404;
