/**
 * Type definitions for expo-av module
 */

declare module 'expo-av' {
  export namespace Audio {
    export interface PlaybackStatus {
      isLoaded: boolean;
      isPlaying: boolean;
      positionMillis: number;
      durationMillis?: number;
      didJustFinish: boolean;
      // Add other properties as needed
    }
    
    export interface Sound {
      setPositionAsync(positionMillis: number): Promise<PlaybackStatus>;
      playAsync(): Promise<PlaybackStatus>;
      unloadAsync(): Promise<PlaybackStatus>;
      // Add other methods as needed
    }
    
    export function setAudioModeAsync(mode: object): Promise<void>;
    export function setIsEnabledAsync(enabled: boolean): Promise<void>;
    
    export namespace Sound {
      export function createAsync(
        source: any,
        initialStatus?: object,
        onPlaybackStatusUpdate?: (status: PlaybackStatus) => void,
        downloadFirst?: boolean
      ): Promise<{ sound: Sound; status: PlaybackStatus }>;
    }
  }
} 