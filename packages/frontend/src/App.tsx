import { BrowserRouter as Router } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Pages from './pages';
import AuthProvider from './context/AuthProvider';

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
