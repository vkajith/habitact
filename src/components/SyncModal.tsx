import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SyncModalProps {
  userId?: string;
  onClose: () => void;
  onSyncCodeSubmit: (userId: string) => void;
}

interface SyncData {
    user_id: string;
}

// Style constants for maintainability
const MODAL_STYLES = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  content: {
    background: "#1E1E1E",
    padding: '1.5rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  }
};

const SyncModal: React.FC<SyncModalProps> = ({ 
  userId,
  onClose,
  onSyncCodeSubmit,
}) => {

  const [syncCode, setSyncCode] = useState<string>('');
  const [inputSyncCode, setInputSyncCode] = useState<string>('');
  const [syncError, setSyncError] = useState<string>('');
  const getSyncCode = (userId: string) => {
    const syncData: SyncData = {
      user_id: userId,
    };
    const code = btoa(JSON.stringify(syncData));
    return code;
  }

  const handleSyncCodeSubmit = () => {
    try {
      const decodedData = JSON.parse(atob(inputSyncCode)) as SyncData;
      if (!decodedData?.user_id) {
        throw new Error('Invalid data format');
      }
      onSyncCodeSubmit(decodedData.user_id);
      setInputSyncCode('');
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSyncError(error.message);
      } else {
        setSyncError('Invalid sync code. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (userId) {
      const code = getSyncCode(userId);
      setSyncCode(code);
    }
  }, [userId]);

  return(
    <div className="sync-modal" onClick={onClose} style={MODAL_STYLES.overlay}>
    <div onClick={(e) => e.stopPropagation()} style={MODAL_STYLES.content}>
      <h2 style={{ margin: 0, textAlign: 'center', fontSize: '1.5rem', fontWeight: '500' }}>
        Sync
      </h2>
      {
        syncError && (
          <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
            {syncError}
          </div>
        )
      }
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#121212',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem'
          }}>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginRight: '0.5rem'
            }}>{syncCode}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(syncCode)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/>
              </svg>
            </button>
          </div>
          <div style={{ 
            width: 'min-content',
            background: 'white',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <QRCodeSVG 
              value={`${window.location.origin}?sync=${syncCode}`} 
              size={200} 
            />
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
          <span style={{ color: '#666', fontSize: '0.9rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={inputSyncCode}
            onChange={(e) => setInputSyncCode(e.target.value)}
            placeholder="Enter a sync code"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#121212',
              color: 'white',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={() => {
                handleSyncCodeSubmit();
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'white',
              color: 'black',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Sync!
          </button>
        </div>
      </div>
    </div>
  </div>
  );


};

export default SyncModal;