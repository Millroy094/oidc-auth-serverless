import * as React from 'react';
import { User, Lock, Briefcase, UsersIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import Profile from './Profile';
import Clients from './Clients';
import Users from './Users';
import { useAuth } from '../../context/AuthProvider';
import Security from './Security';

export default function Account() {
  const [value, setValue] = React.useState('0');
  const Auth = useAuth();

  return (
    <>
      <div className="bg-primary text-primary-foreground py-4 mb-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-widest">INNOVO</h1>
          <Button variant="destructive" onClick={Auth?.logout}>
            Log out
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <Tabs value={value} onValueChange={setValue} orientation="vertical" className="flex gap-6 max-w-7xl mx-auto px-4 w-full">
          <TabsList className="flex flex-col h-auto w-auto border-r pr-6">
            <TabsTrigger value="0" className="justify-start gap-2 text-left">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="1" className="justify-start gap-2 text-left">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            {Auth?.user?.roles?.includes('admin') && (
              <TabsTrigger value="2" className="justify-start gap-2 text-left">
                <Briefcase className="h-4 w-4" />
                <span>Clients</span>
              </TabsTrigger>
            )}
            {Auth?.user?.roles?.includes('admin') && (
              <TabsTrigger value="3" className="justify-start gap-2 text-left">
                <UsersIcon className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1">
            <TabsContent value="0" className="mt-0">
              <Profile />
            </TabsContent>

            <TabsContent value="1" className="mt-0">
              <Security />
            </TabsContent>

            {Auth?.user?.roles?.includes('admin') && (
              <TabsContent value="2" className="mt-0">
                <Clients />
              </TabsContent>
            )}

            {Auth?.user?.roles?.includes('admin') && (
              <TabsContent value="3" className="mt-0">
                <Users />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </>
  );
}
