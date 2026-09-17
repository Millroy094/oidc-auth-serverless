import { SnackbarProvider } from 'notistack';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import Pages from './pages';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <Router>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        preventDuplicate
      >
        <TooltipProvider>
          <AuthProvider>
            <Pages />
          </AuthProvider>
        </TooltipProvider>
      </SnackbarProvider>
    </Router>
  );
}

export default App;
