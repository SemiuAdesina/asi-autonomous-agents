'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRocket, faShieldAlt, faCogs, faNetworkWired, faBrain } from '@fortawesome/free-solid-svg-icons'

const Features = () => {
  const features = [
    {
      icon: faBrain,
      title: 'Autonomous Intelligence',
      description: 'Agents make independent decisions using advanced AI reasoning and MeTTa knowledge graphs.',
      benefits: ['Self-learning algorithms', 'Contextual understanding', 'Adaptive behavior']
    },
    {
      icon: faNetworkWired,
      title: 'Decentralized Communication',
      description: 'Seamless agent-to-agent communication across distributed networks with real-time messaging.',
      benefits: ['Peer-to-peer messaging', 'Fault tolerance', 'Scalable architecture']
    },
    {
      icon: faShieldAlt,
      title: 'Web3 Security',
      description: 'Built on blockchain technology with cryptographic security and transparent operations.',
      benefits: ['Immutable records', 'Cryptographic verification', 'Decentralized governance']
    },
    {
      icon: faCogs,
      title: 'Agentverse Integration',
      description: 'Deployed on Agentverse registry with ASI:One compatibility for seamless discovery.',
      benefits: ['Agent discovery', 'Service orchestration', 'Cross-platform compatibility']
    },
    {
      icon: faRocket,
      title: 'Real-time Processing',
      description: 'Lightning-fast execution with sub-second response times and continuous operation.',
      benefits: ['Low latency', 'High throughput', '24/7 availability']
    },
    {
      icon: faCheckCircle,
      title: 'Production Ready',
      description: 'Enterprise-grade reliability with comprehensive monitoring and error handling.',
      benefits: ['Health monitoring', 'Auto-recovery', 'Performance metrics']
    }
  ]

  return (
    <section id="features" className="py-20 bg-dark-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="glow-text font-orbitron">Platform Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
            Discover the powerful capabilities that make our autonomous agents 
            the future of decentralized AI systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="cyber-card p-8 group hover:border-primary-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={feature.icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-primary-300 transition-colors font-exo">
                  {feature.title}
                </h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed font-rajdhani">
                {feature.description}
              </p>

              <div className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    <span className="text-sm text-gray-300 font-rajdhani">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="cyber-card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">
              Ready to Experience the Future?
            </h3>
            <p className="text-gray-300 mb-6 font-rajdhani">
              Join the ASI Alliance ecosystem and deploy your own autonomous agents today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                className="cyber-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://agentverse.ai/', '_blank')}
              >
                Deploy Your Agent
              </motion.button>
              <motion.button 
                className="px-8 py-3 border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://docs.fetch.ai/', '_blank')}
              >
                View Documentation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
