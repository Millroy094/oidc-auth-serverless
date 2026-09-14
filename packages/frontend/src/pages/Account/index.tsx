import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {
  AccountBox,
  Business,
  RecentActors,
  LocalPolice,
} from '@mui/icons-material';
import { AppBar, Button, Container, Toolbar } from '@mui/material';
import Profile from './Profile';
import Clients from './Clients';
import Users from './Users';
import { useAuth } from '../../context/AuthProvider';
import Security from './Security';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, size } = props;

  return (
    value === index && (
      <Container maxWidth={size} sx={{ p: 2 }}>
        {children}
      </Container>
    )
  );
}

export default function Account() {
  const [value, setValue] = React.useState(0);
  const Auth = useAuth();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: '50px' }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: 1,
              }}
            >
              INNOVO
            </Typography>

            <Button variant="contained" color="error" onClick={Auth?.logout}>
              Log out
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
          display: 'flex',
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="User Account Tabs"
          sx={{ borderRight: 1, borderColor: 'divider', width: 100 }}
        >
          <Tab label="Profile" icon={<AccountBox color="error" />} />
          <Tab label="Security" icon={<LocalPolice color="warning" />} />
          {Auth?.user?.roles?.includes('admin') && (
            <Tab label="Clients" icon={<Business color="info" />} />
          )}
          {Auth?.user?.roles?.includes('admin') && (
            <Tab label="Users" icon={<RecentActors color="secondary" />} />
          )}
        </Tabs>
        <TabPanel value={value} index={0} size="sm">
          <Profile />
        </TabPanel>

        <TabPanel value={value} index={1} size="md">
          <Security />
        </TabPanel>
        {Auth?.user?.roles?.includes('admin') && (
          <>
            <TabPanel value={value} index={2} size="md">
              <Clients />
            </TabPanel>
            <TabPanel value={value} index={3} size="md">
              <Users />
            </TabPanel>
          </>
        )}
      </Box>
    </>
  );
}
