// Sound effects utility for UI interactions
class SoundEffects {
  constructor() {
    this.sounds = {};
    this.muted = localStorage.getItem('soundEffects') === 'muted';
    this.volume = parseFloat(localStorage.getItem('soundEffectsVolume') || 0.5);
    
    this.loadSounds();
  }
  
  loadSounds() {
    // Define the sounds to preload
    const soundsToLoad = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      hover: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2221/2221-preview.mp3',
      notification: 'https://assets.mixkit.co/active_storage/sfx/720/720-preview.mp3',
      scan: 'https://assets.mixkit.co/active_storage/sfx/1031/1031-preview.mp3',
      toggle: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      typing: 'https://assets.mixkit.co/active_storage/sfx/2514/2514-preview.mp3',
      submit: 'https://assets.mixkit.co/active_storage/sfx/2684/2684-preview.mp3',
    };
    
    // Create audio objects for each sound
    for (const [name, url] of Object.entries(soundsToLoad)) {
      this.sounds[name] = new Audio(url);
      this.sounds[name].volume = this.volume;
    }
  }
  
  play(sound) {
    if (this.muted || !this.sounds[sound]) return;
    
    // Clone the audio to allow for rapid successive plays
    const audioClone = this.sounds[sound].cloneNode();
    audioClone.volume = this.volume;
    
    // Play the sound and automatically remove it when done
    audioClone.play().catch(e => console.error('Error playing sound:', e));
    audioClone.onended = () => audioClone.remove();
  }
  
  mute() {
    this.muted = true;
    localStorage.setItem('soundEffects', 'muted');
  }
  
  unmute() {
    this.muted = false;
    localStorage.setItem('soundEffects', 'unmuted');
  }
  
  toggleMute() {
    this.muted ? this.unmute() : this.mute();
    return this.muted;
  }
  
  setVolume(value) {
    this.volume = parseFloat(value);
    localStorage.setItem('soundEffectsVolume', this.volume);
    
    // Update all audio elements with new volume
    for (const sound of Object.values(this.sounds)) {
      sound.volume = this.volume;
    }
  }
  
  // Convenience methods for commonly used sounds
  playClick() { this.play('click'); }
  playHover() { this.play('hover'); }
  playSuccess() { this.play('success'); }
  playError() { this.play('error'); }
  playNotification() { this.play('notification'); }
}

// Export a singleton instance
const soundEffects = new SoundEffects();
export default soundEffects;