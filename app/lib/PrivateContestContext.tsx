import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { PrivateContest } from '@/components/MyContests';
import { generateRandomString } from './utils';

type CreateContestParams = {
  entryFee: number;
  playerCount: number;
  contestName: string;
};

type PrivateContestContextType = {
  privateContests: PrivateContest[];
  createPrivateContest: (params: CreateContestParams) => string;
  joinPrivateContest: (code: string) => boolean;
  startContest: (contestId: string) => void;
  editContest: (contestId: string, updates: Partial<PrivateContest>) => void;
  cancelContest: (contestId: string) => void;
};

const PrivateContestContext = createContext<PrivateContestContextType | undefined>(undefined);

// Generate a mock contest code
const generateContestCode = () => {
  return generateRandomString(6).toUpperCase();
};

// Calculate prize pool based on entry fee
const calculatePrizePool = (entryFee: number, maxParticipants: number) => {
  return entryFee * maxParticipants * 0.9; // 90% of total pool goes to prizes
};

export const PrivateContestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privateContests, setPrivateContests] = useState<PrivateContest[]>([]);

  // Load saved contests on startup
  useEffect(() => {
    // In a real app, you would load from AsyncStorage or backend
    // For now, we'll use mock data
    const mockContests: PrivateContest[] = [
      {
        id: '1',
        name: 'Weekend Quiz Battle',
        code: 'ABC123',
        entryFee: 50,
        prizePool: 450,
        maxParticipants: 10,
        participants: 3,
        status: 'waiting',
        createdBy: 'user123',
        type: 'sports'
      },
      {
        id: '2',
        name: 'Friends Only Tournament',
        code: 'XYZ789',
        entryFee: 100,
        prizePool: 900,
        maxParticipants: 10,
        participants: 5,
        status: 'scheduled',
        scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
        createdBy: 'user123',
        type: 'movies'
      },
      {
        id: '3',
        name: 'Bollywood Quiz Night',
        code: 'BOL456',
        entryFee: 75,
        prizePool: 675,
        maxParticipants: 10,
        participants: 4,
        status: 'waiting',
        createdBy: 'user123',
        type: 'bollywood'
      },
      {
        id: '4',
        name: 'Science Trivia Masters',
        code: 'SCI789',
        entryFee: 60,
        prizePool: 540,
        maxParticipants: 10,
        participants: 2,
        status: 'scheduled',
        scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
        createdBy: 'user123',
        type: 'science'
      },
      {
        id: '5',
        name: 'History Legends Quiz',
        code: 'HIS321',
        entryFee: 80,
        prizePool: 720,
        maxParticipants: 10,
        participants: 7,
        status: 'waiting',
        createdBy: 'user123',
        type: 'history'
      }
    ];
    
    setPrivateContests(mockContests);
  }, []);

  // Create a new private contest with updated parameters
  const createPrivateContest = (params: CreateContestParams) => {
    const { entryFee, playerCount, contestName } = params;
    const code = generateContestCode();
    
    // Available contest types
    const contestTypes = [
      'sports', 'movies', 'knowledge', 'travel', 'history', 
      'science', 'music', 'food', 'art', 'technology', 
      'bollywood', 'cricket', 'politics', 'geography', 'literature'
    ];
    
    // Get a random contest type
    const randomType = contestTypes[Math.floor(Math.random() * contestTypes.length)];
    
    const newContest: PrivateContest = {
      id: Date.now().toString(),
      name: contestName || `Private Contest #${privateContests.length + 1}`,
      code,
      entryFee,
      prizePool: calculatePrizePool(entryFee, playerCount),
      maxParticipants: playerCount,
      participants: 1, // Creator is first participant
      status: 'waiting',
      createdBy: 'user123', // In a real app, this would be the current user's ID
      type: randomType // Add random type for image variety
    };
    
    setPrivateContests([...privateContests, newContest]);
    return code;
  };

  // Join an existing private contest
  const joinPrivateContest = (code: string) => {
    const contestIndex = privateContests.findIndex(
      (contest) => contest.code.toUpperCase() === code.toUpperCase()
    );
    
    if (contestIndex === -1) {
      Alert.alert('Contest Not Found', 'The contest code you entered does not exist.');
      return false;
    }
    
    const contest = privateContests[contestIndex];
    
    if (contest.participants >= contest.maxParticipants) {
      Alert.alert('Contest Full', 'This contest is already at maximum capacity.');
      return false;
    }
    
    if (contest.status === 'ongoing') {
      Alert.alert('Contest In Progress', 'This contest has already started.');
      return false;
    }
    
    // Update participant count
    const updatedContests = [...privateContests];
    updatedContests[contestIndex] = {
      ...contest,
      participants: contest.participants + 1,
    };
    
    setPrivateContests(updatedContests);
    return true;
  };

  // Start a contest
  const startContest = (contestId: string) => {
    setPrivateContests(
      privateContests.map((contest) =>
        contest.id === contestId
          ? { ...contest, status: 'ongoing' }
          : contest
      )
    );
  };

  // Edit a contest
  const editContest = (contestId: string, updates: Partial<PrivateContest>) => {
    setPrivateContests(
      privateContests.map((contest) =>
        contest.id === contestId
          ? { ...contest, ...updates }
          : contest
      )
    );
  };

  // Cancel a contest
  const cancelContest = (contestId: string) => {
    setPrivateContests(privateContests.filter((contest) => contest.id !== contestId));
  };

  return (
    <PrivateContestContext.Provider
      value={{
        privateContests,
        createPrivateContest,
        joinPrivateContest,
        startContest,
        editContest,
        cancelContest,
      }}
    >
      {children}
    </PrivateContestContext.Provider>
  );
};

export const usePrivateContest = () => {
  const context = useContext(PrivateContestContext);
  if (context === undefined) {
    throw new Error('usePrivateContest must be used within a PrivateContestProvider');
  }
  return context;
};

// Add default export
export default PrivateContestProvider; 