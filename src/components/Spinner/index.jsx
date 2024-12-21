import styled from "styled-components";

const Spinner = () => {
  return (
    <SpinnerBox className="spinner-box">
      <img src={process.env.PUBLIC_URL + "/assets/gif/spinner.gif"} alt="spinner" />
    </SpinnerBox>
  );
};

const SpinnerBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    width: 50px;
    opacity: 0.5;
  }
`;

export default Spinner;
