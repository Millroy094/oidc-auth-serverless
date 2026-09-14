import { FC } from 'react';

import Sessions from './Session';
import MFA from './MFA';
import { Divider } from '@mui/material';

const Security: FC = () => {
  return (
    <>
      <MFA />
      <Divider sx={{ m: '30px 10px' }} />
      <Sessions />
    </>
  );
};

export default Security;
