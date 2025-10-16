'use client'
import React, { useState } from 'react';
import { Plus, Trash2, Trophy, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prize {
  id: string;
  position: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  type: 'cash' | 'non-cash';
}

interface CreateHackathonPrizesProps {
  prizes: Prize[];
  onPrizesChange: (prizes: Prize[]) => void;
  className?: string;
}

export default function CreateHackathonPrizes({
  prizes,
  onPrizesChange,
  className
}: CreateHackathonPrizesProps) {
  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      position: '',
      title: '',
      description: '',
      amount: 0,
      currency: 'USD',
      type: 'cash'
    };
    onPrizesChange([...prizes, newPrize]);
  };

  const updatePrize = (id: string, field: keyof Prize, value: string | number) => {
    const updatedPrizes = prizes.map(prize =>
      prize.id === id ? { ...prize, [field]: value } : prize
    );
    onPrizesChange(updatedPrizes);
  };

  const removePrize = (id: string) => {
    onPrizesChange(prizes.filter(prize => prize.id !== id));
  };

  const getPositionIcon = (position: string) => {
    switch (position.toLowerCase()) {
      case '1st':
      case 'first':
        return '🥇';
      case '2nd':
      case 'second':
        return '🥈';
      case '3rd':
      case 'third':
        return '🥉';
      default:
        return '🏆';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Prizes & Awards</h3>
        <button
          onClick={addPrize}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prize</span>
        </button>
      </div>

      <div className="space-y-4">
        {prizes.map((prize, index) => (
          <div key={prize.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Prize #{index + 1}</h4>
              </div>
              <button
                onClick={() => removePrize(prize.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={prize.position}
                  onChange={(e) => updatePrize(prize.id, 'position', e.target.value)}
                  placeholder="1st, 2nd, 3rd, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prize Type
                </label>
                <select
                  value={prize.type}
                  onChange={(e) => updatePrize(prize.id, 'type', e.target.value as 'cash' | 'non-cash')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash Prize</option>
                  <option value="non-cash">Non-Cash Prize</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={prize.title}
                  onChange={(e) => updatePrize(prize.id, 'title', e.target.value)}
                  placeholder="Prize title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {prize.type === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={prize.amount}
                      onChange={(e) => updatePrize(prize.id, 'amount', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={prize.currency}
                      onChange={(e) => updatePrize(prize.id, 'currency', e.target.value)}
                      className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={prize.description}
                  onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                  placeholder="Describe the prize, requirements, and any additional benefits"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {prize.position && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getPositionIcon(prize.position)}</span>
                  <span className="font-medium text-yellow-800">
                    {prize.position} Place Prize
                  </span>
                </div>
                {prize.title && (
                  <p className="mt-1 text-sm text-yellow-700">{prize.title}</p>
                )}
                {prize.type === 'cash' && prize.amount > 0 && (
                  <p className="mt-1 text-sm text-yellow-700">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {prize.amount.toLocaleString()} {prize.currency}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {prizes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No prizes added yet. Click "Add Prize" to get started.</p>
        </div>
      )}
    </div>
  );
}