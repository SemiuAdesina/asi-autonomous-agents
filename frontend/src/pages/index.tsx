import Head from 'next/head'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import AgentGrid from '../components/AgentGrid'
import Features from '../components/Features'
import AgentChat from '../components/AgentChat'
import Web3Integration from '../components/Web3Integration'
import Network from '../components/Network'
import Footer from '../components/Footer'
import MatrixBackground from '../components/MatrixBackground'
import { MobileMenuProvider } from '../contexts/MobileMenuContext'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <MobileMenuProvider>
      <Head>
        <title>ASI Autonomous Agents Platform</title>
        <meta name="description" content="Decentralized AI ecosystem with autonomous agents powered by ASI Alliance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MatrixBackground />
      
      <motion.main 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <Header />
        <Hero />
        <AgentGrid />
        
        {/* Interactive Section */}
        <section className="py-20 bg-dark-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AgentChat />
              <Web3Integration />
            </div>
          </div>
        </section>
        
        <Network />
        <Features />
        <Footer />
      </motion.main>
    </MobileMenuProvider>
  )
}
