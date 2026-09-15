import { FC } from 'react';
import MFA from './MFA';
import Sessions from './Session';

const Security: FC = () => {
  return (
    <div className="space-y-6">
      <MFA />
      <Sessions />
    </div>
  );
};

export default Security;
