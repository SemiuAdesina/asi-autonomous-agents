import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AgentProvider } from '../contexts/AgentContext'
import { Web3Provider } from '../contexts/Web3Context'
import { AuthProvider } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthProvider>
        <Web3Provider>
          <AgentProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-dark-900">
                <Component {...pageProps} />
                <ToastContainer 
                  position="top-center"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                  limit={3}
                  toastStyle={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    backdropFilter: 'blur(10px)',
                    width: '90%',
                    maxWidth: '400px',
                    fontSize: '14px',
                  }}
                  toastClassName="toast-mobile-friendly"
                  progressStyle={{
                    background: 'rgba(124, 58, 237, 0.5)',
                  }}
                />
              </div>
            </ErrorBoundary>
          </AgentProvider>
        </Web3Provider>
      </AuthProvider>
    </>
  )
}
