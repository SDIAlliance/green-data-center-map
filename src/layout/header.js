import React from 'react';
import styled from 'styled-components';

import SharedHeader from '../components/sharedheader';

const logo = resolvePath('images/electricitymap-logo.svg');
const SDIAlogo = resolvePath('images/sdia-logo-dark.png');

const headerLinks = [
  {
    label: 'Open Source',
    href: 'https://greendatacentermap.com/open-source?utm_source=app.greendatacentermap.com&utm_medium=referral',
  }
];

const Container = styled.div`
  /* This makes sure the map and the other content doesn't
  go under the SharedHeader which has a fixed position. */
  height: 58px;
  @media (max-width: 767px) {
    display: none !important;
  }
`;

const Header = () => (
  <Container>
    <SharedHeader
      logo={logo}
      links={headerLinks}
      SDIAlogo={SDIAlogo}
    />
  </Container>
);

export default Header;
