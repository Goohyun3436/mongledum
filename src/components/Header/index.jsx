import styled from "styled-components";

const Header = () => {
  const showNavbar = location.pathname !== `/login`;

  if (showNavbar) return <HeaderBox>Header</HeaderBox>;
};

const HeaderBox = styled.div``;

export default Header;
