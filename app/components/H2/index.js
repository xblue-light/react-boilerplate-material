import styled from 'styled-components';

const H2 = styled.h2`
  font-size: 1.5em;
  color: ${props => (props.primary ? 'blue' : 'green')};
`;

export default H2;
