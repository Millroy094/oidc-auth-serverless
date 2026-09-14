import { FC, startTransition, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import getUsers from '../../../api/admin/get-users';
import useFeedback from '../../../hooks/useFeedback';
import deleteUser from '../../../api/admin/delete-user';
import { RotateCcw, UserX } from 'lucide-react';
import clearUserSessions from '../../../api/admin/clear-user-sessions';
import UserPopup from './UserPopup';
import { ADMIN_EMAIL } from '../../../constants';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

const Users: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { feedbackAxiosError, feedbackAxiosResponse } = useFeedback();

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.results);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving users, please try again',
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await deleteUser(id);
      feedbackAxiosResponse(response, 'Successfully deleted user', 'success');
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the user, please try again',
      );
    }
  };

  const handleDeleteSessions = async (id: string): Promise<void> => {
    try {
      const response = await clearUserSessions(id);
      feedbackAxiosResponse(
        response,
        'Successfully deleted user sessions',
        'success',
      );
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting the user sessions, please try again',
      );
    }
  };

  const handleRowClick = (user: User) => {
    const isAdmin = user?.email === ADMIN_EMAIL;

    if (!isAdmin) {
      startTransition(() => {
        setSelectedUserId(user.id);
        setOpen(true);
      });
    }
  };

  const onClose = () => {
    setOpen(false);
    setSelectedUserId('');
    fetchUsers();
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Users</h2>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
         <table className="w-full text-sm">
           <thead className="border-b border-slate-200 bg-slate-50">
             <tr>
               <th className="text-left py-3 px-4 font-medium">First Name</th>
               <th className="text-left py-3 px-4 font-medium">Last Name</th>
               <th className="text-left py-3 px-4 font-medium">Email</th>
               <th className="text-left py-3 px-4 font-medium">Mobile</th>
               <th className="text-center py-3 px-4 font-medium">Actions</th>
             </tr>
           </thead>
           <tbody>
             {users.map((user) => {
               const isAdmin = user?.email === ADMIN_EMAIL;
               return (
                 <tr
                   key={user.id}
                   onClick={() => handleRowClick(user)}
                   className={`border-b border-slate-200 ${
                     !isAdmin ? 'hover:bg-slate-50 cursor-pointer' : ''
                   }`}
                 >
                   <td className="py-3 px-4">{user.firstName}</td>
                   <td className="py-3 px-4">{user.lastName}</td>
                   <td className="py-3 px-4">{user.email}</td>
                   <td className="py-3 px-4">{user.mobile}</td>
                   <td className="py-3 px-4 text-center">
                     <div className="flex justify-center gap-2">
                       <button
                         disabled={isAdmin}
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteSessions(user.id);
                         }}
                         title="Clear all sessions"
                         className={`p-1 rounded ${
                           isAdmin
                             ? 'opacity-50 cursor-not-allowed'
                             : 'hover:bg-red-100 text-red-600'
                         }`}
                       >
                         <RotateCcw className="w-4 h-4" />
                       </button>
                       <button
                         disabled={isAdmin}
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(user.id);
                         }}
                         title="Delete user"
                         className={`p-1 rounded ${
                           isAdmin
                             ? 'opacity-50 cursor-not-allowed'
                             : 'hover:bg-red-100 text-red-600'
                         }`}
                       >
                         <UserX className="w-4 h-4" />
                       </button>
                     </div>
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
        </div>
        <UserPopup
         open={open}
         userIdentifier={selectedUserId}
         onClose={onClose}
        />
      </CardContent>
    </Card>
  );
};

export default Users;
