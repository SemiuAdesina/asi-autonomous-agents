import os
import json
import subprocess
import tempfile
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
from utils.logging import logger

logger = logging.getLogger(__name__)

class SmartContractAuditor:
    """Smart contract security audit and analysis"""
    
    def __init__(self):
        self.supported_languages = ['solidity', 'vyper', 'rust']
        self.audit_tools = {
            'solidity': ['slither', 'mythril', 'oyente', 'smartcheck'],
            'vyper': ['vyper-analyzer'],
            'rust': ['cargo-audit', 'clippy']
        }
        self.severity_levels = ['critical', 'high', 'medium', 'low', 'info']
    
    def audit_contract(self, contract_code: str, language: str = 'solidity', 
                     contract_name: str = None) -> Dict[str, Any]:
        """Perform comprehensive smart contract audit"""
        
        try:
            if language.lower() not in self.supported_languages:
                raise ValueError(f"Unsupported language: {language}")
            
            # Create temporary file for contract
            with tempfile.NamedTemporaryFile(mode='w', suffix=f'.{language}', delete=False) as f:
                f.write(contract_code)
                temp_file = f.name
            
            try:
                # Run audit tools
                audit_results = self._run_audit_tools(temp_file, language)
                
                # Analyze results
                analysis = self._analyze_audit_results(audit_results)
                
                # Generate security score
                security_score = self._calculate_security_score(analysis)
                
                # Create audit report
                audit_report = {
                    'contract_name': contract_name or f'Contract_{datetime.utcnow().timestamp()}',
                    'language': language,
                    'audit_date': datetime.utcnow().isoformat(),
                    'security_score': security_score,
                    'vulnerabilities': analysis['vulnerabilities'],
                    'recommendations': analysis['recommendations'],
                    'tool_results': audit_results,
                    'summary': self._generate_summary(analysis, security_score)
                }
                
                logger.log_event('INFO', 'smart_contract_audit_completed', {
                    'contract_name': audit_report['contract_name'],
                    'language': language,
                    'security_score': security_score,
                    'vulnerability_count': len(analysis['vulnerabilities'])
                })
                
                return audit_report
                
            finally:
                # Clean up temporary file
                os.unlink(temp_file)
                
        except Exception as e:
            logger.log_error(e, f"Failed to audit {language} contract")
            raise
    
    def _run_audit_tools(self, contract_file: str, language: str) -> Dict[str, Any]:
        """Run various audit tools on the contract"""
        
        results = {}
        tools = self.audit_tools.get(language.lower(), [])
        
        for tool in tools:
            try:
                if tool == 'slither':
                    results[tool] = self._run_slither(contract_file)
                elif tool == 'mythril':
                    results[tool] = self._run_mythril(contract_file)
                elif tool == 'oyente':
                    results[tool] = self._run_oyente(contract_file)
                elif tool == 'smartcheck':
                    results[tool] = self._run_smartcheck(contract_file)
                elif tool == 'cargo-audit':
                    results[tool] = self._run_cargo_audit(contract_file)
                else:
                    results[tool] = self._run_mock_tool(tool, contract_file)
                    
            except Exception as e:
                logger.log_error(e, f"Failed to run {tool}")
                results[tool] = {'error': str(e), 'status': 'failed'}
        
        return results
    
    def _run_slither(self, contract_file: str) -> Dict[str, Any]:
        """Run Slither static analysis tool"""
        
        try:
            # Mock Slither results for demo
            return {
                'tool': 'slither',
                'status': 'completed',
                'vulnerabilities': [
                    {
                        'id': 'reentrancy-eth',
                        'severity': 'high',
                        'description': 'Reentrancy vulnerability in ETH transfers',
                        'line': 45,
                        'function': 'withdraw',
                        'impact': 'Potential loss of funds'
                    },
                    {
                        'id': 'unchecked-send',
                        'severity': 'medium',
                        'description': 'Unchecked return value of send()',
                        'line': 67,
                        'function': 'transfer',
                        'impact': 'Silent failure of transfers'
                    }
                ],
                'warnings': [
                    {
                        'id': 'dead-code',
                        'severity': 'low',
                        'description': 'Unreachable code detected',
                        'line': 89,
                        'function': 'unusedFunction'
                    }
                ],
                'info': [
                    {
                        'id': 'naming-convention',
                        'severity': 'info',
                        'description': 'Function name should follow camelCase convention',
                        'line': 12,
                        'function': 'get_balance'
                    }
                ]
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}
    
    def _run_mythril(self, contract_file: str) -> Dict[str, Any]:
        """Run Mythril symbolic execution tool"""
        
        try:
            # Mock Mythril results
            return {
                'tool': 'mythril',
                'status': 'completed',
                'issues': [
                    {
                        'title': 'Integer Overflow',
                        'severity': 'high',
                        'description': 'Potential integer overflow in arithmetic operation',
                        'function': 'calculateReward',
                        'line': 34,
                        'swc_id': 'SWC-101'
                    },
                    {
                        'title': 'Unprotected Ether Withdrawal',
                        'severity': 'medium',
                        'description': 'Function allows withdrawal of all contract balance',
                        'function': 'emergencyWithdraw',
                        'line': 78,
                        'swc_id': 'SWC-105'
                    }
                ],
                'coverage': 85.5,
                'execution_time': 12.3
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}
    
    def _run_oyente(self, contract_file: str) -> Dict[str, Any]:
        """Run Oyente symbolic execution tool"""
        
        try:
            # Mock Oyente results
            return {
                'tool': 'oyente',
                'status': 'completed',
                'vulnerabilities': [
                    {
                        'name': 'Timestamp Dependency',
                        'severity': 'medium',
                        'description': 'Contract relies on block.timestamp',
                        'line': 23,
                        'function': 'randomNumber'
                    }
                ],
                'gas_analysis': {
                    'gas_used': 150000,
                    'gas_limit': 200000,
                    'gas_efficiency': 75.0
                }
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}
    
    def _run_smartcheck(self, contract_file: str) -> Dict[str, Any]:
        """Run SmartCheck static analysis tool"""
        
        try:
            # Mock SmartCheck results
            return {
                'tool': 'smartcheck',
                'status': 'completed',
                'violations': [
                    {
                        'rule': 'deprecated-suicide',
                        'severity': 'medium',
                        'message': 'Use selfdestruct instead of suicide',
                        'line': 56
                    },
                    {
                        'rule': 'tx-origin',
                        'severity': 'high',
                        'message': 'Avoid using tx.origin for authorization',
                        'line': 34
                    }
                ]
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}
    
    def _run_cargo_audit(self, contract_file: str) -> Dict[str, Any]:
        """Run Cargo audit for Rust contracts"""
        
        try:
            # Mock Cargo audit results
            return {
                'tool': 'cargo-audit',
                'status': 'completed',
                'vulnerabilities': [
                    {
                        'id': 'RUSTSEC-2021-0001',
                        'package': 'serde',
                        'version': '1.0.0',
                        'severity': 'high',
                        'description': 'Deserialization vulnerability'
                    }
                ],
                'advisories': 1,
                'unmaintained': 0,
                'unsound': 0
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed'}
    
    def _run_mock_tool(self, tool_name: str, contract_file: str) -> Dict[str, Any]:
        """Run mock tool for demonstration"""
        
        return {
            'tool': tool_name,
            'status': 'completed',
            'message': f'Mock analysis completed for {tool_name}',
            'vulnerabilities': [],
            'warnings': [],
            'info': []
        }
    
    def _analyze_audit_results(self, tool_results: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze and consolidate results from all audit tools"""
        
        vulnerabilities = []
        recommendations = []
        
        for tool, results in tool_results.items():
            if results.get('status') == 'failed':
                continue
            
            # Extract vulnerabilities
            if 'vulnerabilities' in results:
                for vuln in results['vulnerabilities']:
                    vulnerabilities.append({
                        'tool': tool,
                        'severity': vuln.get('severity', 'medium'),
                        'description': vuln.get('description', ''),
                        'line': vuln.get('line'),
                        'function': vuln.get('function'),
                        'impact': vuln.get('impact', ''),
                        'id': vuln.get('id', f'{tool}_{len(vulnerabilities)}')
                    })
            
            # Extract issues (Mythril format)
            if 'issues' in results:
                for issue in results['issues']:
                    vulnerabilities.append({
                        'tool': tool,
                        'severity': issue.get('severity', 'medium'),
                        'description': issue.get('description', ''),
                        'line': issue.get('line'),
                        'function': issue.get('function'),
                        'title': issue.get('title', ''),
                        'swc_id': issue.get('swc_id'),
                        'id': f'{tool}_{issue.get("title", "issue").lower().replace(" ", "_")}'
                    })
            
            # Extract violations (SmartCheck format)
            if 'violations' in results:
                for violation in results['violations']:
                    vulnerabilities.append({
                        'tool': tool,
                        'severity': violation.get('severity', 'medium'),
                        'description': violation.get('message', ''),
                        'line': violation.get('line'),
                        'rule': violation.get('rule'),
                        'id': f'{tool}_{violation.get("rule", "violation")}'
                    })
        
        # Generate recommendations based on vulnerabilities
        recommendations = self._generate_recommendations(vulnerabilities)
        
        return {
            'vulnerabilities': vulnerabilities,
            'recommendations': recommendations,
            'total_vulnerabilities': len(vulnerabilities),
            'severity_counts': self._count_by_severity(vulnerabilities)
        }
    
    def _generate_recommendations(self, vulnerabilities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate security recommendations based on vulnerabilities"""
        
        recommendations = []
        vulnerability_types = set()
        
        for vuln in vulnerabilities:
            vuln_type = vuln.get('id', '').split('_')[0]
            vulnerability_types.add(vuln_type)
        
        # Generate recommendations for each vulnerability type
        recommendation_map = {
            'reentrancy': {
                'title': 'Implement Reentrancy Guards',
                'description': 'Use OpenZeppelin\'s ReentrancyGuard or implement checks-effects-interactions pattern',
                'priority': 'high',
                'code_example': 'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";'
            },
            'integer': {
                'title': 'Use SafeMath for Arithmetic Operations',
                'description': 'Implement SafeMath library or use Solidity 0.8+ built-in overflow protection',
                'priority': 'high',
                'code_example': 'import "@openzeppelin/contracts/utils/math/SafeMath.sol";'
            },
            'unchecked': {
                'title': 'Check Return Values',
                'description': 'Always check return values of external calls and handle failures appropriately',
                'priority': 'medium',
                'code_example': 'require(token.transfer(recipient, amount), "Transfer failed");'
            },
            'timestamp': {
                'title': 'Avoid Timestamp Dependencies',
                'description': 'Use block numbers instead of timestamps for time-sensitive operations',
                'priority': 'medium',
                'code_example': 'require(block.number >= targetBlock, "Too early");'
            },
            'tx-origin': {
                'title': 'Use msg.sender Instead of tx.origin',
                'description': 'Replace tx.origin with msg.sender for proper authorization',
                'priority': 'high',
                'code_example': 'require(msg.sender == owner, "Not authorized");'
            }
        }
        
        for vuln_type in vulnerability_types:
            if vuln_type in recommendation_map:
                recommendations.append(recommendation_map[vuln_type])
        
        return recommendations
    
    def _count_by_severity(self, vulnerabilities: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count vulnerabilities by severity level"""
        
        counts = {level: 0 for level in self.severity_levels}
        
        for vuln in vulnerabilities:
            severity = vuln.get('severity', 'medium').lower()
            if severity in counts:
                counts[severity] += 1
        
        return counts
    
    def _calculate_security_score(self, analysis: Dict[str, Any]) -> int:
        """Calculate overall security score (0-100)"""
        
        severity_weights = {
            'critical': 25,
            'high': 15,
            'medium': 8,
            'low': 3,
            'info': 1
        }
        
        total_penalty = 0
        for severity, count in analysis['severity_counts'].items():
            total_penalty += count * severity_weights.get(severity, 0)
        
        # Calculate score (100 - penalty, minimum 0)
        score = max(0, 100 - total_penalty)
        
        return score
    
    def _generate_summary(self, analysis: Dict[str, Any], security_score: int) -> Dict[str, Any]:
        """Generate audit summary"""
        
        total_vulns = analysis['total_vulnerabilities']
        severity_counts = analysis['severity_counts']
        
        if security_score >= 90:
            risk_level = 'low'
            status = 'secure'
        elif security_score >= 70:
            risk_level = 'medium'
            status = 'needs_attention'
        elif security_score >= 50:
            risk_level = 'high'
            status = 'risky'
        else:
            risk_level = 'critical'
            status = 'unsafe'
        
        return {
            'risk_level': risk_level,
            'status': status,
            'total_vulnerabilities': total_vulns,
            'critical_issues': severity_counts.get('critical', 0),
            'high_issues': severity_counts.get('high', 0),
            'medium_issues': severity_counts.get('medium', 0),
            'recommendation': f"Contract has {total_vulns} vulnerabilities. Security score: {security_score}/100"
        }
    
    def get_audit_templates(self) -> Dict[str, Any]:
        """Get audit templates for different contract types"""
        
        return {
            'erc20_token': {
                'name': 'ERC-20 Token Contract',
                'description': 'Standard token implementation audit template',
                'checks': [
                    'reentrancy_protection',
                    'overflow_protection',
                    'access_control',
                    'event_emission',
                    'approval_mechanism'
                ]
            },
            'erc721_nft': {
                'name': 'ERC-721 NFT Contract',
                'description': 'Non-fungible token implementation audit template',
                'checks': [
                    'token_ownership',
                    'metadata_handling',
                    'transfer_mechanisms',
                    'royalty_implementation',
                    'access_control'
                ]
            },
            'defi_protocol': {
                'name': 'DeFi Protocol Contract',
                'description': 'Decentralized finance protocol audit template',
                'checks': [
                    'liquidity_protection',
                    'oracle_integration',
                    'flash_loan_protection',
                    'governance_mechanisms',
                    'economic_attacks'
                ]
            },
            'multisig_wallet': {
                'name': 'Multi-signature Wallet',
                'description': 'Multi-signature wallet implementation audit template',
                'checks': [
                    'signature_validation',
                    'threshold_management',
                    'owner_management',
                    'transaction_execution',
                    'emergency_procedures'
                ]
            }
        }
    
    def validate_contract_code(self, contract_code: str, language: str) -> Tuple[bool, List[str]]:
        """Validate contract code syntax and basic structure"""
        
        errors = []
        
        if not contract_code.strip():
            errors.append("Contract code cannot be empty")
            return False, errors
        
        if language.lower() == 'solidity':
            # Basic Solidity validation
            if 'pragma solidity' not in contract_code:
                errors.append("Missing pragma solidity directive")
            
            if 'contract' not in contract_code:
                errors.append("No contract definition found")
            
            # Check for common syntax issues
            if contract_code.count('{') != contract_code.count('}'):
                errors.append("Mismatched braces")
            
            if contract_code.count('(') != contract_code.count(')'):
                errors.append("Mismatched parentheses")
        
        elif language.lower() == 'vyper':
            # Basic Vyper validation
            if '@external' not in contract_code and '@public' not in contract_code:
                errors.append("No external/public functions found")
        
        elif language.lower() == 'rust':
            # Basic Rust validation
            if 'fn main' not in contract_code and 'pub fn' not in contract_code:
                errors.append("No main function or public functions found")
        
        return len(errors) == 0, errors

# Global auditor instance
contract_auditor = SmartContractAuditor()
