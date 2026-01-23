import React, { useState } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
  endTime: string;
}

export const GovernancePanel: React.FC = () => {
  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'Increase Dividend Allocation',
      description: 'Proposal to increase dividend allocation from 35% to 40% of protocol fees',
      status: 'active',
      votesFor: 1250000,
      votesAgainst: 450000,
      endTime: '2024-02-15',
    },
    {
      id: 2,
      title: 'Add New Yield Vault',
      description: 'Add support for stETH restaking vault with EigenLayer integration',
      status: 'active',
      votesFor: 980000,
      votesAgainst: 320000,
      endTime: '2024-02-20',
    },
  ]);

  const [newProposal, setNewProposal] = useState({ title: '', description: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleVote = (proposalId: number, support: boolean) => {
    console.log(`Voting ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId}`);
  };

  const handleCreateProposal = () => {
    console.log('Creating proposal:', newProposal);
    setNewProposal({ title: '', description: '' });
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">8</div>
          <div className="text-gray-400">Total Proposals</div>
        </div>
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">2</div>
          <div className="text-gray-400">Active Votes</div>
        </div>
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">1,250</div>
          <div className="text-gray-400">veSUPRA Holders</div>
        </div>
      </div>

      {/* Create Proposal Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gold hover:bg-darkGold text-dark font-bold rounded-lg transition"
        >
          {showCreateForm ? 'Cancel' : 'Create Proposal'}
        </button>
      </div>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <div className="bg-darkGray border border-gold rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gold mb-4">Create New Proposal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                className="w-full px-4 py-2 bg-dark border border-gold rounded text-white"
                placeholder="Proposal title"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                className="w-full px-4 py-2 bg-dark border border-gold rounded text-white h-24"
                placeholder="Detailed description of the proposal"
              />
            </div>
            <button
              onClick={handleCreateProposal}
              disabled={!newProposal.title || !newProposal.description}
              className="px-6 py-2 bg-gold hover:bg-darkGold text-dark font-bold rounded transition disabled:opacity-50"
            >
              Submit Proposal
            </button>
          </div>
        </div>
      )}

      {/* Active Proposals */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gold">Active Proposals</h3>
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-darkGray border border-gold/30 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-gold">{proposal.title}</h4>
                <p className="text-gray-300 mt-2">{proposal.description}</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-bold ${
                proposal.status === 'active' ? 'bg-green-600 text-white' :
                proposal.status === 'passed' ? 'bg-blue-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {proposal.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">For</span>
                  <span className="text-green-400">{proposal.votesFor.toLocaleString()} veSUPRA</span>
                </div>
                <div className="w-full bg-dark rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Against</span>
                  <span className="text-red-400">{proposal.votesAgainst.toLocaleString()} veSUPRA</span>
                </div>
                <div className="w-full bg-dark rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Ends: {proposal.endTime}</span>
              {proposal.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(proposal.id, true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, false)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                  >
                    Vote Against
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};