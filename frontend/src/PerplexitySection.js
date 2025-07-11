import React from 'react';

export default function PerplexitySection({
  token,
  userPrompt,
  setUserPrompt,
  sampleText,
  setSampleText,
  isLoading,
  useSampleMode,
  setUseSampleMode,
  handlePerplexity,
  perplexityResponse,
  error,
  sampleResponse,
  displayJsonAsTable
}) {
  if (!token) return null;
  return (
    <div className="perplexity-section" style={{ width: '100%', maxWidth: 900, margin: '32px auto', background: '#23272f', borderRadius: 8, padding: 24, boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>Ask Perplexity (Sample Mode)</h2>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setUseSampleMode(m => !m)}
          style={{
            padding: '6px 18px',
            fontSize: '0.95rem',
            borderRadius: 4,
            border: 'none',
            background: useSampleMode ? '#61dafb' : '#888',
            color: useSampleMode ? '#222' : '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: 10
          }}
        >
          {useSampleMode ? 'Sample Mode' : 'AI API Mode'}
        </button>
        <span style={{ color: useSampleMode ? '#61dafb' : '#888', fontWeight: 'bold' }}>
          {useSampleMode ? 'Using sample JSON' : 'Calling Perplexity API'}
        </span>
        {useSampleMode && (
          <button
            type="button"
            onClick={() => setSampleText(sampleResponse)}
            style={{
              padding: '4px 12px',
              fontSize: '0.9rem',
              borderRadius: 4,
              border: '1px solid #61dafb',
              background: '#181c22',
              color: '#61dafb',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: 10
            }}
          >
            Load Sample
          </button>
        )}
      </div>
      <form onSubmit={handlePerplexity} style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          placeholder="Ask anything... (not used in sample mode)"
          style={{ width: 400, maxWidth: '80%', marginRight: 8, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem' }}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '8px 20px', fontSize: '1rem', borderRadius: 4, border: 'none', background: '#61dafb', color: '#222', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>Ask</button>
      </form>
      <textarea
        value={sampleText}
        onChange={e => setSampleText(e.target.value)}
        placeholder="Paste your sample JSON result here..."
        rows={8}
        style={{ width: '100%', fontSize: '0.95rem', marginBottom: 12, borderRadius: 4, border: '1px solid #ccc', padding: 10, resize: 'vertical', background: '#181c22', color: '#fff' }}
      />
      {isLoading && <div style={{ color: '#aaa', marginTop: 8 }}>Loading...</div>}
      {perplexityResponse && (
        <div style={{ background: '#f4f4f4', padding: 16, borderRadius: 6, marginTop: 16, width: '100%', overflowX: 'auto' }}>
          {useSampleMode ? (
            <>
              <strong style={{ fontSize: '1.1rem' }}>Response (Tables):</strong>
              <div style={{ margin: '12px 0' }}>{displayJsonAsTable(perplexityResponse)}</div>
              <strong>Raw JSON:</strong>
              <pre style={{ fontSize: '0.85rem', maxHeight: 200, overflow: 'auto', background: '#222', color: '#fff', padding: 10, borderRadius: 4 }}>{JSON.stringify(perplexityResponse, null, 2)}</pre>
            </>
          ) : (
            <>
              <strong style={{ fontSize: '1.1rem' }}>Response Content:</strong>
              <div style={{ margin: '12px 0', fontFamily: 'monospace', color: '#222', background: '#fff', padding: 12, borderRadius: 4, whiteSpace: 'pre-wrap' }}>{perplexityResponse}</div>
            </>
          )}
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
} 