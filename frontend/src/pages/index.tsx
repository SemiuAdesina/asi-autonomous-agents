import Head from 'next/head'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import AgentGrid from '../components/AgentGrid'
import Features from '../components/Features'
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%233B82F6'/><stop offset='100%' style='stop-color:%231D4ED8'/></linearGradient></defs><rect width='32' height='32' rx='6' fill='url(%23grad)'/><path d='M8 10h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z' fill='white' opacity='0.9'/><circle cx='12' cy='16' r='2' fill='url(%23grad)'/><circle cx='20' cy='16' r='2' fill='url(%23grad)'/><rect x='12' y='18' width='8' height='2' rx='1' fill='url(%23grad)'/><path d='M14 6h4v2h-4z' fill='white' opacity='0.7'/></svg>" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
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
        

        
        <Network />
        <Features />
        <Footer />
      </motion.main>
    </MobileMenuProvider>
  )
}
