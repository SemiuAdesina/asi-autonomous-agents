'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCode, 
  faShieldAlt, 
  faExclamationTriangle, 
  faCheckCircle, 
  faTimesCircle,
  faEye,
  faDownload,
  faUpload,
  faCog,
  faBug,
  faLightbulb,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import apiService from '../services/api'

interface Vulnerability {
  id: string
  tool: string
  severity: string
  description: string
  line?: number
  function?: string
  impact?: string
  title?: string
  swc_id?: string
}

interface AuditReport {
  contract_name: string
  language: string
  audit_date: string
  security_score: number
  vulnerabilities: Vulnerability[]
  recommendations: any[]
  tool_results: any
  summary: {
    risk_level: string
    status: string
    total_vulnerabilities: number
    critical_issues: number
    high_issues: number
    medium_issues: number
    recommendation: string
  }
}

interface AuditTemplate {
  name: string
  description: string
  checks: string[]
}

const SmartContractAuditor = () => {
  const { token } = useAuth()
  const [contractCode, setContractCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('solidity')
  const [contractName, setContractName] = useState('')
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [templates, setTemplates] = useState<Record<string, AuditTemplate>>({})
  const [vulnerabilities, setVulnerabilities] = useState<Record<string, any>>({})
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    loadTemplates()
    loadVulnerabilities()
  }, [])

  const loadTemplates = async () => {
    try {
      const result = await apiService.getAuditTemplates()
      setTemplates(result.templates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadVulnerabilities = async () => {
    try {
      const result = await apiService.getAuditVulnerabilities()
      setVulnerabilities(result.vulnerabilities)
    } catch (error) {
      console.error('Failed to load vulnerabilities:', error)
    }
  }

  const validateCode = async () => {
    if (!contractCode.trim()) {
      toast.error('Please enter contract code')
      return
    }

    try {
      setIsValidating(true)
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://asi-backend-new.onrender.com'
      const response = await fetch(`${backendUrl}/api/audit/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contract_code: contractCode,
          language: selectedLanguage
        })
      })

      if (response.ok) {
        const result = await response.json()
        setValidationResult(result)
        if (result.is_valid) {
          toast.success('Contract code is valid!')
        } else {
          toast.warning('Contract code has validation errors')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to validate code')
      }
    } catch (error) {
      toast.error('Failed to validate contract code')
    } finally {
      setIsValidating(false)
    }
  }

  const auditContract = async () => {
    if (!contractCode.trim()) {
      toast.error('Please enter contract code')
      return
    }

    try {
      setIsAuditing(true)
      
      const result = await apiService.auditContract({
        contract_code: contractCode,
        language: selectedLanguage,
        contract_name: contractName || undefined
      })
      
      setAuditReport(result.audit_report)
      toast.success('Contract audit completed successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to audit contract')
    } finally {
      setIsAuditing(false)
    }
  }

  const loadSampleContract = (template: string) => {
    const samples: Record<string, string> = {
      'erc20_token': `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SampleToken is ERC20, ReentrancyGuard {
    address public owner;
    mapping(address => bool) public whitelist;
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(whitelist[msg.sender] || whitelist[to], "Not whitelisted");
        return super.transfer(to, amount);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}`,
      'defi_protocol': `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DeFiProtocol is ReentrancyGuard, Pausable {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastDepositTime;
    
    uint256 public totalLiquidity;
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_DEPOSIT, "Minimum deposit not met");
        
        balances[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        lastDepositTime[msg.sender] = block.timestamp;
        
        emit Deposited(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(block.timestamp >= lastDepositTime[msg.sender] + 1 days, "Lock period active");
        
        balances[msg.sender] -= amount;
        totalLiquidity -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
}`
    }
    
    setContractCode(samples[template] || '')
    setShowTemplates(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/20'
      case 'high':
        return 'text-orange-400 bg-orange-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'low':
        return 'text-blue-400 bg-blue-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="cyber-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white font-orbitron">Smart Contract Auditor</h2>
        </div>
        <button
          onClick={() => setShowTemplates(true)}
          className="px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faEye} className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Templates</span>
        </button>
      </div>

      {/* Contract Input */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
            >
              <option value="solidity">Solidity</option>
              <option value="vyper">Vyper</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contract Name</label>
            <input
              type="text"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm sm:text-base"
              placeholder="MyContract"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={validateCode}
              disabled={isValidating}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
            <button
              onClick={auditContract}
              disabled={isAuditing}
              className="flex-1 px-3 sm:px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
            >
              {isAuditing ? 'Auditing...' : 'Audit'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contract Code</label>
          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            className="w-full h-48 sm:h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono text-xs sm:text-sm"
            placeholder="Paste your smart contract code here..."
          />
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg border"
        >
          <div className="flex items-center space-x-2 mb-3">
            <FontAwesomeIcon 
              icon={validationResult.is_valid ? faCheckCircle : faTimesCircle} 
              className={`w-5 h-5 ${validationResult.is_valid ? 'text-green-400' : 'text-red-400'}`} 
            />
            <h3 className="text-lg font-semibold text-white">
              Validation Result
            </h3>
          </div>
          
          <div className="text-sm text-gray-300 mb-2">
            Status: <span className={validationResult.is_valid ? 'text-green-400' : 'text-red-400'}>
              {validationResult.is_valid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          
          {validationResult.errors && validationResult.errors.length > 0 && (
            <div className="mt-3">
              <h4 className="text-white font-medium mb-2">Errors:</h4>
              <ul className="space-y-1">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-400 text-sm">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Audit Report */}
      {auditReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Audit Summary</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <div className={`text-2xl sm:text-3xl font-bold ${getSecurityScoreColor(auditReport.security_score)}`}>
                    {auditReport.security_score}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Security Score</div>
                </div>
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  auditReport.summary.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                  auditReport.summary.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  auditReport.summary.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {auditReport.summary.risk_level.toUpperCase()} RISK
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">{auditReport.summary.total_vulnerabilities}</div>
                <div className="text-xs sm:text-sm text-gray-400">Total Issues</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-400">{auditReport.summary.critical_issues}</div>
                <div className="text-xs sm:text-sm text-gray-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-orange-400">{auditReport.summary.high_issues}</div>
                <div className="text-xs sm:text-sm text-gray-400">High</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-400">{auditReport.summary.medium_issues}</div>
                <div className="text-xs sm:text-sm text-gray-400">Medium</div>
              </div>
            </div>
          </div>

          {/* Vulnerabilities */}
          {auditReport.vulnerabilities.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                <span>Vulnerabilities Found</span>
              </h3>
              <div className="space-y-3">
                {auditReport.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400">{vuln.tool}</span>
                        {vuln.swc_id && (
                          <span className="text-xs text-gray-500 font-mono">{vuln.swc_id}</span>
                        )}
                      </div>
                      {vuln.line && (
                        <span className="text-xs sm:text-sm text-gray-400">Line {vuln.line}</span>
                      )}
                    </div>
                    
                    <h4 className="text-white font-medium mb-2 text-sm sm:text-base">
                      {vuln.title || vuln.description}
                    </h4>
                    
                    {vuln.impact && (
                      <p className="text-gray-300 text-xs sm:text-sm mb-2">{vuln.impact}</p>
                    )}
                    
                    {vuln.function && (
                      <p className="text-gray-400 text-xs sm:text-sm font-mono">Function: {vuln.function}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {auditReport.recommendations.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span>Recommendations</span>
              </h3>
              <div className="space-y-3">
                {auditReport.recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700">
                    <h4 className="text-white font-medium mb-2 text-sm sm:text-base">{rec.title}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm mb-3">{rec.description}</p>
                    {rec.code_example && (
                      <div className="bg-gray-900 p-2 sm:p-3 rounded border">
                        <code className="text-green-400 text-xs sm:text-sm font-mono">{rec.code_example}</code>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowTemplates(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-800 p-4 sm:p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Audit Templates</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(templates).map(([key, template]) => (
                <div key={key} className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-2 text-sm sm:text-base">{template.name}</h4>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3">{template.description}</p>
                  <div className="mb-4">
                    <h5 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Security Checks:</h5>
                    <ul className="space-y-1">
                      {template.checks.map((check, index) => (
                        <li key={index} className="text-gray-300 text-xs sm:text-sm">• {check.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => loadSampleContract(key)}
                    className="w-full px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors duration-200 text-sm sm:text-base"
                  >
                    Load Sample
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowTemplates(false)}
                className="w-full px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default SmartContractAuditor
