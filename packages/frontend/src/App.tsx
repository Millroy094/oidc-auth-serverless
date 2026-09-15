import { SnackbarProvider } from 'notistack';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import Pages from './pages';

function App() {
  return (
    <Router>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        preventDuplicate
      >
        <AuthProvider>
          <Pages />
        </AuthProvider>
      </SnackbarProvider>
    </Router>
  );
}

export default App;
