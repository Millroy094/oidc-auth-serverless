import { FC } from 'react';

import Sessions from './Session';
import MFA from './MFA';

const Security: FC = () => {
  return (
    <>
      <MFA />
      <div className="border-t border-slate-200 my-8 mx-2" />
      <Sessions />
    </>
  );
};

export default Security;
