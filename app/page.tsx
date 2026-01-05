"use client"
import { Hooks } from 'tempo.ts/wagmi'
import { formatUnits, pad, parseUnits, stringToHex } from 'viem'
import { tempoTestnet } from 'viem/chains'
import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useWatchBlockNumber,
} from 'wagmi'
import { alphaUsd, betaUsd, sponsorAccount } from '../config/config'

import { useEffect, useState } from 'react'

export default function App() {
  const account = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const alphaUsdBalance = Hooks.token.useGetBalance({
    account: account?.address,
    token: alphaUsd,
  })

  // Prevent hydration mismatch by waiting for mount
  if (!mounted) return null

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tempo Payment System</h1>
      <hr />
      {account.isConnected ? (
        <>
          <h2>Account</h2>
          <Account />
          <h2>Fund Account</h2>
          <FundAccount />
          <h2>Balances</h2>
          <Balance />
          {alphaUsdBalance.data && alphaUsdBalance.data > 0n && (
            <>
              <h2>Send 100,000 Alpha USD</h2>
              <SendPaymentWithMemo />
            </>
          )}
        </>
      ) : (
        <>
          <h2>Connect</h2>
          <Connect />
        </>
      )}
    </div>
  )
}

function Connect() {
  const { connect } = useConnect()
  const connectors = useConnectors()

  // Prefer the specific EIP-6963 MetaMask connector if available, otherwise fallback to generic 'injected'
  // EIP-6963 connectors usually have distinct names/ids
  const metaMaskConnector = connectors.find((c) => c.name === 'MetaMask')
    || connectors.find((c) => c.id === 'io.metamask')
    || connectors.find((c) => c.name.toLowerCase().includes('metamask'))
    || connectors.find((c) => c.id === 'injected')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
      {metaMaskConnector ? (
        <button
          onClick={() => connect({ connector: metaMaskConnector })}
          type="button"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#f6851b', // MetaMask Orange
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '200px',
            fontWeight: 'bold'
          }}
        >
          Connect MetaMask ({metaMaskConnector.name})
        </button>
      ) : (
        <p>MetaMask not detected. Please install it.</p>
      )}

      {/* Debug: Show other connectors if necessary, or just keep it simple as requested */}
    </div>
  )
}

function Account() {
  const account = useAccount()
  const disconnect = useDisconnect()

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Address: </strong>
        <code style={{ backgroundColor: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
          {account.address}
        </code>
      </div>
      <button
        type="button"
        onClick={() => disconnect.disconnect()}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
        }}
      >
        Disconnect
      </button>
    </div>
  )
}

function Balance() {
  const account = useAccount()

  const alphaUsdBalance = Hooks.token.useGetBalance({
    account: account?.address,
    token: alphaUsd,
  })
  const betaUsdBalance = Hooks.token.useGetBalance({
    account: account?.address,
    token: betaUsd,
  })

  const sponsorAlphaUsdBalance = Hooks.token.useGetBalance({
    account: sponsorAccount.address,
    token: alphaUsd,
  })

  const alphaUsdMetadata = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })
  const betaUsdMetadata = Hooks.token.useGetMetadata({
    token: betaUsd,
  })

  useWatchBlockNumber({
    onBlockNumber() {
      alphaUsdBalance.refetch()
      betaUsdBalance.refetch()
      sponsorAlphaUsdBalance.refetch()
    },
  })

  // Only show section if either alphaUsd or betaUsd metadata are loaded
  if (!alphaUsdMetadata.data && !betaUsdMetadata.data) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      {alphaUsdMetadata.data && (
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>{alphaUsdMetadata.data?.name} Balance: </strong>
          {formatUnits(
            alphaUsdBalance.data ?? 0n,
            alphaUsdMetadata.data?.decimals ?? 6,
          )}{' '}
          {alphaUsdMetadata.data?.symbol}
        </div>
      )}
      {betaUsdMetadata.data && (
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>{betaUsdMetadata.data?.name} Balance: </strong>
          {formatUnits(
            betaUsdBalance.data ?? 0n,
            betaUsdMetadata.data?.decimals ?? 6,
          )}{' '}
          {betaUsdMetadata.data?.symbol}
        </div>
      )}
      <br />
      {alphaUsdMetadata.data && (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Sponsor Account: </strong>
            <code style={{ backgroundColor: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              {sponsorAccount.address}
            </code>
          </div>
          <div>
            <strong>Sponsor Balance: </strong>
            {`${formatUnits(sponsorAlphaUsdBalance.data ?? 0n, alphaUsdMetadata.data?.decimals ?? 6)} ${alphaUsdMetadata.data?.symbol}`}
          </div>
        </div>
      )}
    </div>
  )
}

function FundAccount() {
  const account = useAccount()
  const fund = Hooks.faucet.useFund()

  if (!account.address) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      <button
        disabled={fund.isPending}
        type="button"
        onClick={() => fund.mutate({ account: account.address! })}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: fund.isPending ? 'not-allowed' : 'pointer',
          backgroundColor: fund.isPending ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
        }}
      >
        {fund.isPending ? 'Funding...' : 'Fund Account'}
      </button>

      {fund.data && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Receipts:</strong>
          {fund.data.map((hash) => (
            <div key={hash} style={{ marginTop: '0.5rem' }}>
              <a
                href={`https://explore.tempo.xyz/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0070f3', textDecoration: 'underline' }}
              >
                {hash}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SendPaymentWithMemo() {
  const sendPayment = Hooks.token.useTransferSync()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.target as HTMLFormElement)

        const recipient = (formData.get('recipient') ||
          '0x0000000000000000000000000000000000000000') as `0x${string}`
        const memo = (formData.get('memo') || '') as string
        const amountValue = (formData.get('amount') || '0') as string
        const amount = parseUnits(amountValue, 6)

        sendPayment.mutate({
          amount: amount,
          to: recipient,
          token: '0x20c0000000000000000000000000000000000001',
          memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
        })
      }}
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
          name="recipient"
          placeholder="0x..."
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
          Amount
        </label>
        <input
          type="number"
          name="amount"
          placeholder="0.00"
          step="0.000001"
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
        <label htmlFor="memo" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
          Memo (optional)
        </label>
        <input
          type="text"
          name="memo"
          placeholder="Optional memo"
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

      <button
        type="submit"
        disabled={sendPayment.isPending}
        style={{
          padding: '0.875rem',
          backgroundColor: sendPayment.isPending ? '#9ca3af' : '#2563eb',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: sendPayment.isPending ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          marginTop: '0.5rem',
        }}
        onMouseOver={(e) => !sendPayment.isPending && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
        onMouseOut={(e) => !sendPayment.isPending && (e.currentTarget.style.backgroundColor = '#2563eb')}
      >
        {sendPayment.isPending ? 'Processing...' : 'Send Payment'}
      </button>
    </form>
  )
}