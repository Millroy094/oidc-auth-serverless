import { RotateCcw, UserPlus, UserX, UsersIcon } from 'lucide-react';
import { FC, startTransition, useEffect, useState } from 'react';
import CreateUserPopup from './CreateUserPopup';
import UserPopup from './UserPopup';
import clearUserSessions from '@/api/admin/clear-user-sessions';
import deleteUser from '@/api/admin/delete-user';
import getUsers from '@/api/admin/get-users';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ADMIN_EMAIL } from '@/constants';
import useFeedback from '@/hooks/useFeedback';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { feedbackAxiosError, feedbackAxiosResponse } = useFeedback();

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.results ?? []);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retreiving users, please try again',
      );
    }
  };

  useEffect(() => {
    void fetchUsers();
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
    void fetchUsers();
  };

  const onCreateClose = () => {
    setCreateOpen(false);
    void fetchUsers();
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UsersIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl">Users</CardTitle>
          <CardDescription>
            View and manage the users registered on this platform.
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="rounded-lg border py-10 px-4 text-center text-muted-foreground">
            No users found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-190 text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      First Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Last Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Mobile</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isAdmin = user?.email === ADMIN_EMAIL;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleRowClick(user)}
                        className={`last:border-b-0 transition-colors ${
                          !isAdmin ? 'hover:bg-muted/50 cursor-pointer' : ''
                        }`}
                      >
                        <td className="py-3 px-4">{user.firstName}</td>
                        <td className="py-3 px-4">{user.lastName}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.email}
                            {isAdmin && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.mobile}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              disabled={isAdmin}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteSessions(user.id);
                              }}
                              title="Clear all sessions"
                              className={`p-1 rounded ${
                                isAdmin
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-destructive/10 text-destructive'
                              }`}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isAdmin}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDelete(user.id);
                              }}
                              title="Delete user"
                              className={`p-1 rounded ${
                                isAdmin
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-destructive/10 text-destructive'
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

            <div className="space-y-3 md:hidden">
              {users.map((user) => {
                const isAdmin = user?.email === ADMIN_EMAIL;
                return (
                  <div
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(user)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(user);
                      }
                    }}
                    className={`rounded-lg border p-4 transition-colors ${
                      !isAdmin ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          {isAdmin && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        {user.mobile && (
                          <p className="truncate text-sm text-muted-foreground">
                            {user.mobile}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          disabled={isAdmin}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteSessions(user.id);
                          }}
                          title="Clear all sessions"
                          className={`rounded p-1 ${
                            isAdmin
                              ? 'cursor-not-allowed opacity-50'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isAdmin}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(user.id);
                          }}
                          title="Delete user"
                          className={`rounded p-1 ${
                            isAdmin
                              ? 'cursor-not-allowed opacity-50'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <UserPopup
          open={open}
          userIdentifier={selectedUserId}
          onClose={onClose}
        />
        <CreateUserPopup open={createOpen} onClose={onCreateClose} />
      </CardContent>
    </Card>
  );
};

export default Users;
