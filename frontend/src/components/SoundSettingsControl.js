import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaVolumeUp, FaVolumeMute, FaVolumeDown, FaCog } from 'react-icons/fa';
import soundEffects from '../utils/soundEffects';
import '../styles/animations.css';

const SoundSettingsControl = () => {
  const [showModal, setShowModal] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Initialize state from localStorage on component mount
  useEffect(() => {
    const isMuted = localStorage.getItem('soundEffects') === 'muted';
    const storedVolume = parseFloat(localStorage.getItem('soundEffectsVolume') || 0.5);
    
    setMuted(isMuted);
    setVolume(storedVolume);
  }, []);

  const handleToggleMute = () => {
    const newMutedState = !muted;
    setMuted(newMutedState);
    
    // Update the sound effects utility
    if (newMutedState) {
      soundEffects.mute();
    } else {
      soundEffects.unmute();
      // Play a test sound when unmuting
      soundEffects.play('click');
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundEffects.setVolume(newVolume);
    
    // Play a test sound when adjusting volume (unless muted)
    if (!muted) {
      soundEffects.play('click');
    }
  };

  const handleOpenModal = () => {
    soundEffects.play('click');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    soundEffects.play('click');
    setShowModal(false);
  };

  const handleMouseEnter = () => {
    if (!muted) {
      soundEffects.playHover();
    }
  };

  // Icon and tooltip based on volume level
  const getVolumeIcon = () => {
    if (muted) return <FaVolumeMute />;
    if (volume < 0.3) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const getVolumeTooltip = () => {
    if (muted) return 'Sound effects muted';
    if (volume < 0.3) return 'Sound effects low';
    if (volume < 0.7) return 'Sound effects medium';
    return 'Sound effects high';
  };

  return (
    <>
      <div 
        className="d-flex align-items-center cursor-pointer hover-scale" 
        onClick={handleOpenModal}
        onMouseEnter={handleMouseEnter}
        title={getVolumeTooltip()}
      >
        <div className="sound-icon me-2">
          {getVolumeIcon()}
        </div>
        <div className="d-none d-md-block small text-muted">
          Sound
        </div>
      </div>

      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        size="sm"
        backdrop="static"
        className="sound-settings-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center sci-fi-title">
            <FaCog className="me-2 rotate-gear" />
            Sound Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4 text-center">
            <div 
              className={`sound-toggle-btn ${muted ? 'muted' : 'active'} hover-scale`}
              onClick={handleToggleMute}
            >
              {muted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
            </div>
            <div className="mt-2">
              {muted ? 'Sound Effects Muted' : 'Sound Effects Active'}
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="d-flex justify-content-between">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              disabled={muted}
              className="custom-range"
            />
          </Form.Group>

          <div className="sound-effects-list mt-4">
            <h6>Test Sounds</h6>
            <div className="d-flex flex-wrap gap-2">
              {[
                { name: 'Click', sound: 'click' },
                { name: 'Hover', sound: 'hover' },
                { name: 'Success', sound: 'success' },
                { name: 'Error', sound: 'error' },
                { name: 'Notification', sound: 'notification' },
                { name: 'Scan', sound: 'scan' },
              ].map((effect) => (
                <Button 
                  key={effect.sound}
                  variant="outline-secondary"
                  size="sm"
                  className="sound-test-btn hover-scale"
                  onClick={() => soundEffects.play(effect.sound)}
                  disabled={muted}
                  onMouseEnter={handleMouseEnter}
                >
                  {effect.name}
                </Button>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx="true">{`
        .sound-icon {
          color: var(--primary-color);
          font-size: 1.2rem;
          opacity: ${muted ? 0.5 : 0.9};
          transition: all 0.3s ease;
        }
        
        .sound-toggle-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .sound-toggle-btn.active {
          background: rgba(13, 110, 253, 0.1);
          color: var(--primary-color);
          box-shadow: 0 0 15px rgba(13, 110, 253, 0.3);
        }
        
        .sound-toggle-btn.muted {
          background: rgba(108, 117, 125, 0.1);
          color: var(--secondary-color);
        }
        
        .sound-toggle-btn:hover {
          transform: scale(1.1);
        }
        
        .custom-range::-webkit-slider-thumb {
          background: var(--primary-color);
        }
        
        .custom-range::-moz-range-thumb {
          background: var(--primary-color);
        }
        
        .sound-test-btn {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default SoundSettingsControl;