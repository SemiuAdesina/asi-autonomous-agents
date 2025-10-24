import json
import os
import requests
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging
from utils.logging import logger

logger = logging.getLogger(__name__)

class MultiSigWalletManager:
    """Multi-signature wallet management for enhanced security"""
    
    def __init__(self):
        self.ethereum_rpc = os.getenv('ETHEREUM_RPC_URL', 'https://mainnet.infura.io/v3/your-project-id')
        self.solana_rpc = os.getenv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com')
        self.supported_chains = ['ethereum', 'polygon', 'solana']
    
    def create_multisig_wallet(self, chain: str, owners: List[str], threshold: int, 
                             wallet_name: str = None) -> Dict[str, Any]:
        """Create a new multi-signature wallet"""
        
        try:
            if chain.lower() == 'ethereum':
                return self._create_ethereum_multisig(owners, threshold, wallet_name)
            elif chain.lower() == 'polygon':
                return self._create_polygon_multisig(owners, threshold, wallet_name)
            elif chain.lower() == 'solana':
                return self._create_solana_multisig(owners, threshold, wallet_name)
            else:
                raise ValueError(f"Unsupported chain: {chain}")
                
        except Exception as e:
            logger.log_error(e, f"Failed to create multisig wallet for {chain}")
            raise
    
    def _create_ethereum_multisig(self, owners: List[str], threshold: int, 
                                wallet_name: str = None) -> Dict[str, Any]:
        """Create Ethereum multi-signature wallet using Gnosis Safe"""
        
        # Gnosis Safe API integration
        safe_api_url = "https://safe-transaction-mainnet.safe.global/api/v1"
        
        # Create Safe deployment data
        safe_data = {
            "owners": owners,
            "threshold": threshold,
            "to": "0x0000000000000000000000000000000000000000",  # Contract creation
            "data": "0x",  # Empty data for contract creation
            "value": "0",
            "operation": 0,  # Call operation
            "safeTxGas": 0,
            "baseGas": 0,
            "gasPrice": 0,
            "gasToken": "0x0000000000000000000000000000000000000000",
            "refundReceiver": "0x0000000000000000000000000000000000000000",
            "nonce": 0
        }
        
        # In a real implementation, you would:
        # 1. Deploy Gnosis Safe contract
        # 2. Initialize with owners and threshold
        # 3. Return the contract address
        
        # For demo purposes, generate a mock contract address
        import hashlib
        contract_address = "0x" + hashlib.sha256(
            f"{owners}{threshold}{wallet_name}{datetime.utcnow()}".encode()
        ).hexdigest()[:40]
        
        multisig_wallet = {
            "chain": "ethereum",
            "contract_address": contract_address,
            "owners": owners,
            "threshold": threshold,
            "wallet_name": wallet_name or f"MultiSig_{len(owners)}of{threshold}",
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "type": "gnosis_safe",
            "capabilities": [
                "multi_signature_transactions",
                "owner_management",
                "threshold_modification",
                "transaction_history"
            ]
        }
        
        logger.log_event('INFO', 'multisig_wallet_created', {
            'chain': 'ethereum',
            'contract_address': contract_address,
            'owners_count': len(owners),
            'threshold': threshold
        })
        
        return multisig_wallet
    
    def _create_polygon_multisig(self, owners: List[str], threshold: int, 
                               wallet_name: str = None) -> Dict[str, Any]:
        """Create Polygon multi-signature wallet"""
        
        # Similar to Ethereum but for Polygon network
        import hashlib
        contract_address = "0x" + hashlib.sha256(
            f"polygon{owners}{threshold}{wallet_name}{datetime.utcnow()}".encode()
        ).hexdigest()[:40]
        
        multisig_wallet = {
            "chain": "polygon",
            "contract_address": contract_address,
            "owners": owners,
            "threshold": threshold,
            "wallet_name": wallet_name or f"Polygon_MultiSig_{len(owners)}of{threshold}",
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "type": "gnosis_safe_polygon",
            "capabilities": [
                "multi_signature_transactions",
                "owner_management",
                "threshold_modification",
                "low_gas_transactions"
            ]
        }
        
        logger.log_event('INFO', 'multisig_wallet_created', {
            'chain': 'polygon',
            'contract_address': contract_address,
            'owners_count': len(owners),
            'threshold': threshold
        })
        
        return multisig_wallet
    
    def _create_solana_multisig(self, owners: List[str], threshold: int, 
                              wallet_name: str = None) -> Dict[str, Any]:
        """Create Solana multi-signature wallet"""
        
        # Solana multisig implementation using SPL Token program
        import hashlib
        program_id = "11111111111111111111111111111111"  # System program
        multisig_account = hashlib.sha256(
            f"solana{owners}{threshold}{wallet_name}{datetime.utcnow()}".encode()
        ).hexdigest()[:44]
        
        multisig_wallet = {
            "chain": "solana",
            "multisig_account": multisig_account,
            "program_id": program_id,
            "owners": owners,
            "threshold": threshold,
            "wallet_name": wallet_name or f"Solana_MultiSig_{len(owners)}of{threshold}",
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "type": "spl_multisig",
            "capabilities": [
                "multi_signature_transactions",
                "owner_management",
                "token_transfers",
                "program_upgrades"
            ]
        }
        
        logger.log_event('INFO', 'multisig_wallet_created', {
            'chain': 'solana',
            'multisig_account': multisig_account,
            'owners_count': len(owners),
            'threshold': threshold
        })
        
        return multisig_wallet
    
    def create_transaction(self, multisig_address: str, to_address: str, 
                         value: str, data: str = "0x", chain: str = "ethereum") -> Dict[str, Any]:
        """Create a transaction for multi-signature approval"""
        
        transaction = {
            "transaction_id": self._generate_transaction_id(),
            "multisig_address": multisig_address,
            "to_address": to_address,
            "value": value,
            "data": data,
            "chain": chain,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "approvals": [],
            "rejections": [],
            "required_approvals": 0,  # Will be set based on threshold
            "description": f"Transaction to {to_address} for {value} wei"
        }
        
        logger.log_event('INFO', 'multisig_transaction_created', {
            'transaction_id': transaction['transaction_id'],
            'multisig_address': multisig_address,
            'to_address': to_address,
            'value': value,
            'chain': chain
        })
        
        return transaction
    
    def approve_transaction(self, transaction_id: str, approver: str, 
                          signature: str = None) -> Dict[str, Any]:
        """Approve a multi-signature transaction"""
        
        # In a real implementation, you would:
        # 1. Verify the signature
        # 2. Check if approver is authorized
        # 3. Add approval to transaction
        # 4. Check if threshold is met
        # 5. Execute transaction if threshold is met
        
        approval = {
            "transaction_id": transaction_id,
            "approver": approver,
            "signature": signature or f"mock_signature_{approver}_{datetime.utcnow()}",
            "approved_at": datetime.utcnow().isoformat(),
            "status": "approved"
        }
        
        logger.log_event('INFO', 'multisig_transaction_approved', {
            'transaction_id': transaction_id,
            'approver': approver
        })
        
        return approval
    
    def reject_transaction(self, transaction_id: str, rejector: str, 
                         reason: str = None) -> Dict[str, Any]:
        """Reject a multi-signature transaction"""
        
        rejection = {
            "transaction_id": transaction_id,
            "rejector": rejector,
            "reason": reason or "Transaction rejected",
            "rejected_at": datetime.utcnow().isoformat(),
            "status": "rejected"
        }
        
        logger.log_event('WARNING', 'multisig_transaction_rejected', {
            'transaction_id': transaction_id,
            'rejector': rejector,
            'reason': reason
        })
        
        return rejection
    
    def get_multisig_status(self, multisig_address: str, chain: str = "ethereum") -> Dict[str, Any]:
        """Get status of a multi-signature wallet"""
        
        # Mock status - in real implementation, query blockchain
        status = {
            "multisig_address": multisig_address,
            "chain": chain,
            "status": "active",
            "balance": "1.5 ETH",  # Mock balance
            "pending_transactions": 2,
            "completed_transactions": 15,
            "owners": [
                "0x1234567890123456789012345678901234567890",
                "0x2345678901234567890123456789012345678901",
                "0x3456789012345678901234567890123456789012"
            ],
            "threshold": 2,
            "last_activity": datetime.utcnow().isoformat()
        }
        
        return status
    
    def add_owner(self, multisig_address: str, new_owner: str, 
                 approver: str, chain: str = "ethereum") -> Dict[str, Any]:
        """Add a new owner to multi-signature wallet"""
        
        # Create owner addition transaction
        transaction = self.create_transaction(
            multisig_address=multisig_address,
            to_address=multisig_address,  # Self-call to modify owners
            value="0",
            data=f"addOwner({new_owner})",
            chain=chain
        )
        
        logger.log_event('INFO', 'multisig_owner_added', {
            'multisig_address': multisig_address,
            'new_owner': new_owner,
            'approver': approver,
            'chain': chain
        })
        
        return {
            "transaction_id": transaction['transaction_id'],
            "action": "add_owner",
            "new_owner": new_owner,
            "status": "pending_approval",
            "created_at": datetime.utcnow().isoformat()
        }
    
    def remove_owner(self, multisig_address: str, owner_to_remove: str, 
                   approver: str, chain: str = "ethereum") -> Dict[str, Any]:
        """Remove an owner from multi-signature wallet"""
        
        transaction = self.create_transaction(
            multisig_address=multisig_address,
            to_address=multisig_address,
            value="0",
            data=f"removeOwner({owner_to_remove})",
            chain=chain
        )
        
        logger.log_event('INFO', 'multisig_owner_removed', {
            'multisig_address': multisig_address,
            'owner_removed': owner_to_remove,
            'approver': approver,
            'chain': chain
        })
        
        return {
            "transaction_id": transaction['transaction_id'],
            "action": "remove_owner",
            "owner_removed": owner_to_remove,
            "status": "pending_approval",
            "created_at": datetime.utcnow().isoformat()
        }
    
    def change_threshold(self, multisig_address: str, new_threshold: int, 
                        approver: str, chain: str = "ethereum") -> Dict[str, Any]:
        """Change the threshold for multi-signature wallet"""
        
        transaction = self.create_transaction(
            multisig_address=multisig_address,
            to_address=multisig_address,
            value="0",
            data=f"changeThreshold({new_threshold})",
            chain=chain
        )
        
        logger.log_event('INFO', 'multisig_threshold_changed', {
            'multisig_address': multisig_address,
            'new_threshold': new_threshold,
            'approver': approver,
            'chain': chain
        })
        
        return {
            "transaction_id": transaction['transaction_id'],
            "action": "change_threshold",
            "new_threshold": new_threshold,
            "status": "pending_approval",
            "created_at": datetime.utcnow().isoformat()
        }
    
    def get_transaction_history(self, multisig_address: str, 
                              limit: int = 50) -> List[Dict[str, Any]]:
        """Get transaction history for multi-signature wallet"""
        
        # Mock transaction history
        transactions = []
        for i in range(min(limit, 10)):  # Mock 10 transactions
            transaction = {
                "transaction_id": f"tx_{i}_{datetime.utcnow().timestamp()}",
                "multisig_address": multisig_address,
                "to_address": f"0x{i:040d}",
                "value": f"{i * 0.1} ETH",
                "status": "completed" if i % 3 != 0 else "pending",
                "created_at": (datetime.utcnow().timestamp() - i * 3600),
                "approvals": [f"0x{j:040d}" for j in range(min(2, i % 3 + 1))],
                "gas_used": 21000 + i * 1000,
                "block_number": 18000000 + i * 100
            }
            transactions.append(transaction)
        
        return transactions
    
    def _generate_transaction_id(self) -> str:
        """Generate unique transaction ID"""
        import uuid
        return f"multisig_tx_{uuid.uuid4().hex[:16]}"
    
    def validate_multisig_config(self, owners: List[str], threshold: int) -> Tuple[bool, str]:
        """Validate multi-signature wallet configuration"""
        
        if not owners:
            return False, "At least one owner is required"
        
        if len(owners) > 50:
            return False, "Maximum 50 owners allowed"
        
        if threshold < 1:
            return False, "Threshold must be at least 1"
        
        if threshold > len(owners):
            return False, "Threshold cannot exceed number of owners"
        
        # Validate owner addresses
        for owner in owners:
            if not self._is_valid_address(owner):
                return False, f"Invalid owner address: {owner}"
        
        return True, "Configuration is valid"
    
    def _is_valid_address(self, address: str) -> bool:
        """Validate blockchain address format"""
        
        # Ethereum address validation
        if address.startswith('0x') and len(address) == 42:
            try:
                int(address[2:], 16)
                return True
            except ValueError:
                return False
        
        # Solana address validation (base58)
        if len(address) >= 32 and len(address) <= 44:
            # Basic Solana address format check
            return True
        
        return False

# Global multisig manager instance
multisig_manager = MultiSigWalletManager()
