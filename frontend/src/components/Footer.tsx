'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faTwitter, faDiscord, faTelegram } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const socialLinks = [
    { icon: faGithub, href: '#', label: 'GitHub' },
    { icon: faTwitter, href: '#', label: 'Twitter' },
    { icon: faDiscord, href: '#', label: 'Discord' },
    { icon: faTelegram, href: '#', label: 'Telegram' }
  ]

  const quickLinks = [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Agent Registry', href: '#' },
    { name: 'Community', href: '#' }
  ]

  const resources = [
    { name: 'Getting Started', href: '#' },
    { name: 'Tutorials', href: '#' },
    { name: 'Examples', href: '#' },
    { name: 'Support', href: '#' }
  ]

  return (
    <footer className="bg-dark-900 border-t border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold glow-text font-orbitron">ASI Agents</span>
            </div>
            <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed font-rajdhani text-sm sm:text-base">
              Building the future of decentralized AI with autonomous agents 
              that perceive, reason, and act across Web3 systems.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-dark-800 hover:bg-primary-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-400 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <FontAwesomeIcon icon={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 font-exo">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm sm:text-base"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 font-exo">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm sm:text-base"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 font-exo">Contact</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:contact@asi-agents.com"
                  className="text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm sm:text-base break-all"
                >
                  contact@asi-agents.com
                </a>
              </div>
              <div className="text-gray-300 text-xs sm:text-sm">
                <p>ASI Alliance Hackathon</p>
                <p>Decentralized AI Platform</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-700/50 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-gray-400 text-xs sm:text-sm mb-3 md:mb-0 text-center md:text-left">
            © {currentYear} ASI Autonomous Agents Platform. Built for the ASI Alliance Hackathon.
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
              License
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
