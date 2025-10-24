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
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                  toastStyle={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    color: '#fff',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    backdropFilter: 'blur(10px)',
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
