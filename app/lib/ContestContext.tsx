import React, { createContext, useState, useContext, ReactNode } from 'react';

// Types
interface Contest {
  id: string;
  name: string;
  description?: string;
  image?: string;
  prize?: string;
  entryFee: string | number;
  participants: number;
  maxParticipants: number;
  startTime?: Date;
  categories?: string[];
  tier: string;
  status: string;
  isPrivate?: boolean;
  createdBy?: string;
  prizePool?: number;
  winners?: any[];
}

interface ContestContextType {
  myContests: Contest[];
  addMyContest: (contest: Contest) => void;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with a dummy contest
  const dummyContest: Contest = {
    id: 'dummy-' + Date.now().toString(),
    name: 'Your Private Quiz Contest',
    entryFee: '₹50',
    participants: 0,
    maxParticipants: 10,
    tier: 'Medium-Stake',
    status: 'joinable',
    isPrivate: true,
    createdBy: 'You',
    prizePool: 500,
    description: 'This is your private contest. Invite friends to join!',
    startTime: new Date(),
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
    categories: ['Private Quiz']
  };

  const [myContests, setMyContests] = useState<Contest[]>([dummyContest]);

  const addMyContest = (contest: Contest) => {
    console.log('Adding new contest to myContests with complete data:', contest);
    
    // Make sure all required fields are present for compatibility with Home screen
    const formattedContest: Contest = {
      ...contest,
      // Ensure string types for home screen compatibility
      description: contest.description || `A private contest created by you`,
      prize: typeof contest.prize === 'string' ? contest.prize : 
             contest.prizePool ? `₹${contest.prizePool}` : '₹0',
      entryFee: typeof contest.entryFee === 'string' ? contest.entryFee : 
                typeof contest.entryFee === 'number' ? `₹${contest.entryFee}` : '₹0',
      // Ensure required fields are present
      image: contest.image || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
      startTime: contest.startTime || new Date(),
      status: contest.status || 'joinable',
      categories: contest.categories || ['Custom Quiz'],
    };
    
    console.log('Formatted contest ready for adding:', formattedContest);
    
    setMyContests(prevContests => {
      console.log('Previous myContests:', prevContests);
      // Avoid duplicate contests by checking IDs
      const isDuplicate = prevContests.some(c => c.id === formattedContest.id);
      if (isDuplicate) {
        console.log('Contest already exists, not adding duplicate');
        return prevContests;
      }
      
      const newContests = [formattedContest, ...prevContests];
      console.log('New myContests after adding:', newContests);
      return newContests;
    });
  };

  return (
    <ContestContext.Provider value={{ myContests, addMyContest }}>
      {children}
    </ContestContext.Provider>
  );
};

export const useContests = () => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error('useContests must be used within a ContestProvider');
  }
  console.log('Current myContests in context:', context.myContests);
  return context;
};

export const useContest = () => {
  const context = useContext(ContestContext);
  if (context === undefined) {
    throw new Error('useContest must be used within a ContestProvider');
  }
  return context;
};

// Add default export
export default ContestProvider; 