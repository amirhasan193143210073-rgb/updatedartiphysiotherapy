/**
 * WebRTC Client for Video Consultation
 * Handles WebRTC peer connection and signaling via WebSocket
 */
class WebRTCClient {
  constructor(config) {
    this.apiBaseUrl = config.apiBaseUrl || '';
    this.wsEndpoint = config.wsEndpoint || '';
    this.sessionId = config.sessionId || null;
    this.userId = config.userId || '';
    this.userType = config.userType || 'patient'; // 'patient' or 'therapist'
    
    this.ws = null;
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    
    // STUN servers for NAT traversal
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    this.isCallActive = false;
    this.isLocalVideoEnabled = true;
    this.isLocalAudioEnabled = true;
    
    // Callbacks
    this.onRemoteStream = config.onRemoteStream || (() => {});
    this.onConnectionStateChange = config.onConnectionStateChange || (() => {});
    this.onError = config.onError || (() => {});
    this.onCallEnded = config.onCallEnded || (() => {});
  }
  
  /**
   * Initialize WebSocket connection
   */
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with query parameters for $connect event
        let wsUrl = this.wsEndpoint.replace('https://', 'wss://').replace('http://', 'ws://');
        const params = new URLSearchParams({
          userId: this.userId,
          userType: this.userType
        });
        if (this.sessionId) {
          params.append('sessionId', this.sessionId);
        }
        wsUrl = `${wsUrl}?${params.toString()}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          // Send join message after connection is established
          this.sendWebSocketMessage({
            type: 'join',
            sessionId: this.sessionId,
            userId: this.userId,
            userType: this.userType
          });
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleSignalingMessage(message);
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.onError('WebSocket connection error');
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.onConnectionStateChange('disconnected');
        };
      } catch (error) {
        console.error('Error connecting WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Send message via WebSocket
   */
  sendWebSocketMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }
  
  /**
   * Handle signaling messages from server
   */
  handleSignalingMessage(message) {
    console.log('Received signaling message:', message.type);
    
    switch (message.type) {
      case 'offer':
        this.handleOffer(message.sdp);
        break;
      case 'answer':
        this.handleAnswer(message.sdp);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate);
        break;
      case 'call-ended':
        this.endCall();
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  /**
   * Start call - get user media and create offer
   */
  async startCall() {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Display local stream
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }
      
      // Create peer connection
      this.createPeerConnection();
      
      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.pc.addTrack(track, this.localStream);
      });
      
      // Create and send offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      this.sendWebSocketMessage({
        type: 'offer',
        sessionId: this.sessionId,
        sdp: offer
      });
      
      this.isCallActive = true;
      this.onConnectionStateChange('connecting');
      
    } catch (error) {
      console.error('Error starting call:', error);
      this.onError('Failed to start call: ' + error.message);
    }
  }
  
  /**
   * Create RTCPeerConnection
   */
  createPeerConnection() {
    this.pc = new RTCPeerConnection(this.rtcConfig);
    
    // Handle remote stream
    this.pc.ontrack = (event) => {
      console.log('Received remote track');
      this.remoteStream = event.streams[0];
      this.onRemoteStream(this.remoteStream);
      this.onConnectionStateChange('connected');
    };
    
    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendWebSocketMessage({
          type: 'ice-candidate',
          sessionId: this.sessionId,
          candidate: event.candidate
        });
      }
    };
    
    // Handle connection state changes
    this.pc.onconnectionstatechange = () => {
      console.log('Connection state:', this.pc.connectionState);
      this.onConnectionStateChange(this.pc.connectionState);
      
      if (this.pc.connectionState === 'failed' || this.pc.connectionState === 'disconnected') {
        this.onError('Connection failed');
      }
    };
    
    // Handle ICE connection state
    this.pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.pc.iceConnectionState);
    };
  }
  
  /**
   * Handle incoming offer
   */
  async handleOffer(offerSdp) {
    try {
      if (!this.localStream) {
        // Get user media first
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (this.onLocalStream) {
          this.onLocalStream(this.localStream);
        }
      }
      
      if (!this.pc) {
        this.createPeerConnection();
        this.localStream.getTracks().forEach(track => {
          this.pc.addTrack(track, this.localStream);
        });
      }
      
      await this.pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      
      // Create and send answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      
      this.sendWebSocketMessage({
        type: 'answer',
        sessionId: this.sessionId,
        sdp: answer
      });
      
      this.isCallActive = true;
      this.onConnectionStateChange('connecting');
      
    } catch (error) {
      console.error('Error handling offer:', error);
      this.onError('Failed to handle offer: ' + error.message);
    }
  }
  
  /**
   * Handle incoming answer
   */
  async handleAnswer(answerSdp) {
    try {
      if (this.pc) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError('Failed to handle answer: ' + error.message);
    }
  }
  
  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      if (this.pc) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }
  
  /**
   * Toggle local video
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        this.isLocalVideoEnabled = !this.isLocalVideoEnabled;
        videoTrack.enabled = this.isLocalVideoEnabled;
        return this.isLocalVideoEnabled;
      }
    }
    return false;
  }
  
  /**
   * Toggle local audio
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        this.isLocalAudioEnabled = !this.isLocalAudioEnabled;
        audioTrack.enabled = this.isLocalAudioEnabled;
        return this.isLocalAudioEnabled;
      }
    }
    return false;
  }
  
  /**
   * End call
   */
  async endCall() {
    try {
      // Send end call message
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendWebSocketMessage({
          type: 'call-ended',
          sessionId: this.sessionId
        });
      }
      
      // Close peer connection
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
      
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Close WebSocket
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      this.isCallActive = false;
      this.onCallEnded();
      
      // Call API to end session
      if (this.sessionId) {
        try {
          await fetch(`${this.apiBaseUrl}/sessions/${this.sessionId}/end`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Error ending session:', error);
        }
      }
      
    } catch (error) {
      console.error('Error ending call:', error);
      this.onError('Failed to end call: ' + error.message);
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.endCall();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRTCClient;
}

