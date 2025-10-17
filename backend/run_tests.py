#!/usr/bin/env python3
"""
Test runner script for backend unit tests
"""

import subprocess
import sys
import os

def run_tests():
    """Run all backend tests"""
    print("Running Backend Unit Tests")
    print("=" * 50)
    
    # Set environment variables for testing
    os.environ['TESTING'] = 'True'
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    
    try:
        # Run pytest with coverage
        result = subprocess.run([
            'python', '-m', 'pytest',
            'tests/',
            '-v',
            '--tb=short',
            '--cov=.',
            '--cov-report=term-missing',
            '--cov-report=html:htmlcov',
            '--junitxml=test-results.xml'
        ], capture_output=False, text=True)
        
        if result.returncode == 0:
            print("\nAll tests passed!")
            print("Coverage report generated in htmlcov/index.html")
            return True
        else:
            print("\nSome tests failed!")
            return False
            
    except FileNotFoundError:
        print("pytest not found. Please install test dependencies:")
        print("pip install pytest pytest-cov pytest-mock pytest-flask")
        return False
    except Exception as e:
        print(f"Error running tests: {e}")
        return False

def run_unit_tests_only():
    """Run only unit tests"""
    print("Running Backend Unit Tests Only")
    print("=" * 50)
    
    os.environ['TESTING'] = 'True'
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    
    try:
        result = subprocess.run([
            'python', '-m', 'pytest',
            'tests/unit/',
            '-v',
            '--tb=short',
            '--cov=.',
            '--cov-report=term-missing'
        ], capture_output=False, text=True)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"Error running unit tests: {e}")
        return False

def run_integration_tests_only():
    """Run only integration tests"""
    print("Running Backend Integration Tests Only")
    print("=" * 50)
    
    os.environ['TESTING'] = 'True'
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    
    try:
        result = subprocess.run([
            'python', '-m', 'pytest',
            'tests/integration/',
            '-v',
            '--tb=short'
        ], capture_output=False, text=True)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"Error running integration tests: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--unit-only':
            success = run_unit_tests_only()
        elif sys.argv[1] == '--integration-only':
            success = run_integration_tests_only()
        else:
            print("Usage: python run_tests.py [--unit-only|--integration-only]")
            sys.exit(1)
    else:
        success = run_tests()
    
    sys.exit(0 if success else 1)
