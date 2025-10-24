from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.smart_contract_auditor import contract_auditor
from utils.logging import logger
from utils.sanitization import require_sanitized_input, validate_input_schema, InputSanitizer
from datetime import datetime
import json

audit_bp = Blueprint('audit', __name__)

# Validation schemas for audit operations
AUDIT_SCHEMAS = {
    'audit_contract': {
        'contract_code': {
            'required': True,
            'type': str,
            'min_length': 10,
            'max_length': 100000
        },
        'language': {
            'required': True,
            'type': str,
            'pattern': r'^(solidity|vyper|rust)$'
        },
        'contract_name': {
            'required': False,
            'type': str,
            'max_length': 100
        }
    },
    'validate_code': {
        'contract_code': {
            'required': True,
            'type': str,
            'min_length': 10,
            'max_length': 100000
        },
        'language': {
            'required': True,
            'type': str,
            'pattern': r'^(solidity|vyper|rust)$'
        }
    }
}

@audit_bp.route('/contract', methods=['POST'])
# @jwt_required()
@require_sanitized_input
@validate_input_schema(AUDIT_SCHEMAS['audit_contract'])
def audit_smart_contract():
    """Perform comprehensive smart contract audit"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = None  # get_jwt_identity()
        
        contract_code = data['contract_code']
        language = data['language']
        contract_name = data.get('contract_name')
        
        # Validate contract code first
        is_valid, validation_errors = contract_auditor.validate_contract_code(
            contract_code, language
        )
        
        if not is_valid:
            return jsonify({
                'error': 'Contract code validation failed',
                'validation_errors': validation_errors
            }), 400
        
        # Perform audit
        audit_report = contract_auditor.audit_contract(
            contract_code=contract_code,
            language=language,
            contract_name=contract_name
        )
        
        # Log audit completion
        logger.log_event('INFO', 'smart_contract_audit_requested', {
            'user_id': user_id,
            'contract_name': contract_name,
            'language': language,
            'security_score': audit_report['security_score'],
            'vulnerability_count': audit_report['summary']['total_vulnerabilities']
        })
        
        return jsonify({
            'message': 'Contract audit completed successfully',
            'audit_report': audit_report
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to audit smart contract")
        return jsonify({'error': 'Failed to audit smart contract'}), 500

@audit_bp.route('/validate', methods=['POST'])
# @jwt_required()
@require_sanitized_input
@validate_input_schema(AUDIT_SCHEMAS['validate_code'])
def validate_contract_code():
    """Validate smart contract code syntax and structure"""
    try:
        data = getattr(g, 'sanitized_data', request.get_json())
        user_id = None  # get_jwt_identity()
        
        contract_code = data['contract_code']
        language = data['language']
        
        # Validate contract code
        is_valid, errors = contract_auditor.validate_contract_code(
            contract_code, language
        )
        
        # Log validation request
        logger.log_event('INFO', 'contract_validation_requested', {
            'user_id': user_id,
            'language': language,
            'is_valid': is_valid,
            'error_count': len(errors)
        })
        
        return jsonify({
            'is_valid': is_valid,
            'errors': errors,
            'language': language,
            'code_length': len(contract_code)
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to validate contract code")
        return jsonify({'error': 'Failed to validate contract code'}), 500

@audit_bp.route('/templates', methods=['GET'])
# @jwt_required()
def get_audit_templates():
    """Get available audit templates for different contract types"""
    try:
        templates = contract_auditor.get_audit_templates()
        
        return jsonify({
            'templates': templates,
            'supported_languages': contract_auditor.supported_languages,
            'audit_tools': contract_auditor.audit_tools
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to get audit templates")
        return jsonify({'error': 'Failed to get audit templates'}), 500

@audit_bp.route('/vulnerabilities', methods=['GET'])
# @jwt_required()
def get_common_vulnerabilities():
    """Get information about common smart contract vulnerabilities"""
    try:
        vulnerabilities = {
            'reentrancy': {
                'name': 'Reentrancy Attack',
                'severity': 'high',
                'description': 'External calls can be exploited to re-enter the contract and drain funds',
                'prevention': 'Use checks-effects-interactions pattern or ReentrancyGuard',
                'example': 'function withdraw() external { require(balances[msg.sender] > 0); msg.sender.call{value: balances[msg.sender]}(""); balances[msg.sender] = 0; }'
            },
            'integer_overflow': {
                'name': 'Integer Overflow/Underflow',
                'severity': 'high',
                'description': 'Arithmetic operations can overflow, causing unexpected behavior',
                'prevention': 'Use SafeMath library or Solidity 0.8+ built-in protection',
                'example': 'uint256 result = a + b; // Can overflow if a + b > 2^256 - 1'
            },
            'unchecked_call': {
                'name': 'Unchecked External Call',
                'severity': 'medium',
                'description': 'External calls can fail silently if return values are not checked',
                'prevention': 'Always check return values of external calls',
                'example': 'token.transfer(recipient, amount); // Should check return value'
            },
            'timestamp_dependency': {
                'name': 'Timestamp Dependency',
                'severity': 'medium',
                'description': 'Using block.timestamp for randomness or time-sensitive operations',
                'prevention': 'Use block numbers or commit-reveal schemes for randomness',
                'example': 'uint256 random = block.timestamp % 100; // Predictable'
            },
            'tx_origin': {
                'name': 'Transaction Origin Usage',
                'severity': 'high',
                'description': 'Using tx.origin for authorization can be bypassed',
                'prevention': 'Use msg.sender instead of tx.origin',
                'example': 'require(tx.origin == owner); // Vulnerable to phishing'
            },
            'gas_limit': {
                'name': 'Gas Limit DoS',
                'severity': 'medium',
                'description': 'Loops or operations that can exceed gas limit',
                'prevention': 'Limit loop iterations or use pagination',
                'example': 'for(uint i = 0; i < users.length; i++) { // Can exceed gas limit }'
            },
            'front_running': {
                'name': 'Front Running',
                'severity': 'medium',
                'description': 'Transactions can be front-run to exploit price differences',
                'prevention': 'Use commit-reveal schemes or time delays',
                'example': 'buyTokens(amount); // Price can change before execution'
            },
            'denial_of_service': {
                'name': 'Denial of Service',
                'severity': 'medium',
                'description': 'Contract can be made unusable by external factors',
                'prevention': 'Implement circuit breakers and emergency stops',
                'example': 'External dependency failure can break contract functionality'
            }
        }
        
        return jsonify({
            'vulnerabilities': vulnerabilities,
            'severity_levels': contract_auditor.severity_levels,
            'total_count': len(vulnerabilities)
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to get vulnerability information")
        return jsonify({'error': 'Failed to get vulnerability information'}), 500

@audit_bp.route('/best-practices', methods=['GET'])
@jwt_required()
def get_best_practices():
    """Get smart contract development best practices"""
    try:
        best_practices = {
            'security': [
                'Use established libraries like OpenZeppelin',
                'Implement proper access controls',
                'Validate all inputs and outputs',
                'Use checks-effects-interactions pattern',
                'Implement emergency stop mechanisms',
                'Use multi-signature wallets for admin functions',
                'Regular security audits and testing'
            ],
            'gas_optimization': [
                'Use appropriate data types (uint8 vs uint256)',
                'Pack structs efficiently',
                'Use events instead of storage for logs',
                'Implement batch operations',
                'Use libraries for common functions',
                'Optimize loops and iterations',
                'Use assembly for critical operations'
            ],
            'code_quality': [
                'Follow naming conventions',
                'Add comprehensive comments',
                'Use NatSpec documentation',
                'Implement proper error handling',
                'Use events for important state changes',
                'Modularize code into libraries',
                'Write comprehensive tests'
            ],
            'testing': [
                'Unit tests for all functions',
                'Integration tests for workflows',
                'Fuzz testing for edge cases',
                'Formal verification for critical functions',
                'Gas usage testing',
                'Security testing with tools',
                'Test on multiple networks'
            ]
        }
        
        return jsonify({
            'best_practices': best_practices,
            'categories': list(best_practices.keys())
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to get best practices")
        return jsonify({'error': 'Failed to get best practices'}), 500

@audit_bp.route('/tools', methods=['GET'])
def get_audit_tools():
    """Get information about available audit tools"""
    try:
        tools_info = {
            'static_analysis': {
                'slither': {
                    'name': 'Slither',
                    'description': 'Static analysis framework for Solidity',
                    'capabilities': ['vulnerability_detection', 'gas_optimization', 'code_quality'],
                    'supported_languages': ['solidity'],
                    'website': 'https://github.com/crytic/slither'
                },
                'mythril': {
                    'name': 'Mythril',
                    'description': 'Symbolic execution tool for Ethereum smart contracts',
                    'capabilities': ['symbolic_execution', 'vulnerability_detection', 'coverage_analysis'],
                    'supported_languages': ['solidity', 'vyper'],
                    'website': 'https://github.com/ConsenSys/mythril'
                },
                'oyente': {
                    'name': 'Oyente',
                    'description': 'Symbolic execution tool for smart contracts',
                    'capabilities': ['vulnerability_detection', 'gas_analysis'],
                    'supported_languages': ['solidity'],
                    'website': 'https://github.com/melonproject/oyente'
                }
            },
            'dynamic_analysis': {
                'echidna': {
                    'name': 'Echidna',
                    'description': 'Property-based testing tool for Ethereum smart contracts',
                    'capabilities': ['fuzz_testing', 'property_testing', 'crash_detection'],
                    'supported_languages': ['solidity'],
                    'website': 'https://github.com/crytic/echidna'
                },
                'manticore': {
                    'name': 'Manticore',
                    'description': 'Symbolic execution tool for smart contracts',
                    'capabilities': ['symbolic_execution', 'vulnerability_detection', 'test_generation'],
                    'supported_languages': ['solidity', 'vyper'],
                    'website': 'https://github.com/trailofbits/manticore'
                }
            },
            'formal_verification': {
                'certora': {
                    'name': 'Certora',
                    'description': 'Formal verification platform for smart contracts',
                    'capabilities': ['formal_verification', 'specification_language', 'automated_proving'],
                    'supported_languages': ['solidity'],
                    'website': 'https://www.certora.com/'
                }
            }
        }
        
        return jsonify({
            'tools': tools_info,
            'categories': list(tools_info.keys()),
            'total_tools': sum(len(category) for category in tools_info.values())
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to get audit tools information")
        return jsonify({'error': 'Failed to get audit tools information'}), 500

@audit_bp.route('/history', methods=['GET'])
@jwt_required()
def get_audit_history():
    """Get audit history for the current user"""
    try:
        user_id = None  # get_jwt_identity()
        
        # Mock audit history - in real implementation, store in database
        audit_history = [
            {
                'audit_id': f'audit_{user_id}_001',
                'contract_name': 'MyToken',
                'language': 'solidity',
                'audit_date': '2024-01-15T10:30:00Z',
                'security_score': 85,
                'vulnerabilities_found': 3,
                'status': 'completed'
            },
            {
                'audit_id': f'audit_{user_id}_002',
                'contract_name': 'DeFiProtocol',
                'language': 'solidity',
                'audit_date': '2024-01-10T14:20:00Z',
                'security_score': 72,
                'vulnerabilities_found': 7,
                'status': 'completed'
            }
        ]
        
        return jsonify({
            'audit_history': audit_history,
            'total_audits': len(audit_history)
        }), 200
        
    except Exception as e:
        logger.log_error(e, "Failed to get audit history")
        return jsonify({'error': 'Failed to get audit history'}), 500
