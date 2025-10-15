'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Criteria {
  id: string;
  name: string;
  description: string;
  points: number;
}

interface Prize {
  id: string;
  name: string;
  description: string;
  winners: number;
  amount: string;
  expanded: boolean;
  criteria: Criteria[];
}

interface HackathonData {
  prizes: Prize[];
  judgingMode: string;
  votingMode: string;
  maxVotesPerJudge: number;
}

interface CreateHackathonPrizesProps {
  hackathonData: HackathonData;
  updateHackathonData: (updates: Partial<HackathonData>) => void;
}

// Static data moved outside component for performance
const JUDGING_MODES = [
  { value: 'Judges Only', label: 'Judges Only' },
  { value: 'Community Voting', label: 'Community Voting' },
  { value: 'Hybrid', label: 'Hybrid' },
] as const;

const VOTING_MODES = [
  { value: 'Project Scoring', label: 'Project Scoring' },
  { value: 'Criteria Based', label: 'Criteria Based' },
] as const;

const MAX_VOTES_OPTIONS = [
  { value: '100', label: 'Enter points: 100' },
  { value: '50', label: 'Enter points: 50' },
  { value: '20', label: 'Enter points: 20' },
  { value: '10', label: 'Enter points: 10' },
] as const;

const WINNER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function CreateHackathonPrizes({
  hackathonData,
  updateHackathonData
}: CreateHackathonPrizesProps) {
  // State for validation, loading, and user feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Validation functions
  const validatePrize = useCallback((prize: Prize): string[] => {
    const errors: string[] = [];
    if (!prize.name.trim()) errors.push('Prize name is required');
    if (!prize.amount.trim()) errors.push('Prize amount is required');
    if (prize.winners < 1) errors.push('At least one winner is required');
    
    // Validate criteria
    prize.criteria.forEach((criterion, index) => {
      if (!criterion.name.trim()) errors.push(`Criteria ${index + 1} name is required`);
      if (criterion.points <= 0) errors.push(`Criteria ${index + 1} must have points greater than 0`);
    });
    
    return errors;
  }, []);

  const validateAllPrizes = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (hackathonData.prizes.length === 0) {
      errors.general = 'At least one prize cohort is required';
      isValid = false;
    }

    hackathonData.prizes.forEach((prize, index) => {
      const prizeErrors = validatePrize(prize);
      if (prizeErrors.length > 0) {
        errors[`prize-${prize.id}`] = prizeErrors.join(', ');
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [hackathonData.prizes, validatePrize]);

  // Enhanced event handlers with validation
  const handlePrizeChange = useCallback(async (prizeId: string, field: keyof Prize, value: string | number) => {
    setIsLoading(true);
    
    try {
      const updatedPrizes = hackathonData.prizes.map(prize => {
        if (prize.id === prizeId) {
          return {
            ...prize,
            [field]: value
          };
        }
        return prize;
      });
      
      updateHackathonData({
        prizes: updatedPrizes
      });

      // Clear validation error for this field if it exists
      if (validationErrors[`prize-${prizeId}`]) {
        const newErrors = { ...validationErrors };
        delete newErrors[`prize-${prizeId}`];
        setValidationErrors(newErrors);
      }

      // Show success message for significant changes
      if (field === 'name' && value) {
        setSuccessMessage('Prize name updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating prize:', error);
      setValidationErrors(prev => ({
        ...prev,
        [`prize-${prizeId}`]: 'Failed to update prize. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData, validationErrors]);

  const handleCriteriaChange = useCallback(async (prizeId: string, criteriaId: string, field: keyof Criteria, value: string | number) => {
    setIsLoading(true);
    
    try {
      const updatedPrizes = hackathonData.prizes.map(prize => {
        if (prize.id === prizeId) {
          const updatedCriteria = prize.criteria.map(criterion => {
            if (criterion.id === criteriaId) {
              return {
                ...criterion,
                [field]: value
              };
            }
            return criterion;
          });
          return {
            ...prize,
            criteria: updatedCriteria
          };
        }
        return prize;
      });
      
      updateHackathonData({
        prizes: updatedPrizes
      });

      // Clear validation errors
      if (validationErrors[`prize-${prizeId}`]) {
        const newErrors = { ...validationErrors };
        delete newErrors[`prize-${prizeId}`];
        setValidationErrors(newErrors);
      }
    } catch (error) {
      console.error('Error updating criteria:', error);
      setValidationErrors(prev => ({
        ...prev,
        [`criteria-${criteriaId}`]: 'Failed to update criteria. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData, validationErrors]);

  const addCriterion = useCallback(async (prizeId: string) => {
    setIsLoading(true);
    
    try {
      const updatedPrizes = hackathonData.prizes.map(prize => {
        if (prize.id === prizeId) {
          const newCriterion: Criteria = {
            id: `criteria-${prize.criteria.length + 1}-${Date.now()}`,
            name: '',
            description: '',
            points: 0
          };
          return {
            ...prize,
            criteria: [...prize.criteria, newCriterion]
          };
        }
        return prize;
      });
      
      updateHackathonData({
        prizes: updatedPrizes
      });

      setSuccessMessage('New evaluation criteria added');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding criterion:', error);
      setValidationErrors(prev => ({
        ...prev,
        general: 'Failed to add criteria. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData]);

  const addPrizeCohort = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const newPrize: Prize = {
        id: `prize-${hackathonData.prizes.length + 1}-${Date.now()}`,
        name: '',
        description: '',
        winners: 1,
        amount: '',
        expanded: true,
        criteria: [{
          id: `criteria-1-${Date.now()}`,
          name: '',
          description: '',
          points: 0
        }]
      };
      
      updateHackathonData({
        prizes: [...hackathonData.prizes, newPrize]
      });

      setSuccessMessage('New prize cohort added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding prize cohort:', error);
      setValidationErrors(prev => ({
        ...prev,
        general: 'Failed to add prize cohort. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData]);

  const removePrizeCohort = useCallback(async (prizeId: string) => {
    if (hackathonData.prizes.length <= 1) {
      setValidationErrors(prev => ({
        ...prev,
        general: 'At least one prize cohort is required'
      }));
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedPrizes = hackathonData.prizes.filter(prize => prize.id !== prizeId);
      updateHackathonData({
        prizes: updatedPrizes
      });

      // Clear any validation errors for the removed prize
      const newErrors = { ...validationErrors };
      delete newErrors[`prize-${prizeId}`];
      setValidationErrors(newErrors);

      setSuccessMessage('Prize cohort removed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing prize cohort:', error);
      setValidationErrors(prev => ({
        ...prev,
        general: 'Failed to remove prize cohort. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData, validationErrors]);

  const removeCriterion = useCallback(async (prizeId: string, criteriaId: string) => {
    const prize = hackathonData.prizes.find(p => p.id === prizeId);
    if (!prize || prize.criteria.length <= 1) {
      setValidationErrors(prev => ({
        ...prev,
        [`prize-${prizeId}`]: 'At least one evaluation criteria is required'
      }));
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedPrizes = hackathonData.prizes.map(prize => {
        if (prize.id === prizeId) {
          return {
            ...prize,
            criteria: prize.criteria.filter(criterion => criterion.id !== criteriaId)
          };
        }
        return prize;
      });
      
      updateHackathonData({
        prizes: updatedPrizes
      });

      setSuccessMessage('Evaluation criteria removed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing criterion:', error);
      setValidationErrors(prev => ({
        ...prev,
        [`criteria-${criteriaId}`]: 'Failed to remove criteria. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.prizes, updateHackathonData]);

  // Keep existing handlers with proper typing
  const togglePrizeExpansion = useCallback((prizeId: string) => {
    const updatedPrizes = hackathonData.prizes.map(prize => {
      if (prize.id === prizeId) {
        return {
          ...prize,
          expanded: !prize.expanded
        };
      }
      return prize;
    });
    updateHackathonData({
      prizes: updatedPrizes
    });
  }, [hackathonData.prizes, updateHackathonData]);

  const handleJudgingModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateHackathonData({
      judgingMode: e.target.value
    });
  }, [updateHackathonData]);

  const handleVotingModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateHackathonData({
      votingMode: e.target.value
    });
  }, [updateHackathonData]);

  const handleMaxVotesChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateHackathonData({
      maxVotesPerJudge: parseInt(e.target.value)
    });
  }, [updateHackathonData]);

  // Validation trigger
  const handleValidateAll = useCallback(() => {
    setShowValidation(true);
    const isValid = validateAllPrizes();
    if (isValid) {
      setSuccessMessage('All prize configurations are valid!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [validateAllPrizes]);

  // Computed values with useMemo for performance
  const totalPrizes = useMemo(() => hackathonData.prizes.length, [hackathonData.prizes.length]);
  const totalCriteria = useMemo(() => 
    hackathonData.prizes.reduce((total, prize) => total + prize.criteria.length, 0), 
    [hackathonData.prizes]
  );
  const hasExpandedPrizes = useMemo(() => 
    hackathonData.prizes.some(prize => prize.expanded), 
    [hackathonData.prizes]
  );
  const totalPrizeValue = useMemo(() => {
    return hackathonData.prizes.reduce((total, prize) => {
      const amount = parseFloat(prize.amount.replace(/[^0-9.]/g, '')) || 0;
      return total + (amount * prize.winners);
    }, 0);
  }, [hackathonData.prizes]);
  const hasValidationErrors = useMemo(() => 
    Object.keys(validationErrors).length > 0, 
    [validationErrors]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8" role="main" aria-label="Prize configuration">
      {/* Prize Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between text-sm text-blue-700">
          <span>Total Prize Cohorts: {totalPrizes}</span>
          <span>Total Criteria: {totalCriteria}</span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            hasExpandedPrizes 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-600"
          )}>
            {hasExpandedPrizes ? "Details Visible" : "Details Hidden"}
          </span>
        </div>
      </div>

      {hackathonData.prizes.map((prize, index) => (
        <div 
          key={prize.id} 
          className={cn(
            "space-y-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-200",
            prize.expanded && "shadow-md border-blue-200"
          )}
          role="region"
          aria-labelledby={`prize-${prize.id}-title`}
        >
          <div>
            <label 
              htmlFor={`prize-name-${prize.id}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Prize Cohort Name {index + 1} <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input 
              id={`prize-name-${prize.id}`}
              type="text" 
              value={prize.name} 
              onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)} 
              placeholder="Enter Prize Cohort Name" 
              className={cn(
                "w-full p-3 bg-white border rounded-lg text-gray-800 text-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "hover:border-gray-400",
                !prize.name && "border-red-300 focus:ring-red-500 focus:border-red-500"
              )}
              required
              aria-describedby={`prize-name-${prize.id}-help`}
            />
            <p id={`prize-name-${prize.id}-help`} className="mt-1 text-xs text-gray-500">
              Give your prize cohort a descriptive name
            </p>
          </div>
          
          <div className="flex items-center">
            <button 
              type="button" 
              onClick={() => togglePrizeExpansion(prize.id)} 
              className={cn(
                "flex items-center text-sm font-medium transition-all duration-200",
                "hover:bg-blue-50 px-3 py-2 rounded-md",
                prize.expanded ? "text-blue-700" : "text-blue-600"
              )}
              aria-expanded={prize.expanded}
              aria-controls={`prize-${prize.id}-details`}
              aria-label={`${prize.expanded ? 'Hide' : 'Show'} details for ${prize.name || 'prize cohort'}`}
            >
              {prize.expanded ? (
                <>
                  <ChevronUp size={16} className="mr-2" />
                  <span>Hide details</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-2" />
                  <span>Show details</span>
                </>
              )}
            </button>
          </div>
          
          {prize.expanded && (
            <div 
              id={`prize-${prize.id}-details`}
              className="space-y-6 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor={`winners-${prize.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Number of winners <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      id={`winners-${prize.id}`}
                      value={prize.winners} 
                      onChange={(e) => handlePrizeChange(prize.id, 'winners', parseInt(e.target.value))} 
                      className={cn(
                        "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                      )}
                      required
                      aria-describedby={`winners-${prize.id}-help`}
                    >
                      {WINNER_OPTIONS.map(num => (
                        <option key={num} value={num}>
                          Number of winners: {num}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <p id={`winners-${prize.id}-help`} className="mt-1 text-xs text-gray-500">
                    How many winners will receive this prize
                  </p>
                </div>
                
                <div>
                  <label 
                    htmlFor={`amount-${prize.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prize amount for each winner <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <input 
                    id={`amount-${prize.id}`}
                    type="text" 
                    value={prize.amount} 
                    onChange={(e) => handlePrizeChange(prize.id, 'amount', e.target.value)} 
                    placeholder="e.g., $1000 USD or 500 tokens" 
                    className={cn(
                      "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      "hover:border-gray-400 transition-colors",
                      !prize.amount && "border-red-300 focus:ring-red-500 focus:border-red-500"
                    )}
                    required
                    aria-describedby={`amount-${prize.id}-help`}
                  />
                  <p id={`amount-${prize.id}-help`} className="mt-1 text-xs text-gray-500">
                    Specify the prize amount per winner
                  </p>
                </div>
              </div>
              
              <div>
                <label 
                  htmlFor={`description-${prize.id}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prize cohort description
                </label>
                <textarea 
                  id={`description-${prize.id}`}
                  value={prize.description} 
                  onChange={(e) => handlePrizeChange(prize.id, 'description', e.target.value)} 
                  placeholder="Describe what this prize cohort is for and any special requirements..." 
                  className={cn(
                    "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "hover:border-gray-400 transition-colors resize-none"
                  )}
                  rows={4}
                  aria-describedby={`description-${prize.id}-help`}
                />
                <p id={`description-${prize.id}-help`} className="mt-1 text-xs text-gray-500">
                  Provide details about this prize category
                </p>
              </div>
              
              {/* Evaluation Criteria Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Evaluation Criteria
                </h3>
                
                <div className="space-y-6">
                  {prize.criteria.map((criterion, criteriaIndex) => (
                    <div 
                      key={criterion.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      role="group"
                      aria-labelledby={`criteria-${criterion.id}-title`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 id={`criteria-${criterion.id}-title`} className="text-sm font-medium text-gray-700">
                          Criteria {criteriaIndex + 1}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {criterion.points} points
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label 
                            htmlFor={`criteria-name-${criterion.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Evaluation criteria name <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input 
                            id={`criteria-name-${criterion.id}`}
                            type="text" 
                            value={criterion.name} 
                            onChange={(e) => handleCriteriaChange(prize.id, criterion.id, 'name', e.target.value)} 
                            placeholder="e.g., Innovation, Technical Implementation" 
                            className={cn(
                              "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                              "hover:border-gray-400 transition-colors",
                              !criterion.name && "border-red-300 focus:ring-red-500 focus:border-red-500"
                            )}
                            required
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor={`criteria-points-${criterion.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Number of points <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input 
                            id={`criteria-points-${criterion.id}`}
                            type="number" 
                            value={criterion.points} 
                            onChange={(e) => handleCriteriaChange(prize.id, criterion.id, 'points', parseInt(e.target.value) || 0)} 
                            placeholder="Enter points (e.g., 25)" 
                            min="0"
                            max="100"
                            className={cn(
                              "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                              "hover:border-gray-400 transition-colors"
                            )}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label 
                          htmlFor={`criteria-description-${criterion.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Evaluation criteria description
                        </label>
                        <textarea 
                          id={`criteria-description-${criterion.id}`}
                          value={criterion.description} 
                          onChange={(e) => handleCriteriaChange(prize.id, criterion.id, 'description', e.target.value)} 
                          placeholder="Describe what judges should look for in this criteria..." 
                          className={cn(
                            "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                            "hover:border-gray-400 transition-colors resize-none"
                          )}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => addCriterion(prize.id)} 
                    className={cn(
                      "flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium",
                      "hover:bg-blue-50 px-3 py-2 rounded-md transition-all duration-200",
                      "border border-dashed border-blue-300 hover:border-blue-400 w-full justify-center"
                    )}
                    aria-label={`Add evaluation criteria to ${prize.name || 'prize cohort'}`}
                  >
                    <span className="mr-2 text-lg">+</span> 
                    Add evaluation criteria
                  </button>
                </div>
              </div>
              
              {/* Judging Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor={`judging-mode-${prize.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Judging mode <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      id={`judging-mode-${prize.id}`}
                      value={hackathonData.judgingMode} 
                      onChange={handleJudgingModeChange} 
                      className={cn(
                        "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                      )}
                      required
                      aria-describedby="judging-mode-help"
                    >
                      {JUDGING_MODES.map(mode => (
                        <option key={mode.value} value={mode.value}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <p id="judging-mode-help" className="mt-1 text-xs text-gray-500">
                    How will projects be evaluated
                  </p>
                </div>
                
                <div>
                  <label 
                    htmlFor={`voting-mode-${prize.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Voting Mode <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      id={`voting-mode-${prize.id}`}
                      value={hackathonData.votingMode} 
                      onChange={handleVotingModeChange} 
                      className={cn(
                        "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        "appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                      )}
                      required
                      aria-describedby="voting-mode-help"
                    >
                      {VOTING_MODES.map(mode => (
                        <option key={mode.value} value={mode.value}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <p id="voting-mode-help" className="mt-1 text-xs text-gray-500">
                    How judges will score projects
                  </p>
                </div>
              </div>
              
              <div>
                <label 
                  htmlFor="max-votes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max vote per judge <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <select 
                    id="max-votes"
                    value={hackathonData.maxVotesPerJudge} 
                    onChange={handleMaxVotesChange} 
                    className={cn(
                      "w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      "appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                    )}
                    required
                    aria-describedby="max-votes-help"
                  >
                    {MAX_VOTES_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </div>
                <p id="max-votes-help" className="mt-1 text-xs text-gray-500">
                  Maximum points a judge can award
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={addPrizeCohort} 
        className={cn(
          "flex items-center justify-center w-full text-blue-600 hover:text-blue-700 text-sm font-medium",
          "hover:bg-blue-50 px-6 py-4 rounded-lg transition-all duration-200",
          "border-2 border-dashed border-blue-300 hover:border-blue-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
        aria-label="Add another prize cohort"
      >
        <span className="mr-2 text-xl">+</span> 
        Add another prize cohort
      </button>
    </div>

)}