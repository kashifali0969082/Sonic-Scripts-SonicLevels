"use client"
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { arcTestnet } from '../../config/config'
import { arcTestnetUsdcAddress, arcTestnetUsdcAbi } from '../../config/export'
import { useState } from 'react'

export default function ArcPage() {
  const account = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isArcNetwork = chainId === arcTestnet.id

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Arc Testnet</h1>
      <hr />
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Network Information</h2>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Network Name:</strong> Arc Testnet
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Chain ID:</strong> {arcTestnet.id}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>RPC URL:</strong>{' '}
            <code style={{ 
              backgroundColor: '#e0e0e0', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              https://rpc.testnet.arc.network
            </code>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Currency Symbol:</strong> USDC
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Explorer:</strong>{' '}
            <a 
              href="https://testnet.arcscan.app" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              https://testnet.arcscan.app
            </a>
          </div>
        </div>
      </div>

      {account.isConnected ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h2>Connection Status</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Address: </strong>
              <code style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px' 
              }}>
                {account.address}
              </code>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Current Chain ID: </strong>
              <code style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px' 
              }}>
                {chainId}
              </code>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Connected to Arc Testnet: </strong>
              <span style={{ 
                color: isArcNetwork ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {isArcNetwork ? 'Yes' : 'No'}
              </span>
            </div>
            
            {!isArcNetwork && (
              <button
                type="button"
                onClick={() => switchChain({ chainId: arcTestnet.id })}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  marginTop: '1rem'
                }}
              >
                Switch to Arc Testnet
              </button>
            )}
          </div>

          {isArcNetwork && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Transfer USDC</h2>
              <TransferUSDC />
            </div>
          )}
        </>
      ) : (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffc107'
        }}>
          <h2>Not Connected</h2>
          <p>Please connect your wallet to interact with Arc Testnet.</p>
        </div>
      )}
    </div>
  )
}

function TransferUSDC() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recipient || !amount) {
      alert('Please fill in both recipient address and amount')
      return
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      alert('Invalid recipient address format')
      return
    }

    try {
      // Parse amount with 18 decimals
      const amountInWei = parseUnits(amount, 6)
      
      // Convert both to strings for passing
      const recipientString: string = recipient
      const amountString: string = amountInWei.toString()
      
      writeContract({
        address: arcTestnetUsdcAddress,
        abi: arcTestnetUsdcAbi,
        functionName: 'transfer',
        args: [recipientString as `0x${string}`, BigInt(amountString)],
      })
    } catch (err) {
      console.error('Error parsing amount:', err)
      alert('Invalid amount. Please enter a valid number.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f0f0f0',
        maxWidth: '500px',
        margin: '1rem auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="recipient" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
          Recipient Address
        </label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          required
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            width: '100%',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="amount" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
          Amount (USDC)
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.000000000000000001"
          min="0"
          required
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            width: '100%',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />
        <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Decimals: 18
        </small>
      </div>

      <button
        type="submit"
        disabled={isPending || isConfirming}
        style={{
          padding: '0.875rem',
          backgroundColor: isPending || isConfirming ? '#9ca3af' : '#2563eb',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          marginTop: '0.5rem',
        }}
        onMouseOver={(e) => {
          if (!isPending && !isConfirming) {
            e.currentTarget.style.backgroundColor = '#1d4ed8'
          }
        }}
        onMouseOut={(e) => {
          if (!isPending && !isConfirming) {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }
        }}
      >
        {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Transfer USDC'}
      </button>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '0.9rem'
        }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {isConfirmed && hash && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '0.9rem'
        }}>
          <strong>Success!</strong> Transaction confirmed.
          <div style={{ marginTop: '0.5rem' }}>
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#059669', textDecoration: 'underline' }}
            >
              View on ArcScan
            </a>
          </div>
        </div>
      )}

      {hash && !isConfirmed && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          color: '#1e40af',
          fontSize: '0.9rem'
        }}>
          <strong>Transaction submitted!</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'underline' }}
            >
              View on ArcScan
            </a>
          </div>
        </div>
      )}
    </form>
  )
}

