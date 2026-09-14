import { FC } from 'react';

import Sessions from './Session';
import MFA from './MFA';

const Security: FC = () => {
  return (
    <div className="space-y-6">
      <MFA />
      <Sessions />
    </div>
  );
};

export default Security;
