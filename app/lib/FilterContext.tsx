import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POOL_CATEGORIES, STAKE_TIERS, StakeTier, PoolCategory } from './ContestPoolDefinitions';

// Define filter types
export type FilterType = {
  entryFeeRange: {
    enabled: boolean;
    min: number;
    max: number;
    custom: number | null;
  };
  stakeTiers: {
    micro: boolean;
    mid: boolean;
    high: boolean;
  };
  playerCounts: {
    count: number;
    selected: boolean;
    label: string;
  }[];
  contestTypes: {
    standard: boolean;
    medium: boolean;
    large: boolean;
    duel: boolean;
    special: boolean;
  };
};

// Define context type
export type FilterContextType = {
  filters: FilterType;
  updateFilters: (newFilters: FilterType) => void;
  resetFilters: () => void;
  toggleStakeTier: (tier: keyof FilterType['stakeTiers']) => void;
  togglePlayerCount: (index: number) => void;
  toggleContestType: (type: keyof FilterType['contestTypes']) => void;
  setCustomAmount: (amount: number | null) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isFilterActive: boolean;
};

// Default filter state
const defaultFilters: FilterType = {
  entryFeeRange: {
    enabled: false,
    min: 10,
    max: 1000,
    custom: null,
  },
  stakeTiers: {
    micro: false,
    mid: false,
    high: false,
  },
  playerCounts: [
    { count: 2, selected: false, label: 'Duel (1v1)' },
    { count: 10, selected: false, label: 'Standard (10)' },
    { count: 20, selected: false, label: 'Pro (20)' },
    { count: 50, selected: false, label: 'Royal (50)' },
  ],
  contestTypes: {
    standard: false,
    medium: false,
    large: false,
    duel: false,
    special: false,
  },
};

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider component
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterType>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  
  // Calculate if any filter is active
  const isFilterActive = React.useMemo(() => {
    const { entryFeeRange, stakeTiers, playerCounts, contestTypes } = filters;
    
    // Check if any stake tier is selected
    const anyStakeTierActive = Object.values(stakeTiers).some(selected => selected);
    
    // Check if any player count is selected
    const anyPlayerCountActive = playerCounts.some(pc => pc.selected);
    
    // Check if any contest type is selected
    const anyContestTypeActive = Object.values(contestTypes).some(selected => selected);
    
    // Check if entry fee range is enabled and has custom value
    const entryFeeActive = entryFeeRange.enabled && entryFeeRange.custom !== null;
    
    return anyStakeTierActive || anyPlayerCountActive || anyContestTypeActive || entryFeeActive;
  }, [filters]);
  
  // Load saved filters from storage on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem('quizzoo_filters');
        if (savedFilters) {
          setFilters(JSON.parse(savedFilters));
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    
    loadFilters();
  }, []);
  
  // Save filters to storage when they change
  useEffect(() => {
    const saveFilters = async () => {
      try {
        await AsyncStorage.setItem('quizzoo_filters', JSON.stringify(filters));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    };
    
    saveFilters();
  }, [filters]);
  
  // Update all filters
  const updateFilters = (newFilters: FilterType) => {
    setFilters(newFilters);
  };
  
  // Reset to default
  const resetFilters = () => {
    setFilters(defaultFilters);
  };
  
  // Toggle stake tier selection
  const toggleStakeTier = (tier: keyof FilterType['stakeTiers']) => {
    setFilters(prev => {
      const newStakeTiers = {
        ...prev.stakeTiers,
        [tier]: !prev.stakeTiers[tier],
      };
      
      // Update entry fee range if any tier is selected
      const anyTierSelected = Object.values(newStakeTiers).some(value => value);
      let newEntryFeeRange = { ...prev.entryFeeRange };
      
      if (anyTierSelected) {
        // Find min/max values across all selected tiers
        const selectedTiers = Object.entries(newStakeTiers)
          .filter(([_, selected]) => selected)
          .map(([tierKey]) => tierKey as StakeTier);
        
        if (selectedTiers.length > 0) {
          const minValues = selectedTiers.map(t => STAKE_TIERS[t].min);
          const maxValues = selectedTiers.map(t => STAKE_TIERS[t].max);
          
          newEntryFeeRange = {
            ...newEntryFeeRange,
            enabled: true,
            min: Math.min(...minValues),
            max: Math.max(...maxValues),
          };
        }
      } else {
        // If no tiers selected, disable entry fee range filter
        newEntryFeeRange.enabled = false;
      }
      
      return {
        ...prev,
        stakeTiers: newStakeTiers,
        entryFeeRange: newEntryFeeRange,
      };
    });
  };
  
  // Toggle player count selection
  const togglePlayerCount = (index: number) => {
    setFilters(prev => {
      const newPlayerCounts = [...prev.playerCounts];
      newPlayerCounts[index].selected = !newPlayerCounts[index].selected;
      
      // Update contest types based on player counts
      const newContestTypes = { ...prev.contestTypes };
      
      if (newPlayerCounts[0].selected) newContestTypes.duel = true;
      else if (!newPlayerCounts[0].selected && 
               !newPlayerCounts.some((pc, i) => i !== 0 && pc.selected)) {
        newContestTypes.duel = false;
      }
      
      if (newPlayerCounts[1].selected) newContestTypes.standard = true;
      else if (!newPlayerCounts[1].selected && 
               !newPlayerCounts.some((pc, i) => i !== 1 && pc.selected)) {
        newContestTypes.standard = false;
      }
      
      if (newPlayerCounts[2].selected) newContestTypes.medium = true;
      else if (!newPlayerCounts[2].selected && 
               !newPlayerCounts.some((pc, i) => i !== 2 && pc.selected)) {
        newContestTypes.medium = false;
      }
      
      if (newPlayerCounts[3].selected) newContestTypes.large = true;
      else if (!newPlayerCounts[3].selected && 
               !newPlayerCounts.some((pc, i) => i !== 3 && pc.selected)) {
        newContestTypes.large = false;
      }
      
      return {
        ...prev,
        playerCounts: newPlayerCounts,
        contestTypes: newContestTypes,
      };
    });
  };
  
  // Toggle contest type selection
  const toggleContestType = (type: keyof FilterType['contestTypes']) => {
    setFilters(prev => {
      // Toggle the selected contest type
      const newContestTypes = {
        ...prev.contestTypes,
        [type]: !prev.contestTypes[type]
      };
      
      // Update player counts based on contest type
      const newPlayerCounts = [...prev.playerCounts];
      
      // Map contest types to player counts
      if (type === 'duel') {
        newPlayerCounts[0].selected = newContestTypes.duel;
      } else if (type === 'standard') {
        newPlayerCounts[1].selected = newContestTypes.standard;
      } else if (type === 'medium') {
        newPlayerCounts[2].selected = newContestTypes.medium;
      } else if (type === 'large') {
        newPlayerCounts[3].selected = newContestTypes.large;
      }
      
      return {
        ...prev,
        contestTypes: newContestTypes,
        playerCounts: newPlayerCounts,
      };
    });
  };
  
  // Set custom amount
  const setCustomAmount = (amount: number | null) => {
    setFilters(prev => ({
      ...prev,
      entryFeeRange: {
        ...prev.entryFeeRange,
        custom: amount,
        enabled: amount !== null,
      },
    }));
  };
  
  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilters,
        resetFilters,
        toggleStakeTier,
        togglePlayerCount,
        toggleContestType,
        setCustomAmount,
        showFilters,
        setShowFilters,
        isFilterActive,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

// Hook for using the filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

// Add default export
export default FilterProvider; 