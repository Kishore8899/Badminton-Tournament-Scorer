import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import { useTournament } from '../hooks/useTournament';
import { Category } from '../types';
import { useConfirm } from '../hooks/useConfirm';

const TournamentWizard: React.FC = () => {
  const { 
    tournamentDetails, 
    setTournamentDetails, 
    resetTournament 
  } = useTournament();
  const confirm = useConfirm();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pointsPerGame, setPointsPerGame] = useState(21);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tournamentDetails) {
      setName(tournamentDetails.name);
      setStartDate(tournamentDetails.startDate);
      setEndDate(tournamentDetails.endDate);
      setCategories(tournamentDetails.categories);
      setPointsPerGame(tournamentDetails.scoringRules.pointsPerGame);
    }
  }, [tournamentDetails]);
  
  const allCategories = Object.values(Category);

  const handleCategoryToggle = (category: Category) => {
    setCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setTournamentDetails({
        id: tournamentDetails?.id || `t${Date.now()}`,
        name,
        startDate,
        endDate,
        categories,
        scoringRules: { pointsPerGame }
      });
      await confirm({
        title: 'Success',
        message: 'Tournament details have been saved!',
        confirmText: 'OK',
        cancelText: null
      });
    } catch (error) {
      console.error("Failed to save tournament details", error);
      await confirm({
        title: 'Save Failed',
        message: 'Could not save your settings. Please try again.',
        confirmText: 'OK',
        cancelText: null,
        confirmVariant: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const shouldReset = await confirm({
      title: 'Confirm Reset',
      message: 'Are you sure you want to reset all tournament data? This action cannot be undone.',
      confirmText: 'Reset',
      confirmVariant: 'danger'
    });
    if (shouldReset) {
      resetTournament();
    }
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Enforce reasonable limits (e.g., 1-99)
    if (!isNaN(value) && value > 0 && value < 100) {
      setPointsPerGame(value);
    } else if (e.target.value === '') {
      setPointsPerGame(1); // Or some default, to avoid NaN state
    }
  };

  return (
    <Card title="Tournament Setup">
      <div className="space-y-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Step 1: Basic Details</h3>
            <div className="space-y-4">
              <Input label="Tournament Name" id="tournamentName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Summer Open 2024" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Start Date" id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <Input label="End Date" id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
           <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Step 2: Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allCategories.map(cat => (
                <label key={cat} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="h-5 w-5 rounded border-gray-600 bg-secondary text-primary focus:ring-primary"
                  />
                  <span className="text-text font-medium text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Step 3: Scoring Rules</h3>
            <div className="max-w-xs">
               <Input 
                 label="Points per Game" 
                 id="pointsPerGame" 
                 type="number" 
                 value={pointsPerGame} 
                 onChange={handlePointsChange}
                 min="1"
                 max="99"
               />
               <p className="text-xs text-subtle-text mt-1">Must be between 1 and 99.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack}>Back</Button>
          ) : <div />}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
          <p className="text-sm text-subtle-text mt-1 mb-4">
            Resetting the tournament will permanently delete all players, teams, groups, and match data.
          </p>
          <Button variant="danger" onClick={handleReset}>
            Reset Tournament
          </Button>
      </div>
    </Card>
  );
};

export default TournamentWizard;